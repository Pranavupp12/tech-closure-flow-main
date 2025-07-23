
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getTasks,
  getProjects,
  getCustomers,
  getResponses,
  addReview,
  updateTask,
  updateResponse
} from "@/lib/storage";
import { Task, Project, Response, Review } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProjectDetails from "@/components/common/ProjectDetails";
import TaskDetails from "@/components/common/TaskDetails";
import ResponseDetails from "@/components/common/ResponseDetails";
import ReviewResponseModal from "@/components/modals/ReviewResponseModal";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { users } from "@/lib/data";

const ReviewerTaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId) return;

      try {
        // Step 1: Fetch the task
        const resTask = await fetch(`http://localhost:3000/api/tasks/tasks/${taskId}`);
        const taskData = await resTask.json();
        console.log(taskData);

        if (!resTask.ok || !taskData) {
          throw new Error("Task not found");
        }

        const task = taskData;
        setTask(task);

        // Step 2: Fetch the project using the task's projectId
        const resProject = await fetch(`http://localhost:3000/api/tasks/projects/${taskData.projectId}`);
        const projectData = await resProject.json();

        if (!resProject.ok || !projectData.project) {
          throw new Error("Project not found");
        }

        setProject(projectData.project);

        // Step 3: Fetch the response with status=review for this task
        const resResponse = await fetch(
          `http://localhost:3000/api/response?taskId=${taskId}&status=review`
        );
        const responseData = await resResponse.json();

        if (!resResponse.ok || !responseData.response) {
          toast({
            title: "No Response Found",
            description: "No response requiring review was found for this task.",
            variant: "destructive",
          });
          return navigate("/reviewer/tasks");
        }

        setResponse(responseData.response);
      } catch (error) {
        console.error("Error loading task details:", error);
        toast({
          title: "Error",
          description: "Failed to load task details.",
          variant: "destructive",
        });
        navigate("/reviewer/tasks");
      }
    };

    fetchTaskDetails();
  }, [taskId, navigate, toast]);



  const handleSubmitReview = async (newReview: Review, action: 'reject' | 'approve') => {
    console.log("handleSubmitReview called", { newReview, action });
    if (!task || !response || !user) return;

    try {
      // Add review
      addReview(newReview);

      // Update task and response status
      let updatedTaskStatus: 'pending' | 'in-progress' | 'review' | 'final-review' | 'closed' | 'rejected';
      let updatedResponseStatus: 'review' | 'final-review' | 'rejected' | 'closed';

      if (action === 'approve') {
        updatedTaskStatus = 'final-review';
        updatedResponseStatus = 'final-review';
      } else {
        updatedTaskStatus = 'in-progress';
        updatedResponseStatus = 'rejected';
      }

      // 3. Update TASK STATUS in the backend
      const taskRes = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updatedTaskStatus }),
      });
      if (!taskRes.ok) throw new Error("Failed to update task status");

      // 4. Update RESPONSE STATUS in the backend
      const responseRes = await fetch(`http://localhost:3000/api/response/${response.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updatedResponseStatus }),
      });
      if (!responseRes.ok) throw new Error("Failed to update response status");


      toast({
        title: action === 'approve' ? "Sent for Final Approval" : "Sent Back to Assignee",
        description: action === 'approve'
          ? "The task has been forwarded for final sign-off."
          : "The task has been sent back to the assignee for revision.",
      });

      // Redirect back to tasks list after short delay
      setTimeout(() => {
        navigate("/reviewer/tasks");
      }, 1500);

    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update task/response status in backend.",
        variant: "destructive",
      });
    }
  };

  if (!task || !project || !response) {
    return (
      <Layout allowedRoles={["reviewer"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Loading task details...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["reviewer"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Review Task</h1>
          <Link to="/reviewer/tasks">
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

          <div className="border-t pt-8 mt-8 flex justify-center">
            <Button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-reviewer hover:bg-amber-600"
            >
              Review Response
            </Button>
          </div>
        </div>
      </div>

      <ReviewResponseModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        response={response}
        onSubmitReview={handleSubmitReview}
      />
    </Layout>
  );
};

export default ReviewerTaskDetail;
