import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MenuItem } from "@/types/menu";

interface ProductCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  language?: string;
}

const ProductCard = ({ item, onAddToCart, language = "de" }: ProductCardProps) => {
  const itemName = language === "de" ? item.nameDE || item.name : item.name;
  const itemDescription = language === "de" ? item.descriptionDE || item.description : item.description;
  const addText = language === "de" ? "Hinzufügen" : "Add";
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group bg-white border-gray-200"
      onClick={() => onAddToCart(item)}
    >
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={itemName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-3 text-gray-900">{itemName}</h3>
        <p className="text-gray-600 text-lg mb-6">{itemDescription}</p>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900">€{item.price.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
