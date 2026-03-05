import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Blog | BescheidRecht – Tipps zu Bescheiden, Fristen und Widersprüchen",
  description:
    "Ratgeber zu Bescheiden von Jobcenter, Pflegekasse, DRV und mehr: Widerspruch, Fristen, typische Fehler. Allgemeine Information – keine Rechtsberatung.",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="max-w-4xl mx-auto px-6 py-16 flex-grow w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">Blog</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Blog</h1>
        <p className="text-white/50 text-sm uppercase tracking-wider mb-16">
          Tipps, Fristen und Neuigkeiten rund um Bescheide
        </p>
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-left transition-all hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_var(--accent-glow)]"
              >
                <time className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                  {formatDate(post.date)}
                </time>
                <h2 className="text-2xl font-bold mt-2 mb-3 text-white">{post.title}</h2>
                <p className="text-white/60 text-sm leading-relaxed">{post.description}</p>
                <span className="inline-block mt-4 text-[var(--accent)] text-[12px] font-bold uppercase tracking-wider transition-transform group-hover:translate-x-1">
                  Weiterlesen →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <SiteFooter />
    </main>
  );
}
