// Path: @/scenes/ayarlar/Spinner.tsx
// File: Spinner.jsx (aynı klasör)
// =============================
import React from "react";

export const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

export const CellSpinner = () => (
  <div className="inline-flex items-center justify-center w-10 h-10">
    <span className="loading loading-spinner loading-sm" />
  </div>
);