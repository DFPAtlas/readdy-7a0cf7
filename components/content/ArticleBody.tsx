import type { HelpBlock } from "@/lib/helpArticles";

export default function ArticleBody({ blocks }: { blocks: HelpBlock[] }) {
  return (
    <div className="space-y-5 text-[#3A3F3A] leading-relaxed">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={index} className="text-xl font-bold text-[#3A3F3A] pt-4">
                {block.text}
              </h2>
            );
          case "p":
            return <p key={index}>{block.text}</p>;
          case "steps":
            return (
              <ol key={index} className="list-decimal pl-6 space-y-2">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            );
          case "list":
            return (
              <ul key={index} className="list-disc pl-6 space-y-2">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          case "note":
            return (
              <div key={index} className="flex gap-3 bg-[#FBF9F4] border border-[#D5D9D5] rounded-xl px-4 py-3 text-sm">
                <i className="ri-information-line text-[#C28A78] mt-0.5" aria-hidden="true"></i>
                <p>{block.text}</p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
