import { Button } from "react-aria-components";

export function RestoreStock() {
  return (
    <>
      <h2 className="my-2 text-lg">Restore Stock Settings</h2>
      <div>
        <p>
          Settings reset will remove any customizations previously made in ZMK
          Studio and restore the stock keymap
        </p>
        <p>Continue?</p>
      </div>
    </>
  );
}
