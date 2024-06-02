import './app-header.css';

export interface AppHeaderProps {
    connectedDeviceLabel?: string;
}

export const AppHeader = ({connectedDeviceLabel}: AppHeaderProps) => {
    return (
        <header className="zmk-app-header">
            <p className='zmk-app-header__product-label'>ZMK Studio</p>
            <p className='zmk-app-header__connected-device'>{connectedDeviceLabel}</p>
            <div><p>Controls</p></div>
        </header>
    );
}