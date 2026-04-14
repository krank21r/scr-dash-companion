import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { db } from "../main";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { ArrowLeft, AlertCircle, Plus, CheckCircle, Save, IndianRupee, Calendar, FileText, Database, ShieldCheck } from "lucide-react";
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
    setLoading(true);

    try {
      if (!formData.description.trim()) {
        toast({ title: "Validation Error", description: "Project description is mandatory", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
        toast({ title: "Validation Error", description: "Allocation sum must be positive", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (isEditing && formData.id) {
        const docRef = doc(db, "contingencies", formData.id);
        await updateDoc(docRef, {
          description: formData.description,
          yearOfSanction: formData.yearOfSanction,
          totalAmount: formData.totalAmount,
          updatedAt: new Date(),
        });
        toast({ title: "Success", description: "Allocation updated successfully." });
      } else {
        await addDoc(collection(db, "contingencies"), {
          description: formData.description,
          yearOfSanction: formData.yearOfSanction,
          totalAmount: formData.totalAmount,
          createdAt: new Date(),
          expenditures: [],
        });
        toast({ title: "Success", description: "New allocation added to system." });
      }

      setSaved(true);
      localStorage.removeItem('editContingency');
      setTimeout(() => navigate("/contingencies"), 1200);
    } catch (error: any) {
      toast({ title: "System Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20 px-4">
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="h-12 w-12 shrink-0 rounded-[1.25rem] bg-muted/50 border border-border/50 text-muted-foreground hover:text-amber-500 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            {isEditing ? "Refine Allocation" : "New Contingency"}
          </h2>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden shadow-2xl border-l-4 border-l-amber-500"
      >
        <div className="bg-muted p-8 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-foreground text-lg tracking-tight uppercase">Allocation Details</h3>
            </div>
          </div>
          {saved && (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              Validated
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-10 bg-card/30">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Work Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Declare the purpose of this reserve fund allocation..."
                className="min-h-[140px] rounded-2xl border-border bg-muted/30 p-5 focus-visible:bg-card focus-visible:ring-amber-500/10 transition-all font-medium text-base leading-relaxed"
                required
                autoFocus={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Sanction Period</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    value={formData.yearOfSanction}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearOfSanction: e.target.value }))}
                    placeholder="e.g. 2024-2025"
                    className="h-14 pl-12 rounded-xl border-border bg-muted/30 font-bold focus-visible:bg-card"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Capital Allocation *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 font-black text-lg">₹</span>
                  <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="0.00"
                    required
                    className="h-14 pl-10 rounded-xl border-border bg-amber-500/[0.03] font-black text-lg text-foreground focus-visible:ring-amber-500/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-border/50">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-base shadow-xl shadow-amber-500/20 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <Database size={18} className="group-hover:scale-110 transition-transform" />
                  {isEditing ? "Update Allocation" : "Save Allocation"}
                </span>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="h-14 px-10 rounded-2xl font-bold text-muted-foreground border-border hover:bg-muted transition-all"
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