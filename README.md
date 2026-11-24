# discountPrototype

Protótipo mobile da **nova UX de descontos B2C (compra avulsa)** da Starbem, feito em Next.js + Tailwind a partir do Figma "Compra avulsa".

> Protótipo navegável, não é o app de produção: dados fictícios, preços do mock do Figma e sem integração com API.

## Fluxo

1. **Home**: toque em **Comprar** na barra inferior.
2. **Pra quem deseja comprar?**: escolha o titular ou um dependente e toque em **Continuar**.
3. **Comprar consulta**: filtre por Todos / Descontos / Individuais e toque em **Comprar agora**.
4. **Item adicionado**: use **+** para somar e a lixeira para remover; a barra do carrinho mostra o total.

"Ver carrinho" ainda não tem tela no Figma e mostra um aviso.

## Rodar localmente

```bash
npm ci
npm run dev      # http://localhost:3000
npm test         # regras do carrinho (lib/catalogo.test.ts)
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
| `components/Prototype.tsx` | Estado do fluxo (tela, pessoa, carrinho, filtro) |
| `components/HomeScreen.tsx`, `BottomNav.tsx` | Tela 1 |
| `components/PersonSheet.tsx` | Tela 2 (bottom sheet) |
| `components/CatalogScreen.tsx` | Telas 3 e 4 (catálogo, contador e barra do carrinho) |
| `lib/catalogo.ts` | Pacotes, pessoas e regras do carrinho (valores em centavos) |
| `public/assets/` | Ícones e imagens exportados do Figma |

## Pendências conhecidas

- Preços e percentuais são placeholders do Figma; precisam vir da regra de negócio de descontos B2C.
- Textos sem acento herdados do Figma ("Clinico", "Endocrino", "Equilibrio") e o erro "desja" no subtítulo da tela 2.
- Nomes e fotos são fictícios; não use dados reais de pacientes.
