import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav>
      <div className="flex justify-end p-4">
        <Button>Connect Wallet</Button>
      </div>
    </nav>
  );
};

export default Navbar;
