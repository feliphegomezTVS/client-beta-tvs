console.clear();
console.log("V1");

const require = (pathFile) => {
  let rR = `<div>file ${pathFile} no found</div>`;
  xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET", pathFile, false);
  xmlhttp.send();
  if(xmlhttp.status == 200) rR = xmlhttp.responseText;
  return rR;
}

class LineBreakTransformer {
  constructor() {
    // A container for holding stream data until a new line.
    this.container = '';
  }
  transform(chunk, controller) {
      // Handle incoming chunk
      this.container += chunk;
      // const lines = this.container.split('X');
      // const lines = this.container.split('\r\n');
      const lines = this.container.split(/[\s,\r,\n,x,X]/);
      this.container = lines.pop();
      lines.forEach(line => controller.enqueue(line));
  }
  flush(controller) {
    // Flush the stream.
    controller.enqueue(this.container);
  }
} 

/**
 * PeerJS
 */
const utilsGlobalPeerJS = {
  data: () => ({
    status: null,
    lastPeerId: null,
    peer: null,
    conn: null,
    recvId: null,
    standbyBox: null,
    recvIdInput: null,
    txMessageManual: '',
    config: {
      peerjs: {
        debug: 2
      },
    },
  }),
  methods: {
    getUrlParam(name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
      var results = regex.exec(window.location.href);
      if (results == null) return null;
      else return results[1];
    },
    joinPeerSupplierToClient() {
      let self = this;
      console.log('joinPeerSupplier');
      if (self.conn) self.conn.close();// Close old connection
      self.conn = self.peer.connect(self.recvIdInput, {
        reliable: true
      });
      self.conn
        .on('open', self.peerConnectionOpenSupplierToClient)
        .on('data', self.rxPeerSupplier)
        .on('close', self.peerConnectionDestroyed);
    },
    peerConnectionOpenClient(id) {
      console.log('Received null id from peer open');
      if (this.peer.id === null) this.peer.id = this.lastPeerId;
      else this.lastPeerId = this.peer.id;
      console.log('ID: ' + this.peer.id);
      this.recvId = this.peer.id;
      this.status = "Awaiting connection...";
    },
    peerConnectionOpenSupplier(id) {
      if (this.peer.id === null) {
        console.log('Received null id from peer open');
        this.peer.id = this.lastPeerId;
      } else this.lastPeerId = this.peer.id;
      console.log('ID: ' + this.peer.id);
    },
    peerConnectionClient(c) {
      let self = this;
      // Allow only a single connection
      if (self.conn && self.conn.open) {
        c.on('open', function() {
          c.send("Already connected to another client");
          setTimeout(function() { c.close(); }, 500);
        });
        return;
      }
      self.conn = c;
      console.log("Connected to: " + self.conn.peer);
      self.status = "Connected";
      // Ready RX Peer
      self.conn.on('data', self.rxPeerClient)
      .on('close', function () {
        self.status = "Connection reset<br>Awaiting connection...";
        self.conn = null;
      });
    },
    peerConnectionSupplier(c) {
      c.on('open', function() {
        c.send("Sender does not accept incoming connections");
        setTimeout(function() { c.close(); }, 500);
      });
    },
    peerConnectionOpenSupplierToClient() {
      console.log("Connected to: " + this.conn.peer);
      this.status = "Connected to: " + this.conn.peer;
      var command = this.getUrlParam("command");
      if (command) this.conn.send(command);
    },
    peerConnectionError(err) {
      console.log(err);
      alert('' + err);
    },
    peerConnectionDestroyed() {
      this.conn = null;
      this.status = "Connection destroyed. Please refresh";
      console.log('Connection destroyed');
    },
    peerConnectionDisconnected() {
      this.status = "Connection lost. Please reconnect";
      console.log('Connection lost. Please reconnect');
      // Workaround for self.peer.reconnect deleting previous id
      this.peer.id = this.lastPeerId;
      this.peer._lastServerId = this.lastPeerId;
      this.peer.reconnect();
    },

    // RxT Peer
    rxPeerClient(dataIn) {
      // console.log('rxPeerClient', dataIn);
      switch (dataIn) {
        case 'Go':
          console.log('command Go')
          this.go();
          break;
        case 'Reset':
          console.log('command Reset')
          this.reset();
          break;
        default:
          console.log('default RX Client: ', dataIn);
          break;
      };
    },
    txPeerClient(dataOutputPeer) {
      let self = this;
      // console.log('txPeerClient', dataOutputPeer);
      if (self.conn && self.conn.open) self.conn.send(dataOutputPeer);
      else console.log('Connection is closed');
    },
    rxPeerSupplier(dataIn) {
      // console.log('rxPeerSupplier', dataIn);
      switch (dataIn) {
        case 'CommandOne':
          console.log('command one')
          break;
        default:
          console.log('default RX Supplier: ', dataIn);
          this.txSerialSupplier(dataIn);
          break;
      }
      // BufferArray
      // if (!("TextDecoder" in window)) alert("Sorry, this browser does not support TextDecoder...");
      // var enc = new TextDecoder("utf-8");
      // var arr = new Uint8Array(dataIn);
      // let value = enc.decode(arr);
    },
    txPeerSupplier(dataOutputPeer) {
      let self = this;
      // console.log('txPeerSupplier', dataOutputPeer);
      if (self.conn && self.conn.open) self.conn.send(dataOutputPeer);
      else console.log('Connection is closed');
    },
  },
};

