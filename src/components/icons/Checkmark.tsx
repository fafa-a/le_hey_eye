import type { JSX } from "solid-js";

export function CarbonCheckmark(props: JSX.IntrinsicElements["svg"]) {
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
			<title>Checkmark</title>
			<path
				fill="currentColor"
				d="m13 24l-9-9l1.414-1.414L13 21.171L26.586 7.586L28 9z"
			/>
		</svg>
	);
}
export default CarbonCheckmark;
