import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { CartItem } from "@/types/menu";
import { useNavigate } from "react-router-dom";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const Cart = ({ items, onUpdateQuantity, onRemoveItem }: CartProps) => {
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Your cart is empty</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Your Order
        </h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-lg">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Tax</span>
            <span>${(total * 0.1).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-2xl font-bold">
            <span>Total</span>
            <span className="text-primary">${(total * 1.1).toFixed(2)}</span>
          </div>
        </div>
        <Button
          size="lg"
          className="w-full text-lg"
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout
        </Button>
      </Card>
    </div>
  );
};

export default Cart;
