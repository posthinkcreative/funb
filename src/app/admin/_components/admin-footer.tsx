
"use client";

import { useState, useEffect } from "react";

export default function AdminFooter() {
  const [isMounted, setIsMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <footer className="p-4 text-center text-sm text-muted-foreground border-t bg-background">
      <p>&copy; {currentYear} FunB. All rights reserved.</p>
    </footer>
  )
}
