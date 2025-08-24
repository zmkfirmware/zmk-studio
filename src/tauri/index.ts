export type { AvailableDevice } from './serial'
export { list_devices as list_serial_devices, connect as connect_serial, disconnect as disconnect_serial } from './serial'
export { list_devices as list_ble_devices, connect as connect_ble, disconnect as disconnect_ble } from './ble'

// Unified disconnect function that works for both connection types
export async function disconnect(): Promise<void> {
  try {
    // Try both disconnect methods - one will succeed depending on the connection type
    await Promise.race([
      import('./serial').then(m => m.disconnect()),
      import('./ble').then(m => m.disconnect())
    ]);
  } catch (error) {
    console.warn('Error during disconnect:', error);
  }
}
