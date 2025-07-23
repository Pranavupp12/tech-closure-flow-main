
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTasks, getProjects, getCustomers, getResponses, getReviews, getFinals } from "@/lib/storage";
import { Task, Project, Response, Review, Final, users } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProjectDetails from "@/components/common/ProjectDetails";
import TaskDetails from "@/components/common/TaskDetails";
import ResponseDetails from "@/components/common/ResponseDetails";
import ReviewDetails from "@/components/common/ReviewDetails";
import FinalDetails from "@/components/common/FinalDetails";

const TechnicalTaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [final, setFinal] = useState<Final | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //  Fetch task from backend
        const taskRes = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
        const taskData = await taskRes.json();
        if (!taskData.task) throw new Error("Task not found");
        setTask(taskData.task);
        console.log("Fetched task:", taskData.task);
        console.log("Assignees type:", typeof taskData.task.assignees);
        console.log("Assignees value:", taskData.task.assignees);


        //  Fetch related project
        const projectRes = await fetch(`http://localhost:3000/api/tasks/projects/${taskData.task.projectId}`);
        const projectData = await projectRes.json();
        setProject(projectData.project);

        // 3. Load response if exists
        const responseRes = await fetch(`http://localhost:3000/api/response/by-task?taskId=${taskId}`);
        if (responseRes.ok) {
          const { response } = await responseRes.json();
          setResponse(response);

          if (response) {
            // 4. Load review if exists
            const reviewRes = await fetch(`http://localhost:3000/api/resId?responseId=${response.id}`);
            if (reviewRes.ok) {
              const { review } = await reviewRes.json();
              setReview(review);

              if (review) {
                // 5. Load final if exists
                const finalRes = await fetch(`http://localhost:3000/api/revId?reviewId=${review.id}`);
                if (finalRes.ok) {
                  const { final } = await finalRes.json();
                  setFinal(final);
                } else {
                  setFinal(null);
                }
              } else {
                setFinal(null);
              }
            } else {
              setReview(null);
              setFinal(null);
            }
          } else {
            setReview(null);
            setFinal(null);
          }
        } else {
          setResponse(null);
          setReview(null);
          setFinal(null);
        }
      } catch (e) {
        setTask(null);
        setProject(null);
        setResponse(null);
        setReview(null);
        setFinal(null);
        // Optionally: set error message
        console.error(e);
      }
    };

    if (taskId) fetchData();
  }, [taskId]);


  if (!task || !project) {
    return (
      <Layout allowedRoles={["technical"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Task not found</h1>
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["technical"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Task Journey</h1>
          <Link to={`/technical/project/${project.id}`}>
            <Button variant="outline">Back to Project</Button>
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Project Information</h2>
          <ProjectDetails project={project} customers={getCustomers()} />

          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6">Task Information</h2>
            <TaskDetails task={task} users={users} />
          </div>

          {response && (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Assignee's Response</h2>
              <ResponseDetails response={response} />
            </div>
          )}

          {review && (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Reviewer's Assessment</h2>
              <ReviewDetails review={review} />
            </div>
          )}

          {final && (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Final Approval</h2>
              <FinalDetails final={final} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TechnicalTaskDetails;
