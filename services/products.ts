import { Product, categories } from "@/lib/data";

const SHEET_CSV_URL = process.env.NEXT_PUBLIC_SHEET_CSV_URL || "";

/**
 * Normaliza as categorias vindas da planilha para os nomes usados no frontend.
 * Cache de resultados para evitar processamento repetitivo.
 */
const categoryCache = new Map<string, string>();

function normalizeCategory(rawCategory: string): string {
  const category = (rawCategory || "").toLowerCase().trim();
  if (categoryCache.has(category)) return categoryCache.get(category)!;
  
  let result = categories[0];

  if (category.includes("tradicional")) result = "Pizzas Tradicionais";
  else if (category.includes("especia")) result = "Pizzas Especiais";
  else if (category.includes("doce")) result = "Pizzas Doces";
  else if (category.includes("bebida")) result = "Bebidas";
  else if (category.includes("extra")) result = "Extras";
  else {
    const directMatch = categories.find(c => c.toLowerCase() === category);
    if (directMatch) result = directMatch;
  }
  
  const finalResult = categories.includes(result) ? result : categories[0];
  categoryCache.set(category, finalResult);
  return finalResult;
}

/**
 * Função principal para obter produtos.
 * No cliente, chama a API interna. No servidor, processa o CSV diretamente.
 */
export async function getProducts(): Promise<Product[]> {
  // Se estiver no navegador, chama a API interna para evitar processamento pesado no frontend
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Erro na API de produtos");
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar produtos via API:", error);
      throw error;
    }
  }

  // Se estiver no servidor (ex: durante a chamada da API), processa o CSV
  return getProductsFromSheet();
}

/**
 * Lógica de processamento do Google Sheets (executada apenas no servidor)
 */
export async function getProductsFromSheet(): Promise<Product[]> {
  if (!SHEET_CSV_URL) {
    console.warn("NEXT_PUBLIC_SHEET_CSV_URL não configurada.");
    return [];
  }

  try {
    const response = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar dados da planilha");
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length <= 1) return [];

    // Mapeia as linhas para o formato Product de forma eficiente
    const sheetProducts: Product[] = [];
    
    // Pula o cabeçalho (index 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Colunas esperadas: nome, categoria, descricao, preco_p, preco_m, preco_g, ativo, destaque, imagem, tags
        const [nome, categoria, descricao, precoPStr, precoMStr, precoGStr, ativo, destaque, imagem, tagsStr] = row;

        if (!nome || typeof nome !== "string" || nome.trim() === "") continue;
        
        const priceP = parseFloat((precoPStr || "").replace(",", "."));
        const priceM = parseFloat((precoMStr || "").replace(",", "."));
        const priceG = parseFloat((precoGStr || "").replace(",", "."));

        // Validação básica: pelo menos um preço deve ser válido
        const hasValidPrice = (!isNaN(priceP) && priceP > 0) || 
                             (!isNaN(priceM) && priceM > 0) || 
                             (!isNaN(priceG) && priceG > 0);
        
        if (!hasValidPrice) continue;

        const isActive = ativo?.toLowerCase().trim() === "sim";
        if (!isActive) continue;

        let tags: string[] = [];
        if (tagsStr) {
          tags = tagsStr.split(",").map(t => t.trim()).filter(t => t !== "");
        }
        
        if (destaque?.toLowerCase().trim() === "sim" && !tags.includes("Destaque")) {
          tags.push("Destaque");
        }

        // Preço principal para compatibilidade (usa o médio se disponível, senão o primeiro válido)
        const mainPrice = !isNaN(priceM) && priceM > 0 ? priceM : 
                         (!isNaN(priceP) && priceP > 0 ? priceP : priceG);

        sheetProducts.push({
          id: `p-${i}`,
          name: nome.trim(),
          description: (descricao || "").trim(),
          price: mainPrice,
          priceSmall: !isNaN(priceP) && priceP > 0 ? priceP : undefined,
          priceMedium: !isNaN(priceM) && priceM > 0 ? priceM : undefined,
          priceLarge: !isNaN(priceG) && priceG > 0 ? priceG : undefined,
          category: normalizeCategory(categoria),
          imageUrl: (imagem || "").trim() || "/images/fallback.webp",
          active: true,
          tags
        });
      } catch (err) {
        console.error(`Erro na linha ${i + 1}:`, err);
      }
    }

    return sheetProducts;
  } catch (error) {
    console.error("Erro ao carregar produtos do CSV:", error);
    throw error;
  }
}

/**
 * Parser simples de CSV que lida com aspas e vírgulas dentro de campos
 */
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let col = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      col += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(col);
      col = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (col !== "" || row.length > 0) {
        row.push(col);
        result.push(row);
        col = "";
        row = [];
      }
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
    } else {
      col += char;
    }
  }

  if (col !== "" || row.length > 0) {
    row.push(col);
    result.push(row);
  }

  return result;
}
