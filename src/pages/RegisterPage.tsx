import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const payload = {
        password: data.password,
        user: {
          email: data.email,
          interests: data.interests.split(',').map((i: string) => i.trim())
        }
      };

      const response = await api.post('/users/register', payload);
      if (response.data.success) {
        toast.success(`Registration successful! ID: ${response.data.data.id}`, { id: 'register-success', duration: 6000 });
        navigate('/login');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed', { id: 'register-error' });
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
      <div className="glass animate-fade" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            borderRadius: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            marginBottom: '1rem'
          }}>
            <UserPlus size={32} color="#10b981" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join us to start taking secure notes</p>
        </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label>Email Address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="name@example.com"
              />
              {errors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{errors.email.message as string}</p>}
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                placeholder="••••••••"
              />
              {errors.password && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{errors.password.message as string}</p>}
            </div>

            <div>
              <label>Interests (comma separated)</label>
              <input
                {...register('interests', { required: 'At least one interest is required' })}
                placeholder="chess, reading, coding"
              />
              {errors.interests && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{errors.interests.message as string}</p>}
            </div>

            <button type="submit" className="primary" disabled={isSubmitting} style={{ width: '100%', background: '#10b981', borderColor: '#10b981' }}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
