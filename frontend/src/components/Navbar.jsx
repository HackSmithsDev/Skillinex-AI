import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LogOut, User, BookOpen, Home, 
  GraduationCap, Swords, FileText, Trophy, LayoutDashboard 
} from 'lucide-react';

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 🛡️ GATEKEEPER: Keep these to ensure the Nav doesn't overlap 
  // cinematic landing pages or auth screens.
  const hideNavbarPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
  
  // If no user is logged in AND we are on one of these paths, hide the Nav.
  if (!user && hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Learning Vault', path: '/learning-vault', icon: <GraduationCap size={18} /> },
    { name: 'Practice', path: '/practice', icon: <FileText size={18} /> },
    { name: 'Test Lab', path: '/test', icon: <Swords size={18} /> },
    { name: 'Achievements', path: '/achievements', icon: <Trophy size={18} /> },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 py-3 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="bg-primary p-1.5 rounded-lg shadow-md shadow-primary/20">
             <BookOpen className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Skillinex</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`text-sm font-semibold flex items-center gap-2 transition-colors ${
                  location.pathname === link.path ? 'text-primary' : 'text-slate-500 hover:text-primary'
                }`}
              >
                {link.icon} {link.name}
              </Link>
            ))}
          </div>

          {/* User Actions - Only visible if user exists */}
          {user && (
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <Link 
                to="/profile" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-all"
              >
                <User size={16} className="text-slate-400" />
                {user.full_name?.split(' ')[0] || 'User'}
              </Link>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;