
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getProjectById, getCustomers, getTasks, getResponses, getReviews, getFinals } from "@/lib/storage";
import { formatDate, getUserById } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import DocumentsList from "@/components/common/DocumentsList";

const CompletedProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [finals, setFinals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      // Load all relevant data for the completed project
      const foundProject = getProjectById(projectId);
      setProject(foundProject);
      
      // Load other related data
      setCustomers(getCustomers());
      
      const allTasks = getTasks();
      const projectTasks = allTasks.filter(task => task.projectId === projectId);
      setTasks(projectTasks);
      
      const allResponses = getResponses();
      const projectResponses = allResponses.filter(response => response.projectId === projectId);
      setResponses(projectResponses);
      
      const allReviews = getReviews();
      const projectReviews = allReviews.filter(review => review.projectId === projectId);
      setReviews(projectReviews);
      
      const allFinals = getFinals();
      const projectFinals = allFinals.filter(final => final.projectId === projectId);
      setFinals(projectFinals);
      
      setLoading(false);
    }
  }, [projectId]);

  const handleDownloadAll = (documentType: string) => {
    toast({
      title: "Download Started",
      description: `All ${documentType} documents are being prepared for download`,
    });
  };

  if (loading) {
    return (
      <Layout allowedRoles={["sales"]}>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading project details...</p>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout allowedRoles={["sales"]}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link to="/completed-projects">
            <Button>Back to Completed Projects</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const customer = customers.find((c) => c.id === project.customerId);

  // Collect all project document IDs
  const projectDocumentIds = [
    ...(project.technicalSpecs ? [project.technicalSpecs] : []),
    ...(project.tenderDocument ? [project.tenderDocument] : []),
    ...(project.qapAttachment ? [project.qapAttachment] : []),
    ...(project.otherAttachments || [])
  ];

  return (
    <Layout allowedRoles={["sales"]}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-gray-500 mt-1">Completed Project Details</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link to="/completed-projects">Back to Completed Projects</Link>
            </Button>
          </div>
        </div>

        {/* Project Information */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">Project Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Customer</h4>
                <p>{customer?.name}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-500 mb-1">Project Details</h4>
                <p>{project.details}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-500 mb-1">Delivery Period</h4>
                <p>
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-500 mb-1">Plant</h4>
                <p>{project.plant}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-500 mb-1">Product</h4>
                <p>{project.product}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-500 mb-1">Inline Inspection</h4>
                <p>{project.inlineInspection ? "Yes" : "No"}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-500 mb-1">QAP Criteria</h4>
                <p>{project.qapCriteria ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Documents */}
        {projectDocumentIds.length > 0 && (
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">Project Documents</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DocumentsList 
                documentIds={projectDocumentIds}
                title="Original Project Documents"
              />
            </CardContent>
          </Card>
        )}
        
        {/* Tasks and Responses */}
        {tasks.length > 0 && (
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Tasks & Responses</CardTitle>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDownloadAll("task")}
                >
                  Download All Task Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {tasks.map(task => {
                  // Find related data for this task
                  const taskResponses = responses.filter(r => r.taskId === task.id);
                  const taskReviews = reviews.filter(r => r.taskId === task.id);
                  const taskFinals = finals.filter(f => f.taskId === task.id);
                  
                  const createdByUser = getUserById(task.createdBy);
                  
                  return (
                    <div key={task.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 p-4">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Created by {createdByUser?.name} on {formatDate(task.createdAt)}
                        </p>
                      </div>
                      
                      {/* Task attachments */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="p-4 border-t">
                          <DocumentsList 
                            documentIds={task.attachments}
                            title="Task Attachments"
                          />
                        </div>
                      )}
                      
                      {/* Response data */}
                      {taskResponses.length > 0 && (
                        <div className="p-4 border-t bg-blue-50">
                          <h4 className="font-medium mb-3">Assignee Responses</h4>
                          {taskResponses.map(response => {
                            const responder = getUserById(response.respondedBy);
                            return (
                              <div key={response.id} className="space-y-3 mb-4">
                                <p>
                                  <span className="font-medium">{responder?.name}</span> 
                                  <span className="text-sm text-gray-600 ml-2">
                                    responded on {formatDate(response.respondedAt)}
                                  </span>
                                </p>
                                <p className="text-gray-800">{response.comments}</p>
                                
                                {/* Response attachments */}
                                {response.attachments && response.attachments.length > 0 && (
                                  <DocumentsList 
                                    documentIds={response.attachments}
                                    title="Response Attachments"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Review data */}
                      {taskReviews.length > 0 && (
                        <div className="p-4 border-t bg-green-50">
                          <h4 className="font-medium mb-3">Reviewer Feedback</h4>
                          {taskReviews.map(review => {
                            const reviewer = getUserById(review.reviewedBy);
                            return (
                              <div key={review.id} className="space-y-3 mb-4">
                                <p>
                                  <span className="font-medium">{reviewer?.name}</span> 
                                  <span className="text-sm text-gray-600 ml-2">
                                    reviewed on {formatDate(review.reviewedAt)}
                                  </span>
                                </p>
                                <p className="text-gray-800">{review.comments}</p>
                                
                                {/* Review attachments */}
                                {review.attachments && review.attachments.length > 0 && (
                                  <DocumentsList 
                                    documentIds={review.attachments}
                                    title="Review Attachments"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Final approval data */}
                      {taskFinals.length > 0 && (
                        <div className="p-4 border-t bg-purple-50">
                          <h4 className="font-medium mb-3">Final Approval</h4>
                          {taskFinals.map(final => {
                            const approver = getUserById(final.approvedBy);
                            return (
                              <div key={final.id} className="space-y-3 mb-4">
                                <p>
                                  <span className="font-medium">{approver?.name}</span> 
                                  <span className="text-sm text-gray-600 ml-2">
                                    approved on {formatDate(final.approvedAt)}
                                  </span>
                                </p>
                                <p className="text-gray-800">{final.comments}</p>
                                
                                {/* Final approval attachments */}
                                {final.attachments && final.attachments.length > 0 && (
                                  <DocumentsList 
                                    documentIds={final.attachments}
                                    title="Final Approval Attachments"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CompletedProjectDetails;
