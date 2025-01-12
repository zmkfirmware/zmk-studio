import React, { Children } from "react";

export function Drawer({children}: {children: React.ReactNode}) {
  return <>
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        {/* Page content here */ }
        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">
          Open drawer
        </label>
      </div>
      <div className="drawer-side">
        { Children.map( children, child => <div className="Row">
          { child }
        </div> ) }
      </div>
    </div>
  </>;
}
