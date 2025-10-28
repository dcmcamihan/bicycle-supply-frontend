import React, { useState } from 'react';
import API_ENDPOINTS from '../../../config/api';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PaymentMethods = ({ total, cartItems = [], onPaymentComplete, disabled }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showCashModal, setShowCashModal] = useState(false);
  const [amountTendered, setAmountTendered] = useState('');
  const [allowShortPayment, setAllowShortPayment] = useState(false);

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
    setSelectedMethod(method);
    // If cash, open tender input modal
    if ((method?.payment_method_code || '').toUpperCase() === 'CASH' || (method?.name || '').toLowerCase().includes('cash')) {
      setShowCashModal(true);
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing for non-cash
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
    }, 800);
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

      {/* Cash tender modal (rendered outside the buttons list) */}
      {showCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCashModal(false); setAmountTendered(''); setAllowShortPayment(false); }} />
          <div className="relative w-11/12 max-w-md bg-card border border-border rounded-lg p-4 shadow-xl z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-lg">Cash Payment</h3>
              <button className="text-sm text-muted-foreground" onClick={() => { setShowCashModal(false); setAmountTendered(''); setAllowShortPayment(false); }}>Close</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Items</label>
                <div className="max-h-40 overflow-y-auto border rounded p-2 bg-white">
                  {cartItems?.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No items</div>
                  ) : (
                    cartItems.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start py-1 text-sm">
                        <div className="w-2/3">
                          <div className="font-medium truncate">{it?.name || it?.product_name || `Item ${it?.id}`}</div>
                          <div className="text-xs text-muted-foreground">x{it?.quantity}</div>
                        </div>
                        <div className="w-1/3 text-right">
                          {new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format((it?.price || 0) * (it?.quantity || 0))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Total Due</label>
                <div className="font-heading font-bold text-2xl">{new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(calculateDiscountedTotal())}</div>
              </div>
              <div>
                <label className="block text-sm mb-1">Amount Tendered</label>
                <Input type="number" value={amountTendered} onChange={(e) => setAmountTendered(e?.target?.value)} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm mb-1">Change</label>
                <div className={`font-medium ${Number(amountTendered || 0) >= calculateDiscountedTotal() ? 'text-success' : 'text-destructive'}`}>
                  {isNaN(Number(amountTendered)) ? '-' : new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(Number(amountTendered || 0) - calculateDiscountedTotal())}
                </div>
              </div>
              {Number(amountTendered || 0) < calculateDiscountedTotal() && (
                <div className="text-sm text-destructive">Tendered amount is less than total due.</div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allowShort" checked={allowShortPayment} onChange={(e) => setAllowShortPayment(e.target.checked)} />
                <label htmlFor="allowShort" className="text-sm">Allow short/partial payment (record outstanding)</label>
              </div>
              <div className="flex justify-end space-x-2">
                <button className="btn" onClick={() => { setShowCashModal(false); setAmountTendered(''); setAllowShortPayment(false); }}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {
                  const tender = Number(amountTendered || 0);
                  const totalDue = calculateDiscountedTotal();
                  if (!allowShortPayment && tender < totalDue) {
                    alert('Insufficient payment. Either increase amount tendered or enable "Allow short/partial payment"');
                    return;
                  }
                  // Compute change (may be negative if short and allowed)
                  const change = +(tender - totalDue).toFixed(2);
                  setIsProcessing(true);
                  // simulate processing
                  setTimeout(() => {
                    onPaymentComplete({
                      method: 'CASH',
                      amount: totalDue,
                      amountTendered: tender,
                      change,
                      shortPayment: tender < totalDue,
                      items: cartItems,
                      timestamp: new Date().toISOString()
                    });
                    setIsProcessing(false);
                    setSelectedMethod(null);
                    setShowCashModal(false);
                    setAmountTendered('');
                    setAllowShortPayment(false);
                  }, 500);
                }}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default PaymentMethods;