
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CompletedProjects from "./pages/CompletedProjects";
import ProjectDetails from "./pages/ProjectDetails";
import CompletedProjectDetails from "./pages/sales/CompletedProjectDetails";

// Technical role pages
import TechnicalProjectDetails from "./pages/technical/ProjectDetails";
import TechnicalTaskDetails from "./pages/technical/TaskDetails";

// Assignee role pages
import AssigneeTasks from "./pages/assignee/TasksList";
import AssigneeTaskDetail from "./pages/assignee/TaskDetail";

// Reviewer role pages
import ReviewerTasks from "./pages/reviewer/TasksList";
import ReviewerTaskDetail from "./pages/reviewer/TaskDetail";

// Final role pages
import FinalTasksList from "./pages/final/TasksList";
import FinalTaskDetail from "./pages/final/TaskDetail";
import Analytics from "./pages/final/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/completed-projects" element={<CompletedProjects />} />
            <Route path="/project/:projectId" element={<ProjectDetails />} />
            <Route path="/completed-project/:projectId" element={<CompletedProjectDetails />} />

            {/* Technical role routes */}
            <Route path="/technical/project/:projectId" element={<TechnicalProjectDetails />} />
            <Route path="/technical/task/:taskId" element={<TechnicalTaskDetails />} />

            {/* Assignee role routes */}
            <Route path="/assignee/tasks" element={<AssigneeTasks />} />
            <Route path="/assignee/task/:taskId" element={<AssigneeTaskDetail />} />

            {/* Reviewer role routes */}
            <Route path="/reviewer/tasks" element={<ReviewerTasks />} />
            <Route path="/reviewer/task/:taskId" element={<ReviewerTaskDetail />} />

            {/* Final role routes */}
            <Route path="/final/tasks" element={<FinalTasksList />} />
            <Route path="/final/task/:taskId" element={<FinalTaskDetail />} />
            <Route path="/final/analytics" element={<Analytics />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
