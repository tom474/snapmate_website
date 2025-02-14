import { useContext } from 'react';
import { ToastContext } from '../context/ToastProvider';

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw Error('useToast can only be used within ToastProvider');
  return context;
};

export default useToast;
