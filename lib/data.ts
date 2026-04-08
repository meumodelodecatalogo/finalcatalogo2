export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceSmall?: number;
  priceMedium?: number;
  priceLarge?: number;
  category: string;
  imageUrl: string;
  active: boolean;
  tags: string[];
}

export const PIZZARIA_CONFIG = {
  name: "Di Caza Pizzaria",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  pizzaSizes: [
    { id: "small", name: "Pequena" },
    { id: "medium", name: "Média" },
    { id: "large", name: "Grande" },
  ],
};

export const categories = [
  "Pizzas Tradicionais",
  "Pizzas Especiais",
  "Pizzas Doces",
  "Bebidas",
  "Extras",
];

export const products: Product[] = [];
