
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Customer } from "@/lib/data";

interface CustomerTileProps {
  customer: Customer;
  onViewProjects: (customerId: string) => void;
  onCreateProject: (customerId: string) => void;
}

const CustomerTile: React.FC<CustomerTileProps> = ({ 
  customer, 
  onViewProjects, 
  onCreateProject 
}) => {
  const { user } = useAuth();
  const isSales = user?.role === 'sales';

  return (
    <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-4">{customer.name}</h3>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => onViewProjects(customer.id)}
          className="flex-1"
        >
          View Projects
        </Button>
        
        {isSales && (
          <Button 
            variant="default" 
            onClick={() => onCreateProject(customer.id)}
            className="flex-1 bg-sales hover:bg-blue-700"
          >
            Create Project
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CustomerTile;
