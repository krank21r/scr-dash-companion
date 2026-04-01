import { Link } from "react-router-dom";
import { FileText, CheckSquare, TrendingUp, Plus, ChevronRight, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { DataTable } from "../components/ui/data-table";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db, notesCollection } from '../lib/firebase';
import { Button } from "../components/ui/button";


interface WorkItem {
  id: string;
  type: "rsp" | "irsp";
  description: string;
  yearOfSanction: string;
  status: string;
}

interface NoteItem {
  id: string;
  text: string;
  createdAt: string;
  actions?: React.ReactNode;
}

interface ContingencyItem {
  id: string;
  description: string;
  totalAmount: string;
  expenditures?: { amount: string; balance: string; remarks: string }[];
}


const HomePage = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [contingencies, setContingencies] = useState<ContingencyItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorks = async () => {
      const querySnapshot = await getDocs(collection(db, "works"));
      const workData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkItem[];
      setWorks(workData);
    };

    const fetchNotes = async () => {
      const notesSnapshot = await getDocs(notesCollection);
      const noteData = notesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'N/A',
        };
      }) as NoteItem[];

      const notesWithActions = noteData.map(note => ({
        ...note,
        actions: (
          <div className="space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigate(`/edit-note/${note.id}`)}>
              Edit
            </Button>
            <Button variant="destructive" size="icon" onClick={() => handleDeleteNote(note.id)}>
              Delete
            </Button>
          </div>
        ),
      }));

      setNotes(notesWithActions);
    };

    const fetchContingencies = async () => {
      const snapshot = await getDocs(collection(db, "contingencies"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ContingencyItem[];
      setContingencies(data);
    };

    fetchWorks();
    fetchNotes();
    fetchContingencies();
  }, []);

  const handleDeleteNote = async (id: string) => {
    const noteDocRef = doc(notesCollection, id);
    try {
      await deleteDoc(noteDocRef);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error: any) {
      console.error("Error deleting note:", error);
    }
  };

  const rspWorks = works.filter(work => work.type === 'rsp');
  const irspWorks = works.filter(work => work.type === 'irsp');

  const getStatusCounts = () => {
    const statusCounts = {
      'de_process': works.filter(work => work.status === 'de_process').length,
      'de_finance': works.filter(work => work.status === 'de_finance').length,
      'de_hqrs': works.filter(work => work.status === 'de_hqrs').length,
      'work_process': works.filter(work => work.status === 'work_process').length,
      'tender': works.filter(work => work.status === 'tender').length,
      'completed': works.filter(work => work.status === 'completed').length,
      'indents_placed': works.filter(work => work.status === 'indents_placed').length,
    };
    return statusCounts;
  };

  const statusLabels: Record<string, string> = {
    'de_process': 'DE Under Process',
    'de_finance': 'DE Sent to Finance',
    'de_hqrs': 'DE Sent to HQrs',
    'work_process': 'Work Under Process',
    'tender': 'Tender Stage',
    'completed': 'Completed',
    'indents_placed': 'Indents Placed'
  };

  const statusCounts = getStatusCounts();

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    setDialogOpen(true);
  };

  const columns = [
    { header: "Type", accessorKey: "type" },
    { header: "Description", accessorKey: "description" },
    { header: "Year of Sanction", accessorKey: "yearOfSanction" },
  ];

  const notesColumns = [
    { header: "Note", accessorKey: "text" },
    { header: "Actions", accessorKey: "actions" },
  ] as any;

  const filteredWorks = selectedStatus
    ? works.filter((work) => work.status === selectedStatus)
    : [];

  const totalContingencyBalance = contingencies.reduce((sum, c) => {
    const total = parseFloat(c.totalAmount) || 0;
    const spent = (c.expenditures || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    return sum + (total - spent);
  }, 0);

  const quickLinks = [
    { label: "RSP Works", count: rspWorks.length, path: "/rsp-works", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { label: "IRSP Works", count: irspWorks.length, path: "/irsp-works", icon: FileText, color: "from-blue-500 to-cyan-600" },
    { label: "Contingencies", count: contingencies.length, path: "/contingencies", icon: AlertCircle, color: "from-amber-500 to-orange-600", balance: totalContingencyBalance },
  ];

  return (
    <div className="space-y-8 pb-10">

      {/* Hero Section */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200/60">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/Image train.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-16 sm:px-12 sm:py-20 lg:py-24">
          <div className="max-w-2xl">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Budget Section
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Portal
              </span>
            </h1>

            <div className="flex flex-wrap gap-4">
              <Link to="/rsp-works" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300">
                <FileText size={18} />
                RSP Works
              </Link>
              <Link to="/irsp-works" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm hover:bg-white/20 hover:scale-105 transition-all duration-300">
                <FileText size={18} />
                IRSP Works
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/rsp-works" className="group">
          <Card className="premium-card premium-card-hover p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                <FileText size={22} />
              </div>
              <div className="flex items-center text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                <span>View</span>
                <ChevronRight size={14} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total RSP Works</p>
            <p className="text-3xl font-bold text-slate-900">{rspWorks?.length || 0}</p>
          </Card>
        </Link>

        <Link to="/irsp-works" className="group">
          <Card className="premium-card premium-card-hover p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <FileText size={22} />
              </div>
              <div className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <span>View</span>
                <ChevronRight size={14} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total IRSP Works</p>
            <p className="text-3xl font-bold text-slate-900">{irspWorks?.length || 0}</p>
          </Card>
        </Link>

        <Card className="premium-card p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckSquare size={22} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Completed Works</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-slate-900">
              {works.filter((work) => work.status === "completed").length}
            </p>
            <p className="text-sm font-medium text-slate-400">All projects</p>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path} className="group">
              <Card className="premium-card hover:border-primary/40 hover:shadow-md p-4 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${link.color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                    <link.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{link.label}</p>
                    <p className="text-xs text-slate-500 truncate">{link.count} items</p>
                    {link.balance !== undefined && (
                      <p className="text-xs font-medium text-amber-600 mt-1">
                        Bal: ₹{link.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Overview */}
        <Card className="premium-card p-6">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-slate-900">Status Overview</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              count > 0 && (
                <div 
                  key={status}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary/20 hover:shadow-sm cursor-pointer transition-all duration-200 group"
                  onClick={() => handleStatusClick(status)}
                >
                  <p className="text-xs font-medium text-slate-500 group-hover:text-primary transition-colors mb-1">{statusLabels[status]}</p>
                  <p className="text-xl font-bold text-slate-800">{count}</p>
                </div>
              )
            ))}
          </div>
        </Card>

        {/* To-Do Tasks */}
        <Card className="premium-card p-0 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-slate-900">To-Do List</h3>
            </div>
            <Link to="/add-note">
              <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {notes.length > 0 ? (
              <div className="space-y-1">
                {notes.slice(0, 5).map((note) => (
                  <div key={note.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium text-slate-700 truncate">{note.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{note.createdAt}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-primary" onClick={() => navigate(`/edit-note/${note.id}`)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-red-600" onClick={() => handleDeleteNote(note.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10">
                <CheckSquare size={36} className="text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-500">No tasks pending</p>
                <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Dialog for filtered works */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              {selectedStatus && statusLabels[selectedStatus]} Works
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 bg-white/50 rounded-lg border border-slate-100 overflow-hidden">
            <DataTable columns={columns} data={filteredWorks} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;