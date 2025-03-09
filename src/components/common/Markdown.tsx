import { unwrap } from "solid-js/store";
import { SolidMarkdown } from "solid-markdown";
//@ts-ignore
import { CodeInput } from "@srsholmes/solid-code-input";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "highlight.js/styles/base16/onedark.min.css";
import highlightjs from "highlight.js";

function Markdown(props: any) {
	return (
		<SolidMarkdown
			class="break-words w-full overflow-auto whitespace-pre-wrap"
			remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
			rehypePlugins={[rehypeKatex]}
			components={{
				code: (props: any) => {
					const unwrappedProps = unwrap(props);
					console.log("unwrappedProps", unwrappedProps);
					const value = unwrappedProps.node.children[0].value;
					const language = unwrappedProps.class?.replace("language-", "");

					if (!String(value).includes("\n")) {
						return (
							<code class="bg-neutral-200 rounded-md p-1">{String(value)}</code>
						);
					}

					return (
						value && (
							<CodeInput
								{...props}
								autoHeight={true}
								resize="both"
								highlightjs={highlightjs}
								value={String(value).replace(/\n$/, "")}
								language={language}
								class="break-words w-full whitespace-pre"
							/>
						)
					);
				},
				a: ({ node, ...props }) => (
					<a
						{...props}
						target="_blank"
						rel="noreferrer"
						onClick={(e) => {
							e.stopPropagation();
						}}
					/>
				),
			}}
		>
			{props.children}
		</SolidMarkdown>
	);
}

export default Markdown;
