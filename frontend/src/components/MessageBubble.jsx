import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiExternalLink, FiX } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

function MessageBubble({ role, content ,images}) {
  const isUser = role === "user";
  const [lightboxSrc, setLightboxSrc] = useState(null);
const [copiedCode, setCopiedCode] = useState("");
const copyCode = async (code) => {
  await navigator.clipboard.writeText(code);

  setCopiedCode(code);

  setTimeout(() => {
    setCopiedCode("");
  }, 2000);
};

const markdown = (content || "")
  .replace(/```review/gi, "```")
  .replace(/```text/gi, "```")
  .replace(/```[a-zA-Z0-9_-]+\s+id="[^"]*"/g, "```");
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-1.5`}>
      <div
        className={`w-fit max-w-[92vw] md:max-w-[80%]
  px-4 py-3 rounded-2xl
  break-words overflow-hidden
  leading-relaxed text-[14px]
        ${
          isUser
            ? "bg-[#22242a] text-zinc-100 rounded-tr-sm border border-zinc-700/60 shadow-sm"
            : "bg-[#141519] border border-zinc-800/80 text-zinc-200 rounded-tl-sm shadow-sm"
        }`}
      >
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-3">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                loading="lazy"
                onClick={() => setLightboxSrc(img)}
                onError={(e)=>e.currentTarget.remove()}
                className="w-44 h-32 rounded-xl object-cover border border-zinc-700 cursor-zoom-in hover:opacity-90 transition"
              />
            ))}
          </div>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl font-semibold mt-4 mb-2 text-zinc-100">{children}</h1>
            ),

            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mt-3 mb-2 text-zinc-100">{children}</h2>
            ),

            h3: ({ children }) => (
              <h3 className="text-base font-medium mt-2.5 mb-1.5 text-zinc-200">{children}</h3>
            ),

            p: ({ children }) => (
              <p className="mb-2.5 whitespace-pre-wrap break-words leading-relaxed text-zinc-200">
                {children}
              </p>
            ),

            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 my-2 text-zinc-300">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2 text-zinc-300">
                {children}
              </ol>
            ),

            table: ({ children }) => (
              <div className="overflow-x-auto my-4 rounded-xl border border-zinc-800">
                <table className="min-w-full">
                  {children}
                </table>
              </div>
            ),

            th: ({ children }) => (
              <th className="border-b border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-left font-medium text-xs text-zinc-300">
                {children}
              </th>
            ),

            td: ({ children }) => (
              <td className="border-b border-zinc-800/60 px-3.5 py-2 text-xs text-zinc-300">
                {children}
              </td>
            ),

            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-200 hover:text-white underline inline-flex items-center gap-1 transition-colors font-medium"
              >
                {children}
                <FiExternalLink size={11} />
              </a>
            ),

            img: ({ src }) => {
              if (!src) return null;

              return (
                <img
                  src={src}
                  loading="lazy"
                  onClick={() => setLightboxSrc(src)}
                  onError={(e) => e.currentTarget.remove()}
                  className="w-44 h-32 rounded-xl object-cover cursor-pointer my-2 border border-zinc-800"
                />
              );
            },

            code({ className, children }) {
              const value = String(children)
                .replace(/^\s*```[^\n]*\n/, "")
                .replace(/\n```\s*$/, "")
                .trim();

              if (!className) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[12.5px] border border-zinc-700/60">
                    {value}
                  </code>
                );
              }

              const language = className.replace("language-", "");

              return (
                <div className="my-3.5 overflow-hidden rounded-xl border border-zinc-800 bg-[#0e0f12]">

                  <div className="flex items-center justify-between bg-[#141519] border-b border-zinc-800 px-4 py-2">

                    <span className="uppercase text-[11px] font-medium tracking-wider text-zinc-400">
                      {language}
                    </span>

                    <button
                      onClick={() => copyCode(value)}
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer bg-transparent border-none"
                    >
                      {copiedCode === value ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy
                        </>
                      )}
                    </button>

                  </div>

                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    wrapLongLines
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "16px",
                      background: "#0c1018",
                      fontSize: "13px",
                    }}
                  >
                    {value}
                  </SyntaxHighlighter>

                </div>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2"
          >
            <FiX size={20} />
          </button>
          <img
            src={lightboxSrc}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;