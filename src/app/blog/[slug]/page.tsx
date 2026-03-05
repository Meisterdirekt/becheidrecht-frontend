import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import MarkdownContent from "@/components/MarkdownContent";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}

const DISCLAIMER =
  "Dieser Artikel dient der allgemeinen Information und ersetzt keine individuelle Rechtsberatung (§ 2 RDG).";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Artikel nicht gefunden" };
  return {
    title: `${post.title} | BescheidRecht Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/blog" backLabel="Alle Beiträge" />
      <article className="max-w-3xl mx-auto px-6 py-16 flex-grow w-full text-left">
        <time className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
          {formatDate(post.date)}
        </time>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-2 mb-8">{post.title}</h1>
        <p className="text-white/60 text-lg mb-12">{post.description}</p>

        <MarkdownContent content={post.content} />

        {/* CTA-Box */}
        <div className="mt-16 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-8">
          <h2 className="text-lg font-bold text-white mb-2">
            Haben Sie einen ähnlichen Bescheid erhalten?
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-6">
            BescheidRecht analysiert ihn professionell für Sie – einmalig 19,90 € ohne Abo.
          </p>
          <Link
            href="/#pricing"
            className="inline-block rounded-2xl bg-[var(--accent)] px-6 py-3 font-bold text-sm text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Jetzt Bescheid analysieren lassen →
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-white/50 text-xs leading-relaxed italic border-t border-white/10 pt-8">
          {DISCLAIMER}
        </p>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link
            href="/blog"
            className="text-[var(--accent)] text-[12px] font-bold uppercase tracking-wider hover:text-[var(--accent-hover)] transition-colors"
          >
            ← Zurück zum Blog
          </Link>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
