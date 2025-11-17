import { MenuItem } from "@/types/menu";
import burgerImg from "@/assets/burger.jpg";
import friesImg from "@/assets/fries.jpg";
import drinkImg from "@/assets/drink.jpg";
import dessertImg from "@/assets/dessert.jpg";

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    nameDE: "Klassischer Burger",
    description: "Juicy beef patty with cheese, lettuce, tomato",
    descriptionDE: "Saftiges Rindfleisch-Patty mit Käse, Salat, Tomate",
    price: 8.99,
    image: burgerImg,
    category: "Burgers",
  },
  {
    id: "2",
    name: "Double Cheeseburger",
    nameDE: "Doppelter Cheeseburger",
    description: "Two beef patties with double cheese",
    descriptionDE: "Zwei Rindfleisch-Patties mit doppeltem Käse",
    price: 11.99,
    image: burgerImg,
    category: "Burgers",
  },
  {
    id: "3",
    name: "Veggie Burger",
    nameDE: "Veggie Burger",
    description: "Plant-based patty with fresh vegetables",
    descriptionDE: "Pflanzliches Patty mit frischem Gemüse",
    price: 9.99,
    image: burgerImg,
    category: "Burgers",
  },
  {
    id: "4",
    name: "French Fries",
    nameDE: "Pommes Frites",
    description: "Crispy golden fries",
    descriptionDE: "Knusprige goldene Pommes",
    price: 3.99,
    image: friesImg,
    category: "Sides",
  },
  {
    id: "5",
    name: "Onion Rings",
    nameDE: "Zwiebelringe",
    description: "Crispy battered onion rings",
    descriptionDE: "Knusprig panierte Zwiebelringe",
    price: 4.99,
    image: friesImg,
    category: "Sides",
  },
  {
    id: "6",
    name: "Cola",
    nameDE: "Cola",
    description: "Refreshing cold cola",
    descriptionDE: "Erfrischende kalte Cola",
    price: 2.99,
    image: drinkImg,
    category: "Drinks",
  },
  {
    id: "7",
    name: "Orange Juice",
    nameDE: "Orangensaft",
    description: "Fresh squeezed orange juice",
    descriptionDE: "Frisch gepresster Orangensaft",
    price: 3.99,
    image: drinkImg,
    category: "Drinks",
  },
  {
    id: "8",
    name: "Ice Cream Sundae",
    nameDE: "Eisbecher",
    description: "Vanilla ice cream with chocolate sauce",
    descriptionDE: "Vanilleeis mit Schokoladensauce",
    price: 4.99,
    image: dessertImg,
    category: "Desserts",
  },
];

export const categories = ["Burgers", "Sides", "Drinks", "Desserts"];

export const categoriesDE = {
  Burgers: "Burger",
  Sides: "Beilagen",
  Drinks: "Getränke",
  Desserts: "Desserts"
};
