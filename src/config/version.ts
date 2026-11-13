export const APP_VERSION = "2.0.0";
export const APP_NAME = "Budget Section Portal";
export const APP_SUBTITLE = "Carriage Workshop LGD";
export const APP_RELEASE_DATE = "November 2026";

export interface VersionRelease {
  version: string;
  title: string;
  date: string;
  badge?: string;
  highlights: string[];
}

export const RELEASES: VersionRelease[] = [
  {
    version: "2.0.0",
    title: "Access Control & UI Enhancement Update",
    date: "November 2026",
    badge: "Latest",
    highlights: [
      "Role-Based Access Control: Admin Full Access vs SSE Budget Read-Only",
      "Admin User Access & Permissions panel to grant or revoke full access",
      "Password management with custom password updates for ssebudget",
      "Excel-style compact grid layout with full column visibility for works",
      "Optimized responsiveness, session persistence, and security hardening",
    ],
  },
  {
    version: "1.0.0",
    title: "Initial Production Release",
    date: "October 2026",
    highlights: [
      "Budget allocations and expenditure tracking for Carriage Workshop LGD",
      "RSP & IRSP Works management and Excel sheet import",
      "Contingencies and Unit Cost tracking",
      "Holidays directory and Railway Web Links",
    ],
  },
];
