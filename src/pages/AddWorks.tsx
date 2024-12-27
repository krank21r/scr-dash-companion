import { useState, useEffect } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import RSPWorkForm from '../components/forms/RSPWorkForm';
import IRSPWorkForm from '../components/forms/IRSPWorkForm';
import { useNavigate } from "react-router-dom";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from '../main';

const AddWorks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [workType, setWorkType] = useState<"rsp" | "irsp" | "">("");
  const [formData, setFormData] = useState<any>({
    id: "",
    type: "",
    description: "",
    yearOfSanction: "",
    status: "",
  });

  useEffect(() => {
    const storedWork = localStorage.getItem('editWork');
    if (storedWork) {
      try {
        const parsedWork = JSON.parse(storedWork);
        if (parsedWork && parsedWork.id) {
          setFormData(parsedWork);
          setWorkType(parsedWork.type);
          setShowForm(true);
        }
      } catch (error) {
        console.error("Error parsing stored work:", error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.id) {
        // Edit mode - update existing work
        const workRef = doc(db, "works", formData.id);
        const { id, ...updateData } = formData;
        await updateDoc(workRef, updateData);
        toast({
          title: "Success",
          description: "Work updated successfully",
        });
      } else {
        // Add mode - create new work
        const { id, ...newWorkData } = formData;
        await addDoc(collection(db, "works"), {
          ...newWorkData,
          type: workType,
        });
        toast({
          title: "Success",
          description: "Work added successfully",
        });
      }

      // Clear localStorage and navigate back
      localStorage.removeItem('editWork');
      navigate(workType === 'rsp' ? '/rsp-works' : '/irsp-works');
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${formData.id ? 'update' : 'add'} work: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error:", error);
    }
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
                    id: "",
                    type: "",
                    description: "",
                    yearOfSanction: "",
                    status: "",
                  });
                  localStorage.removeItem('editWork');
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