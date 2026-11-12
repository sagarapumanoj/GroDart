import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-30 max-w-[90vw] -translate-x-1/2 rounded-xl px-5 py-3 font-medium shadow-lg ${
        toast.tone === 'error' ? 'bg-chili text-white' : 'bg-leaf-900 text-white'}`}>
      {toast.message}
    </div>
  );
}
