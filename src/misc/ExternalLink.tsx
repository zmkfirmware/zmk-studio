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
      <LinkIcon className="mx-1 inline-block w-4 align-text-top" />
    </a>
  );
};
