import React, { useState } from "react";
import { Key } from "./keyboard/Key.tsx";
import { keyboards } from "../data/keys";

interface Tab {
  Name: string;
  UsageIds: [];
}

interface TabsProps {
  tabs: Tab[];
}

export default function Keys( props: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  function handleTabClick(index: number) {
      console.log();
    setActiveTab(index);
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {keyboards.map(function (tab, index) {
            return (
              <button
                key={index}
                onClick={function () {
                  handleTabClick(index);
                }}
                className={`shrink-0 border-b-2 p-3 text-sm font-medium ${activeTab === index ? "border-sky-600 text-sky-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab.Name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 border border-gray-200 rounded-b-md">
        {keyboards[activeTab].UsageIds.map(function (tab, index) {
          return (
            <Key oneU={38} width={1.5} height={1.5} hoverZoom={false}>
              <button
                key={tab.Id}
                onClick={function () {
                  console.log(tab);
                  // handleTabClick(index);
                }}
                className="box-content"
              >
                <div className="size-auto text-wrap" dangerouslySetInnerHTML={{ __html: tab.Label }} />
              </button>
            </Key>
          );
        })}
      </div>
    </div>
  );
}
