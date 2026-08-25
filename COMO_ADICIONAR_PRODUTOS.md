# Como adicionar produtos novos

Guia para adicionares peças novas ao site sem teres de mexer manualmente no Supabase ou na Stripe.

## Passo 0 — configuração única (só precisas de fazer isto uma vez)

Se ainda não correste este passo antes, a tabela de produtos no Supabase precisa de duas colunas novas, onde o script vai guardar a ligação a cada produto/preço criado na Stripe.

1. Abre o [painel do Supabase](https://supabase.com/dashboard) do projeto.
2. Vai a **SQL Editor** → **New query**.
3. Cola e corre isto:

   ```sql
   alter table products
     add column if not exists stripe_product_id text,
     add column if not exists stripe_price_id text;
   ```

Não precisas de repetir isto — é um passo único. Se te esqueceres, o script deteta isso sozinho e mostra-te esta mesma instrução antes de fazer seja o que for.

## Passo 1 — uma pasta por produto

Dentro da pasta `produtos-novos/`, cria uma pasta para cada peça — o nome da pasta pode ser o que quiseres (ex: `colar-conchas`, `brincos-prata`). Usa a pasta `produtos-novos/exemplo-produto/` como modelo: copia-a, dá-lhe um nome novo, e substitui o conteúdo.

Dentro da pasta de cada produto colocas duas coisas:

1. **As fotos** — quantas quiseres, com o nome que quiseres (ex: `foto1.jpg`, `foto2.jpg`). O script associa automaticamente todas as imagens que encontrar dentro dessa pasta. A primeira, por ordem alfabética/numérica, é usada como foto principal na loja — por isso, se quiseres controlar qual aparece primeiro, numera-as (`foto1.jpg`, `foto2.jpg`, ...).
2. **Um ficheiro `info.txt`** — com os dados do produto, um por linha, no formato `campo: valor`. Podes escrever e guardar este ficheiro no Bloco de Notas normalmente.

Fica assim, por exemplo:

```
produtos-novos/
  colar-conchas/
    foto1.jpg
    foto2.jpg
    info.txt
  brincos-prata/
    foto1.jpg
    info.txt
```

## Passo 2 — preencher o info.txt

Abre o `info.txt` no Bloco de Notas e preenche um campo por linha:

```
nome: Colar de Conchas
nome_en: Shell Necklace
descricao: Colar artesanal feito à mão com conchas naturais apanhadas na costa portuguesa.
preco: 24.90
peso: 35
categoria: Colares
destaque: nao
```

### O que cada campo significa

| Campo | Obrigatório? | O que é |
|---|---|---|
| `nome` | Sim | Nome do produto em português, como aparece no site. |
| `nome_en` | Não | Nome em inglês (guardado para o futuro — o site ainda mostra sempre o nome em português). Se não preencheres, usa o `nome`. |
| `descricao` | Não | Texto descritivo da peça, mostrado na página do produto (uma linha só). |
| `preco` | Sim | Preço em euros. Podes escrever com ponto ou vírgula (`24.90` ou `24,90`). |
| `peso` | Sim | Peso da peça já embalada, em gramas — usado para calcular os portes de envio. |
| `categoria` | Sim | Uma destas: `Colares`, `Brincos`, `Pulseiras`, `Anéis`, `Broches`, `Conjuntos`. Não é sensível a maiúsculas/minúsculas. |
| `stock` | Não (default: ilimitado) | Quantidade disponível em stock. Só precisas de preencher se quiseres mesmo limitar uma peça específica — se não preencheres, o stock fica ilimitado (a peça nunca aparece como esgotada). |
| `destaque` | Não (default: nao) | Escreve `sim` para a peça aparecer na secção "Em destaque" da página inicial. |

**Dicas:**
- Linhas que começam por `#` são ignoradas — podes usá-las para deixar notas para ti próprio (como no ficheiro de exemplo).
- Não precisas de aspas nem de vírgulas no fim das linhas — é só `campo: valor`, uma linha por campo.
- O nome da PASTA é o que identifica o produto de uma importação para a seguinte (para saber se deve atualizar ou criar). Podes mudar o `nome` no info.txt à vontade — mas evita mudar o nome da pasta de um produto depois de já o teres importado, ou o script vai achar que é um produto novo.

### Se o produto tiver variantes (tamanhos, cores, etc.)

Acrescenta uma linha `variante:` por cada opção, no fim do `info.txt`:

```
variante: Curto | 0
variante: Longo | 4
```

Formato: `nome da opção | ajuste no preço | stock (opcional)`. O "ajuste no preço" soma (ou, se for negativo, subtrai) ao preço base — por exemplo, `variante: Longo | 4` significa uma opção "Longo" que custa mais 4€. Tal como o produto, cada variante fica com stock ilimitado a não ser que indiques um número no fim (`variante: Longo | 4 | 2`, com 2 unidades). Se a peça não tiver variantes, não incluas nenhuma linha `variante:`.

## Passo 3 — correr o script

No terminal, dentro da pasta do projeto:

```bash
npm run importar-produtos
```

O script vai:
1. Verificar que cada pasta tem um `info.txt` bem preenchido e pelo menos uma imagem (e dizer-te exatamente o que falta, se houver problemas).
2. Enviar as imagens para o Supabase Storage.
3. Criar (ou atualizar, se já existir) o produto no Supabase.
4. Criar (ou atualizar) o produto e o preço correspondentes na Stripe.
5. No fim, mostrar um resumo: quantos produtos foram criados, quantos atualizados, e a lista de qualquer pasta com erro.

No final verás algo como:

```
✓ colar-conchas — Colar de Conchas (criado)
✓ brincos-prata — Brincos de Prata (atualizado)
✗ pulseira-nova — campo "preco" em falta ou inválido...

──────────────────────────────
Resumo da importação
──────────────────────────────
Criados:     1
Atualizados: 1
Com erro:    1
```

## Repetir / corrigir um produto

Se corrigires o `info.txt` (ou trocares uma foto) e voltares a correr `npm run importar-produtos`, o script **atualiza** o produto existente em vez de criar um duplicado — identifica o produto pelo nome da pasta. Podes correr o script quantas vezes quiseres.

## Onde ficam os ficheiros depois?

As pastas dentro de `produtos-novos/` (exceto `exemplo-produto/`) ficam só no teu computador — não são enviadas para o repositório de código (git). Depois de importados, os dados reais dos produtos vivem no Supabase e as fotos no Supabase Storage. Podes apagar as pastas de `produtos-novos/` depois de confirmares que o produto ficou bem no site, ou deixá-las ficar (não têm efeito nenhum enquanto o script não voltar a correr).

## Nota sobre a Stripe

As chaves da Stripe configuradas no projeto são de **produção** — o script cria Products e Prices reais no catálogo da tua conta Stripe (isto não cobra nada a ninguém nem processa pagamentos; é só o "catálogo"). Se algum dia precisares de remover um produto de teste da Stripe, sabe que a Stripe não permite apagar um Price depois de criado — só é possível arquivá-lo (`active: false`), o que o torna invisível/inutilizável sem o remover do histórico.
