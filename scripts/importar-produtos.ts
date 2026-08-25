/**
 * Importa produtos a partir de pastas dentro de /produtos — uma pasta por
 * produto, com um ficheiro info.txt e as fotos (diretamente na pasta ou
 * dentro de uma subpasta, ex: "fotos/") — para o Supabase (tabela
 * products/product_images/product_variants) e cria o Product + Price
 * correspondentes no Stripe.
 *
 * Uso: npm run importar-produtos
 * Documentação completa: ver COMO_ADICIONAR_PRODUTOS.md na raiz do projeto.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const PRODUTOS_DIR = join(process.cwd(), "produtos");
const PASTA_EXEMPLO = "exemplo-produto";
const NOME_FICHEIRO_INFO = "info.txt";
const STORAGE_BUCKET = "products";
const EXTENSOES_IMAGEM = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
// Por defeito o stock é "ilimitado" — não há necessidade de indicar
// quantidade a não ser que queiras mesmo limitar uma peça específica.
const STOCK_ILIMITADO = 99999;

const CATEGORIAS_VALIDAS = [
  "colares",
  "brincos",
  "pulseiras",
  "aneis",
  "broches",
  "conjuntos",
] as const;

type ProdutoVariante = {
  tamanho: string;
  ajuste_preco: number;
  stock: number;
};

type ProdutoInput = {
  nome: string;
  nome_en?: string;
  descricao?: string;
  medida?: string;
  preco: number;
  peso_gramas: number;
  categoria: string;
  stock?: number;
  destaque?: boolean;
  variantes: ProdutoVariante[];
};

type ResultadoProduto =
  | { pasta: string; ok: true; acao: "criado" | "atualizado"; nome: string }
  | { pasta: string; ok: false; erros: string[] };

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function slugify(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function montarDescricao(produto: ProdutoInput): string | undefined {
  const partes = [produto.descricao, produto.medida ? `Medida: ${produto.medida}` : null].filter(
    (p): p is string => !!p
  );
  return partes.length > 0 ? partes.join("\n\n") : undefined;
}

function paraNumero(valor: string): number | null {
  const limpo = valor.trim().replace(",", ".");
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Lê um info.txt no formato "campo: valor" (uma linha por campo).
 * Linhas vazias ou que começam por "#" são ignoradas. O campo "variante"
 * pode repetir-se em várias linhas, no formato:
 *   variante: Curto | 0 | 3
 *   (nome da opção | ajuste no preço | stock — os dois últimos são opcionais)
 */
function parseInfoTxt(conteudo: string): { campos: Map<string, string>; variantes: ProdutoVariante[] } {
  const campos = new Map<string, string>();
  const variantes: ProdutoVariante[] = [];

  const linhas = conteudo.split(/\r?\n/);
  for (const linhaOriginal of linhas) {
    const linha = linhaOriginal.trim();
    if (linha === "" || linha.startsWith("#")) continue;

    const idx = linha.indexOf(":");
    if (idx === -1) continue;

    const chave = normalizar(linha.slice(0, idx));
    const valor = linha.slice(idx + 1).trim();

    if (chave === "variante") {
      const partes = valor.split("|").map((p) => p.trim());
      variantes.push({
        tamanho: partes[0] ?? "",
        ajuste_preco: partes[1] ? (paraNumero(partes[1]) ?? 0) : 0,
        stock: partes[2] ? (paraNumero(partes[2]) ?? STOCK_ILIMITADO) : STOCK_ILIMITADO,
      });
      continue;
    }

    campos.set(chave, valor);
  }

  return { campos, variantes };
}

