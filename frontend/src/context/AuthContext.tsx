import { createContext, useContext, useState, ReactNode } from "react";
import { User, AuthResponse } from "../types/index";

// This interface defines exactly what the context will expose to any component
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

// createContext() builds the "container". We pass `null` as the default
// because no user is logged in when the app first loads.
const AuthContext = createContext<AuthContextType | null>(null);

// This component WRAPS your entire app and makes auth state available
// everywhere. { children } means "whatever is nested inside this component".
export function AuthProvider({ children }: { children: ReactNode }) {
  // useState holds our live data. When these change, React re-renders
  // every component that is reading from this context.
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") // Rehydrate from localStorage on page refresh
  );

  // login() is called after a successful API response
  // It saves the token to localStorage AND updates React state
  const login = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  // logout() wipes everything — localStorage and React state
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Instead of importing useContext + AuthContext in every file,
// components just call useAuth() — clean and simple.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
