import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import RSPWorkForm from "@/components/forms/RSPWorkForm";
import IRSPWorkForm from "@/components/forms/IRSPWorkForm";

interface BaseWorkItem {
  id: number;
  type: "rsp" | "irsp";
  description: string;
  yearOfSanction: string;
  status: string;
}

interface RSPWorkItem extends BaseWorkItem {
  pbNo: string;
  rbSanctionedCost: string;
  qtySanctioned: string;
  qtyAllotted: string;
  deTotalValue: string;
  remarks: string;
}

interface IRSPWorkItem extends BaseWorkItem {
  lawNo: string;
  rate: string;
  qtySanctioned: string;
  totalValue: string;
}

type WorkItem = RSPWorkItem | IRSPWorkItem;

const AddWorks = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [workType, setWorkType] = useState<"rsp" | "irsp" | "">("");
  const [formData, setFormData] = useState<any>({
    type: "rsp",
    description: "",
    yearOfSanction: "",
    status: "",
  });

  const handleTypeSelect = (type: "rsp" | "irsp") => {
    setWorkType(type);
    setShowForm(true);
    setFormData({
      type,
      description: "",
      yearOfSanction: "",
      status: "",
      ...(type === "rsp" ? {
        pbNo: "",
        rbSanctionedCost: "",
        qtySanctioned: "",
        qtyAllotted: "",
        deTotalValue: "",
        remarks: "",
      } : {
        lawNo: "",
        rate: "",
        qtySanctioned: "",
        totalValue: "",
      })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingWorks = JSON.parse(localStorage.getItem('works') || '[]');
    
    const newWork = {
      ...formData,
      id: existingWorks.length + 1,
    };
    
    localStorage.setItem('works', JSON.stringify([...existingWorks, newWork]));
    
    toast({
      title: "Work Added Successfully",
      description: `New ${workType.toUpperCase()} work has been added.`,
    });
    
    setShowForm(false);
    setWorkType("");
    setFormData({
      type: "rsp",
      description: "",
      yearOfSanction: "",
      status: "",
    });
  };

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Add Works
        </span>
        <h1 className="mt-4 text-4xl font-bold">Create New Work</h1>
        <p className="mt-2 text-muted-foreground">
          Add new RSP or IRSP works to the system
        </p>
      </div>

      {!showForm ? (
        <Card className="max-w-2xl p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Work Type</h2>
            <div className="flex gap-4">
              <Button onClick={() => handleTypeSelect("rsp")}>Add RSP</Button>
              <Button onClick={() => handleTypeSelect("irsp")}>Add IRSP</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="max-w-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {workType === "rsp" ? (
              <RSPWorkForm formData={formData} setFormData={setFormData} />
            ) : (
              <IRSPWorkForm formData={formData} setFormData={setFormData} />
            )}

            <div className="flex gap-4">
              <Button type="submit">Add Work</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AddWorks;