import { useState } from "react";
import { Card } from "@/components/ui/card";
import ExcelUploader from "@/components/ExcelUploader";
import { DataTable } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

interface UnitCostData {
  id: number;
  item: string;
  rate: number;
  unit: string;
}

const UnitCost = () => {
  const [unitCosts, setUnitCosts] = useState<UnitCostData[]>([]);

  const validateUnitCostData = (data: any[]): UnitCostData[] => {
    return data.map((item, index) => {
      if (!item.item || !item.rate || !item.unit) {
        throw new Error(`Row ${index + 1} is missing required fields`);
      }
      
      const rate = Number(item.rate);
      if (isNaN(rate) || rate <= 0) {
        throw new Error(`Invalid rate in row ${index + 1}`);
      }

      return {
        id: index + 1,
        item: String(item.item),
        rate: rate,
        unit: String(item.unit)
      };
    });
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            throw new Error("Failed to read file");
          }

          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          const validatedData = validateUnitCostData(jsonData);
          setUnitCosts(validatedData);
          
          toast({
            title: "Success",
            description: "Unit cost data uploaded successfully",
          });
        } catch (error) {
          console.error("Error processing Excel file:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to process Excel file",
          });
        }
      };

      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to read the file",
        });
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error handling file upload:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to handle file upload",
      });
    }
  };

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Unit Cost
        </span>
        <h1 className="mt-4 text-4xl font-bold">Unit Cost Management</h1>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <ExcelUploader onFileUpload={handleFileUpload} />
        </div>

        {unitCosts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Unit Costs</h2>
            <DataTable
              columns={[
                { header: "Item", accessorKey: "item" },
                { header: "Rate", accessorKey: "rate" },
                { header: "Unit", accessorKey: "unit" },
              ]}
              data={unitCosts}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UnitCost;
