import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Globe, Cpu, MessageSquare, Heart } from 'lucide-react';

const Footer = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // GATEKEEPER: Hide footer for guest landing to allow gestures to breathe
  const hideFooterPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];

  if (!user && hideFooterPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="bg-card border-t border-muted pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
          
          {/* Brand & Mission */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg text-primary-foreground shadow-sm shadow-primary/20">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">Skillinex</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering developers through AI-driven roadmaps and precision-based learning tracks to master any technical skill.
            </p>
          </div>

          {/* Learning Platform */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-xs uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3 text-sm text-soft font-medium">
              <li><Link to="/learning-vault" className="hover:text-primary transition-colors">Learning Vault</Link></li>
              <li><Link to="/practice" className="hover:text-primary transition-colors">Practice</Link></li>
              <li><Link to="/test" className="hover:text-primary transition-colors">Test Lab</Link></li>
            </ul>
          </div>

          {/* User Support */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-xs uppercase tracking-widest">Support</h4>
            <ul className="space-y-3 text-sm text-soft font-medium">
              <li><span aria-disabled="true" className="text-subtle">Documentation (coming soon)</span></li>
              <li><span aria-disabled="true" className="text-subtle">Privacy Policy (coming soon)</span></li>
              <li><span aria-disabled="true" className="text-subtle">Terms of Service (coming soon)</span></li>
            </ul>
          </div>

          {/* Community Connect */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-xs uppercase tracking-widest">Connect</h4>
            <div className="flex gap-3">
              {/* Main Website / Docs */}
              <a href="https://skillinex.ai" target="_blank" rel="noopener noreferrer" aria-label="Skillinex website" className="...">
                <Globe size={20} />
              </a>
              
              {/* Organization GitHub / Dev Updates */}
              <a href="https://github.com/skillinex-org" target="_blank" rel="noopener noreferrer" aria-label="Skillinex on GitHub" className="...">
                <Cpu size={20} />
              </a>
              
              {/* Community / Telegram / Discord */}
              <a href="https://t.me/skillinex_community" target="_blank" rel="noopener noreferrer" aria-label="Skillinex community" className="...">
                <MessageSquare size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-surface flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-detail text-subtle font-bold uppercase tracking-widest">
            © {currentYear} Skillinex AI. All rights reserved.
          </p>
          <p className="text-xs text-subtle flex items-center gap-1 font-medium bg-surface px-3 py-1 rounded-full border border-muted">
            Built with <Heart size={12} className="text-danger fill-danger" /> by <span className="font-bold text-primary-hover ml-1">HackSmiths</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;