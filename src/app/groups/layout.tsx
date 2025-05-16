"use client";

import { AuthGuard } from "@/components/AuthGuard";

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
} 