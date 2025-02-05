import type { JSX } from "solid-js";

export default function CarbonSidePanelOpen(
	props: JSX.IntrinsicElements["svg"],
) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 32 32"
			{...props}
		>
			<title>Side panel open</title>
			<path
				fill="currentColor"
				d="M28 4H4c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h24c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2M10 26H4V6h6zm18 0H12v-9h10.2l-3.6 3.6L20 22l6-6l-6-6l-1.4 1.4l3.6 3.6H12V6h16z"
			/>
		</svg>
	);
}
