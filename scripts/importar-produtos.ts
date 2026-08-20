/**
 * Importa produtos a partir de ficheiros .json na pasta /produtos-novos
 * para o Supabase (tabela products/product_images/product_variants) e cria
 * o Product + Price correspondentes no Stripe.
 *
 * Uso: npm run importar-produtos
 * Documentação completa: ver COMO_ADICIONAR_PRODUTOS.md na raiz do projeto.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const PRODUTOS_DIR = join(process.cwd(), "produtos-novos");
const IMAGENS_DIR = join(PRODUTOS_DIR, "imagens");
const FICHEIRO_EXEMPLO = "produto-exemplo.json";
const STORAGE_BUCKET = "products";

const CATEGORIAS_VALIDAS = [
  "colares",
  "brincos",
  "pulseiras",
  "aneis",
  "broches",
  "conjuntos",
] as const;

type ProdutoVariante = {
  tamanho?: string;
  cor?: string;
  material?: string;
  ajuste_preco?: number;
  stock?: number;
};

type ProdutoInput = {
  nome: string;
  nome_en?: string;
  descricao?: string;
  preco: number;
  peso_gramas: number;
  categoria: string;
  slug?: string;
  stock?: number;
  destaque?: boolean;
  imagens: string[];
  variantes?: ProdutoVariante[];
};

type ResultadoProduto =
  | { ficheiro: string; ok: true; acao: "criado" | "atualizado"; nome: string }
  | { ficheiro: string; ok: false; erros: string[] };

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validarProduto(input: unknown, ficheiro: string): { produto: ProdutoInput | null; erros: string[] } {
  const erros: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { produto: null, erros: [`${ficheiro}: o conteúdo do ficheiro não é um objeto JSON válido.`] };
  }
  const p = input as Record<string, unknown>;

  if (typeof p.nome !== "string" || p.nome.trim() === "") {
    erros.push(`campo "nome" em falta ou vazio.`);
  }
  if (p.nome_en !== undefined && typeof p.nome_en !== "string") {
    erros.push(`campo "nome_en" deve ser texto.`);
  }
  if (p.descricao !== undefined && typeof p.descricao !== "string") {
    erros.push(`campo "descricao" deve ser texto.`);
  }
  if (typeof p.preco !== "number" || !Number.isFinite(p.preco) || p.preco <= 0) {
    erros.push(`campo "preco" em falta ou inválido — tem de ser um número maior que 0 (ex: 32.5).`);
  }
  if (typeof p.peso_gramas !== "number" || !Number.isFinite(p.peso_gramas) || p.peso_gramas <= 0) {
    erros.push(`campo "peso_gramas" em falta ou inválido — tem de ser um número maior que 0 (ex: 120).`);
  }
  if (typeof p.categoria !== "string" || !CATEGORIAS_VALIDAS.includes(p.categoria as (typeof CATEGORIAS_VALIDAS)[number])) {
    erros.push(
      `campo "categoria" em falta ou inválido — tem de ser um destes: ${CATEGORIAS_VALIDAS.join(", ")}.`
    );
  }
  if (p.stock !== undefined && (typeof p.stock !== "number" || p.stock < 0)) {
    erros.push(`campo "stock" deve ser um número maior ou igual a 0.`);
  }
  if (p.destaque !== undefined && typeof p.destaque !== "boolean") {
    erros.push(`campo "destaque" deve ser true ou false.`);
  }
  if (!Array.isArray(p.imagens) || p.imagens.length === 0 || !p.imagens.every((i) => typeof i === "string")) {
    erros.push(`campo "imagens" em falta ou inválido — tem de ser uma lista com pelo menos um nome de ficheiro (ex: ["colar-bruma-1.jpg"]).`);
  } else {
    for (const nomeImagem of p.imagens as string[]) {
      const caminho = join(IMAGENS_DIR, nomeImagem);
      if (!existsSync(caminho)) {
        erros.push(`a imagem "${nomeImagem}" não foi encontrada em produtos-novos/imagens/.`);
      }
    }
  }
  if (p.variantes !== undefined) {
    if (!Array.isArray(p.variantes)) {
      erros.push(`campo "variantes" deve ser uma lista.`);
    } else {
      p.variantes.forEach((v, i) => {
        if (typeof v !== "object" || v === null) {
          erros.push(`variante #${i + 1} deve ser um objeto.`);
          return;
        }
        const variante = v as Record<string, unknown>;
        if (
          variante.ajuste_preco !== undefined &&
          (typeof variante.ajuste_preco !== "number" || !Number.isFinite(variante.ajuste_preco))
        ) {
          erros.push(`variante #${i + 1}: "ajuste_preco" deve ser um número (pode ser negativo).`);
        }
        if (variante.stock !== undefined && (typeof variante.stock !== "number" || variante.stock < 0)) {
          erros.push(`variante #${i + 1}: "stock" deve ser um número maior ou igual a 0.`);
        }
      });
    }
  }

  if (erros.length > 0) {
    return { produto: null, erros: erros.map((e) => `${ficheiro}: ${e}`) };
  }

  return {
    produto: {
      nome: (p.nome as string).trim(),
      nome_en: p.nome_en as string | undefined,
      descricao: p.descricao as string | undefined,
      preco: p.preco as number,
      peso_gramas: p.peso_gramas as number,
      categoria: p.categoria as string,
      slug: typeof p.slug === "string" && p.slug.trim() !== "" ? slugify(p.slug) : undefined,
      stock: p.stock as number | undefined,
      destaque: p.destaque as boolean | undefined,
      imagens: p.imagens as string[],
      variantes: p.variantes as ProdutoVariante[] | undefined,
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

async function importarImagens(
  supabase: SupabaseClient,
  slug: string,
  nomesFicheiros: string[]
): Promise<{ url: string; nome: string }[]> {
  const resultado: { url: string; nome: string }[] = [];
  for (const nomeFicheiro of nomesFicheiros) {
    const caminhoLocal = join(IMAGENS_DIR, nomeFicheiro);
    const conteudo = readFileSync(caminhoLocal);
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
  imagensUrls: string[],
  existente: { stripe_product_id: string | null; stripe_price_id: string | null } | null
): Promise<{ stripeProductId: string; stripePriceId: string }> {
  const unitAmount = Math.round(produto.preco * 100);

  let stripeProductId = existente?.stripe_product_id ?? null;
  if (stripeProductId) {
    await stripe.products.update(stripeProductId, {
      name: produto.nome,
      description: produto.descricao,
      images: imagensUrls.slice(0, 8),
      active: true,
    });
  } else {
    const criado = await stripe.products.create({
      name: produto.nome,
      description: produto.descricao,
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
    const novoPreco = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: unitAmount,
      currency: "eur",
    });
    if (stripePriceId) {
      await stripe.prices.update(stripePriceId, { active: false });
    }
    stripePriceId = novoPreco.id;
    await stripe.products.update(stripeProductId, { default_price: stripePriceId });
  }

  return { stripeProductId, stripePriceId };
}

async function importarProduto(
  supabase: SupabaseClient,
  stripe: Stripe,
  categorias: Map<string, string>,
  ficheiro: string,
  produto: ProdutoInput
): Promise<ResultadoProduto> {
  const slug = produto.slug ?? slugify(produto.nome);
  const categoryId = categorias.get(produto.categoria) ?? null;

  const { data: existente, error: buscaError } = await supabase
    .from("products")
    .select("id, stripe_product_id, stripe_price_id")
    .eq("slug", slug)
    .maybeSingle();
  if (buscaError) return { ficheiro, ok: false, erros: [`${ficheiro}: erro ao consultar produto existente — ${buscaError.message}`] };

  const imagens = await importarImagens(supabase, slug, produto.imagens);
  const { stripeProductId, stripePriceId } = await sincronizarStripe(
    stripe,
    produto,
    imagens.map((i) => i.url),
    existente
  );

  const linhaProduto = {
    category_id: categoryId,
    name_pt: produto.nome,
    name_en: produto.nome_en?.trim() || produto.nome,
    slug,
    description_pt: produto.descricao ?? null,
    description_en: null,
    price: produto.preco,
    is_active: true,
    is_featured: produto.destaque ?? false,
    stock_quantity: produto.stock ?? 1,
    weight_grams: produto.peso_gramas,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePriceId,
  };

  let productId: string;
  if (existente) {
    productId = existente.id;
    const { error } = await supabase.from("products").update(linhaProduto).eq("id", productId);
    if (error) return { ficheiro, ok: false, erros: [`${ficheiro}: erro ao atualizar produto — ${error.message}`] };
  } else {
    const { data, error } = await supabase.from("products").insert(linhaProduto).select("id").single();
    if (error || !data) return { ficheiro, ok: false, erros: [`${ficheiro}: erro ao criar produto — ${error?.message}`] };
    productId = data.id;
  }

  // Substitui imagens e variantes por completo a cada importação — mais
  // simples e previsível do que tentar comparar/atualizar item a item.
  await supabase.from("product_images").delete().eq("product_id", productId);
  const linhasImagens = imagens.map((img, index) => ({
    product_id: productId,
    url: img.url,
    order_index: index,
    is_primary: index === 0,
  }));
  const { error: imgError } = await supabase.from("product_images").insert(linhasImagens);
  if (imgError) return { ficheiro, ok: false, erros: [`${ficheiro}: erro ao guardar imagens — ${imgError.message}`] };

  await supabase.from("product_variants").delete().eq("product_id", productId);
  if (produto.variantes && produto.variantes.length > 0) {
    const linhasVariantes = produto.variantes.map((v) => ({
      product_id: productId,
      size: v.tamanho ?? null,
      color: v.cor ?? null,
      material: v.material ?? null,
      price_modifier: v.ajuste_preco ?? 0,
      stock_quantity: v.stock ?? 0,
      is_active: true,
    }));
    const { error: varError } = await supabase.from("product_variants").insert(linhasVariantes);
    if (varError) return { ficheiro, ok: false, erros: [`${ficheiro}: erro ao guardar variantes — ${varError.message}`] };
  }

  return { ficheiro, ok: true, acao: existente ? "atualizado" : "criado", nome: produto.nome };
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
    console.error(`ERRO: a pasta "produtos-novos" não existe em ${PRODUTOS_DIR}.`);
    process.exit(1);
  }

  await verificarColunasStripe(supabase);
  await garantirBucket(supabase);
  const categorias = await carregarCategorias(supabase);

  const ficheiros = readdirSync(PRODUTOS_DIR).filter(
    (f) => f.endsWith(".json") && f !== FICHEIRO_EXEMPLO
  );

  if (ficheiros.length === 0) {
    console.log(
      `Não há ficheiros .json para importar em produtos-novos/ (além do ${FICHEIRO_EXEMPLO}, que é só um exemplo).\n` +
        "Copia o ficheiro de exemplo, preenche os dados de um produto real e corre o script outra vez."
    );
    return;
  }

  console.log(`A processar ${ficheiros.length} ficheiro(s)...\n`);

  const resultados: ResultadoProduto[] = [];

  for (const ficheiro of ficheiros) {
    const caminho = join(PRODUTOS_DIR, ficheiro);
    let conteudoJson: unknown;
    try {
      conteudoJson = JSON.parse(readFileSync(caminho, "utf-8"));
    } catch (e) {
      resultados.push({
        ficheiro,
        ok: false,
        erros: [`${ficheiro}: o ficheiro não é um JSON válido (falta uma vírgula, aspas, ou chaveta?) — ${(e as Error).message}`],
      });
      continue;
    }

    const { produto, erros } = validarProduto(conteudoJson, ficheiro);
    if (!produto) {
      resultados.push({ ficheiro, ok: false, erros });
      continue;
    }

    try {
      const resultado = await importarProduto(supabase, stripe, categorias, ficheiro, produto);
      resultados.push(resultado);
      if (resultado.ok) {
        console.log(`✓ ${ficheiro} — ${resultado.nome} (${resultado.acao})`);
      } else {
        console.log(`✗ ${ficheiro} — ${resultado.erros.join(" | ")}`);
      }
    } catch (e) {
      resultados.push({ ficheiro, ok: false, erros: [`${ficheiro}: ${(e as Error).message}`] });
      console.log(`✗ ${ficheiro} — ${(e as Error).message}`);
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
    console.log("\nFicheiros com problemas:");
    for (const r of comErro) {
      if (!r.ok) for (const e of r.erros) console.log(`  - ${e}`);
    }
  }
}

main().catch((e) => {
  console.error("\nErro inesperado durante a importação:", e);
  process.exit(1);
});
