import { Button } from "@/components/ui/button";

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryNav = ({ categories, activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => onCategoryChange(category)}
              variant={activeCategory === category ? "default" : "secondary"}
              size="lg"
              className="min-w-[140px] text-lg font-semibold"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
