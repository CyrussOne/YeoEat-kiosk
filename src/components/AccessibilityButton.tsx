import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accessibility } from "lucide-react";

const AccessibilityButton = () => {
  const [fontSize, setFontSize] = useState("normal");

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    const root = document.documentElement;
    
    switch (size) {
      case "large":
        root.style.fontSize = "120%";
        break;
      case "xlarge":
        root.style.fontSize = "140%";
        break;
      default:
        root.style.fontSize = "100%";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          variant="secondary"
          className="fixed bottom-6 right-6 z-50 rounded-full w-16 h-16 shadow-lg"
          aria-label="Accessibility options"
        >
          <Accessibility className="h-8 w-8" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-card">
        <DropdownMenuItem onClick={() => handleFontSizeChange("normal")}>
          Normal Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFontSizeChange("large")}>
          Large Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFontSizeChange("xlarge")}>
          Extra Large Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccessibilityButton;
