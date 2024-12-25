import { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelUploader from '@/components/ExcelUploader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

interface ReviewData {
  projectName: string;
  reviewer: string;
  date: string;
  comments: string;
  rating: number;
}

const Reviews = () => {
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const handleFileUpload = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Transform the data to match our ReviewData interface
      const transformedData = jsonData.map((row: any) => ({
        projectName: row.projectName || row['Project Name'] || '',
        reviewer: row.reviewer || row.Reviewer || '',
        date: row.date || row.Date || '',
        comments: row.comments || row.Comments || '',
        rating: Number(row.rating || row.Rating || 0),
      }));

      const validation = validateReviewData(transformedData);
      if (!validation.isValid) {
        throw new Error(validation.errors?.join('\n'));
      }

      setReviewData(transformedData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error('Failed to parse Excel file. Please check the file format.');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(reviewData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = reviewData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Project Reviews</h1>
      
      <div className="mb-8">
        <ExcelUploader
          onFileUpload={handleFileUpload}
          validateData={validateReviewData}
          acceptedFileTypes={['.xlsx', '.xls']}
        />
      </div>

      {reviewData.length > 0 && (
        <>
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
                {currentItems.map((review, index) => (
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

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="gap-1 pl-2.5"
                    >
                      Previous
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <Button 
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="gap-1 pr-2.5"
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews;