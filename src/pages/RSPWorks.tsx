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
    de_process: "DE under Process",
    de_finance: "DE Sent to Finance",
    de_hqrs: "DE Sent to HQrs",
    work_process: "Work under Process",
    tender: "Tender",
    completed: "Completed",
  };
  return statusMap[status] || status;
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "work_process":
    case "de_process":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "tender":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "de_finance":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "de_hqrs":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
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
      if (!workId) throw new Error("ID required");
      await deleteDoc(doc(db, "works", workId));
      toast({ title: "Deleted", description: "Record removed successfully." });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">RSP Works</h1>
            <p className="text-sm text-slate-500 font-medium">
              {filteredWorks.length} records found
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          {years.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setSelectedYear("all")}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
                  selectedYear === "all" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                All
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
                    selectedYear === year ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          <Button
            onClick={() => {
              localStorage.removeItem('editWork');
              navigate('/add-works');
            }}
            className="btn-primary h-10 px-5"
          >
            <Plus size={18} />
            New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Description</th>
                <th className="px-4 py-4 text-center">Year</th>
                <th className="px-4 py-4 text-center">PB No</th>
                <th className="px-4 py-4">Sanctioned Cost</th>
                <th className="px-4 py-4 text-center">Quantity</th>
                <th className="px-4 py-4">DE Value</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">No RSP works registered</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-4">
                      Start by adding your first RSP work to the system.
                    </p>
                    <Button onClick={() => navigate('/add-works')} className="btn-primary px-6">
                      <Plus size={16} className="mr-2" />
                      Add Work
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{work.description || '-'}</p>
                        {work.remarks && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[250px]">"{work.remarks}"</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <span className="text-xs font-semibold text-slate-500">{work.yearOfSanction || '-'}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <span className="text-xs font-mono font-semibold text-slate-400">{work.pbNo || '-'}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-slate-400">₹</span>
                        <span className="text-sm font-semibold text-slate-900">{work.rbSanctionedCost || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <span className="text-xs font-semibold text-slate-600">{work.qtySanctioned || '-'}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-slate-400">₹</span>
                        <span className="text-sm font-medium text-slate-600">{work.deTotalValue || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusStyles(work.status)}`}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md"
                          onClick={() => handleEdit(work)}
                        >
                          <Pencil size={15} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl border-none shadow-xl max-w-md">
                            <AlertDialogHeader>
                              <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} />
                              </div>
                              <AlertDialogTitle className="text-xl font-bold text-slate-900 text-center">
                                Delete this record?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500 text-center">
                                This action will permanently remove the record from the database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 gap-2">
                              <AlertDialogCancel className="flex-1 h-11 rounded-lg border-slate-200 font-semibold">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(work.id)}
                                className="flex-1 h-11 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
                              >
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
  );
};

export default RSPWorks;