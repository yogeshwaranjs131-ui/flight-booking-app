import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Check if token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setIsAuthenticated(true);
          setIsAdmin(decodedUser.role === "admin");
        } else {
          // Token expired
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (formData) => {
    try {
      const { data } = await api.post("/auth/login", formData);
      localStorage.setItem("token", data.token);
      const decodedUser = jwtDecode(data.token);
      setUser(decodedUser);
      setIsAuthenticated(true);
      setIsAdmin(decodedUser.role === "admin");
      return decodedUser; // Return user data to the component
    } catch (error) {
      console.error("Login failed in context:", error);
      // Re-throw the error so the component can handle it and display a message
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
