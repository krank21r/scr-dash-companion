import React, { useState, useEffect } from "react";
import { TableCell } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Pencil, Trash2, Plus, FileText, Calendar, Filter, AlertCircle, IndianRupee, ArrowUpRight, Search } from "lucide-react";
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
import { motion } from "framer-motion";

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
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "work_process":
    case "de_process":
      return "bg-primary/10 text-primary border-primary/20";
    case "tender":
      return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    case "de_finance":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "de_hqrs":
      return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const RSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredWorks = works.filter(work => {
    const matchesYear = selectedYear === "all" || work.yearOfSanction === selectedYear;
    const matchesSearch = work.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         work.pbNo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">RSP Works</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-12 pr-4 w-64 rounded-2xl bg-muted/50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            />
          </div>
          <Button 
            onClick={() => {
              localStorage.removeItem('editWork');
              navigate('/add-works');
            }} 
            className="btn-premium h-11 px-6 rounded-2xl"
          >
            <Plus className="mr-2 h-4 w-4" /> New Work
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/30 border border-border/50 w-fit overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedYear("all")}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedYear === "all" ? "bg-card text-primary shadow-lg border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
        >
          Overview
        </button>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedYear === year ? "bg-card text-primary shadow-lg border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border-none shadow-2xl shadow-primary/5">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Period</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">PB No</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sanctioned Cost</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Quantity</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Valuation</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center bg-muted/5">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <AlertCircle size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-xl font-bold text-foreground">No records found</h3>
                      <p className="text-sm font-medium mt-2">Try adjusting your filters or add a new entry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr key={work.id} className="group hover:bg-primary/[0.02] transition-colors">
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors leading-relaxed">{work.description || '-'}</span>
                        {work.remarks && <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1 italic">"{work.remarks}"</span>}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="px-3 py-1.5 rounded-xl bg-muted font-mono text-[11px] font-bold text-muted-foreground border border-border/50">{work.yearOfSanction || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="font-mono text-xs font-bold text-muted-foreground/60">{work.pbNo || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-primary/30">₹</span>
                        <span className="text-base font-extrabold text-foreground tracking-tight stat-number">{work.rbSanctionedCost || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="text-xs font-bold text-foreground bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">{work.qtySanctioned || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-muted-foreground/30">₹</span>
                        <span className="text-sm font-bold text-muted-foreground/80">{work.deTotalValue || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border tracking-wider uppercase transition-all duration-300 ${getStatusStyles(work.status)}`}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right pr-10">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl" onClick={() => handleEdit(work)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2rem] border-none glass-card p-10 max-w-lg shadow-2xl">
                            <AlertDialogHeader>
                              <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-inner border border-destructive/20">
                                <Trash2 size={28} />
                              </div>
                              <AlertDialogTitle className="text-3xl font-extrabold text-foreground tracking-tight">Remove record?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground text-lg font-medium leading-relaxed pt-2">
                                This will permanently delete the record. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-10 gap-4">
                              <AlertDialogCancel className="h-14 flex-1 border-border rounded-xl font-bold text-muted-foreground">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(work.id)} className="h-14 flex-1 bg-destructive hover:bg-destructive/90 text-white rounded-xl shadow-lg shadow-destructive/20 font-bold">
                                Confirm Delete
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