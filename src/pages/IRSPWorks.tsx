import React, { useEffect, useState } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Pencil, Trash2, Plus, Filter, FileText, AlertCircle, IndianRupee } from "lucide-react";
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
import { db } from "../main";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
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
      return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20";
    case "work_process":
    case "de_process":
      return "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/20";
    case "indents_placed":
      return "bg-cyan-50 text-cyan-600 border-cyan-100 shadow-cyan-100/20";
    case "de_finance":
      return "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/20";
    case "de_hqrs":
      return "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/20";
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

const IRSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadWorks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "works"));
      const fetchedWorks: WorkItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'irsp') {
          fetchedWorks.push({ id: doc.id, ...data } as WorkItem);
        }
      });
      setWorks(fetchedWorks);
      
      const uniqueYears = [...new Set(fetchedWorks.map(w => w.yearOfSanction).filter(Boolean))].sort().reverse();
      setYears(uniqueYears);
    } catch (error: any) {
      console.error("Error fetching works:", error);
      toast({
        title: "Error fetching works",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadWorks();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "works", id));
      await loadWorks();
      toast({ title: "Work Removed", description: "Record successfully excised from system." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner border border-cyan-100/50">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">IRSP Works</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.1em] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
              {filteredWorks.length} Tracking Elements active
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/50 border border-slate-200/40 backdrop-blur-md">
            <Filter size={14} className="text-slate-400 ml-3" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[160px] h-10 bg-transparent border-0 focus:ring-0 text-xs font-black text-slate-600 uppercase tracking-widest">
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

          <Button 
            onClick={() => {
              localStorage.removeItem('editWork');
              navigate('/add-works');
            }} 
            className="btn-primary-glow h-12 px-8 rounded-2xl text-sm font-black transition-all hover:-translate-y-0.5"
          >
            <Plus className="mr-2 h-5 w-5" /> New IRSP Work 
          </Button>
        </div>
      </div>

      {/* Modern Table Grid */}
      <div className="glass-card border-none shadow-premium-shadow overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 z-20 table-header-glow">
              <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 font-['Plus_Jakarta_Sans']">
                <th className="px-8 py-6 w-[30%]">Project Description</th>
                <th className="px-6 py-6 w-[10%] text-center">Period</th>
                <th className="px-6 py-6 w-[10%] text-center">LAW Ref</th>
                <th className="px-6 py-6 w-[10%] text-center">Rate Unit</th>
                <th className="px-6 py-6 w-[8%] text-center">Quantity</th>
                <th className="px-6 py-6 w-[14%]">Current Status</th>
                <th className="px-6 py-6 w-[12%]">Valuation</th>
                <th className="px-6 py-6 w-[6%] text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center">
                    <div className="mx-auto w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                      <AlertCircle size={32} className="text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 font-['Plus_Jakarta_Sans'] tracking-tight">System holds no IRSP records</h3>
                    <p className="text-slate-400 font-medium text-lg mt-2 mb-8">No work elements match your current filter criteria.</p>
                    <Button onClick={() => navigate('/add-works')} className="btn-primary-glow h-12 px-8 rounded-xl font-bold">
                      Add Initial Entry
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr key={work.id} className="premium-table-row transition-all duration-500 group border-l-4 border-l-transparent hover:border-l-cyan-400">
                    <TableCell className="px-8 py-6 font-extrabold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors font-['Plus_Jakarta_Sans']">{work.description || '-'}</TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="px-3 py-1 bg-slate-50 text-[11px] font-black font-['Plus_Jakarta_Sans'] text-slate-500 rounded-lg border border-slate-100">{work.yearOfSanction || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="font-mono text-xs font-black tracking-widest text-slate-400">{work.lawNo || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center text-slate-500 font-bold text-xs">{work.rate || '-'}</TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="text-[11px] font-black text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">{work.qtySanctioned || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm transition-all duration-500 font-['Plus_Jakarta_Sans'] ${getStatusStyles(work.status)}`}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-black text-primary/40 leading-none">₹</span>
                        <span className="text-base font-black text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tighter">{work.totalValue || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right pr-10">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl" onClick={() => handleEdit(work)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] border-none shadow-[25px_25px_60px_rgba(0,0,0,0.15)] bg-white p-10 max-w-lg">
                            <AlertDialogHeader>
                              <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 text-red-600 flex items-center justify-center mb-6 shadow-inner ring-8 ring-red-50/50">
                                <Trash2 size={32} />
                              </div>
                              <AlertDialogTitle className="text-3xl font-['Plus_Jakarta_Sans'] font-black text-slate-900 spacing-tight">Remove record?</AlertDialogTitle>
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