
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, getUserById } from "@/lib/utils";
import { Task, User } from "@/lib/data";
import DocumentsList from "./DocumentsList";

interface TaskDetailsProps {
  task: Task;
  users: User[];
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, users }) => {
  const createdByUser = getUserById(task.createdBy);
  
  // Get assignee names
  const assigneeNames = task.assignees
    .map(assigneeId => {
      const user = users.find(u => u.id === assigneeId);
      return user ? user.name : "Unknown";
    })
    .join(", ");

  return (
    <Card className="shadow-md mb-8">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Description</h4>
            <p>{task.description}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-500 mb-1">Due Date</h4>
            <p>{formatDate(task.dueDate)}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-500 mb-1">Status</h4>
            <p>
              {task.status === "pending" && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Pending
                </span>
              )}
              {task.status === "in-progress" && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  In Progress
                </span>
              )}
              {task.status === "review" && (
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                  Under Review
                </span>
              )}
              {task.status === "final-review" && (
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  Final Review
                </span>
              )}
              {task.status === "closed" && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Closed
                </span>
              )}
              {task.status === "rejected" && (
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  Rejected
                </span>
              )}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-500 mb-1">Assignee(s)</h4>
            <p>{assigneeNames}</p>
          </div>
        </div>

        {task.attachments && task.attachments.length > 0 && (
          <div className="mt-6">
            <DocumentsList 
              documentIds={task.attachments} 
              title="Task Attachments"
            />
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          Created by {createdByUser?.name} on {formatDate(task.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDetails;
