import { useState } from "react";
import { Button } from "@/components/ui/button";
import ExcelUploader from "@/components/ExcelUploader";
import { DataTable, type Column } from "@/components/ui/data-table";
import * as XLSX from "xlsx";
import {
  Upload,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Lock,
  IndianRupee,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface UnitCostData {
  id: number;
  item: string;
  rate: number;
  unit: string;
}

const readFileAsBinary = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) resolve(String(event.target.result));
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () =>
      reject(new Error("The file could not be read. It may be corrupted or unreadable."));
    reader.readAsBinaryString(file);
  });

const UnitCost = () => {
  const [unitCosts, setUnitCosts] = useState<UnitCostData[]>([]);
  const { isAdmin } = useAuth();

  const validateUnitCostData = (data: unknown[]): { isValid: boolean; errors?: string[] } => {
    const errors: string[] = [];
    data.forEach((entry, index) => {
      const item = entry as Record<string, unknown>;
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
      errors: errors.length > 0 ? errors : undefined,
    };
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    const binary = await readFileAsBinary(file);
    const workbook = XLSX.read(binary, { type: "binary" });
    if (!workbook.SheetNames.length) {
      throw new Error("The workbook contains no sheets.");
    }
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet) {
      throw new Error("Could not read the first worksheet.");
    }
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    if (jsonData.length === 0) {
      throw new Error("The first sheet is empty. Expected columns: item, rate, unit.");
    }
    const validationResult = validateUnitCostData(jsonData);
    if (!validationResult.isValid) throw new Error(validationResult.errors?.join("\n"));

    const validatedData: UnitCostData[] = jsonData.map((entry, index) => {
      const item = entry as Record<string, unknown>;
      return {
        id: index + 1,
        item: String(item.item),
        rate: Number(item.rate),
        unit: String(item.unit),
      };
    });

    setUnitCosts(validatedData);
  };

  const columns: Column<UnitCostData>[] = [
    {
      header: "ITEM SPECIFICATION",
      accessorKey: "item",
      cell: (info) => <span className="font-semibold text-slate-800 text-xs">{info.getValue()}</span>,
    },
    {
      header: "ALLOCATED RATE",
      accessorKey: "rate",
      cell: (info) => (
        <div className="flex items-baseline gap-1 text-teal-700 font-bold font-mono text-xs">
          <span className="text-[10px] text-slate-400">₹</span>
          <span>{Number(info.getValue()).toLocaleString("en-IN")}</span>
        </div>
      ),
    },
    {
      header: "MEASUREMENT UNIT",
      accessorKey: "unit",
      cell: (info) => (
        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/60">
          {info.getValue()}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shadow-sm shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Unit Cost Registry
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                LGD Workshop
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Material and operational unit rates for rolling stock overhaul &amp; maintenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-2 text-xs font-semibold text-slate-600">
            <FileSpreadsheet size={15} className="text-teal-600" />
            <span>Excel XLSX Support</span>
          </div>
        </div>
      </div>

      {/* Upload Section (Admin Only) */}
      {isAdmin ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8 relative overflow-hidden"
        >
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-700/20">
                <Upload size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Upload Unit Cost Sheet</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Import normalized Excel spreadsheet with <code className="font-mono text-teal-700">item</code>,{" "}
                  <code className="font-mono text-teal-700">rate</code>, and{" "}
                  <code className="font-mono text-teal-700">unit</code> columns.
                </p>
              </div>
            </div>

            <div className="w-full">
              <ExcelUploader onFileUpload={handleFileUpload} />
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
            <Lock size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Spreadsheet upload restricted to administrators</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You are currently viewing with read-only permissions.
            </p>
          </div>
        </div>
      )}

      {/* Result Section (Animation preserved) */}
      <AnimatePresence>
        {unitCosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Active Unit Cost Registry</h3>
                  <p className="text-[10px] text-teal-200/60 font-medium">
                    {unitCosts.length} items parsed from spreadsheet
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUnitCosts([])}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs font-semibold gap-1.5"
              >
                <Trash2 size={13} />
                <span>Clear Table</span>
              </Button>
            </div>

            <div className="overflow-x-auto p-2">
              <DataTable columns={columns} data={unitCosts} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {unitCosts.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200">
          <div className="mx-auto w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
            <AlertCircle size={24} className="text-slate-300" />
          </div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Registry Awaiting Data Import
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Upload an Excel (.xlsx / .xls) file above to display unit cost records.
          </p>
        </div>
      )}
    </div>
  );
};

export default UnitCost;
