"use client";

import React from "react";
import { FileText, Clock, Search, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  document: FileText,
  clock: Clock,
  search: Search,
  alert: AlertCircle,
};

interface EmptyStateProps {
  icon?: keyof typeof ICON_MAP | LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon = "document",
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  compact = false,
}: EmptyStateProps) {
  const IconComponent =
    typeof icon === "string" ? ICON_MAP[icon] ?? FileText : icon;

  const content = (
    <div
      className={`flex flex-col items-center text-center ${
        compact ? "py-8 gap-3" : "py-16 gap-4"
      }`}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10">
        <IconComponent className="w-6 h-6 text-white/30" />
      </div>
      <h3 className={`font-bold text-white/60 ${compact ? "text-sm" : "text-base"}`}>
        {title}
      </h3>
      {description && (
        <p className="text-sm text-white/30 max-w-xs">{description}</p>
      )}
      {ctaLabel &&
        (ctaHref ? (
          <a href={ctaHref} className="btn-primary mt-2 text-xs">
            {ctaLabel}
          </a>
        ) : (
          <button type="button" onClick={onCtaClick} className="btn-primary mt-2 text-xs">
            {ctaLabel}
          </button>
        ))}
    </div>
  );

  return content;
}
