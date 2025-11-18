import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  formatReceipt,
  generateTestReceipt,
  printReceiptToSerial,
  type ReceiptData,
} from "@/services/receiptPrinter";

const PrinterTest = () => {
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState(false);

  const handleGeneratePreview = () => {
    const testData = generateTestReceipt();
    const formatted = formatReceipt(testData);
    setReceiptPreview(formatted);
    toast.success("Test-Beleg generiert!");
  };

  const handlePrint = async () => {
    if (!receiptPreview) {
      toast.error("Bitte zuerst Vorschau generieren!");
      return;
    }

    setIsPrinting(true);
    try {
      await printReceiptToSerial(receiptPreview);
      toast.success("✅ Beleg erfolgreich gedruckt!");
    } catch (error) {
      console.error("Print error:", error);
      toast.error("❌ Druckfehler: " + (error as Error).message);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (receiptPreview) {
      navigator.clipboard.writeText(receiptPreview);
      toast.success("In Zwischenablage kopiert!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          🖨️ Drucker-Test (Wintec SDP)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Steuerung</h2>

            <div className="space-y-4">
              <Button
                onClick={handleGeneratePreview}
                className="w-full text-lg py-6"
                variant="default"
              >
                📄 Test-Beleg Generieren
              </Button>

              <Button
                onClick={handlePrint}
                className="w-full text-lg py-6 bg-green-600 hover:bg-green-700"
                disabled={!receiptPreview || isPrinting}
              >
                {isPrinting ? "Druckt..." : "🖨️ Jetzt Drucken"}
              </Button>

              <Button
                onClick={handleCopyToClipboard}
                className="w-full text-lg py-6"
                variant="outline"
                disabled={!receiptPreview}
              >
                📋 In Zwischenablage Kopieren
              </Button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold mb-2">ℹ️ Hinweise:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Drucker per USB/Serial verbinden</li>
                  <li>Beim Drucken wird Serieller Port abgefragt</li>
                  <li>Wintec SDP sollte bei 9600 Baud laufen</li>
                  <li>ESC/POS Epson-kompatibel</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Vorschau</h2>

            {receiptPreview ? (
              <div className="bg-white p-4 rounded border-2 border-gray-300 font-mono text-xs overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {receiptPreview}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
                Noch kein Beleg generiert.<br />
                Klicken Sie auf "Test-Beleg Generieren"
              </div>
            )}
          </Card>
        </div>

        {/* Receipt Layout Info */}
        <Card className="mt-8 p-6">
          <h2 className="text-2xl font-bold mb-4">📋 Beleg-Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">✅ Implementiert:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Firmenname (zentriert, groß)</li>
                <li>Firmenadresse & Steuernummer</li>
                <li>Bestellnummer & Zeitstempel</li>
                <li>Service-Typ (Vor Ort / Außer Haus)</li>
                <li>Zahlungsmethode (Karte / Bar)</li>
                <li>Artikelliste mit Mengen & Preisen</li>
                <li>Zwischensumme</li>
                <li>Netto-Betrag (ohne MwSt)</li>
                <li>MwSt (19%)</li>
                <li>Brutto-Gesamt</li>
                <li>Fiskaly TSE Platzhalter</li>
                <li>Fußzeile ("Vielen Dank")</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">⏳ Später:</h3>
              <ul className="space-y-1 list-disc list-inside text-gray-600">
                <li>Echte Fiskaly TSE-Signatur</li>
                <li>QR-Code für digitalen Beleg</li>
                <li>Firmenlogo (wenn Drucker unterstützt)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrinterTest;
