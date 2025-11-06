import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';
import * as api from '../services/apiService';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  initialUrl: string;
  errorMessage: string | null;
}

// Helper to safely get the display URL without the /api suffix
const getDisplayUrl = (url: string): string => {
    let cleanUrl = url;
    if (cleanUrl.endsWith('/api')) {
        cleanUrl = cleanUrl.slice(0, -4);
    }
    if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1);
    }
    return cleanUrl;
};


const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSave, initialUrl, errorMessage }) => {
  const [url, setUrl] = useState(getDisplayUrl(initialUrl));
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  useEffect(() => {
    setUrl(getDisplayUrl(initialUrl));
  }, [initialUrl]);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestError('');
    const success = await api.testApiConnection(url);
    if (success) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
      setTestError("Impossibile connettersi. Verifica l'URL e che il server sia attivo.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(getDisplayUrl(url));
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Configurazione Backend</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                L'applicazione ha bisogno di comunicare con il server backend. Inserisci l'indirizzo <code className="text-xs bg-slate-100 dark:bg-slate-700 p-1 rounded">https</code> del tuo server fornito da ngrok.
            </p>

            {errorMessage && testStatus !== 'success' && (
                 <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 text-sm rounded-md">
                    {errorMessage.includes("configurato") ? "Il backend non è ancora stato configurato." : `Errore di connessione: ${errorMessage}`}
                </div>
            )}
            
            <div>
                <label htmlFor="ngrok-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL del Server (ngrok)</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      id="ngrok-url"
                      value={url}
                      onChange={(e) => {
                          setUrl(e.target.value);
                          setTestStatus('idle');
                          setTestError('');
                      }}
                      className="block w-full flex-1 rounded-none rounded-l-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="https://esempio.ngrok-free.app"
                      required
                    />
                    <button type="button" onClick={handleTestConnection} className="relative inline-flex items-center space-x-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                        {testStatus === 'testing' && <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {testStatus === 'success' && <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                        {testStatus === 'error' && <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
                        {testStatus === 'idle' && <span>Test</span>}
                    </button>
                </div>
                {testStatus === 'success' && <p className="mt-2 text-sm text-green-600">Connessione riuscita!</p>}
                {testStatus === 'error' && <p className="mt-2 text-sm text-red-600">{testError}</p>}
            </div>

            <div className="flex justify-end pt-6">
                <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400" disabled={testStatus !== 'success'}>
                  Salva e Riconnetti
                </button>
            </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ConfigModal;