"use client";
import { useParams } from "next/navigation";

export default function GroupDetailPage() {
  const params = useParams();
  const { id } = params;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Group Details</h1>
      <p className="text-lg">Group ID: <span className="font-mono">{id}</span></p>
      {/* Add more group details here later */}
    </div>
  );
} 