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

interface UnitCostData {
  itemCode: string;
  description: string;
  unit: string;
  rate: number;
}

const UnitCost = () => {
  const [unitCostData, setUnitCostData] = useState<UnitCostData[]>([]);

  const validateUnitCostData = (data: any[]): { isValid: boolean; errors?: string[] } => {
    const requiredFields = ['itemCode', 'description', 'unit', 'rate'];
    const errors: string[] = [];

    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => 
      !data.every(item => item[field])
    );

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleFileUpload = (data: UnitCostData[]) => {
    setUnitCostData(data);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Unit Cost Data</h1>
      
      <div className="mb-8">
        <ExcelUploader
          onFileUpload={handleFileUpload}
          validateData={validateUnitCostData}
        />
      </div>

      {unitCostData.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitCostData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{item.rate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UnitCost;