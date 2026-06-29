import { createContext, useContext, useState, ReactNode } from "react";

interface AuthResponse {
  message: string;
  token: string;
  userId: string;
  username: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  userId: string | null;
  username: string | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUserId(data.userId);
    setUsername(data.username);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ userId, username, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
