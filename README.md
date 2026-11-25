# discountPrototype

Protótipo mobile da **nova UX de descontos B2C (compra avulsa)** da Starbem, feito em Next.js + Tailwind a partir do Figma "Compra avulsa".

> Protótipo navegável, não é o app de produção: dados fictícios, preços da tabela atual (a validar) e sem integração com API.

## Fluxo

1. **Home**: toque em **Comprar** na barra inferior.
2. **Pra quem deseja comprar?**: escolha o titular ou um dependente e toque em **Continuar**.
3. **Comprar consulta**: a vitrine abre com a avulsa mais vendida (Nutricionista) e o pacote mais vendido (2 Psicologias), depois intercala o resto por volume de vendas. Os filtros **Descontos** (itens com preço riscado), **Avulsas** e **Pacotes** são opcionais: tocar de novo no chip ativo volta à vitrine inteira.
   - Cards de **avulsa** são laranja com a tag "AVULSO"; cards de **pacote** são roxos (`#F7F1FE` → `#D1B4F6`, texto `#5A40B5`) com a tag "PACOTE" (ou o nome, como "Check-up") e o selo de % OFF.
4. **Detalhe do pacote** (gaveta): pacotes mostram o preço com o % OFF calculado do "de/por"; consultas avulsas mostram o **desconto progressivo** (2/4/6/8 consultas → 15/20/25/30%). Use **+**/**−**, a lixeira ou **Limpar**.
5. **Item adicionado**: tocar no card reabre o detalhe; a barra mostra o total e **Ver carrinho**.
   - As consultas de cada item são fixas (ex.: "2 Psicologias") e não mudam com a quantidade; a quantidade aparece só no contador. Consulta individual mostra só o nome ("Psicologia").
6. **Revisar carrinho**: itens em lista (miniatura laranja/roxa, tipo e % OFF, consultas, preço "de" riscado e "por", **Remover** e contador), **Método de pagamento** (radios: Pix, cartão salvo, novo cartão, Apple Pay), **Resumo dos valores** e **Compre também** (carrossel).
   - "Novo cartão de crédito" abre a gaveta **Novo cartão** já com **dados de exemplo** (fictícios, cartão de teste Mastercard) e o foco no primeiro campo, para o teclado do celular subir junto. Os campos têm máscara.
   - O campo **Parcelas** é um dropdown: a lista com 1x ou 2x sem juros abre logo abaixo do campo.
   - **Salvar cartão para compras futuras** é opcional e começa desmarcado. Sem marcar, o cartão vale só para esta compra e some depois do pagamento.
   - Com o cartão adicionado, a seção mostra **só ele** (`**** 4444`, bandeira e parcelas) com uma seta. Tocar abre a gaveta **Método de pagamento** para trocar de método ou de parcelas.
   - O checkout tem um botão só, **Confirmar e pagar**, sempre habilitado: sem método escolhido, a lista ganha destaque e a tela rola até ela.
7. **Processando dados de pagamentos**: loading de ~2 s depois de **Confirmar e pagar**.
   - **Cartão recusado**: abra o protótipo com `?falha=1` para simular a recusa no pagamento. Depois do loading aparece a gaveta **Cartão recusado**; **Entendi** volta ao carrinho, que continua igual.
   - **Falha ao salvar o cartão**: com `?falhaSalvar=1`, confirmar o Novo cartão com **Salvar cartão** marcado mostra **Falha ao adicionar o cartão** por cima do formulário; **Entendi** volta ao formulário com os dados. Os dois parâmetros podem ser usados juntos (`?falha=1&falhaSalvar=1`).
8. **Aguardando pagamento (Pix)**: QR ilustrativo, total, contagem regressiva de 30 min e **Copiar código** (fictício). Tocar no QR simula a confirmação do pagamento. Sair (seta ou voltar do navegador) pede confirmação: **Sair** volta ao carrinho e **Continuar** mantém o QR.
9. **Pagamento concluído**: uma carta por consulta comprada (até 6) abrindo em leque — cada carta com a cor do que foi comprado: **laranja** para consulta avulsa e **roxa** para consulta de pacote; numa compra mista aparecem as duas, intercaladas e na proporção das consultas — e os blocos entram um depois do outro. Depois, consultas compradas por especialidade, método usado e resumo dos valores. Cartão e Apple Pay chegam aqui direto depois do loading. O carrinho é esvaziado; **Voltar** leva à Home e **Agendar consulta** mostra um aviso (tela ainda não desenhada).

O **carrinho fica salvo**: sair do fluxo de compra (ou fechar a página) não o esvazia. Na Home, o "Comprar" mostra quantos itens estão salvos, e ao voltar o catálogo já abre com eles. Fica no `localStorage` do navegador por 7 dias, só com pacotes, quantidades e a pessoa escolhida.

Cada avanço mostra um **skeleton** por ~700 ms, simulando a busca de dados. O voltar do celular volta uma tela.
Nenhum pagamento é real: o loading e a confirmação são simulados.

## Rodar localmente

```bash
npm ci
npm run dev      # http://localhost:3000
npm test         # regras de preço, carrinho, máscaras e validação (lib/*.test.ts)
npm run build    # export estático em out/
```

Abra no celular pela rede local (`http://<ip-do-computador>:3000`) ou use o modo responsivo do navegador. No desktop a tela fica centralizada com no máximo 430 px.

## Publicar no GitHub Pages

1. Em **Settings → Pages → Build and deployment**, escolha **Source: GitHub Actions** (uma vez só).
2. Faça push na `main`. O workflow `.github/workflows/deploy.yml` roda testes, typecheck e build, e publica `out/`.
3. O link fica em `https://<usuário>.github.io/discountPrototype/`.

O workflow define `NEXT_PUBLIC_BASE_PATH=/<nome-do-repo>`; se renomear o repositório, nada muda no código.

## Estrutura

| Caminho | O que é |
|---|---|
| `components/Prototype.tsx` | Estado e navegação do fluxo (pilha de telas, carrinho, método, skeletons) |
| `components/HomeScreen.tsx`, `BottomNav.tsx` | Tela 1 |
| `components/PersonSheet.tsx` | Tela 2 (bottom sheet) |
| `components/CatalogScreen.tsx` | Telas 3 e 5 (catálogo, card, barra do carrinho) |
| `components/PackageSheet.tsx` | Tela 4 (detalhe do pacote) |
| `components/CartScreen.tsx`, `NewCardSheet.tsx`, `InstallmentsDropdown.tsx`, `ChangeMethodSheet.tsx` | Telas 6 a 9 (Revisar carrinho, Novo cartão, dropdown de parcelas e Trocar método) |
| `components/NoticeSheet.tsx` | Avisos curtos: falha no pagamento e sair do Pix |
| `components/ProcessingScreen.tsx` | Loading "Processando dados de pagamentos" |
| `components/PixScreen.tsx` | Pix (QR) |
| `components/SuccessScreen.tsx` | Pagamento concluído |
| `components/Skeletons.tsx` | Skeletons de carregamento |
| `components/ui.tsx` | Peças compartilhadas: Sheet, Header, Stepper, Progresso, Totais, Selo |
| `lib/catalogo.ts` | Pacotes, faixas de desconto e regras do carrinho (valores em centavos) |
| `lib/carrinhoSalvo.ts` | Salvar/ler o carrinho no navegador (validação e validade de 7 dias) |
| `lib/leque.ts` | Ângulos e tempos do leque de cartas da tela de sucesso |
| `lib/pagamento.ts` | Campos do cartão, máscaras, validação, parcelas e utilitários do Pix |
| `public/assets/` | Ícones e imagens exportados do Figma |

## Pendências conhecidas

- Preços vêm da tabela atual de avulsas e pacotes, mas precisam vir da regra de negócio de descontos B2C (inclusive se a faixa conta por item ou pelo total de avulsas).
- O preço "de" dos pacotes precisa ser um preço de referência real (CDC). Hoje ele não bate com a soma das avulsas (ex.: 2 Psicologias somam R$ 99,80 avulsas e o "de" é R$ 199,80). Validar com jurídico e comercial antes de produção.
- O filtro **Descontos** hoje mostra os mesmos itens de **Pacotes**, porque só os pacotes têm preço riscado com 1 unidade.
- Correções de texto feitas no código e que ainda precisam ir para o Figma: acentos ("Clínico", "Endócrino", "Equilíbrio"), "desja" → "deseja", "Copie e o cole" → "Copie e cole", seções do cartão ("Dados do cartão" / "Endereço de cobrança"), campo "Cidade" e máscara de CPF `000.000.000-00`.
- O QR do Figma é escaneável e aponta para um site de terceiros; aqui o QR é ilustrativo (não é lido) e o código copiado é fictício.
- Texto e cor do alerta "Selecione um método de pagamento" (`#D92D20`) não estão no Figma.
- Carrinho salvo no `localStorage` só serve ao protótipo: em produção o carrinho (dado de saúde, LGPD) deve ficar no backend, por conta, e não no aparelho.
- Nomes e fotos são fictícios; não use dados reais de pacientes. O formulário do cartão não envia nem guarda nada (só os 4 últimos dígitos ficam em memória).
