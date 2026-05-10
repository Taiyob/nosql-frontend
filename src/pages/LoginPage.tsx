import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/auth/login', data);
      if (response.data.success) {
        login(response.data.data.accessToken);
        toast.success('Welcome back!', { id: 'login-success' });
        navigate('/notes');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed', { id: 'login-error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <div className="glass animate-fade" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '1rem', 
            background: 'rgba(99, 102, 241, 0.1)',
            marginBottom: '1rem'
          }}>
            <LogIn size={32} color="#6366f1" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login to access your notes</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label>Email</label>
            <input 
              type="email"
              {...register('email', { required: 'Email is required' })} 
              placeholder="Enter your email"
            />
            {errors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{errors.email.message as string}</p>}
          </div>

          <div>
            <label>Password</label>
            <input 
              type="password"
              {...register('password', { required: 'Password is required' })} 
              placeholder="••••••••"
            />
            {errors.password && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{errors.password.message as string}</p>}
          </div>


          <button type="submit" className="primary" disabled={isSubmitting} style={{ width: '100%' }}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/forget-password" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
