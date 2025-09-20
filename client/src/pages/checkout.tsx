import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Mail, ArrowLeft } from "lucide-react";

type PaymentMethod = 'paypal';

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/checkout/:productData");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('paypal');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [randomNote, setRandomNote] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);

  // Payment details

  const paypalEmail = 'sexgirlaccs@gmail.com';
  const noteOptions = ['book', 'ebook', 'books'];

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

    // Generate random note for PayPal
    const randomIndex = Math.floor(Math.random() * noteOptions.length);
    setRandomNote(noteOptions[randomIndex]);
  }, [params, setLocation]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };


  const handlePaymentConfirmation = () => {
    if (!product) return;

    // PayPal payments confirmation
    const paymentType = 'PayPal Friends & Family';
    alert(`Payment initiated for ${product.name} via ${paymentType}!\\n\\nYour order will be processed automatically once the payment is confirmed.`);
    
    setTimeout(() => {
      setLocation('/products');
    }, 2000);
  };

  const openPayPalApp = () => {
    const paypalUrl = `https://www.paypal.com/paypalme/${paypalEmail.split('@')[0]}/${product?.price}?note=${encodeURIComponent(randomNote)}`;
    window.open(paypalUrl, '_blank');
  };

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
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method */}
                <div className="bg-muted/20 p-4 rounded-lg text-center">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-lg mb-1">PayPal Friends & Family</h3>
                  <p className="text-sm text-muted-foreground">Secure payment via PayPal</p>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                    <div className="bg-muted/20 p-6 rounded-lg space-y-4">
                      <h3 className="font-semibold text-lg">PayPal Friends & Family Payment</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Send to Email:</label>
                          <div className="flex items-center justify-between bg-muted/10 p-3 rounded mt-1">
                            <code className="text-sm">{paypalEmail}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(paypalEmail, 'email')}
                            >
                              {copiedText === 'email' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Amount:</label>
                          <div className="bg-muted/10 p-3 rounded mt-1">
                            <span className="text-lg font-bold">${product.price} USD</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Add this note:</label>
                          <div className="flex items-center justify-between bg-muted/10 p-3 rounded mt-1">
                            <code className="text-sm font-medium">{randomNote}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(randomNote, 'note')}
                            >
                              {copiedText === 'note' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Send exactly <strong>${product.price}</strong> via PayPal Friends & Family</p>
                        <p>• Use the email and note exactly as shown above</p>
                        <p>• Payment will be automatically detected and processed</p>
                        <p>• Your product will be delivered via email after confirmation</p>
                      </div>

                      <Button onClick={openPayPalApp} className="w-full" size="lg">
                        Open PayPal App
                      </Button>
                    </div>
                  </div>


                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/products')}
                    className="flex-1"
                    size="lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePaymentConfirmation}
                    className="flex-1"
                    size="lg"
                  >
                    I've Sent Payment
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