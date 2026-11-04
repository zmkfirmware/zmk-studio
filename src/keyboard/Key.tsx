import { PropsWithChildren } from "react";
import type { LucideIcon } from "lucide-react";
import { shortenHeader } from "./shorten-header";

interface KeyProps {
  selected?: boolean;
  width: number;
  height: number;
  oneU: number;
  header?: string;
  /** Icon drawn in place of the header text. */
  headerIcon?: LucideIcon;
  /** Full name for the header, used as its tooltip. */
  headerTitle?: string;
  onClick?: () => void;
}

export const Key = ({
  selected = false,
  width,
  height,
  oneU,
  header,
  headerIcon: HeaderIcon,
  headerTitle,
  onClick,
  children,
}: PropsWithChildren<KeyProps>) => {
  const pixelWidth = width * oneU - 2;
  const pixelHeight = height * oneU - 2;

  return (
    <button
      className={`group rounded relative flex justify-center items-center cursor-pointer transition-all hover:shadow-xl hover:ring-1 hover:ring-gray-300 hover:scale-125 ${selected ? "bg-primary text-primary-content" : "bg-base-100 text-base-content"
        }`}
      style={{
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
      }}
      onClick={onClick}
    >
      <div
        title={headerTitle}
        className={`absolute top-0.5 left-1 text-[0.45rem] leading-none font-semibold tracking-tight text-nowrap ${selected ? "text-primary-content" : "text-base-content"} opacity-30`}
      >
        {HeaderIcon ? (
          <HeaderIcon size={10} aria-label={headerTitle ?? header} />
        ) : (
          shortenHeader(header)
        )}
      </div>
      {children}
    </button>
  );
};
