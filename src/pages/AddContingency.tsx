import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { parseAmount } from "../lib/utils";
import { ArrowLeft, AlertCircle, Plus, Save, IndianRupee, Calendar, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ContingencyFormData {
  id?: string;
  description: string;
  yearOfSanction: string;
  totalAmount: string;
}

const AddContingency = () => {
  const [formData, setFormData] = useState<ContingencyFormData>({
    description: "",
    yearOfSanction: "",
    totalAmount: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the delayed navigation if the user leaves before it fires
  useEffect(() => {
    return () => {
      if (navigateTimer.current) clearTimeout(navigateTimer.current);
    };
  }, []);

  useEffect(() => {
    const editItem = localStorage.getItem('editContingency');
    if (editItem) {
      try {
        const parsedItem = JSON.parse(editItem);
        setFormData({
          id: parsedItem.id,
          description: parsedItem.description || "",
          yearOfSanction: parsedItem.yearOfSanction || "",
          totalAmount: parsedItem.totalAmount || "",
        });
        setIsEditing(true);
      } catch (e) {
        console.error("Error parsing edit item", e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast({ title: "Validation Error", description: "Project description is mandatory", variant: "destructive" });
      return;
    }
    if (formData.yearOfSanction.trim() && !/^\d{4}(-\d{2,4})?$/.test(formData.yearOfSanction.trim())) {
      toast({ title: "Validation Error", description: "Sanction period must look like 2024 or 2024-25", variant: "destructive" });
      return;
    }
    // NaN-safe: "abc" can no longer slip through as a positive amount
    const amount = parseAmount(formData.totalAmount);
    if (amount === null || amount <= 0) {
      toast({ title: "Validation Error", description: "Allocation sum must be a positive number", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      if (isEditing && formData.id) {
        const docRef = doc(db, "contingencies", formData.id);
        await updateDoc(docRef, {
          description: formData.description.trim(),
          yearOfSanction: formData.yearOfSanction.trim(),
          totalAmount: amount,
          updatedAt: new Date(),
        });
        toast({ title: "Registry Updated", description: "Contingency allocation has been synchronized." });
      } else {
        await addDoc(collection(db, "contingencies"), {
          description: formData.description.trim(),
          yearOfSanction: formData.yearOfSanction.trim(),
          totalAmount: amount,
          createdAt: new Date(),
          expenditures: [],
        });
        toast({ title: "Entry Created", description: "New contingency allocation added to system." });
      }

      setSaved(true);
      localStorage.removeItem('editContingency');
      navigateTimer.current = setTimeout(() => navigate("/contingencies"), 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({ title: "System Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center gap-6 group">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          aria-label="Go back"
          className="h-14 w-14 shrink-0 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-100 transition-all active:scale-95"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-display">
            {isEditing ? "Refine Allocation" : "New Contingency"}
          </h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-[0.15em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-sky-500"></span>
            Financial Reserve Protocol
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-none shadow-premium-shadow overflow-hidden"
      >
        <div className="bg-slate-900 p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight font-display uppercase">Allocation Specifics</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">Reserve Fund Ledger Entrance</p>
            </div>
          </div>
          {saved && (
            <div className="px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-widest border border-sky-500/20 animate-pulse">
              Synchronizing...
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-10 bg-white">
          <div className="space-y-8">
            {/* Description Field */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 ml-1">
                <FileText size={16} className="text-slate-400" />
                <label htmlFor="cont-description" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-display">Contingency Description *</label>
              </div>
              <Textarea
                id="cont-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Declare the purpose of this reserve fund..."
                maxLength={2000}
                className="min-h-[140px] rounded-xl border-slate-100 bg-slate-50/30 p-5 focus-visible:bg-white focus-visible:ring-sky-500/10 transition-all font-medium text-base leading-relaxed placeholder:font-normal"
                required
                autoFocus={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Year Field */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 ml-1">
                  <Calendar size={16} className="text-slate-400" />
                  <label htmlFor="cont-year" className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sanction Period</label>
                </div>
                <Input
                  id="cont-year"
                  value={formData.yearOfSanction}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearOfSanction: e.target.value }))}
                  placeholder="e.g. 2024-2025"
                  pattern="\d{4}(-\d{2,4})?"
                  title="Enter a period like 2024 or 2024-25"
                  maxLength={9}
                  className="h-14 rounded-xl border-slate-100 bg-slate-50/50 px-5 font-bold text-base focus-visible:ring-amber-500/10 placeholder:font-normal"
                />
              </div>

              {/* Amount Field */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 ml-1">
                  <IndianRupee size={16} className="text-amber-500" />
                  <label htmlFor="cont-amount" className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Capital Allocation *</label>
                </div>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">₹</span>
                  <Input
                    id="cont-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="Principal amount..."
                    required
                    className="pl-12 pr-5 h-14 rounded-xl border-slate-100 bg-amber-50/10 font-black text-lg text-slate-900 focus-visible:ring-amber-500/10 shadow-inner placeholder:font-normal"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-slate-50">
            <Button 
              type="submit" 
              disabled={loading} 
              className="btn-primary flex-1 h-14"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isEditing ? <Save size={20} /> : <Plus size={20} />}
                  {isEditing ? "Synchronize Fund Details" : "Finalize Allocation"}
                </span>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="h-14 px-10 rounded-xl font-bold border-slate-100 text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddContingency;