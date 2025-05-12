"use client";

import { useFlowQuery } from "@onflow/kit";

export default function GroupsPage() {
  const { data, isLoading, error } = useFlowQuery({
    cadence: `
      access(all)
      fun main(): [String] {
          return [
              "Mexico City Trip 2024",
              "Weekly Dinner Club",
              "Ski Weekend - Tahoe",
              "Beach House - Malibu",
              "Birthday Party - Sarah",
              "Camping Trip - Yosemite",
              "Concert - Taylor Swift",
              "Apartment Utilities",
              "Office Lunch Pool",
              "Wedding - Mike & Lisa"
          ]
      }
    `,
  });

  if (isLoading)
    return (
      <div className="container mx-auto p-4">
        <p>Loading groups...</p>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Groups</h1>
      <div className="space-y-2">
        {(data as string[])?.map((group, index) => (
          <div key={index}>{group}</div>
        ))}
      </div>
    </div>
  );
}
