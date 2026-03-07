"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

const components = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[var(--text-muted,rgba(255,255,255,0.8))] leading-relaxed mb-4">{children}</p>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl font-bold text-[var(--text,white)] mt-8 mb-3">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-bold text-[var(--text,white)] mt-6 mb-2">{children}</h3>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside text-[var(--text-muted,rgba(255,255,255,0.8))] space-y-1 mb-4">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside text-[var(--text-muted,rgba(255,255,255,0.8))] space-y-1 mb-4">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-bold text-[var(--text,white)]">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-4">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
