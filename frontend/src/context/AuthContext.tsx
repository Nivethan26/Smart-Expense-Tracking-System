import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "@/types";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsed = JSON.parse(storedUser);

    // make sure token exists
    if (parsed.token) {
      setUser(parsed);
    } else {
      localStorage.removeItem("user");
    }
  }
  }, []);

  const API_URL = "http://localhost:5000/api/auth"; // your backend URL

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      const userWithToken = { ...data.user, token: data.token };
      setUser(userWithToken);
      localStorage.setItem("user", JSON.stringify(userWithToken));
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      return userWithToken;
    } catch (err: any) {
      toast.error(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  // Register function
  const register = async (name: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      const userWithToken = { ...data.user, token: data.token };
      setUser(userWithToken);
      localStorage.setItem("user", JSON.stringify(userWithToken));
      localStorage.setItem("token", data.token);
      toast.success("Account created successfully!");
      return userWithToken;
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
