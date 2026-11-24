# discountPrototype

Protótipo mobile da **nova UX de descontos B2C (compra avulsa)** da Starbem, feito em Next.js + Tailwind a partir do Figma "Compra avulsa".

> Protótipo navegável, não é o app de produção: dados fictícios, preços do mock do Figma e sem integração com API.

## Fluxo

1. **Home**: toque em **Comprar** na barra inferior.
2. **Pra quem deseja comprar?**: escolha o titular ou um dependente e toque em **Continuar**.
3. **Comprar consulta**: filtre por Todos / Descontos / Individuais e toque em **Comprar agora**.
4. **Detalhe do pacote** (gaveta): pacotes com desconto mostram o preço com 50% OFF; consultas individuais mostram o **desconto progressivo** (2/4/6/8 consultas → 15/20/25/30%). Use **+**/**−**, a lixeira ou **Limpar**.
5. **Item adicionado**: tocar no card reabre o detalhe; a barra mostra o total e **Ver carrinho**.
6. **Revisar carrinho**: itens, **Método de pagamento** (radios), **Resumo dos valores** e **Compre também** (carrossel).
   - "Novo cartão de crédito" abre a gaveta **Novo cartão** já com **dados de exemplo** (fictícios) e o foco no primeiro campo, para o teclado do celular subir junto. Os campos têm máscara; ao confirmar, o cartão entra na lista como `**** 1234`.
   - O checkout tem um botão só, **Confirmar e pagar**, sempre habilitado: sem método escolhido, a lista ganha destaque e a tela rola até ela.
7. **Aguardando pagamento (Pix)**: QR ilustrativo, total, contagem regressiva de 30 min e **Copiar código** (fictício).

Cada avanço mostra um **skeleton** por ~700 ms, simulando a busca de dados. O voltar do celular volta uma tela.
A confirmação de pagamento com cartão/Apple Pay ainda não tem tela no Figma e mostra um aviso.

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
| `components/CartScreen.tsx`, `NewCardSheet.tsx` | Telas 6 a 9 (Revisar carrinho e Novo cartão) |
| `components/PixScreen.tsx` | Tela 10 (Pix) |
| `components/Skeletons.tsx` | Skeletons de carregamento |
| `components/ui.tsx` | Peças compartilhadas: Sheet, Header, Stepper, Progresso, Totais, Selo |
| `lib/catalogo.ts` | Pacotes, faixas de desconto e regras do carrinho (valores em centavos) |
| `lib/pagamento.ts` | Campos do cartão, máscaras, validação e utilitários do Pix |
| `public/assets/` | Ícones e imagens exportados do Figma |

## Pendências conhecidas

- Preços, percentuais e faixas do desconto progressivo são placeholders do Figma; precisam vir da regra de negócio de descontos B2C (inclusive se a faixa conta por item ou pelo total de individuais).
- Correções de texto feitas no código e que ainda precisam ir para o Figma: acentos ("Clínico", "Endócrino", "Equilíbrio"), "desja" → "deseja", "Copie e o cole" → "Copie e cole", seções do cartão ("Dados do cartão" / "Endereço de cobrança"), campo "Cidade" e máscara de CPF `000.000.000-00`.
- O QR do Figma é escaneável e aponta para um site de terceiros; aqui o QR é ilustrativo (não é lido) e o código copiado é fictício.
- Texto e cor do alerta "Selecione um método de pagamento" (`#D92D20`) não estão no Figma.
- Nomes e fotos são fictícios; não use dados reais de pacientes. O formulário do cartão não envia nem guarda nada (só os 4 últimos dígitos ficam em memória).
