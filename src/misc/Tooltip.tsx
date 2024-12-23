import { TooltipTrigger, Tooltip as AriaTooltip } from "react-aria-components";

export interface TooltipProps {
  children: React.ReactNode;
  label: string;
}

export const Tooltip = ({ children, label }: TooltipProps) => {
  return (
    <TooltipTrigger delay={1000} closeDelay={500}>
      {children}
      <AriaTooltip offset={5} className="rounded bg-base-200 px-2 py-1 text-base-content shadow-md">
        {label}
      </AriaTooltip>
    </TooltipTrigger>
  );
}
