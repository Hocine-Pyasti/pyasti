import { NextResponse } from "next/server";
import { getProductsBySellerId } from "@/lib/actions/product.actions";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";

  const products = await getProductsBySellerId({
    sellerId: params.id,
    query,
    page: 1,
    sort: "latest",
    limit: 20,
  });

  return NextResponse.json({ products: products.products });
}
