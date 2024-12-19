import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

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

const IRSPWorks = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);

  useEffect(() => {
    const allWorks = JSON.parse(localStorage.getItem('works') || '[]');
    const irspWorks = allWorks.filter((work: WorkItem) => work.type === 'irsp');
    setWorks(irspWorks);
  }, []);

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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IRSPWorks;