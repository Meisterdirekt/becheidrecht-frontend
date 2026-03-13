"use client";

import React, { useState } from "react";
import { DemoRequestModal } from "./DemoRequestModal";

interface DemoRequestButtonProps {
  children: React.ReactNode;
  className?: string;
  tarif?: string;
}

export function DemoRequestButton({
  children,
  className,
  tarif,
}: DemoRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  function handleOpen() {
    setMountKey((k) => k + 1);
    setIsOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={className}
      >
        {children}
      </button>
      <DemoRequestModal
        key={mountKey}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        preselectedTarif={tarif}
      />
    </>
  );
}
