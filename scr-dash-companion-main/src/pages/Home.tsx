import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, CheckSquare, TrendingUp, Plus, ChevronRight, AlertCircle, IndianRupee, Layout, Clock, Trash2, Edit3 } from "lucide-react";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { DataTable } from "../components/ui/data-table";
import { collection, deleteDoc, doc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from '../main';
const notesCollection = collection(db, 'notes');
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
    let start = 0;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
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
  const navigate = useNavigate();

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
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) || 'Recent',
        })) as NoteItem[]);
        setContingencies(contingenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContingencyItem[]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(notesCollection, id));
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
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
    sum + (c.expenditures || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0), 0
  );

  const totalAllocation = contingencies.reduce((sum, c) => sum + (parseFloat(c.totalAmount) || 0), 0);

  const rspCount = works.filter(w => w.type === 'rsp').length;
  const irspCount = works.filter(w => w.type === 'irsp').length;
  const availableBalance = totalAllocation - totalSpent;

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="page-title text-slate-900">
            <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Carriage Workshop LGD
          </p>
        </div>
        <Button onClick={() => navigate('/add-works')} className="btn-primary h-12 px-6 rounded-lg">
          <Plus size={18} />
          New Work
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* RSP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group"
        >
          <Link to="/rsp-works">
            <Card className="glass-card p-6 hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={22} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    <AnimatedNumber value={rspCount} />
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">works</p>
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold text-slate-900">RSP</h3>
                <p className="text-sm text-slate-500 mt-1">Rolling Stock Program</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View Works <ChevronRight size={16} />
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
          <Link to="/irsp-works">
            <Card className="glass-card p-6 hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layout size={22} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    <AnimatedNumber value={irspCount} />
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">works</p>
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold text-slate-900">IRSP</h3>
                <p className="text-sm text-slate-500 mt-1">Itemised RSP Programme</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-amber-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View Works <ChevronRight size={16} />
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
          <Link to="/contingencies">
            <Card className="glass-card p-6 hover:shadow-md transition-all duration-300 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle size={22} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                    <span className="text-base">₹</span><AnimatedNumber value={availableBalance} />
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">available</p>
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold text-slate-900">Contingencies</h3>
                <p className="text-sm text-slate-500 mt-1">Contingency Allocations</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-emerald-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View Entries <ChevronRight size={16} />
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Status Overview & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Status Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-500">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Status Overview</h3>
                  <p className="text-xs text-slate-400">{works.length} works registered</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = works.filter(w => w.status === key).length;
                if (count === 0 && key !== 'completed') return null;
                return (
                  <button
                    key={key}
                    onClick={() => handleStatusClick(key)}
                    className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all text-left group/btn"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        key === 'completed' ? 'bg-emerald-500' :
                        key === 'tender' ? 'bg-amber-500' :
                        key === 'de_finance' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`} />
                      <span className="text-xs font-mono text-slate-300">#{count}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-tight">{label}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xl font-bold text-slate-900">{count}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover/btn:text-primary transition-colors" />
                    </div>
                  </button>
                );
              })}
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
          <Card className="glass-card overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Task List</h3>
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

            <div className="p-3 max-h-[320px] overflow-y-auto">
              <div className="space-y-2">
                {notes.length === 0 ? (
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
                          className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md"
                          onClick={() => navigate(`/edit-note/${note.id}`)}
                        >
                          <Edit3 size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                          onClick={() => handleDeleteNote(note.id)}
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
                    cell: (info: any) => <span className="font-semibold text-slate-800 text-sm">{info.getValue() || '-'}</span>
                  },
                  {
                    header: "TIPO",
                    accessorKey: "type",
                    cell: (info: any) => (
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
                    cell: (info: any) => <span className="font-mono text-xs text-slate-400">{info.getValue() || '-'}</span>
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