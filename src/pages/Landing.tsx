import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccessibilityButton from "@/components/AccessibilityButton";
import welcomeBg from "@/assets/welcome-bg.png";
import ukFlag from "@/assets/flag-uk.png";
import deFlag from "@/assets/flag-de.png";

const Landing = () => {
  const navigate = useNavigate();
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [language, setLanguage] = useState("de"); // German as default

  const languages = [
    { code: "en", flag: ukFlag },
    { code: "de", flag: deFlag },
  ];

  return showLanguageSelection ? (
    <div className="w-[1080px] h-[1920px] flex items-center justify-center bg-background relative">
      <AccessibilityButton />
      
      <div className="absolute inset-0 decorative-border" />
      
      <div className="relative z-10 text-center space-y-16 px-16">
        <h1 className="text-7xl font-bold text-foreground mb-24">
          Wählen Sie Ihre Sprache
        </h1>
        
        <div className="flex gap-16 justify-center">
          {/* English */}
          <button
            onClick={() => {
              setLanguage("en");
              localStorage.setItem("language", "en");
              navigate("/service-type");
            }}
            className="group relative"
          >
            <div className="w-[400px] h-[400px] bg-primary rounded-3xl flex flex-col items-center justify-center gap-8 hover:scale-105 transition-transform shadow-2xl decorative-border">
              <img
                src={ukFlag}
                alt="English"
                className="w-48 h-32 object-cover rounded-xl"
              />
              <span className="text-4xl font-bold text-primary-foreground">
                English
              </span>
            </div>
          </button>

          {/* German */}
          <button
            onClick={() => {
              setLanguage("de");
              localStorage.setItem("language", "de");
              navigate("/service-type");
            }}
            className="group relative"
          >
            <div className="w-[400px] h-[400px] bg-primary rounded-3xl flex flex-col items-center justify-center gap-8 hover:scale-105 transition-transform shadow-2xl decorative-border">
              <img
                src={deFlag}
                alt="Deutsch"
                className="w-48 h-32 object-cover rounded-xl"
              />
              <span className="text-4xl font-bold text-primary-foreground">
                Deutsch
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="w-[1080px] h-[1920px] cursor-pointer relative"
      onClick={() => {
        setShowLanguageSelection(true);
        // Request fullscreen
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.log("Fullscreen request failed:", err);
          });
        }
      }}
      style={{
        backgroundImage: `url(${welcomeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <AccessibilityButton />
      <div className="absolute inset-0 decorative-border" />
    </div>
  );
};

export default Landing;
