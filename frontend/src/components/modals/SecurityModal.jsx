// SecurityModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';

export const SecurityModal = ({ title, subtitle, isOpen, onClose, children, type = "default", icon: Icon }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`bg-card border-2 border-primary w-full max-w-md p-8 shadow-offset-primary-lg relative`}
          >
            <div className="flex justify-between items-start mb-8 border-b-2 border-primary pb-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                  {type === 'danger' ? <ShieldAlert className="text-danger" size={20} /> : (Icon && <Icon size={20} />)}
                  {title}
                </h3>
                <p className="text-compact font-black uppercase tracking-widest text-subtle">{subtitle}</p>
              </div>
              <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};