import { PropsWithChildren } from "react";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";

export interface ExternalLinkProps {
  href: string;
}

export const ExternalLink = ({
  href,
  children,
}: PropsWithChildren<ExternalLinkProps>) => {
  return (
    <a className="text-accent hover:underline" target="_new" href={href}>
      {children}
      <ArrowTopRightOnSquareIcon className="inline-block w-4 mx-1 align-text-top" />
    </a>
  );
};
