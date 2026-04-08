import { getProductsFromSheet } from "@/services/products";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  try {
    const products = await getProductsFromSheet();
    return NextResponse.json(products);
  } catch (error) {
    console.error("API Error fetching products:", error);
    return NextResponse.json(
      { error: "Falha ao carregar produtos" },
      { status: 500 }
    );
  }
}
