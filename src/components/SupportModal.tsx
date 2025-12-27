import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import oplusLogo from "@/assets/oplus-logo.png";

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
  const { user } = useAuth();

  // Auto-fill name from profile if logged in
  useEffect(() => {
    if (user?.username && !name) {
      setName(user.username);
    }
  }, [user?.username]);

  const getNote = () => {
    const senderName = name.trim();
    return senderName 
      ? `Cheers to Yourel from ${senderName}` 
      : "Cheers to Yourel";
  };

  const generateUPILink = () => {
    const note = getNote();
    const amountParam = amount ? `&am=${amount}` : "";
    return `upi://pay?pa=${UPI_ID}&pn=Yourel&cu=INR&tn=${encodeURIComponent(note)}${amountParam}`;
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
      <DialogContent className="max-w-[90vw] sm:max-w-[480px] p-5 sm:p-6">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            Support Yourel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Free • Indie • Community-built
          </p>
          
          {/* Name & Amount in row on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount" className="text-xs">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setShowQR(false);
                }}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="flex gap-1.5">
            {[50, 100, 200, 500].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => {
                  setAmount(String(preset));
                  setShowQR(false);
                }}
                className={`flex-1 h-7 text-xs px-2 ${amount === String(preset) ? 'bg-primary text-primary-foreground' : ''}`}
              >
                ₹{preset}
              </Button>
            ))}
          </div>

          {/* Support button */}
          <Button
            onClick={handleSupport}
            disabled={!isValid}
            className="w-full h-9 text-sm font-medium gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" />
            Support ₹{amount || '0'}
          </Button>

          {/* Desktop: QR Code - compact */}
          {!isMobile && showQR && isValid && (
            <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg">
              <div className="p-2 bg-white rounded-md flex-shrink-0 relative">
                <QRCodeSVG
                  value={generateUPILink()}
                  size={100}
                  level="H"
                  includeMargin={false}
                />
                {/* Circular logo overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 bg-white rounded-full p-0.5 flex items-center justify-center">
                    <img 
                      src={oplusLogo} 
                      alt="Oplus" 
                      className="w-5 h-5 object-contain rounded-full"
                    />
                  </div>
                </div>
              </div>
              <div className="text-left space-y-0.5 min-w-0">
                <p className="text-xs font-medium">Scan to pay ₹{amount}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {getNote()}
                </p>
                <p className="text-[9px] text-muted-foreground font-mono truncate">
                  {UPI_ID}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
