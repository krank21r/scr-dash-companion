import React, { useEffect, useState, useCallback, useMemo } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  ChevronDown,
  Search,
  X,
  IndianRupee,
  CheckCircle2,
  TrendingDown,
  Calendar,
} from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expenditureAmount, setExpenditureAmount] = useState("");
  const [expenditureRemarks, setExpenditureRemarks] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

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

      const uniqueYears = [
        ...new Set(fetchedData.map((c) => c.yearOfSanction).filter(Boolean)),
      ].sort().reverse();
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

  const filteredContingencies = useMemo(() => {
    return contingencies.filter((c) => {
      const matchesYear = selectedYear === "all" || c.yearOfSanction === selectedYear;
      if (!matchesYear) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.description?.toLowerCase().includes(q) ||
        c.yearOfSanction?.toLowerCase().includes(q)
      );
    });
  }, [contingencies, selectedYear, searchQuery]);

  const getBalance = (item: ContingencyItem) => {
    const total = parseAmount(item.totalAmount) ?? 0;
    const spent = (item.expenditures || []).reduce(
      (sum, e) => sum + (parseAmount(e.amount) ?? 0),
      0
    );
    return total - spent;
  };

  const getTotalSpent = (item: ContingencyItem) => {
    return (item.expenditures || []).reduce(
      (sum, e) => sum + (parseAmount(e.amount) ?? 0),
      0
    );
  };

  // Aggregated totals
  const totalAllocation = useMemo(() => {
    return filteredContingencies.reduce(
      (acc, c) => acc + (parseAmount(c.totalAmount) ?? 0),
      0
    );
  }, [filteredContingencies]);

  const totalSpentAll = useMemo(() => {
    return filteredContingencies.reduce((acc, c) => acc + getTotalSpent(c), 0);
  }, [filteredContingencies]);

  const totalBalanceAll = totalAllocation - totalSpentAll;

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
    localStorage.setItem("editContingency", JSON.stringify(item));
    navigate("/add-contingency");
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
      toast({
        title: "Error",
        description: `Amount exceeds available balance (${formatINR(balance)})`,
        variant: "destructive",
      });
      return;
    }

    const newEntry: ExpenditureEntry = {
      id: crypto.randomUUID(),
      amount: String(amount),
      balance: String(balance - amount),
      remarks: expenditureRemarks,
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
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
            <IndianRupee size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Contingency
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {filteredContingencies.length} Head Entries
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search description or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs rounded-xl border-slate-200/80 bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {years.length > 0 && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[130px] h-9 bg-white border-slate-200 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 rounded-xl">
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isAdmin && (
            <Button
              onClick={() => {
                localStorage.removeItem("editContingency");
                navigate("/add-contingency");
              }}
              className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 shrink-0"
            >
              <Plus size={15} />
              <span>Add Fund</span>
            </Button>
          )}
        </div>
      </div>

      {/* Financial Health Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
            <IndianRupee size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Contingencies
            </p>
            <p className="text-base font-extrabold text-slate-900 font-mono">
              ₹{totalAllocation.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shrink-0">
            <TrendingDown size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Expenditures
            </p>
            <p className="text-base font-extrabold text-amber-700 font-mono">
              ₹{totalSpentAll.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Available Balance
            </p>
            <p className="text-base font-extrabold text-emerald-700 font-mono">
              ₹{totalBalanceAll.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Table & Expanded Expenditures */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px] text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-xs font-bold text-slate-700 border-b border-slate-200">
                <th className="px-3.5 py-3 w-12 text-center border-r border-slate-200/70">#</th>
                <th className="px-4 py-3 border-r border-slate-200/70">Description</th>
                <th className="px-3 py-3 text-center w-24 border-r border-slate-200/70">Year</th>
                <th className="px-4 py-3 text-right border-r border-slate-200/70">Sanctioned</th>
                <th className="px-4 py-3 text-right border-r border-slate-200/70">Expenditure</th>
                <th className="px-4 py-3 text-right border-r border-slate-200/70">Net Balance</th>
                <th className="px-4 py-3 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 mt-3 font-medium">Loading contingencies...</p>
                  </td>
                </tr>
              ) : filteredContingencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={22} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No contingencies recorded</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Start by creating a new contingency fund allocation.
                    </p>
                    {isAdmin && (
                      <Button
                        onClick={() => navigate("/add-contingency")}
                        className="btn-primary h-8 px-4 text-xs font-semibold rounded-xl mt-3 mx-auto"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Allocation
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredContingencies.map((item, index) => {
                  const spent = getTotalSpent(item);
                  const total = parseAmount(item.totalAmount) ?? 0;
                  const balance = total - spent;
                  const isExpanded = expandedId === item.id;
                  const percentUsed =
                    total > 0 ? Math.min(Math.round((spent / total) * 100), 100) : 0;

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`hover:bg-slate-50/70 transition-colors group ${
                          isExpanded ? "bg-teal-50/30" : ""
                        } [&>td]:border-r [&>td]:border-slate-100 [&>td:last-child]:border-r-0`}
                      >
                        <TableCell className="px-3.5 py-3 text-center text-slate-400 font-mono text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center gap-2.5 text-left w-full group/btn"
                          >
                            <span
                              className={`w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 transition-all ${
                                isExpanded
                                  ? "bg-teal-600 text-white shadow-sm"
                                  : "bg-slate-100 group-hover/btn:bg-teal-50 group-hover/btn:text-teal-700"
                              }`}
                            >
                              <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </span>
                            <span className="font-semibold text-slate-800 text-xs">
                              {item.description || "-"}
                            </span>
                          </button>
                        </TableCell>

                        <TableCell className="px-3 py-3 text-center">
                          <span className="text-xs font-mono font-semibold text-slate-500">
                            {item.yearOfSanction || "-"}
                          </span>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {formatINR(item.totalAmount)}
                          </span>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <span className="text-xs font-mono font-medium text-amber-700">
                            {formatINR(spent)}
                          </span>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-mono border ${
                                balance <= 0
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : balance < total * 0.25
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {formatINR(balance)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {percentUsed}% spent
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-center">
                          {isAdmin ? (
                            <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                                title="Edit contingency"
                              >
                                <Pencil size={13} />
                              </button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    type="button"
                                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete contingency"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete contingency entry?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently remove this contingency allocation and all its
                                      associated expenditures.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(item.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                    >
                                      Delete Record
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">View only</span>
                          )}
                        </TableCell>
                      </tr>

                      {/* Expandable Expenditure Ledger */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-5 bg-slate-50/60 border-y border-slate-200">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <Calendar size={14} className="text-teal-600" />
                                  Expenditure History Ledger ({item.expenditures?.length || 0})
                                </h4>
                                <span className="text-xs text-slate-500 font-medium font-mono">
                                  Remaining: {formatINR(balance)}
                                </span>
                              </div>

                              {item.expenditures && item.expenditures.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {item.expenditures.map((exp) => (
                                    <div
                                      key={exp.id}
                                      className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400 font-medium">
                                          {formatDisplayDate(exp.date)}
                                        </span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      </div>
                                      <p className="text-base font-extrabold text-slate-900 font-mono">
                                        {formatINR(exp.amount)}
                                      </p>
                                      <p className="text-[11px] text-slate-500 font-mono">
                                        Remaining: {formatINR(exp.balance)}
                                      </p>
                                      {exp.remarks && (
                                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                          &ldquo;{exp.remarks}&rdquo;
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 rounded-xl bg-white border border-dashed border-slate-200 text-center">
                                  <p className="text-xs text-slate-400">
                                    No expenditures recorded against this allocation yet.
                                  </p>
                                </div>
                              )}

                              {/* Admin Add Expenditure Form */}
                              {isAdmin && (
                                <div className="pt-2">
                                  {balance > 0 ? (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                                      <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                          ₹
                                        </span>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          value={expenditureAmount}
                                          onChange={(e) => setExpenditureAmount(e.target.value)}
                                          placeholder="Enter amount"
                                          className="pl-7 h-9 rounded-xl text-xs font-mono font-semibold"
                                        />
                                      </div>
                                      <Input
                                        value={expenditureRemarks}
                                        onChange={(e) => setExpenditureRemarks(e.target.value)}
                                        placeholder="Expenditure description / invoice notes..."
                                        className="flex-1 h-9 rounded-xl text-xs"
                                      />
                                      <Button
                                        onClick={() => addExpenditure(item)}
                                        className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold shrink-0"
                                      >
                                        Record Expenditure
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-2">
                                      <AlertCircle size={15} />
                                      <span>Allocation exhausted: No remaining balance for expenditures.</span>
                                    </div>
                                  )}
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
