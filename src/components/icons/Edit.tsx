import type { JSX } from "solid-js";

export function CarbonEdit(props: JSX.IntrinsicElements["svg"]) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 32 32"
			classList={{
				"pointer-events-none": true,
			}}
			{...props}
		>
			<title>Edit</title>
			<path
				fill="currentColor"
				d="M2 26h28v2H2zM25.4 9c.8-.8.8-2 0-2.8l-3.6-3.6c-.8-.8-2-.8-2.8 0l-15 15V24h6.4zm-5-5L24 7.6l-3 3L17.4 7zM6 22v-3.6l10-10l3.6 3.6l-10 10z"
			/>
		</svg>
	);
}
export default CarbonEdit;
