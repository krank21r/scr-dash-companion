import React, { useEffect, useState } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Pencil, Trash2, Plus, Filter, AlertCircle, ChevronDown, ChevronUp, IndianRupee } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { db } from "../main";
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, orderBy } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface ContingencyItem {
  id: string;
  description: string;
  yearOfSanction: string;
  totalAmount: string;
  createdAt: any;
  expenditures?: ExpenditureEntry[];
}

interface ExpenditureEntry {
  id: string;
  amount: string;
  balance: string;
  remarks: string;
  date: string;
}

const Contingencies = () => {
  const [contingencies, setContingencies] = useState<ContingencyItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expenditureAmount, setExpenditureAmount] = useState("");
  const [expenditureRemarks, setExpenditureRemarks] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadContingencies = async () => {
    try {
      const q = query(collection(db, "contingencies"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedData: ContingencyItem[] = [];
      querySnapshot.forEach((d) => {
        const data = d.data();
        fetchedData.push({
          id: d.id,
          description: data.description || "",
          yearOfSanction: data.yearOfSanction || "",
          totalAmount: data.totalAmount || "0",
          createdAt: data.createdAt,
          expenditures: data.expenditures || [],
        } as ContingencyItem);
      });
      setContingencies(fetchedData);

      const uniqueYears = [...new Set(fetchedData.map(c => c.yearOfSanction).filter(Boolean))].sort().reverse();
      setYears(uniqueYears);
    } catch (error: any) {
      console.error("Error fetching contingencies:", error);
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    loadContingencies();
  }, []);

  const filteredContingencies = selectedYear === "all"
    ? contingencies
    : contingencies.filter(c => c.yearOfSanction === selectedYear);

  const getBalance = (item: ContingencyItem) => {
    const total = parseFloat(item.totalAmount) || 0;
    const spent = (item.expenditures || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    return total - spent;
  };

  const getTotalSpent = (item: ContingencyItem) => {
    return (item.expenditures || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "contingencies", id));
      await loadContingencies();
      toast({ title: "Deleted", description: "Contingency deleted successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (item: ContingencyItem) => {
    localStorage.setItem('editContingency', JSON.stringify(item));
    navigate('/add-contingency');
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setExpenditureAmount("");
      setExpenditureRemarks("");
    }
  };

  const addExpenditure = async (item: ContingencyItem) => {
    const amount = parseFloat(expenditureAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    const balance = getBalance(item);
    if (amount > balance) {
      toast({ title: "Error", description: `Amount exceeds available balance (₹${balance.toLocaleString('en-IN')})`, variant: "destructive" });
      return;
    }

    const newEntry: ExpenditureEntry = {
      id: Date.now().toString(),
      amount: expenditureAmount,
      balance: (balance - amount).toString(),
      remarks: expenditureRemarks,
      date: new Date().toLocaleDateString(),
    };

    const updatedExpenditures = [...(item.expenditures || []), newEntry];

    try {
      await updateDoc(doc(db, "contingencies", item.id), {
        expenditures: updatedExpenditures,
      });
      toast({ title: "Success", description: "Expenditure added" });
      setExpenditureAmount("");
      setExpenditureRemarks("");
      loadContingencies();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card p-6 border-slate-200/10 shadow-glow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-glow-sm">
            <AlertCircle size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-0.5">Contingencies</h1>
            <p className="text-xs text-slate-500 font-bold">{filteredContingencies.length} contingencies currently tracked</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {years.length > 0 && (
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
              <Filter size={16} className="text-slate-400 ml-2" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px] h-9 bg-transparent border-0 focus:ring-0 text-sm font-extrabold text-slate-700">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 shadow-xl rounded-2xl">
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button 
            onClick={() => {
              localStorage.removeItem('editContingency');
              navigate('/add-contingency');
            }} 
            className="btn-primary-glow h-10 px-6 rounded-xl text-sm font-bold"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Contingency
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="glass-card overflow-hidden border-none shadow-premium-shadow mb-10">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-20 table-header-glow shadow-sm">
              <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-['Plus_Jakarta_Sans']">
                <th className="px-6 py-5 w-[6%] text-center">#</th>
                <th className="px-6 py-5 w-[34%]">Description</th>
                <th className="px-6 py-5 w-[10%] text-center">Year</th>
                <th className="px-6 py-5 w-[15%]">Total Amount</th>
                <th className="px-6 py-5 w-[15%]">Spent</th>
                <th className="px-6 py-5 w-[15%]">Balance</th>
                <th className="px-6 py-5 w-[5%] text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {filteredContingencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100/50">
                      <AlertCircle size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg font-['Plus_Jakarta_Sans']">No records discovered</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6 font-medium">
                      {selectedYear !== "all" ? `No entries found for the year ${selectedYear}.` : "Start building your database by adding a new record."}
                    </p>
                    <Button onClick={() => navigate('/add-contingency')} className="btn-primary-glow px-6 rounded-xl">
                      <Plus size={18} className="mr-2" /> Create First Record
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredContingencies.map((item, index) => {
                  const spent = getTotalSpent(item);
                  const balance = parseFloat(item.totalAmount) - spent;
                  const isExpanded = expandedId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`premium-table-row transition-all duration-300 group border-b border-slate-50/50 ${isExpanded ? 'bg-primary/[0.02] border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}>
                        <TableCell className="px-6 py-5 text-center text-slate-400 font-mono text-[10px] font-bold">{index + 1}</TableCell>
                        <TableCell className="px-6 py-5">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center gap-3.5 text-slate-700 group-hover:text-primary font-bold transition-all text-left font-['Plus_Jakarta_Sans'] text-sm"
                          >
                            <span className={`w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary ${isExpanded ? 'rotate-180 bg-primary shadow-lg shadow-primary/20 text-white' : ''}`}>
                              <ChevronDown size={14} />
                            </span>
                            <span className="group-hover:underline decoration-primary/30 underline-offset-4">{item.description || '-'}</span>
                          </button>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-slate-500 font-bold text-center font-['Plus_Jakarta_Sans'] text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100/50 border border-slate-200/40">{item.yearOfSanction || '-'}</span>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-slate-900 font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] text-sm">
                          <span className="text-slate-300 font-medium mr-1 text-[10px]">₹</span>
                          {parseFloat(item.totalAmount).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="px-6 py-5 text-slate-600 font-bold font-['Plus_Jakarta_Sans'] text-sm">
                          <span className="text-slate-300 font-medium mr-1 text-[10px]">₹</span>
                          {spent.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[10px] font-black border shadow-sm transition-all duration-300 font-['Plus_Jakarta_Sans'] ${
                            balance <= 0 
                              ? 'bg-red-50 text-red-600 border-red-100 shadow-red-100/20' 
                              : balance < parseFloat(item.totalAmount) * 0.25 
                                ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20'
                          }`}>
                            ₹{balance.toLocaleString('en-IN')}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-right pr-8">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2.5rem] border-none shadow-[25px_25px_60px_rgba(0,0,0,0.15)] bg-white p-10 max-w-lg">
                                <AlertDialogHeader>
                                  <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 text-red-600 flex items-center justify-center mb-6 shadow-inner ring-8 ring-red-50/50">
                                    <Trash2 size={32} />
                                  </div>
                                  <AlertDialogTitle className="text-3xl font-['Plus_Jakarta_Sans'] font-extrabold text-slate-900 tracking-tight leading-tight">Delete this record?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-500 text-lg font-medium leading-relaxed pt-2">
                                    This will permanently excise this contingency from the registry. You will lose all expenditure history associated with it.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-10 gap-4">
                                  <AlertDialogCancel className="h-14 flex-1 border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 font-bold px-6 text-base transition-all">Keep it</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)} className="h-14 flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-200 font-bold px-8 text-base transition-all">
                                    Confirm Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </tr>
                      {isExpanded && (
                        <tr key={`${item.id}-expand`} className="bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-500">
                          <td colSpan={7} className="px-8 py-8 border-b border-slate-100/50">
                            <div className="max-w-5xl mx-auto pl-10 border-l-2 border-primary/20">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><IndianRupee size={12}/></span>
                                Transaction Detail Ledger
                              </p>
                              
                              {item.expenditures && item.expenditures.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                  {item.expenditures.map((exp, i) => (
                                    <div key={exp.id} className="group/item flex flex-col p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                      <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{exp.date}</span>
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                      </div>
                                      <div className="mb-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">Amount Debited</p>
                                        <p className="font-black text-xl text-slate-900 tracking-tighter">₹{parseFloat(exp.amount).toLocaleString('en-IN')}</p>
                                      </div>
                                      <div className="mt-auto pt-4 border-t border-slate-50 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="text-slate-400">Post-Balance</span>
                                          <span className="text-slate-800">₹{parseFloat(exp.balance).toLocaleString('en-IN')}</span>
                                        </div>
                                        {exp.remarks && (
                                          <div className="p-2 rounded-lg bg-slate-50 text-[10px] text-slate-500 italic font-medium leading-relaxed">
                                            "{exp.remarks}"
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-slate-50/50 border-2 border-dashed border-slate-200/60">
                                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 shadow-sm"><AlertCircle size={20} /></div>
                                  <div>
                                    <p className="text-sm text-slate-700 font-bold tracking-tight">Ledger Empty</p>
                                    <p className="text-xs text-slate-400 font-medium">No expenditures documented for this allocation yet.</p>
                                  </div>
                                </div>
                              )}

                              {balance > 0 ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20">
                                  <div className="relative flex-1 sm:max-w-[200px]">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                                    <Input
                                      type="number"
                                      inputMode="decimal"
                                      value={expenditureAmount}
                                      onChange={(e) => setExpenditureAmount(e.target.value)}
                                      placeholder="Sum to debit"
                                      className="pl-8 h-12 rounded-xl border-slate-100 bg-slate-50 focus-visible:bg-white focus-visible:ring-primary/10 text-sm font-bold placeholder:font-normal"
                                    />
                                  </div>
                                  <div className="relative flex-1">
                                    <Input
                                      value={expenditureRemarks}
                                      onChange={(e) => setExpenditureRemarks(e.target.value)}
                                      placeholder="Memo / Remarks..."
                                      className="h-12 px-4 rounded-xl border-slate-100 bg-slate-50 focus-visible:bg-white focus-visible:ring-primary/10 text-sm font-medium"
                                    />
                                  </div>
                                  <Button onClick={() => addExpenditure(item)} className="bg-slate-900 hover:bg-black text-white rounded-xl h-12 px-8 font-bold transition-all shadow-lg active:scale-95 group">
                                    Record Entry
                                    <Plus size={16} className="ml-2 group-hover:rotate-90 transition-transform" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="p-5 rounded-2xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-3 border border-red-100 shadow-sm shadow-red-50">
                                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-200"><AlertCircle size={18} /></div>
                                  Allocation Threshold Reached: Funds for this contingency are fully exhausted.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contingencies;