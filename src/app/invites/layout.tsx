"use client";

import { AuthGuard } from "@/components/AuthGuard";

export default function InvitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
} 