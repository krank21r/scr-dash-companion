import { useEffect, useState } from "react";
import { TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Pencil, Trash2, Plus, Filter, FileText } from "lucide-react";
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
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface WorkItem {
  id: string;
  type: "rsp" | "irsp";
  description: string;
  lawNo: string;
  yearOfSanction: string;
  rate: string;
  qtySanctioned: string;
  totalValue: string;
  status: string;
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    de_process: "DE under process",
    de_finance: "DE Sent to Finance",
    de_hqrs: "DE sent to HQrs",
    indents_placed: "Indents placed",
    work_process: "Work under process",
    completed: "Work Completed",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    work_process: "bg-blue-50 text-blue-700 border-blue-200",
    tender: "bg-violet-50 text-violet-700 border-violet-200",
    indents_placed: "bg-cyan-50 text-cyan-700 border-cyan-200",
    de_process: "bg-amber-50 text-amber-700 border-amber-200",
    de_finance: "bg-orange-50 text-orange-700 border-orange-200",
    de_hqrs: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return colorMap[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

const IRSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadWorks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "works"));
      const fetchedWorks: WorkItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'irsp') {
          fetchedWorks.push({ id: doc.id, ...data } as WorkItem);
        }
      });
      setWorks(fetchedWorks);
      
      const uniqueYears = [...new Set(fetchedWorks.map(w => w.yearOfSanction).filter(Boolean))].sort().reverse();
      setYears(uniqueYears);
    } catch (error: any) {
      console.error("Error fetching works:", error);
      toast({
        title: "Error fetching works",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadWorks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid work ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "works", id));
      await loadWorks();
      toast({
        title: "Work Deleted",
        description: "The work has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting work:", error);
      toast({
        title: "Error deleting work",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (work: WorkItem) => {
    localStorage.setItem('editWork', JSON.stringify(work));
    navigate('/add-works');
  };

  const filteredWorks = selectedYear === "all"
    ? works
    : works.filter(w => w.yearOfSanction === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">IRSP Works</h1>
              <p className="text-sm text-slate-500">{filteredWorks.length} works found</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl">
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
              localStorage.removeItem('editWork');
              navigate('/add-works');
            }} className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl h-10">
              <Plus className="mr-2 h-4 w-4" /> Add Work
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full table-fixed md:table-fixed mobile-card-table">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 w-[35%]">Description</th>
                  <th className="px-4 py-3 w-[10%]">Year</th>
                  <th className="px-4 py-3 w-[10%]">LAW No</th>
                  <th className="px-4 py-3 w-[10%]">Rate</th>
                  <th className="px-4 py-3 w-[8%]">Qty</th>
                  <th className="px-4 py-3 w-[12%]">Status</th>
                  <th className="px-4 py-3 w-[10%]">Total</th>
                  <th className="px-4 py-3 w-[5%]">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <FileText size={40} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm">
                        No IRSP works found for {selectedYear !== "all" ? `year ${selectedYear}` : "any year"}.
                      </p>
                      <Button onClick={() => navigate('/add-works')} variant="link" className="text-blue-600 mt-2">
                        <Plus size={16} className="mr-1" /> Add Work
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredWorks.map((work) => (
                    <tr key={work.id} className="hover:bg-slate-50/80 transition-colors duration-150 text-sm">
                      <TableCell className="px-4 py-3 font-medium text-slate-900 break-words" data-label="Description">{work.description || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600" data-label="Year">{work.yearOfSanction || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600" data-label="LAW No">{work.lawNo || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600" data-label="Rate">{work.rate || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600" data-label="Qty">{work.qtySanctioned || '-'}</TableCell>
                      <TableCell className="px-4 py-3" data-label="Status">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusColor(work.status)}`}>
                          {getStatusLabel(work.status)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-600" data-label="Total">{work.totalValue || '-'}</TableCell>
                      <TableCell className="px-4 py-3" data-label="Actions">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleEdit(work)}>
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
                                <AlertDialogTitle>Delete Work</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this work? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(work.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IRSPWorks;