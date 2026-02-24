import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onStay: () => void;
  countdownSeconds?: number;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  onStay,
  countdownSeconds = 60
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownSeconds);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, countdownSeconds, onLogout]);

  const handleStay = () => {
    onStay();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¿Sigues ahí?">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Tu sesión está a punto de expirar por inactividad.
        </p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
          {countdown} segundos
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleStay} variant="primary">
            Permanecer conectado
          </Button>
          <Button onClick={onLogout} variant="outline">
            Cerrar sesión
          </Button>
        </div>
      </div>
    </Modal>
  );
};