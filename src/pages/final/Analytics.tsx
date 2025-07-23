
import React, { useState, useEffect } from "react";
import { getProjects, getCustomers, getTasks, getResponses, getReviews, getFinals, users } from "@/lib/storage";
import { Project, Customer, Task, Response, Review, Final, User } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, getUserById, getCustomerById } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Users, FileText, CheckCircle, Clock, TrendingUp, 
  Building2, Package, Calendar, Activity 
} from "lucide-react";

const Analytics: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [finals, setFinals] = useState<Final[]>([]);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const [projectsRes, customersRes, tasksRes, responsesRes, reviewsRes,/*finalsRes*/] = await Promise.all([
        fetch("http://localhost:3000/api/tasks/projects"),
        fetch("http://localhost:3000/api/sales/customers"),
        fetch("http://localhost:3000/api/tasks/alltasks"),
        fetch("http://localhost:3000/api/response/allresponses"),
        fetch("http://localhost:3000/api/review/allreviews"),
        //fetch("http://localhost:3000/api/finals")
      ]);

      const projectsData = await projectsRes.json();
      const customersData = await customersRes.json();
      const tasksData = await tasksRes.json();
      const responsesData = await responsesRes.json();
      const reviewsData = await reviewsRes.json();
      //const finalsData = await finalsRes.json();

      setProjects(projectsData.projects || []);
      setCustomers(customersData.customers || []);
      setTasks(tasksData.tasks || []);
      setResponses(responsesData.responses || []);
      setReviews(reviewsData.reviews || []);
     // setFinals(finalsData.finals || []);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  fetchData();
}, []);


  // Calculate key metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === "closed").length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "closed").length;
  const pendingTasks = tasks.filter(t => t.status !== "closed").length;

  // Performance by assignee
  const assigneePerformance = users
    .filter(user => user.role === "assignee")
    .map(assignee => {
      const assigneeTasks = tasks.filter(task => task.assignees.includes(assignee.id));
      const completedByAssignee = assigneeTasks.filter(task => task.status === "closed").length;
      const averageResponseTime = assigneeTasks.length > 0 ? 
        Math.round(assigneeTasks.reduce((acc, task) => {
          const response = responses.find(r => r.taskId === task.id);
          if (response) {
            const taskDate = new Date(task.createdAt);
            const responseDate = new Date(response.respondedAt);
            return acc + (responseDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24);
          }
          return acc;
        }, 0) / assigneeTasks.length) : 0;

      return {
        name: assignee.name,
        totalTasks: assigneeTasks.length,
        completedTasks: completedByAssignee,
        completionRate: assigneeTasks.length > 0 ? Math.round((completedByAssignee / assigneeTasks.length) * 100) : 0,
        averageResponseTime
      };
    });

  // Performance by reviewer
  const reviewerPerformance = users
    .filter(user => user.role === "reviewer")
    .map(reviewer => {
      const reviewerReviews = reviews.filter(review => review.reviewedBy === reviewer.id);
      const approvedReviews = reviewerReviews.filter(review => review.status === "final-review" || review.status === "closed").length;
      const rejectedReviews = reviewerReviews.filter(review => review.status === "rejected").length;

      return {
        name: reviewer.name,
        totalReviews: reviewerReviews.length,
        approved: approvedReviews,
        rejected: rejectedReviews,
        approvalRate: reviewerReviews.length > 0 ? Math.round((approvedReviews / reviewerReviews.length) * 100) : 0
      };
    });

  // Project distribution by plant
  const plantDistribution = projects.reduce((acc, project) => {
    acc[project.plant] = (acc[project.plant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const plantData = Object.entries(plantDistribution).map(([plant, count]) => ({
    name: plant,
    value: count
  }));

  // Product distribution
  const productDistribution = projects.reduce((acc, project) => {
    acc[project.product] = (acc[project.product] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const productData = Object.entries(productDistribution).map(([product, count]) => ({
    name: product.substring(0, 20) + "...",
    value: count,
    fullName: product
  }));

  // Task status distribution
  const taskStatusData = [
    { name: "Completed", value: completedTasks, color: "#10B981" },
    { name: "In Progress", value: tasks.filter(t => t.status === "in-progress").length, color: "#3B82F6" },
    { name: "Under Review", value: tasks.filter(t => t.status === "review").length, color: "#8B5CF6" },
    { name: "Final Review", value: tasks.filter(t => t.status === "final-review").length, color: "#F59E0B" },
    { name: "Pending", value: tasks.filter(t => t.status === "pending").length, color: "#6B7280" },
    { name: "Rejected", value: tasks.filter(t => t.status === "rejected").length, color: "#EF4444" }
  ];

  // Monthly project completion trend
  const monthlyCompletions = projects
    .filter(p => p.status === "closed")
    .reduce((acc, project) => {
      const month = new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const trendData = Object.entries(monthlyCompletions).map(([month, count]) => ({
    month,
    projects: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Layout allowedRoles={["final"]}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Comprehensive performance metrics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {completedProjects} completed, {activeProjects} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {completedTasks} completed, {pendingTasks} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Task completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">
                Total customers in system
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plant Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Projects by Plant</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={plantData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {plantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignee Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Assignee Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Avg Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assigneePerformance.map((assignee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{assignee.name}</TableCell>
                      <TableCell>{assignee.totalTasks}</TableCell>
                      <TableCell>{assignee.completedTasks}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={assignee.completionRate >= 80 ? "default" : "secondary"}
                        >
                          {assignee.completionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{assignee.averageResponseTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Reviewer Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Reviewer Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewerPerformance.map((reviewer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{reviewer.name}</TableCell>
                      <TableCell>{reviewer.totalReviews}</TableCell>
                      <TableCell>{reviewer.approved}</TableCell>
                      <TableCell>{reviewer.rejected}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={reviewer.approvalRate >= 70 ? "default" : "secondary"}
                        >
                          {reviewer.approvalRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Product Distribution and Monthly Trend */}
        {productData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {trendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Project Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="projects" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
