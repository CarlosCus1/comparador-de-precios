import React, { useState, useCallback } from 'react';
import { Tooltip } from '@mui/material';
import { useSessionTimer } from '../../hooks/useSessionTimer';
import { useToasts } from '../../hooks/useToasts';
import { useAppStore } from '../../store/useAppStore';
import { useBackendSync } from '../../hooks/useBackendSync';
import { useCatalogSync } from '../../hooks/useCatalogSync';
import { SessionTimeoutModal } from '../SessionTimeoutModal';
import { formatearFecha } from '../../utils/dateUtils';

interface SessionTimerProps {
  onTimeout?: () => void;
  enableBackendSync?: boolean;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ onTimeout, enableBackendSync = true }) => {
  const { catalogCount } = useAppStore();
  const { addToast } = useToasts();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { backendStatus, syncWithBackend } = useBackendSync(enableBackendSync);
  const { lastCatalogUpdate } = useCatalogSync(enableBackendSync, backendStatus);

  const handleTimeout = useCallback(() => {
    addToast('Sesión expirada por inactividad', 'warning');
    onTimeout?.();
  }, [addToast, onTimeout]);

  const handleWarning = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const { timeConnected, isActive, resetTimer } = useSessionTimer({
    onTimeout: handleTimeout,
    onWarning: handleWarning,
    timeoutMinutes: 30,
    warningMinutes: 1,
  });

  const handleStay = () => {
    resetTimer();
    setIsModalOpen(false);
  };

  const handleResetWithSync = useCallback(() => {
    resetTimer();
    if (backendStatus.isActive) {
      syncWithBackend(0);
    }
  }, [resetTimer, backendStatus.isActive, syncWithBackend]);

  return (
    <>
      <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-600/50 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center justify-between">
          {/* Left Group: Status Indicators */}
          <div className="flex items-center gap-4">
            <Tooltip title={`Sesión activa. Timeout en 30 minutos de inactividad.`}>
              <div className="flex items-center gap-2 cursor-help">
                <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                  }`} />
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{timeConnected}</span>
              </div>
            </Tooltip>

            {enableBackendSync && (
              <Tooltip title={backendStatus.isActive ? `Backend disponible. Última verificación: ${backendStatus.lastSync?.toLocaleTimeString() || 'N/A'}` : 'Backend fuera de línea'}>
                <div className="hidden sm:flex items-center gap-2 cursor-help">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${backendStatus.isActive ? 'text-green-500' : 'text-red-500'}`}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
                  <span>{backendStatus.isActive ? 'En línea' : 'Fuera de línea'}</span>
                </div>
              </Tooltip>
            )}

            {lastCatalogUpdate && (
              <Tooltip title={`Última actualización: ${formatearFecha(lastCatalogUpdate)} ${lastCatalogUpdate.toLocaleTimeString('es-PE')}, Total: ${catalogCount} productos`}>
                <div className="hidden sm:flex items-center gap-2 cursor-help">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                  <span>{catalogCount} items</span>
                </div>
              </Tooltip>
            )}
          </div>

          {/* Right Group: Actions */}
          <div className="flex items-center gap-3">
            {backendStatus.error && (
              <Tooltip title={`Error de conexión con el backend: ${backendStatus.error}`}>
                <span className="text-red-500 dark:text-red-400 text-xs cursor-help">ERROR</span>
              </Tooltip>
            )}

            <Tooltip title="Reiniciar temporizador de sesión">
              <button
                onClick={handleResetWithSync}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <SessionTimeoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogout={handleTimeout}
        onStay={handleStay}
        countdownSeconds={60}
      />
    </>
  );
};

export default SessionTimer;
