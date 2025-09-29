import { TransportEventEmitter, AvailableDevice } from './types';

export class SerialTransport {
  private port?: SerialPort;
  private reader?: ReadableStreamDefaultReader<Uint8Array>;
  private writer?: WritableStreamDefaultWriter<Uint8Array>;
  private readHandle?: AbortController;
  private eventEmitter: TransportEventEmitter;

  constructor(eventEmitter: TransportEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  async serialConnect(id: string): Promise<boolean> {
    try {
      // Use Web Serial API
      if (!navigator.serial) {
        throw new Error('Web Serial API not supported in this browser');
      }

      // Request port access
      this.port = await navigator.serial.requestPort({
        // Filter for USB devices
        filters: [{ usbVendorId: 0x0483 }] // Common USB vendor ID, adjust as needed
      });

      // Open the port
      await this.port.open({ baudRate: 9600 });

      // Get readable and writable streams
      const readable = this.port.readable;
      const writable = this.port.writable;

      if (!readable || !writable) {
        throw new Error('Port streams not available');
      }

      this.reader = readable.getReader();
      this.writer = writable.getWriter();

      // Start read process
      this.readHandle = new AbortController();
      this.startReadProcess();

      return true;
    } catch (error) {
      throw new Error(`Failed to open the serial port: ${error}`);
    }
  }

  private async startReadProcess() {
    if (!this.reader) return;

    try {
      while (!this.readHandle?.signal.aborted) {
        const { done, value } = await this.reader.read();
        if (done) break;
        
        if (value && value.length > 0) {
          this.eventEmitter.emit('connection_data', Array.from(value));
        }
      }
    } catch (error) {
      console.error('Read process error:', error);
    } finally {
      // Ensure the port is closed when the read process ends
      await this.cleanup();
      this.eventEmitter.emit('connection_disconnected');
    }
  }

  // Add a cleanup method to properly close the port
  private async cleanup() {
    // Abort read process
    this.readHandle?.abort();

    // Release locks
    this.reader?.releaseLock();
    this.writer?.releaseLock();

    // Close port - this is crucial for Web Serial API
    if (this.port) {
      try {
        await this.port.close();
      } catch (error) {
        console.warn('Error closing serial port:', error);
      }
    }

    // Clear references
    this.reader = undefined;
    this.writer = undefined;
    this.port = undefined;
  }

  async serialDisconnect(): Promise<void> {
    await this.cleanup();
    this.eventEmitter.emit('connection_disconnected',[]);
  }

  async serialListDevices(): Promise<AvailableDevice[]> {
    try {
      if (!navigator.serial) {
        return [];
      }

      // Web Serial API doesn't provide a way to list devices without user interaction
      // So we return an empty array and let the user select manually
      return [];
    } catch (error) {
      console.error('Failed to list serial devices:', error);
      return [];
    }
  }

  async transportSendData(data: Uint8Array): Promise<void> {
    if (this.writer) {
      await this.writer.write(data);
    }
  }

  async transportClose(): Promise<void> {
    await this.serialDisconnect();
  }
}
