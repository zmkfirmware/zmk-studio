import { SerialTransport } from './serial';
import { GattTransport } from './gatt';
import { TransportEventEmitter, AvailableDevice } from './types';

export class TransportManager {
  private serialTransport: SerialTransport;
  private gattTransport: GattTransport;
  private eventEmitter: TransportEventEmitter;

  constructor(eventEmitter: TransportEventEmitter) {
    this.eventEmitter = eventEmitter;
    this.serialTransport = new SerialTransport(eventEmitter);
    this.gattTransport = new GattTransport(eventEmitter);
  }

  // Serial methods
  async serialConnect(id: string): Promise<boolean> {
    return this.serialTransport.serialConnect(id);
  }

  async serialDisconnect(): Promise<void> {
    return this.serialTransport.serialDisconnect();
  }

  async serialListDevices(): Promise<AvailableDevice[]> {
    return this.serialTransport.serialListDevices();
  }

  // GATT methods
  async gattConnect(id: string): Promise<boolean> {
    return this.gattTransport.gattConnect(id);
  }

  async gattListDevices(): Promise<AvailableDevice[]> {
    return this.gattTransport.gattListDevices();
  }

  // Transport methods
  async transportSendData(data: Uint8Array): Promise<void> {
    return this.serialTransport.transportSendData(data);
  }

  async transportClose(): Promise<void> {
    return this.serialTransport.transportClose();
  }
}

export * from './types';
