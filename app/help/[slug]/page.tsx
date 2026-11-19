import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleBody from "@/components/content/ArticleBody";
import { HELP_ARTICLES, HELP_CATEGORIES, getHelpArticle } from "@/lib/helpArticles";
import { getBlogPost } from "@/lib/blogPosts";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return HELP_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article) return { title: "Help | LetHub" };
  return {
    title: `${article.title} | LetHub Help`,
    description: article.summary,
    alternates: { canonical: `/help/${article.slug}` },
  };
}

export default async function HelpArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article) notFound();
  const category = HELP_CATEGORIES.find((c) => c.id === article.category);

  const related = (article.related ?? [])
    .map((s) => {
      const help = getHelpArticle(s);
      if (help) return { href: `/help/${help.slug}`, title: help.title, kind: "Help" };
      const post = getBlogPost(s);
      if (post) return { href: `/blog/${post.slug}`, title: post.title, kind: "Guide" };
      return null;
    })
    .filter((x): x is { href: string; title: string; kind: string } => x !== null);

  return (
    <main className="min-h-screen">
      <Header />
      <article className="pt-28 pb-20 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-sm text-[#687068] mb-6">
            <Link href="/help" className="hover:text-[#C28A78]">Help</Link>
            {category && <span> / {category.title}</span>}
          </nav>
          <h1 className="text-4xl font-bold text-[#3A3F3A] mb-3">{article.title}</h1>
          <p className="text-lg text-[#687068] mb-2">{article.summary}</p>
          <p className="text-xs text-[#687068] mb-10">
            Updated {new Date(article.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <ArticleBody blocks={article.body} />

          {related.length > 0 && (
            <div className="mt-14 border-t border-[#E2E8F0] pt-8">
              <h2 className="text-base font-semibold text-[#3A3F3A] mb-4">Related</h2>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="text-[#C28A78] hover:underline">{r.title}</Link>
                    <span className="text-xs text-[#687068] ml-2">{r.kind}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 bg-[#FAFBFC] border border-[#E2E8F0] rounded-xl p-6 text-sm text-[#687068]">
            Still stuck? Email <a href="mailto:support@lethub.uk" className="text-[#C28A78] underline">support@lethub.uk</a> or{" "}
            <Link href="/contact" className="text-[#C28A78] underline">contact us</Link>.
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
