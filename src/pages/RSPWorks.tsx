import { TableCell } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Pencil, Trash2, Plus, FileText, Calendar } from "lucide-react";
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
import { useState, useEffect } from "react";

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

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    work_process: "bg-blue-50 text-blue-700 border-blue-200",
    tender: "bg-violet-50 text-violet-700 border-violet-200",
    de_process: "bg-amber-50 text-amber-700 border-amber-200",
    de_finance: "bg-orange-50 text-orange-700 border-orange-200",
    de_hqrs: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return colorMap[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

const RSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
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
      if (!workId) {
        throw new Error("Work ID is required for deletion");
      }
      
      const workRef = doc(db, "works", workId);
      await deleteDoc(workRef);
      
      toast({
        title: "Success",
        description: "Work deleted successfully",
      });
      
      await loadWorks();
    } catch (error: any) {
      console.error("Error deleting work:", error);
      toast({
        title: "Error",
        description: "Failed to delete work: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (work: WorkItem) => {
    try {
      if (!work || !work.id) {
        throw new Error("Invalid work data for editing");
      }

      localStorage.setItem('editWork', JSON.stringify(work));
      navigate('/add-works');
    } catch (error: any) {
      console.error("Error preparing work for edit:", error);
      toast({
        title: "Error",
        description: "Failed to edit work: " + error.message,
        variant: "destructive",
      });
    }
  };

  const filteredWorks = selectedYear === "all" 
    ? works 
    : works.filter(work => work.yearOfSanction === selectedYear);

  return (
    <div className="space-y-6 pb-10">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Overview</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{filteredWorks.length} works recorded</p>
          </div>
        </div>
        
        {years.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <div className="flex items-center gap-1.5 mr-2">
              <Calendar size={14} className="text-slate-400" />
            </div>
            <button
              onClick={() => setSelectedYear("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${selectedYear === "all" ? "bg-primary text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              All
            </button>
            {years.map((year) => {
              const count = works.filter(w => w.yearOfSanction === year).length;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${selectedYear === year ? "bg-primary text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                >
                  {year} <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${selectedYear === year ? "bg-white/20 text-white" : "bg-white text-slate-400 border border-slate-200"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table Area */}
      <div className="premium-card overflow-hidden flex flex-col">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4 w-[28%] font-medium">Description</th>
                <th className="px-4 py-4 w-[8%] font-medium">Year</th>
                <th className="px-4 py-4 w-[8%] font-medium">PB No</th>
                <th className="px-4 py-4 w-[10%] font-medium">Cost</th>
                <th className="px-4 py-4 w-[8%] font-medium">Qty</th>
                <th className="px-4 py-4 w-[10%] font-medium">DE Value</th>
                <th className="px-4 py-4 w-[14%] font-medium">Status</th>
                <th className="px-4 py-4 w-[14%] font-medium">Remarks</th>
                <th className="px-4 py-4 w-[8%] text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                      <FileText size={20} className="text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm">No works found</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {selectedYear !== "all" ? `No entries for ${selectedYear}.` : "Start by adding a new work entry."}
                    </p>
                    <Button onClick={() => navigate('/add-works')} variant="outline" size="sm" className="mt-4 text-primary border-primary/20 hover:bg-primary/5">
                      <Plus size={14} className="mr-1.5" /> Add Work
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr key={work.id} className="hover:bg-slate-50/80 transition-colors duration-150 text-sm group">
                    <TableCell className="px-5 py-3.5 font-medium text-slate-800 break-words">{work.description || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-600">{work.yearOfSanction || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-600">{work.pbNo || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-600 font-medium">{work.rbSanctionedCost || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-600">{work.qtySanctioned || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-600">{work.deTotalValue || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${getStatusColor(work.status)}`}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-500 text-xs truncate max-w-[150px]" title={work.remarks}>
                      {work.remarks || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg" onClick={() => handleEdit(work)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-0 shadow-2xl bg-white sm:max-w-[425px]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl text-slate-800">Delete Work</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500">
                                Are you sure you want to delete this work? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6">
                              <AlertDialogCancel className="border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(work.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm">
                                Delete Work
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