export interface Whitepaper {
  slug: string;
  title: string;
  dek: string;
  date: string; // ISO yyyy-mm-dd, from frontmatter
  contentHtml: string; // rendered from the markdown body
}
