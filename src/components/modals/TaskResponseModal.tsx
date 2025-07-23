
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Response } from "@/lib/data";
import { generateId } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/common/FileUpload";
import { StoredDocument, addDocument } from "@/lib/documentStorage";

interface TaskResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmitResponse: (response: Response) => void;
}

const TaskResponseModal: React.FC<TaskResponseModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmitResponse,
}) => {
  const [comments, setComments] = useState("");
  const [attachments, setAttachments] = useState<StoredDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const resetForm = () => {
    setComments("");
    setAttachments([]);
  };
// taking response from the assignee and storing it in database
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!comments.trim() || !user || !task) return;

  setIsSubmitting(true);

  // Store documents locally if needed
  attachments.forEach(doc => addDocument(doc));

  const newResponse: Response = {
    id: generateId(),
    taskId: task.id,
    projectId: task.projectId,
    comments: comments.trim(),
    attachments: attachments.map(doc => doc.id),
    respondedBy: user.id,
    respondedAt: new Date().toISOString(),
    status: "review",
  };

  try {
    const res = await fetch('http://localhost:3000/api/response/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResponse),
    });

    if (!res.ok) throw new Error("Failed to submit response");

    onSubmitResponse(newResponse); // local update
    resetForm();
    onClose();
  } catch (err) {
    console.error("Error submitting response:", err);
  } finally {
    setIsSubmitting(false);
  }
};


  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Response for Task: {task.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter your comments"
                rows={6}
                required
              />
            </div>
            
            <FileUpload
              label="Response Attachments"
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
              disabled={isSubmitting || !comments.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskResponseModal;