const utilsClientPeerJS = {
  mixins: [utilsGlobalPeerJS],
  mounted() {
    this.initializePeerClient();
  },
  methods: {
    initializePeerClient() {
      let self = this;
      console.log('initializePeerClient');
      self.peer = new Peer(null, self.config.peerjs);
      self.peer
        .on('open', self.peerConnectionOpenClient)
        .on('connection', self.peerConnectionClient)
        .on('disconnected', this.peerConnectionDisconnected)
        .on('close', self.peerConnectionDestroyed)
        .on('error', self.peerConnectionError);
    },
    go() {
      document.getElementById("standby").className = "display-box hidden";
      document.getElementById("go").className = "display-box go";
      document.getElementById("fade").className = "display-box hidden";
      document.getElementById("off").className = "display-box hidden";
      return;
    },
    reset() {
      document.getElementById("standby").className = "display-box standby";
      document.getElementById("go").className = "display-box hidden";
      document.getElementById("fade").className = "display-box hidden";
      document.getElementById("off").className = "display-box hidden";
      return;
    },
  },
};

const utilsSupplierPeerJS = {
  mixins: [utilsGlobalPeerJS],
  methods: {
    initializePeerSupplier() {
      let self = this;
      self.peer = new Peer(null, self.config.peerjs);
      self.peer
        .on('open', self.peerConnectionOpenSupplier)
        .on('connection', self.peerConnectionSupplier)
        .on('disconnected', this.peerConnectionDisconnected)
        .on('close', self.peerConnectionDestroyed)
        .on('error', self.peerConnectionError);
    },
  },
  mounted() {
    this.initializePeerSupplier(); // Since all our callbacks are setup, start the process of obtaining an ID
  },
};

/**
 * SERIAL
 */
