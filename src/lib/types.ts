export interface WorkFormFields {
  id?: string;
  type: string;
  description: string;
  yearOfSanction: string;
  status: string;
  pbNo: string;
  rbSanctionedCost: string;
  qtySanctioned: string;
  qtyAllotted: string;
  deTotalValue: string;
  remarks: string;
  lawNo: string;
  rate: string;
  totalValue: string;
  createdAt?: unknown;
}

export const emptyWorkForm: WorkFormFields = {
  type: "",
  description: "",
  yearOfSanction: "",
  status: "",
  pbNo: "",
  rbSanctionedCost: "",
  qtySanctioned: "",
  qtyAllotted: "",
  deTotalValue: "",
  remarks: "",
  lawNo: "",
  rate: "",
  totalValue: "",
};
