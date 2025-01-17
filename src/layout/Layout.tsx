import { Footer } from "./Footer.tsx";
import { Header } from "./Header.tsx";
import Keyboard from "../components/keyboard/Keyboard.tsx";

interface LayoutProps {
  connectedDeviceLabel?: string;
  onSave?: () => void | Promise<void>;
  onDiscard?: () => void | Promise<void>;
  onUndo?: () => Promise<void>;
  onRedo?: () => Promise<void>;
  onResetSettings?: () => void | Promise<void>;
  onDisconnect?: () => void | Promise<void>;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function Layout({
  connectedDeviceLabel,
  canRedo,
  canUndo,
  onRedo,
  onUndo,
  onSave,
  onDiscard,
  onDisconnect,
  onResetSettings,
}: LayoutProps) {
  return (
    <>
      <Header
        connectedDeviceLabel={connectedDeviceLabel}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onSave={onSave}
        onDiscard={onDiscard}
        onDisconnect={onDisconnect}
        onResetSettings={onResetSettings}
      ></Header>
      <Keyboard />
      <Footer />
    </>
  );
}
