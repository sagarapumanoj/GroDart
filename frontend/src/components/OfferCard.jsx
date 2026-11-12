import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function OfferCard({ offer }) {
  const { notify } = useCart();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify(`Your code is ${offer.code}`);
    }
  };

  return (
    <article className="flex flex-col justify-between rounded-xl border-2 border-dashed border-turmeric bg-white p-5">
      <div>
        <h3 className="text-lg font-bold">{offer.title}</h3>
        <p className="mt-1 text-sm text-muted">{offer.description}</p>
        {offer.expiresAt && (
          <p className="mt-2 text-xs text-muted">Valid till {new Date(offer.expiresAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-lg bg-leaf-50 px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-leaf-900">{offer.code}</span>
        <button onClick={copy} className="rounded-lg border border-leaf-600 px-3 py-1.5 text-sm font-semibold text-leaf-800 hover:bg-leaf-50">
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
    </article>
  );
}