function validarProduto(
  campos: Map<string, string>,
  variantes: ProdutoVariante[],
  pasta: string
): { produto: ProdutoInput | null; erros: string[] } {
  const erros: string[] = [];

  const nome = campos.get("nome")?.trim();
  if (!nome) {
    erros.push(`campo "nome" em falta no info.txt.`);
  }

  const precoTexto = campos.get("preco");
  const preco = precoTexto !== undefined ? paraNumero(precoTexto) : null;
  if (!precoTexto || preco === null || preco <= 0) {
    erros.push(`campo "preco" em falta ou inválido no info.txt — tem de ser um número maior que 0 (ex: 24.90).`);
  }

  const pesoTexto = campos.get("peso");
  const peso = pesoTexto !== undefined ? paraNumero(pesoTexto) : null;
  if (!pesoTexto || peso === null || peso <= 0) {
    erros.push(`campo "peso" em falta ou inválido no info.txt — tem de ser um número maior que 0, em gramas (ex: 35).`);
  }

  // A categoria é opcional — se não a preencheres, o produto fica sem
  // categoria (continua a aparecer na loja, só não entra nos filtros).
  const categoriaTexto = campos.get("categoria")?.trim();
  let categoriaNormalizada = "";
  if (categoriaTexto) {
    categoriaNormalizada = normalizar(categoriaTexto);
    if (!CATEGORIAS_VALIDAS.includes(categoriaNormalizada as (typeof CATEGORIAS_VALIDAS)[number])) {
      erros.push(
        `campo "categoria" inválido no info.txt ("${categoriaTexto}") — tem de ser um destes: Colares, Brincos, Pulseiras, Anéis, Broches, Conjuntos (ou apaga a linha, se não quiseres categorizar).`
      );
    }
  }

  const stockTexto = campos.get("stock");
  let stock: number | undefined;
  if (stockTexto !== undefined) {
    const n = paraNumero(stockTexto);
    if (n === null || n < 0) {
      erros.push(`campo "stock" no info.txt deve ser um número maior ou igual a 0.`);
    } else {
      stock = n;
    }
  }

  const destaqueTexto = campos.get("destaque");
  const destaque = destaqueTexto !== undefined ? ["sim", "true", "1"].includes(normalizar(destaqueTexto)) : undefined;

  if (erros.length > 0) {
    return { produto: null, erros: erros.map((e) => `${pasta}: ${e}`) };
  }

  return {
    produto: {
      nome: nome!,
      nome_en: campos.get("nome_en")?.trim() || undefined,
      descricao: campos.get("descricao")?.trim() || undefined,
      medida: campos.get("medida")?.trim() || undefined,
      preco: preco!,
      peso_gramas: peso!,
      categoria: categoriaNormalizada,
      stock,
      destaque,
      variantes,
    },
    erros: [],
  };
}

function contentTypeFromExt(ficheiro: string): string {
  const ext = extname(ficheiro).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

async function garantirBucket(supabase: SupabaseClient) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`Não foi possível listar os buckets do Supabase Storage: ${error.message}`);
  if (!buckets.some((b) => b.name === STORAGE_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
    });
    if (createError) {
      throw new Error(`Não foi possível criar o bucket "${STORAGE_BUCKET}": ${createError.message}`);
    }
    console.log(`Bucket "${STORAGE_BUCKET}" criado no Supabase Storage.`);
  }
}

async function verificarColunasStripe(supabase: SupabaseClient) {
  const { error } = await supabase.from("products").select("stripe_product_id, stripe_price_id").limit(1);
  if (error) {
    console.error(
      "\nERRO: a tabela 'products' ainda não tem as colunas stripe_product_id / stripe_price_id.\n" +
        "Este é um passo único de configuração — abre o SQL Editor no painel do Supabase e corre:\n\n" +
        "  alter table products\n" +
        "    add column if not exists stripe_product_id text,\n" +
        "    add column if not exists stripe_price_id text;\n\n" +
        "Depois volta a correr `npm run importar-produtos`.\n"
    );
    process.exit(1);
  }
}

async function carregarCategorias(supabase: SupabaseClient): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("categories").select("id, slug");
  if (error) throw new Error(`Não foi possível carregar as categorias: ${error.message}`);
  const mapa = new Map<string, string>();
  for (const c of data ?? []) mapa.set(c.slug, c.id);
  return mapa;
}

type ImagemLocal = { nome: string; caminhoCompleto: string };

/**
 * Procura imagens diretamente dentro da pasta do produto E dentro de
 * qualquer subpasta (ex: "fotos/") — para funcionar quer coloques as fotos
 * soltas na pasta do produto, quer dentro de uma subpasta própria.
 */
function listarImagens(pastaProduto: string): ImagemLocal[] {
  const resultado: ImagemLocal[] = [];

  function percorrer(pasta: string) {
    for (const entrada of readdirSync(pasta, { withFileTypes: true })) {
      const caminho = join(pasta, entrada.name);
      if (entrada.isDirectory()) {
        percorrer(caminho);
      } else if (EXTENSOES_IMAGEM.includes(extname(entrada.name).toLowerCase())) {
        resultado.push({ nome: entrada.name, caminhoCompleto: caminho });
      }
    }
  }
  percorrer(pastaProduto);

  return resultado.sort((a, b) => a.nome.localeCompare(b.nome, undefined, { numeric: true, sensitivity: "base" }));
}

