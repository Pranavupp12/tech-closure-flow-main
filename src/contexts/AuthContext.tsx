
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/data";
import { getCurrentUser, saveCurrentUser } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

 //login connected to mysql
 const login = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    console.log('Server response status:', response.status); 
    if (!response.ok) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      return null;
    }

    const data = await response.json();
    console.log('Received user data:', data);

    setUser(data.user);
    saveCurrentUser(data.user);

    toast({
      title: "Login Successful",
      description: `Welcome back, ${data.user.name}!`,
    });

    return data.user;

  } catch (error) {
    console.error("Login error:", error);
    toast({
      title: "Error",
      description: "Server error occurred",
      variant: "destructive",
    });
    return null;
  }
};


  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
