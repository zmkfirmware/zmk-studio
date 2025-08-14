// import { UsagePages } from "./HidUsageTables-1.5.json";
// Filtered with `cat src/HidUsageTables-1.5.json | jq '{ UsagePages: [.UsagePages[] | select([.Id] |inside([7, 12]))] }' > src/keyboard-and-consumer-usage-tables.json`
import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import HidOverrides from "./hid-usage-name-overrides.json";

interface HidLabels {
  short?: string;
  med?: string;
  long?: string;
  Name?: string; 
}

const overrides: Record<string, Record<string, HidLabels>> = HidOverrides;

export interface UsageId {
  Id: number;
  Name: string;
}

export interface UsagePageInfo {
  Name: string;
  UsageIds: UsageId[];
}

export const hid_usage_from_page_and_id = (page: number, id: number) =>
  (page << 16) + id;

export const hid_usage_page_and_id_from_usage = (
  usage: number
): [number, number] => [(usage >> 16) & 0xffff, usage & 0xffff];

export const hid_usage_page_get_ids = (
  usage_page: number
): UsagePageInfo | undefined => {

  // Fetch the relevant usage page from the core keyboard/consumer usage tables
  const usagePageInfo = UsagePages.find((p) => p.Id === usage_page);
  
  // Filter overrides to include only entries with a valid override key of Name
  const filteredOverrides = Object.fromEntries(
    Object.entries(overrides[usage_page])?.filter(
      ([_, overrideData]) => overrideData.Name
    )
  );

  // Mutate the usagePageInfo with the discovered "Name" overrides
  for (const key in filteredOverrides) {
    const usageId = usagePageInfo?.UsageIds.find((p) => p.Id === parseInt(key));
    if (usageId) {
      usageId.Name = filteredOverrides[key].Name as string;
    }
  }
  return usagePageInfo;
};

export const hid_usage_get_labels = (
  usage_page: number,
  usage_id: number
): { short?: string; med?: string; long?: string } =>
  overrides[usage_page.toString()]?.[usage_id.toString()] || {
    short: UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find(
      (u) => u.Id === usage_id
    )?.Name,
  };
