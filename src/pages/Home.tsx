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

const Home = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);

  useEffect(() => {
    const allWorks = JSON.parse(localStorage.getItem('works') || '[]');
    setWorks(allWorks);
  }, []);

  const rspWorks = works.filter(work => work.type === 'rsp');
  const irspWorks = works.filter(work => work.type === 'irsp');

  const getStatusCount = (works: WorkItem[], status: string) => {
    return works.filter(work => work.status === status).length;
  };

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Dashboard
        </span>
        <h1 className="mt-4 text-4xl font-bold">Welcome to SCR Organisation</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor and manage your works efficiently
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover p-6">
          <h3 className="text-lg font-semibold">Total RSP Works</h3>
          <p className="mt-2 text-3xl font-bold">{rspWorks.length}</p>
          <p className="text-sm text-muted-foreground">Active projects</p>
        </Card>

        <Card className="card-hover p-6">
          <h3 className="text-lg font-semibold">Total IRSP Works</h3>
          <p className="mt-2 text-3xl font-bold">{irspWorks.length}</p>
          <p className="text-sm text-muted-foreground">Active projects</p>
        </Card>

        <Card className="card-hover p-6">
          <h3 className="text-lg font-semibold">Completed Works</h3>
          <p className="mt-2 text-3xl font-bold">
            {getStatusCount(works, 'completed')}
          </p>
          <p className="text-sm text-muted-foreground">All projects</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">RSP Works Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>DE under process</span>
              <span>{getStatusCount(rspWorks, 'de_process')}</span>
            </div>
            <div className="flex justify-between">
              <span>DE Sent to Finance</span>
              <span>{getStatusCount(rspWorks, 'de_finance')}</span>
            </div>
            <div className="flex justify-between">
              <span>DE sent to HQrs</span>
              <span>{getStatusCount(rspWorks, 'de_hqrs')}</span>
            </div>
            <div className="flex justify-between">
              <span>Work under process</span>
              <span>{getStatusCount(rspWorks, 'work_process')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tender stage</span>
              <span>{getStatusCount(rspWorks, 'tender')}</span>
            </div>
            <div className="flex justify-between">
              <span>Work Completed</span>
              <span>{getStatusCount(rspWorks, 'completed')}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">IRSP Works Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>DE under process</span>
              <span>{getStatusCount(irspWorks, 'de_process')}</span>
            </div>
            <div className="flex justify-between">
              <span>DE Sent to Finance</span>
              <span>{getStatusCount(irspWorks, 'de_finance')}</span>
            </div>
            <div className="flex justify-between">
              <span>DE sent to HQrs</span>
              <span>{getStatusCount(irspWorks, 'de_hqrs')}</span>
            </div>
            <div className="flex justify-between">
              <span>Work under process</span>
              <span>{getStatusCount(irspWorks, 'work_process')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tender stage</span>
              <span>{getStatusCount(irspWorks, 'tender')}</span>
            </div>
            <div className="flex justify-between">
              <span>Work Completed</span>
              <span>{getStatusCount(irspWorks, 'completed')}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;