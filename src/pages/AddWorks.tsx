import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

// Types for our work items
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

const AddWorks = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [workType, setWorkType] = useState<"rsp" | "irsp" | "">("");
  const [formData, setFormData] = useState<Omit<WorkItem, "id">>({
    type: "rsp",
    description: "",
    yearOfSanction: "",
    pbNo: "",
    rbSanctionedCost: "",
    qtySanctioned: "",
    qtyAllotted: "",
    deTotalValue: "",
    remarks: "",
    status: "",
  });

  const handleTypeSelect = (type: "rsp" | "irsp") => {
    setWorkType(type);
    setShowForm(true);
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get existing works from localStorage
    const existingWorks = JSON.parse(localStorage.getItem('works') || '[]');
    
    // Create new work item with auto-generated ID
    const newWork = {
      ...formData,
      id: existingWorks.length + 1,
    };
    
    // Save to localStorage
    localStorage.setItem('works', JSON.stringify([...existingWorks, newWork]));
    
    // Show success message
    toast({
      title: "Work Added Successfully",
      description: `New ${workType.toUpperCase()} work has been added.`,
    });
    
    // Reset form
    setShowForm(false);
    setWorkType("");
    setFormData({
      type: "rsp",
      description: "",
      yearOfSanction: "",
      pbNo: "",
      rbSanctionedCost: "",
      qtySanctioned: "",
      qtyAllotted: "",
      deTotalValue: "",
      remarks: "",
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter work description"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Year of Sanction</label>
                <Input
                  type="text"
                  value={formData.yearOfSanction}
                  onChange={(e) => setFormData({ ...formData, yearOfSanction: e.target.value })}
                  placeholder="YYYY"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">P.B No</label>
                <Input
                  value={formData.pbNo}
                  onChange={(e) => setFormData({ ...formData, pbNo: e.target.value })}
                  placeholder="Enter P.B No"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">RB Sanctioned Cost</label>
                <Input
                  type="text"
                  value={formData.rbSanctionedCost}
                  onChange={(e) => setFormData({ ...formData, rbSanctionedCost: e.target.value })}
                  placeholder="Enter cost"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity Sanctioned</label>
                <Input
                  value={formData.qtySanctioned}
                  onChange={(e) => setFormData({ ...formData, qtySanctioned: e.target.value })}
                  placeholder="Enter quantity"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity Allotted</label>
                <Input
                  value={formData.qtyAllotted}
                  onChange={(e) => setFormData({ ...formData, qtyAllotted: e.target.value })}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">DE Total Value</label>
                <Input
                  value={formData.deTotalValue}
                  onChange={(e) => setFormData({ ...formData, deTotalValue: e.target.value })}
                  placeholder="Enter value"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de_process">DE under process</SelectItem>
                  <SelectItem value="de_finance">DE Sent to Finance</SelectItem>
                  <SelectItem value="de_hqrs">DE sent to HQrs</SelectItem>
                  <SelectItem value="work_process">Work under process</SelectItem>
                  <SelectItem value="tender">Tender stage</SelectItem>
                  <SelectItem value="completed">Work Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Enter remarks"
              />
            </div>

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