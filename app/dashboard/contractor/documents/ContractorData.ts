export interface ContractorDoc {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  icon: string;
  color: string;
  status: string;
  expiry?: string;
}

export const contractorDocs: ContractorDoc[] = [
  { id: "cd1", name: "Public Liability Insurance.pdf", type: "Insurance", date: "01 Jan 2026", size: "1.1 MB", icon: "ri-shield-line", color: "bg-[#EF4444]", status: "Valid", expiry: "01 Jan 2027" },
  { id: "cd2", name: "Employers Liability Insurance.pdf", type: "Insurance", date: "01 Jan 2026", size: "0.9 MB", icon: "ri-shield-line", color: "bg-[#EF4444]", status: "Valid", expiry: "01 Jan 2027" },
  { id: "cd3", name: "Gas Safe Registration Certificate.pdf", type: "Certification", date: "01 Jan 2026", size: "0.4 MB", icon: "ri-file-shield-line", color: "bg-[#10B981]", status: "Valid", expiry: "01 Jan 2027" },
  { id: "cd4", name: "Completion Photo - Boiler Repair.jpg", type: "Completion Photo", date: "22 May 2026", size: "1.8 MB", icon: "ri-image-line", color: "bg-[#EC4899]", status: "Valid" },
  { id: "cd5", name: "Invoice - Rose Court Boiler Repair.pdf", type: "Invoice", date: "22 May 2026", size: "0.5 MB", icon: "ri-file-chart-line", color: "bg-[#8B5CF6]", status: "Valid" },
  { id: "cd6", name: "NVQ Level 3 Plumbing Certificate.pdf", type: "Certification", date: "15 Jun 2020", size: "1.2 MB", icon: "ri-file-shield-line", color: "bg-[#10B981]", status: "Valid" },
];