import React, { useState, useEffect } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import RSPWorkForm from '../components/forms/RSPWorkForm';
import IRSPWorkForm from '../components/forms/IRSPWorkForm';
import { useNavigate } from "react-router-dom";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from '../lib/firebase';
import { parseAmount } from '../lib/utils';
import { WorkFormFields, emptyWorkForm as emptyForm } from '../lib/types';
import { ArrowLeft, FileText, Component, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddWorks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workType, setWorkType] = useState<"rsp" | "irsp" | "">("");
  const [formData, setFormData] = useState<WorkFormFields>(emptyForm);

  useEffect(() => {
    const storedWork = localStorage.getItem('editWork');
    if (storedWork) {
      try {
        const parsedWork = JSON.parse(storedWork);
        if (parsedWork) {
          // Merge over defaults so every input starts controlled
          setFormData({ ...emptyForm, ...parsedWork });
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

    // Radix Select bypasses native `required` validation
    if (!formData.status) {
      toast({ title: "Missing status", description: "Please select the current milestone.", variant: "destructive" });
      return;
    }
    if (!/^\d{4}(-\d{2,4})?$/.test(formData.yearOfSanction.trim())) {
      toast({ title: "Invalid year", description: "Use a format like 2024 or 2024-25.", variant: "destructive" });
      return;
    }

    // Money fields must be real numbers (stored as numbers, not strings)
    const payload: Record<string, unknown> = { ...formData };
    const moneyFields: Array<[keyof WorkFormFields, string]> =
      workType === "rsp"
        ? [["rbSanctionedCost", "RB Sanctioned Cost"], ["deTotalValue", "DE Ledger Value"]]
        : [["totalValue", "Total Value"]];
    for (const [field, label] of moneyFields) {
      const parsed = parseAmount(formData[field] as string);
      if (parsed === null) {
        toast({ title: "Invalid amount", description: `Enter a valid number for "${label}".`, variant: "destructive" });
        return;
      }
      payload[field] = parsed;
    }

    setSaving(true);
    try {
      const { id, ...data } = payload;
      if (id) {
        const workRef = doc(db, "works", id as string);
        await updateDoc(workRef, { ...data, type: workType, updatedAt: new Date() });
        toast({ title: "Updated", description: "Record updated successfully." });
      } else {
        await addDoc(collection(db, "works"), {
          ...data,
          type: workType,
          createdAt: new Date(),
        });
        toast({ title: "Created", description: "New record added successfully." });
      }
      localStorage.removeItem('editWork');
      navigate(workType === 'rsp' ? '/rsp-works' : '/irsp-works');
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="h-11 w-11 rounded-lg border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {formData.id ? 'Edit Work' : 'New Work'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {formData.id ? `ID: ${formData.id.slice(0, 8)}...` : 'Fill in the form details below'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* RSP Card */}
            <Card
              className="glass-card p-8 cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              onClick={() => { setWorkType("rsp"); setFormData({ ...formData, type: "rsp" }); setShowForm(true); }}
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">RSP Work</h3>
                  <p className="text-sm text-slate-500 mt-1">Rolling Stock Programme</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  Start <ChevronRight size={16} />
                </div>
              </div>
            </Card>

            {/* IRSP Card */}
            <Card
              className="glass-card p-8 cursor-pointer hover:shadow-lg hover:border-amber-200 transition-all duration-300"
              onClick={() => { setWorkType("irsp"); setFormData({ ...formData, type: "irsp" }); setShowForm(true); }}
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Component size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">IRSP Work</h3>
                  <p className="text-sm text-slate-500 mt-1">Itemised RSP Programme</p>
                </div>
                <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                  Start <ChevronRight size={16} />
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl border border-slate-100 overflow-hidden"
          >
            {/* Form Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${workType === 'rsp' ? 'bg-primary' : 'bg-amber-500'}`}>
                  {workType === 'rsp' ? 'R' : 'I'}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {workType === 'rsp' ? 'Rolling Stock Programme' : 'Itemised RSP Programme'}
                  </h3>
                  <p className="text-xs text-slate-400">Registration Form</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); setWorkType(""); localStorage.removeItem('editWork'); }}
                className="text-slate-500 hover:text-slate-700 font-semibold"
              >
                Change
              </Button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-6">
                {workType === "rsp" ? (
                  <RSPWorkForm formData={formData} setFormData={setFormData} />
                ) : (
                  <IRSPWorkForm formData={formData} setFormData={setFormData} />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                <Button type="submit" disabled={saving} className="btn-primary flex-1 h-12">
                  <CheckCircle2 size={18} className="mr-2" />
                  {saving ? 'Saving...' : formData.id ? 'Update' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="h-12 px-6 rounded-lg font-semibold border-slate-200"
                >
                  Cancel
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