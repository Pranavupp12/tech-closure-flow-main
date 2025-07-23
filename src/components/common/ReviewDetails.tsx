
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, getUserById } from "@/lib/utils";
import { Review } from "@/lib/data";

interface ReviewDetailsProps {
  review: Review;
}

const ReviewDetails: React.FC<ReviewDetailsProps> = ({ review }) => {
  const reviewedByUser = getUserById(review.reviewedBy);
  
  return (
    <Card className="shadow-md mb-8">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl">Reviewer Assessment</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h4 className="font-medium text-gray-500 mb-1">Comments</h4>
            <p>{review.comments}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-500 mb-1">Status</h4>
            <p>
              {review.status === "final-review" && (
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  Final Review
                </span>
              )}
              {review.status === "closed" && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Closed
                </span>
              )}
              {review.status === "rejected" && (
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  Rejected
                </span>
              )}
            </p>
          </div>
        </div>

        {review.attachments && review.attachments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-500 mb-2">Attachments</h4>
            <div className="space-y-2">
              {review.attachments.map((attachment, index) => (
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
          Reviewed by {reviewedByUser?.name} on {formatDate(review.reviewedAt)}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewDetails;
