import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { getOrderById, markOrderAsPrinted } from "@/services/orders";
import { APP_CONFIG } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Printer, Loader2 } from "lucide-react";
import AccessibilityButton from "@/components/AccessibilityButton";
import PrinterPlugin from "@/plugins/printer";
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  orderId: string;
  orderNumber: string;
}

const OrderComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

  const state = location.state as LocationState | null;
  const orderId = state?.orderId;
  const displayOrderNumber = state?.orderNumber || "0000";

  // Fetch complete order data from database
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId,
  });

  useEffect(() => {
    // Auto-return to landing page after delay
    const timer = setTimeout(() => {
      navigate("/");
    }, APP_CONFIG.AUTO_RETURN_DELAY);

    return () => clearTimeout(timer);
  }, [navigate]);

  const content = {
    confirmed: t({ en: "Order Confirmed!", de: "Bestellung bestätigt!" }),
    thankYou: t({ en: "Thank you for your order", de: "Vielen Dank für Ihre Bestellung" }),
    orderNumber: t({ en: "Your order number is:", de: "Ihre Bestellnummer ist:" }),
    waitMessage: t({
      en: "Please wait for your number to be called. Your order will be ready shortly.",
      de: "Bitte warten Sie, bis Ihre Nummer aufgerufen wird. Ihre Bestellung wird in Kürze fertig sein."
    }),
    print: t({ en: "Print Receipt", de: "Quittung drucken" }),
    printing: t({ en: "Printing...", de: "Wird gedruckt..." }),
    newOrder: t({ en: "Place New Order", de: "Neue Bestellung aufgeben" }),
    loading: t({ en: "Loading order...", de: "Bestellung wird geladen..." }),
  };

  const handlePrint = async () => {
    if (!order || isPrinting) return;

    setIsPrinting(true);

    try {
      // Check printer status first
      try {
        const status = await PrinterPlugin.getPrinterStatus();
        if (!status.isConnected) {
          toast({
            title: t({ en: "Printer Not Ready", de: "Drucker nicht bereit" }),
            description: t({
              en: "Printer is not connected. Using browser print instead.",
              de: "Drucker ist nicht verbunden. Browser-Druck wird verwendet."
            }),
            duration: 3000,
          });
          window.print();
          setIsPrinting(false);
          return;
        }
      } catch (statusError) {
        console.error("Printer status check failed:", statusError);
      }

      // Prepare items for printing
      const items = order.order_items.map(item => ({
        name: language === "de" ? item.product_name_de || item.product_name : item.product_name,
        quantity: item.quantity,
        price: item.unit_price,
      }));

      // Print receipt
      const result = await PrinterPlugin.printReceipt({
        orderNumber: order.order_number,
        items,
        total: order.total,
        language,
      });

      if (result.success) {
        // Mark order as printed in database
        await markOrderAsPrinted(order.id);

        toast({
          title: t({ en: "Receipt printed", de: "Quittung gedruckt" }),
          description: t({
            en: "Your receipt has been printed successfully.",
            de: "Ihre Quittung wurde erfolgreich gedruckt."
          }),
        });
      } else {
        toast({
          title: t({ en: "Print Warning", de: "Druckwarnung" }),
          description: result.message || t({ en: "Print may have failed", de: "Druck möglicherweise fehlgeschlagen" }),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Print error:", error);

      toast({
        title: t({ en: "Printer Error", de: "Druckerfehler" }),
        description: t({
          en: "Error printing receipt. Using browser print.",
          de: "Fehler beim Drucken. Browser-Druck wird verwendet."
        }),
        variant: "destructive",
        duration: 5000,
      });

      // Fallback to browser print
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading || !order) {
    return (
      <div className="w-[1080px] h-[1920px] bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-20 w-20 animate-spin text-primary mx-auto mb-6" />
          <p className="text-3xl font-semibold">{content.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[1080px] h-[1920px] bg-white flex items-center justify-center p-12">
      <AccessibilityButton />
      <Card className="p-20 max-w-3xl text-center bg-white border-gray-200">
        <div className="mb-12 flex justify-center">
          <div className="p-8 rounded-full bg-green-100">
            <CheckCircle className="h-40 w-40 text-green-600" />
          </div>
        </div>
        <h1 className="text-7xl font-bold mb-8 text-gray-900">{content.confirmed}</h1>
        <p className="text-3xl text-gray-600 mb-6">{content.thankYou}</p>
        <div className="mb-12">
          <p className="text-2xl mb-4 text-gray-700">{content.orderNumber}</p>
          <p className="text-8xl font-bold text-gray-900">#{displayOrderNumber}</p>
        </div>
        <p className="text-2xl text-gray-600 mb-12">{content.waitMessage}</p>
        <div className="space-y-4">
          <Button
            size="lg"
            onClick={handlePrint}
            disabled={isPrinting}
            className="w-full text-3xl px-16 py-10 bg-[#ebdc76] text-black hover:bg-[#ebdc76]/90 gap-3"
          >
            {isPrinting ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                {content.printing}
              </>
            ) : (
              <>
                <Printer className="h-8 w-8" />
                {content.print}
              </>
            )}
          </Button>
          <Button
            size="lg"
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full text-3xl px-16 py-10"
          >
            {content.newOrder}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OrderComplete;
