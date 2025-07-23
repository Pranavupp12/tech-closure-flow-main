
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Project, User } from "@/lib/data";
import { generateId, getPEPPLAssignees, getOtherAssignees } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import FileUpload from "@/components/common/FileUpload";
import { StoredDocument, addDocument } from "@/lib/documentStorage";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onCreateTask: (task: Task) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  project,
  onCreateTask,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<User[]>([]);
  const [attachments, setAttachments] = useState<StoredDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (project) {
      // Determine which assignees to show based on plant selection
      if (project.plant === 'PEPPL') {
        setAvailableAssignees(getPEPPLAssignees());
      } else {
        setAvailableAssignees(getOtherAssignees());
      }
    }
  }, [project]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setSelectedAssignees([]);
    setAttachments([]);
  };

  const toggleAssignee = (assigneeId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(assigneeId)
        ? prev.filter(id => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !dueDate || selectedAssignees.length === 0 || !user || !project) return;
    
    setIsSubmitting(true);
    
    // Store documents
    attachments.forEach(doc => addDocument(doc));
    
    const newTask: Task = {
      id: generateId(),
      projectId: project.id,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.toISOString(),
      attachments: attachments.map(doc => doc.id),
      assignees: selectedAssignees,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    console.log("Assignees before sending:", selectedAssignees, typeof selectedAssignees);

    onCreateTask(newTask);
    resetForm();
    setIsSubmitting(false);
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task for Project: {project.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Assignee selection */}
            <div className="space-y-2">
              <Label>Assignees</Label>
              {availableAssignees.length > 0 ? (
                <div className="space-y-2">
                  {availableAssignees.map((assignee) => (
                    <div key={assignee.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignee-${assignee.id}`}
                        checked={selectedAssignees.includes(assignee.id)}
                        onCheckedChange={() => toggleAssignee(assignee.id)}
                      />
                      <label
                        htmlFor={`assignee-${assignee.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {assignee.name} ({assignee.email})
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No assignees available for the selected plant
                </div>
              )}
              {selectedAssignees.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Please select at least one assignee
                </p>
              )}
            </div>
            
            <FileUpload
              label="Task Attachments"
              multiple={true}
              onFilesChange={setAttachments}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                !title.trim() || 
                !description.trim() || 
                !dueDate || 
                selectedAssignees.length === 0
              }
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
