import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface WorkItem {
  id: number;
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

  const loadWorks = () => {
    const allWorks = JSON.parse(localStorage.getItem('works') || '[]');
    const rspWorks = allWorks.filter((work: WorkItem) => work.type === 'rsp');
    setWorks(rspWorks);
  };

  useEffect(() => {
    loadWorks();
  }, []);

  const handleDelete = (id: number) => {
    const allWorks = JSON.parse(localStorage.getItem('works') || '[]');
    const updatedWorks = allWorks.filter((work: WorkItem) => work.id !== id);
    localStorage.setItem('works', JSON.stringify(updatedWorks));
    
    loadWorks(); // Refresh the works list after deletion
    
    toast({
      title: "Work Deleted",
      description: "The work has been successfully deleted.",
    });
  };

  const handleEdit = (work: WorkItem) => {
    // Store the work to be edited in localStorage
    localStorage.setItem('editWork', JSON.stringify(work));
    // Navigate to AddWorks page
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
              <TableHead>Sl.No</TableHead>
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
                <TableCell>{work.id}</TableCell>
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