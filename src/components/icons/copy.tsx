import type { JSX } from "solid-js";

export function CarbonCopy(props: JSX.IntrinsicElements["svg"]) {
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
			<title>Copy</title>
			<path
				fill="currentColor"
				d="M28 10v18H10V10zm0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2"
			/>
			<path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" />
		</svg>
	);
}
export default CarbonCopy;
