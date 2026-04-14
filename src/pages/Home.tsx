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
    'de_process': 'Under Process',
    'de_finance': 'With Finance',
    'de_hqrs': 'Sent to HQrs',
    'work_process': 'Active Works',
    'tender': 'Tender Stage',
    'completed': 'Completed',
    'indents_placed': 'Indents Placed'
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
      className="space-y-12 pb-20"
    >
      <motion.div 
        variants={itemVariants} 
        className="relative h-[550px] w-full rounded-[4rem] overflow-hidden shadow-3xl mb-16 group"
      >
        <img 
          src="/Image train.png" 
          alt="Carriage Workshop LGD" 
          className="absolute inset-0 w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-16 md:p-24">
          <h1 className="text-6xl md:text-9xl font-extrabold tracking-tighter text-white leading-none">
            Budget<span className="text-[#0ea5e9]">Portal</span>
          </h1>
          <div className="flex items-center gap-3 mt-8 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
            <Activity size={20} className="text-[#0ea5e9]" />
            <span className="text-white font-bold text-base tracking-wide uppercase">Carriage Workshop LGD</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Rolling Stock Card */}
        <Card className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 group">
          <div className="flex justify-between items-start mb-12">
            <div className="w-16 h-16 rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center">
              <FileText size={32} />
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-slate-900 leading-none tracking-tight">
                <AnimatedNumber value={works.filter(w => w.type === 'rsp').length} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block">Active Units</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-8">Rolling Stock</h3>
          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <button onClick={() => navigate('/rsp-works')} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0ea5e9] flex items-center gap-2 hover:gap-3 transition-all">
              Explore Dataset <ChevronRight size={14} />
            </button>
          </div>
        </Card>

        {/* IRSP Card */}
        <Card className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 group">
          <div className="flex justify-between items-start mb-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layout size={32} />
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-slate-900 leading-none tracking-tight">
                <AnimatedNumber value={works.filter(w => w.type === 'irsp').length} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block">Units</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-8">IRSP Works</h3>
          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <button onClick={() => navigate('/irsp-works')} className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2 hover:gap-3 transition-all">
              Access Records <ChevronRight size={14} />
            </button>
          </div>
        </Card>

        {/* Contingencies Card */}
        <Card className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 group">
          <div className="flex justify-between items-start mb-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[#10b981] leading-none mb-1">
                {formatRupee(totalAllocation - totalSpent)}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block">Available Fund</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-8">Contingencies</h3>
          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <button onClick={() => navigate('/contingencies')} className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2 hover:gap-3 transition-all">
              Financial Audit <ChevronRight size={14} />
            </button>
          </div>
        </Card>
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
                Datastream Filtered Result
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
                    header: "ENTITY SPECIFICATION", 
                    accessorKey: "description",
                    cell: (info: any) => <span className="font-bold text-foreground text-sm leading-relaxed">{info.getValue() || '-'}</span>
                  },
                  { 
                    header: "PROTOCOL TYPE", 
                    accessorKey: "type",
                    cell: (info: any) => (
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${info.getValue() === 'rsp' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-blue-500/20 text-blue-500 border border-blue-500/20'}`}>
                        {info.getValue()} Registry
                      </span>
                    )
                  },
                  { 
                    header: "PERIOD", 
                    accessorKey: "yearOfSanction",
                    cell: (info: any) => <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted p-1.5 rounded-lg">{info.getValue() || '-'}</span>
                  },
                ]} 
                data={works.filter(w => w.status === selectedStatus)} 
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setDialogOpen(false)} variant="ghost" className="h-12 px-8 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors">
                EXIT REGISTRY
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HomePage;
