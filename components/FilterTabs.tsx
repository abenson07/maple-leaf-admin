"use client";

import { Badge } from "@relume_io/relume-ui";
import { useState } from "react";
import { BiGridAlt, BiListUl } from "react-icons/bi";

export type TabConfig = {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
};

type FilterTabsProps = {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

export const FilterTabs = ({ tabs, activeTab, onTabChange, className = "" }: FilterTabsProps) => {
  return (
    <div className={`flex gap-8 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const icon = tab.icon || (tab.id.toLowerCase().includes('kanban') ? <BiGridAlt className="size-5" /> : <BiListUl className="size-5" />);
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 pb-3 text-base font-normal transition-colors ${
              isActive
                ? "text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className={isActive ? "text-black" : "text-gray-500"}>
              {icon}
            </span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <Badge
                variant="outline"
                className={`ml-1 text-xs ${isActive ? "border-gray-800 text-gray-800" : "border-gray-400 text-gray-500"}`}
              >
                {tab.count}
              </Badge>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// Hook for managing filter tabs state
export const useFilterTabs = (initialTab: string) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  return { activeTab, setActiveTab };
};
