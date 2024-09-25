import { TooltipTrigger, Tooltip as AriaTooltip } from "react-aria-components";

export interface TooltipProps {
  children: React.ReactNode;
  label: string;
}

export const Tooltip = ({ children, label }: TooltipProps) => {
  return (
    <TooltipTrigger delay={1000} closeDelay={500}>
      {children}
      <AriaTooltip offset={5} className="bg-base-200 text-base-content px-2 py-1 rounded shadow-md">
        {label}
      </AriaTooltip>
    </TooltipTrigger>
  );
}
