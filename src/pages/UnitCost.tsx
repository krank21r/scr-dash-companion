import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExcelUploader from "@/components/ExcelUploader";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { Upload, TrendingUp, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UnitCostData {
  id: number;
  item: string;
  rate: number;
  unit: string;
}

const UnitCost = () => {
  const [unitCosts, setUnitCosts] = useState<UnitCostData[]>([]);
  const { toast } = useToast();

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
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error("Failed to read file");
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const validationResult = validateUnitCostData(jsonData);
        if (!validationResult.isValid) throw new Error(validationResult.errors?.join('\n'));

        const validatedData = jsonData.map((item: any, index: number) => ({
          id: index + 1,
          item: String(item.item),
          rate: Number(item.rate),
          unit: String(item.unit)
        }));

        setUnitCosts(validatedData);
        toast({ title: "Operation Successful", description: "Excel datastream parsed and synchronized." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Parsing Error", description: error.message });
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-100/50">
            <TrendingUp size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">Unit Cost</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">XLSX Support Active</span>
          </div>
        </div>
      </div>

      {/* Modern Upload Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 border-none shadow-premium-shadow relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">Ingest Datastream</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Import normalized Excel tables</p>
            </div>
          </div>
          
          <div className="w-full">
            <ExcelUploader 
              onFileUpload={handleFileUpload} 
              validateData={validateUnitCostData}
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </motion.div>

      {/* Result Section */}
      <AnimatePresence>
        {unitCosts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-none shadow-premium-shadow overflow-hidden"
          >
            <div className="p-8 bg-slate-900 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight font-['Plus_Jakarta_Sans']">Parsed Cost Registry</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">{unitCosts.length} Entries Synchronized</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUnitCosts([])}
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-lg px-4 font-bold"
              >
                Clear Ledger
              </Button>
            </div>

            <div className="overflow-x-auto scrollbar-none">
              <DataTable
                columns={[
                  { 
                    header: "ITEM SPECIFICATION", 
                    accessorKey: "item",
                    cell: (info: any) => <span className="font-bold text-slate-700">{info.getValue()}</span>
                  },
                  { 
                    header: "ALLOCATED RATE", 
                    accessorKey: "rate",
                    cell: (info: any) => (
                      <div className="flex items-baseline gap-1 text-primary font-black">
                        <span className="text-[10px] opacity-40">₹</span>
                        <span>{info.getValue().toLocaleString('en-IN')}</span>
                      </div>
                    )
                  },
                  { 
                    header: "MEASUREMENT UNIT", 
                    accessorKey: "unit",
                    cell: (info: any) => <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">{info.getValue()}</span>
                  },
                ]}
                data={unitCosts}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Null State */}
      {unitCosts.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <AlertCircle size={32} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-400 font-['Plus_Jakarta_Sans'] uppercase tracking-[0.2em]">Registry Awaiting Data</h3>
        </div>
      )}
    </div>
  );
};

export default UnitCost;