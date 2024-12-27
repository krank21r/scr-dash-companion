import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Button } from '../components/ui/button';
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
} from '../components/ui/alert-dialog';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from "react-router-dom";
import { db } from '../main';
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { useState, useEffect } from "react";

interface WorkItem {
  id: string;
  type: "rsp" | "irsp";
  description: string;
  yearOfSanction: string;
  pbNo: string;
  rbSanctionedCost: string;
  qtySanctioned: string;
  qtyAllotted: string;
  deTotalValue: string;
  remarks: string;
  status: string;
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    de_process: "DE under process",
    de_finance: "DE Sent to Finance",
    de_hqrs: "DE sent to HQrs",
    work_process: "Work under process",
    tender: "Tender stage",
    completed: "Work Completed",
  };
  return statusMap[status] || status;
};

const RSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadWorks = async () => {
    try {
      const worksQuery = query(collection(db, "works"), where("type", "==", "rsp"));
      const querySnapshot = await getDocs(worksQuery);
      const fetchedWorks: WorkItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedWorks.push({ id: doc.id, ...doc.data() } as WorkItem);
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

  const handleDelete = async (workId: string) => {
    if (!workId) {
      console.error("No work ID provided for deletion");
      return;
    }

    try {
      const workRef = doc(db, "works", workId);
      await deleteDoc(workRef);
      toast({
        title: "Success",
        description: "Work deleted successfully",
      });
      await loadWorks();
    } catch (error: any) {
      console.error("Error deleting work:", error);
      toast({
        title: "Error",
        description: "Failed to delete work: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (work: WorkItem) => {
    if (!work || !work.id) {
      console.error("Invalid work data for editing");
      return;
    }

    localStorage.setItem('editWork', JSON.stringify({
      ...work,
      id: work.id
    }));
    navigate('/add-works');
  };

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          RSP Works
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Year of Sanction</TableHead>
              <TableHead>P.B No</TableHead>
              <TableHead>RB Sanctioned Cost</TableHead>
              <TableHead>Qty Sanctioned</TableHead>
              <TableHead>Qty Allotted</TableHead>
              <TableHead>DE Total Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {works.map((work) => (
              <TableRow key={work.id}>
                <TableCell>{work.description}</TableCell>
                <TableCell>{work.yearOfSanction}</TableCell>
                <TableCell>{work.pbNo}</TableCell>
                <TableCell>{work.rbSanctionedCost}</TableCell>
                <TableCell>{work.qtySanctioned}</TableCell>
                <TableCell>{work.qtyAllotted}</TableCell>
                <TableCell>{work.deTotalValue}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    work.status === "completed" ? "bg-green-100 text-green-800" :
                    work.status === "work_process" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {getStatusLabel(work.status)}
                  </span>
                </TableCell>
                <TableCell>{work.remarks}</TableCell>
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

export default RSPWorks;