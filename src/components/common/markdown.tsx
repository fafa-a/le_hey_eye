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
import { writeClipboard } from "@solid-primitives/clipboard";
import { createSignal, Show } from "solid-js";
import { Button } from "../ui/button";
import Copy from "../icons/copy";
import Checkmark from "../icons/checkmark";

function Markdown(props: any) {
	return (
		<SolidMarkdown
			class="break-words w-full whitespace-pre-wrap"
			remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
			rehypePlugins={[rehypeKatex]}
			components={{
				code: (props: any) => {
					const unwrappedProps = unwrap(props);
					const value = unwrappedProps.node.children[0].value;
					const language = unwrappedProps.class?.replace("language-", "");
					const [copied, setCopied] = createSignal(false);

					const copyCode = async () => {
						if (!value) return;

						try {
							await writeClipboard(String(value).replace(/\n$/, ""));
							setCopied(true);
						} catch (err) {
							console.error("Erreur lors de la copie:", err);
						}
					};

					if (!String(value).includes("\n")) {
						return (
							<code class="bg-neutral-200 rounded-md p-1">{String(value)}</code>
						);
					}

					return (
						value && (
							<div class="flex flex-col bg-neutral-50 rounded-md my-1 p-1 max-w-full">
								<div class="flex justify-between items-center">
									<span class="text-xs text-neutral-400">{language}</span>
									<Button
										variant="ghost"
										size="xs"
										onClick={copyCode}
										disabled={copied()}
										title={copied() ? "Copied!" : "Copy"}
									>
										<Show when={!copied()} fallback={<Checkmark />}>
											<Copy />
										</Show>
									</Button>
								</div>
								<CodeInput
									{...props}
									autoHeight={true}
									resize="both"
									highlightjs={highlightjs}
									value={String(value).replace(/\n$/, "")}
									language={language}
									class="break-words whitespace-pre-wrap "
								/>
							</div>
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
