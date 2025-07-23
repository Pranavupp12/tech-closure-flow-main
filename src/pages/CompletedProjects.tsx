
import React, { useState, useEffect } from "react";
import { getProjects, getCustomers, getTasks, getResponses, getReviews, getFinals } from "@/lib/storage";
import { Project, Customer, Task, Response, Review, Final } from "@/lib/data";
import Layout from "@/components/layout/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, getUserById, getCustomerById } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, Filter, Download, FileText, Users, Calendar } from "lucide-react";

const CompletedProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [finals, setFinals] = useState<Final[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [filterPlant, setFilterPlant] = useState("all");

  useEffect(() => {
    // Load all data
    const allProjects = getProjects();
    const completedProjects = allProjects.filter(project => project.status === "closed");
    setProjects(completedProjects);
    
    setCustomers(getCustomers());
    setTasks(getTasks());
    setResponses(getResponses());
    setReviews(getReviews());
    setFinals(getFinals());
  }, []);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const customer = getCustomerById(project.customerId, customers);
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = filterCustomer === "all" || project.customerId === filterCustomer;
    const matchesPlant = filterPlant === "all" || project.plant === filterPlant;
    
    return matchesSearch && matchesCustomer && matchesPlant;
  });

  // Calculate project statistics
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const projectResponses = responses.filter(response => response.projectId === projectId);
    const projectReviews = reviews.filter(review => review.projectId === projectId);
    const projectFinals = finals.filter(final => final.projectId === projectId);
    
    return {
      totalTasks: projectTasks.length,
      totalDocuments: projectTasks.reduce((acc, task) => acc + (task.attachments?.length || 0), 0) +
                     projectResponses.reduce((acc, response) => acc + (response.attachments?.length || 0), 0) +
                     projectReviews.reduce((acc, review) => acc + (review.attachments?.length || 0), 0) +
                     projectFinals.reduce((acc, final) => acc + (final.attachments?.length || 0), 0),
      interactions: projectResponses.length + projectReviews.length + projectFinals.length
    };
  };

  const uniqueCustomers = [...new Set(projects.map(p => p.customerId))];
  const uniquePlants = [...new Set(projects.map(p => p.plant))];

  return (
    <Layout allowedRoles={["sales"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Completed Projects</h1>
            <p className="text-gray-500 mt-1">Comprehensive view of all completed projects with full documentation</p>
          </div>
          <Link to="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((acc, project) => acc + getProjectStats(project.id).totalTasks, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((acc, project) => acc + getProjectStats(project.id).totalDocuments, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueCustomers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {uniqueCustomers.map(customerId => {
                    const customer = getCustomerById(customerId, customers);
                    return (
                      <SelectItem key={customerId} value={customerId}>
                        {customer?.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Select value={filterPlant} onValueChange={setFilterPlant}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Plant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plants</SelectItem>
                  {uniquePlants.map(plant => (
                    <SelectItem key={plant} value={plant}>
                      {plant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCustomer("all");
                  setFilterPlant("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {filteredProjects.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Interactions</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map(project => {
                  const customer = getCustomerById(project.customerId, customers);
                  const stats = getProjectStats(project.id);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{customer?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {project.product}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {project.plant}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {stats.totalTasks}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {stats.totalDocuments}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {stats.interactions}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/completed-project/${project.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600">
              {projects.length === 0 ? "No completed projects" : "No projects match your filters"}
            </h3>
            <p className="text-gray-500 mt-2">
              {projects.length === 0 
                ? "Completed projects will appear here" 
                : "Try adjusting your search criteria"}
            </p>
            <Link to="/">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompletedProjects;
