import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)'
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              position: 'relative',
              zIndex: 1,
              background: 'var(--card-bg)',
              textAlign: 'center'
            }}
          >
            <button 
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                padding: '0.5rem',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <AlertTriangle size={32} color={type === 'danger' ? 'var(--danger)' : 'var(--primary)'} />
            </div>

            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>{title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{message}</p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={onClose}
                className="secondary"
                style={{ flex: 1 }}
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  if (!isLoading) onClose();
                }}
                className="primary"
                disabled={isLoading}
                style={{ 
                  flex: 1,
                  background: type === 'danger' ? 'var(--danger)' : 'var(--primary)',
                  borderColor: type === 'danger' ? 'var(--danger)' : 'var(--primary)',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
