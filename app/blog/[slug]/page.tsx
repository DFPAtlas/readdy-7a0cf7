import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleBody from "@/components/content/ArticleBody";
import { BLOG_POSTS, getBlogPost } from "@/lib/blogPosts";

type Params = { slug: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function generateStaticParams(): Params[] {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog | LetHub" };
  return {
    title: `${post.title} | LetHub`,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.published, modifiedTime: post.updated },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug);

  return (
    <main className="min-h-screen">
      <Header />
      <article className="pt-28 pb-20 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-sm text-[#687068] mb-6">
            <Link href="/blog" className="hover:text-[#C28A78]">Blog</Link>
          </nav>
          <h1 className="text-4xl font-bold text-[#3A3F3A] mb-3">{post.title}</h1>
          <p className="text-lg text-[#687068] mb-2">{post.summary}</p>
          <p className="text-xs text-[#687068] mb-10">
            Published {formatDate(post.published)}
            {post.updated !== post.published && <> · Updated {formatDate(post.updated)}</>} · {post.readingMinutes} min read
          </p>
          <ArticleBody blocks={post.body} />

          <div className="mt-12 border-t border-[#E2E8F0] pt-8">
            <h2 className="text-base font-semibold text-[#3A3F3A] mb-3">Sources</h2>
            <ul className="space-y-2 text-sm">
              {post.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#C28A78] hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {others.length > 0 && (
            <div className="mt-10 border-t border-[#E2E8F0] pt-8">
              <h2 className="text-base font-semibold text-[#3A3F3A] mb-3">More guides</h2>
              <ul className="space-y-2">
                {others.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="text-[#C28A78] hover:underline">{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
      <Footer />
    </main>
  );
}
