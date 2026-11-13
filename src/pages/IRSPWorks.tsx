import { useEffect, useState, useCallback, useMemo } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Pencil,
  Trash2,
  Plus,
  Layers,
  AlertCircle,
  Search,
  X,
  CheckCircle2,
  IndianRupee,
} from "lucide-react";
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
import { formatINR, parseAmount } from "../lib/utils";
import { useAuth } from "@/hooks/useAuth";

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
    de_process: "DE under Process",
    de_finance: "DE Sent to Finance",
    de_hqrs: "DE Sent to HQrs",
    indents_placed: "Indents Placed",
    work_process: "Work under Process",
    tender: "Tender Stage",
    completed: "Work Completed",
  };
  return statusMap[status] || status;
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    case "work_process":
    case "de_process":
    case "indents_placed":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "de_finance":
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    case "de_hqrs":
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200/60";
  }
};

const IRSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const loadWorks = useCallback(async () => {
    try {
      const worksQuery = query(collection(db, "works"), where("type", "==", "irsp"));
      const querySnapshot = await getDocs(worksQuery);
      const fetchedWorks: WorkItem[] = [];
      querySnapshot.forEach((d) => {
        fetchedWorks.push({ id: d.id, ...d.data() } as WorkItem);
      });
      setWorks(fetchedWorks);

      const uniqueYears = [
        ...new Set(fetchedWorks.map((w) => w.yearOfSanction).filter(Boolean)),
      ].sort().reverse();
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
    localStorage.setItem("editWork", JSON.stringify(work));
    navigate("/add-works");
  };

  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      const matchesYear = selectedYear === "all" || w.yearOfSanction === selectedYear;
      if (!matchesYear) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.description?.toLowerCase().includes(q) ||
        w.lawNo?.toLowerCase().includes(q) ||
        w.yearOfSanction?.toLowerCase().includes(q) ||
        w.status?.toLowerCase().includes(q)
      );
    });
  }, [works, selectedYear, searchQuery]);

  const totalSanctionedValue = useMemo(() => {
    return filteredWorks.reduce((acc, w) => acc + (parseAmount(w.totalValue) ?? 0), 0);
  }, [filteredWorks]);

  const completedCount = useMemo(() => {
    return filteredWorks.filter((w) => w.status === "completed").length;
  }, [filteredWorks]);

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-sm shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                IRSP Works Program
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {filteredWorks.length} Tracking Elements
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Itemised Rolling Stock Programme &middot; Carriage Workshop LGD
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search description, LAW ref, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs rounded-xl border-slate-200/80 bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {isAdmin && (
            <Button
              onClick={() => {
                localStorage.removeItem("editWork");
                navigate("/add-works");
              }}
              className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 shrink-0"
            >
              <Plus size={15} />
              <span>New Entry</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Strip & Year Filter Bar */}
      <div className="glass-card p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* KPI Mini Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <Layers size={13} className="text-slate-500" />
            <span className="text-slate-500 font-medium">Total:</span>
            <span className="font-bold text-slate-900 font-mono">{filteredWorks.length}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span className="font-medium">Completed:</span>
            <span className="font-bold font-mono">{completedCount}</span>
          </div>

          {totalSanctionedValue > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
              <IndianRupee size={13} className="text-amber-600" />
              <span className="font-medium">Total Value:</span>
              <span className="font-bold font-mono">₹{totalSanctionedValue.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>

        {/* Year Pills Filter */}
        {years.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedYear("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === "all"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Years
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === year
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modern Excel Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-xs font-bold text-slate-700 border-b border-slate-200">
                <th className="w-[24%] px-3.5 py-2.5 text-left border-r border-slate-200/70">
                  Project Description
                </th>
                <th className="w-[8%] px-2 py-2.5 text-center border-r border-slate-200/70">
                  Period
                </th>
                <th className="w-[10%] px-2 py-2.5 text-center border-r border-slate-200/70">
                  LAW Ref
                </th>
                <th className="w-[12%] px-2 py-2.5 text-right border-r border-slate-200/70">
                  Rate
                </th>
                <th className="w-[8%] px-2 py-2.5 text-center border-r border-slate-200/70">
                  Qty
                </th>
                <th className="w-[15%] px-2 py-2.5 text-right border-r border-slate-200/70">
                  Total Value
                </th>
                <th className="w-[13%] px-2 py-2.5 text-center border-r border-slate-200/70">
                  Status
                </th>
                <th className="w-[10%] px-2 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 mt-3 font-medium">Loading IRSP records...</p>
                  </td>
                </tr>
              ) : filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={22} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No matching works found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {searchQuery
                        ? `No IRSP works match your query "${searchQuery}".`
                        : "No IRSP works are registered for the selected period."}
                    </p>
                    {isAdmin && (
                      <Button
                        onClick={() => navigate("/add-works")}
                        className="btn-primary h-8 px-4 text-xs font-semibold rounded-xl mt-3 mx-auto"
                      >
                        <Plus size={14} className="mr-1" />
                        Add First Entry
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr
                    key={work.id}
                    className="hover:bg-amber-50/40 transition-colors group [&>td]:border-r [&>td]:border-slate-100 [&>td:last-child]:border-r-0"
                  >
                    {/* Description */}
                    <TableCell className="px-3.5 py-2">
                      <p
                        className="text-xs font-medium text-slate-800 truncate"
                        title={work.description || "-"}
                      >
                        {work.description || "-"}
                      </p>
                    </TableCell>

                    {/* Period */}
                    <TableCell className="px-2 py-2 text-center">
                      <span className="font-mono text-xs text-slate-600 font-semibold">
                        {work.yearOfSanction || "-"}
                      </span>
                    </TableCell>

                    {/* LAW Ref */}
                    <TableCell className="px-2 py-2 text-center">
                      <span className="font-mono text-xs text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50">
                        {work.lawNo || "-"}
                      </span>
                    </TableCell>

                    {/* Rate */}
                    <TableCell className="px-2 py-2 text-right">
                      <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        {formatINR(work.rate)}
                      </span>
                    </TableCell>

                    {/* Qty */}
                    <TableCell className="px-2 py-2 text-center">
                      <span className="font-mono text-xs text-slate-600">
                        {work.qtySanctioned ? `${work.qtySanctioned}` : "-"}
                      </span>
                    </TableCell>

                    {/* Total Value */}
                    <TableCell className="px-2 py-2 text-right">
                      <span className="font-mono text-xs font-semibold text-amber-700 tabular-nums">
                        {formatINR(work.totalValue)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-2 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border truncate max-w-full ${getStatusStyles(
                          work.status
                        )}`}
                      >
                        {getStatusLabel(work.status)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEdit(work)}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Edit work record"
                            >
                              <Pencil size={13} />
                            </button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this IRSP work?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action will permanently remove this record from the database.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(work.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                  >
                                    Delete Record
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Read-only</span>
                        )}
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
