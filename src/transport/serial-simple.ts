import { SerialPort } from 'serialport';
import { Transform } from 'stream';
import { TransportEventEmitter, AvailableDevice } from './types';

export class SimpleSerialTransport {
  private port?: SerialPort;
  private eventEmitter: TransportEventEmitter;

  constructor(eventEmitter: TransportEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  async serialConnect(id: string): Promise<boolean> {
    try {
      this.port = new SerialPort(id, {
        baudRate: 9600,
        autoOpen: false,
      });

      await new Promise<void>((resolve, reject) => {
        this.port!.open((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set up event handlers
      this.port.on('data', (data: Buffer) => {
        this.eventEmitter.emit('connection_data', Array.from(data));
      });

      this.port.on('error', (err) => {
        console.error('Serial port error:', err);
        this.eventEmitter.emit('connection_disconnected');
      });

      this.port.on('close', () => {
        this.eventEmitter.emit('connection_disconnected');
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to open the serial port: ${error}`);
    }
  }

  async write(data: Uint8Array): Promise<void> {
    if (this.port) {
      return new Promise<void>((resolve, reject) => {
        this.port!.write(Buffer.from(data), (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  async serialDisconnect(): Promise<void> {
    if (this.port) {
      await new Promise<void>((resolve) => {
        this.port!.close(() => resolve());
      });
    }
    this.eventEmitter.emit('connection_disconnected');
  }

  async serialListDevices(): Promise<AvailableDevice[]> {
    try {
      const ports = await SerialPort.list();
      
      return ports
        .filter(port => port.vendorId && port.productId)
        .map(port => ({
          id: port.path,
          label: port.manufacturer || port.productId || 'Unknown Device',
        }));
    } catch (error) {
      console.error('Failed to list serial devices:', error);
      return [];
    }
  }
}
