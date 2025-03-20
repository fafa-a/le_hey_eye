import { createEffect, onMount } from "solid-js";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.min.css";

interface PrismCodeHighlightProps {
	code: string;
	language: string;
	class?: string;
}

function CodeHighlight(props: PrismCodeHighlightProps) {
	let codeRef: HTMLElement | undefined;

	const highlightCode = () => {
		if (!codeRef) return;

		try {
			if (props.language && Prism.languages[props.language]) {
				codeRef.innerHTML = Prism.highlight(
					props.code,
					Prism.languages[props.language],
					props.language,
				);
			} else {
				codeRef.textContent = props.code;
			}
		} catch (e) {
			console.warn("Error while highlighting code:", e);
			codeRef.textContent = props.code;
		}
	};

	onMount(() => {
		highlightCode();
	});

	createEffect(() => {
		props.code;
		props.language;
		highlightCode();
	});

	return (
		<pre class={`${props.class || ""}`}>
			<code ref={codeRef} class={`language-${props.language || "none"}`}>
				{props.code}
			</code>
		</pre>
	);
}

export default CodeHighlight;
