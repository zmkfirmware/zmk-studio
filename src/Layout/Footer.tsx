import { AboutModal } from "../components/Modals/AboutModal.tsx"
import { LicenseNoticeModal } from "../components/Modals/LicenseNoticeModal.tsx"
import { Separator } from "@/components/ui/separator.tsx"


export function Footer () {
	return (
		<>
			<Separator className="data-[orientation=vertical]:h-4" />
			<div
				className="flex h-(--footer-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear justify-center">
				<span>&copy; 2024 - The ZMK Contributors</span> -{ " " }
				<AboutModal></AboutModal>
				<LicenseNoticeModal></LicenseNoticeModal>
			</div>
		</>
	)
}
