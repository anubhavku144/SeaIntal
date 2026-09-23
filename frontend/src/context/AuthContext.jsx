import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API_URL = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
      setUser(res.data);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password, organization) => {
    const res = await axios.post(
      `${API_URL}/auth/register`,
      { name, email, password, organization },
      { withCredentials: true }
    );
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
