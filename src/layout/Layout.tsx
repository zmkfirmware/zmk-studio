import { Children } from "react";
import { Footer } from "./Footer.tsx";

export function Layout( {children}: {children: React.ReactNode}) {
  return <>

    <Footer
        onShowAbout={() => setShowAbout(true)}
        onShowLicenseNotice={() => setShowLicenseNotice(true)}
    />
  </>;
}
