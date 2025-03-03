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
  id: string; // Firestore document id
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


const Home = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("useEffect in Home.tsx is running"); // ADDED LOG
    const fetchWorks = async () => {
      console.log("fetchWorks function is called"); // ADDED LOG
      const querySnapshot = await getDocs(collection(db, "works"));
      console.log("querySnapshot for works:", querySnapshot); // ADDED LOG
      const workData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkItem[];
      setWorks(workData);
      console.log("Fetched works data:", workData);
    };

    const fetchNotes = async () => {
      console.log("fetchNotes function is called"); // ADDED LOG
      const notesSnapshot = await getDocs(notesCollection);
      console.log("notesSnapshot:", notesSnapshot);
      console.log("notesSnapshot.docs:", notesSnapshot.docs);
      if (notesSnapshot.docs.length === 0) {
        console.log("No notes found in Firestore.");
      }
      const noteData = notesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Raw note data from Firestore:", data);
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

      const handleDeleteNote = async (id: string) => {
        console.log("Attempting to delete note with ID:", id); // Log note ID
        const noteDocRef = doc(notesCollection, id);
        console.log("Document reference:", noteDocRef); // Log doc ref
        try {
          await deleteDoc(noteDocRef);
          setNotes(notes.filter(note => note.id !== id));
          console.log(`Note with ID ${id} deleted successfully`);
        } catch (error: any) {
          console.error("Error deleting note:", error);
          alert(`Failed to delete note. Please try again. Error: ${error.message}`); // More detailed error
        }
      };

      setNotes(notesWithActions);
      console.log("Fetched notes data:", notesWithActions);
    };


    fetchWorks();
    fetchNotes();
  }, []);

  const rspWorks = works.filter(work => work.type === 'rsp');
  const irspWorks = works.filter(work => work.type === 'irsp');
  console.log("RSP Works:", rspWorks);
  console.log("IRSP Works:", irspWorks);

  // Get counts for each status
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
    console.log("Status Counts:", statusCounts);
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
    {
      header: "Actions",
      accessorKey: "actions",
    },
  ] as any; // Explicitly cast to any to bypass type checking


  const filteredWorks = selectedStatus
    ? works.filter((work) => work.status === selectedStatus)
    : [];

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8 px-4 md:px-0">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Dashboard
        </span>
        <h1 className="mt-4 text-2xl md:text-4xl font-bold">Budget Section Portal</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of RSP and IRSP works
        </p>
      </div>

      <div className="responsive-grid px-4 md:px-0">
        <Card className="card-hover p-6">
          <h3 className="text-lg font-semibold">Total RSP Works</h3>
          <p className="mt-2 text-3xl font-bold">{rspWorks?.length}</p>
          <p className="text-sm text-muted-foreground">Active projects</p>
        </Card>

        <Card className="card-hover p-6">
          <h3 className="text-lg font-semibold">Total IRSP Works</h3>
          <p className="mt-2 text-3xl font-bold">{irspWorks?.length}</p>
          <p className="text-sm text-muted-foreground">Active projects</p>
        </Card>

        <Card className="card-hover p-6">
          <h3 className="text-lg font-semibold">Completed Works</h3>
          <p className="mt-2 text-3xl font-bold">
            {works.filter(work => work.status === 'completed').length}
          </p>
          <p className="text-sm text-muted-foreground">All projects</p>
        </Card>
      </div>

      <div className="mt-8 px-4 md:px-0">
        <h2 className="text-xl font-semibold mb-4">Status Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            count > 0 && (
              <Card
                key={status}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleStatusClick(status as string)}
              >
                <h4 className="font-medium text-sm text-muted-foreground">{statusLabels[status]}</h4>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </Card>
            )
          ))}
        </div>
      </div>

      <div className="mt-8 px-4 md:px-0">
        <h2 className="text-xl font-semibold mb-4">To-Do</h2>
        <DataTable columns={notesColumns} data={notes} />
      </div>


      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStatus && statusLabels[selectedStatus as string]} Works
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

export default Home;
