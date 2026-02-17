import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "");
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts: BlogPostMeta[] = [];
  for (const file of files) {
    const fullPath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data } = matter(raw);
    const slug = (data.slug as string) || getSlugFromFilename(file);
    posts.push({
      slug,
      title: (data.title as string) || slug,
      description: (data.description as string) || "",
      date: (data.date as string) || "",
    });
  }
  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const files = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))
    : [];
  for (const file of files) {
    const fullPath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(raw);
    const fileSlug = (data.slug as string) || getSlugFromFilename(file);
    if (fileSlug === slug) {
      return {
        slug: fileSlug,
        title: (data.title as string) || fileSlug,
        description: (data.description as string) || "",
        date: (data.date as string) || "",
        content: content.trim(),
      };
    }
  }
  return null;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
