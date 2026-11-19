import { BaseDocument } from "@/types/common";

export interface ProjectDoc extends BaseDocument {
  name: string;
  description: string | null;
  slug: string;
  color: string;
  icon: string | null;
  isArchived: boolean;
}
