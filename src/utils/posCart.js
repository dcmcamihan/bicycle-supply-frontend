// Simple POS cart utility using localStorage
// Stored key: 'pos_cart' - array of { id, name, price, quantity, stock, image_url }
export const CART_KEY = 'pos_cart';

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read cart from localStorage', e);
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(Array.isArray(cart) ? cart : []));
    // notify same-window listeners that the cart changed
    try {
      const total = (Array.isArray(cart) ? cart : []).reduce((s, it) => s + (it.quantity || 0), 0);
      window.dispatchEvent(new CustomEvent('pos_cart_updated', { detail: { total } }));
    } catch (e) {
      // ignore
    }
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
}

export function clearCart() {
  try {
    localStorage.removeItem(CART_KEY);
  } catch (e) {
    console.error('Failed to clear cart', e);
  }
}

// Add product to cart: increments quantity if already present. Returns the updated cart.
export function addToCart(product) {
  try {
    const cart = getCart();
    if (!product || (!product.id && product.id !== 0)) return cart;
    const pid = product.id;
    const existing = cart.find(item => String(item.id) === String(pid));
    if (existing) {
      // Respect stock if provided
      const max = existing.stock != null ? existing.stock : (product.stock != null ? product.stock : Infinity);
      if (existing.quantity < max) {
        existing.quantity = (existing.quantity || 0) + 1;
      }
    } else {
      const item = {
        id: pid,
        name: product.name || product.product_name || String(pid),
        price: Number(product.price || product.unit_price || 0) || 0,
        quantity: 1,
        stock: product.stock != null ? product.stock : null,
        image_url: product.image_url || product.image || product.imageUrl || ''
      };
      cart.push(item);
    }
    saveCart(cart);
    return cart;
  } catch (e) {
    console.error('addToCart failed', e);
    return getCart();
  }
}

export function getCartTotalCount() {
  try {
    const cart = getCart();
    return cart.reduce((sum, it) => sum + (it.quantity || 0), 0);
  } catch (e) {
    return 0;
  }
}
