import type { Product, MenuItem } from "@/types/menu";

/**
 * Convert database Product to MenuItem format for backwards compatibility
 */
export const productToMenuItem = (product: Product): MenuItem => {
  return {
    id: product.id,
    name: product.name,
    nameDE: product.name_de || undefined,
    description: product.description,
    descriptionDE: product.description_de || undefined,
    price: product.price,
    image: product.image_url || "",
    category: product.category,
  };
};

/**
 * Convert array of Products to MenuItems
 */
export const productsToMenuItems = (products: Product[]): MenuItem[] => {
  return products.map(productToMenuItem);
};

/**
 * Get category translations
 */
export const getCategoryTranslation = (category: string, language: string): string => {
  const translations: Record<string, Record<string, string>> = {
    Burgers: { en: "Burgers", de: "Burger" },
    Sides: { en: "Sides", de: "Beilagen" },
    Drinks: { en: "Drinks", de: "Getränke" },
    Desserts: { en: "Desserts", de: "Desserts" },
  };

  return translations[category]?.[language] || category;
};
