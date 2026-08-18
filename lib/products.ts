import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithRelations } from "@/lib/types";

const PRODUCT_SELECT =
  "*, category:categories(*), images:product_images(*), variants:product_variants(*)";

export const PRODUCTS_PER_PAGE = 24;

export type SortOption = "newest" | "price_asc" | "price_desc";

function sortRelations(product: ProductWithRelations): ProductWithRelations {
  return {
    ...product,
    images: [...product.images].sort((a, b) => a.order_index - b.order_index),
    variants: product.variants.filter((v) => v.is_active),
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProducts(options?: {
  categorySlug?: string;
  query?: string;
  sort?: SortOption;
  page?: number;
  perPage?: number;
}): Promise<{ products: ProductWithRelations[]; total: number }> {
  const supabase = createClient();
  const page = Math.max(1, options?.page ?? 1);
  const perPage = options?.perPage ?? PRODUCTS_PER_PAGE;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (options?.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (!category) return { products: [], total: 0 };
    query = query.eq("category_id", category.id);
  }

  if (options?.query) {
    const term = options.query.trim();
    if (term) {
      query = query.or(`name_pt.ilike.%${term}%,description_pt.ilike.%${term}%`);
    }
  }

  switch (options?.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    products: (data as unknown as ProductWithRelations[]).map(sortRelations),
    total: count ?? 0,
  };
}

export async function getFeaturedProducts(
  limit = 4
): Promise<ProductWithRelations[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as ProductWithRelations[]).map(sortRelations);
}

export async function getNewestProducts(
  limit = 4
): Promise<ProductWithRelations[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as ProductWithRelations[]).map(sortRelations);
}

/**
 * Mais vendidos — agregado real a partir de order_items (encomendas pagas).
 * Devolve lista vazia enquanto não houver vendas; não é simulado.
 */
export async function getBestSellingProducts(
  limit = 4
): Promise<ProductWithRelations[]> {
  const supabase = createClient();
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity");

  if (itemsError) throw itemsError;
  if (!items || items.length === 0) return [];

  const totals = new Map<string, number>();
  for (const item of items) {
    if (!item.product_id) continue;
    totals.set(item.product_id, (totals.get(item.product_id) ?? 0) + item.quantity);
  }
  if (totals.size === 0) return [];

  const topIds = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .in("id", topIds);

  if (error) throw error;
  const products = (data as unknown as ProductWithRelations[]).map(sortRelations);
  return topIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductWithRelations => !!p);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return sortRelations(data as unknown as ProductWithRelations);
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 4
): Promise<ProductWithRelations[]> {
  if (!categoryId) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(limit);

  if (error) throw error;
  return (data as unknown as ProductWithRelations[]).map(sortRelations);
}