async function importarImagens(
  supabase: SupabaseClient,
  slug: string,
  imagensLocais: ImagemLocal[]
): Promise<{ url: string; nome: string }[]> {
  const resultado: { url: string; nome: string }[] = [];
  for (const { nome: nomeFicheiro, caminhoCompleto } of imagensLocais) {
    const conteudo = readFileSync(caminhoCompleto);
    const caminhoStorage = `${slug}/${nomeFicheiro}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(caminhoStorage, conteudo, {
      contentType: contentTypeFromExt(nomeFicheiro),
      upsert: true,
    });
    if (error) throw new Error(`Falha ao enviar a imagem "${nomeFicheiro}": ${error.message}`);
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(caminhoStorage);
    resultado.push({ url: urlData.publicUrl, nome: nomeFicheiro });
  }
  return resultado;
}

async function sincronizarStripe(
  stripe: Stripe,
  produto: ProdutoInput,
  descricao: string | undefined,
  imagensUrls: string[],
  existente: { stripe_product_id: string | null; stripe_price_id: string | null } | null
): Promise<{ stripeProductId: string; stripePriceId: string }> {
  const unitAmount = Math.round(produto.preco * 100);

  let stripeProductId = existente?.stripe_product_id ?? null;
  if (stripeProductId) {
    await stripe.products.update(stripeProductId, {
      name: produto.nome,
      description: descricao,
      images: imagensUrls.slice(0, 8),
      active: true,
    });
  } else {
    const criado = await stripe.products.create({
      name: produto.nome,
      description: descricao,
      images: imagensUrls.slice(0, 8),
    });
    stripeProductId = criado.id;
  }

  // Preços na Stripe são imutáveis — só criamos um novo se ainda não existir
  // preço guardado ou se o valor mudou desde a última importação.
  let stripePriceId = existente?.stripe_price_id ?? null;
  let precoMudou = true;
  if (stripePriceId) {
    const precoAtual = await stripe.prices.retrieve(stripePriceId);
    precoMudou = precoAtual.unit_amount !== unitAmount;
  }

  if (!stripePriceId || precoMudou) {
    const precoAntigoId = stripePriceId;
    const novoPreco = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: unitAmount,
      currency: "eur",
    });
    stripePriceId = novoPreco.id;
    // O preço tem de deixar de ser o "default_price" do produto antes de
    // poder ser arquivado — por isso trocamos o default primeiro.
    await stripe.products.update(stripeProductId, { default_price: stripePriceId });
    if (precoAntigoId) {
      await stripe.prices.update(precoAntigoId, { active: false });
    }
  }

  return { stripeProductId, stripePriceId };
}

async function importarProduto(
  supabase: SupabaseClient,
  stripe: Stripe,
  categorias: Map<string, string>,
  pasta: string,
  produto: ProdutoInput,
  imagens: ImagemLocal[]
): Promise<ResultadoProduto> {
  const slug = slugify(pasta);
  const categoryId = categorias.get(produto.categoria) ?? null;

  const { data: existente, error: buscaError } = await supabase
    .from("products")
    .select("id, stripe_product_id, stripe_price_id")
    .eq("slug", slug)
    .maybeSingle();
  if (buscaError) return { pasta, ok: false, erros: [`${pasta}: erro ao consultar produto existente — ${buscaError.message}`] };

  const descricao = montarDescricao(produto);
  const imagensEnviadas = await importarImagens(supabase, slug, imagens);
  const { stripeProductId, stripePriceId } = await sincronizarStripe(
    stripe,
    produto,
    descricao,
    imagensEnviadas.map((i) => i.url),
    existente
  );

  const linhaProduto = {
    category_id: categoryId,
    name_pt: produto.nome,
    name_en: produto.nome_en?.trim() || produto.nome,
    slug,
    description_pt: descricao ?? null,
    description_en: null,
    price: produto.preco,
    is_active: true,
    is_featured: produto.destaque ?? false,
    stock_quantity: produto.stock ?? STOCK_ILIMITADO,
    weight_grams: produto.peso_gramas,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePriceId,
  };

  let productId: string;
  if (existente) {
    productId = existente.id;
    const { error } = await supabase.from("products").update(linhaProduto).eq("id", productId);
    if (error) return { pasta, ok: false, erros: [`${pasta}: erro ao atualizar produto — ${error.message}`] };
  } else {
    const { data, error } = await supabase.from("products").insert(linhaProduto).select("id").single();
    if (error || !data) return { pasta, ok: false, erros: [`${pasta}: erro ao criar produto — ${error?.message}`] };
    productId = data.id;
  }

  // Substitui imagens e variantes por completo a cada importação — mais
  // simples e previsível do que tentar comparar/atualizar item a item.
  await supabase.from("product_images").delete().eq("product_id", productId);
  const linhasImagens = imagensEnviadas.map((img, index) => ({
    product_id: productId,
    url: img.url,
    order_index: index,
    is_primary: index === 0,
  }));
  const { error: imgError } = await supabase.from("product_images").insert(linhasImagens);
  if (imgError) return { pasta, ok: false, erros: [`${pasta}: erro ao guardar imagens — ${imgError.message}`] };

  await supabase.from("product_variants").delete().eq("product_id", productId);
  if (produto.variantes.length > 0) {
    const linhasVariantes = produto.variantes.map((v) => ({
      product_id: productId,
      size: v.tamanho || null,
      color: null,
      material: null,
      price_modifier: v.ajuste_preco,
      stock_quantity: v.stock,
      is_active: true,
    }));
    const { error: varError } = await supabase.from("product_variants").insert(linhasVariantes);
    if (varError) return { pasta, ok: false, erros: [`${pasta}: erro ao guardar variantes — ${varError.message}`] };
  }

  return { pasta, ok: true, acao: existente ? "atualizado" : "criado", nome: produto.nome };
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
    console.error(
      "ERRO: faltam variáveis de ambiente. Confirma que o ficheiro .env.local tem " +
        "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e STRIPE_SECRET_KEY definidos."
    );
    process.exit(1);
  }

  console.log("As chaves da Stripe em .env.local são de PRODUÇÃO (sk_live) — este script cria");
  console.log("produtos e preços reais no catálogo Stripe (isto não cobra nada a ninguém).\n");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const stripe = new Stripe(stripeSecretKey);

  if (!existsSync(PRODUTOS_DIR)) {
    console.error(`ERRO: a pasta "produtos" não existe em ${PRODUTOS_DIR}.`);
    process.exit(1);
  }

  await verificarColunasStripe(supabase);
  await garantirBucket(supabase);
  const categorias = await carregarCategorias(supabase);

  const pastas = readdirSync(PRODUTOS_DIR).filter((nome) => {
    if (nome === PASTA_EXEMPLO) return false;
    return statSync(join(PRODUTOS_DIR, nome)).isDirectory();
  });

  if (pastas.length === 0) {
    console.log(
      `Não há pastas de produtos para importar dentro de produtos/ (além de "${PASTA_EXEMPLO}", que é só um exemplo).\n` +
        "Copia essa pasta, dá-lhe o nome do teu produto, substitui as fotos e preenche o info.txt, depois corre o script outra vez."
    );
    return;
  }

  console.log(`A processar ${pastas.length} pasta(s)...\n`);

  const resultados: ResultadoProduto[] = [];

  for (const pasta of pastas) {
    const pastaProduto = join(PRODUTOS_DIR, pasta);
    const caminhoInfo = join(pastaProduto, NOME_FICHEIRO_INFO);

    if (!existsSync(caminhoInfo)) {
      resultados.push({ pasta, ok: false, erros: [`${pasta}: não tem um ficheiro "${NOME_FICHEIRO_INFO}" dentro da pasta.`] });
      console.log(`✗ ${pasta} — falta o ficheiro ${NOME_FICHEIRO_INFO}`);
      continue;
    }

    const imagens = listarImagens(pastaProduto);
    if (imagens.length === 0) {
      resultados.push({
        pasta,
        ok: false,
        erros: [`${pasta}: não tem nenhuma imagem (.jpg, .jpeg, .png, .webp ou .gif) dentro da pasta.`],
      });
      console.log(`✗ ${pasta} — sem imagens na pasta`);
      continue;
    }

    const { campos, variantes } = parseInfoTxt(readFileSync(caminhoInfo, "utf-8"));
    const { produto, erros } = validarProduto(campos, variantes, pasta);
    if (!produto) {
      resultados.push({ pasta, ok: false, erros });
      console.log(`✗ ${pasta} — ${erros.join(" | ")}`);
      continue;
    }

    try {
      const resultado = await importarProduto(supabase, stripe, categorias, pasta, produto, imagens);
      resultados.push(resultado);
      if (resultado.ok) {
        console.log(`✓ ${pasta} — ${resultado.nome} (${resultado.acao})`);
      } else {
        console.log(`✗ ${pasta} — ${resultado.erros.join(" | ")}`);
      }
    } catch (e) {
      resultados.push({ pasta, ok: false, erros: [`${pasta}: ${(e as Error).message}`] });
      console.log(`✗ ${pasta} — ${(e as Error).message}`);
    }
  }

  const criados = resultados.filter((r) => r.ok && r.acao === "criado").length;
  const atualizados = resultados.filter((r) => r.ok && r.acao === "atualizado").length;
  const comErro = resultados.filter((r) => !r.ok);

  console.log("\n──────────────────────────────");
  console.log("Resumo da importação");
  console.log("──────────────────────────────");
  console.log(`Criados:     ${criados}`);
  console.log(`Atualizados: ${atualizados}`);
  console.log(`Com erro:    ${comErro.length}`);
  if (comErro.length > 0) {
    console.log("\nPastas com problemas:");
    for (const r of comErro) {
      if (!r.ok) for (const e of r.erros) console.log(`  - ${e}`);
    }
  }
}

main().catch((e) => {
  console.error("\nErro inesperado durante a importação:", e);
  process.exit(1);
});
