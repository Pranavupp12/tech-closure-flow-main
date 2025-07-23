
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
import { Review, Final } from "@/lib/data";
import { generateId } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface FinalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onSubmitFinal: (final: Final, action: 'reject' | 'approve') => void;
}

const FinalReviewModal: React.FC<FinalReviewModalProps> = ({
  isOpen,
  onClose,
  review,
  onSubmitFinal,
}) => {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const resetForm = () => {
    setComments("");
  };

  const handleSubmit = async (action: 'reject' | 'approve') => {
    if (!user || !review) return;
    
    setIsSubmitting(true);
    
    const newFinal: Final = {
      id: generateId(),
      reviewId: review.id,
      responseId: review.responseId,
      taskId: review.taskId,
      projectId: review.projectId,
      comments: comments.trim(),
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
      status: action === 'approve' ? 'closed' : 'rejected',
    };

     try {
    // Pass to parent handler to update UI state
    onSubmitFinal(newFinal, action);
  } catch (err) {
    console.error("Final review submission error:", err);
    // Show toast here if needed
  } finally {
    resetForm();
    setIsSubmitting(false);
    onClose();
  }

  };

  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Final Review</DialogTitle>
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
            {isSubmitting ? "Submitting..." : "Send Back to Review"}
          </Button>
          <Button 
            type="button"
            onClick={() => handleSubmit('approve')}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Approve & Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinalReviewModal;
