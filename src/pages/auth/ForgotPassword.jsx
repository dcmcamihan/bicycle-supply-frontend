import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import API_ENDPOINTS from '../../config/api';

const ForgotPassword = () => {
  const [username, setUsername] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [token, setToken] = React.useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setToken('');
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_REQUEST_RESET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Request failed');
      setToken(data.token);
    } catch (e) {
      setError(e?.message || 'Failed to request reset');
    } finally { setLoading(false); }
  };

  const goToReset = () => {
    if (token) navigate(`/reset-password?token=${encodeURIComponent(token)}`);
  };

  return (
    <>
      <Helmet><title>Forgot Password - Jolens BikeShop</title></Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-raised">
          <h1 className="text-2xl font-heading font-bold mb-1">Forgot password</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your username to request a reset token.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Input label="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
            <Button type="submit" variant="default" loading={loading} disabled={loading}>Request reset</Button>
          </form>
          {token && (
            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-2">Demo token (normally sent via email/SMS):</p>
              <div className="bg-muted p-3 rounded text-xs break-all border border-border">{token}</div>
              <Button className="mt-3" onClick={goToReset}>Continue to reset</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
