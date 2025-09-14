import { useState } from "react";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Copy, Check, Bitcoin, Coins, QrCode } from "lucide-react";

interface CryptoPaymentModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PaymentMethod = 'bitcoin' | 'litecoin';

export default function CryptoPaymentModal({ product, open, onOpenChange }: CryptoPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bitcoin');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Placeholder addresses - in production, these would be generated dynamically
  const paymentAddresses = {
    bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    litecoin: 'ltc1qw4kv8dfh7jq4g2x8t5j9k7l3m4n5o6p7q8r9s'
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handlePaymentConfirmation = () => {
    // In production, this would integrate with your payment processing system
    // For now, we'll show a success message and close the modal
    alert(`Payment initiated for ${product.name} via ${selectedMethod.toUpperCase()}!\n\nPlease send exactly $${product.price} worth of ${selectedMethod.toUpperCase()} to the provided address. Your order will be processed automatically once the payment is confirmed.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Cryptocurrency Payment
          </DialogTitle>
          <DialogDescription>
            Complete your purchase of <strong>{product.name}</strong> using cryptocurrency
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Summary */}
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{product.name}</span>
              <span className="text-lg font-bold text-primary">${product.price}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Payment Method:</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedMethod === 'bitcoin' ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => setSelectedMethod('bitcoin')}
              >
                <Bitcoin className="w-4 h-4" />
                Bitcoin
              </Button>
              <Button
                variant={selectedMethod === 'litecoin' ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => setSelectedMethod('litecoin')}
              >
                <Coins className="w-4 h-4" />
                Litecoin
              </Button>
            </div>
          </div>

          {/* Payment Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Send payment to this {selectedMethod.toUpperCase()} address:
            </label>
            <div className="bg-muted/20 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm break-all flex-1 pr-2">
                  {paymentAddresses[selectedMethod]}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(paymentAddresses[selectedMethod], selectedMethod)}
                  className="shrink-0"
                >
                  {copiedAddress === selectedMethod ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="bg-muted/10 p-6 rounded-lg text-center">
            <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              QR Code for {selectedMethod.toUpperCase()} address
            </p>
          </div>

          {/* Payment Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Send exactly <strong>${product.price}</strong> worth of {selectedMethod.toUpperCase()}</p>
            <p>• Payment will be confirmed automatically</p>
            <p>• Your product will be delivered via email after confirmation</p>
            <p>• Please allow 10-60 minutes for blockchain confirmation</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePaymentConfirmation} className="flex-1">
              I've Sent Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}