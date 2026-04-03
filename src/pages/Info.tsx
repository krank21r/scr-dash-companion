import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info as InfoIcon, CalendarDays, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Info = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      <div className="flex items-center gap-6 group">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="h-14 w-14 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-500 active:scale-95"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Info
          </h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-violet-500 animate-pulse"></span>
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
          className="group block rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
                <CalendarDays size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Holidays</h3>
                <p className="text-sm text-slate-500 mt-0.5">View holiday list</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="glass-card border-none shadow-premium-shadow overflow-hidden"
      >
        <div className="bg-slate-900 p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
              <InfoIcon size={24} />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight font-['Plus_Jakarta_Sans'] uppercase">About</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">Budget Portal Details</p>
            </div>
          </div>
        </div>
        
        <div className="p-10 bg-white space-y-8">
          <div className="space-y-4">
            <h4 className="text-xl font-black text-slate-900">Budget Section Portal</h4>
            <p className="text-slate-600 leading-relaxed">
              A comprehensive dashboard for managing budget allocations, works tracking, and financial controls for Carriage Workshop LGD.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Version</p>
              <p className="text-sm font-medium text-slate-900">1.0.0</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</p>
              <p className="text-sm font-medium text-slate-900">Budget Section, Carriage Workshop</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Info;
