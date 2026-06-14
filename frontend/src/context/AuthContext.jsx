import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../config/api'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const response = await api.get('/verifySession');
        if (response.data.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyUserSession();
  }, []);

  const loginContext = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logoutContext = async () => {
    try {
      await api.post('/logout'); 
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, loginContext, logoutContext, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);