import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: 'M',
    birth_date: '',
    username: '',
    password: '',
    confirm: ''
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const onChange = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name,
        gender: form.gender,
        birth_date: form.birth_date,
        username: form.username,
        password: form.password,
      });
      navigate('/dashboard');
    } catch (err) {
      alert(err?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Jolens BikeShop</title>
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-raised">
          <h1 className="text-2xl font-heading font-bold mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join Jolens BikeShop to manage sales and inventory.</p>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First name" value={form.first_name} onChange={e=>onChange('first_name', e.target.value)} error={errors.first_name} required />
              <Input label="Last name" value={form.last_name} onChange={e=>onChange('last_name', e.target.value)} error={errors.last_name} required />
            </div>
            <Input label="Middle name" value={form.middle_name} onChange={e=>onChange('middle_name', e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select className="w-full bg-input border border-border rounded-lg px-3 py-2" value={form.gender} onChange={e=>onChange('gender', e.target.value)}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Birth date</label>
                <input type="date" className="w-full bg-input border border-border rounded-lg px-3 py-2" value={form.birth_date} onChange={e=>onChange('birth_date', e.target.value)} />
              </div>
            </div>
            <Input label="Username" value={form.username} onChange={e=>onChange('username', e.target.value)} error={errors.username} required />
            <Input label="Password" type="password" value={form.password} onChange={e=>onChange('password', e.target.value)} error={errors.password} required />
            <Input label="Confirm password" type="password" value={form.confirm} onChange={e=>onChange('confirm', e.target.value)} error={errors.confirm} required />
            <Button type="submit" variant="default" size="lg" loading={loading}>Create account</Button>
            <p className="text-xs text-muted-foreground">By signing up, you agree to our Terms and Privacy Policy.</p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
