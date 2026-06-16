export interface WhitepaperSection {
  heading?: string;
  paragraphs: string[];
}

export interface Whitepaper {
  slug: string;
  title: string;
  dek: string;
  order: number;
  sections: WhitepaperSection[];
}
