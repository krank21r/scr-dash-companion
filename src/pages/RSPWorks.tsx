import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

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

  useEffect(() => {
    const allWorks = JSON.parse(localStorage.getItem('works') || '[]');
    const rspWorks = allWorks.filter((work: WorkItem) => work.type === 'rsp');
    setWorks(rspWorks);
  }, []);

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          RSP Works
        </span>
        <h1 className="mt-4 text-4xl font-bold">Railway Signal Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Track and manage RSP works
        </p>
      </div>

      <div className="grid gap-6">
        {works.map((work) => (
          <Card key={work.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">#{work.id} - {work.description}</h3>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                  work.status === "completed" ? "bg-green-100 text-green-800" :
                  work.status === "work_process" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {getStatusLabel(work.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Year of Sanction</p>
                  <p className="font-medium">{work.yearOfSanction}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">P.B No</p>
                  <p className="font-medium">{work.pbNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">RB Sanctioned Cost</p>
                  <p className="font-medium">{work.rbSanctionedCost}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantity Sanctioned</p>
                  <p className="font-medium">{work.qtySanctioned}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantity Allotted</p>
                  <p className="font-medium">{work.qtyAllotted}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">DE Total Value</p>
                  <p className="font-medium">{work.deTotalValue}</p>
                </div>
              </div>

              {work.remarks && (
                <div>
                  <p className="text-muted-foreground">Remarks</p>
                  <p className="mt-1">{work.remarks}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RSPWorks;