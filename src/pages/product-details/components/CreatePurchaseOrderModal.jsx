import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import API_ENDPOINTS from '../../../config/api';

const CreatePurchaseOrderModal = ({ isOpen, onClose, productId, onCreated }) => {
  const [supplierId, setSupplierId] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0,10));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!supplierId) { setError('Supplier ID is required'); return; }
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) { setError('Quantity must be greater than 0'); return; }
    setLoading(true);
    try {
      // Create supply
      const supRes = await fetch(API_ENDPOINTS.SUPPLIES, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier_id: Number(supplierId), supply_date: date, status: 'Received' })
      });
      const supply = await supRes.json();
      if (!supRes.ok) throw new Error(supply?.message || 'Failed to create supply');

      // Create supply_detail
      const detRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supply_id: supply.supply_id, product_id: Number(productId), quantity_supplied: qty })
      });
      const det = await detRes.json();
      if (!detRes.ok) throw new Error(det?.message || 'Failed to add product to supply');

      onCreated?.({ supply, detail: det });
      onClose();
    } catch (e) {
      setError(e?.message || 'Failed to create purchase order');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-heading font-semibold mb-2">Create Purchase Order</h3>
        <p className="text-sm text-muted-foreground mb-4">Add a received supply for this product.</p>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Input label="Supplier ID" value={supplierId} onChange={e=>setSupplierId(e.target.value)} required />
          <Input label="Quantity" type="number" min={1} value={quantity} onChange={e=>setQuantity(e.target.value)} required />
          <Input label="Supply Date" type="date" value={date} onChange={e=>setDate(e.target.value)} required />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderModal;
