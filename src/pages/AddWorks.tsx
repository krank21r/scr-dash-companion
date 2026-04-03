import React, { useState, useEffect } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import RSPWorkForm from '../components/forms/RSPWorkForm';
import IRSPWorkForm from '../components/forms/IRSPWorkForm';
import { useNavigate } from "react-router-dom";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from '../main';
import { ArrowLeft, FileText, Plus, Component, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddWorks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [workType, setWorkType] = useState<"rsp" | "irsp" | "">("");
  const [formData, setFormData] = useState<any>({
    type: "",
    description: "",
    yearOfSanction: "",
    status: "",
  });

  useEffect(() => {
    const storedWork = localStorage.getItem('editWork');
    if (storedWork) {
      try {
        const parsedWork = JSON.parse(storedWork);
        if (parsedWork) {
          setFormData(parsedWork);
          setWorkType(parsedWork.type);
          setShowForm(true);
        }
      } catch (error) {
        console.error("Error parsing stored work:", error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        const workRef = doc(db, "works", formData.id);
        const { id, ...updateData } = formData;
        await updateDoc(workRef, updateData);
        toast({ title: "Update Successful", description: "Project ledger has been synchronized." });
      } else {
        const { id, ...newWorkData } = formData;
        await addDoc(collection(db, "works"), {
          ...newWorkData,
          type: workType,
          createdAt: new Date(),
        });
        toast({ title: "Entry Created", description: "New project has been added to the database." });
      }
      localStorage.removeItem('editWork');
      navigate(workType === 'rsp' ? '/rsp-works' : '/irsp-works');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      {/* Header with Navigation */}
      <div className="flex items-center gap-6 group">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="h-14 w-14 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 active:scale-95"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            {formData.id ? 'Refine Entry' : 'New Assignment'}
          </h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.1em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-primary mb-0.5"></span>
            {formData.id ? `ID: ${formData.id.slice(0, 8)}...` : 'Database Protocol Alpha'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card 
              className="glass-card group relative p-10 border-none shadow-premium-shadow cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden"
              onClick={() => { setWorkType("rsp"); setFormData({ ...formData, type: "rsp" }); setShowForm(true); }}
            >
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-4 border-white/20">
                  <FileText size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">RSP Work</h3>
                  <p className="text-slate-500 font-medium mt-2 leading-relaxed">New Assignment</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest pt-2 group-hover:gap-4 transition-all">
                  Initialize <ChevronRight size={16} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
            </Card>

            <Card 
              className="glass-card group relative p-10 border-none shadow-premium-shadow cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden"
              onClick={() => { setWorkType("irsp"); setFormData({ ...formData, type: "irsp" }); setShowForm(true); }}
            >
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-4 border-white/20">
                  <Component size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">IRSP Work</h3>
                  <p className="text-slate-500 font-medium mt-2 leading-relaxed">New Assignment</p>                </div>
                <div className="flex items-center gap-2 text-cyan-500 font-black text-xs uppercase tracking-widest pt-2 group-hover:gap-4 transition-all">
                  Initialize <ChevronRight size={16} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-none shadow-2xl overflow-hidden"
          >
            <div className="bg-slate-900 p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-lg ${workType === 'rsp' ? 'bg-primary' : 'bg-cyan-500'}`}>
                  {workType === 'rsp' ? 'R' : 'I'}
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight font-['Plus_Jakarta_Sans'] uppercase">{workType === 'rsp' ? 'Rolling Stock Program' : 'Itemized Rolling Stock'}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">Manual Ledger Entry</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setShowForm(false); setWorkType(""); localStorage.removeItem('editWork'); }}
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-lg px-4 font-bold"
              >
                Change Protocol
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10 bg-white">
              <div className="space-y-8">
                {workType === "rsp" ? (
                  <RSPWorkForm formData={formData} setFormData={setFormData} />
                ) : (
                  <IRSPWorkForm formData={formData} setFormData={setFormData} />
                )}
              </div>

              <div className="flex items-center gap-4 pt-10 border-t border-slate-50">
                <Button type="submit" className="btn-primary-glow flex-1 h-14 rounded-2xl font-black text-base shadow-xl transition-all hover:-translate-y-1 active:scale-[0.98]">
                  <CheckCircle2 size={20} className="mr-2" />
                  {formData.id ? 'Synchronize Record' : 'Commit to Database'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="h-14 px-10 rounded-2xl font-bold border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  Discard
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddWorks;