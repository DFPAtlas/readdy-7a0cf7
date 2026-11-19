import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/lib/blogPosts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published));
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-28 pb-24 px-6 lg:px-12 bg-gradient-to-b from-[#FAFBFC] to-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-article-line" aria-hidden="true"></i>
              Blog
            </span>
            <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">Guides for letting agents</h1>
            <p className="text-lg text-[#687068] leading-relaxed">
              Practical, sourced guides to the Renters&apos; Rights Act, possession and compliance in England.
            </p>
          </div>
          <div className="space-y-5">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md hover:border-[#CBD5E1] transition-all group"
              >
                <p className="text-xs text-[#687068] mb-2">
                  {formatDate(post.published)} · {post.readingMinutes} min read
                </p>
                <h2 className="text-xl font-bold text-[#3A3F3A] mb-2 group-hover:text-[#C28A78] transition-colors">{post.title}</h2>
                <p className="text-sm text-[#687068] leading-relaxed">{post.summary}</p>
              </Link>
            ))}
          </div>
          <p className="mt-12 text-center text-sm text-[#687068]">
            Want us to cover something? <Link href="/contact" className="text-[#C28A78] underline">Suggest a topic</Link>.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
