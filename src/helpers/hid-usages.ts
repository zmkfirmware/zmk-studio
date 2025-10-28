// import { UsagePages } from "./data/HidUsageTables-1.5.json";
// Filtered with `cat src/HidUsageTables-1.5.json | jq '{ UsagePages: [.UsagePages[] | select([.Id] |inside([7, 12]))] }' > src/keyboard-and-consumer-usage-tables.json`
import { UsagePages } from '../data/keyboard-and-consumer-usage-tables.json'
import HidOverrides from '../data/hid-usage-name-overrides.json'

interface HidLabels {
    short?: string
    med?: string
    long?: string
}

const overrides: Record<string, Record<string, HidLabels>> = HidOverrides

export interface UsageId {
    Id: number
    Name: string
}

export interface UsagePageInfo {
    Name: string
    UsageIds: UsageId[]
}

export const hidUsageFromPageAndId = (page: number, id: number) => {
	return (page << 16) + id
}

export const hidUsagePageAndIdFromUsage = (
    usage: number,
): [number, number] => [(usage >> 16) & 0xffff, usage & 0xffff]

export const hid_usage_page_get_ids = (
    usage_page: number,
): UsagePageInfo | undefined => UsagePages.find((p) => p.Id === usage_page)

export const hid_usage_get_label = (
    usage_page: number,
    usage_id: number,
): string | undefined =>
    overrides[usage_page.toString()]?.[usage_id.toString()]?.short ||
    UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find(
        (u) => u.Id === usage_id,
    )?.Name

export const hid_usage_get_labels = (
    usage_page: number,
    usage_id: number,
): {
    short?: string
    med?: string
    long?: string
} =>
    overrides[usage_page.toString()]?.[usage_id.toString()] || {
        short: UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find(
            (u) => u.Id === usage_id,
        )?.Name,
    }
