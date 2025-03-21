import type { JSX } from "solid-js";

export function PhDotsThreeVerticalBold(props: JSX.IntrinsicElements["svg"]) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 256 256"
			classList={{
				"pointer-events-none": true,
			}}
			{...props}
		>
			<title>Three Dots Vertical</title>
			<path
				fill="currentColor"
				d="M112 60a16 16 0 1 1 16 16a16 16 0 0 1-16-16m16 52a16 16 0 1 0 16 16a16 16 0 0 0-16-16m0 68a16 16 0 1 0 16 16a16 16 0 0 0-16-16"
			/>
		</svg>
	);
}
export default PhDotsThreeVerticalBold;
