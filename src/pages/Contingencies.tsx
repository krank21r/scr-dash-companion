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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Contingencies</h1>
              <p className="text-sm text-slate-500">{filteredContingencies.length} entries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => {
              localStorage.removeItem('editContingency');
              navigate('/add-contingency');
            }} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl h-10">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 w-[6%] text-center">Sl.</th>
                  <th className="px-4 py-3 w-[35%]">Description</th>
                  <th className="px-4 py-3 w-[10%]">Year</th>
                  <th className="px-4 py-3 w-[15%]">Total Amount</th>
                  <th className="px-4 py-3 w-[15%]">Spent</th>
                  <th className="px-4 py-3 w-[15%]">Balance</th>
                  <th className="px-4 py-3 w-[4%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContingencies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <AlertCircle size={40} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm">No contingencies found.</p>
                      <Button onClick={() => navigate('/add-contingency')} variant="link" className="text-amber-600 mt-2">
                        <Plus size={16} className="mr-1" /> Add Contingency
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
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors duration-150 text-sm">
                          <TableCell className="px-4 py-3 text-center text-slate-500 font-medium">{index + 1}</TableCell>
                          <TableCell className="px-4 py-3">
                            <button
                              onClick={() => toggleExpand(item.id)}
                              className="flex items-center gap-2 text-slate-800 hover:text-amber-600 font-medium transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              {item.description || '-'}
                            </button>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-slate-600">{item.yearOfSanction || '-'}</TableCell>
                          <TableCell className="px-4 py-3 text-slate-700 font-medium">₹{parseFloat(item.totalAmount).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="px-4 py-3 text-slate-600">₹{spent.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="px-4 py-3">
                            <span className={`font-semibold ${balance <= 0 ? 'text-red-600' : balance < parseFloat(item.totalAmount) * 0.25 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              ₹{balance.toLocaleString('en-IN')}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600" onClick={() => handleEdit(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </tr>
                        {isExpanded && (
                          <tr key={`${item.id}-expand`}>
                            <td colSpan={7} className="bg-amber-50/50 px-4 py-4">
                              <div className="space-y-3">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expenditure History</p>
                                {item.expenditures && item.expenditures.length > 0 ? (
                                  <div className="space-y-2 mb-4">
                                    {item.expenditures.map((exp, i) => (
                                      <div key={exp.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-sm">
                                        <div className="flex items-center gap-3">
                                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                          <div>
                                            <p className="font-medium text-slate-700">₹{parseFloat(exp.amount).toLocaleString('en-IN')}</p>
                                            {exp.remarks && <p className="text-xs text-slate-400">{exp.remarks}</p>}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs text-slate-400">{exp.date}</p>
                                          <p className="text-xs text-slate-500">Bal: ₹{parseFloat(exp.balance).toLocaleString('en-IN')}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-400 mb-4">No expenditures added yet</p>
                                )}
                                {balance > 0 ? (
                                  <div className="flex items-center gap-3 pt-3 border-t border-amber-200">
                                    <Input
                                      type="number"
                                      value={expenditureAmount}
                                      onChange={(e) => setExpenditureAmount(e.target.value)}
                                      placeholder="Amount"
                                      className="w-32 h-9 rounded-lg border-slate-200"
                                    />
                                    <Input
                                      value={expenditureRemarks}
                                      onChange={(e) => setExpenditureRemarks(e.target.value)}
                                      placeholder="Remarks"
                                      className="flex-1 h-9 rounded-lg border-slate-200"
                                    />
                                    <Button onClick={() => addExpenditure(item)} size="sm" className="bg-amber-500 hover:bg-amber-600 rounded-lg h-9">
                                      Add
                                    </Button>
                                  </div>
                                ) : (
                                  <p className="text-sm text-red-500 font-medium">Balance exhausted</p>
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
    </div>
  );
};

export default Contingencies;