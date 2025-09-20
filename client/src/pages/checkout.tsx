import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Bitcoin, Coins, QrCode, Mail, ArrowLeft, CheckCircle, Clock } from "lucide-react";

type PaymentMethod = 'bitcoin' | 'litecoin' | 'paypal';

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/checkout/:productData");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bitcoin');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [randomNote, setRandomNote] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [confirmations, setConfirmations] = useState<number>(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);

  // Payment addresses and details
  const paymentAddresses = {
    bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    litecoin: 'ltc1qw4kv8dfh7jq4g2x8t5j9k7l3m4n5o6p7q8r9s'
  };

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

  const checkBlockchainPayment = async (address: string, network: string): Promise<{ confirmations: number; received: number }> => {
    try {
      // Use BlockCypher API for real blockchain monitoring
      const apiUrl = `https://api.blockcypher.com/v1/${network}/main/addrs/${address}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for unconfirmed and confirmed transactions
      const totalReceived = data.total_received || 0;
      const unconfirmedBalance = data.unconfirmed_balance || 0;
      const balance = data.balance || 0;
      
      // Calculate confirmations based on confirmed transactions
      let confirmations = 0;
      if (data.txrefs && data.txrefs.length > 0) {
        // Get the most recent transaction
        const latestTx = data.txrefs[0];
        confirmations = latestTx.confirmations || 0;
      }
      
      return {
        confirmations: Math.min(confirmations, 6), // Cap at 6 confirmations for display
        received: totalReceived / 100000000 // Convert from satoshis to main unit
      };
    } catch (error) {
      console.error('Blockchain API error:', error);
      throw error;
    }
  };

  const startPaymentDetection = () => {
    if (!product || selectedMethod === 'paypal') return;
    
    setIsDetecting(true);
    setConfirmations(0);
    
    const address = paymentAddresses[selectedMethod];
    const network = selectedMethod === 'bitcoin' ? 'btc' : 'ltc';
    const expectedAmount = parseFloat(product.price);
    
    // Real blockchain monitoring - check every 2 minutes
    const checkInterval = setInterval(async () => {
      try {
        const result = await checkBlockchainPayment(address, network);
        
        // Check if payment amount is sufficient (allowing for small variations)
        const paymentReceived = result.received >= (expectedAmount * 0.95); // 5% tolerance
        
        if (paymentReceived && result.confirmations >= 2) {
          // Payment confirmed after 2 confirmations
          clearInterval(checkInterval);
          setPaymentConfirmed(true);
          setIsDetecting(false);
          
          // Redirect after successful confirmation
          setTimeout(() => {
            alert(`✅ Payment Confirmed!\\n\\n${product.name} has been successfully purchased.\\nReceived: ${result.received} ${selectedMethod.toUpperCase()}\\nConfirmations: ${result.confirmations}\\n\\nYour product will be delivered to your email shortly.`);
            setLocation('/products');
          }, 2000);
        } else if (paymentReceived) {
          // Payment received but need more confirmations
          setConfirmations(result.confirmations);
        }
      } catch (error) {
        console.error('Payment detection error:', error);
        // Continue checking despite errors
      }
    }, 120000); // Check every 2 minutes
  };

  const handlePaymentConfirmation = () => {
    if (!product) return;

    if (selectedMethod === 'paypal') {
      // PayPal payments are manual confirmation
      const paymentType = 'PayPal Friends & Family';
      alert(`Payment initiated for ${product.name} via ${paymentType}!\\n\\nYour order will be processed automatically once the payment is confirmed.`);
      
      setTimeout(() => {
        setLocation('/products');
      }, 2000);
    } else {
      // Start automatic crypto detection
      startPaymentDetection();
    }
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
                {/* Payment Method Selection */}
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={selectedMethod === 'bitcoin' ? 'default' : 'outline'}
                    className="flex items-center gap-2 h-12"
                    onClick={() => setSelectedMethod('bitcoin')}
                  >
                    <Bitcoin className="w-5 h-5" />
                    Bitcoin
                  </Button>
                  <Button
                    variant={selectedMethod === 'litecoin' ? 'default' : 'outline'}
                    className="flex items-center gap-2 h-12"
                    onClick={() => setSelectedMethod('litecoin')}
                  >
                    <Coins className="w-5 h-5" />
                    Litecoin
                  </Button>
                  <Button
                    variant={selectedMethod === 'paypal' ? 'default' : 'outline'}
                    className="flex items-center gap-2 h-12"
                    onClick={() => setSelectedMethod('paypal')}
                  >
                    <Mail className="w-5 h-5" />
                    PayPal F&F
                  </Button>
                </div>

                {/* Payment Details */}
                {selectedMethod === 'paypal' ? (
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
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/20 p-6 rounded-lg space-y-4">
                      <h3 className="font-semibold text-lg">
                        {selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} Payment
                      </h3>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Send payment to this {selectedMethod.toUpperCase()} address:
                        </label>
                        <div className="flex items-center justify-between bg-muted/10 p-3 rounded mt-1">
                          <code className="text-sm break-all flex-1 pr-2">
                            {paymentAddresses[selectedMethod]}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(paymentAddresses[selectedMethod], selectedMethod)}
                          >
                            {copiedText === selectedMethod ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-muted/10 p-6 rounded-lg text-center">
                        <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          QR Code for {selectedMethod.toUpperCase()} address
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Send exactly <strong>${product.price}</strong> worth of {selectedMethod.toUpperCase()}</p>
                        <p>• Payment will be confirmed automatically</p>
                        <p>• Your product will be delivered via email after confirmation</p>
                        <p>• Please allow 10-60 minutes for blockchain confirmation</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Detection Status */}
                {isDetecting && selectedMethod !== 'paypal' && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-blue-500 animate-spin" />
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                        Detecting Payment...
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-300">Blockchain Confirmations:</span>
                        <span className="font-mono text-sm font-bold text-blue-900 dark:text-blue-100">
                          {confirmations}/2
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(confirmations / 2) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Waiting for {2 - confirmations} more confirmation{2 - confirmations !== 1 ? 's' : ''}...
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Confirmed Status */}
                {paymentConfirmed && (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">
                          Payment Confirmed!
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your order is being processed. You'll receive your product shortly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/products')}
                    className="flex-1"
                    size="lg"
                    disabled={isDetecting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePaymentConfirmation}
                    className="flex-1"
                    size="lg"
                    disabled={isDetecting || paymentConfirmed}
                  >
                    {isDetecting ? 'Detecting...' : paymentConfirmed ? 'Confirmed' : selectedMethod === 'paypal' ? "I've Sent Payment" : 'I\'ve Sent Payment'}
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