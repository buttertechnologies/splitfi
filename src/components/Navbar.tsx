import React from "react";
import Link from "next/link";
import { Connect } from "./Connect";

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
            <Connect />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
