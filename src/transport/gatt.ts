import { TransportEventEmitter, AvailableDevice } from './types';

export class GattTransport {
  private device?: BluetoothDevice;
  private server?: BluetoothRemoteGATTServer;
  private service?: BluetoothRemoteGATTService;
  private characteristic?: BluetoothRemoteGATTCharacteristic;
  private notifyHandle?: AbortController;
  private eventEmitter: TransportEventEmitter;
  private conn?: WritableStreamDefaultWriter<Uint8Array>;

  constructor(eventEmitter: TransportEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  async gattConnect(id: string): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API not supported in this browser');
      }

      // Parse device ID
      const deviceId = JSON.parse(id);
      
      // Request Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: ['00000000-0196-6107-c967-c5cfb1c2482a']
          }
        ]
      });

      // Connect to GATT server
      this.server = await this.device.gatt?.connect();
      if (!this.server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Get the service
      this.service = await this.server.getPrimaryService('00000000-0196-6107-c967-c5cfb1c2482a');
      if (!this.service) {
        throw new Error('Failed to connect: Unable to locate the required studio GATT service');
      }

      // Get the characteristic
      this.characteristic = await this.service.getCharacteristic('00000001-0196-6107-c967-c5cfb1c2482a');
      if (!this.characteristic) {
        throw new Error('Failed to connect: Unable to locate the required studio GATT characteristic');
      }

      // Start notifications
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target?.value;
        if (value) {
          this.eventEmitter.emit('connection_data', Array.from(new Uint8Array(value.buffer)));
        }
      });

      // Monitor disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.eventEmitter.emit('connection_disconnected');
      });

      // Create write stream
      const { writable } = new TransformStream();
      const writer = writable.getWriter();
      this.conn = writer;

      // Start write process
      this.startWriteProcess(writer);

      return true;
    } catch (error) {
      throw new Error(`GATT connection failed: ${error}`);
    }
  }

  private async startWriteProcess(writer: WritableStreamDefaultWriter<Uint8Array>) {
    try {
      while (!this.notifyHandle?.signal.aborted) {
        const { value, done } = await writer.read();
        if (done) break;

        if (value && this.characteristic) {
          await this.writeToCharacteristic(value);
        }
      }
    } catch (error) {
      console.error('Write process error:', error);
    }
  }

  private async writeToCharacteristic(data: Uint8Array): Promise<void> {
    if (this.characteristic) {
      await this.characteristic.writeValue(data);
    }
  }

  async gattListDevices(): Promise<AvailableDevice[]> {
    try {
      if (!navigator.bluetooth) {
        return [];
      }

      // Web Bluetooth API doesn't provide a way to list devices without user interaction
      // So we return an empty array and let the user select manually
      return [];
    } catch (error) {
      console.error('Failed to list GATT devices:', error);
      return [];
    }
  }

  async gattDisconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    
    this.conn = undefined;
    this.eventEmitter.emit('connection_disconnected');
  }
}
