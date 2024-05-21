
import { UsagePages } from './HidUsageTables-1.5.json';


export interface UsageId {
    Id: number;
    Name: string;
    Kinds?: string[];
};

export const hid_usage_page_and_id_from_usage = (usage: number): [number, number] => [((usage >> 16) & 0xFF), (usage & 0xFFFF)]

export const hid_usage_get_label = (usage_page: number, usage_id: number): string | undefined => 
    UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find((u) => u.Id === usage_id)?.Name;

