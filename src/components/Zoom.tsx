import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Zoom(props: { value: number | 'auto'; onChange: (value: string) => void }) {
  return (
    <div className="absolute top-2 right-2">
      <Select
        value={props.value.toString()}
        onValueChange={props.onChange}
      >
        <SelectTrigger className="h-8 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Auto</SelectItem>
          <SelectItem value="0.25">25%</SelectItem>
          <SelectItem value="0.5">50%</SelectItem>
          <SelectItem value="0.75">75%</SelectItem>
          <SelectItem value="1">100%</SelectItem>
          <SelectItem value="1.25">125%</SelectItem>
          <SelectItem value="1.5">150%</SelectItem>
          <SelectItem value="2">200%</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
