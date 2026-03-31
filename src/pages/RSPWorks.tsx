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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">RSP Works</h1>
              <p className="text-sm text-slate-500">{filteredWorks.length} works found</p>
            </div>
          </div>
          <Button onClick={() => {
            localStorage.removeItem('editWork');
            navigate('/add-works');
          }} className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 rounded-xl h-10 self-end">
            <Plus className="mr-2 h-4 w-4" /> Add Work
          </Button>
        </div>

        {/* Year Cards */}
        {years.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-500">Filter by Year</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedYear("all")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedYear === "all" ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-200 hover:text-violet-600"}`}
              >
                All Years
              </button>
              {years.map((year) => {
                const count = works.filter(w => w.yearOfSanction === year).length;
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedYear === year ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-200 hover:text-violet-600"}`}
                  >
                    {year} <span className="ml-1 text-xs opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 w-[30%]">Description</th>
                  <th className="px-4 py-3 w-[8%]">Year</th>
                  <th className="px-4 py-3 w-[8%]">PB No</th>
                  <th className="px-4 py-3 w-[12%]">Cost</th>
                  <th className="px-4 py-3 w-[8%]">Qty</th>
                  <th className="px-4 py-3 w-[8%]">Allot</th>
                  <th className="px-4 py-3 w-[10%]">DE Value</th>
                  <th className="px-4 py-3 w-[10%]">Status</th>
                  <th className="px-4 py-3 w-[10%]">Remarks</th>
                  <th className="px-4 py-3 w-[6%]">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <FileText size={40} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm">
                        No RSP works found for {selectedYear !== "all" ? `year ${selectedYear}` : "any year"}.
                      </p>
                      <Button onClick={() => navigate('/add-works')} variant="link" className="text-violet-600 mt-2">
                        <Plus size={16} className="mr-1" /> Add Work
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredWorks.map((work) => (
                    <tr key={work.id} className="hover:bg-slate-50/80 transition-colors duration-150 text-sm">
                      <TableCell className="px-4 py-3 font-medium text-slate-900 break-words">{work.description || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">{work.yearOfSanction || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">{work.pbNo || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">{work.rbSanctionedCost || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">{work.qtySanctioned || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">{work.qtyAllotted || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">{work.deTotalValue || '-'}</TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusColor(work.status)}`}>
                          {getStatusLabel(work.status)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-500 truncate" title={work.remarks}>{work.remarks || '-'}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-violet-50 hover:text-violet-600" onClick={() => handleEdit(work)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Work</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this work? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(work.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
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
    </div>
  );
};

export default RSPWorks;