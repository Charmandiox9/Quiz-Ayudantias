import MarkdownContent from "../common/MarkdownContent";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";

const NonInteractiveLink: NonNullable<Components["a"]> = ({ children, href }) => {
  return <span className="quiz-markdown-option-link" title={href}>{children}</span>;
};

const optionMarkdownComponents = { a: NonInteractiveLink };

export default function AnswerOptionMarkdown({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <MarkdownContent className={`quiz-markdown-option ${className}`.trim()} components={optionMarkdownComponents}>
      {children}
    </MarkdownContent>
  );
}
