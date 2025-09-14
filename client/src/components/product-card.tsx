import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Check, X, Package } from "lucide-react";
import { useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const isInStock = product.inStock && product.stockQuantity > 0;
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  const handleCheckoutClick = () => {
    const productData = encodeURIComponent(JSON.stringify(product));
    setLocation(`/checkout/${productData}`);
  };

  return (
    <div className={`bg-card rounded-lg border border-border overflow-hidden card-hover neon-border ${!isInStock ? 'opacity-75' : ''}`} data-testid={`card-product-${product.id}`}>
      <div className="relative bg-muted/20 p-6 border-b border-border">
        <div className="flex justify-between items-start mb-4">
          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md">
            {product.category}
          </span>
          {hasDiscount && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-md">
              SALE
            </span>
          )}
        </div>
        <div className="text-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-[360px] h-auto mx-auto mb-2 rounded-md object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          )}
          <h3 className="text-lg font-semibold" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {product.game}
            </span>
          </div>
          <span 
            className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
              isInStock 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
            data-testid={`status-stock-${product.id}`}
          >
            {isInStock ? (
              <>
                <Check className="w-3 h-3" />
                <span>
                  {product.stockQuantity > 1 ? `${product.stockQuantity} In Stock` : 'In Stock'}
                </span>
              </>
            ) : (
              <>
                <X className="w-3 h-3" />
                <span>Out of Stock</span>
              </>
            )}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
              ${product.price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                ${product.originalPrice}
              </span>
            )}
          </div>
          <Button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isInStock
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            disabled={!isInStock}
            onClick={handleCheckoutClick}
            data-testid={`button-checkout-${product.id}`}
          >
            {isInStock ? 'Checkout' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}
