import { BehaviorParameterValueDescription } from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { hid_usage_page_and_id_from_usage } from "../helpers/hid-usages.ts";

export function validateValue(
  layerIds: number[],
  value?: number,
  values?: BehaviorParameterValueDescription[]
): boolean {
  if (value === undefined) {
    return values === undefined || values?.length === 0 || !!values[0].nil;
  }

  const matchingValue = values?.find((v) => {
    if (v.constant !== undefined) {
      return v.constant == value;
    } else if (v.range) {
      return value >= v.range.min && value <= v.range.max;
    } else if (v.hidUsage) {
      const [page, id] = hid_usage_page_and_id_from_usage(value);
      return page !== 0 && id !== 0;
    } else if (v.layerId) {
      return layerIds.includes(value);
    } else if (v.nil) {
      return value === 0;
    } else {
      console.error("Unknown check type!");
      return false;
    }
  });

  return !!matchingValue || (value === 0 && (!values || values.length === 0));
}
