import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const EMPTY = { items: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0, freeDeliveryAbove: 299 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = 'ok') => setToast({ message, tone, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!user) { setCart(EMPTY); return; }
    api.get('/cart').then((r) => setCart(r.data.cart)).catch(() => {});
  }, [user]);

  // Wraps a cart-mutating call: updates state, reports errors
  const run = async (fn, okMessage) => {
    try {
      const r = await fn();
      setCart(r.data.cart);
      if (okMessage) notify(typeof okMessage === 'function' ? okMessage(r.data) : okMessage);
      return r.data;
    } catch (e) {
      notify(errMsg(e), 'error');
      return null;
    }
  };

  const addProduct = (p, quantity = 1) =>
    run(() => api.post('/cart/add', { productId: p._id, quantity }), `${p.name} added to cart`);
  const setQuantity = (productId, quantity) => run(() => api.patch(`/cart/item/${productId}`, { quantity }));
  const removeItem = (productId) => run(() => api.delete(`/cart/item/${productId}`));
  const clear = () => run(() => api.delete('/cart'));
  const addRecipe = (recipe, servings, exclude) =>
    run(
      () => api.post('/cart/add-recipe', { recipeId: recipe._id, servings, exclude }),
      (d) => `${recipe.name} kit added: ${d.added} items${d.skipped.length ? `, ${d.skipped.length} unavailable` : ''}`
    );

  return (
    <CartContext.Provider value={{ cart, addProduct, setQuantity, removeItem, clear, addRecipe, notify, toast, setCart }}>
      {children}
    </CartContext.Provider>
  );
}
