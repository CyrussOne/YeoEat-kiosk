import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getActiveProducts } from "@/services/products";
import { productsToMenuItems, getCategoryTranslation } from "@/utils/productHelpers";
import { CATEGORIES, STORAGE_KEYS } from "@/utils/constants";
import type { MenuItem } from "@/types/menu";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Search, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import AccessibilityButton from "@/components/AccessibilityButton";
import logo from "@/assets/yelocash-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, getCartCount } = useCart();
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.BURGERS);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products from database
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: getActiveProducts,
  });

  // Convert products to menu items
  const menuItems = productsToMenuItems(products);

  // Filter items by category and search
  const filteredItems = menuItems.filter(
    (item) =>
      item.category === activeCategory &&
      (searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameDE && item.nameDE.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const content = {
    back: t({ en: "Back", de: "Zurück" }),
    eatIn: t({ en: "Eat In", de: "Im Restaurant" }),
    takeAway: t({ en: "Take Away", de: "Zum Mitnehmen" }),
    searchPlaceholder: t({ en: "Search menu...", de: "Menü durchsuchen..." }),
    items: t({ en: "items", de: "Artikel" }),
    viewCart: t({ en: "View Cart", de: "Warenkorb anzeigen" }),
    loading: t({ en: "Loading menu...", de: "Menü wird geladen..." }),
    error: t({ en: "Error loading menu", de: "Fehler beim Laden des Menüs" }),
    noItems: t({ en: "No items found", de: "Keine Artikel gefunden" }),
  };

  const categories = Object.values(CATEGORIES);

  const handleProductClick = (item: MenuItem) => {
    navigate(`/product/${item.id}`);
  };

  if (isLoading) {
    return (
      <div className="w-[1080px] h-[1920px] flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-20 w-20 animate-spin text-primary mx-auto mb-6" />
          <p className="text-3xl font-semibold">{content.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[1080px] h-[1920px] flex items-center justify-center bg-white">
        <div className="text-center text-destructive">
          <p className="text-3xl font-semibold">{content.error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-6 text-xl"
            size="lg"
          >
            {t({ en: "Retry", de: "Erneut versuchen" })}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[1080px] h-[1920px] flex overflow-hidden bg-white">
      <AccessibilityButton />

      {/* Left Sidebar - Categories */}
      <div className="w-[300px] bg-gray-900 flex flex-col">
        {/* Logo */}
        <div className="p-8 border-b border-white/20">
          <img
            src={logo}
            alt="YeloEat"
            className="h-16 w-auto mx-auto"
          />
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`w-full p-6 rounded-xl text-left text-xl font-bold transition-all ${
                activeCategory === category
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {getCategoryTranslation(category, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header with Search and Service Type */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate("/service-type")}
              className="gap-2"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="text-xl">{content.back}</span>
            </Button>
            <h1 className="text-3xl font-bold">
              {localStorage.getItem(STORAGE_KEYS.SERVICE_TYPE) === "eat-in"
                ? content.eatIn
                : content.takeAway}
            </h1>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              placeholder={content.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 text-xl"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-2xl text-muted-foreground">{content.noItems}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleProductClick}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary Bar */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-border p-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg text-muted-foreground">
                    {getCartCount()} {content.items}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    €{getCartTotal().toFixed(2)}
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate("/cart")}
                  className="gap-2 text-xl px-8 py-6"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {content.viewCart}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
