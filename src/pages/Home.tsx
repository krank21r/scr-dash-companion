import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, TrendingUp, Plus, ChevronRight, AlertCircle, Layout, Clock, Trash2, Edit3 } from "lucide-react";
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
import { db, notesCollection } from '@/lib/firebase';
import { useToast } from "../hooks/use-toast";
import { parseAmount, formatDisplayDate } from "../lib/utils";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

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
    // Cancel the loop on unmount to avoid setting state on a dead component
    return () => cancelAnimationFrame(rafId);
  }, [value]);
  return <span>{display.toLocaleString('en-IN')}</span>;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [worksSnapshot, notesSnapshot, contingenciesSnapshot] = await Promise.all([
          getDocs(collection(db, "works")),
          getDocs(query(notesCollection, orderBy("createdAt", "desc"), limit(8))),
          getDocs(collection(db, "contingencies")),
        ]);

        setWorks(worksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WorkItem[]);
        setNotes(notesSnapshot.docs.map(doc => ({
          id: doc.id,
          text: doc.data().text,
          // Safe for Timestamps, Dates and legacy string values alike
          createdAt: formatDisplayDate(doc.data().createdAt, 'Recent'),
        })) as NoteItem[]);
        setContingencies(contingenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContingencyItem[]);
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
      setNotes(prev => prev.filter(n => n.id !== deleteTarget.id));
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
    'de_process': 'DE under Process',
    'de_finance': 'DE Sent to Finance',
    'de_hqrs': 'DE Sent to HQrs',
    'work_process': 'Work under Process',
    'tender': 'Tender Stage',
    'completed': 'Work Completed',
    'indents_placed': 'Indents Placed'
  };

  const totalSpent = contingencies.reduce((sum, c) =>
    sum + (c.expenditures || []).reduce((s, e) => s + (parseAmount(e.amount) ?? 0), 0), 0
  );

  const totalAllocation = contingencies.reduce((sum, c) => sum + (parseAmount(c.totalAmount) ?? 0), 0);

  const rspCount = works.filter(w => w.type === 'rsp').length;
  const irspCount = works.filter(w => w.type === 'irsp').length;
  const availableBalance = totalAllocation - totalSpent;

  return (
    <div className="space-y-4 pb-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Carriage Workshop LGD
          </p>
        </div>
        <Button onClick={() => navigate('/add-works')} className="btn-primary h-10 px-5 rounded-lg">
          <Plus size={18} />
          New Work
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RSP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group"
        >
          <Link to="/rsp-works" className="block h-full">
            <Card className="glass-card p-5 h-full flex flex-col hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">RSP</h3>
                  <p className="text-xs text-slate-400 truncate">Rolling Stock Program</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-2">
                <span className="flex items-baseline gap-2 min-w-0">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                    <AnimatedNumber value={rspCount} />
                  </span>
                  <span className="text-xs font-medium text-slate-400">works</span>
                </span>
                <span className="flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Works <ChevronRight size={14} />
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
            <Card className="glass-card p-5 h-full flex flex-col hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Layout size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">IRSP</h3>
                  <p className="text-xs text-slate-400 truncate">Itemised RSP Programme</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-2">
                <span className="flex items-baseline gap-2 min-w-0">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                    <AnimatedNumber value={irspCount} />
                  </span>
                  <span className="text-xs font-medium text-slate-400">works</span>
                </span>
                <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Works <ChevronRight size={14} />
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
            <Card className="glass-card p-5 h-full flex flex-col hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <AlertCircle size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Contingencies</h3>
                  <p className="text-xs text-slate-400 truncate">Contingency Allocations</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-2">
                <span className="flex items-baseline gap-2 min-w-0">
                  <span className="text-2xl font-bold text-emerald-600 tracking-tight leading-none">
                    <span className="text-base">₹</span><AnimatedNumber value={availableBalance} />
                  </span>
                  <span className="text-xs font-medium text-slate-400">available</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Entries <ChevronRight size={14} />
                </span>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Status Overview & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Status Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card p-0 overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Status Overview</h3>
                  <p className="text-xs text-slate-400">{works.length} works registered</p>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = works.filter(w => w.status === key).length;
                if (count === 0 && key !== 'completed') return null;
                return (
                  <button
                    key={key}
                    onClick={() => handleStatusClick(key)}
                    className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all text-left group/btn"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        key === 'completed' ? 'bg-emerald-500' :
                        key === 'tender' ? 'bg-amber-500' :
                        key === 'de_finance' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`} />
                      <p className="text-xs font-medium text-slate-500 leading-tight">{label}</p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xl font-bold text-slate-900">{count}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover/btn:text-primary transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
            </div>
          </Card>
        </motion.div>

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Task List</h3>
                  <p className="text-xs text-slate-400">{notes.length} recent</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/add-note')}
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-semibold text-primary hover:bg-primary/5 hover:text-primary"
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </div>

            <div className="p-3 flex-1 max-h-[300px] overflow-y-auto">
              <div className="space-y-2">
                {loading ? (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Loading tasks...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-400">No pending tasks</p>
                    <Button
                      onClick={() => navigate('/add-note')}
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs text-primary"
                    >
                      <Plus size={14} className="mr-1" />
                      Add task
                    </Button>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-slate-700 truncate">{note.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{note.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit task: ${note.text}`}
                          className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md"
                          onClick={() => navigate(`/edit-note/${note.id}`)}
                        >
                          <Edit3 size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete task: ${note.text}`}
                          className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                          onClick={() => setDeleteTarget(note)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.text}&rdquo; will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] rounded-xl border-none bg-white p-0 overflow-hidden">
          <div className="bg-primary p-6">
            <h3 className="text-xl font-bold text-white">
              {selectedStatus && statusLabels[selectedStatus]}
            </h3>
            <p className="text-primary-foreground/70 text-sm mt-1">Filtered Items</p>
          </div>
          <div className="p-6">
            <div className="rounded-lg border border-slate-100 overflow-hidden max-h-[50vh] overflow-y-auto">
              <DataTable
                columns={[
                  {
                    header: "DESCRIPTION",
                    accessorKey: "description",
                    cell: (info) => <span className="font-semibold text-slate-800 text-sm">{info.getValue() || '-'}</span>
                  },
                  {
                    header: "TIPO",
                    accessorKey: "type",
                    cell: (info) => (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        info.getValue() === 'rsp' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {info.getValue()}
                      </span>
                    )
                  },
                  {
                    header: "YEAR",
                    accessorKey: "yearOfSanction",
                    cell: (info) => <span className="font-mono text-xs text-slate-400">{info.getValue() || '-'}</span>
                  },
                ]}
                data={works.filter(w => w.status === selectedStatus)}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setDialogOpen(false)} variant="outline" className="rounded-lg font-semibold">
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