"use client";

import { useCurrentFlowUser } from "@onflow/kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentFlowUser();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Give time for the auth state to stabilize
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized && !user?.loggedIn) {
      router.push("/");
    }
  }, [isInitialized, user?.loggedIn, router]);

  // Don't render anything until we're sure about the auth state
  if (!isInitialized) {
    return null;
  }

  if (!user?.loggedIn || !user?.addr) {
    return null;
  }

  return <>{children}</>;
}
