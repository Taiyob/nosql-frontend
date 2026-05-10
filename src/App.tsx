import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotesPage from './pages/NotesPage';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';
import ForgetPasswordPage from './pages/ForgetPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isLoading, token } = useAuth();

  // If we're loading and have a token, we must wait for the user profile
  if (isLoading && token) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  // If no token at all, definitely redirect to login
  if (!token) return <Navigate to="/login" />;

  // If we have a token but user profile failed or is still null after loading
  if (!isLoading && !user) return <Navigate to="/login" />;

  if (adminOnly && user?.role !== 'admin') return <Navigate to="/notes" />;

  return children;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, token } = useAuth();

  // If we have a token, wait to see if we should redirect to dashboard
  if (token && (isLoading || user)) {
    if (user) return <Navigate to="/notes" />;
    return null; // or loading spinner
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            backdropFilter: 'blur(8px)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: 'white',
            },
          },
        }}
      />
      <Router>
        <div className="min-h-screen bg-bg">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/forget-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/notes" element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
