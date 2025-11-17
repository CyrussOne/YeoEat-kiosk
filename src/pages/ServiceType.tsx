import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, ShoppingBag } from "lucide-react";
import AccessibilityButton from "@/components/AccessibilityButton";

const ServiceType = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("de");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const content = {
    en: {
      title: "Where will you be eating today?",
      eatIn: "Eat In",
      takeAway: "Take Away",
    },
    de: {
      title: "Wo möchten Sie heute essen?",
      eatIn: "Im Restaurant",
      takeAway: "Zum Mitnehmen",
    },
  };

  const handleServiceType = (type: "eat-in" | "take-away") => {
    localStorage.setItem("serviceType", type);
    navigate("/menu");
  };

  return (
    <div className="w-[1080px] h-[1920px] flex items-center justify-center bg-background relative">
      <AccessibilityButton />
      
      <div className="absolute inset-0 decorative-border" />
      
      <div className="relative z-10 text-center space-y-16 px-16">
        <h1 className="text-6xl font-bold text-foreground mb-24">
          {content[language as keyof typeof content].title}
        </h1>
        
        <div className="flex gap-16 justify-center">
          {/* Eat In */}
          <button
            onClick={() => handleServiceType("eat-in")}
            className="group relative"
          >
            <div className="w-[400px] h-[400px] bg-primary rounded-3xl flex flex-col items-center justify-center gap-8 p-8 hover:scale-105 transition-transform shadow-2xl decorative-border">
              <UtensilsCrossed className="w-32 h-32 text-primary-foreground" />
              <span className="text-4xl font-bold text-primary-foreground text-center">
                {content[language as keyof typeof content].eatIn}
              </span>
            </div>
          </button>

          {/* Take Away */}
          <button
            onClick={() => handleServiceType("take-away")}
            className="group relative"
          >
            <div className="w-[400px] h-[400px] bg-primary rounded-3xl flex flex-col items-center justify-center gap-8 p-8 hover:scale-105 transition-transform shadow-2xl decorative-border">
              <ShoppingBag className="w-32 h-32 text-primary-foreground" />
              <span className="text-4xl font-bold text-primary-foreground text-center">
                {content[language as keyof typeof content].takeAway}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceType;
