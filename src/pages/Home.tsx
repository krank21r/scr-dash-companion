import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, CheckSquare, TrendingUp, Plus, ChevronRight, AlertCircle, IndianRupee, Sparkles, Layout, Clock, Trash2, Edit3 } from "lucide-react";
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
    const duration = 1000;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
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
        console.error("Hydration Error:", error);
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
    'de_process': 'DE under process',
    'de_finance': 'DE Sent to Finance',
    'de_hqrs': 'DE sent to HQrs',
    'work_process': 'Work under process',
    'tender': 'Tender stage',
    'completed': 'Work Completed',
    'indents_placed': 'Indents placed'
  };

  const totalSpent = contingencies.reduce((sum, c) => 
    sum + (c.expenditures || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0), 0
  );
  
  const totalAllocation = contingencies.reduce((sum, c) => sum + (parseFloat(c.totalAmount) || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as any;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  } as any;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      {/* Dynamic Hero */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="page-title text-slate-900 leading-tight">
            Budget Section <span className="text-primary">Portal</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-wide text-sm flex items-center gap-2">
            Carriage Workshop LGD
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/add-works')} className="btn-primary h-14 px-8">
            <Plus size={20} /> New Work
          </Button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* RSP Card */}
        <motion.div variants={itemVariants} className="group">
          <Link to="/rsp-works">
            <Card className="glass-card p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#059669] text-white flex items-center justify-center shadow-lg shadow-[#059669]/20 group-hover:rotate-6 transition-all">
                    <FileText size={22} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900 font-display tracking-tight">
                      <AnimatedNumber value={works.filter(w => w.type === 'rsp').length} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Works</p>
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-slate-900 leading-none">RSP</h3>
                  <p className="text-slate-500 font-medium text-xs mt-1.5 leading-relaxed">Rolling Stock Program</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                  Navigate <ChevronRight size={12} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#059669]/5 rounded-full blur-3xl" />
            </Card>
          </Link>
        </motion.div>

        {/* IRSP Card */}
        <motion.div variants={itemVariants} className="group">
          <Link to="/irsp-works">
            <Card className="glass-card p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#0369A1] text-white flex items-center justify-center shadow-lg shadow-[#0369A1]/20 group-hover:rotate-6 transition-all">
                    <Layout size={22} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900 font-display tracking-tight">
                      <AnimatedNumber value={works.filter(w => w.type === 'irsp').length} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Works</p>
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-slate-900 leading-none">IRSP</h3>
                  <p className="text-slate-500 font-medium text-xs mt-1.5 leading-relaxed">Infrastructure Program</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-secondary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                  Navigate <ChevronRight size={12} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0369A1]/5 rounded-full blur-3xl" />
            </Card>
          </Link>
        </motion.div>

        {/* Contingencies Card */}
        <motion.div variants={itemVariants} className="group">
          <Link to="/contingencies">
            <Card className="glass-card p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#059669] text-white flex items-center justify-center shadow-lg shadow-[#059669]/20 group-hover:rotate-6 transition-all">
                    <AlertCircle size={22} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#059669] font-display tracking-tight">
                      ₹<AnimatedNumber value={totalAllocation - totalSpent} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Available</p>
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-slate-900 leading-none">Contingencies</h3>
                  <p className="text-slate-500 font-medium text-xs mt-1.5 leading-relaxed">Financial Registry</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                  View <ChevronRight size={12} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#059669]/5 rounded-full blur-3xl" />
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Secondary Intelligence: Status & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Status Heatmap - 3 Columns */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="glass-card p-10 h-full">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 border border-slate-100">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">Status Overview</h3>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = works.filter(w => w.status === key).length;
                if (count === 0 && key !== 'completed') return null;
                return (
                  <motion.div 
                    key={key}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                    onClick={() => handleStatusClick(key)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-2 h-2 rounded-full ${key === 'completed' ? 'bg-emerald-500' : key === 'tender' ? 'bg-sky-500' : 'bg-primary'} group-hover:animate-pulse`} />
                      <span className="text-[11px] font-mono font-bold text-slate-300">#{count}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-2xl font-bold text-slate-900 font-display">{count}</div>
                      <ChevronRight size={14} className="text-slate-200 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Task Protocol - 2 Columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card p-0 h-full overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">To-do List</h3>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/add-note')} 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 rounded-xl hover:bg-primary/5 hover:text-primary text-slate-400"
              >
                <Plus size={20} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-none p-4 min-h-[300px]">
              <div className="space-y-3">
                {notes.map((note) => (
                  <motion.div 
                    layout
                    key={note.id} 
                    className="group flex items-center justify-between p-5 rounded-[1.25rem] hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300 news-item-hover"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{note.text}</p>
                      <div className="flex items-center gap-2.5 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl" onClick={() => navigate(`/edit-note/${note.id}`)}>
                        <Edit3 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal View for Status Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] rounded-[1.5rem] border-none bg-white p-0 overflow-hidden">
          <div className="bg-slate-900 p-10 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-white tracking-tight font-display">
                {selectedStatus && statusLabels[selectedStatus]} <span className="text-primary">Elements</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Filtered Datastream Registry</p>
            </div>
          </div>
          <div className="p-10">
            <div className="bg-slate-50/50 rounded-[1.5rem] border border-slate-100 overflow-hidden max-h-[60vh] overflow-y-auto">
              <DataTable 
                columns={[
                  { 
                    header: "SPECIFICATION", 
                    accessorKey: "description",
                    cell: (info: any) => <span className="font-bold text-slate-800 text-sm">{info.getValue() || '-'}</span>
                  },
                  { 
                    header: "PROTOCOL TYPE", 
                    accessorKey: "type",
                    cell: (info: any) => (
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${info.getValue() === 'rsp' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
                        {info.getValue()} Registry
                      </span>
                    )
                  },
                  { 
                    header: "SANCTION PERIOD", 
                    accessorKey: "yearOfSanction",
                    cell: (info: any) => <span className="font-mono text-[11px] font-bold text-slate-400">{info.getValue() || '-'}</span>
                  },
                ]} 
                data={works.filter(w => w.status === selectedStatus)} 
              />
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setDialogOpen(false)} variant="outline" className="h-12 px-8 rounded-xl font-bold text-slate-500 border-slate-100 hover:bg-slate-50">
                Close Registry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HomePage;
