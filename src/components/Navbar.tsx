import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Settings, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully', { id: 'logout-success' });
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="nav-logo">
          NotesPro
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link to="/notes" className="nav-link">
                <LayoutDashboard size={18} />
                <span>My Notes</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                  <User size={18} />
                  <span>Admin</span>
                </Link>
              )}
              <Link to="/settings" className="nav-link">
                <Settings size={20} />
              </Link>
              <button onClick={handleLogout} className="nav-btn-logout">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="nav-link nav-btn-primary">
                <UserPlus size={18} />
                <span>Join Now</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
