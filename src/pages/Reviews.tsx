import { useState } from 'react';
import ExcelUploader from '@/components/ExcelUploader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReviewData {
  projectName: string;
  reviewer: string;
  date: string;
  comments: string;
  rating: number;
}

const Reviews = () => {
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);

  const validateReviewData = (data: any[]): { isValid: boolean; errors?: string[] } => {
    const requiredFields = ['projectName', 'reviewer', 'date', 'comments', 'rating'];
    const errors: string[] = [];

    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => 
      !data.every(item => item[field])
    );

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate rating values
    const invalidRatings = data.some(item => 
      typeof item.rating !== 'number' || item.rating < 1 || item.rating > 5
    );

    if (invalidRatings) {
      errors.push('Ratings must be numbers between 1 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleFileUpload = (data: ReviewData[]) => {
    setReviewData(data);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Project Reviews</h1>
      
      <div className="mb-8">
        <ExcelUploader
          onFileUpload={handleFileUpload}
          validateData={validateReviewData}
        />
      </div>

      {reviewData.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewData.map((review, index) => (
                <TableRow key={index}>
                  <TableCell>{review.projectName}</TableCell>
                  <TableCell>{review.reviewer}</TableCell>
                  <TableCell>{review.date}</TableCell>
                  <TableCell>{review.comments}</TableCell>
                  <TableCell className="text-right">{review.rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Reviews;