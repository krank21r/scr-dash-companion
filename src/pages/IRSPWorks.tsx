import React, { useEffect, useState } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Pencil, Trash2, Plus, Filter, FileText, AlertCircle, IndianRupee, Search, Activity } from "lucide-react";
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
import { motion } from "framer-motion";

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
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "work_process":
    case "de_process":
      return "bg-primary/10 text-primary border-primary/20";
    case "indents_placed":
      return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
    case "de_finance":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "de_hqrs":
      return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const IRSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      toast({ title: "Work Removed", description: "Record successfully excised." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (work: WorkItem) => {
    localStorage.setItem('editWork', JSON.stringify(work));
    navigate('/add-works');
  };

  const filteredWorks = works.filter(w => {
    const matchesYear = selectedYear === "all" || w.yearOfSanction === selectedYear;
    const matchesSearch = w.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         w.lawNo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shadow-inner">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">IRSP Works</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-12 pr-4 w-60 rounded-2xl bg-muted/50 border-none outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm font-medium"
            />
          </div>
          <Button 
            onClick={() => {
              localStorage.removeItem('editWork');
              navigate('/add-works');
            }} 
            className="h-11 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-lg shadow-cyan-500/20"
          >
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-md">
          <Filter size={14} className="text-muted-foreground ml-3" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] h-9 bg-transparent border-0 focus:ring-0 text-xs font-black text-foreground uppercase tracking-widest">
              <SelectValue placeholder="All Sanctions" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-card shadow-2xl">
              <SelectItem value="all" className="font-bold">Reset Filters</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year} className="font-bold">{year} Records</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Period</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">LAW No</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Unit Rate</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Qty</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Value</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right pr-10">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center bg-muted/5">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <AlertCircle size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-xl font-bold text-foreground">Empty Registry</h3>
                      <p className="text-sm font-medium mt-2">No historical data found for current parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr key={work.id} className="group hover:bg-cyan-500/[0.02] transition-colors border-l-4 border-l-transparent hover:border-l-cyan-500">
                    <TableCell className="px-8 py-6">
                      <span className="font-bold text-foreground text-sm leading-relaxed block group-hover:text-cyan-600 transition-colors">{work.description || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="px-3 py-1 bg-muted rounded-xl text-[11px] font-bold text-muted-foreground border border-border/50">{work.yearOfSanction || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="font-mono text-xs font-bold text-muted-foreground/60 tracking-wider p-1.5 rounded-lg bg-muted/50">{work.lawNo || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center text-muted-foreground font-bold text-xs">{work.rate || '-'}</TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <span className="text-[11px] font-black text-foreground bg-cyan-500/5 px-3 py-1.5 rounded-full border border-cyan-500/10 shadow-sm">{work.qtySanctioned || '-'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider transition-all duration-300 ${getStatusStyles(work.status)}`}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-cyan-500/30">₹</span>
                        <span className="text-base font-extrabold text-foreground tracking-tight stat-number">{work.totalValue || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right pr-10">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10 rounded-xl" onClick={() => handleEdit(work)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-xl">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] border-none glass-card p-10 max-w-lg shadow-2xl">
                            <AlertDialogHeader>
                              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6 shadow-inner border border-rose-500/20">
                                <Trash2 size={28} />
                              </div>
                              <AlertDialogTitle className="text-3xl font-extrabold text-foreground tracking-tight">Excise record?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground text-lg font-medium leading-relaxed pt-2">
                                Permanent erasure requested. This element will be purged from the IRSP registry database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-10 gap-4">
                              <AlertDialogCancel className="h-14 flex-1 border-border rounded-xl font-bold text-muted-foreground">Preserve</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(work.id)} className="h-14 flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-500/20 font-bold">
                                Purge Record
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