const utilsGlobalSerial = {
  data: () => ({
    /* Data SerialPort */
    FG: {
      portConected: false,
      isReadLoopConnected: false,
      port: undefined,
      ports: [],
      // reader: ReadableStreamDefaultReader || ReadableStreamBYOBReader || undefined,
      urlParams: new URLSearchParams(window.location.search),
      usePolyfill: new URLSearchParams(window.location.search).has('polyfill'),
      bufferSize: 8 * 1024, // 8Kb
      encoder: new TextEncoder(),
      toFlush: '',

      outputDone: null,
      outputStream: null,

      localPort: null,
      signals: null,
      
      reader: ReadableStreamDefaultReader,
      writer: WritableStreamDefaultWriter,
      encoder: new TextEncoder(),
      decoder: new TextDecoder(),
      
    },
  }),
  methods: {
    /* Functions SerialPort */
    markDisconnected() {
      this.FG.port = undefined;
    },
    async disconnectFromPort()  {
      this.FG.localPort = this.FG.port;
      this.FG.port = undefined;
      if (this.FG.reader) await this.FG.reader.cancel();
      if (this.FG.localPort) {
        try {
          await this.FG.localPort.close();
        } catch (e) {
          console.error(e);
        }
      }
      this.markDisconnected();
    },
    connSerial(){
      if (this.FG.port) this.disconnectFromPort();
      else this.connectToPort();
    },

    /**
     * Takes a string of data, encodes it and then writes it using the `writer` attached to the serial port.
     * @param data - A string of data that will be sent to the Serial port.
     * @returns An empty promise after the message has been written.
     */
      async writeSerialHandler(data) {
      const dataArrayBuffer = this.FG.encoder.encode(data);
      return await this.FG.writer.write(dataArrayBuffer);
    },

    /**
     * Gets data from the `reader`, decodes it and returns it inside a promise.
     * @returns A promise containing either the message from the `reader` or an error.
     */
    async readSerialHandler() {
      try {
        const readerData = await this.FG.reader.read();
        return this.FG.decoder.decode(readerData.value);
      } catch (err) {
        const errorMessage = `error reading data: ${err}`;
        console.error(errorMessage);
        return errorMessage;
      }
    },

    // RxT Serial
    rxSerialClient(dataIn) {
      console.log('rxSerialClient', dataIn);
      this.txPeerClient(dataIn);
    },
    txSerialClient(dataOutput) {
      console.log('txSerialClient', dataOutput);
      this.writeToStream(dataOutput);
    },
    rxSerialSupplier(dataIn) {
      console.log('rxSerialSupplier', dataIn);
      this.txPeerSupplier(dataIn);
    },
    async txSerialSupplier(dataOutput) {
      console.log('txSerialSupplier', dataOutput);
      this.writeToStream(dataOutput);
    },

    async testSerialSend(data){
      console.log('testSerialSend', data)
      this.writeSerialHandler(String(data));
      this.getSerialMessage();
    },

    async getSerialMessage() {
      const now = new Date();
      console.log(`Message received at ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}.${now.getMilliseconds()}: ${await this.readSerialHandler()}`);
    }
  },
};

const utilsClientSerial = {
  mixins: [utilsGlobalSerial],
  methods: {
    async connectToPort() {
      let self = this;
      
      try {
        const serial = navigator.serial;
        try {
          self.FG.port = await navigator.serial.requestPort();
          if (!self.FG.port) return;

          const options = {
            // baudRate: 115200,
            baudRate: 500000, // `baudRate` was `baudrate` in previous versions.
            // dataBits: Number.parseInt(self.FG.dataBitsSelector.value),
            // parity: self.FG.paritySelector.value as ParityType,
            // stopBits: Number.parseInt(self.FG.stopBitsSelector.value),
            // flowControl: self.FG.flowControlCheckbox.checked ? 'hardware' : 'none',
          };
          console.log(options);
          
          try {
            await self.FG.port.open(options);
          } catch (e) {
            console.error(e);
            console.log(`<ERROR: ${e.message}>`);
            self.markDisconnected();
            return;
          }
  
          self.FG.writer = self.FG.port.writable.getWriter();
          self.FG.reader = self.FG.port.readable.getReader();
          
          self.FG.signals = await self.FG.port.getSignals();
          console.log(self.FG.signals);
        } catch(err) {
          console.error('There was an error opening the serial port:', err);
        }
      } catch (e) {
        console.log("Error abriendo el puerto.", e);
        console.error('Web serial doesn\'t seem to be enabled in your browser. Check https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility for more info.')
        return;
      }

      //   try {
      //     await self.FG.port.open(options);
      //   } catch (e) {
      //     console.error(e);
      //     console.log(`<ERROR: ${e.message}>`);
      //     self.markDisconnected();
      //     return;
      //   }

      //   while (self.FG.port && self.FG.port.readable) {
      //     try {

      //       // Con buffer ----
      //       // let bufferSize = self.FG.bufferSize
      //       // try {
      //       //   self.FG.reader = self.FG.port.readable.getReader({mode: 'byob'});
      //       // } 
      //       // catch {
      //       //   self.FG.reader = self.FG.port.readable.getReader();
      //       // }
      //       // let buffer = null;
      //       // for (;;) {
      //       //   const {value, done} = await (async () => {
      //       //       if (self.FG.reader instanceof ReadableStreamBYOBReader) {
      //       //           if (!self.FG.buffer) {
      //       //               self.FG.buffer = new ArrayBuffer(bufferSize);
      //       //           }
      //       //           const {value, done} = await self.FG.reader.read(new Uint8Array(buffer, 0, bufferSize));
      //       //           buffer = value?.buffer;
      //       //           return {value, done};
      //       //       } else {
      //       //           return await self.FG.reader.read();
      //       //       }
      //       //   })();
      //       //   if (value) {
      //       //     // console.log('value', value, JSON.stringify(value));
      //       //     self.rxSerialClient(value);
      //       //       // await new Promise<void>((resolve) => {
      //       //       //     self.FG.term.write(value, resolve);
      //       //       // });
      //       //       // // Send Auto
      //       //       // self.autoSendPeer(value);
      //       //   }
      //       //   if (done) {
      //       //       break;
      //       //   }
      //       // }
          
      //       try {
      //         console.log('Usando option 1')
      //         // self.FG.reader = self.FG.port.readable.getReader({mode: 'byob'});
      //         self.FG.reader = self.FG.port.readable
      //         .pipeThrough(new TextDecoderStream())
      //         .pipeThrough(new TransformStream(new LineBreakTransformer()))
      //         .getReader();
      //       }
      //       catch {
      //         console.log('Usando option 2', 'pdte');
      //       }

      //       for (;;) {
      //         const { value, done } = await self.FG.reader.read();
      //         // if (value && self.info.a.test(value)) console.log('value', value);
      //         if (value) self.rxSerialClient(value);
      //         if (done) break;
      //       }
      //     } catch (e) {
      //       console.error(e);
      //       console.log(`<ERROR: ${e.message}>`)
      //     } finally {
      //       if (self.FG.reader) {
      //         self.FG.reader.releaseLock();
      //         self.FG.reader = undefined;
      //       }
      //     }
      //   }
      //   this.streamWriter();

      //   if (self.FG.port) {
      //     try {
      //       await self.FG.port.close();
      //     } catch (e) {
      //       console.error(e);
      //     }
      //     this.markDisconnected();
      //   }
    
    },
  }
};

