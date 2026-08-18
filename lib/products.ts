import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithRelations } from "@/lib/types";

const PRODUCT_SELECT =
  "*, category:categories(*), images:product_images(*), variants:product_variants(*)";

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
}): Promise<ProductWithRelations[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (options?.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as ProductWithRelations[]).map(sortRelations);
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
