import React, { useEffect, useState } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Pencil, Trash2, Plus, Filter, AlertCircle, ChevronDown, ChevronUp, IndianRupee, Wallet, Calendar, ReceiptText, ArrowDownRight } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Contingencies</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-md">
            <Filter size={14} className="text-muted-foreground ml-3" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[160px] h-9 bg-transparent border-0 focus:ring-0 text-xs font-black text-foreground uppercase tracking-widest">
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="all" className="font-bold">Reset Filters</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year} className="font-bold">{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => {
              localStorage.removeItem('editContingency');
              navigate('/add-contingency');
            }} 
            className="h-11 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-500/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Contingency
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground w-12">#</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Period</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Budget</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Utilized</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Residual</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredContingencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-32 text-center bg-muted/5">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <AlertCircle size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-xl font-bold text-foreground">Empty Registry</h3>
                      <p className="text-sm font-medium mt-2">No contingencies discovered.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContingencies.map((item, index) => {
                  const spent = getTotalSpent(item);
                  const balance = parseFloat(item.totalAmount) - spent;
                  const isExpanded = expandedId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`group transition-all duration-300 ${isExpanded ? 'bg-amber-500/[0.03] border-l-4 border-l-amber-500' : 'hover:bg-muted/20 border-l-4 border-l-transparent'}`}>
                        <TableCell className="px-6 py-6 text-center">
                          <span className="text-xs font-bold text-muted-foreground/50">{index + 1}</span>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center gap-4 text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 rotate-180' : 'bg-muted text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500'}`}>
                              <ChevronDown size={14} />
                            </div>
                            <div>
                              <span className="block font-bold text-foreground text-sm leading-tight group-hover:text-amber-600 transition-colors">{item.description || '-'}</span>
                            </div>
                          </button>
                        </TableCell>
                        <TableCell className="px-6 py-6 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-muted border border-border/50 text-[11px] font-bold text-muted-foreground">{item.yearOfSanction || '-'}</span>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-muted-foreground/30">₹</span>
                            <span className="text-base font-extrabold text-foreground tracking-tight stat-number">{parseFloat(item.totalAmount).toLocaleString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-muted-foreground/30">₹</span>
                            <span className="text-sm font-bold text-muted-foreground/80">{spent.toLocaleString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border tracking-wider transition-all duration-300 ${
                            balance <= 0 
                              ? 'bg-destructive/10 text-destructive border-destructive/20' 
                              : balance < parseFloat(item.totalAmount) * 0.25 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            ₹{balance.toLocaleString('en-IN')}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-6 text-right pr-10">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-xl" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-xl">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2.5rem] border-none glass-card p-10 max-w-lg shadow-2xl">
                                <AlertDialogHeader>
                                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6 shadow-inner border border-rose-500/20">
                                    <Trash2 size={28} />
                                  </div>
                                  <AlertDialogTitle className="text-3xl font-extrabold text-foreground tracking-tight">Excise record?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground text-lg font-medium leading-relaxed pt-2">
                                    Permanent erasure requested. All historical ledger entries for this contingency will be lost.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-10 gap-4">
                                  <AlertDialogCancel className="h-14 flex-1 border-border rounded-xl font-bold text-muted-foreground">Preserve</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)} className="h-14 flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-500/20 font-bold">
                                    Confirm Purge
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </tr>
                      {isExpanded && (
                        <tr key={`${item.id}-ledger`}>
                          <td colSpan={7} className="px-10 py-10 bg-muted/20 border-b border-border/30">
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }} 
                              animate={{ opacity: 1, y: 0 }}
                              className="max-w-6xl mx-auto space-y-8"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <ReceiptText size={16} />
                                  </div>
                                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Transaction Ledger</h4>
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted px-3 py-1 rounded-full border border-border/50">
                                  Logged Transactions: {item.expenditures?.length || 0}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence mode="popLayout">
                                  {item.expenditures && item.expenditures.length > 0 ? (
                                    item.expenditures.map((exp) => (
                                      <motion.div 
                                        key={exp.id} 
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col p-6 rounded-[1.5rem] bg-card border border-border/50 shadow-xl shadow-amber-500/[0.02] hover:-translate-y-1 transition-all duration-300 group/card"
                                      >
                                        <div className="flex items-center justify-between mb-5">
                                          <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-muted-foreground/40" />
                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{exp.date}</span>
                                          </div>
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>
                                        <div className="space-y-1 mb-6">
                                          <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.1em]">Principal Debit</p>
                                          <p className="font-extrabold text-2xl text-foreground tracking-tighter stat-number">₹{parseFloat(exp.amount).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="mt-auto pt-5 border-t border-border/30 space-y-3">
                                          <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-muted-foreground/40">Adjusted Balance</span>
                                            <span className="text-foreground/80">₹{parseFloat(exp.balance).toLocaleString('en-IN')}</span>
                                          </div>
                                          {exp.remarks && (
                                            <div className="p-3 rounded-xl bg-muted/50 text-[11px] text-muted-foreground font-medium leading-relaxed italic border border-border/30 group-hover/card:bg-muted transition-colors">
                                              "{exp.remarks}"
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))
                                  ) : (
                                    <div className="col-span-full py-10 flex flex-col items-center justify-center bg-muted/30 rounded-[2rem] border-2 border-dashed border-border">
                                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/20 mb-3"><ReceiptText size={24} /></div>
                                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No entries documented</p>
                                    </div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {balance > 0 ? (
                                <div className="p-1 rounded-[1.75rem] border border-border/50 bg-muted/30 backdrop-blur-md shadow-inner max-w-2xl">
                                  <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5">
                                    <div className="relative w-full sm:w-40">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-black text-xs">₹</span>
                                      <input
                                        type="number"
                                        value={expenditureAmount}
                                        onChange={(e) => setExpenditureAmount(e.target.value)}
                                        placeholder="Debit amount"
                                        className="w-full h-11 pl-8 pr-4 rounded-2xl bg-card border-none outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-bold placeholder:font-normal"
                                      />
                                    </div>
                                    <div className="flex-1 w-full">
                                      <input
                                        type="text"
                                        value={expenditureRemarks}
                                        onChange={(e) => setExpenditureRemarks(e.target.value)}
                                        placeholder="Transaction reference / memo..."
                                        className="w-full h-11 px-4 rounded-2xl bg-card border-none outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-medium"
                                      />
                                    </div>
                                    <Button 
                                      onClick={() => addExpenditure(item)}
                                      className="h-11 px-6 rounded-2xl bg-foreground text-background hover:bg-amber-600 hover:text-white transition-all font-bold shadow-lg"
                                    >
                                      Record Entry
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/10 max-w-xl">
                                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20"><AlertCircle size={20} /></div>
                                  <div>
                                    <p className="text-sm font-bold text-foreground">Resource Depletion</p>
                                    <p className="text-xs text-muted-foreground">Allocation for this contingency has been fully exhausted.</p>
                                  </div>
                                </div>
                              )}
                            </motion.div>
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