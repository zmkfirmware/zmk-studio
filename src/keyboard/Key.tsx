import { PropsWithChildren } from "react";
import BehaviorShortNames from "./behavior-short-names.json";

interface KeyProps {
  selected?: boolean;
  width: number;
  height: number;
  oneU: number;
  header?: string;
  onClick?: () => void;
}

interface BehaviorShortName {
  short?: string | null;
  icon?: string | null;
}

const shortNames: Record<string, BehaviorShortName> = BehaviorShortNames;

const shortenHeader = (header: string) => {
  const maxHeaderLength = 9;
  if(shortNames[header]?.short != null){
    return shortNames[header].short;
  } else if(header.length > maxHeaderLength){
    const words = header.split(/[\s,-]+/);
    const lettersPerWord = Math.trunc(maxHeaderLength / words.length);
    return words.map((word) => (word.substring(0,lettersPerWord))).join("");
  } else {
    return header;
  }
}

export const Key = ({
  selected = false,
  width,
  height,
  oneU,
  header,
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
      <div className={`absolute text-xs ${selected ? "text-primary-content" : "z1text-base-content"} opacity-80 group-hover:opacity-0 top-1 text-nowrap left-1/2 font-light -translate-x-1/2 text-center transition-opacity`}>{header ? shortenHeader(header) : ""}</div>
      <div className={`absolute text-xs ${selected ? "text-primary-content" : "z1text-base-content"} opacity-0 group-hover:opacity-80 top-1 text-nowrap left-1/2 font-light -translate-x-1/2 text-center transition-opacity`}>{header}</div>
      {children}
    </button>
  );
};
