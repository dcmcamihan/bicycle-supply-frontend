import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import API_ENDPOINTS from '../../config/api';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const tokenParam = params.get('token') || '';
  const [token, setToken] = React.useState(tokenParam);
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_RESET, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Reset failed');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (e) { setError(e?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Reset Password - Jolens BikeShop</title></Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-raised">
          <h1 className="text-2xl font-heading font-bold mb-1">Reset password</h1>
          <p className="text-sm text-muted-foreground mb-6">Paste your token and set a new password.</p>
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}
            {success && <div className="text-sm text-success">Password reset successful. Redirecting…</div>}
            <Input label="Token" value={token} onChange={e=>setToken(e.target.value)} required />
            <Input label="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <Input label="Confirm password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
            <Button type="submit" variant="default" loading={loading} disabled={loading}>Reset password</Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
