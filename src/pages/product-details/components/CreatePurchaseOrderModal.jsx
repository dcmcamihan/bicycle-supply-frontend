import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import API_ENDPOINTS from '../../../config/api';

const CreatePurchaseOrderModal = ({ isOpen, onClose, productId, supplierId: supplierIdProp, onCreated }) => {
  const [supplierId, setSupplierId] = React.useState(supplierIdProp || '');
  const [quantity, setQuantity] = React.useState('');
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0,10));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loadingSupplier, setLoadingSupplier] = React.useState(false);
  const [supplier, setSupplier] = React.useState(null);
  const [supplierContacts, setSupplierContacts] = React.useState([]);
  const [showAllContacts, setShowAllContacts] = React.useState(false);

  const contactsToShow = React.useMemo(() => {
    if (showAllContacts) return supplierContacts;
    // Group by contact type, prefer primary in each group
    const groups = new Map();
    for (const c of supplierContacts) {
      const key = String(c.contact_type || c.type || 'Other').toLowerCase();
      const existing = groups.get(key);
      if (!existing) {
        groups.set(key, c);
      } else {
        const a = existing;
        const b = c;
        // prefer primary; otherwise keep first
        if (!a.is_primary && b.is_primary) groups.set(key, b);
      }
    }
    return Array.from(groups.values());
  }, [supplierContacts, showAllContacts]);

  React.useEffect(() => {
    const loadSupplier = async () => {
      if (!isOpen) return;
      setError('');
      setLoading(false);
      if (supplierIdProp) { setSupplierId(String(supplierIdProp)); return; }
      // Auto-detect supplier from latest supply containing the product
      setLoadingSupplier(true);
      try {
        const supRes = await fetch(API_ENDPOINTS.SUPPLIES);
        const supplies = supRes.ok ? await supRes.json() : [];
        let latest = null;
        for (const sup of supplies) {
          try {
            const detRes = await fetch(API_ENDPOINTS.SUPPLY_DETAILS_BY_SUPPLY(sup.supply_id));
            if (!detRes.ok) continue;
            const dets = await detRes.json();
            if (dets?.some(d => Number(d.product_id) === Number(productId))) {
              const d = new Date(sup.supply_date || 0);
              if (!latest || d > latest.date) latest = { date: d, supplier_id: sup.supplier_id };
            }
          } catch {}
        }
        if (latest?.supplier_id) setSupplierId(String(latest.supplier_id));
      } finally {
        setLoadingSupplier(false);
      }
    };
    loadSupplier();
  }, [isOpen, productId, supplierIdProp]);

  // Load supplier info and contacts for messaging
  React.useEffect(() => {
    const loadInfo = async () => {
      if (!isOpen || !supplierId) { setSupplier(null); setSupplierContacts([]); return; }
      try {
        // Supplier basic
        try {
          const sRes = await fetch(API_ENDPOINTS.SUPPLIER(Number(supplierId)));
          if (sRes.ok) setSupplier(await sRes.json());
        } catch {}
        // Contacts (filter client-side by supplier_id)
        try {
          const cRes = await fetch(API_ENDPOINTS.SUPPLIER_CONTACTS);
          if (cRes.ok) {
            const all = await cRes.json();
            const list = (all || []).filter(c => String(c.supplier_id) === String(supplierId));
            // sort primary first if field exists
            list.sort((a,b) => (b.is_primary?1:0) - (a.is_primary?1:0));
            setSupplierContacts(list);
          }
        } catch {}
      } catch {}
    };
    loadInfo();
  }, [isOpen, supplierId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!supplierId) { setError('No supplier found for this product. Please assign a supplier first.'); return; }
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) { setError('Quantity must be greater than 0'); return; }
    setLoading(true);
    try {
      // Create supply (required fields per backend model)
      const supplyPayload = {
        supplier_id: Number(supplierId),
        supply_date: date,
        payment_method_code: 'CASH',
        sale_attendant: 6,
        manager: 13,
      };
      const supRes = await fetch(API_ENDPOINTS.SUPPLIES, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplyPayload)
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
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-heading font-semibold mb-2">Create Purchase Order</h3>
        <p className="text-sm text-muted-foreground mb-4">Record a supplier reorder for this product.</p>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Input label="Supplier ID" value={supplierId} onChange={()=>{}} disabled required />
          {supplier && (
            <div className="text-xs text-muted-foreground -mt-2">{supplier.supplier_name}</div>
          )}
          <Input label="Quantity" type="number" min={1} value={quantity} onChange={e=>setQuantity(e.target.value)} required />
          <Input label="Supply Date" type="date" value={date} onChange={e=>setDate(e.target.value)} required />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>

        {/* Supplier Contact */}
        <div className="mt-5 border-t border-border pt-4">
          <h4 className="font-body font-semibold text-sm text-foreground mb-2">Contact Supplier</h4>
          {supplierContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No supplier contact details found.</p>
          ) : (
            <div className="space-y-2">
              {contactsToShow.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{c.contact_type || c.type || 'Contact'}</span>
                    {c.is_primary ? <span className="ml-2 text-xs text-success">Primary</span> : null}
                    <div className="text-muted-foreground">{c.contact_value || c.value}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {String(c.contact_value || c.value).includes('@') ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const mailto = `mailto:${c.contact_value || c.value}?subject=${encodeURIComponent('Reorder Request')}&body=${encodeURIComponent('Hello,\n\nWe would like to place a reorder for product #' + productId + '.\nQuantity: ' + quantity + '\nPreferred delivery: ' + date + '\n\nThank you.')}`;
                          window.location.href = mailto;
                        }}
                        iconName="Mail"
                        iconSize={14}
                      >Email</Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { window.location.href = `sms:${c.contact_value || c.value}`; }}
                          iconName="MessageCircle"
                          iconSize={14}
                        >Message</Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { window.location.href = `tel:${c.contact_value || c.value}`; }}
                          iconName="Phone"
                          iconSize={14}
                        >Call</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {supplierContacts.length > contactsToShow.length && (
                <div className="pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowAllContacts(v => !v)}>
                    {showAllContacts ? 'Hide contacts' : 'Show all contacts'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderModal;
