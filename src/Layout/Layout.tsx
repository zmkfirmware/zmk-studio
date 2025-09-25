import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'
import Keyboard from '../components/keyboard/Keyboard.tsx'

interface LayoutProps {
    onSave?: () => void | Promise<void>
    onDiscard?: () => void | Promise<void>
    onUndo?: () => Promise<void>
    onRedo?: () => Promise<void>
    onResetSettings?: () => void | Promise<void>
    onDisconnect?: () => Promise<void>
    canUndo?: boolean
    canRedo?: boolean
}

export function Layout({}: LayoutProps) {
    return (
        <>
            <Header></Header>
            <Keyboard />
            <Footer />
        </>
    )
}
