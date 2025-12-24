import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Smartphone, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPI_ID = "6260976807-3@ybl";

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [amount, setAmount] = useState("");
  const [showQR, setShowQR] = useState(false);
  const isMobile = useIsMobile();

  const generateUPILink = (app?: string) => {
    const baseUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Yourel Support")}&cu=INR`;
    const amountParam = amount ? `&am=${amount}` : "";
    return baseUrl + amountParam;
  };

  const handlePaymentApp = (app: string) => {
    const upiLink = generateUPILink(app);
    window.location.href = upiLink;
  };

  const handleShowQR = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    setShowQR(true);
  };

  const paymentApps = [
    { name: "PhonePe", color: "bg-[#5f259f]", icon: "📱" },
    { name: "Google Pay", color: "bg-[#4285f4]", icon: "💳" },
    { name: "Paytm", color: "bg-[#00baf2]", icon: "💰" },
    { name: "Any UPI", color: "bg-foreground/10", icon: "🔗" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            Support Yourel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Help us keep Yourel running and ad-free
          </p>
          
          <div className="space-y-2">
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

          {isMobile ? (
            /* Mobile: Payment app buttons */
            <div className="grid grid-cols-2 gap-2">
              {paymentApps.map((app) => (
                <Button
                  key={app.name}
                  variant="outline"
                  onClick={() => handlePaymentApp(app.name)}
                  className={`h-10 text-xs font-medium ${app.color === "bg-foreground/10" ? "" : "text-white hover:text-white"} ${app.color} hover:opacity-90 border-0`}
                >
                  <span className="mr-1">{app.icon}</span>
                  {app.name}
                </Button>
              ))}
            </div>
          ) : (
            /* Desktop: Show QR button and QR code */
            <div className="space-y-3">
              <Button
                onClick={handleShowQR}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full h-9 sm:h-10 text-sm"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </Button>

              {showQR && amount && parseFloat(amount) > 0 && (
                <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={generateUPILink()}
                    size={180}
                    level="H"
                    includeMargin
                  />
                  <p className="text-xs text-gray-600 text-center">
                    Scan with any UPI app to pay ₹{amount}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {UPI_ID}
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="text-[10px] sm:text-xs text-muted-foreground text-center pt-2">
            UPI: {UPI_ID}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
