interface ProviderOptionsProps {
	label: string;
	iconSrc: string;
}
export default function ProviderOptions(props: ProviderOptionsProps) {
	return (
		<div class="flex items-center gap-2">
			<img src={props.iconSrc} width={20} height={20} alt={props.label} />
			<p>{props.label}</p>
		</div>
	);
}
