import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, CheckSquare, TrendingUp, Plus, ChevronRight, AlertCircle, IndianRupee, Sparkles, Layout, Clock, Trash2, Edit3, ArrowUpRight, Activity } from "lucide-react";
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

const formatRupee = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

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

const AnimatedNumber = ({ value, isCurrency = false }: { value: number; isCurrency?: boolean }) => {
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

  if (isCurrency) return <span>{formatRupee(display)}</span>;
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
      className="space-y-8 pb-20"
    >
      <motion.div 
        variants={itemVariants} 
        className="relative h-[600px] w-full rounded-[4rem] overflow-hidden shadow-3xl mb-8 group"
      >
        <img 
          src="/Image train.png" 
          alt="Carriage Workshop LGD" 
          className="absolute inset-0 w-full h-full object-cover object-[center_45%] group-hover:scale-105 transition-transform duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-between p-10 md:p-12">
          <div className="mb-4">
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-white leading-none">
              Budget<span className="text-[#0ea5e9]">Portal</span>
            </h1>
            <div className="flex items-center gap-3 mt-8 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
              <Activity size={20} className="text-[#0ea5e9]" />
              <span className="text-white font-bold text-base tracking-wide uppercase">Carriage Workshop LGD</span>
            </div>
          </div>

          {/* KPI Grid Integrated on Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Rolling Stock Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl group/card transition-all hover:bg-white/15">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-[#0ea5e9] flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white leading-none tracking-tight">
                    <AnimatedNumber value={works.filter(w => w.type === 'rsp').length} />
                  </div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1 block">Active Units</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-4">RSP Works</h3>
              <button onClick={() => navigate('/rsp-works')} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5e9] flex items-center gap-2 hover:gap-3 transition-all">
                Explore <ChevronRight size={14} />
              </button>
            </div>

            {/* IRSP Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl group/card transition-all hover:bg-white/15">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Layout size={24} />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white leading-none tracking-tight">
                    <AnimatedNumber value={works.filter(w => w.type === 'irsp').length} />
                  </div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1 block">Units</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-4">IRSP Works</h3>
              <button onClick={() => navigate('/irsp-works')} className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2 hover:gap-3 transition-all">
                Access <ChevronRight size={14} />
              </button>
            </div>

            {/* Contingencies Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl group/card transition-all hover:bg-white/15">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white leading-none mb-1">
                    <AnimatedNumber value={totalAllocation - totalSpent} isCurrency={true} />
                  </div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1 block">Balance</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-4">Contingencies</h3>
              <button onClick={() => navigate('/contingencies')} className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2 hover:gap-3 transition-all">
                Audit <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status heatmap */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <Card className="glass-card p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Status</h3>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-border px-4 font-bold text-xs uppercase tracking-widest">View All</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = works.filter(w => w.status === key).length;
                if (count === 0 && key !== 'completed') return null;
                return (
                  <motion.div 
                    key={key}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="p-5 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[140px]"
                    onClick={() => handleStatusClick(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-3 h-3 rounded-full ${key === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : key === 'tender' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-primary shadow-[0_0_10px_rgba(31,166,184,0.3)]'} group-hover:animate-pulse`} />
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">ID_{key.substring(0,4)}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1 mt-4">{label}</h4>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-extrabold text-foreground stat-number">{count}</span>
                        <div className="p-1.5 rounded-lg bg-background/50 group-hover:bg-primary/10 transition-colors">
                          <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Protocol Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-primary/[0.01]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <CheckSquare size={18} />
                </div>
                <h3 className="font-bold text-foreground">To-do List</h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-none p-6 space-y-4 min-h-[400px]">
              {notes.map((note) => (
                <motion.div 
                  layout
                  key={note.id} 
                  className="group flex gap-4 p-4 rounded-2xl hover:bg-muted/50 border border-transparent hover:border-border transition-all duration-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">{note.text}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} /> {note.createdAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => navigate(`/edit-note/${note.id}`)} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-primary transition-all"><Edit3 size={14} /></button>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              ))}
              {notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Sparkles size={32} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center">No pending tasks</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-muted/20 mt-auto">
            </div>
          </Card>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl rounded-[2.5rem] border-none glass-card p-0 overflow-hidden shadow-2xl">
          <div className="bg-foreground p-10 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-white tracking-tight">
                {selectedStatus && statusLabels[selectedStatus]} <span className="text-primary italic">Units</span>
              </h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                Filtered Overview
              </p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 text-white flex items-center justify-center border border-white/10 backdrop-blur-3xl shadow-2xl rotate-3">
              <Activity size={32} />
            </div>
          </div>
          <div className="p-10 space-y-8">
            <div className="rounded-3xl border border-border bg-muted/30 overflow-hidden shadow-inner max-h-[50vh] overflow-y-auto scrollbar-none">
              <DataTable 
                columns={[
                  { 
                    header: "WORK DESCRIPTION", 
                    accessorKey: "description",
                    cell: (info: any) => (
                      <div className="max-w-[300px]">
                        <span className="font-semibold text-foreground text-sm leading-relaxed line-clamp-2">{info.getValue() || '-'}</span>
                      </div>
                    )
                  },
                  { 
                    header: "IDENTIFIER", 
                    accessorKey: "id",
                    cell: (info: any) => (
                      <span className="font-mono text-[10px] font-black text-muted-foreground tracking-tighter">
                        {info.row.pbNo || info.row.lawNo || 'N/A'}
                      </span>
                    )
                  },
                  { 
                    header: "CATEGORY", 
                    accessorKey: "type",
                    cell: (info: any) => (
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest w-fit shadow-xs ${info.getValue() === 'rsp' ? 'bg-primary/20 text-primary border border-primary/10' : 'bg-blue-500/20 text-blue-500 border border-blue-500/10'}`}>
                          {info.getValue() === 'rsp' ? 'RSP' : 'IRSP'}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/60">{info.row.yearOfSanction}</span>
                      </div>
                    )
                  },
                  { 
                    header: "CURRENT STANDING", 
                    accessorKey: "status",
                    cell: (info: any) => (
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm inline-flex items-center gap-2 ${
                        info.getValue() === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        info.getValue() === 'tender' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
                        'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          info.getValue() === 'completed' ? 'bg-emerald-500' :
                          info.getValue() === 'tender' ? 'bg-purple-500' :
                          'bg-amber-500'
                        }`} />
                        {statusLabels[info.getValue() as string]}
                      </span>
                    )
                  },
                  { 
                    header: "REMARKS", 
                    accessorKey: "remarks",
                    cell: (info: any) => <span className="text-[11px] font-medium text-muted-foreground/80 line-clamp-1 italic">{info.getValue() || '--'}</span>
                  },
                ]} 
                data={works.filter(w => w.status === selectedStatus)} 
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setDialogOpen(false)} variant="ghost" className="h-12 px-8 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors">
                CLOSE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HomePage;
