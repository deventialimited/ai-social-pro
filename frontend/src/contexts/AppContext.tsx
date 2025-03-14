// @ts-nocheck

// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import { ExtendedUser } from "../types/UserTypes";

interface AuthContextProps {
  extendedUser: ExtendedUser | null;
  setExtendedUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  extendedUser: null,
  setExtendedUser: () => {},
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    // Implement your authentication logic here
  };

  const signInWithEmail = async (email: string, password: string) => {
    // Implement your authentication logic here
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    // Implement your authentication logic here
  };

  const logout = async () => {
    // Implement your logout logic here
  };

  const contextValue = {
    extendedUser,
    setExtendedUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
