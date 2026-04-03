import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const holidays = [
  { name: "New Year Day", date: "01-01-2026", day: "Thursday" },
  { name: "Sankranti/Pongal", date: "15-01-2026", day: "Thursday" },
  { name: "Republic Day", date: "26-01-2026", day: "Monday", type: "NH" },
  { name: "Holi", date: "03-03-2026", day: "Tuesday" },
  { name: "Ugadi", date: "19-03-2026", day: "Thursday" },
  { name: "Ramzan (Eid-ul-fitr)", date: "21-03-2026", day: "Saturday" },
  { name: "Good Friday", date: "03-04-2026", day: "Friday" },
  { name: "Bakrid (Eid-ul-azha)", date: "27-05-2026", day: "Wednesday" },
  { name: "Moharram", date: "26-06-2026", day: "Friday" },
  { name: "Bonalu", date: "10-08-2026", day: "Monday" },
  { name: "Independence Day", date: "15-08-2026", day: "Saturday", type: "NH" },
  { name: "Vinayaka Chaturthi", date: "14-09-2026", day: "Monday" },
  { name: "Mahatma Gandhi Jayanthi", date: "02-10-2026", day: "Friday", type: "NH" },
  { name: "Vijayadasami", date: "20-10-2026", day: "Tuesday" },
  { name: "Christmas", date: "25-12-2026", day: "Friday" }
];

const Holidays = () => {
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
            Holidays
          </h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
            2026 Holiday Calendar
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card border-none shadow-premium-shadow overflow-hidden"
      >
        <div className="bg-slate-900 p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <CalendarDays size={24} />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight font-['Plus_Jakarta_Sans'] uppercase">Holiday List</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">Official Calendar 2026</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
            {holidays.length} Days
          </div>
        </div>
        
        <div className="bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest py-4 px-6">#</th>
                  <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest py-4 px-6">Holiday Name</th>
                  <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest py-4 px-6">Date</th>
                  <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest py-4 px-6">Day</th>
                  <th className="text-center text-[11px] font-black text-slate-400 uppercase tracking-widest py-4 px-6">Type</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-900">{holiday.name}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600">{holiday.date}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600">{holiday.day}</td>
                    <td className="py-4 px-6 text-center">
                      {holiday.type === "NH" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                          NH
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Holidays;
