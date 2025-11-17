import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { createOrder } from "@/services/orders";
import { STORAGE_KEYS } from "@/utils/constants";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import AccessibilityButton from "@/components/AccessibilityButton";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { language, t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processOrder = async () => {
      if (isProcessing) return;

      const paymentMethod = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHOD);
      const serviceType = localStorage.getItem(STORAGE_KEYS.SERVICE_TYPE);

      if (!paymentMethod || !serviceType || cart.length === 0) {
        navigate("/cart");
        return;
      }

      setIsProcessing(true);

      try {
        // Show processing message
        toast.success(t({
          en: "Processing your order...",
          de: "Ihre Bestellung wird bearbeitet..."
        }));

        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create order in database
        const orderData = {
          service_type: serviceType as "eat-in" | "take-away",
          payment_method: paymentMethod as "card" | "cashier",
          language: language as "en" | "de",
          items: cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_name_de: item.name_de || undefined,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        };

        const order = await createOrder(orderData);

        if (!order) {
          throw new Error("Failed to create order");
        }

        // Clear cart
        clearCart();
        localStorage.removeItem(STORAGE_KEYS.PAYMENT_METHOD);

        // Navigate to order complete with order data
        navigate("/order-complete", {
          state: { orderId: order.id, orderNumber: order.order_number }
        });

      } catch (error) {
        console.error("Order creation failed:", error);
        toast.error(t({
          en: "Order failed. Please try again.",
          de: "Bestellung fehlgeschlagen. Bitte versuchen Sie es erneut."
        }));

        // Navigate back to cart
        setTimeout(() => {
          navigate("/cart");
        }, 2000);
      }
    };

    processOrder();
  }, []);

  const content = {
    processing: t({ en: "Processing Payment...", de: "Zahlung wird bearbeitet..." }),
    wait: t({ en: "Please wait while we process your order", de: "Bitte warten Sie, während wir Ihre Bestellung bearbeiten" }),
  };

  return (
    <div className="w-[1080px] h-[1920px] bg-white flex items-center justify-center p-12">
      <AccessibilityButton />
      <Card className="p-16 text-center max-w-2xl bg-white border-gray-200">
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full bg-[#ebdc76]/20 flex items-center justify-center mx-auto mb-6">
            <div className="w-24 h-24 rounded-full bg-[#ebdc76] animate-pulse" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-6 text-gray-900">{content.processing}</h1>
        <p className="text-2xl text-gray-600">{content.wait}</p>
      </Card>
    </div>
  );
};

export default Checkout;
