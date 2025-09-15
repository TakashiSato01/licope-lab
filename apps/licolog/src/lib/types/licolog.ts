// apps/licolog/src/lib/types/licolog.ts
  export type LicologStatus = "pending" | "approved" | "hidden";
  export interface LicologMedia {
    path: string; width?: number; height?: number; bytes?: number;
  }
  export interface LicologPost {  id?: string;
  body: string;
  media?: LicologMedia[];
  authorUid: string;
  orgId: string;
  facilityId: string;
  status: LicologStatus;
  createdAt: any;
  updatedAt: any;
}
