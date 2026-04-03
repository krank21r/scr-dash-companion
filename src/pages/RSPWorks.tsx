import React, { useState, useEffect } from "react";
import { TableCell } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Pencil, Trash2, Plus, FileText, Calendar, Filter, AlertCircle, IndianRupee } from "lucide-react";
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
} from '../components/ui/alert-dialog';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from "react-router-dom";
import { db } from '../main';
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";

interface WorkItem {
  id: string;
  type: "rsp" | "irsp";
  description: string;
  yearOfSanction: string;
  pbNo: string;
  rbSanctionedCost: string;
  qtySanctioned: string;
  qtyAllotted: string;
  deTotalValue: string;
  remarks: string;
  status: string;
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    de_process: "DE under process",
    de_finance: "DE Sent to Finance",
    de_hqrs: "DE sent to HQrs",
    work_process: "Work under process",
    tender: "Tender stage",
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
    case "tender":
      return "bg-violet-50 text-violet-600 border-violet-100 shadow-violet-100/20";
    case "de_finance":
      return "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/20";
    case "de_hqrs":
      return "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/20";
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

const RSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadWorks = async () => {
    try {
      const worksQuery = query(collection(db, "works"), where("type", "==", "rsp"));
      const querySnapshot = await getDocs(worksQuery);
      const fetchedWorks: WorkItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedWorks.push({ 
          ...doc.data(), 
          id: doc.id 
        } as WorkItem);
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDelete = async (workId: string) => {
    try {
      if (!workId) throw new Error("Work ID is required");
      await deleteDoc(doc(db, "works", workId));
      toast({ title: "Success", description: "Project entry removed." });
      await loadWorks();
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
    : works.filter(work => work.yearOfSanction === selectedYear);

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Filter Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pointer-events-auto">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner border border-blue-100/50">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">RSP Works</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.1em] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              {filteredWorks.length} Records
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1.5 rounded-[1.25rem] bg-slate-100/50 border border-slate-200/40 backdrop-blur-md">
            <button
              onClick={() => setSelectedYear("all")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${selectedYear === "all" ? "bg-white text-primary shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"}`}
            >
              Overview
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${selectedYear === year ? "bg-white text-primary shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"}`}
              >
                {year}
              </button>
            ))}
          </div>

          <Button 
            onClick={() => {
              localStorage.removeItem('editWork');
              navigate('/add-works');
            }} 
            className="btn-primary-glow h-12 px-8 rounded-2xl text-sm font-black transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="mr-2 h-5 w-5" /> New Work Entry
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card border-none shadow-premium-shadow overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20 table-header-glow">
              <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 font-['Plus_Jakarta_Sans']">
                <th className="px-8 py-6 w-[25%]">Description</th>
                <th className="px-6 py-6 w-[8%] text-center">Year</th>
                <th className="px-6 py-6 w-[8%] text-center">PB No</th>
                <th className="px-6 py-6 w-[12%]">Sanctioned Cost</th>
                <th className="px-6 py-6 w-[10%] text-center">Quantity</th>
                <th className="px-6 py-6 w-[12%]">DE Value</th>
                <th className="px-6 py-6 w-[15%]">Tracked Status</th>
                <th className="px-6 py-6 w-[10%] text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center">
                    <div className="mx-auto w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                      <AlertCircle size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 font-['Plus_Jakarta_Sans'] tracking-tight">No works found</h3>
                    <p className="text-slate-400 font-medium text-lg mt-2 mb-8 max-w-md mx-auto leading-relaxed">
                      Initialize your project tracking by adding your first RSP work element to the system.
                    </p>
                    <Button onClick={() => navigate('/add-works')} className="btn-primary-glow h-14 px-10 rounded-[1.25rem] font-black text-base">
                      Initialize Database
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr key={work.id} className="premium-table-row transition-all duration-500 group border-l-4 border-l-transparent hover:border-l-primary">
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors font-['Plus_Jakarta_Sans']">{work.description || '-'}</span>
                        {work.remarks && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity italic">"{work.remarks}"</span>}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-50 text-[11px] font-black font-['Plus_Jakarta_Sans'] text-slate-500 border border-slate-100/50">{work.yearOfSanction || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="font-mono text-xs font-black tracking-widest text-slate-400 bg-slate-100/30 px-2.5 py-1 rounded-md">{work.pbNo || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-black text-primary/40 leading-none">₹</span>
                        <span className="text-base font-black text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tighter">{work.rbSanctionedCost || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="text-xs font-black text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 shadow-sm">{work.qtySanctioned || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-black text-slate-300 leading-none">₹</span>
                        <span className="text-sm font-bold text-slate-600 font-['Plus_Jakarta_Sans']">{work.deTotalValue || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border tracking-[0.05em] uppercase shadow-sm transition-all duration-500 font-['Plus_Jakarta_Sans'] ${getStatusStyles(work.status)}`}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right pr-10">
                      <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-[1rem] ring-4 ring-transparent hover:ring-primary/5" onClick={() => handleEdit(work)}>
                          <Pencil className="h-4.5 w-4.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[1rem] ring-4 ring-transparent hover:ring-red-50">
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[3rem] border-none shadow-[25px_25px_60px_rgba(0,0,0,0.15)] bg-white p-12 max-w-xl">
                            <AlertDialogHeader>
                              <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-600 flex items-center justify-center mb-8 shadow-inner ring-[12px] ring-red-50/50">
                                <Trash2 size={40} />
                              </div>
                              <AlertDialogTitle className="text-4xl font-['Plus_Jakarta_Sans'] font-black text-slate-900 tracking-tight leading-tight">Excise this element?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400 text-xl font-medium leading-relaxed pt-3">
                                This will permanently remove the record from your database. All associated tracking data will be lost.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-12 gap-5">
                              <AlertDialogCancel className="h-16 flex-1 border-slate-100 text-slate-500 rounded-[1.5rem] hover:bg-slate-50 font-black px-8 text-base shadow-sm">Preserve</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(work.id)} className="h-16 flex-1 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] shadow-2xl shadow-red-200 font-black px-10 text-base">
                                Delete Permanently
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

export default RSPWorks;