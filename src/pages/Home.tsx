import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface WorkItem {
  id: number;
  type: "rsp" | "irsp";
  description: string;
  yearOfSanction: string;
  status: string;
}

const Home = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);

  useEffect(() => {
    const allWorks = JSON.parse(localStorage.getItem('works') || '[]');
    setWorks(allWorks);
  }, []);

  const rspWorks = works.filter(work => work.type === 'rsp');
  const irspWorks = works.filter(work => work.type === 'irsp');

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
              <Card key={status} className="p-4">
                <h4 className="font-medium text-sm text-muted-foreground">{statusLabels[status]}</h4>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </Card>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;