import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPI_ID = "6260976807-3@ybl";

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [showQR, setShowQR] = useState(false);
  const isMobile = useIsMobile();

  const getMessage = () => {
    const senderName = name.trim() || "Anonymous";
    return `Cheers to yourel from ${senderName}`;
  };

  const generateUPILink = () => {
    const message = getMessage();
    const baseUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Yourel Support")}&cu=INR&tn=${encodeURIComponent(message)}`;
    const amountParam = amount ? `&am=${amount}` : "";
    return baseUrl + amountParam;
  };

  const handleSupport = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    if (isMobile) {
      window.location.href = generateUPILink();
    } else {
      setShowQR(true);
    }
  };

  const isValid = amount && parseFloat(amount) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
            Support Yourel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Help us keep Yourel running and ad-free
          </p>
          
          {/* Name input */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs sm:text-sm">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs sm:text-sm">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setShowQR(false);
              }}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Quick amount buttons */}
          <div className="flex gap-2 flex-wrap">
            {[50, 100, 200, 500].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => {
                  setAmount(String(preset));
                  setShowQR(false);
                }}
                className={`flex-1 min-w-[60px] text-xs ${amount === String(preset) ? 'bg-primary text-primary-foreground' : ''}`}
              >
                ₹{preset}
              </Button>
            ))}
          </div>

          {/* Support button */}
          <Button
            onClick={handleSupport}
            disabled={!isValid}
            className="w-full h-10 sm:h-11 text-sm font-medium gap-2"
          >
            <Heart className="w-4 h-4" />
            Support with ₹{amount || '0'}
          </Button>

          {/* Desktop: QR Code */}
          {!isMobile && showQR && isValid && (
            <div className="flex flex-col items-center gap-3 p-5 bg-background border border-border rounded-xl">
              <div className="p-3 bg-white rounded-lg">
                <QRCodeSVG
                  value={generateUPILink()}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Scan to pay ₹{amount}</p>
                <p className="text-xs text-muted-foreground">
                  {getMessage()}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">
                {UPI_ID}
              </p>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Payment via UPI • Secure & Instant
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
