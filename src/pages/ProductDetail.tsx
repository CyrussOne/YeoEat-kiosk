import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProductById } from "@/services/products";
import { productToMenuItem } from "@/utils/productHelpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AccessibilityButton from "@/components/AccessibilityButton";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  // Fetch product from database
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  });

  const content = {
    back: t({ en: "Back", de: "Zurück" }),
    quantity: t({ en: "Quantity", de: "Menge" }),
    addToCart: t({ en: "Add to Cart", de: "In den Warenkorb" }),
    total: t({ en: "Total", de: "Gesamt" }),
    loading: t({ en: "Loading product...", de: "Produkt wird geladen..." }),
    error: t({ en: "Product not found", de: "Produkt nicht gefunden" }),
    addedToCart: t({ en: "added to cart", de: "zum Warenkorb hinzugefügt" }),
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

  if (error || !product) {
    return (
      <div className="w-[1080px] h-[1920px] flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-3xl font-semibold text-destructive mb-6">{content.error}</p>
          <Button
            onClick={() => navigate("/menu")}
            className="text-xl"
            size="lg"
          >
            {content.back}
          </Button>
        </div>
      </div>
    );
  }

  const item = productToMenuItem(product);
  const itemName = language === "de" ? item.nameDE || item.name : item.name;
  const itemDescription = language === "de" ? item.descriptionDE || item.description : item.description;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: item.id,
        name: item.name,
        name_de: item.nameDE,
        price: item.price,
        image_url: item.image,
        category: item.category,
      });
    }

    toast.success(`${itemName} ${content.addedToCart}`, {
      duration: 2000,
      className: "animate-scale-in"
    });

    navigate("/menu");
  };

  return (
    <div className="w-[1080px] h-[1920px] bg-white flex flex-col">
      <AccessibilityButton />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate("/menu")}
          className="gap-2 text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="text-xl">{content.back}</span>
        </Button>
      </div>

      {/* Product Image */}
      <div className="w-full h-[600px] bg-gray-100">
        <img
          src={item.image || "/assets/placeholder.jpg"}
          alt={itemName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">{itemName}</h1>
        <p className="text-2xl text-gray-600 mb-8">{itemDescription}</p>
        <p className="text-4xl font-bold text-gray-900 mb-12">€{item.price.toFixed(2)}</p>

        {/* Quantity Selector */}
        <Card className="p-8 mb-8 bg-gray-50">
          <p className="text-2xl font-semibold mb-4 text-gray-900">
            {content.quantity}
          </p>
          <div className="flex items-center gap-6">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-16 w-16"
            >
              <Minus className="h-8 w-8" />
            </Button>
            <span className="text-4xl font-bold w-20 text-center text-gray-900">{quantity}</span>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setQuantity(quantity + 1)}
              className="h-16 w-16"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Add to Cart Button */}
      <div className="p-8 pb-32 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-semibold text-gray-900">
            {content.total}:
          </span>
          <span className="text-4xl font-bold text-gray-900">
            €{(item.price * quantity).toFixed(2)}
          </span>
        </div>
        <Button
          size="lg"
          onClick={handleAddToCart}
          className="w-full text-3xl py-12 bg-[#ebdc76] text-black hover:bg-[#ebdc76]/90 shadow-lg"
        >
          <Plus className="h-8 w-8 mr-2" />
          {content.addToCart}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;
