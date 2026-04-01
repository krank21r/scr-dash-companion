import { useEffect, useState } from "react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Overview</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{filteredContingencies.length} contingencies recorded</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {years.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 bg-slate-50 border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
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
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg h-9 px-4 text-sm font-medium shadow-sm transition-all w-full sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Contingency
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="premium-card overflow-hidden flex flex-col">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4 w-[6%] font-medium text-center">Sl.</th>
                <th className="px-4 py-4 w-[35%] font-medium">Description</th>
                <th className="px-4 py-4 w-[10%] font-medium">Year</th>
                <th className="px-4 py-4 w-[15%] font-medium">Total Amount</th>
                <th className="px-4 py-4 w-[15%] font-medium">Spent</th>
                <th className="px-4 py-4 w-[15%] font-medium">Balance</th>
                <th className="px-4 py-4 w-[4%] text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContingencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                      <AlertCircle size={20} className="text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm">No contingencies found</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {selectedYear !== "all" ? `No entries for ${selectedYear}.` : "Start by adding a new contingency."}
                    </p>
                    <Button onClick={() => navigate('/add-contingency')} variant="outline" size="sm" className="mt-4 text-primary border-primary/20 hover:bg-primary/5">
                      <Plus size={14} className="mr-1.5" /> Add Contingency
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredContingencies.map((item, index) => {
                  const balance = getBalance(item);
                  const spent = getTotalSpent(item);
                  const isExpanded = expandedId === item.id;
                  return (
                    <>
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors duration-150 text-sm group ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                        <TableCell className="px-5 py-3.5 text-center text-slate-500 font-medium" data-label="Sl.">{index + 1}</TableCell>
                        <TableCell className="px-4 py-3.5" data-label="Description">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center gap-2 text-slate-800 hover:text-amber-600 font-medium transition-colors break-words text-left"
                          >
                            <span className={`p-1 rounded bg-slate-100 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 bg-amber-100 text-amber-600' : ''}`}>
                              <ChevronDown size={14} />
                            </span>
                            {item.description || '-'}
                          </button>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-slate-600">{item.yearOfSanction || '-'}</TableCell>
                        <TableCell className="px-4 py-3.5 text-slate-700 font-semibold tracking-tight">₹{parseFloat(item.totalAmount).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="px-4 py-3.5 text-slate-600">₹{spent.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${balance <= 0 ? 'bg-red-50 text-red-600' : balance < parseFloat(item.totalAmount) * 0.25 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            ₹{balance.toLocaleString('en-IN')}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border-0 shadow-2xl bg-white sm:max-w-[425px]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl text-slate-800">Delete Contingency</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-500">
                                    Are you sure you want to delete this contingency? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6">
                                  <AlertDialogCancel className="border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </tr>
                      {isExpanded && (
                        <tr key={`${item.id}-expand`} className="bg-slate-50/50">
                          <td colSpan={7} className="px-6 py-5 border-b border-slate-100">
                            <div className="max-w-3xl ml-10 pl-6 border-l-2 border-slate-200">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><IndianRupee size={12}/> Expenditure History</p>
                              {item.expenditures && item.expenditures.length > 0 ? (
                                <div className="space-y-2.5 mb-5">
                                  {item.expenditures.map((exp, i) => (
                                    <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm text-sm hover:border-slate-300 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                        <div>
                                          <p className="font-semibold text-slate-800 tracking-tight">₹{parseFloat(exp.amount).toLocaleString('en-IN')}</p>
                                          {exp.remarks && <p className="text-xs text-slate-500 mt-0.5">{exp.remarks}</p>}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[11px] font-medium text-slate-400 mb-0.5">{exp.date}</p>
                                        <p className="text-xs font-medium text-slate-600">Bal: ₹{parseFloat(exp.balance).toLocaleString('en-IN')}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-white border border-dashed border-slate-200">
                                  <AlertCircle size={14} className="text-slate-400" />
                                  <p className="text-sm text-slate-400 font-medium">No expenditures added yet</p>
                                </div>
                              )}

                              {balance > 0 ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                                  <div className="relative flex-1 sm:max-w-[140px]">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                    <Input
                                      type="number"
                                      inputMode="decimal"
                                      value={expenditureAmount}
                                      onChange={(e) => setExpenditureAmount(e.target.value)}
                                      placeholder="Amount"
                                      className="pl-7 h-9 rounded-lg border-slate-200 bg-slate-50 focus-visible:bg-white text-sm"
                                    />
                                  </div>
                                  <Input
                                    value={expenditureRemarks}
                                    onChange={(e) => setExpenditureRemarks(e.target.value)}
                                    placeholder="Add remarks..."
                                    className="flex-1 h-9 rounded-lg border-slate-200 bg-slate-50 focus-visible:bg-white text-sm"
                                  />
                                  <Button onClick={() => addExpenditure(item)} size="sm" className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg h-9 px-4 font-medium transition-all shadow-sm">
                                    Record
                                  </Button>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2 border border-red-100">
                                  <AlertCircle size={16} /> Fund completely exhausted
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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