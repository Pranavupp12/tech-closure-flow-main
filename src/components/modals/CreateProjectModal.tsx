
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Customer, Project } from "@/lib/data";
import { generateId } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onCreateProject: (project: Project) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  customer,
  onCreateProject,
}) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [inlineInspection, setInlineInspection] = useState(false);
  const [qapCriteria, setQapCriteria] = useState(false);
  const [plant, setPlant] = useState<Project["plant"] | undefined>(undefined);
const [product, setProduct] = useState<Project["product"] | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const resetForm = () => {
    setTitle("");
    setDetails("");
    setStartDate(undefined);
    setEndDate(undefined);
    setInlineInspection(false);
    setQapCriteria(false);
    setPlant(undefined);
    setProduct(undefined);
  };

// posting project details to sql
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim() || !details.trim() || !startDate || !endDate || !plant || !product || !user || !customer) return;

  setIsSubmitting(true);

  const newProject: Project = {
    id: generateId(),
    customerId: customer.id,
    title: title.trim(),
    details: details.trim(),
    startDate: startDate.toISOString().slice(0, 19).replace("T", " "), // MySQL DATETIME fix
    endDate: endDate.toISOString().slice(0, 19).replace("T", " "),
    inlineInspection,
    qapCriteria,
    plant,
    product,
    createdBy: user.id,
    createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    status: "active",
  };

  try {
    const res = await fetch("http://localhost:3000/api/sales/createproject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProject),
    });

    if (!res.ok) {
      throw new Error("Failed to create project");
    }

    const data = await res.json();
    console.log("Project created:", data);

    onCreateProject(newProject); // Optional: update frontend state
    resetForm();
    setIsSubmitting(false);
    onClose();
  } catch (err) {
    console.error("Error creating project:", err);
    setIsSubmitting(false);
  }
};


  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project for {customer.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" value={customer.name} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Project Details</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter project details"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Delivery Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Delivery End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="inlineInspection" 
                  checked={inlineInspection} 
                  onCheckedChange={setInlineInspection} 
                />
                <Label htmlFor="inlineInspection">Inline Inspection</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="qapCriteria" 
                  checked={qapCriteria} 
                  onCheckedChange={setQapCriteria} 
                />
                <Label htmlFor="qapCriteria">QAP Criteria</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plant">Plant</Label>
                <Select required onValueChange={(value) => setPlant(value as Project["plant"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEIPL">PEIPL</SelectItem>
                    <SelectItem value="PEPPL">PEPPL</SelectItem>
                    <SelectItem value="PEGEPL 1">PEGEPL 1</SelectItem>
                    <SelectItem value="PEGEPL 2">PEGEPL 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select required onValueChange={(value) => setProduct(value as Project["product"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dual Glass M10 PERC">Dual Glass M10 PERC</SelectItem>
                    <SelectItem value="DUAL GLASS M10 TOPCON">DUAL GLASS M10 TOPCON</SelectItem>
                    <SelectItem value="DUAL GLASS G12R TOPCON">DUAL GLASS G12R TOPCON</SelectItem>
                    <SelectItem value="DUAL GLASS G12 TOPCON">DUAL GLASS G12 TOPCON</SelectItem>
                    <SelectItem value="M10 TRANSPARENT PERC">M10 TRANSPARENT PERC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Mock file upload fields */}
            <div className="space-y-2">
              <Label htmlFor="technicalSpecs">Technical Specifications Document</Label>
              <Input id="technicalSpecs" type="file" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tenderDocument">Tender Document</Label>
              <Input id="tenderDocument" type="file" />
            </div>
            
            {qapCriteria && (
              <div className="space-y-2">
                <Label htmlFor="qapAttachment">QAP Document</Label>
                <Input id="qapAttachment" type="file" required={qapCriteria} />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="otherAttachments">Other Attachments</Label>
              <Input id="otherAttachments" type="file" multiple />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !details.trim() || !startDate || !endDate || !plant || !product}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
