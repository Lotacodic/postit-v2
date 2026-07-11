import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import { loadGoogleScript } from "../utils/loadGoogleScript";

interface AuthResponse {
  message: string;
  token: string;
  userId: string;
  username: string;
  email: string;
  avatar: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export default function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    loadGoogleScript()
      .then(() => {
        if (!window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const { data } = await client.post<AuthResponse>("/auth/google", {
                credential: response.credential,
              });
              login(data);
              navigate("/feed");
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                console.error(err.response?.data?.message ?? "Google sign-in failed.");
              } else {
                console.error("Google sign-in failed.");
              }
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 360,
        });
      })
      .catch((err) => console.error(err));
  }, [login, navigate]);

  return <div ref={buttonRef} />;
}
