import type { JSX } from "solid-js";

export function CarbonAdd(props: JSX.IntrinsicElements["svg"]) {
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
			<title>Add</title>
			<path fill="currentColor" d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z" />
		</svg>
	);
}
export default CarbonAdd;
