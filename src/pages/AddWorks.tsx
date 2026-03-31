import { useState, useEffect } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import RSPWorkForm from '../components/forms/RSPWorkForm';
import IRSPWorkForm from '../components/forms/IRSPWorkForm';
import { useNavigate } from "react-router-dom";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from '../main';
import { ArrowLeft, FileText, Plus } from "lucide-react";

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

  useEffect(() => {
    const storedWork = localStorage.getItem('editWork');
    if (storedWork) {
      try {
        const parsedWork = JSON.parse(storedWork);
        if (parsedWork) {
          setFormData(parsedWork);
          setWorkType(parsedWork.type);
          setShowForm(true);
        }
      } catch (error) {
        console.error("Error parsing stored work:", error);
        toast({
          title: "Error",
          description: "Failed to load work data for editing",
          variant: "destructive",
        });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.id) {
        const workRef = doc(db, "works", formData.id);
        const { id, ...updateData } = formData;
        await updateDoc(workRef, updateData);
        toast({
          title: "Success",
          description: "Work updated successfully",
        });
      } else {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {formData.id ? 'Edit' : 'Create New'} Work
            </h1>
            <p className="text-sm text-slate-500">
              {formData.id ? 'Edit existing' : 'Add new'} RSP or IRSP works to the system
            </p>
          </div>
        </div>

        {!showForm ? (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Select Work Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card 
                className="p-6 rounded-2xl border-slate-200 hover:border-violet-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => {
                  setWorkType("rsp");
                  setFormData({ ...formData, type: "rsp" });
                  setShowForm(true);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">RSP Work</p>
                    <p className="text-sm text-slate-500">Add a new RSP work item</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 rounded-2xl border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => {
                  setWorkType("irsp");
                  setFormData({ ...formData, type: "irsp" });
                  setShowForm(true);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">IRSP Work</p>
                    <p className="text-sm text-slate-500">Add a new IRSP work item</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="rounded-2xl border-slate-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {workType === "rsp" ? (
                <RSPWorkForm formData={formData} setFormData={setFormData} />
              ) : (
                <IRSPWorkForm formData={formData} setFormData={setFormData} />
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button type="submit" className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 rounded-xl">
                  <Plus size={16} className="mr-2" />
                  {formData.id ? 'Update' : 'Add'} Work
                </Button>
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
                    localStorage.removeItem('editWork');
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddWorks;