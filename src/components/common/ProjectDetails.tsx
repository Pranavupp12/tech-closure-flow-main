
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, getUserById, getCustomerById } from "@/lib/utils";
import { Project, Customer } from "@/lib/data";

interface ProjectDetailsProps {
  project: Project ;
  customers: Customer[];
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, customers }) => {
  const createdByUser = getUserById(project.createdBy);
  const customer = getCustomerById(project.customerId, customers);

  return (
    <Card className="shadow-md mb-8">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl">{project.title}</CardTitle>
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
            <h4 className="font-medium text-gray-500 mb-1">Status</h4>
            <p>
              {project.status === "active" ? (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Active
                </span>
              ) : (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Closed
                </span>
              )}
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

        <div className="mt-6">
          <h4 className="font-medium text-gray-500 mb-2">Documents</h4>
          <div className="space-y-2">
            {project.technicalSpecs && (
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Technical Specifications
                </span>
              </div>
            )}
            {project.tenderDocument && (
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Tender Document
                </span>
              </div>
            )}
            {project.qapCriteria && project.qapAttachment && (
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  QAP Document
                </span>
              </div>
            )}
            {project.otherAttachments && project.otherAttachments.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {`${project.otherAttachments.length} Additional Documents`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Created by {createdByUser?.name} on {formatDate(project.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetails;
