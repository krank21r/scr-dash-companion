import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RSPWorkFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const RSPWorkForm = ({ formData, setFormData }: RSPWorkFormProps) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default RSPWorkForm;