import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Lock } from 'lucide-react';

const ResetPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = React.useState({ type: '', text: '' });

  const id = searchParams.get('id');
  const token = searchParams.get('token');

  const onSubmit = async (data: any) => {
    try {
      const response = await api.post(`/auth/reset-password`, {
        id,
        newPassword: data.newPassword
      }, {
        headers: { Authorization: token }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reset password' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="glass" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '1rem', background: 'rgba(99, 102, 241, 0.1)', marginBottom: '1rem' }}>
            <Lock size={32} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Set your new secure password</p>
        </div>

        {message.text && (
          <div style={{ 
            padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? '#10b981' : '#ef4444'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <label>New Password</label>
          <input 
            type="password" 
            {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Min 6 characters' } })} 
            placeholder="••••••••"
          />
          {errors.newPassword && <p style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.newPassword.message as string}</p>}
          
          <button type="submit" className="primary" style={{ width: '100%', marginTop: '1rem' }}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
