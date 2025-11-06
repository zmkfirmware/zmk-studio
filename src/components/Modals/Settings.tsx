import { Settings as SettingsIcon } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { Label } from "@/components/ui/label";

interface SettingsProps {
    opened?: boolean;
    onClose?: () => void;
}

export function Settings({ opened: _opened = false, onClose: _onClose }: SettingsProps) {

    return (
        <Modal
            customModalBoxClass="w-11/14 max-w-4xl"
            type='icon'
            icon={ <SettingsIcon /> }
            variant='ghost'
        >
            <div className="space-y-6">
                {/* Theme Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Appearance</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="theme-toggle">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                        </div>
                        <DarkModeToggle />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
