import React, { useState, useEffect } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import RSPWorkForm from '../components/forms/RSPWorkForm';
import IRSPWorkForm from '../components/forms/IRSPWorkForm';
import { useNavigate } from "react-router-dom";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from '../main';
import { ArrowLeft, FileText, Plus, Component, CheckCircle2, ChevronRight, Activity, Database } from "lucide-react";
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
        toast({ title: "Success", description: "Details have been updated." });
      } else {
        const { id, ...newWorkData } = formData;
        await addDoc(collection(db, "works"), {
          ...newWorkData,
          type: workType,
          createdAt: new Date(),
        });
        toast({ title: "Success", description: "New work has been added." });
      }
      localStorage.removeItem('editWork');
      navigate(workType === 'rsp' ? '/rsp-works' : '/irsp-works');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="h-12 w-12 shrink-0 rounded-[1.25rem] bg-muted/50 border border-border/50 text-muted-foreground hover:text-primary transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            {formData.id ? 'Refine Record' : 'Add Works'}
          </h2>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => { setWorkType("rsp"); setFormData({ ...formData, type: "rsp" }); setShowForm(true); }}
              className="glass-card group p-10 cursor-pointer overflow-hidden relative shadow-2xl shadow-primary/5"
            >
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <FileText size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground">RSP Works</h3>
                </div>
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest pt-2">
                  Select Type <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-12 -translate-y-12 blur-3xl group-hover:bg-primary/10 transition-colors" />
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => { setWorkType("irsp"); setFormData({ ...formData, type: "irsp" }); setShowForm(true); }}
              className="glass-card group p-10 cursor-pointer overflow-hidden relative shadow-2xl shadow-cyan-500/5 border-l-cyan-500/20"
            >
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-3xl bg-cyan-600 text-white flex items-center justify-center shadow-xl shadow-cyan-600/20 group-hover:scale-110 transition-transform duration-500">
                  <Activity size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground">IRSP Works</h3>
                </div>
                <div className="flex items-center gap-2 text-cyan-600 font-black text-[10px] uppercase tracking-widest pt-2">
                  Select Type <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full translate-x-12 -translate-y-12 blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card overflow-hidden shadow-2xl"
          >
            <div className="bg-muted p-8 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${workType === 'rsp' ? 'bg-primary' : 'bg-cyan-600'}`}>
                  {workType === 'rsp' ? <FileText size={20} /> : <Activity size={20} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg tracking-tight uppercase">{workType === 'rsp' ? 'Rolling Stock Program' : 'Itemized Rolling Stock'}</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Ledger Entry Module</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setShowForm(false); setWorkType(""); localStorage.removeItem('editWork'); }}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl px-4 font-bold border border-transparent hover:border-border"
              >
                Switch Type
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10 bg-card/30">
              <div className="space-y-8">
                {workType === "rsp" ? (
                  <RSPWorkForm formData={formData} setFormData={setFormData} />
                ) : (
                  <IRSPWorkForm formData={formData} setFormData={setFormData} />
                )}
              </div>

              <div className="flex items-center gap-4 pt-10 border-t border-border/50">
                <Button type="submit" className="btn-premium flex-1 h-14 rounded-2xl font-black text-base shadow-xl group">
                  <Database size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                  {formData.id ? 'Update Work' : 'Save Work'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="h-14 px-10 rounded-2xl font-bold border-border text-muted-foreground hover:bg-muted transition-all"
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