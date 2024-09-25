import { PropsWithChildren } from "react";

import { ExternalLink as LinkIcon } from "lucide-react";

export interface ExternalLinkProps {
  href: string;
}

export const ExternalLink = ({
  href,
  children,
}: PropsWithChildren<ExternalLinkProps>) => {
  return (
    <a className="text-primary hover:underline" target="_new" href={href}>
      {children}
      <LinkIcon className="inline-block w-4 mx-1 align-text-top" />
    </a>
  );
};
