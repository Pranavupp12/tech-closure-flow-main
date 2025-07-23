
import React, { useState } from "react";
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
import { Response, Review } from "@/lib/data";
import { generateId } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface ReviewResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: Response | null;
  onSubmitReview: (review: Review, action: 'reject' | 'approve') => void;
}

const ReviewResponseModal: React.FC<ReviewResponseModalProps> = ({
  isOpen,
  onClose,
  response,
  onSubmitReview,
}) => {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const resetForm = () => {
    setComments("");
  };

  const handleSubmit = async (action: 'reject' | 'approve') => {
    if (!user || !response) return;
    
    setIsSubmitting(true);
    
    const newReview: Review = {
      id: generateId(),
      responseId: response.id,
      taskId: response.taskId,
      projectId: response.projectId,
      comments: comments.trim(),
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
      status: action === 'approve' ? 'final-review' : 'rejected',
    };

   try {
    const res = await fetch("http://localhost:3000/api/review/postreview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newReview),
    });

    if (!res.ok) {
      throw new Error("Failed to submit review");
    }

    onSubmitReview(newReview, action);

  } catch (error) {
    console.error("Review submission error:", error);
    // Optionally show a toast or error message here
  } finally {
    resetForm();
    setIsSubmitting(false);
    onClose();
  }
  };

  if (!response) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Response</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your comments (optional for approval, required for rejection)"
              rows={6}
            />
          </div>
          
          {/* Mock file upload field */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <Input id="attachments" type="file" multiple />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="destructive" 
            onClick={() => handleSubmit('reject')}
            disabled={isSubmitting || (comments.trim() === '')}
          >
            {isSubmitting ? "Submitting..." : "Send Back to Assignee"}
          </Button>
          <Button 
            type="button"
            onClick={() => handleSubmit('approve')}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Move to Final Sign-off"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewResponseModal;
