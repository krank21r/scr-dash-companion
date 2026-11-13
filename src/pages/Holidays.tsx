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
  { name: "Christmas", date: "25-12-2026", day: "Friday" },
];

const Holidays = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-200/80 shadow-sm text-slate-400 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition-all"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Railway Holidays Calendar 2026
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {holidays.length} Holidays
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Official South Central Railway closed &amp; national holidays schedule
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
      >
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-5 border-b border-white/5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-900/30">
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">South Central Railway Calendar</h3>
              <p className="text-teal-200/70 text-[11px] font-medium">Carriage Workshop LGD &middot; 2026</p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-mono font-bold border border-white/15">
            {holidays.length} Closed Days
          </div>
        </div>

        <div className="bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600 font-bold">
                  <th className="text-left py-3 px-5 w-12">#</th>
                  <th className="text-left py-3 px-5">Holiday Name</th>
                  <th className="text-left py-3 px-5">Date</th>
                  <th className="text-left py-3 px-5">Day</th>
                  <th className="text-center py-3 px-5 w-24">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holidays.map((holiday, index) => (
                  <motion.tr
                    key={holiday.date}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3 px-5 font-mono text-slate-400 font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-900">{holiday.name}</td>
                    <td className="py-3 px-5 font-mono font-medium text-slate-600 whitespace-nowrap">
                      {holiday.date}
                    </td>
                    <td className="py-3 px-5 text-slate-600 font-medium">{holiday.day}</td>
                    <td className="py-3 px-5 text-center">
                      {holiday.type === "NH" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          National Holiday
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Closed</span>
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
