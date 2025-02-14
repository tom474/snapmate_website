import { useContext } from 'react';
import AuthContext from '../context/AuthProvider';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw Error('useAuth can only be used within AuthProvider');
  return context;
};

export default useAuth;
