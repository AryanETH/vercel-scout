import { useState, useEffect } from "react";
import { Heart, X, Smartphone, Monitor, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { analytics } from "@/lib/analytics";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [amount, setAmount] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const upiId = "6260976807-3@ybl";
  const upiBaseUrl = "upi://pay?pa=6260976807-3@ybl&pn=Supporting%20Yourel&cu=INR";

  useEffect(() => {
    // Detect if user is on mobile
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        // Restore scrolling
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const generateQRCode = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    // Track QR generation attempt
    analytics.track('click', { 
      element: 'qr_generate_button', 
      amount: amount,
      device: 'desktop'
    });
    
    setIsGeneratingQR(true);
    try {
      const upiUrl = `upi://pay?pa=${upiId}&pn=Supporting%20Yourel&am=${amount}&cu=INR&tn=Supporting%20Yourel`;
      
      // Try using the QRCode library first
      try {
        const qrUrl = await QRCode.toDataURL(upiUrl, {
          width: 128,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (libraryError) {
        console.warn('QRCode library failed, using API fallback:', libraryError);
        
        // Fallback to QR API service
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(upiUrl)}`;
        setQrCodeUrl(apiUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      
      // Final fallback - show UPI URL as text
      alert(`Please use this UPI URL in your payment app:\n\nupi://pay?pa=${upiId}&pn=Supporting%20Yourel&am=${amount}&cu=INR&tn=Supporting%20Yourel`);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleMobilePayment = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    // Track payment attempt
    analytics.track('click', { 
      element: 'mobile_payment_button', 
      amount: amount,
      device: 'mobile'
    });
    
    const upiUrl = `${upiBaseUrl}&am=${amount}&tn=Supporting%20Yourel`;
    
    // Try to open UPI apps with proper message formatting
    const paymentApps = [
      // PhonePe specific format
      `phonepe://pay?pa=${upiId}&pn=Supporting%20Yourel&am=${amount}&cu=INR&tn=Supporting%20Yourel`,
      // Paytm specific format  
      `paytmmp://pay?pa=${upiId}&pn=Supporting%20Yourel&am=${amount}&cu=INR&tn=Supporting%20Yourel`,
      // Google Pay specific format
      `tez://upi/pay?pa=${upiId}&pn=Supporting%20Yourel&am=${amount}&cu=INR&tn=Supporting%20Yourel`,
      // BHIM and other UPI apps
      `bhim://pay?pa=${upiId}&pn=Supporting%20Yourel&am=${amount}&cu=INR&tn=Supporting%20Yourel`,
      // Generic UPI URL (fallback)
      upiUrl
    ];

    // Try each payment app
    paymentApps.forEach((url, index) => {
      setTimeout(() => {
        window.location.href = url;
      }, index * 100);
    });
  };

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="glass-liquid rounded-2xl p-5 w-full max-w-sm mx-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Support Yourel</h2>
              <p className="text-sm text-muted-foreground">Help us keep the service running</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Device Type Indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isMobile ? (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Mobile Payment</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                <span>Desktop Payment</span>
              </>
            )}
          </div>

          {/* Quick Amount Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Quick Select Amount (₹)</label>
            <div className="grid grid-cols-3 gap-2">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`p-2 rounded-lg border transition-colors text-sm ${
                    amount === amt.toString()
                      ? 'glass-liquid-button bg-blue-600 text-white border-blue-600'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in rupees"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Payment Section */}
          {isMobile ? (
            /* Mobile Payment Button */
            <button
              onClick={handleMobilePayment}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full glass-liquid-button bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Pay ₹{amount || "0"} via UPI
            </button>
          ) : (
            /* Desktop QR Code */
            <div className="space-y-4">
              <button
                onClick={generateQRCode}
                disabled={!amount || parseFloat(amount) <= 0 || isGeneratingQR}
                className="w-full glass-liquid-button bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                {isGeneratingQR ? "Generating QR..." : `Generate QR for ₹${amount || "0"}`}
              </button>

              {qrCodeUrl && (
                <div className="text-center space-y-2">
                  <div className="bg-white p-3 rounded-lg inline-block">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-32 h-32" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Scan with any UPI app to pay ₹{amount}</p>
                    <p className="text-xs mt-1">PhonePe • Google Pay • Paytm • BHIM</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPI ID Display */}
          <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
            <p>UPI ID: {upiId}</p>
            <p className="mt-1">Thank you for supporting Yourel! ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
}