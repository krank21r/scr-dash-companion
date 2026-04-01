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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Add Contingency</h1>
              <p className="text-sm text-slate-500">Enter description, year, and total amount</p>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm p-6">
          {saved && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Saved successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description *</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Road Repair Work"
                className="rounded-xl border-slate-200 focus:border-amber-300 focus:ring-amber-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Year</label>
                <Input
                  value={formData.yearOfSanction}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearOfSanction: e.target.value }))}
                  placeholder="e.g., 2024-25"
                  className="rounded-xl border-slate-200 focus:border-amber-300 focus:ring-amber-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Total Amount (₹) *</label>
                <Input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  placeholder="e.g., 500000"
                  className="rounded-xl border-slate-200 focus:border-amber-300 focus:ring-amber-200"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl">
                <Plus size={16} className="mr-2" />
                {loading ? "Saving..." : "Add"} Contingency
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/contingencies")} className="rounded-xl">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddContingency;