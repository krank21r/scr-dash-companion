import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IRSPWorkFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const IRSPWorkForm = ({ formData, setFormData }: IRSPWorkFormProps) => {
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
          <label className="text-sm font-medium">LAW No</label>
          <Input
            value={formData.lawNo}
            onChange={(e) => setFormData({ ...formData, lawNo: e.target.value })}
            placeholder="Enter LAW No"
            required
          />
        </div>

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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rate</label>
          <Input
            type="text"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            placeholder="Enter rate"
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Total Value</label>
        <Input
          value={formData.totalValue}
          onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
          placeholder="Enter total value"
          required
        />
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
            <SelectItem value="indents_placed">Indents placed</SelectItem>
            <SelectItem value="work_process">Work under process</SelectItem>
            <SelectItem value="completed">Work Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default IRSPWorkForm;