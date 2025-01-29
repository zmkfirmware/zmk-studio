import {
    hid_usage_get_labels,
    hid_usage_page_and_id_from_usage,
} from '../../helpers/hid-usages.ts'

export interface HidUsageLabelProps {
    hid_usage: number
    header: string
}

function remove_prefix(s?: string) {
    return s?.replace(/^Keyboard /, '')
}

export const HidUsageLabel = ({ hid_usage, header }: HidUsageLabelProps) => {
    let [page, id] = hid_usage_page_and_id_from_usage(hid_usage)

    // TODO: Do something with implicit mods!
    page &= 0xff

    let labels = hid_usage_get_labels(page, id)
    return (
        <>
            {/*<span className="p-0 b-0 m-0 text-xs w-full h-full text-nowrap justify-self-start row-start-1 row-end-2 col-start-1 col-end-4 group-hover:inline-block group-hover:truncate @md:underline">*/}
            {/*        {header}*/}
            {/*    </span>*/}
            <span
                className="@[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]"
                aria-label={remove_prefix(labels.short)}
                data-med-content={remove_prefix(labels.med || labels.short)}
                data-long-content={remove_prefix(
                    labels.long || labels.med || labels.short,
                )}
            />
        </>
    )
}
