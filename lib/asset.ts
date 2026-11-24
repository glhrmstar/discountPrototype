/** Caminho de arquivo em /public respeitando o basePath do GitHub Pages. */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
