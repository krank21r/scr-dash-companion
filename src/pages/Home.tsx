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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
            <span className="text-sm font-medium text-violet-600 uppercase tracking-wider">Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Budget Section Portal</h1>
          <p className="text-slate-500 mt-2 text-lg">Track and manage all your works efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link to="/rsp-works" className="group">
            <Card className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-500 to-indigo-600 text-white cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 font-medium">Total RSP Works</p>
                  <p className="text-4xl font-bold mt-2">{rspWorks?.length || 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FileText size={28} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm text-violet-100">
                <span>View details</span>
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          <Link to="/irsp-works" className="group">
            <Card className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-cyan-600 text-white cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium">Total IRSP Works</p>
                  <p className="text-4xl font-bold mt-2">{irspWorks?.length || 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FileText size={28} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm text-blue-100">
                <span>View details</span>
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          <Card className="p-6 rounded-2xl border-0 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium">Completed Works</p>
                <p className="text-4xl font-bold mt-2 text-slate-900">
                  {works.filter(work => work.status === 'completed').length}
                </p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl">
                <CheckSquare size={28} className="text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-slate-400">
              <span>All projects</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path} className="group">
                <Card className="p-4 rounded-xl border-slate-200 hover:border-violet-200 hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${link.color} text-white`}>
                      <link.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{link.label}</p>
                      <p className="text-sm text-slate-500">{link.count} items</p>
                      {link.balance !== undefined && (
                        <p className="text-xs font-medium text-amber-600 mt-0.5">
                          Balance: ₹{link.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Overview */}
          <Card className="p-6 rounded-2xl border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-violet-500" />
              <h3 className="text-lg font-semibold text-slate-900">Status Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                count > 0 && (
                  <div 
                    key={status}
                    className="p-4 rounded-xl bg-slate-50 hover:bg-violet-50 cursor-pointer transition-all duration-200 group"
                    onClick={() => handleStatusClick(status)}
                  >
                    <p className="text-xs text-slate-500 group-hover:text-violet-600 transition-colors">{statusLabels[status]}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{count}</p>
                  </div>
                )
              ))}
            </div>
          </Card>

          {/* To-Do Tasks */}
          <Card className="p-6 rounded-2xl border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckSquare size={20} className="text-violet-500" />
                <h3 className="text-lg font-semibold text-slate-900">To-Do Tasks</h3>
              </div>
              <Link to="/add-note">
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                  <Plus size={16} className="mr-1" /> Add
                </Button>
              </Link>
            </div>
            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.slice(0, 5).map((note) => (
                  <div key={note.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 line-clamp-1">{note.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{note.createdAt}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/edit-note/${note.id}`)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400">No tasks yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Dialog for filtered works */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStatus && statusLabels[selectedStatus]} Works
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <DataTable columns={columns} data={filteredWorks} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;