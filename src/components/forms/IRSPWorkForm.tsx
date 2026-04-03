import React from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FileText, Calendar, Hash, IndianRupee, Layers, CheckCircle, Tag } from "lucide-react";

interface IRSPWorkFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const IRSPWorkForm = ({ formData, setFormData }: IRSPWorkFormProps) => {
  return (
    <div className="space-y-10">
      {/* Primary Info Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText size={18} className="text-cyan-500/60" />
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Specification</h4>
        </div>
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Asset Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the rolling stock itemized module..."
            required
            className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 p-4 focus-visible:bg-white focus-visible:ring-cyan-500/10 transition-all font-medium text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Identifiers (LAW No / Year) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <Tag size={14} className="text-slate-400" />
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">LAW Reference No</label>
          </div>
          <Input
            value={formData.lawNo}
            onChange={(e) => setFormData({ ...formData, lawNo: e.target.value })}
            placeholder="Unique LAW-ID..."
            required
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold text-sm font-mono"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <Calendar size={14} className="text-slate-400" />
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sanction Period</label>
          </div>
          <Input
            type="text"
            inputMode="numeric"
            value={formData.yearOfSanction}
            onChange={(e) => setFormData({ ...formData, yearOfSanction: e.target.value })}
            placeholder="YYYY"
            required
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold text-sm"
          />
        </div>
      </div>

      {/* Valuation & Volume */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <IndianRupee size={14} className="text-cyan-500" />
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Unit Rate Allocation</label>
          </div>
          <Input
            type="text"
            inputMode="decimal"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            placeholder="0.00"
            required
            className="h-12 rounded-xl border-slate-100 bg-cyan-50/10 px-4 font-black text-slate-900 shadow-inner"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <Layers size={14} className="text-slate-400" />
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Quantity Threshold</label>
          </div>
          <Input
            value={formData.qtySanctioned}
            onChange={(e) => setFormData({ ...formData, qtySanctioned: e.target.value })}
            placeholder="Volume units..."
            required
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold"
          />
        </div>
      </div>

      {/* Cumulative Value */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Total Aggregate Valuation</label>
        <Input
          value={formData.totalValue}
          onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
          placeholder="Calculated aggregate sum..."
          required
          className="h-14 rounded-[1.25rem] border-slate-200 bg-slate-50/50 px-5 font-black text-xl text-primary tracking-tighter shadow-inner"
        />
      </div>

      {/* Lifecycle Status */}
      <div className="space-y-6 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle size={18} className="text-cyan-500/60" />
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment Standing</h4>
        </div>
        <div className="space-y-2.5 max-w-md">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Strategic Milestone</label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 font-bold focus:ring-cyan-500/10 transition-all">
              <SelectValue placeholder="Current phase..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-100 shadow-2xl rounded-2xl p-1">
              <SelectItem value="de_process" className="rounded-lg font-bold">DE under process</SelectItem>
              <SelectItem value="de_finance" className="rounded-lg font-bold">DE Sent to Finance</SelectItem>
              <SelectItem value="de_hqrs" className="rounded-lg font-bold">DE sent to HQrs</SelectItem>
              <SelectItem value="indents_placed" className="rounded-lg font-black text-cyan-600 bg-cyan-50">Indents placed</SelectItem>
              <SelectItem value="work_process" className="rounded-lg font-bold">Work under process</SelectItem>
              <SelectItem value="completed" className="rounded-lg font-black text-emerald-600 bg-emerald-50">Work Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default IRSPWorkForm;
