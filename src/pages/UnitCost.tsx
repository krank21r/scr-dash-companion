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

interface UnitCostData {
  itemCode: string;
  description: string;
  unit: string;
  rate: number;
}

const UnitCost = () => {
  const [unitCostData, setUnitCostData] = useState<UnitCostData[]>([]);

  const validateUnitCostData = (data: any[]): { isValid: boolean; errors?: string[] } => {
    const errors: string[] = [];
    const requiredFields = ['itemCode', 'description', 'unit', 'rate'];

    // Check if data array is empty
    if (!data || data.length === 0) {
      errors.push('No data found in the Excel file');
      return { isValid: false, errors };
    }

    // Check for missing required fields
    const missingFields = requiredFields.filter(field => 
      !data.every(item => {
        const value = item[field] || item[field.charAt(0).toUpperCase() + field.slice(1)];
        return value !== undefined && value !== '';
      })
    );

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate rate values
    const invalidRates = data.some(item => {
      const rate = Number(item.rate || item.Rate);
      return isNaN(rate) || rate < 0;
    });

    if (invalidRates) {
      errors.push('All rates must be valid positive numbers');
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

      // Transform the data to match our UnitCostData interface
      const transformedData = jsonData.map((row: any) => ({
        itemCode: row.itemCode || row['Item Code'] || '',
        description: row.description || row.Description || '',
        unit: row.unit || row.Unit || '',
        rate: Number(row.rate || row.Rate || 0),
      }));

      const validation = validateUnitCostData(transformedData);
      if (!validation.isValid) {
        throw new Error(validation.errors?.join('\n'));
      }

      setUnitCostData(transformedData);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw error;
    }
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