"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

// APIs
import { checkAuthApi, googleLoginApi, loginApi, signupApi } from "@/services/auth.services";

// Utility to extract error messages
import { getErrorMessage } from "@/lib/error";

// Interface for User type (you can expand this in user.types.ts)
import { User } from "@/types/user.types";

// Google Login APIs/Creadentials
import { CredentialResponse } from "@react-oauth/google";
import { googleLogout } from "@react-oauth/google";

// Context
import { useGlobalLoading } from "@/context/loading.context";


interface AuthContextType {
  authUser: User | null;

  setAuthUser: (user: User | null) => void;

  isLoggingIn: boolean;
  isSigningUp: boolean;

  checkAuth: () => Promise<void>;
  signup: (formData: unknown) => Promise<void>;
  login: (formData: unknown) => Promise<void>;
  googleLogin: (credentialResponse: CredentialResponse) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);    

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  // Context 
  const { setIsLoading } = useGlobalLoading();
  

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // For logging in with email and password
  const login = async (formData: unknown) => {
    try {
      setIsLoggingIn(true);

      const res = await loginApi(formData as { email: string; password: string });

      // Store token
      localStorage.setItem("token", res.data.token);
      Cookies.set("token", res.data.token, { expires: 7 });

      setAuthUser(res.data.user);

      toast.success("Logged in successfully");

      router.push("/");

    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed"));
      
    } finally {
      setIsLoggingIn(false);
    }
  };

  
// For logging in with Google
    const googleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    // setIsLoading(true);
    
    try {
      setIsLoggingIn(true);
      
      const res = await googleLoginApi(credentialResponse.credential);

      localStorage.setItem("token", res.data.token);
      Cookies.set("token", res.data.token, { expires: 7, sameSite: "Strict" });

      // setUser(jwtDecode(data.token));
      setAuthUser(res.data.user);

      // 👇 Redirect after login
      router.push("/");

      toast.success("Logged in with Google");

    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed"));

    } finally {
      setIsLoggingIn(false);
      // 👇 Add a delay before hiding
      // setTimeout(() => setIsLoading(false), 800);
    }
  };

  // For signing up
  const signup = async (formData: unknown) => {
  try {
    setIsSigningUp(true);

    const res = await signupApi(formData);

    localStorage.setItem("token", res.data.token);
    Cookies.set("token", res.data.token, { expires: 7 });

    setAuthUser(res.data.user);

    toast.success("Account created successfully");

    router.push("/");

  } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Signup failed"));

  } finally {
    setIsSigningUp(false);
  }

};


// For Logging Out
  const logout = async () => {
    
    try {
      // For showing the loading 
      setIsLoading(true);
      
      
      // 🧹 Remove token from everywhere
      localStorage.removeItem("token");
      Cookies.remove("token");
      
      googleLogout();

      setAuthUser(null);
      
      toast.success("Logged out successfully");
      
      // 👇 Redirect after Logout
      router.push("/login");

    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to logout"));
    } 
    finally {
      setIsLoading(false);
    }
  };


// For Checking Auth
  const checkAuth = async () => {
    try {
      const res = await checkAuthApi();

      setAuthUser(res.data);

    } catch (err) {
        toast.error(getErrorMessage(err, "Failed to check auth user"));

    } 
  };


  return (
    <AuthContext.Provider value=
    {{ 
        authUser,
        setAuthUser, 

        isLoggingIn, 
        isSigningUp,

        checkAuth,
        signup,
        login, 
        googleLogin,
        logout,
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
