import type { BindingDisplay } from "./binding-label-parts";
import type { DisplayLabel } from "./key-symbols";

const primaryTextSize = (text: string) => {
  const length = [...text].length;
  if (length <= 2) return "text-lg";
  if (length <= 4) return "text-base";
  return "text-sm";
};

const Label = ({
  label,
  size,
}: {
  label: DisplayLabel;
  size: "primary" | "secondary";
}) => {
  if (label.icon) {
    const Icon = label.icon;
    return (
      <Icon
        size={size === "primary" ? 20 : 12}
        aria-label={label.title}
        className="shrink-0"
      />
    );
  }

  const text = label.text ?? "";
  const sizeClass =
    size === "primary" ? primaryTextSize(text) : "text-[0.65rem] opacity-80";

  return (
    <span
      title={label.title}
      aria-label={label.title}
      className={`${sizeClass} truncate max-w-full px-0.5 leading-none`}
    >
      {text}
    </span>
  );
};

export interface BindingLabelProps {
  display: BindingDisplay;
}

export const BindingLabel = ({ display }: BindingLabelProps) => {
  const { primary, secondary } = display;

  if (!primary) {
    return <span></span>;
  }

  return (
    <span
      className={`flex flex-col items-center justify-center max-w-full overflow-hidden gap-0.5 ${
        secondary ? "pt-2" : ""
      }`}
    >
      {secondary && <Label label={secondary} size="secondary" />}
      <Label label={primary} size="primary" />
    </span>
  );
};
