"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginApi, signupApi } from "@/services/auth.services";
import toast from "react-hot-toast";

interface AuthContextType {
    login: (formData: unknown) => Promise<void>;
    signup: (formData: unknown) => Promise<void>;
    authUser: unknown;
    isLoggingIn: boolean;
    isSigningUp: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);    

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [authUser, setAuthUser] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [ isSigningUp, setIsSigningUp] = useState(false);

  // For logging in with email and password
  const login = async (formData: unknown) => {
    try {
      setIsLoggingIn(true);

      const data = await loginApi(formData as { email: string; password: string });

      // Store token
      localStorage.setItem("token", data.token);
      Cookies.set("token", data.token, { expires: 7 });

      setAuthUser(data.user);

      toast.success("Logged in successfully");

      router.push("/");

    } catch (err: unknown) {
      // Normalize error message from different error shapes (Error, AxiosError, string, etc.)
      let message = "Login failed";

      if (typeof err === "string") {
        message = err;
      } else if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === "object" && "response" in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        message = axiosErr?.response?.data?.message || message;
      }

      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // For signing up
  const signup = async (formData: unknown) => {
  try {
    setIsSigningUp(true);

    const data = await signupApi(formData);

    localStorage.setItem("token", data.token);
    Cookies.set("token", data.token, { expires: 7 });

    setAuthUser(data.user);

    toast.success("Account created successfully");

    router.push("/");

  } catch (err: unknown) {
    // Normalize error message from different error shapes (Error, AxiosError, string, etc.)
    let message = "Signup failed";

    if (typeof err === "string") {
      message = err;
    } else if (err instanceof Error) {
      message = err.message;
    } else if (err && typeof err === "object" && "response" in err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosErr = err as any;
      message = axiosErr?.response?.data?.message || message;
    }

    toast.error(message);
  } finally {
    setIsSigningUp(false);
  }
};

  return (
    <AuthContext.Provider value=
    {{ 
        login, 
        signup,
        authUser, 
        isLoggingIn, 
        isSigningUp,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// export const useAuth = () => useContext(AuthContext);
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
