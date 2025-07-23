
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getTasks,
  getProjects,
  getCustomers,
  getResponses,
  getReviews,
  addFinal,
  updateTask,
  updateResponse,
  updateReview,
  updateProject
} from "@/lib/storage";
import { Task, Project, Response, Review, Final } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProjectDetails from "@/components/common/ProjectDetails";
import TaskDetails from "@/components/common/TaskDetails";
import ResponseDetails from "@/components/common/ResponseDetails";
import ReviewDetails from "@/components/common/ReviewDetails";
import FinalReviewModal from "@/components/modals/FinalReviewModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { users } from "@/lib/data";

const FinalTaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFinalTaskDetails = async () => {
      if (!taskId) return;

      try {
        // Task
        const resTask = await fetch(`http://localhost:3000/api/tasks/tasks/${taskId}`);
        if (!resTask.ok) throw new Error("Failed to fetch task");
        const taskData = await resTask.json();
        setTask(taskData)

        // Project
        const resProject = await fetch(`http://localhost:3000/api/tasks/projects/${taskData.projectId}`);
        if (!resProject.ok) throw new Error("Failed to fetch project");
        const projectData = await resProject.json();
        setProject(projectData.project);

        // Response
        const resResponse = await fetch(`http://localhost:3000/api/response/by-task?taskId=${taskId}`);
        const responseData = await resResponse.json();
        console.log(responseData);

        const r = responseData.response;
        let matchedResponse = null;

        if (
          r &&
          (r.status === "review" || r.status === "final-review") &&
          r.projectId === taskData.projectId
        ) {
          matchedResponse = r;
        }

        if (!matchedResponse) throw new Error("No response found with review status");

        setResponse(matchedResponse);

        // Review
        const resReview = await fetch(`http://localhost:3000/api/review?responseId=${matchedResponse.id}&status=final-review,closed`);
        const reviewData = await resReview.json();
        if (!reviewData.review) throw new Error("No review found");
        setReview(reviewData.review);

      } catch (error) {
        console.error("Final task load error:", error);
        toast({
          title: "Error",
          description: "Failed to load final task details",
          variant: "destructive",
        });
        navigate("/final/tasks");
      }
    };

    fetchFinalTaskDetails();
  }, [taskId, navigate, toast]);

  const handleSubmitFinal = async (newFinal: Final, action: 'reject' | 'approve') => {
    if (!task || !response || !review || !project || !user) return;

    try {
      // 1. Save final approval
      await fetch("http://localhost:3000/api/review/finalrev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFinal),
      });

      // 2. Prepare updated statuses
      const updatedTask = { ...task, status: action === 'approve' ? 'closed' : 'review' };
      const updatedResponse = { ...response, status: action === 'approve' ? 'closed' : 'review' };
      const updatedReview = { ...review, status: action === 'approve' ? 'closed' : 'rejected' };

      // 3. Update task
      await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      // 4. Update response
      await fetch(`http://localhost:3000/api/response/${response.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedResponse),
      });

      // 5. Update review
      await fetch(`http://localhost:3000/api/review/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedReview),
      });

      // 6. If approved, also close the project
      if (action === 'approve') {
        const updatedProject = { ...project, status: 'closed' };
        await fetch(`http://localhost:3000/api/tasks/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProject),
        });
      }

      // 7. Show toast and redirect
      toast({
        title: action === 'approve' ? "Task Approved & Closed" : "Sent Back for Review",
        description: action === 'approve'
          ? "The task has been approved and marked as closed."
          : "The task has been sent back to reviewers for further assessment.",
      });

      setTimeout(() => {
        navigate("/final/tasks");
      }, 1500);
    } catch (error) {
      console.error("Final approval submission failed:", error);
      toast({
        title: "Error",
        description: "Failed to submit final decision",
        variant: "destructive",
      });
    }
  };


  if (!task || !project || !response || !review) {
    return (
      <Layout allowedRoles={["final"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Loading task details...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["final"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Final Approval</h1>
          <Link to="/final/tasks">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Project Information</h2>
          <ProjectDetails project={project} customers={getCustomers()} />

          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">Task Information</h2>
            <TaskDetails task={task} users={users} />
          </div>

          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">Assignee's Response</h2>
            <ResponseDetails response={response} />
          </div>

          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">Reviewer's Assessment</h2>
            <ReviewDetails review={review} />
          </div>

          <div className="border-t pt-8 mt-8 flex justify-center">
            <Button
              onClick={() => setIsFinalModalOpen(true)}
              className="bg-final hover:bg-red-600"
            >
              Provide Final Approval
            </Button>
          </div>
        </div>
      </div>

      <FinalReviewModal
        isOpen={isFinalModalOpen}
        onClose={() => setIsFinalModalOpen(false)}
        review={review}
        onSubmitFinal={handleSubmitFinal}
      />
    </Layout>
  );
};

export default FinalTaskDetail;
