import { createContext, useContext, useState, type ReactNode } from "react";

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

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem("userId")
  );
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("username")
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = (data: AuthResponse) => {
    // Persist all identity fields so state survives a hard refresh
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", data.username);
    setToken(data.token);
    setUserId(data.userId);
    setUsername(data.username);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
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
