import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RSPWorkForm from "@/components/forms/RSPWorkForm";
import IRSPWorkForm from "@/components/forms/IRSPWorkForm";
import { useNavigate } from "react-router-dom";

const AddWorks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [workType, setWorkType] = useState<"rsp" | "irsp" | "">("");
  const [formData, setFormData] = useState<any>({
    type: "",
    description: "",
    yearOfSanction: "",
    status: "",
  });

  // Check for edit mode on component mount
  useEffect(() => {
    const editWork = localStorage.getItem('editWork');
    if (editWork) {
      const workData = JSON.parse(editWork);
      setWorkType(workData.type);
      setFormData(workData);
      setShowForm(true);
      // Clear the editWork from localStorage
      localStorage.removeItem('editWork');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allWorks = JSON.parse(localStorage.getItem('works') || '[]');
    
    if (formData.id) {
      // Edit mode - update existing work
      const updatedWorks = allWorks.map((work: any) => 
        work.id === formData.id ? formData : work
      );
      localStorage.setItem('works', JSON.stringify(updatedWorks));
      
      toast({
        title: "Work Updated",
        description: `${workType.toUpperCase()} work has been updated successfully.`,
      });
    } else {
      // Add mode - create new work
      const newWork = {
        ...formData,
        id: allWorks.length + 1,
        type: workType,
      };
      
      localStorage.setItem('works', JSON.stringify([...allWorks, newWork]));
      
      toast({
        title: "Work Added",
        description: `New ${workType.toUpperCase()} work has been added.`,
      });
    }
    
    // Navigate back to the appropriate works page
    navigate(workType === 'rsp' ? '/rsp-works' : '/irsp-works');
  };

  return (
    <div className="page-transition container pt-24">
      <div className="mb-8">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {formData.id ? 'Edit' : 'Add'} Works
        </span>
        <h1 className="mt-4 text-4xl font-bold">
          {formData.id ? 'Edit' : 'Create New'} Work
        </h1>
        <p className="mt-2 text-muted-foreground">
          {formData.id ? 'Edit existing' : 'Add new'} RSP or IRSP works to the system
        </p>
      </div>

      {!showForm ? (
        <Card className="max-w-2xl p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Work Type</h2>
            <div className="flex gap-4">
              <Button onClick={() => {
                setWorkType("rsp");
                setFormData({ ...formData, type: "rsp" });
                setShowForm(true);
              }}>Add RSP</Button>
              <Button onClick={() => {
                setWorkType("irsp");
                setFormData({ ...formData, type: "irsp" });
                setShowForm(true);
              }}>Add IRSP</Button>
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
              <Button type="submit">{formData.id ? 'Update' : 'Add'} Work</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setWorkType("");
                  setFormData({
                    type: "",
                    description: "",
                    yearOfSanction: "",
                    status: "",
                  });
                }}
              >
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