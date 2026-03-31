import { useState } from "react";
import { Card } from "@/components/ui/card";
import ExcelUploader from "@/components/ExcelUploader";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { Upload, TrendingUp } from "lucide-react";

interface UnitCostData {
  id: number;
  item: string;
  rate: number;
  unit: string;
}

const UnitCost = () => {
  const [unitCosts, setUnitCosts] = useState<UnitCostData[]>([]);

  const validateUnitCostData = (data: any[]): { isValid: boolean; errors?: string[] } => {
    const errors: string[] = [];
    
    data.forEach((item, index) => {
      if (!item.item || !item.rate || !item.unit) {
        errors.push(`Row ${index + 1} is missing required fields`);
      }
      
      const rate = Number(item.rate);
      if (isNaN(rate) || rate <= 0) {
        errors.push(`Invalid rate in row ${index + 1}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
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
          
          const validationResult = validateUnitCostData(jsonData);
          
          if (!validationResult.isValid) {
            throw new Error(validationResult.errors?.join('\n'));
          }

          const validatedData = jsonData.map((item: any, index: number) => ({
            id: index + 1,
            item: String(item.item),
            rate: Number(item.rate),
            unit: String(item.unit)
          }));

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Unit Cost Management</h1>
            <p className="text-sm text-slate-500">Upload and manage unit cost data</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="rounded-2xl border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={18} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900">Upload Excel File</h2>
          </div>
          <ExcelUploader 
            onFileUpload={handleFileUpload} 
            validateData={validateUnitCostData}
          />
        </Card>

        {/* Data Table */}
        {unitCosts.length > 0 && (
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Unit Costs ({unitCosts.length} items)</h2>
            </div>
            <DataTable
              columns={[
                { header: "Item", accessorKey: "item" },
                { header: "Rate", accessorKey: "rate" },
                { header: "Unit", accessorKey: "unit" },
              ]}
              data={unitCosts}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default UnitCost;