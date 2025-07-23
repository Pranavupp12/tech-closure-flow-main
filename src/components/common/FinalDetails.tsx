
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, getUserById } from "@/lib/utils";
import { Final } from "@/lib/data";

interface FinalDetailsProps {
  final: Final;
}

const FinalDetails: React.FC<FinalDetailsProps> = ({ final }) => {
  const approvedByUser = getUserById(final.approvedBy);
  
  return (
    <Card className="shadow-md mb-8">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl">Final Approval</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Comments</h4>
            <p>{final.comments}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-500 mb-1">Status</h4>
            <p>
              {final.status === "closed" && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Approved & Closed
                </span>
              )}
              {final.status === "rejected" && (
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  Rejected
                </span>
              )}
            </p>
          </div>
        </div>

        {final.attachments && final.attachments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-500 mb-2">Attachments</h4>
            <div className="space-y-2">
              {final.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {`Attachment ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          Approved by {approvedByUser?.name} on {formatDate(final.approvedAt)}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalDetails;
