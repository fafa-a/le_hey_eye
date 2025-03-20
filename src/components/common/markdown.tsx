import { unwrap } from "solid-js/store";
import { SolidMarkdown } from "solid-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { writeClipboard } from "@solid-primitives/clipboard";
import { createSignal, Show } from "solid-js";
import { Button } from "../ui/button";
import Copy from "../icons/copy";
import Checkmark from "../icons/checkmark";
import CodeHighlight from "./code-highlight";
import ComponentTooltip from "./component-tooltip";

function Markdown(props: any) {
	return (
		<SolidMarkdown
			class="break-words w-full whitespace-pre-wrap space-y-1.5"
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
							setTimeout(() => setCopied(false), 1500);
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
							<div class="flex flex-col bg-neutral-800 rounded-md p-1 max-w-full">
								<div class="flex justify-between items-center">
									<span class="text-xs text-neutral-500">{language}</span>
									<ComponentTooltip content="Copy code" placement="top">
										<Button
											variant="ghost"
											size="xs"
											class="text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300"
											onClick={copyCode}
											disabled={copied()}
										>
											<Show when={!copied()} fallback={<Checkmark />}>
												<Copy />
											</Show>
										</Button>
									</ComponentTooltip>
								</div>
								<CodeHighlight
									code={String(value).replace(/\n$/, "")}
									language={language}
									class="w-full overflow-auto break-words whitespace-pre-wrap"
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
