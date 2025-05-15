"use client";

import React from "react";

export default function FAQ({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="bg-white rounded-lg shadow p-4 border cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{q}</span>
        <span className="ml-2">{open ? "–" : "+"}</span>
      </div>
      {open && <div className="mt-2 text-sm">{a}</div>}
    </div>
  );
}
