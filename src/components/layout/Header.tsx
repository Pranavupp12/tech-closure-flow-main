
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { getColorForRole } from "@/lib/utils";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Premier Energies
        </Link>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="font-medium">{user.name}</p>
              <div className={`text-xs px-2 py-1 rounded-full ${getColorForRole(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
