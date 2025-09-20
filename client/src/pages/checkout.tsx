import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type PaymentMethod = never;

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/checkout/:productData");
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (params?.productData) {
      try {
        const decodedProduct = JSON.parse(decodeURIComponent(params.productData));
        setProduct(decodedProduct);
      } catch (error) {
        console.error('Failed to parse product data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [params, setLocation]);


  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.game}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-bold text-primary">${product.price}</span>
                  </div>
                </div>

                <Badge variant="outline" className="w-full justify-center">
                  {product.category}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* No Payment Methods Available */}
                <div className="bg-muted/20 p-8 rounded-lg text-center">
                  <h3 className="font-semibold text-lg mb-2">Payment Methods Temporarily Unavailable</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We're currently updating our payment systems. Please check back later or contact support.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/products')}
                    className="flex-1"
                    size="lg"
                  >
                    Back to Products
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/')}
                    className="flex-1"
                    size="lg"
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}