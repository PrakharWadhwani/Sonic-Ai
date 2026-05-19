import { NextRequest, NextResponse } from "next/server";
import { ProductFilterSchema } from "@/types/product";
import { getAllProducts, getProduct, searchProducts } from "@/services/product.service";
import { errorResponse, successResponse } from "@/types/api";

/**
 * GET /api/products
 * Fetches live products from Shopify (cached 5 min) with optional filters.
 * Query params: ?category=travel&minPrice=100&maxPrice=400&style=over-ear&tags=anc&q=search&id=uuid
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const params = request.nextUrl.searchParams;

    // Single product by ID
    const id = params.get("id");
    if (id) {
      const product = await getProduct(id);
      if (!product) {
        return NextResponse.json(
          errorResponse("NOT_FOUND", `Product ${id} not found`),
          { status: 404 }
        );
      }
      return NextResponse.json(
        successResponse(product, { processingTimeMs: Date.now() - startTime }),
        { status: 200 }
      );
    }

    // Search by query
    const query = params.get("q");
    if (query) {
      const results = await searchProducts(query);
      return NextResponse.json(
        successResponse({ products: results, total: results.length }, { processingTimeMs: Date.now() - startTime }),
        { status: 200 }
      );
    }

    // Filtered list
    const filterInput: Record<string, unknown> = {};
    if (params.get("category")) filterInput.category = params.get("category");
    if (params.get("style")) filterInput.style = params.get("style");
    if (params.get("minPrice")) filterInput.minPrice = parseFloat(params.get("minPrice")!);
    if (params.get("maxPrice")) filterInput.maxPrice = parseFloat(params.get("maxPrice")!);
    if (params.get("tags")) filterInput.tags = params.get("tags")!.split(",");
    if (params.get("connectivity")) filterInput.connectivity = params.get("connectivity");
    if (params.get("minReviewScore")) filterInput.minReviewScore = parseFloat(params.get("minReviewScore")!);

    const filterParsed = ProductFilterSchema.safeParse(filterInput);
    const filters = filterParsed.success ? filterParsed.data : undefined;

    const products = await getAllProducts(filters);

    return NextResponse.json(
      successResponse(
        { products, total: products.length },
        { processingTimeMs: Date.now() - startTime }
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/products] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message),
      { status: 500 }
    );
  }
}
