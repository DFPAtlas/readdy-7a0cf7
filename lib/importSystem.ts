import type { ImportRecord, ImportFailedRow, FieldMapping, PreviewProperty, PMSIntegration, ValidationRule } from "@/app/dashboard/import/ImportData";

export interface ImportType {
  id: string;
  label: string;
  description: string;
  icon: string;
  supportedFormats: string[];
  requiresTemplate: boolean;
  available: boolean;
}

export const importTypes: ImportType[] = [
  {
    id: "properties",
    label: "Properties",
    description: "Import property addresses, types, bedrooms, and key details from a spreadsheet",
    icon: "ri-building-4-line",
    supportedFormats: [".csv", ".xlsx"],
    requiresTemplate: true,
    available: true,
  },
  {
    id: "landlords",
    label: "Landlords",
    description: "Import landlord names, contact details and portfolio assignments",
    icon: "ri-user-settings-line",
    supportedFormats: [".csv", ".xlsx"],
    requiresTemplate: true,
    available: true,
  },
  {
    id: "tenants",
    label: "Tenants",
    description: "Import tenant names, contact information and referencing status",
    icon: "ri-group-line",
    supportedFormats: [".csv", ".xlsx"],
    requiresTemplate: true,
    available: true,
  },
  {
    id: "tenancies",
    label: "Tenancies",
    description: "Import tenancy records linking tenants to properties with dates and rent",
    icon: "ri-file-text-line",
    supportedFormats: [".csv", ".xlsx"],
    requiresTemplate: true,
    available: false,
  },
  {
    id: "rent",
    label: "Rent Records",
    description: "Import historical rent payments and expected rent schedules",
    icon: "ri-bank-card-line",
    supportedFormats: [".csv"],
    requiresTemplate: true,
    available: false,
  },
  {
    id: "compliance",
    label: "Compliance Records",
    description: "Import gas safety certificates, EPC ratings, EICR and other compliance documents",
    icon: "ri-shield-check-line",
    supportedFormats: [".csv", ".xlsx"],
    requiresTemplate: true,
    available: false,
  },
  {
    id: "maintenance",
    label: "Maintenance Records",
    description: "Import historical maintenance jobs, quotes and contractor assignments",
    icon: "ri-tools-line",
    supportedFormats: [".csv", ".xlsx"],
    requiresTemplate: true,
    available: false,
  },
  {
    id: "contractors",
    label: "Contractors",
    description: "Import contractor profiles, trade specialisations and contact details",
    icon: "ri-hard-drive-line",
    supportedFormats: [".csv", ".xlsx"],
    requiresTemplate: true,
    available: false,
  },
  {
    id: "documents",
    label: "Documents",
    description: "Import document metadata linking files to properties, tenancies or contacts",
    icon: "ri-file-line",
    supportedFormats: [".csv"],
    requiresTemplate: true,
    available: false,
  },
  {
    id: "portfolio",
    label: "Complete Portfolio Migration",
    description: "Import a full portfolio including properties, landlords, tenants, tenancies, rent, compliance and maintenance in one batch",
    icon: "ri-folders-line",
    supportedFormats: [".csv", ".xlsx"],
    requiresTemplate: true,
    available: false,
  },
];

export type ImportStep = "type" | "upload" | "map" | "validate" | "review" | "import" | "results";

export const importSteps: { id: ImportStep; label: string; number: number }[] = [
  { id: "upload", label: "Upload", number: 1 },
  { id: "map", label: "Match Fields", number: 2 },
  { id: "validate", label: "Validate", number: 3 },
  { id: "review", label: "Review", number: 4 },
  { id: "import", label: "Import", number: 5 },
];

export type ImportFileState = {
  name: string;
  size: number;
  type: string;
  rows: number;
  columns: number;
  headers: string[];
  sampleRows: string[][];
  sheetName?: string;
};

export type ValidationFilter = "all" | "ready" | "warnings" | "errors" | "duplicates";

export const REPORTED_DISCLAIMER =
  "Import results are based on file content at the time of upload. LetHub processes data but does not guarantee legal compliance. Review imported records and confirm accuracy before relying on them.";

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_ROWS = 5000;