# Como adicionar produtos novos

Guia para adicionares peças novas ao site sem teres de mexer manualmente no Supabase ou na Stripe.

## Passo 0 — configuração única (só precisas de fazer isto uma vez)

Antes da primeira utilização, a tabela de produtos no Supabase precisa de duas colunas novas, onde o script vai guardar a ligação a cada produto/preço criado na Stripe.

1. Abre o [painel do Supabase](https://supabase.com/dashboard) do projeto.
2. Vai a **SQL Editor** → **New query**.
3. Cola e corre isto:

   ```sql
   alter table products
     add column if not exists stripe_product_id text,
     add column if not exists stripe_price_id text;
   ```

Não precisas de repetir isto — é um passo único. Se te esqueceres, o script deteta isso sozinho e mostra-te esta mesma instrução antes de fazer seja o que for.

## Passo 1 — preparar as imagens

1. Tira ou exporta as fotos de cada peça (jpg, png ou webp).
2. Coloca todas as imagens de todos os produtos dentro da pasta `produtos-novos/imagens/`.
3. Nomeia cada ficheiro seguindo este padrão: `nome-do-produto-numero.extensão`

   Exemplos:
   - `colar-bruma-1.jpg`, `colar-bruma-2.jpg` — duas fotos do "Colar Bruma"
   - `brincos-lua-1.png` — uma foto dos "Brincos Lua"

   A primeira imagem que listares no ficheiro do produto (ver passo 2) é a que aparece como foto principal na loja.

## Passo 2 — preencher um ficheiro por produto

1. Copia o ficheiro `produtos-novos/produto-exemplo.json` e dá-lhe um nome novo, por exemplo `colar-bruma.json`. Mantém-no dentro da pasta `produtos-novos/` (não dentro de `imagens/`).
2. Substitui os valores por dados do produto real. Um ficheiro completo tem este aspeto:

   ```json
   {
     "nome": "Colar Bruma",
     "nome_en": "Bruma Necklace",
     "descricao": "Colar artesanal em latão, com pedra natural e fio encerado.",
     "preco": 32.5,
     "peso_gramas": 120,
     "categoria": "colares",
     "stock": 5,
     "destaque": false,
     "imagens": ["colar-bruma-1.jpg", "colar-bruma-2.jpg"],
     "variantes": [
       { "tamanho": "Curto", "ajuste_preco": 0, "stock": 3 },
       { "tamanho": "Longo", "ajuste_preco": 3, "stock": 2 }
     ]
   }
   ```

### O que cada campo significa

| Campo | Obrigatório? | O que é |
|---|---|---|
| `nome` | Sim | Nome do produto em português, como aparece no site. |
| `nome_en` | Não | Nome em inglês (guardado para o futuro — o site ainda mostra sempre o nome em português). Se não preencheres, usa o `nome`. |
| `descricao` | Não | Texto descritivo da peça, mostrado na página do produto. |
| `preco` | Sim | Preço em euros, com ponto decimal (ex: `32.5`, não `32,5`). |
| `peso_gramas` | Sim | Peso da peça já embalada, em gramas — usado para calcular os portes de envio. |
| `categoria` | Sim | Uma destas palavras, exatamente: `colares`, `brincos`, `pulseiras`, `aneis`, `broches`, `conjuntos`. |
| `stock` | Não (default: 1) | Quantidade disponível em stock. |
| `destaque` | Não (default: false) | Se `true`, a peça aparece na secção "Em destaque" da página inicial. |
| `imagens` | Sim | Lista com os nomes dos ficheiros de imagem (têm de estar em `produtos-novos/imagens/`). A ordem importa: a primeira é a foto principal. |
| `variantes` | Não | Lista de opções do produto (tamanho/cor/material), se a peça tiver variantes. Cada variante pode ter `tamanho`, `cor`, `material`, `ajuste_preco` (quanto soma ou subtrai ao preço base, pode ser negativo) e `stock`. Se a peça não tiver opções, remove este campo por completo. |

**Importante:**
- Não uses vírgulas como separador decimal — usa sempre ponto (`32.5`, não `32,5`).
- Não deixes vírgulas a mais nem a menos entre os campos (é o erro mais comum em ficheiros JSON). Se tiveres dúvidas, compara sempre com o `produto-exemplo.json`.
- Podes ter quantos ficheiros `.json` quiseres dentro de `produtos-novos/` — um por produto.

## Passo 3 — correr o script

No terminal, dentro da pasta do projeto:

```bash
npm run importar-produtos
```

O script vai:
1. Verificar que cada ficheiro está bem preenchido (e dizer-te exatamente o que falta ou está errado, se houver problemas).
2. Enviar as imagens para o Supabase Storage.
3. Criar (ou atualizar, se já existir) o produto no Supabase.
4. Criar (ou atualizar) o produto e o preço correspondentes na Stripe.
5. No fim, mostrar um resumo: quantos produtos foram criados, quantos atualizados, e a lista de qualquer ficheiro com erro.

No final verás algo como:

```
✓ colar-bruma.json — Colar Bruma (criado)
✓ brincos-lua.json — Brincos Lua (atualizado)
✗ pulseira-nova.json — campo "preco" em falta ou inválido...

──────────────────────────────
Resumo da importação
──────────────────────────────
Criados:     1
Atualizados: 1
Com erro:    1
```

## Repetir / corrigir um produto

Se corrigires um ficheiro `.json` (ou trocares uma imagem) e voltares a correr `npm run importar-produtos`, o script **atualiza** o produto existente em vez de criar um duplicado — identifica o produto pelo nome (transformado automaticamente num "slug" único). Podes correr o script quantas vezes quiseres.

## Onde ficam os ficheiros depois?

Os ficheiros `.json` e as imagens dentro de `produtos-novos/` ficam só no teu computador — não são enviados para o repositório de código (git). Depois de importados, os dados reais dos produtos vivem no Supabase e as imagens no Supabase Storage. Podes apagar os `.json` e as imagens de `produtos-novos/` depois de confirmares que o produto ficou bem no site, ou deixá-los ficar (não têm efeito nenhum enquanto o script não voltar a correr).

## Nota sobre a Stripe

As chaves da Stripe configuradas no projeto são de **produção** — o script cria Products e Prices reais no catálogo da tua conta Stripe (isto não cobra nada a ninguém nem processa pagamentos; é só o "catálogo"). Se algum dia precisares de remover um produto de teste da Stripe, sabe que a Stripe não permite apagar um Price depois de criado — só é possível arquivá-lo (`active: false`), o que o torna invisível/inutilizável sem o remover do histórico.
