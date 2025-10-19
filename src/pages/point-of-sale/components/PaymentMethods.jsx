import React, { useState } from 'react';
import API_ENDPOINTS from '../../../config/api';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PaymentMethods = ({ total, onPaymentComplete, disabled }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  React.useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.PAYMENT_METHODS);
        if (!res.ok) throw new Error('Failed to fetch payment methods');
        const data = await res.json();
        const bgColors = ['bg-success/10', 'bg-primary/10', 'bg-accent/10', 'bg-secondary/10', 'bg-muted/10'];
        const textColors = ['text-success', 'text-primary', 'text-accent', 'text-secondary', 'text-muted-foreground'];
        const shuffledBgColors = bgColors.sort(() => Math.random() - 0.5);
        const shuffledTextColors = textColors.sort(() => Math.random() - 0.5);

        setPaymentMethods(data.map((pm, idx) => {
          const colorIdx = idx % shuffledBgColors.length;
          const textColorIdx = idx % shuffledTextColors.length;
          return {
            ...pm,
            id: pm.payment_method_code,
            name: pm.name,
            description: pm.description,
            icon: pm.icon,
            bgColor: shuffledBgColors[colorIdx],
            iconColor: shuffledTextColors[textColorIdx]
          };
        }));
      } catch {
        setPaymentMethods([]);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Discount codes removed

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    })?.format(price);
  };

  const calculateDiscountedTotal = () => total;

  // Discount handlers removed

  const handlePayment = async (method) => {
    setIsProcessing(true);
    setSelectedMethod(method);
    
    // Simulate payment processing
    setTimeout(() => {
      const finalAmount = calculateDiscountedTotal();
      onPaymentComplete({
        method: method?.payment_method_code,
        amount: finalAmount,
        discount: null,
        timestamp: new Date()?.toISOString()
      });
      setIsProcessing(false);
      setSelectedMethod(null);
    }, 2000);
  };

  const finalTotal = calculateDiscountedTotal();

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-subtle">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Payment</h3>
      
      {/* Total Display */}
      <div className="bg-muted border border-border rounded-lg p-4 mb-6">
        
        <div className="flex justify-between items-center">
          <span className="font-heading font-bold text-xl text-foreground">Total:</span>
          <span className="font-heading font-bold text-2xl text-primary">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>
      {/* Payment Method Buttons */}
      <div className="space-y-3">
        {paymentMethods?.map((method) => (
          <Button
            key={method?.id}
            variant="outline"
            size="lg"
            fullWidth
            disabled={disabled || total === 0}
            loading={isProcessing && selectedMethod?.id === method?.id}
            onClick={() => handlePayment(method)}
            className="justify-start h-16 hover:bg-orange-100"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg ${method?.bgColor} flex items-center justify-center`}>
                <Icon name={method?.icon} size={24} className={method?.iconColor} />
              </div>
              <div className="text-left">
                <div className="font-body font-semibold text-foreground">
                  Pay with {method?.name}
                </div>
                <div className="font-caption text-xs text-muted-foreground">
                  {method?.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
      
    </div>
  );
};

export default PaymentMethods;