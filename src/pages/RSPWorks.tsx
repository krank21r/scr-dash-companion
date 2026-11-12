import { useState, useEffect, useCallback } from "react";
import { TableCell } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Pencil, Trash2, Plus, FileText, AlertCircle } from "lucide-react";
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
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { formatINR } from '../lib/utils';
import { useAuth } from '@/hooks/useAuth';

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
    indents_placed: "Indents Placed",
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
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const loadWorks = useCallback(async () => {
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

  const handleDelete = async (workId: string) => {
    try {
      if (!workId) throw new Error("ID required");
      await deleteDoc(doc(db, "works", workId));
      toast({ title: "Deleted", description: "Record removed successfully." });
      await loadWorks();
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

          {isAdmin && (
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
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-xs font-semibold text-slate-700">
                <th className="w-[22%] px-3 py-2 text-left border border-slate-300">Description</th>
                <th className="w-[8%] px-2 py-2 text-center border border-slate-300">Year</th>
                <th className="w-[10%] px-2 py-2 text-center border border-slate-300">PB No</th>
                <th className="w-[15%] px-2 py-2 text-right border border-slate-300">Sanctioned Cost</th>
                <th className="w-[8%] px-2 py-2 text-center border border-slate-300">Qty</th>
                <th className="w-[15%] px-2 py-2 text-right border border-slate-300">DE Value</th>
                <th className="w-[12%] px-2 py-2 text-center border border-slate-300">Status</th>
                <th className="w-[10%] px-2 py-2 text-right border border-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 mt-4">Loading records...</p>
                  </td>
                </tr>
              ) : filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">No RSP works registered</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Start by adding your first RSP work to the system.
                    </p>
                    {isAdmin && (
                      <Button onClick={() => navigate('/add-works')} className="btn-primary px-6">
                        <Plus size={16} className="mr-2" />
                        Add Work
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
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate" title={work.description || '-'}>{work.description || '-'}</p>
                        {work.remarks && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate" title={work.remarks}>"{work.remarks}"</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <span className="block truncate text-xs font-semibold text-slate-500" title={work.yearOfSanction || '-'}>{work.yearOfSanction || '-'}</span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <span className="block truncate text-xs font-mono font-semibold text-slate-400" title={work.pbNo || '-'}>{work.pbNo || '-'}</span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-right">
                      <span className="block truncate text-xs font-semibold text-slate-900 tabular-nums" title={formatINR(work.rbSanctionedCost)}>
                        {formatINR(work.rbSanctionedCost)}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <span className="block truncate text-xs font-semibold text-slate-600" title={work.qtySanctioned || '-'}>{work.qtySanctioned || '-'}</span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-right">
                      <span className="block truncate text-xs font-medium text-slate-600 tabular-nums" title={formatINR(work.deTotalValue)}>
                        {formatINR(work.deTotalValue)}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <span className={`inline-block max-w-full break-words rounded-md border px-1.5 py-0.5 text-xs font-semibold leading-tight ${getStatusStyles(work.status)}`} title={getStatusLabel(work.status)}>
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${work.description || 'work'}`}
                            className="h-6 w-6 xl:h-8 xl:w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md"
                            onClick={() => handleEdit(work)}
                          >
                            <Pencil size={15} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Delete ${work.description || 'work'}`}
                                className="h-6 w-6 xl:h-8 xl:w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
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

export default RSPWorks;