import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  Plus,
  ChevronRight,
  AlertCircle,
  Layout,
  Clock,
  Trash2,
  Edit3,
  IndianRupee,
  Layers,
  ArrowUpRight,
  PieChart,
  CheckCircle2,
} from "lucide-react";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { DataTable } from "../components/ui/data-table";
import { collection, deleteDoc, doc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db, notesCollection } from "@/lib/firebase";
import { useToast } from "../hooks/use-toast";
import { parseAmount, formatDisplayDate, formatINR } from "../lib/utils";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface WorkItem {
  id: string;
  type: "rsp" | "irsp";
  description: string;
  yearOfSanction: string;
  status: string;
}

interface NoteItem {
  id: string;
  text: string;
  createdAt: string;
}

interface ContingencyItem {
  id: string;
  description: string;
  totalAmount: string;
  expenditures?: { amount: string; balance: string; remarks: string }[];
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = 0;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    let rafId = 0;
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value]);
  return <span>{display.toLocaleString("en-IN")}</span>;
};

const HomePage = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [contingencies, setContingencies] = useState<ContingencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NoteItem | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [worksSnapshot, notesSnapshot, contingenciesSnapshot] = await Promise.all([
          getDocs(collection(db, "works")),
          getDocs(query(notesCollection, orderBy("createdAt", "desc"), limit(8))),
          getDocs(collection(db, "contingencies")),
        ]);

        setWorks(worksSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as WorkItem[]);
        setNotes(
          notesSnapshot.docs.map((d) => ({
            id: d.id,
            text: d.data().text,
            createdAt: formatDisplayDate(d.data().createdAt, "Recent"),
          })) as NoteItem[]
        );
        setContingencies(
          contingenciesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ContingencyItem[]
        );
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Could not load dashboard",
          description: "Some numbers may be unavailable. Check your connection.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const confirmDeleteNote = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(notesCollection, deleteTarget.id));
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    } catch (e) {
      console.error(e);
      toast({ title: "Could not delete task", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    setDialogOpen(true);
  };

  const statusLabels: Record<string, string> = {
    de_process: "DE under Process",
    de_finance: "DE Sent to Finance",
    de_hqrs: "DE Sent to HQrs",
    work_process: "Work under Process",
    tender: "Tender Stage",
    completed: "Work Completed",
    indents_placed: "Indents Placed",
  };

  const totalSpent = contingencies.reduce(
    (sum, c) =>
      sum +
      (c.expenditures || []).reduce((s, e) => s + (parseAmount(e.amount) ?? 0), 0),
    0
  );

  const totalAllocation = contingencies.reduce(
    (sum, c) => sum + (parseAmount(c.totalAmount) ?? 0),
    0
  );

  const rspCount = works.filter((w) => w.type === "rsp").length;
  const irspCount = works.filter((w) => w.type === "irsp").length;
  const availableBalance = totalAllocation - totalSpent;
  return (
    <div className="space-y-6 pb-8">
      {/* Primary KPI Cards (Animation preserved) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RSP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group"
        >
          <Link to="/rsp-works" className="block h-full">
            <Card className="glass-card p-5 h-full flex flex-col hover:border-teal-300 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      RSP Works
                    </h3>
                    <p className="text-xs text-slate-400">Rolling Stock Program</p>
                  </div>
                </div>
                <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
                  <ArrowUpRight size={16} />
                </span>
              </div>

              <div className="mt-5 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                    <AnimatedNumber value={rspCount} />
                  </span>
                  <span className="text-xs font-semibold text-slate-400 ml-2">sanctioned works</span>
                </div>
                <span className="text-xs font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  View table <ChevronRight size={14} />
                </span>
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* IRSP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="group"
        >
          <Link to="/irsp-works" className="block h-full">
            <Card className="glass-card p-5 h-full flex flex-col hover:border-amber-300 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      IRSP Works
                    </h3>
                    <p className="text-xs text-slate-400">Itemised RSP Programme</p>
                  </div>
                </div>
                <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors">
                  <ArrowUpRight size={16} />
                </span>
              </div>

              <div className="mt-5 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                    <AnimatedNumber value={irspCount} />
                  </span>
                  <span className="text-xs font-semibold text-slate-400 ml-2">itemised works</span>
                </div>
                <span className="text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  View table <ChevronRight size={14} />
                </span>
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Contingencies Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group"
        >
          <Link to="/contingencies" className="block h-full">
            <Card className="glass-card p-5 h-full flex flex-col hover:border-emerald-300 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      Contingencies
                    </h3>
                    <p className="text-xs text-slate-400">Available Net Balance</p>
                  </div>
                </div>
                <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                  <ArrowUpRight size={16} />
                </span>
              </div>

              <div className="mt-5 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono tracking-tight leading-none">
                    <span className="text-base">₹</span>
                    <AnimatedNumber value={availableBalance} />
                  </span>
                  <span className="text-xs font-semibold text-slate-400 ml-2">unspent balance</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  View funds <ChevronRight size={14} />
                </span>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Status Overview & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Status Grid (Animation preserved) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card p-0 overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Works Status Lifecycle</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {works.length} total works registered across all stages
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(statusLabels).map(([key, label]) => {
                  const count = works.filter((w) => w.status === key).length;
                  if (count === 0 && key !== "completed") return null;

                  const dotColor =
                    key === "completed"
                      ? "bg-emerald-500 shadow-sm"
                      : key === "tender"
                      ? "bg-amber-500 shadow-sm"
                      : key === "de_finance"
                      ? "bg-blue-500 shadow-sm"
                      : key === "de_hqrs"
                      ? "bg-purple-500 shadow-sm"
                      : "bg-slate-400";

                  return (
                    <button
                      key={key}
                      onClick={() => handleStatusClick(key)}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-md hover:shadow-teal-900/5 transition-all text-left group/btn"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                        <p className="text-xs font-semibold text-slate-600 leading-tight truncate">
                          {label}
                        </p>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-slate-900 font-mono">
                          {count}
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-slate-300 group-hover/btn:text-teal-600 group-hover/btn:translate-x-0.5 transition-all"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tasks List (Animation preserved) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Task Notes &amp; Reminders</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{notes.length} recent entries</p>
                </div>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => navigate("/add-note")}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                >
                  <Plus size={14} className="mr-1" />
                  Add Note
                </Button>
              )}
            </div>

            <div className="p-3 flex-1 max-h-[300px] overflow-y-auto">
              <div className="space-y-2">
                {loading ? (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Loading tasks...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">No active tasks</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Everything is up to date.</p>
                    {isAdmin && (
                      <Button
                        onClick={() => navigate("/add-note")}
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-xs text-teal-700 hover:bg-teal-50"
                      >
                        <Plus size={14} className="mr-1" />
                        Create first task
                      </Button>
                    )}
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-xs font-semibold text-slate-800 truncate">{note.text}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {note.createdAt}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit task: ${note.text}`}
                            className="h-7 w-7 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg"
                            onClick={() => navigate(`/edit-note/${note.id}`)}
                          >
                            <Edit3 size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete task: ${note.text}`}
                            className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            onClick={() => setDeleteTarget(note)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Delete task confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.text}&rdquo; will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Filter Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] rounded-2xl border-none bg-white p-0 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-teal-800 to-teal-950 p-6 text-white">
            <h3 className="text-lg font-bold">
              {selectedStatus && statusLabels[selectedStatus]}
            </h3>
            <p className="text-teal-200/70 text-xs mt-0.5">
              Filtered Works in this lifecycle stage
            </p>
          </div>
          <div className="p-6">
            <div className="rounded-xl border border-slate-200 overflow-hidden max-h-[50vh] overflow-y-auto">
              <DataTable
                columns={[
                  {
                    header: "DESCRIPTION",
                    accessorKey: "description",
                    cell: (info) => (
                      <span className="font-semibold text-slate-800 text-xs">
                        {info.getValue() || "-"}
                      </span>
                    ),
                  },
                  {
                    header: "PROGRAM",
                    accessorKey: "type",
                    cell: (info) => (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          info.getValue() === "rsp"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {info.getValue()}
                      </span>
                    ),
                  },
                  {
                    header: "YEAR",
                    accessorKey: "yearOfSanction",
                    cell: (info) => (
                      <span className="font-mono text-xs text-slate-500 font-semibold">
                        {info.getValue() || "-"}
                      </span>
                    ),
                  },
                ]}
                data={works.filter((w) => w.status === selectedStatus)}
              />
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                onClick={() => setDialogOpen(false)}
                variant="outline"
                className="rounded-xl text-xs font-semibold px-5"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
