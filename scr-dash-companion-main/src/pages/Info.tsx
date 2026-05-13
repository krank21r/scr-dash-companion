import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info as InfoIcon, CalendarDays, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Info = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4">
      <div className="flex items-center gap-4 group">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 transition-all duration-500 active:scale-95"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">
            Info
          </h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-[0.15em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-sky-500 animate-pulse"></span>
            Application Information
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          to="/holidays"
          className="group block rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-sky-200 transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shadow-sm group-hover:bg-sky-100 group-hover:scale-110 transition-all duration-300">
                <CalendarDays size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base font-display">Holidays</h3>
                <p className="text-xs text-slate-500">View holiday list</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="glass-card border-none shadow-premium-shadow overflow-hidden"
      >
        <div className="bg-slate-900 p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/30">
              <InfoIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight font-display uppercase">About</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">Budget Portal Details</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white space-y-4">
          <div>
            <h4 className="text-base font-bold text-slate-900 font-display">Budget Section Portal</h4>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">
              A comprehensive dashboard for managing budget allocations, works tracking, and financial controls for Carriage Workshop LGD.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Version</p>
              <p className="text-sm font-medium text-slate-900">1.0.0</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</p>
              <p className="text-sm font-medium text-slate-900">Budget Section</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Staff Details</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold font-display text-xs">1</div>
                <div>
                  <p className="text-xs font-bold text-slate-900">N.Chandrasekhar</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">SSE</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold font-display text-xs">2</div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Jagadeesh</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">SSE</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold font-display text-xs">3</div>
                <div>
                  <p className="text-xs font-bold text-slate-900">J.RamTilak</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">SSE</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold font-display text-xs">4</div>
                <div>
                  <p className="text-xs font-bold text-slate-900">R.Kranthi</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">Tech-I</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Info;
