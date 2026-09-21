import MarkdownContent from "../common/MarkdownContent";

function NonInteractiveLink({ children, href }) {
  return <span className="quiz-markdown-option-link" title={href}>{children}</span>;
}

const optionMarkdownComponents = { a: NonInteractiveLink };

export default function AnswerOptionMarkdown({ children, className = "" }) {
  return (
    <MarkdownContent className={`quiz-markdown-option ${className}`.trim()} components={optionMarkdownComponents}>
      {children}
    </MarkdownContent>
  );
}
