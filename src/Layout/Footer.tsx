import { AboutModal } from "../components/Modals/AboutModal.tsx"
import { LicenseNoticeModal } from "../components/Modals/LicenseNoticeModal.tsx"


export function Footer () {
	return (
		<div className="grid justify-center p-1 bg-base-200">
			<div>
				<span>&copy; 2024 - The ZMK Contributors</span> -{ " " }
				<AboutModal></AboutModal>
				<LicenseNoticeModal></LicenseNoticeModal>
			</div>
		</div>
	)
}
