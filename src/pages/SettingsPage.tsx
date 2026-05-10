import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onPasswordChange = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/auth/change-password', data);
      if (response.data.success) {
        toast.success('Password changed successfully!', { id: 'change-password' });
        reset();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password', { id: 'change-password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="secondary" 
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={32} color="var(--primary)" />
          Account Settings
        </h1>

        <div className="glass" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)'
            }}>
              {user?.email[0].toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>{user?.email}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>User ID: {user?.id} • Role: {user?.role}</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} /> Change Password
            </h4>


            <form onSubmit={handleSubmit(onPasswordChange)}>
              <label>Current Password</label>
              <input 
                type="password" 
                {...register('oldPassword', { required: 'Current password is required' })} 
                placeholder="Enter current password"
              />
              {errors.oldPassword && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{errors.oldPassword.message as string}</p>}

              <label>New Password</label>
              <input 
                type="password" 
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })} 
                placeholder="Enter new password"
              />
              {errors.newPassword && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{errors.newPassword.message as string}</p>}

              <button type="submit" className="primary" style={{ marginTop: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {user?.interests && user.interests.length > 0 && (
          <div className="glass" style={{ padding: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Your Interests</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {user.interests.map((interest, idx) => (
                <span key={idx} style={{ 
                  padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '1rem', fontSize: '0.8125rem', border: '1px solid var(--border)'
                }}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
