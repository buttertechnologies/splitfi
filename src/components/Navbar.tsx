import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Site Name */}
          <Link href="/" className="text-xl font-bold">
            Divy
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            <Button>Connect Wallet</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
