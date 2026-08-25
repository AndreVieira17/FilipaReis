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

## Passo 1 — a pasta `produtos/`

Já existem 40 pastas em branco dentro de `produtos/` (`produto-01` a `produto-40`), prontas a preencher. Cada uma tem:

```
produtos/
  produto-01/
    info.txt      <- os dados do produto
    fotos/        <- pasta vazia, para colocares as fotos
  produto-02/
    info.txt
    fotos/
  ...
  produto-40/
    info.txt
    fotos/
  exemplo-produto/   <- um exemplo já preenchido, para consultares
```

Não precisas de criar pastas — só de preencher o que já lá está. Se um dia precisares de mais do que 40, cria uma pasta nova com o nome que quiseres (ex: `produto-41`) e faz igual.

**O nome da pasta** (ex: `produto-01`) é o que identifica o produto de uma importação para a seguinte — não precisas de mudar o nome da pasta, mesmo que troques o `nome` no `info.txt`. Só evita mudar o nome de uma pasta depois de já teres importado esse produto, ou o script vai achar que é um produto novo.

## Passo 2 — preencher o info.txt

Abre o `info.txt` de uma das pastas no Bloco de Notas. Já tem os campos prontos, só falta escreveres o valor a seguir a cada `:`:

```
nome: 
descricao: 
preco: 
peso: 
medida: 
```

Fica, por exemplo, assim:

```
nome: Colar de Conchas
descricao: Colar artesanal feito à mão com conchas naturais apanhadas na costa portuguesa.
preco: 24.90
peso: 35
medida: 40 cm
```

### O que cada campo significa

| Campo | Obrigatório? | O que é |
|---|---|---|
| `nome` | Sim | Nome do produto, como aparece no site. |
| `descricao` | Não | Texto descritivo da peça, mostrado na página do produto (uma linha só). |
| `preco` | Sim | Preço em euros. Podes escrever com ponto ou vírgula (`24.90` ou `24,90`). |
| `peso` | Sim | Peso da peça já embalada, em gramas — usado para calcular os portes de envio. |
| `medida` | Não | Medida da peça (comprimento, tamanho, etc.) — aparece na descrição do produto, junto ao texto da `descricao`. |

**Dicas:**
- Não precisas de aspas nem de vírgulas no fim das linhas — é só `campo: valor`, uma linha por campo.
- Se deixares um campo não-obrigatório em branco (ex: `descricao: `), o script trata como se a linha não existisse.

### Campos extra (só se quiseres)

O `produtos/exemplo-produto/info.txt` mostra (comentados, com `#` à frente) alguns campos opcionais mais avançados, caso alguma vez precises:
- `nome_en` — nome em inglês.
- `categoria` — `Colares`, `Brincos`, `Pulseiras`, `Anéis`, `Broches` ou `Conjuntos`. Sem isto, o produto aparece na loja na mesma, só não entra nos filtros por categoria.
- `stock` — se não preencheres, o stock fica ilimitado (a peça nunca aparece esgotada).
- `destaque: sim` — para aparecer em "Em destaque" na página inicial.
- `variante: nome da opção | ajuste no preço` (podes repetir esta linha) — para tamanhos/opções diferentes, ex: `variante: Longo | 4`.

## Passo 3 — colocar as fotos

Dentro da pasta `fotos/` de cada produto, coloca as fotos dessa peça — quantas quiseres, com o nome que quiseres. O script associa automaticamente todas as imagens que encontrar aí dentro. A primeira, por ordem alfabética/numérica, é usada como foto principal — numera-as (`foto1.jpg`, `foto2.jpg`, ...) se quiseres controlar a ordem.

## Passo 4 — importação automática (não precisas de fazer nada)

Há uma tarefa agendada no Windows ("FilipaReis - Importar Produtos") que corre o script sozinha **a cada 30 minutos**, mesmo depois de reiniciares o computador. Preenches o `info.txt` e colocas as fotos, e dentro de meia hora, no máximo, o produto aparece no site — não precisas de correr nada nem de me avisar aqui.

O resultado de cada execução automática fica registado em `produtos/importacao-automatica.log` (dá para abrir no Bloco de Notas) — cada bloco começa com a data/hora e mostra o mesmo resumo que aparece no terminal.

**Se quiseres correr manualmente na hora**, sem esperar pelos 30 minutos, no terminal dentro da pasta do projeto:

```bash
npm run importar-produtos
```

**Para desligar a importação automática**, abre o "Agendador de Tarefas" do Windows (Task Scheduler), procura por "FilipaReis - Importar Produtos" e desativa ou apaga a tarefa.

O script (automático ou manual) vai:
1. Verificar que cada pasta tem um `info.txt` bem preenchido e pelo menos uma foto (e dizer-te exatamente o que falta, se houver problemas) — uma pasta com problemas é ignorada, sem impedir as outras de serem importadas.
2. Enviar as fotos para o Supabase Storage.
3. Criar (ou atualizar, se já existir) o produto no Supabase.
4. Criar (ou atualizar) o produto e o preço correspondentes na Stripe.
5. No fim, mostrar um resumo: quantos produtos foram criados, quantos atualizados, e a lista de qualquer pasta com erro.

No final verás algo como:

```
✓ produto-01 — Colar de Conchas (criado)
✓ produto-02 — Brincos de Prata (criado)
✗ produto-03 — campo "preco" em falta ou inválido...

──────────────────────────────
Resumo da importação
──────────────────────────────
Criados:     2
Atualizados: 0
Com erro:    1
```

## Repetir / corrigir um produto

Se corrigires o `info.txt` (ou trocares uma foto) e voltares a correr `npm run importar-produtos`, o script **atualiza** o produto existente em vez de criar um duplicado — identifica o produto pelo nome da pasta. Podes correr o script quantas vezes quiseres.

## Onde ficam os ficheiros depois?

As pastas dentro de `produtos/` (exceto `exemplo-produto/`) ficam só no teu computador — não são enviadas para o repositório de código (git). Depois de importados, os dados reais dos produtos vivem no Supabase e as fotos no Supabase Storage. Podes apagar as pastas de `produtos/` depois de confirmares que o produto ficou bem no site, ou deixá-las ficar (não têm efeito nenhum enquanto o script não voltar a correr).

## Nota sobre a Stripe

As chaves da Stripe configuradas no projeto são de **produção** — o script cria Products e Prices reais no catálogo da tua conta Stripe (isto não cobra nada a ninguém nem processa pagamentos; é só o "catálogo"). Se algum dia precisares de remover um produto de teste da Stripe, sabe que a Stripe não permite apagar um Price depois de criado — só é possível arquivá-lo (`active: false`), o que o torna invisível/inutilizável sem o remover do histórico.
