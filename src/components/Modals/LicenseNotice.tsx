import NOTICE from "../../../NOTICE?raw";
export function LicenseNotice() {
  return <>
    <div>
      <div className="flex justify-between items-start">
        <p className="mr-2">
          ZMK Studio is released under the open source Apache 2.0 license. A
          copy of the NOTICE file from the ZMK Studio repository is included
          here:
        </p>
      </div>
      <pre className="m-4 font-mono text-xs">{ NOTICE }</pre>
    </div>
  </>;
}