const utilsSupplierSerial = {
  mixins: [utilsGlobalSerial],
  methods: {
    async connectToPort() {
      let self = this;
      try {
        const serial = navigator.serial;
        self.FG.port = await serial.requestPort({});
      } catch (e) {
        console.log("Error abriendo el puerto.", e)
        return;
      }
      
      if (!self.FG.port) return;

      const options = {
        baudRate: 500000, // 115200
        // dataBits: Number.parseInt(self.FG.dataBitsSelector.value),
        // parity: self.FG.paritySelector.value as ParityType,
        // stopBits: Number.parseInt(self.FG.stopBitsSelector.value),
        // flowControl: self.FG.flowControlCheckbox.checked ? 'hardware' : 'none',
      };
      console.log(options);

      try {
        await self.FG.port.open(options);
      } catch (e) {
        console.error(e);
        console.log(`<ERROR: ${e.message}>`);
        self.markDisconnected();
        return;
      }
      // Read Serial
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = self.FG.port.readable.pipeTo(textDecoder.writable);
      while (self.FG.port && self.FG.port.readable) {
        try {
          try {
            console.log('Usando option 1')
            // self.FG.reader = self.FG.port.readable.getReader({mode: 'byob'});
            self.FG.reader = textDecoder.readable.getReader();
          }
          catch {
            console.log('Usando option 2', 'pdte');
            self.FG.reader = self.FG.port.readable
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new TransformStream(new LineBreakTransformer()))
            .getReader();
          }

          for (;;) {
            const { value, done } = await self.FG.reader.read();
            // if (value && self.info.a.test(value)) console.log('value', value);
            if (value) self.rxSerialSupplier(value);
            if (done) {
              reader.releaseLock();
              break;
            }
          }
        } catch (e) {
          console.error(e);
          console.log(`<ERROR: ${e.message}>`)
        } finally {
          if (self.FG.reader) {
            self.FG.reader.releaseLock();
            self.FG.reader = undefined;
          }
        }
      }
    
      // Write Serial
      // this.FG.textEncoder = new TextEncoderStream();
      // this.FG.writableStreamClosed = this.FG.textEncoder.readable.pipeTo(self.FG.port.writable);
      // this.FG.outputStream = this.FG.textEncoder.writable;

      // const textEncoder = new TextEncoderStream();
      // const writableStreamClosed = textEncoder.readable.pipeTo(self.FG.port.writable);
      // self.FG.reader.cancel();
      // await readableStreamClosed.catch(() => { /* Ignore the error */ });
      // writer.close();
      // await writableStreamClosed;
      // await self.FG.port.close();

      if (self.FG.port) {
        try {
          await self.FG.port.close();
        } catch (e) {
          console.error(e);
        }
        this.markDisconnected();
      }
    },
  },
};