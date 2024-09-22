import { cn } from "@/lib/cn";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus as style } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  language: string;
  code: string;
  className?: string;
};

export function CodeBlock({ language, code, className }: Props) {
  return (
    <div className={cn("w-full text-sm bg-transparent", className)}>
      <SyntaxHighlighter language={language} style={style}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
