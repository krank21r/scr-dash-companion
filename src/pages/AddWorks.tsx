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
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 shrink-0 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {formData.id ? 'Edit' : 'Create New'} Work
          </h2>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {formData.id ? 'Modify the details of this item' : 'Add new RSP or IRSP elements to the database'}
          </p>
        </div>
      </div>

      {!showForm ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-widest px-1">Select Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card 
              className="premium-card premium-card-hover p-5 border border-slate-200 cursor-pointer group"
              onClick={() => {
                setWorkType("rsp");
                setFormData({ ...formData, type: "rsp" });
                setShowForm(true);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-violet-100">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">RSP Work</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Rolling Stock Program</p>
                </div>
              </div>
            </Card>

            <Card 
              className="premium-card premium-card-hover p-5 border border-slate-200 cursor-pointer group"
              onClick={() => {
                setWorkType("irsp");
                setFormData({ ...formData, type: "irsp" });
                setShowForm(true);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-blue-100">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">IRSP Work</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Itemized Rolling Stock</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="premium-card p-0 border border-slate-200/60 overflow-hidden">
          <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              {workType.toUpperCase()} Details
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
            {workType === "rsp" ? (
              <RSPWorkForm formData={formData} setFormData={setFormData} />
            ) : (
              <IRSPWorkForm formData={formData} setFormData={setFormData} />
            )}

            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-semibold shadow-sm transition-all">
                <Plus size={18} className="mr-2" />
                {formData.id ? 'Save Changes' : 'Create Record'}
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
                className="rounded-xl h-11 px-6 font-semibold border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Clear & Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AddWorks;