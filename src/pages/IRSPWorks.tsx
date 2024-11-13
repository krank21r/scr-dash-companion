import { Card } from "@/components/ui/card";

const IRSPWorks = () => {
  const works = [
    { id: 1, title: "Railway Track Electrification", status: "Active", location: "Section A" },
    { id: 2, title: "Platform Extension", status: "Planning", location: "Station B" },
    { id: 3, title: "Signal System Upgrade", status: "Review", location: "Junction C" },
  ];

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          IRSP Works
        </span>
        <h1 className="mt-4 text-4xl font-bold">Infrastructure Signal Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Track and manage IRSP works
        </p>
      </div>

      <div className="grid gap-6">
        {works.map((work) => (
          <Card key={work.id} className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{work.title}</h3>
                <p className="text-sm text-muted-foreground">{work.location}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                work.status === "Active" ? "bg-green-100 text-green-800" :
                work.status === "Planning" ? "bg-purple-100 text-purple-800" :
                "bg-orange-100 text-orange-800"
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

export default IRSPWorks;