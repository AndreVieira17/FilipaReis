export type Category = {
  id: string;
  name_pt: string;
  name_en: string;
  slug: string;
  description_pt: string | null;
  description_en: string | null;
  image_url: string | null;
  order_index: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text_pt: string | null;
  alt_text_en: string | null;
  order_index: number;
  is_primary: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  material: string | null;
  price_modifier: number;
  stock_quantity: number;
  sku: string | null;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  name_pt: string;
  name_en: string | null;
  slug: string;
  description_pt: string | null;
  description_en: string | null;
  price: number;
  is_personalizable: boolean;
  personalization_note_pt: string | null;
  personalization_note_en: string | null;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  weight_grams: number | null;
  created_at: string;
  updated_at: string;
};

export type ProductWithRelations = Product & {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type CartItem = {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  image: string | null;
  quantity: number;
};
