import { useState } from "react";
import { Download as DownloadIcon, Copy, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import useConnectionStore from "@/stores/ConnectionStore.ts";
import { useConnectedDeviceData } from "@/services/RpcConnectionService.ts";
import { useBehaviors } from "@/helpers/Behaviors.ts";
import { generateZMKKeymapFile, generateZMKConfigFile, downloadConfigZip } from "@/helpers/zmkConfigGenerator.ts";
import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap";

interface DownloadProps {
    opened?: boolean;
    onClose?: () => void;
}

export function Download({ opened = false, onClose }: DownloadProps) {
    const { connection, deviceName } = useConnectionStore();
    const behaviors = useBehaviors();
    
    const [keymap] = useConnectedDeviceData<Keymap>(
        { keymap: { getKeymap: true } },
        (keymap) => keymap?.keymap?.getKeymap,
        true
    );

    const [keyboardName, setKeyboardName] = useState(deviceName || "my-keyboard");
    const [keymapName, setKeymapName] = useState("default");

    const handleGenerateConfig = () => {
        if (!keymap || !behaviors || Object.keys(behaviors).length === 0) {
            toast.error("No keymap data available. Please connect to a keyboard first.");
            return;
        }

        try {
            const keymapContent = generateZMKKeymapFile(keymap, behaviors, {
                keyboardName,
                keymapName,
                includeBehaviors: true,
                includeLayers: true
            });

            const configContent = generateZMKConfigFile({
                keyboardName,
                keymapName
            });

            downloadConfigZip(keymapContent, configContent, keyboardName);
            toast.success("Configuration files downloaded successfully!");
        } catch (error) {
            console.error("Error generating config:", error);
            toast.error("Failed to generate configuration files");
        }
    };

    const handleCopyToClipboard = async () => {
        if (!keymap || !behaviors || Object.keys(behaviors).length === 0) {
            toast.error("No keymap data available. Please connect to a keyboard first.");
            return;
        }

        try {
            const keymapContent = generateZMKKeymapFile(keymap, behaviors, {
                keyboardName,
                keymapName,
                includeBehaviors: true,
                includeLayers: true
            });

            await navigator.clipboard.writeText(keymapContent);
            toast.success("Keymap copied to clipboard!");
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            toast.error("Failed to copy to clipboard");
        }
    };

    const isConnected = connection && keymap && Object.keys(behaviors).length > 0;

    return (
        <Modal
            customModalBoxClass="w-11/14 max-w-4xl"
            type='icon'
            icon={ <DownloadIcon /> }
            variant='ghost'
        >
            <div className="space-y-6">
                {/* ZMK Config Generation */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ZMK Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                        Generate ZMK configuration files for your keyboard layout
                    </p>

                    {!isConnected && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Connect to a keyboard to generate configuration files
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="keyboard-name">Keyboard Name</Label>
                            <Input
                                id="keyboard-name"
                                value={keyboardName}
                                onChange={(e) => setKeyboardName(e.target.value)}
                                placeholder="my-keyboard"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keymap-name">Keymap Name</Label>
                            <Input
                                id="keymap-name"
                                value={keymapName}
                                onChange={(e) => setKeymapName(e.target.value)}
                                placeholder="default"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={handleGenerateConfig}
                            disabled={!isConnected}
                            className="flex items-center gap-2"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Download Config Files
                        </Button>
                        <Button
                            onClick={handleCopyToClipboard}
                            disabled={!isConnected}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Copy Keymap to Clipboard
                        </Button>
                    </div>

                    {isConnected && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Configuration Ready
                                </span>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Found {keymap?.layers?.length || 0} layers with {Object.keys(behaviors).length} behaviors
                            </p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Instructions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Usage Instructions</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <div>
                            <strong>1. Generate Configuration:</strong> Click "Download Config Files" to get your ZMK configuration files.
                        </div>
                        <div>
                            <strong>2. Copy to zmk-config:</strong> Place the downloaded files in your zmk-config repository.
                        </div>
                        <div>
                            <strong>3. Build Firmware:</strong> Push to GitHub to trigger automatic firmware builds.
                        </div>
                        <div>
                            <strong>4. Flash Keyboard:</strong> Download and flash the built firmware to your keyboard.
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

