import React, { useEffect, useState, useCallback } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Pencil, Trash2, Plus, AlertCircle, ChevronDown } from "lucide-react";
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
import { db } from "../lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { parseAmount, formatINR, formatDisplayDate } from "../lib/utils";
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
  createdAt: unknown;
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
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expenditureAmount, setExpenditureAmount] = useState("");
  const [expenditureRemarks, setExpenditureRemarks] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadContingencies = useCallback(async () => {
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
    } catch (error) {
      console.error("Error fetching contingencies:", error);
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({ title: "Error fetching data", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadContingencies();
  }, [loadContingencies]);

  const filteredContingencies = selectedYear === "all"
    ? contingencies
    : contingencies.filter(c => c.yearOfSanction === selectedYear);

  const getBalance = (item: ContingencyItem) => {
    // parseAmount returns null for missing/invalid amounts; treat as 0
    const total = parseAmount(item.totalAmount) ?? 0;
    const spent = (item.expenditures || []).reduce((sum, e) => sum + (parseAmount(e.amount) ?? 0), 0);
    return total - spent;
  };

  const getTotalSpent = (item: ContingencyItem) => {
    return (item.expenditures || []).reduce((sum, e) => sum + (parseAmount(e.amount) ?? 0), 0);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "contingencies", id));
      await loadContingencies();
      toast({ title: "Deleted", description: "Contingency entry removed successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
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
    const amount = parseAmount(expenditureAmount);
    if (amount === null || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    const balance = getBalance(item);
    if (amount > balance) {
      toast({ title: "Error", description: `Amount exceeds available balance (${formatINR(balance)})`, variant: "destructive" });
      return;
    }

    const newEntry: ExpenditureEntry = {
      id: crypto.randomUUID(),
      amount: String(amount),
      balance: String(balance - amount),
      remarks: expenditureRemarks,
      // ISO string: unambiguous, sortable; legacy locale strings still display
      date: new Date().toISOString(),
    };

    const updatedExpenditures = [...(item.expenditures || []), newEntry];

    try {
      await updateDoc(doc(db, "contingencies", item.id), {
        expenditures: updatedExpenditures,
      });
      toast({ title: "Success", description: "Expenditure recorded" });
      setExpenditureAmount("");
      setExpenditureRemarks("");
      await loadContingencies();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contingency Allocations</h1>
            <p className="text-sm text-slate-500 font-medium">
              {filteredContingencies.length} entries registered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {years.length > 0 && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px] h-10 bg-white border-slate-200 rounded-lg">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-100 rounded-lg">
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => {
              localStorage.removeItem('editContingency');
              navigate('/add-contingency');
            }}
            className="btn-primary h-10 px-5"
          >
            <Plus size={18} />
            Add
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-4 w-12 text-center">#</th>
                <th className="px-4 py-4">Description</th>
                <th className="px-4 py-4 text-center">Year</th>
                <th className="px-4 py-4">Total Amount</th>
                <th className="px-4 py-4">Spent</th>
                <th className="px-4 py-4">Balance</th>
                <th className="px-4 py-4 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-slate-400 mt-4">Loading entries...</p>
                  </td>
                </tr>
              ) : filteredContingencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">No entries registered</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-4">
                      Start by adding a new contingency allocation.
                    </p>
                    <Button onClick={() => navigate('/add-contingency')} className="btn-primary px-6">
                      <Plus size={16} className="mr-2" />
                      Add Entry
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredContingencies.map((item, index) => {
                  const spent = getTotalSpent(item);
                  // Guarded: never NaN even if totalAmount is missing/invalid
                  const total = parseAmount(item.totalAmount) ?? 0;
                  const balance = total - spent;
                  const isExpanded = expandedId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`hover:bg-slate-50/50 transition-colors group ${isExpanded ? 'bg-primary/5' : ''}`}>
                        <TableCell className="px-4 py-4 text-center text-slate-400 font-mono text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center gap-3 text-left w-full group/btn"
                          >
                            <span className={`w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-all group-hover/btn:bg-primary group-hover/btn:text-white ${isExpanded ? 'bg-primary text-white' : ''}`}>
                              <ChevronDown size={14} />
                            </span>
                            <span className="font-medium text-slate-700 text-sm">{item.description || '-'}</span>
                          </button>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{item.yearOfSanction || '-'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="text-sm font-semibold text-slate-900">
                            {formatINR(item.totalAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="text-sm font-medium text-slate-600">
                            {formatINR(spent)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            balance <= 0
                              ? 'bg-red-50 text-red-700'
                              : balance < total * 0.25
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {formatINR(balance)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit ${item.description || 'entry'}`}
                              className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil size={15} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Delete ${item.description || 'entry'}`}
                                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                >
                                  <Trash2 size={15} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-xl border-none shadow-xl max-w-md">
                                <AlertDialogHeader>
                                  <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={24} />
                                  </div>
                                  <AlertDialogTitle className="text-xl font-bold text-slate-900 text-center">
                                    Delete this entry?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-500 text-center">
                                    This action will permanently remove the record.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6 gap-2">
                                  <AlertDialogCancel className="flex-1 h-11 rounded-lg border-slate-200 font-semibold">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 h-11 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-8 py-6 bg-slate-50/30">
                            <div className="max-w-4xl ml-6 pl-4 border-l-2 border-primary/20">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                Expenditure History
                              </p>

                              {item.expenditures && item.expenditures.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                  {item.expenditures.map((exp) => (
                                    <div key={exp.id} className="bg-white rounded-lg border border-slate-100 p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-slate-400">{formatDisplayDate(exp.date)}</span>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                      </div>
                                      <p className="text-lg font-bold text-slate-900">
                                        {formatINR(exp.amount)}
                                      </p>
                                      <p className="text-xs text-slate-400 mt-1">
                                        Balance: {formatINR(exp.balance)}
                                      </p>
                                      {exp.remarks && (
                                        <p className="text-xs text-slate-500 mt-2 italic">"{exp.remarks}"</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-white border border-dashed border-slate-200">
                                  <AlertCircle size={18} className="text-slate-300" />
                                  <p className="text-sm text-slate-500">No expenditures recorded</p>
                                </div>
                              )}

                              {balance > 0 ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-lg bg-white border border-slate-100">
                                  <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                                    <Input
                                      type="number"
                                      inputMode="decimal"
                                      value={expenditureAmount}
                                      onChange={(e) => setExpenditureAmount(e.target.value)}
                                      placeholder="Amount to record"
                                      className="pl-7 h-11 rounded-lg border-slate-200 bg-slate-50 focus:bg-white font-semibold"
                                    />
                                  </div>
                                  <Input
                                    value={expenditureRemarks}
                                    onChange={(e) => setExpenditureRemarks(e.target.value)}
                                    placeholder="Notes / Remarks..."
                                    className="flex-1 h-11 rounded-lg border-slate-200 bg-slate-50 focus:bg-white"
                                  />
                                  <Button onClick={() => addExpenditure(item)} className="btn-primary h-11 px-6">
                                    Record
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700">
                                  <AlertCircle size={18} />
                                  <p className="text-sm font-semibold">Allocation exhausted: No funds available</p>
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