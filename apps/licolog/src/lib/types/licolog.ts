// apps/licolog/src/lib/types/licolog.ts
export type RicologStatus = "internal" | "approved" | "hidden";
export interface RicologMedia {
  path: string; width: number; height: number; bytes: number;
}
export interface RicologPost {
  id?: string;
  body: string;
  media: LicologMedia[];
  authorUid: string;
  orgId: string;
  facilityId: string;
  status: LicologStatus;
  createdAt: any;
  updatedAt: any;
}
