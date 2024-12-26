import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
  nameOfWork?: string;
  fileNo?: string;
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

const IRSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
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
    console.log("Deleting work with ID:", id);
    try {
      await deleteDoc(doc(db, "works", id));
      const updatedWorks = works.filter((work) => work.id !== id);
      setWorks(updatedWorks);
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

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          IRSP Works
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Year of Sanction</TableHead>
              <TableHead>LAW No</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {works.map((work) => (
              <TableRow key={work.id}>
                <TableCell>{work.description}</TableCell>
                <TableCell>{work.yearOfSanction}</TableCell>
                <TableCell>{work.lawNo}</TableCell>
                <TableCell>{work.rate}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    work.status === "completed" ? "bg-green-100 text-green-800" :
                    work.status === "work_process" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {getStatusLabel(work.status)}
                  </span>
                </TableCell>
                <TableCell>{work.totalValue}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(work)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
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
                          <AlertDialogAction onClick={() => handleDelete(work.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
</Table>
      </div>
    </div>
  );
};

export default IRSPWorks;
