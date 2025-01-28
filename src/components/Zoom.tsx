export function Zoom(props: { value: number | 'auto'; onChange: (e) => void }) {
    return (
        <select
            className="absolute top-2 right-2 h-8 rounded px-2"
            value={props.value}
            onChange={props.onChange}
        >
            <option value="auto">Auto</option>
            <option value={0.25}>25%</option>
            <option value={0.5}>50%</option>
            <option value={0.75}>75%</option>
            <option value={1}>100%</option>
            <option value={1.25}>125%</option>
            <option value={1.5}>150%</option>
            <option value={2}>200%</option>
        </select>
    )
}
