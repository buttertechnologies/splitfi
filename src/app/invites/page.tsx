"use client";

import React from "react";
import { InvitesList } from "@/components/InvitesList";

export default function InvitesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Invites</h1>
      <InvitesList />
    </div>
  );
} 