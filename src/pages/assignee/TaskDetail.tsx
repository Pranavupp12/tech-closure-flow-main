
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTasks, getProjects, getCustomers, getResponses, addResponse, updateTask } from "@/lib/storage";
import { Task, Project, Response } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ProjectDetails from "@/components/common/ProjectDetails";
import TaskDetails from "@/components/common/TaskDetails";
import ResponseDetails from "@/components/common/ResponseDetails";
import TaskResponseModal from "@/components/modals/TaskResponseModal";
import { useToast } from "@/components/ui/use-toast";
import { users } from "@/lib/data";

const AssigneeTaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      if (!user || !taskId) return;

      // Fetch all tasks assigned to the assignee
      const taskRes = await fetch(`http://localhost:3000/api/tasks/assignee/${user.id}`);
      const taskData = await taskRes.json();
      const userTasks: Task[] = taskData.tasks;

      // Find the specific task from URL
      const matchedTask = userTasks.find(t => t.id === taskId);
      if (!matchedTask) {
        toast({
          title: "Access Denied",
          description: "Task not found or not assigned to you.",
          variant: "destructive",
        });
        navigate("/assignee/tasks");
        return;
      }
      setTask(matchedTask);

      // Fetch project details
      const projectRes = await fetch(`http://localhost:3000/api/tasks/projects/${matchedTask.projectId}`);
      const projectData = await projectRes.json();
      setProject(projectData.project);

      /* Load response if exists
      const allResponses = getResponses();
      const foundResponse = allResponses.find(r => r.taskId === taskId) || null;
      setResponse(foundResponse);*/

    } catch (err) {
      console.error("Failed to load data:", err);
      toast({
        title: "Error",
        description: "Something went wrong while loading task details.",
        variant: "destructive",
      });
    }
  };

  fetchData();
}, [user, taskId, navigate, toast]);



  const handleSubmitResponse =  async (newResponse: Response) => {
    if (!task) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "review" }),
    });

    if (!res.ok) throw new Error("Failed to update task status");

    //refetching task with updated status
    const updatedTaskRes = await fetch(`http://localhost:3000/api/tasks/${task.id}`);
    const updatedTaskData = await updatedTaskRes.json();
    setTask(updatedTaskData.task);

    toast({
      title: "Response Submitted",
      description: "Your response has been submitted for review.",
    });

    } catch (error) {
       toast({
      title: "Update Error",
      description: "Could not update task status.",
      variant: "destructive",
    });
    }
    
  };

  if (!task || !project || !user) {
    return (
      <Layout allowedRoles={["assignee"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Loading task details...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["assignee"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Task Details</h1>
          <Link to="/assignee/tasks">
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
          
          {response ? (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Your Response</h2>
              <ResponseDetails response={response} />
            </div>
          ) : (
            <div className="border-t pt-8 mt-8 flex justify-center">
              <Button 
                onClick={() => setIsResponseModalOpen(true)}
                className="bg-assignee hover:bg-violet-700"
              >
                Submit Response
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <TaskResponseModal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        task={task}
        onSubmitResponse={handleSubmitResponse}
      />
    </Layout>
  );
};

export default AssigneeTaskDetail;
