import { getProductsFromSheet } from "@/services/products";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  try {
    const products = await getProductsFromSheet();
    
    if (products.length === 0) {
      return NextResponse.json(
        { 
          message: "Nenhum produto encontrado ou planilha vazia.",
          diagnostics: "Verifique se a planilha tem linhas válidas e se a coluna 'ativo' está como 'sim'."
        },
        { status: 200 }
      );
    }

    return NextResponse.json(products);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("API Error fetching products:", error);
    
    return NextResponse.json(
      { 
        error: "Falha ao carregar produtos",
        details: errorMsg,
        diagnostics: "Verifique se a variável NEXT_PUBLIC_SHEET_CSV_URL está correta e se a planilha está pública."
      },
      { status: 500 }
    );
  }
}
