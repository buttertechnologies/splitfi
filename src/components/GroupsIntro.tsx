import React from "react";

export function GroupsIntro() {
  return (
    <div className="mb-4 p-2 bg-muted/50 rounded-lg border text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-1 font-normal">
        <span className="font-medium">Create a group</span>
        <span className="text-muted-foreground/70 hidden sm:inline">→</span>
        <span className="text-muted-foreground/70 sm:hidden">↓</span>
        <span className="text-muted-foreground">Add members by Flow address</span>
        <span className="text-muted-foreground/70 hidden sm:inline">→</span>
        <span className="text-muted-foreground/70 sm:hidden">↓</span>
        <span className="text-muted-foreground">Start splitting expenses</span>
      </div>
    </div>
  );
} 