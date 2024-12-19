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
            {works.filter(work => work.status === 'completed').length}
          </p>
          <p className="text-sm text-muted-foreground">All projects</p>
        </Card>
      </div>
    </div>
  );
};

export default Home;