import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTasks, getResponses, getReviews, getFinals, getProjects, getCustomers, addCustomer, addProject } from "@/lib/storage";
import { Task, Response, Review, Final, Project, Customer } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import CustomerTile from "@/components/common/CustomerTile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import CreateCustomerModal from "@/components/modals/CreateCustomerModal";
import ViewProjectsModal from "@/components/modals/ViewProjectsModal";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { Badge } from "@/components/ui/badge";
import { formatDate, getUserById } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, FileText, CheckCircle, Clock, TrendingUp, 
  Building2, Package, Calendar, Activity, BarChart3 
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [finals, setFinals] = useState<Final[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const [isViewProjectsModalOpen, setIsViewProjectsModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [assigneeTasks, setAssigneeTasks] = useState<Task[]>([]);

//loading data for final reviewer dashboard

useEffect(() => {
  const fetchFinalReviewerDashboardData = async () => {
    if (user?.role !== "final") return;
    try {
      // 1. Fetch reviews with status = final-review
      const resReviews = await fetch("http://localhost:3000/api/review/reviewstatfinal?status=final-review");
      const reviewData = await resReviews.json();
      const finalReviewList = reviewData.reviews || [];
      setReviews(finalReviewList);

      const finalReviewTaskIds = finalReviewList.map((r: any) => r.taskId);

      // 2. Fetch all tasks
      const resTasks = await fetch("http://localhost:3000/api/tasks/alltasks");
      const taskData = await resTasks.json();
      const allTasks = taskData.tasks || [];

      //  3. Filter only those tasks which are in final-review
      const filteredTasks = allTasks.filter((task: any) =>
        finalReviewTaskIds.includes(task.id)
      );
      setTasks(filteredTasks);

      // 4. Fetch all projects
      const resProjects = await fetch("http://localhost:3000/api/tasks/projects");
      const projectData = await resProjects.json();
      setProjects(projectData.projects || []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    }
  };

  fetchFinalReviewerDashboardData();
}, [user?.role]);

  
//loading data for reviewer dashboard
useEffect(() => {
  const fetchReviewerDashboardData = async () => {
    if (user?.role !== "reviewer") return;

    try {
      // Step 1: Fetch all responses with status = 'review'
      const resResponses = await fetch("http://localhost:3000/api/response/responses");
      const dataResponses = await resResponses.json();
      const reviewResponses = dataResponses.responses || [];
      setResponses(reviewResponses);

      // Step 2: Extract task IDs from those responses
      const taskIds = reviewResponses.map(r => r.taskId);
      if (taskIds.length > 0) {
        const query = taskIds.join(",");
        const resTasks = await fetch(`http://localhost:3000/api/tasks/tasks?ids=${query}`);
        const dataTasks = await resTasks.json();
        setTasks(dataTasks.tasks || []);
      }

      // Fetch all reviews
      const resReviews = await fetch("http://localhost:3000/api/review/allreviews");
      const dataReviews = await resReviews.json();
      setReviews(dataReviews.reviews || []);
    } catch (err) {
      console.error("Error loading reviewer dashboard data:", err);
    }
  };

  fetchReviewerDashboardData();
}, [user?.role]);

//loading tasks for assignees
useEffect(() => {
  const fetchAssigneeTasks = async () => {
    if (user?.role !== "assignee") return;

    try {
      const res = await fetch(`http://localhost:3000/api/tasks/assignee/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");

      const raw = await res.json();
      console.log("Dashboard.tsx:51 assigneeTasks fetched but not an array:", raw);

      // Adjust this based on the actual shape of your response
      const tasksArray = Array.isArray(raw.tasks) ? raw.tasks : (Array.isArray(raw.data) ? raw.data : []);

      setAssigneeTasks(tasksArray);
    } catch (err) {
      console.error("Error fetching assignee tasks:", err);
      setAssigneeTasks([]);
    }
  };

  fetchAssigneeTasks();
}, [user]);


  // Add debugging
  console.log("Dashboard - User:", user);
  console.log("Dashboard - IsAuthenticated:", isAuthenticated);

  useEffect(() => {
    // Load data for all roles
    setCustomers(getCustomers());
    setResponses(getResponses());
    setTasks(getTasks())
    setReviews(getReviews());
    setFinals(getFinals());
    setProjects(getProjects());
  }, []);

  // Handle authentication loading state
  if (!isAuthenticated) {
    console.log("Dashboard - Not authenticated, should redirect");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Handle case where user is authenticated but user object is null
  if (!user) {
    console.log("Dashboard - Authenticated but no user object");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  const handleCreateCustomer = (customer: Customer) => {
    addCustomer(customer);
    setCustomers(getCustomers());
  };

  const handleViewProjects = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    setIsViewProjectsModalOpen(true);
  };

  const handleCreateProject = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    setIsCreateProjectModalOpen(true);
  };

  const handleViewProject = (projectId: string) => {
    console.log("Navigating to project:", projectId);
    setIsViewProjectsModalOpen(false);
    navigate(`/project/${projectId}`);
  };

  const handleProjectCreated = (project: Project) => {
    addProject(project);
    setProjects(getProjects());
    setIsCreateProjectModalOpen(false);
  };

  console.log("Dashboard - User role:", user.role);

  // Sales role dashboard
  if (user?.role === "sales") {
    return (
      <Layout allowedRoles={["sales"]}>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Sales Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage customers and projects</p>
            </div>
            <div className="space-x-2">
              <Link to="/completed-projects">
                <Button variant="outline">View Completed Projects</Button>
              </Link>
              <Button onClick={() => setIsCreateCustomerModalOpen(true)}>
                Create Customer
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <CustomerTile 
                key={customer.id} 
                customer={customer}
                onViewProjects={handleViewProjects}
                onCreateProject={handleCreateProject}
              />
            ))}
          </div>
          
          {customers.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600">No customers yet</h3>
              <p className="text-gray-500 mt-2">Create your first customer to get started</p>
              <Button onClick={() => setIsCreateCustomerModalOpen(true)}>
                Create Customer
              </Button>
            </div>
          )}

          <CreateCustomerModal
            isOpen={isCreateCustomerModalOpen}
            onClose={() => setIsCreateCustomerModalOpen(false)}
            onCreateCustomer={handleCreateCustomer}
          />

          <ViewProjectsModal
            isOpen={isViewProjectsModalOpen}
            onClose={() => setIsViewProjectsModalOpen(false)}
            customer={selectedCustomer}
            projects={projects}
            onViewProject={handleViewProject}
          />

          <CreateProjectModal
            isOpen={isCreateProjectModalOpen}
            onClose={() => setIsCreateProjectModalOpen(false)}
            customer={selectedCustomer}
            onCreateProject={handleProjectCreated}
          />
        </div>
      </Layout>
    );
  }

  // Technical role dashboard
  if (user?.role === "technical") {
    return (
      <Layout allowedRoles={["technical"]}>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Technical Dashboard</h1>
            <p className="text-gray-500 mt-1">Review projects and manage tasks</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <CustomerTile 
                key={customer.id} 
                customer={customer}
                onViewProjects={handleViewProjects}
                onCreateProject={handleCreateProject}
              />
            ))}
          </div>
          
          {customers.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600">No projects available</h3>
              <p className="text-gray-500 mt-2">Projects will appear here once created by sales team</p>
            </div>
          )}

          <ViewProjectsModal
            isOpen={isViewProjectsModalOpen}
            onClose={() => setIsViewProjectsModalOpen(false)}
            customer={selectedCustomer}
            projects={projects}
            onViewProject={handleViewProject}
          />
        </div>
      </Layout>
    );
  }

  // Assignee role dashboard
  if (user?.role === "assignee") {
      
    return (
      <Layout allowedRoles={["assignee"]}>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">My Tasks</h1>
              <p className="text-gray-500 mt-1">Tasks assigned to you</p>
            </div>
            <Link to="/assignee/tasks">
              <Button>View All Tasks</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assigneeTasks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assigneeTasks.filter(task => task.status === "pending" || task.status === "in-progress").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assigneeTasks.filter(task => task.status === "closed").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {assigneeTasks.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assigneeTasks.slice(0, 5).map(task => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{formatDate(task.dueDate)}</TableCell>
                        <TableCell>
                          <Badge variant={task.status === "closed" ? "default" : "secondary"}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/assignee/task/${task.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600">No tasks assigned</h3>
              <p className="text-gray-500 mt-2">New tasks will appear here when assigned</p>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Reviewer role dashboard
  if (user?.role === "reviewer") {
    const pendingReviews = responses.filter(response => 
      response.status === "review" && 
      !reviews.some(review => review.responseId === response.id)
    );
    
    return (
      <Layout allowedRoles={["reviewer"]}>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Reviewer Dashboard</h1>
              <p className="text-gray-500 mt-1">Review assignee responses</p>
            </div>
            <Link to="/reviewer/tasks">
              <Button>View All Tasks</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReviews.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviews.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reviews.filter(review => review.status === "final-review" || review.status === "closed").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {pendingReviews.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReviews.slice(0, 5).map(response => {
                      const task = tasks.find(t => t.id === response.taskId);
                      const assignee = getUserById(response.respondedBy);
                      return (
                        <TableRow key={response.id}>
                          <TableCell className="font-medium">{task?.title}</TableCell>
                          <TableCell>{assignee?.name}</TableCell>
                          <TableCell>{formatDate(response.respondedAt)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/reviewer/task/${task?.id}`}>Review</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600">No pending reviews</h3>
              <p className="text-gray-500 mt-2">New reviews will appear here</p>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Final reviewer role dashboard
  if (user?.role === "final") {
    const pendingFinals = reviews.filter(review => 
      review.status === "final-review" && 
      !finals.some(final => final.reviewId === review.id)
    );
    
    return (
      <Layout allowedRoles={["final"]}>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Final Reviewer Dashboard</h1>
              <p className="text-gray-500 mt-1">Final approvals and system analytics</p>
            </div>
            <div className="space-x-2">
              <Link to="/final/analytics">
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link to="/final/tasks">
                <Button>View All Tasks</Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingFinals.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Approvals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{finals.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Closed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === "closed").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === "active").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {pendingFinals.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Pending Final Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingFinals.slice(0, 5).map(review => {
                      const task = tasks.find(t => t.id === review.taskId);
                      const reviewer = getUserById(review.reviewedBy);
                      return (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{task?.title}</TableCell>
                          <TableCell>{reviewer?.name}</TableCell>
                          <TableCell>{formatDate(review.reviewedAt)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/final/task/${task?.id}`}>Review</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600">No pending approvals</h3>
              <p className="text-gray-500 mt-2">Final approvals will appear here</p>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Fallback for unknown roles or debugging
  console.log("Dashboard - No role matched, rendering fallback");
  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-500 mb-4">Welcome, {user.name}</p>
          <p className="text-sm text-gray-400">Role: {user.role}</p>
          <p className="text-sm text-red-500 mt-4">
            Role "{user.role}" is not recognized. Please contact support.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
