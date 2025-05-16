"use client";
import React from "react";
import Link from "next/link";
import { Connect } from "./Connect";
import { Users, Bell } from "lucide-react";
import { useCurrentFlowUser } from "@onflow/kit";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { user } = useCurrentFlowUser();
  const router = useRouter();

  const handleConnect = () => {
    router.push("/groups");
  };

  const handleDisconnect = () => {
    router.push("/");
  };

  return (
    <nav className="w-full border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Site Name and Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              SplitFi
            </Link>
            {user?.loggedIn && (
              <>
                <Link 
                  href="/groups" 
                  className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Groups</span>
                </Link>
                <Link 
                  href="/groups" 
                  className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Groups"
                >
                  <Users className="h-5 w-5" />
                </Link>
              </>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {user?.loggedIn && (
              <Link 
                href="/invites" 
                className="relative text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Pending Invites"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  2
                </span>
              </Link>
            )}
            <Connect onConnect={handleConnect} onDisconnect={handleDisconnect} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
