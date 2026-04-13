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
      <motion.div variants={itemVariants} className="flex flex-col gap-1.5 mb-10 pl-2">
        <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] font-['Plus_Jakarta_Sans']">
          <span className="text-[#141A28]">Budget Section </span>
          <span className="text-[#1CA0B1] italic">Portal</span>
        </h1>
        <p className="text-[#6a6a6a] font-bold uppercase tracking-[0.1em] text-[11px] sm:text-[13px] mt-1 ml-0.5">
          Carriage Workshop Lgd
        </p>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* RSP Card */}
        <motion.div variants={itemVariants} className="group">
          <Link to="/rsp-works">
            <Card className="glass-card p-6 border-none shadow-card relative overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5 group-hover:bg-[#ff385c]/[0.02]">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-[0.5rem] bg-[#222222] text-white flex items-center justify-center shadow-card group-hover:rotate-6 transition-all">
                    <FileText size={22} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#222222] tracking-tighter">
                      <AnimatedNumber value={works.filter(w => w.type === 'rsp').length} />
                    </div>
                    <p className="text-[9px] font-bold text-[#6a6a6a] uppercase tracking-widest mt-0.5">Works</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#222222] leading-none">RSP</h3>
                  <p className="text-[#6a6a6a] font-medium text-xs mt-1.5 leading-relaxed">Rolling Stock Program</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[#ff385c] font-semibold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                  Navigate <ChevronRight size={12} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#222222]/5 rounded-full blur-3xl group-hover:bg-[#222222]/10 transition-colors" />
            </Card>
          </Link>
        </motion.div>

        {/* IRSP Card */}
        <motion.div variants={itemVariants} className="group">
          <Link to="/irsp-works">
            <Card className="glass-card p-6 border-none shadow-card relative overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5 group-hover:bg-[#ff385c]/[0.02]">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-[0.5rem] bg-[#222222] text-white flex items-center justify-center shadow-card group-hover:rotate-6 transition-all">
                    <Layout size={22} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#222222] tracking-tighter">
                      <AnimatedNumber value={works.filter(w => w.type === 'irsp').length} />
                    </div>
                    <p className="text-[9px] font-bold text-[#6a6a6a] uppercase tracking-widest mt-0.5">Works</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#222222] leading-none">IRSP</h3>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[#ff385c] font-semibold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                  Navigate <ChevronRight size={12} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#222222]/5 rounded-full blur-3xl group-hover:bg-[#222222]/10 transition-colors" />
            </Card>
          </Link>
        </motion.div>

        {/* Contingencies Card */}
        <motion.div variants={itemVariants} className="group">
          <Link to="/contingencies">
            <Card className="glass-card p-6 border-none shadow-card relative overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5 group-hover:bg-[#ff385c]/[0.02]">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-[0.5rem] bg-[#222222] text-white flex items-center justify-center shadow-card group-hover:rotate-6 transition-all">
                    <AlertCircle size={22} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600 tracking-tighter">
                      ₹<AnimatedNumber value={totalAllocation - totalSpent} />
                    </div>
                    <p className="text-[9px] font-bold text-[#6a6a6a] uppercase tracking-widest mt-0.5">Available</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#222222] leading-none">Contingencies</h3>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[#ff385c] font-semibold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                  View <ChevronRight size={12} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#222222]/5 rounded-full blur-3xl group-hover:bg-[#222222]/10 transition-colors" />
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Secondary Intelligence: Status & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Status Heatmap - 3 Columns */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="glass-card p-10 border-none shadow-card h-full pb-14">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-[0.5rem] bg-[#f2f2f2] text-[#6a6a6a] border border-[#e0e0e0]">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#222222]">Status Overview</h3>
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
                    className="p-6 rounded-[1.25rem] white border border-[#e0e0e0] shadow-card hover:shadow-hover hover:border-[#ff385c]/20 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleStatusClick(key)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-2 h-2 rounded-full ${key === 'completed' ? 'bg-emerald-500' : key === 'tender' ? 'bg-purple-500' : 'bg-[#ff385c]'} group-hover:animate-pulse`} />
                      <span className="text-[11px] font-mono font-semibold text-[#e0e0e0]">#{count}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-[#6a6a6a] uppercase tracking-widest leading-tight">{label}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-2xl font-semibold text-[#222222]">{count}</div>
                      <ChevronRight size={14} className="text-[#e0e0e0] group-hover:text-[#ff385c] transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Task Protocol - 2 Columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card p-0 border-none shadow-card h-full overflow-hidden flex flex-col">
            <div className="p-8 border-b border-[#f2f2f2] bg-[#f2f2f2]/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-[0.5rem] bg-[#f2f2f2] text-[#222222] border border-[#e0e0e0]">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#222222]">To-do List</h3>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/add-note')} 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 rounded-full hover:bg-[#f2f2f2] hover:text-[#222222] text-[#6a6a6a]"
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
                    className="group flex items-center justify-between p-5 rounded-[1.25rem] hover:bg-[#f2f2f2] border border-transparent hover:border-[#e0e0e0] transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-[#222222] leading-relaxed">{note.text}</p>
                      <div className="flex items-center gap-2.5 mt-2">
                        <span className="text-[10px] font-semibold text-[#e0e0e0] uppercase tracking-widest">{note.createdAt}</span>
                        <span className="w-1 h-1 rounded-full bg-[#e0e0e0]" />
                        <span className="text-[9px] font-semibold text-[#6a6a6a] italic">Sync Active</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-[#6a6a6a] hover:text-[#222222] hover:bg-[#f2f2f2] rounded-full" onClick={() => navigate(`/edit-note/${note.id}`)}>
                        <Edit3 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-[#6a6a6a] hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {notes.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-40">
                    <CheckSquare size={48} className="text-[#e0e0e0] mb-4" />
                    <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-widest">Protocol Buffer Empty</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-[#f2f2f2] bg-[#f2f2f2]/10">
              <Button 
                variant="ghost" 
                className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5"
                onClick={() => navigate('/add-note')}
              >
                Enter New Task Sequence
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal View for Status Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] rounded-[3rem] border-none bg-white shadow-premium-shadow p-0 overflow-hidden">
          <div className="bg-slate-900 p-10 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-white tracking-tight font-['Plus_Jakarta_Sans']">
                {selectedStatus && statusLabels[selectedStatus]} <span className="text-primary">Elements</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Filtered Datastream Registry</p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 text-white flex items-center justify-center border border-white/5 backdrop-blur-xl">
              <FileText size={32} />
            </div>
          </div>
          <div className="p-10">
            <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden shadow-inner max-h-[60vh] overflow-y-auto">
              <DataTable 
                columns={[
                  { 
                    header: "SPECIFICATION", 
                    accessorKey: "description",
                    cell: (info: any) => <span className="font-bold text-slate-800 font-['Plus_Jakarta_Sans'] text-sm">{info.getValue() || '-'}</span>
                  },
                  { 
                    header: "PROTOCOL TYPE", 
                    accessorKey: "type",
                    cell: (info: any) => (
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${info.getValue() === 'rsp' ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'}`}>
                        {info.getValue()} Registry
                      </span>
                    )
                  },
                  { 
                    header: "SANCTION PERIOD", 
                    accessorKey: "yearOfSanction",
                    cell: (info: any) => <span className="font-mono text-[11px] font-black text-slate-400">{info.getValue() || '-'}</span>
                  },
                ]} 
                data={works.filter(w => w.status === selectedStatus)} 
              />
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setDialogOpen(false)} variant="outline" className="h-12 px-8 rounded-xl font-black text-slate-500 border-slate-100 hover:bg-slate-50">
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
