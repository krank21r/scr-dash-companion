import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout, FileText, Calendar, Hash, IndianRupee, Layers, CheckCircle } from "lucide-react";

interface RSPWorkFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const RSPWorkForm = ({ formData, setFormData }: RSPWorkFormProps) => {
  return (
    <div className="space-y-10">
      {/* Primary Info Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText size={18} className="text-primary/60" />
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Specification</h4>
        </div>
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Project Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Type comprehensive overview here..."
            required
            className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 p-4 focus-visible:bg-white focus-visible:ring-primary/10 transition-all font-medium text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Grid Coordinates (Year / PB No) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <Calendar size={14} className="text-slate-400" />
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sanction Year</label>
          </div>
          <Input
            type="text"
            inputMode="numeric"
            value={formData.yearOfSanction}
            onChange={(e) => setFormData({ ...formData, yearOfSanction: e.target.value })}
            placeholder="e.g. 2024"
            required
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold text-sm"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <Hash size={14} className="text-slate-400" />
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">P.B Serial No</label>
          </div>
          <Input
            value={formData.pbNo}
            onChange={(e) => setFormData({ ...formData, pbNo: e.target.value })}
            placeholder="Reference code..."
            required
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold text-sm font-mono"
          />
        </div>
      </div>

      {/* Economics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <IndianRupee size={14} className="text-emerald-500" />
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">RB Sanctioned Cost</label>
          </div>
          <Input
            type="text"
            inputMode="decimal"
            value={formData.rbSanctionedCost}
            onChange={(e) => setFormData({ ...formData, rbSanctionedCost: e.target.value })}
            placeholder="0.00"
            required
            className="h-12 rounded-xl border-slate-100 bg-emerald-50/10 px-4 font-black text-slate-900"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <Layers size={14} className="text-slate-400" />
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Units Sanctioned</label>
          </div>
          <Input
            value={formData.qtySanctioned}
            onChange={(e) => setFormData({ ...formData, qtySanctioned: e.target.value })}
            placeholder="Volume count..."
            required
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold"
          />
        </div>
      </div>

      {/* Detailed Evaluation Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Units Allotted</label>
          <Input
            value={formData.qtyAllotted}
            onChange={(e) => setFormData({ ...formData, qtyAllotted: e.target.value })}
            placeholder="Assigned count"
            required
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4"
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">DE Ledger Value</label>
          <Input
            value={formData.deTotalValue}
            onChange={(e) => setFormData({ ...formData, deTotalValue: e.target.value })}
            placeholder="Evaluation total"
            required
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold"
          />
        </div>
      </div>

      {/* Lifecycle Status */}
      <div className="space-y-6 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle size={18} className="text-primary/60" />
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle Tracking</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Milestone</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold focus:ring-primary/10">
                <SelectValue placeholder="Project standing..." />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-100 shadow-2xl rounded-2xl p-1">
                <SelectItem value="de_process" className="rounded-lg font-bold">DE under process</SelectItem>
                <SelectItem value="de_finance" className="rounded-lg font-bold">DE Sent to Finance</SelectItem>
                <SelectItem value="de_hqrs" className="rounded-lg font-bold">DE sent to HQrs</SelectItem>
                <SelectItem value="work_process" className="rounded-lg font-bold">Work under process</SelectItem>
                <SelectItem value="tender" className="rounded-lg font-bold">Tender stage</SelectItem>
                <SelectItem value="completed" className="rounded-lg font-black text-emerald-600">Work Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Observational Remarks</label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Internal notes..."
              className="min-h-[48px] h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 py-3 focus-visible:bg-white focus-visible:ring-primary/10 transition-all text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSPWorkForm;