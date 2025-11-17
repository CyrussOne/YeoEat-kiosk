import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { STORAGE_KEYS, TAX_RATE } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import AccessibilityButton from "@/components/AccessibilityButton";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { language, t } = useLanguage();

  const content = {
    emptyCart: t({ en: "Your cart is empty", de: "Ihr Warenkorb ist leer" }),
    backToMenu: t({ en: "Back to Menu", de: "Zurück zum Menü" }),
    subtotal: t({ en: "Subtotal", de: "Zwischensumme" }),
    tax: t({ en: "Tax (19%)", de: "MwSt (19%)" }),
    total: t({ en: "Total", de: "Gesamt" }),
    paymentOptions: t({ en: "Payment Options", de: "Zahlungsoptionen" }),
    payCard: t({ en: "Pay with Card", de: "Mit Karte bezahlen" }),
    payCashier: t({ en: "Pay at Cashier", de: "An der Kasse bezahlen" }),
    back: t({ en: "Back to menu", de: "Zurück zum Menü" }),
  };

  const subtotal = getCartTotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handlePaymentMethod = (method: "card" | "cashier") => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHOD, method);
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="w-[1080px] h-[1920px] bg-white flex flex-col items-center justify-center p-12">
        <AccessibilityButton />
        <Card className="p-16 text-center max-w-2xl bg-white">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">{content.emptyCart}</h1>
          <Button
            size="lg"
            onClick={() => navigate("/menu")}
            className="text-2xl px-12 py-8 bg-[#ebdc76] text-black hover:bg-[#ebdc76]/90"
          >
            {content.backToMenu}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-[1080px] h-[1920px] bg-white flex flex-col p-12">
      <AccessibilityButton />

      {/* Cart Items */}
      <Card className="mb-8 p-8 bg-white border-gray-200">
        {cart.map((item, index) => {
          const itemName = language === "de" ? item.name_de || item.name : item.name;
          return (
            <div key={item.id}>
              <div className="flex items-center gap-6 py-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{itemName}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-xl text-gray-600">{item.quantity}x</span>
                    <span className="text-2xl font-bold text-gray-900">
                      €{item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  €{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
              {index < cart.length - 1 && <div className="border-t border-gray-200" />}
            </div>
          );
        })}

        <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
          <div className="flex justify-between text-xl text-gray-600">
            <span>{content.subtotal}:</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl text-gray-600">
            <span>{content.tax}:</span>
            <span>€{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-3xl font-bold text-gray-900 pt-3 border-t">
            <span>{content.total}:</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Payment Options */}
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-gray-900 text-center mb-12">
          {content.paymentOptions}
        </h2>

        <div className="space-y-6">
          <Card
            className="p-8 cursor-pointer hover:scale-105 transition-transform bg-white border-gray-200"
            onClick={() => handlePaymentMethod("card")}
          >
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#ebdc76] flex items-center justify-center">
                <span className="text-5xl">💳</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{content.payCard}</h3>
            </div>
          </Card>

          <Card
            className="p-8 cursor-pointer hover:scale-105 transition-transform bg-white border-gray-200"
            onClick={() => handlePaymentMethod("cashier")}
          >
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#ebdc76] flex items-center justify-center">
                <span className="text-5xl">💰</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{content.payCashier}</h3>
            </div>
          </Card>
        </div>
      </div>

      {/* Back Button */}
      <Button
        variant="secondary"
        size="lg"
        onClick={() => navigate("/menu")}
        className="gap-2 text-3xl px-16 py-12 mt-auto mb-24 shadow-lg"
      >
        <ArrowLeft className="h-8 w-8" />
        {content.back}
      </Button>
    </div>
  );
};

export default CartPage;
