import { Card } from "@/components/ui/card";

const RSPWorks = () => {
  const works = [
    { id: 1, title: "Track Maintenance", status: "In Progress", deadline: "2024-03-15" },
    { id: 2, title: "Signal Installation", status: "Pending", deadline: "2024-03-20" },
    { id: 3, title: "Bridge Inspection", status: "Completed", deadline: "2024-03-10" },
  ];

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          RSP Works
        </span>
        <h1 className="mt-4 text-4xl font-bold">Railway Signal Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and monitor RSP works
        </p>
      </div>

      <div className="grid gap-6">
        {works.map((work) => (
          <Card key={work.id} className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{work.title}</h3>
                <p className="text-sm text-muted-foreground">Due: {work.deadline}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                work.status === "Completed" ? "bg-green-100 text-green-800" :
                work.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {work.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RSPWorks;