import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

const input = 'mt-1 w-full rounded-lg border border-line bg-white px-3 py-3 text-lg';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/';
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const call = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };

  const sendOtp = (e) => {
    e.preventDefault();
    call(async () => {
      const r = await api.post('/auth/send-otp', { phone });
      setDevOtp(r.data.devOtp || '');
      setStep('otp');
    });
  };

  const verify = (e) => {
    e.preventDefault();
    call(async () => {
      const r = await api.post('/auth/verify-otp', { phone, otp, name });
      login(r.data.token, r.data.user);
      navigate(from, { replace: true });
    });
  };

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="text-3xl font-bold">Log in or sign up</h1>
      <p className="mt-1 text-muted">We'll text you a 6-digit code. No password needed.</p>

      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="mt-6">
          <label className="block text-sm font-medium">Mobile number
            <input required inputMode="numeric" pattern="[6-9]\d{9}" maxLength={10} className={input} value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} autoComplete="tel-national" /></label>
          {error && <p role="alert" className="mt-3 text-chili">{error}</p>}
          <button disabled={busy} className="mt-4 w-full rounded-xl bg-leaf-900 py-3 font-semibold text-white disabled:opacity-50">Send code</button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6">
          <p className="text-sm">Code sent to <strong>{phone}</strong>. <button type="button" className="underline" onClick={() => setStep('phone')}>Change</button></p>
          {devOtp && <p className="mt-2 rounded-lg bg-turmeric/25 p-2 text-sm">Dev mode: your code is <strong>{devOtp}</strong></p>}
          <label className="mt-4 block text-sm font-medium">6-digit code
            <input required inputMode="numeric" pattern="\d{6}" maxLength={6} className={input} value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" /></label>
          <label className="mt-3 block text-sm font-medium">Your name (new accounts)
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
          {error && <p role="alert" className="mt-3 text-chili">{error}</p>}
          <button disabled={busy} className="mt-4 w-full rounded-xl bg-leaf-900 py-3 font-semibold text-white disabled:opacity-50">Verify and continue</button>
        </form>
      )}
    </div>
  );
}
