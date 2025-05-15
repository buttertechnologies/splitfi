"use client";
import React from "react";
import Link from "next/link";
import { Connect } from "./Connect";
import { Users } from "lucide-react";
import { useCurrentFlowUser } from "@onflow/kit";

const Navbar = () => {
  const { user } = useCurrentFlowUser();
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
            <Connect />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
