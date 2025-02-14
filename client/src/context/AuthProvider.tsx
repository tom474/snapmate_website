import {
  FC,
  PropsWithChildren,
  createContext,
  useState,
  useEffect,
} from 'react';
import { Auth, UserSession } from '../types/userSession';

interface AppContext {
  auth: Auth;
  setAuth: React.Dispatch<React.SetStateAction<Auth>>;
}

const AuthContext = createContext<AppContext | undefined>(undefined);

const getInitialState = () => {
  const currentUser = localStorage.getItem('user');
  return currentUser ? (JSON.parse(currentUser) as Auth) : {};
};

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<Auth>(getInitialState);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(auth));
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
