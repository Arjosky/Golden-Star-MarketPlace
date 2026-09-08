export interface OfficialCatalogItem {
  name: string;
  mrp: number;
  category: string;
  defaultClearancePrice: number;
  volume: string;
  img: string;
}

export const OFFICIAL_CATALOG_DB: Record<string, OfficialCatalogItem> = {
  "42255": { 
    name: "NovAge Intense Skin Recharge Overnight Mask", 
    mrp: 1159, 
    category: "Skincare",
    defaultClearancePrice: 1049,
    volume: "50 ml",
    img: "https://media-asia-cdn.oriflame.com/productImage/?icode=42255&w=600&q=90"
  },
  "33980": { 
    name: "NovAge Ecollagen Wrinkle Power Serum", 
    mrp: 2499, 
    category: "Skincare",
    defaultClearancePrice: 1899,
    volume: "30 ml",
    img: "https://media-asia-cdn.oriflame.com/productImage/?icode=33980&w=600&q=90"
  },
  "46047": { 
    name: "Love Potion Cherry on Top Eau de Parfum", 
    mrp: 4899, 
    category: "Fragrance & Perfumes",
    defaultClearancePrice: 4499,
    volume: "50 ml",
    img: "https://media-asia-cdn.oriflame.com/productImage/?icode=46047&w=600&q=90"
  },
  "42503": { 
    name: "Giordani Gold Essenza Parfum", 
    mrp: 5699, 
    category: "Fragrance & Perfumes",
    defaultClearancePrice: 3899,
    volume: "50 ml",
    img: "https://media-asia-cdn.oriflame.com/productImage/?icode=42503&w=600&q=90"
  },
  "12760": { 
    name: "Tender Care Natural Multi-purpose Balm", 
    mrp: 399, 
    category: "Skincare",
    defaultClearancePrice: 229,
    volume: "15 ml",
    img: "https://media-asia-cdn.oriflame.com/productImage/?icode=12760&w=600&q=90"
  },
  "47739": { 
    name: "The ONE All-in-One Blurring Concealer", 
    mrp: 399, 
    category: "Makeup & Color",
    defaultClearancePrice: 289,
    volume: "5 ml",
    img: "https://media-asia-cdn.oriflame.com/productImage/?icode=47739&w=600&q=90"
  }
};

export const MANDATORY_VERIFICATION_BADGE = 
  "Verified by Subhashree Ghosh, Diamond Director Oriflame PAN India, Founder Team Golden Star";
