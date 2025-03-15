import type { JSX } from "solid-js";

export function CarbonReset(props: JSX.IntrinsicElements["svg"]) {
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
			<title>Reset</title>
			<path
				fill="currentColor"
				d="M18 28A12 12 0 1 0 6 16v6.2l-3.6-3.6L1 20l6 6l6-6l-1.4-1.4L8 22.2V16a10 10 0 1 1 10 10Z"
			/>
		</svg>
	);
}
export default CarbonReset;
