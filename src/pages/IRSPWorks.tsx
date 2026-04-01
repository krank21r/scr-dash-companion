import { useEffect, useState } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Pencil, Trash2, Plus, Filter, FileText } from "lucide-react";
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

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    work_process: "bg-blue-50 text-blue-700 border-blue-200",
    tender: "bg-violet-50 text-violet-700 border-violet-200",
    indents_placed: "bg-cyan-50 text-cyan-700 border-cyan-200",
    de_process: "bg-amber-50 text-amber-700 border-amber-200",
    de_finance: "bg-orange-50 text-orange-700 border-orange-200",
    de_hqrs: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return colorMap[status] || "bg-slate-50 text-slate-700 border-slate-200";
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
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid work ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "works", id));
      await loadWorks();
      toast({
        title: "Work Deleted",
        description: "The work has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting work:", error);
      toast({
        title: "Error deleting work",
        description: error.message,
        variant: "destructive",
      });
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
    <div className="space-y-6 pb-10">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Overview</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{filteredWorks.length} works recorded</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {years.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 bg-slate-50 border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="premium-card overflow-hidden flex flex-col">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4 w-[35%] font-medium">Description</th>
                <th className="px-4 py-4 w-[10%] font-medium">Year</th>
                <th className="px-4 py-4 w-[10%] font-medium">LAW No</th>
                <th className="px-4 py-4 w-[10%] font-medium">Rate</th>
                <th className="px-4 py-4 w-[8%] font-medium">Qty</th>
                <th className="px-4 py-4 w-[12%] font-medium">Status</th>
                <th className="px-4 py-4 w-[10%] font-medium">Total</th>
                <th className="px-4 py-4 w-[5%] text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
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
                    <TableCell className="px-4 py-3.5 text-slate-600 font-medium">{work.lawNo || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-600">{work.rate || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-600">{work.qtySanctioned || '-'}</TableCell>
                    <TableCell className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${getStatusColor(work.status)}`}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-600">{work.totalValue || '-'}</TableCell>
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

export default IRSPWorks;