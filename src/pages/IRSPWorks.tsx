import { useEffect, useState, useCallback } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Pencil, Trash2, Plus, Filter, FileText, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { formatINR } from '../lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface WorkItem {
  id: string;
  type: "rsp" | "irsp";
  description: string;
  lawNo: string;
  yearOfSanction: string;
  rate: string;
  qtySanctioned: string;
  totalValue: string;
  status: string;
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    de_process: "DE under process",
    de_finance: "DE Sent to Finance",
    de_hqrs: "DE sent to HQrs",
    indents_placed: "Indents placed",
    work_process: "Work under process",
    completed: "Work Completed",
  };
  return statusMap[status] || status;
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20";
    case "work_process":
    case "de_process":
    case "indents_placed":
      return "bg-[#0369A1]/10 text-[#0369A1] border-[#0369A1]/20";
    case "de_finance":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "de_hqrs":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

const IRSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const loadWorks = useCallback(async () => {
    try {
      // Server-side filter instead of downloading the whole collection
      const worksQuery = query(collection(db, "works"), where("type", "==", "irsp"));
      const querySnapshot = await getDocs(worksQuery);
      const fetchedWorks: WorkItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedWorks.push({ id: doc.id, ...doc.data() } as WorkItem);
      });
      setWorks(fetchedWorks);

      const uniqueYears = [...new Set(fetchedWorks.map(w => w.yearOfSanction).filter(Boolean))].sort().reverse();
      setYears(uniqueYears);
    } catch (error) {
      console.error("Error fetching works:", error);
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({
        title: "Error fetching works",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadWorks();
  }, [loadWorks]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "works", id));
      await loadWorks();
      toast({ title: "Work Removed", description: "Record successfully excised from system." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleEdit = (work: WorkItem) => {
    localStorage.setItem('editWork', JSON.stringify(work));
    navigate('/add-works');
  };

  const filteredWorks = selectedYear === "all"
    ? works
    : works.filter(w => w.yearOfSanction === selectedYear);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">IRSP Works</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              {filteredWorks.length} Tracking Elements active
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100/50 border border-slate-200/40">
            <Filter size={14} className="text-slate-400 ml-3" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[160px] h-10 bg-transparent border-0 focus:ring-0 text-xs font-bold text-slate-600 uppercase tracking-widest font-display">
                <SelectValue placeholder="Period Overview" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-100 shadow-2xl rounded-2xl p-1">
                <SelectItem value="all" className="rounded-xl font-bold">All Sanction Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year} className="rounded-xl font-bold">{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <Button 
              onClick={() => {
                localStorage.removeItem('editWork');
                navigate('/add-works');
              }} 
              className="btn-primary h-12 px-8"
            >
              <Plus size={20} /> New Entry
            </Button>
          )}
        </div>
      </div>

      {/* Modern Table Grid */}
      <div className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-xs font-semibold text-slate-700">
                <th className="w-[23%] px-3 py-2 text-left border border-slate-300">Project Description</th>
                <th className="w-[9%] px-2 py-2 text-center border border-slate-300">Period</th>
                <th className="w-[10%] px-2 py-2 text-center border border-slate-300">LAW Ref</th>
                <th className="w-[12%] px-2 py-2 text-right border border-slate-300">Rate Unit</th>
                <th className="w-[8%] px-2 py-2 text-center border border-slate-300">Qty</th>
                <th className="w-[14%] px-2 py-2 text-center border border-slate-300">Status</th>
                <th className="w-[14%] px-2 py-2 text-right border border-slate-300">Valuation</th>
                <th className="w-[10%] px-2 py-2 text-right border border-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center border border-slate-300">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 font-medium mt-6">Loading records...</p>
                  </td>
                </tr>
              ) : filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center border border-slate-300">
                    <div className="mx-auto w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                      <AlertCircle size={32} className="text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 font-display tracking-tight">System holds no IRSP records</h3>
                    <p className="text-slate-400 font-medium text-lg mt-2 mb-8">No work elements match your current filter criteria.</p>
                    {isAdmin && (
                      <Button onClick={() => navigate('/add-works')} className="btn-primary-glow h-12 px-8 rounded-xl font-bold">
                        Add Initial Entry
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr
                    key={work.id}
                    className="hover:bg-sky-50/60 transition-colors group [&>td]:border [&>td]:border-slate-300 [&>td]:overflow-hidden"
                  >
                    <TableCell className="px-3 py-1.5">
                      <span className="block truncate text-xs font-semibold text-slate-800 group-hover:text-sky-600 transition-colors" title={work.description || '-'}>{work.description || '-'}</span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <span className="block truncate text-xs font-semibold text-slate-500" title={work.yearOfSanction || '-'}>{work.yearOfSanction || '-'}</span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <span className="block truncate text-xs font-mono font-semibold text-slate-400" title={work.lawNo || '-'}>{work.lawNo || '-'}</span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-right">
                      <span className="block truncate text-xs font-semibold text-slate-600 tabular-nums" title={work.rate || '-'}>{work.rate || '-'}</span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <span className="block truncate text-xs font-semibold text-slate-600" title={work.qtySanctioned || '-'}>{work.qtySanctioned || '-'}</span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <span className={`inline-block max-w-full break-words rounded-md border px-1.5 py-0.5 text-xs font-semibold uppercase leading-tight ${getStatusStyles(work.status)}`} title={getStatusLabel(work.status)}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-right">
                      <span className="block truncate text-xs font-semibold text-slate-900 tabular-nums" title={formatINR(work.totalValue)}>
                        {formatINR(work.totalValue)}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-right">
                      {isAdmin ? (
                      <div className="flex items-center justify-end gap-1 xl:gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${work.description || 'work'}`} className="h-6 w-6 xl:h-8 xl:w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl" onClick={() => handleEdit(work)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Delete ${work.description || 'work'}`} className="h-6 w-6 xl:h-8 xl:w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] border-none shadow-[25px_25px_60px_rgba(0,0,0,0.15)] bg-white p-10 max-w-lg">
                            <AlertDialogHeader>
                              <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 text-red-600 flex items-center justify-center mb-6 shadow-inner ring-8 ring-red-50/50">
                                <Trash2 size={32} />
                              </div>
                              <AlertDialogTitle className="text-3xl font-display font-bold text-slate-900 spacing-tight">Remove record?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400 text-lg font-medium leading-relaxed pt-3">
                                This action is permanent and will remove this IRSP work element from all financial tracking logs.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-10 gap-4">
                              <AlertDialogCancel className="h-14 flex-1 border-slate-100 text-slate-500 rounded-2xl hover:bg-slate-50 font-bold px-6">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(work.id)} className="h-14 flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-200 font-bold px-8">
                                Confirm Removal
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      ) : (
                        <span className="text-xs text-slate-300">&mdash;</span>
                      )}
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IRSPWorks;