import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { db } from "../main";
import { collection, addDoc, doc, getDocs, query, where, orderBy } from "firebase/firestore";
import { ArrowLeft, AlertCircle, Plus, CheckCircle } from "lucide-react";

interface ContingencyFormData {
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.description.trim()) {
        toast({ title: "Error", description: "Description is required", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
        toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "contingencies"), {
        description: formData.description,
        yearOfSanction: formData.yearOfSanction,
        totalAmount: formData.totalAmount,
        createdAt: new Date(),
      });

      toast({ title: "Success", description: "Contingency added successfully" });
      setSaved(true);
      setTimeout(() => navigate("/contingencies"), 1000);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 shrink-0 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add Contingency</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Enter description, year, and total amount</p>
          </div>
        </div>
      </div>

      <Card className="premium-card p-0 border border-slate-200/60 overflow-hidden">
        <div className="bg-slate-50/50 p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            Contingency Details
          </h3>
        </div>
        
        <div className="p-6 bg-white">
          {saved && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Saved successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-1.5 block">Description *</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Road Repair Work"
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 bg-slate-50 focus-visible:bg-white text-sm transition-colors"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-1.5 block">Year</label>
                <Input
                  value={formData.yearOfSanction}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearOfSanction: e.target.value }))}
                  placeholder="e.g., 2024-25"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 bg-slate-50 focus-visible:bg-white text-sm transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-1.5 block">Total Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="500000"
                    className="pl-8 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 bg-slate-50 focus-visible:bg-white text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-11 px-6 font-semibold shadow-sm transition-all flex-1 sm:flex-none">
                <Plus size={18} className="mr-2" />
                {loading ? "Saving..." : "Create Record"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/contingencies")} className="rounded-xl h-11 px-6 font-semibold border-slate-200 hover:bg-slate-50 text-slate-600 flex-1 sm:flex-none">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AddContingency;