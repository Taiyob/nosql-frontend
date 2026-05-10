import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axiosConfig';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgetPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = React.useState({ type: '', text: '' });
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      const response = await api.post('/auth/forget-password', data);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Reset link sent to your email!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Something went wrong' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="glass" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <button onClick={() => navigate('/login')} style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Login
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '1rem', background: 'rgba(99, 102, 241, 0.1)', marginBottom: '1rem' }}>
            <Mail size={32} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>Forgot Password?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter your User ID to receive a reset link</p>
        </div>

        {message.text ? (
          <div style={{ 
            padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? '#10b981' : '#ef4444'
          }}>
            {message.text}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <label>User ID</label>
            <input 
              {...register('id', { required: 'User ID is required' })} 
              placeholder="e.g. U-0001"
            />
            {errors.id && <p style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.id.message as string}</p>}
            
            <button type="submit" className="primary" style={{ width: '100%', marginTop: '1rem' }}>
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
