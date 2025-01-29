import { TransportFactory } from "../components/Modals/ConnectModal.tsx";
import { connect as serial_connect } from "@zmkfirmware/zmk-studio-ts-client/transport/serial";
import { connect as gatt_connect } from "@zmkfirmware/zmk-studio-ts-client/transport/gatt";
import { connect as tauri_ble_connect, list_devices as ble_list_devices } from "../tauri/ble.ts";
import { connect as tauri_serial_connect, list_devices as serial_list_devices } from "../tauri/serial.ts";

declare global {
	interface Window {
		__TAURI_INTERNALS__?: object;
	}
}

export const TRANSPORTS: TransportFactory[] = [
	navigator.serial && {
		label: 'USB',
		connect: serial_connect,
	},
	...(navigator.bluetooth && navigator.userAgent.indexOf('Linux') >= 0
		? [
			{
				label: 'BLE',
				connect: gatt_connect,
			},
		]
		: []),
	...(window.__TAURI_INTERNALS__
		? [
			{
				label: 'BLE',
				isWireless: true,
				pick_and_connect: {
					connect: tauri_ble_connect,
					list: ble_list_devices,
				},
			},
		]
		: []),
	...(window.__TAURI_INTERNALS__
		? [
			{
				label: 'USB',
				pick_and_connect: {
					connect: tauri_serial_connect,
					list: serial_list_devices,
				},
			},
		]
		: []),
].filter((t) => t !== undefined);