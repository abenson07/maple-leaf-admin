"use client";

import { Badge, Button } from "@relume_io/relume-ui";
import { useState } from "react";

export type TabConfig = {
  id: string;
  label: string;
  count?: number;
};

type FilterTabsProps = {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

export const FilterTabs = ({ tabs, activeTab, onTabChange, className = "" }: FilterTabsProps) => {
  return (
    <div className={`flex gap-2 border-b border-border-primary ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-primary text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <Badge
                variant="outline"
                className={`ml-1 ${isActive ? "border-primary text-primary" : ""}`}
              >
                {tab.count}
              </Badge>
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
