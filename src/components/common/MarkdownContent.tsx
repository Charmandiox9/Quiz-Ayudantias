import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownContentProps {
  children: React.ReactNode;
  className?: string;
  components?: Components;
}

export default function MarkdownContent({ children, className = "", components }: MarkdownContentProps) {
  const markdown = String(children || "");

  return (
    <div className={`quiz-markdown ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{markdown}</ReactMarkdown>
    </div>
  );
}
