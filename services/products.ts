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
  console.log("[Diagnostics] Iniciando busca de produtos da planilha...");
  
  if (!SHEET_CSV_URL) {
    const errorMsg = "NEXT_PUBLIC_SHEET_CSV_URL não configurada no ambiente.";
    console.error(`[Diagnostics] Erro: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Garante que a URL termina com export?format=csv se for uma URL de planilha do Google
  let fetchUrl = SHEET_CSV_URL;
  if (fetchUrl.includes("docs.google.com/spreadsheets") && !fetchUrl.includes("export?format=csv")) {
    if (fetchUrl.includes("/edit")) {
      fetchUrl = fetchUrl.split("/edit")[0] + "/export?format=csv";
    } else if (!fetchUrl.endsWith("/")) {
      fetchUrl += "/export?format=csv";
    }
  }

  console.log(`[Diagnostics] URL de fetch: ${fetchUrl.substring(0, 50)}...`);

  try {
    const response = await fetch(fetchUrl, {
      next: { revalidate: 60 },
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    console.log(`[Diagnostics] Status do fetch: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorMsg = `Falha ao buscar dados da planilha: ${response.status} ${response.statusText}`;
      console.error(`[Diagnostics] Erro: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const csvText = await response.text();
    console.log(`[Diagnostics] Tamanho do CSV recebido: ${csvText.length} caracteres`);
    
    // Detecta o separador (vírgula ou ponto e vírgula)
    const firstLine = csvText.split('\n')[0];
    const separator = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
    console.log(`[Diagnostics] Separador detectado: "${separator}"`);

    const rows = parseCSV(csvText, separator);
    console.log(`[Diagnostics] Quantidade de linhas detectadas no CSV: ${rows.length}`);

    if (rows.length <= 1) {
      console.warn("[Diagnostics] Planilha parece estar vazia ou contém apenas o cabeçalho.");
      if (csvText.toLowerCase().includes("<!doctype html>") || csvText.toLowerCase().includes("<html")) {
        console.error("[Diagnostics] O conteúdo recebido parece ser HTML, não CSV. Verifique se a planilha está pública.");
      }
      return [];
    }

    // Log do cabeçalho para conferência
    console.log(`[Diagnostics] Cabeçalho detectado: ${JSON.stringify(rows[0])}`);

    // Mapeia as linhas para o formato Product de forma eficiente
    const sheetProducts: Product[] = [];
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Pula o cabeçalho (index 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 4) {
        skippedCount++;
        continue;
      }

      try {
        // Ordem esperada: nome, categoria, descricao, preco_p, preco_m, preco_g, ativo, destaque, imagem, tags
        const [nome, categoria, descricao, precoPStr, precoMStr, precoGStr, ativo, destaque, imagem, tagsStr] = row;

        if (!nome || typeof nome !== "string" || nome.trim() === "") {
          skippedCount++;
          continue;
        }
        
        const cleanPrice = (val: string) => {
          if (!val) return NaN;
          return parseFloat(String(val).replace("R$", "").replace(/\s/g, "").replace(".", "").replace(",", "."));
        };

        const priceP = cleanPrice(precoPStr);
        const priceM = cleanPrice(precoMStr);
        const priceG = cleanPrice(precoGStr);

        // Validação básica: pelo menos um preço deve ser válido
        const hasValidPrice = (!isNaN(priceP) && priceP > 0) || 
                             (!isNaN(priceM) && priceM > 0) || 
                             (!isNaN(priceG) && priceG > 0);
        
        if (!hasValidPrice) {
          skippedCount++;
          continue;
        }

        const isActive = ativo?.toLowerCase().trim() === "sim";
        if (!isActive) {
          skippedCount++;
          continue;
        }

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
        processedCount++;
      } catch (err) {
        errorCount++;
        console.error(`[Diagnostics] Erro na linha ${i + 1}:`, err);
      }
    }

    console.log(`[Diagnostics] Processamento concluído: ${processedCount} produtos ativos, ${skippedCount} pulados, ${errorCount} erros.`);
    return sheetProducts;
  } catch (error) {
    console.error("[Diagnostics] Erro fatal ao carregar produtos do CSV:", error);
    throw error;
  }
}

/**
 * Parser simples de CSV que lida com aspas e vírgulas dentro de campos
 */
function parseCSV(text: string, separator: string = ","): string[][] {
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
    } else if (char === separator && !inQuotes) {
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
