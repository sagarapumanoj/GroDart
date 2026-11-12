import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import OfferCard from '../components/OfferCard';

export default function Offers() {
  const [offers, setOffers] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/offers').then((r) => setOffers(r.data.offers)).catch(() => setError(true));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Offers for you</h1>
      <p className="mt-1 text-muted">Copy a code and enter it at checkout. Delivery is already free on orders of ₹299 or more.</p>
      {error && <p className="mt-6 text-chili">We could not load offers. Refresh to try again.</p>}
      {offers && offers.length === 0 && (
        <p className="mt-6 text-muted">No offers right now. <Link className="underline" to="/shop">Browse the shop</Link> and check back soon.</p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers?.map((o) => <OfferCard key={o._id} offer={o} />)}
      </div>
    </div>
  );
}
