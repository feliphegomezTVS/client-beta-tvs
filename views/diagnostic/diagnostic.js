const Diagnostic = {
  template: require("/views/diagnostic/index.html"),
  data: () => ({
    me: null,
    /* Data SerialPort */
    FG: {
      portConected: false,
      isReadLoopConnected: false,
      portCounter: 1,
      // port: SerialPort || SerialPortPolyfill || undefined,
      port: undefined,
      ports: [],
      reader: ReadableStreamDefaultReader || ReadableStreamBYOBReader || undefined,
      urlParams: new URLSearchParams(window.location.search),
      usePolyfill: new URLSearchParams(window.location.search).has('polyfill'),
      bufferSize: 8 * 1024, // 8Kb
      encoder: new TextEncoder(),
      toFlush: '',
      terminalElement: HTMLInputElement || undefined,
    },
    /* Data Peer */
    connection: {
      config: {
        debug: 2
      },
      conn: null,
      lastPeerId: String || null || undefined,
      peer: Peer || undefined,
      peerId: '' || null, // Revisar ya que probablemente no se use
      recvId: '',
      status: '',
      statusCode: 9999,
      message: '',
      messages: [],
    },
    /* CAN Bus */
    canb: {
      filters: {
        dinf: {
          a: "7DF80201429999999999",
          b: "pauseIPafterThisMessage",
          c: "pauseIPinstant",
          d: "pauseFlashBlockArrayafterThisMessage",
          e: "0028991200000000",
          f: "00189900000000000083",
          g: "full Reset",
          h: "70080211019999999999",
          i: "70080214009999999999",
          j: "7008023E009999999999",
          k: "unpauseIP",
          l: "skippauseIPinstant",
          m: "recallLastFlashBlock",
          n: "blockCANBUSMessage",
          o: "00189900000000000083",
        },
        info: {
          a: /^001([0-9A-F]){0,17}|^200([0-9A-F]){0,17}|^201([0-9A-F]){0,17}|^301([0-9A-F]){0,17}|^300([0-9A-F]){0,17}|^7([0-9A-F]){0,19}|^6([0-9A-F]){0,19}$/,
          b: /^7([0-9A-F]){0,2}80([0-9])([0-9A-F]){0,14}$/,
          c: /^7([0-9A-F]){0,3}0([0-9A-F]){0,1}04([0-9A-F]){0,12}|^7([0-9A-F]){0,2}82([0-9A-F]){0,15}|^7([0-9A-F]){0,3}023E([0-9A-F]){0,12}|^7DF([0-9A-F]){0,17}|^700([0-9A-F]){0,17}$/,
          d: /^7([0-9A-F]){0,2}81([0-9A-F]){0,3}36([0-9A-F]){0,10}|^7([0-9A-F]){0,2}80([0-9A-F]){0,1}37([0-9A-F]){0,12}$/,
          e: /^7([0-9A-F]){0,2}80276([0-9A-F]){0,12}|^7([0-9A-F]){0,2}80([0-9A-F]){0,1}74([0-9A-F]){0,12}$/,
          f: /^001([0-9A-F]){0,17}|^7([0-9A-F]){0,3}3([0-9A-F]){0,13}|^([0-6]){0,1}([0-9A-F]){0,19}$/,
          g: /^001([0-9A-F]){0,17}|^7([0-9A-F]){0,2}82([0-9A-F]){0,15}|^700([0-9A-F]){0,17}|^7([0-9A-F]){0,3}023E80([0-9A-F]){0,10}$/,
          h: /^7([0-9A-F]){0,2}82([0-9A-F]){0,15}|^700([0-9A-F]){0,17},$/,
          i: /^7([0-9A-F]){0,3}1([0-9A-F]){0,3}36([0-9A-F]){0,10}$/,
          j: /^7([0-9A-F]){0,3}037F3672([0-9A-F]){0,8}$/,
          k: /^7([0-9A-F]){0,2}80276([0-9A-F]){0,12}$/,
          l: /^7([0-9A-F]){0,3}3([0-9A-F]){0,15}$/,
          m: /^7([0-9A-F]){0,2}80276([0-9A-F]){0,12}|^7([0-9A-F]){0,3}037F3672([0-9A-F]){0,8}$/,
          n: /^7([0-9A-F]){0,2}80([0-9A-F]){0,1}74([0-9A-F]){0,12}$/,
          o: 0,
          p: null,
          q: 150,
          r: /^7([0-9A-F]){0,3}0([0-9A-F]){0,1}5003([0-9A-F]){0,10}$/,
          s: /^7([0-9A-F]){0,3}0([0-9A-F]){0,1}51([0-9A-F]){0,12}|^7([0-9A-F]){0,3}0([0-9A-F]){0,1}11([0-9A-F]){0,12}$/,
          t: /^7E([0-9A-F]){0,1}8044142([0-9A-F]){0,10}$/,
          y: /^7([0-9A-F]){0,2}83([0-9A-F]){0,15}|^7([0-9A-F]){0,3}037F3672([0-9A-F]){0,8}|^7([0-9A-F]){0,3}037F0111([0-9A-F]){0,8}|^7([0-9A-F]){0,3}037F([0-9A-F]){0,2}78([0-9A-F]){0,8}|^7([0-9A-F]){0,3}0([0-9A-F]){0,1}76([0-9A-F]){0,12}$/,
        },
      },
      CANCounterGUI: 0,
      CANMessageGUI: '', // Revisar
      pauseIP: Boolean, // Revisar
      CANActionGUI: 0, // Revisar
      recallLastFlashBlock: 0, // Revisar
    },
    /* Revisar */
    dinf: {
      a: "7DF80201429999999999",
      b: "pauseIPafterThisMessage",
      c: "pauseIPinstant",
      d: "pauseFlashBlockArrayafterThisMessage",
      e: "0028991200000000",
      f: "00189900000000000083",
      g: "full Reset",
      h: "70080211019999999999",
      i: "70080214009999999999",
      j: "7008023E009999999999",
      k: "unpauseIP",
      l: "skippauseIPinstant",
      m: "recallLastFlashBlock",
      n: "blockCANBUSMessage",
      o: "00189900000000000083",
    },
    info: {
      a: /^001([0-9A-F]){0,17}|^200([0-9A-F]){0,17}|^201([0-9A-F]){0,17}|^301([0-9A-F]){0,17}|^300([0-9A-F]){0,17}|^7([0-9A-F]){0,19}|^6([0-9A-F]){0,19}$/,
      b: /^7([0-9A-F]){0,2}80([0-9])([0-9A-F]){0,14}$/,
      c: /^7([0-9A-F]){0,3}0([0-9A-F]){0,1}04([0-9A-F]){0,12}|^7([0-9A-F]){0,2}82([0-9A-F]){0,15}|^7([0-9A-F]){0,3}023E([0-9A-F]){0,12}|^7DF([0-9A-F]){0,17}|^700([0-9A-F]){0,17}$/,
      d: /^7([0-9A-F]){0,2}81([0-9A-F]){0,3}36([0-9A-F]){0,10}|^7([0-9A-F]){0,2}80([0-9A-F]){0,1}37([0-9A-F]){0,12}$/,
      e: /^7([0-9A-F]){0,2}80276([0-9A-F]){0,12}|^7([0-9A-F]){0,2}80([0-9A-F]){0,1}74([0-9A-F]){0,12}$/,
      f: /^001([0-9A-F]){0,17}|^7([0-9A-F]){0,3}3([0-9A-F]){0,13}|^([0-6]){0,1}([0-9A-F]){0,19}$/,
      g: /^001([0-9A-F]){0,17}|^7([0-9A-F]){0,2}82([0-9A-F]){0,15}|^700([0-9A-F]){0,17}|^7([0-9A-F]){0,3}023E80([0-9A-F]){0,10}$/,
      h: /^7([0-9A-F]){0,2}82([0-9A-F]){0,15}|^700([0-9A-F]){0,17},$/,
      i: /^7([0-9A-F]){0,3}1([0-9A-F]){0,3}36([0-9A-F]){0,10}$/,
      j: /^7([0-9A-F]){0,3}037F3672([0-9A-F]){0,8}$/,
      k: /^7([0-9A-F]){0,2}80276([0-9A-F]){0,12}$/,
      l: /^7([0-9A-F]){0,3}3([0-9A-F]){0,15}$/,
      m: /^7([0-9A-F]){0,2}80276([0-9A-F]){0,12}|^7([0-9A-F]){0,3}037F3672([0-9A-F]){0,8}$/,
      n: /^7([0-9A-F]){0,2}80([0-9A-F]){0,1}74([0-9A-F]){0,12}$/,
      o: 0,
      p: null,
      q: 150,
      r: /^7([0-9A-F]){0,3}0([0-9A-F]){0,1}5003([0-9A-F]){0,10}$/,
      s: /^7([0-9A-F]){0,3}0([0-9A-F]){0,1}51([0-9A-F]){0,12}|^7([0-9A-F]){0,3}0([0-9A-F]){0,1}11([0-9A-F]){0,12}$/,
      t: /^7E([0-9A-F]){0,1}8044142([0-9A-F]){0,10}$/,
      y: /^7([0-9A-F]){0,2}83([0-9A-F]){0,15}|^7([0-9A-F]){0,3}037F3672([0-9A-F]){0,8}|^7([0-9A-F]){0,3}037F0111([0-9A-F]){0,8}|^7([0-9A-F]){0,3}037F([0-9A-F]){0,2}78([0-9A-F]){0,8}|^7([0-9A-F]){0,3}0([0-9A-F]){0,1}76([0-9A-F]){0,12}$/,
    },
    arrayTempWrite: [],
    TempArraySize: 0,
    IPMessageGUI: '',
    IPCounterGUI: '',
    sessionTime: {
      hh: 0,
      mm: 0,
      ss: 0,
    },
  }),
  computed: {
      peerConnected() {
          try {
              return (this.connection.conn && this.connection.status == 'connected' && this.connection.peerId.length>10) ? true : false;
          } catch(e) {
              console.log(e)
          }
          return false;
      },
      classStatus() {
          if(this.connection.status == 'connected') return 'success';
          else if(this.connection.status == 'reset-awaiting' || this.connection.status == 'destroyed' || this.connection.status == 'lost') return 'danger';
          else if(this.connection.status == 'awaiting') return 'warning';
          else return "secondary";
      }
  },
  mounted() {
    console.log('mounted Diagnostic');
    this.me = getUserData();
    this.initPeer();
  },
  methods: {
    txSerialClient(msgCANB) {
      console.log('txSerialClient', msgCANB);
    },
    rxSerialClient(msgCANB) {
      console.log('rxSerial', msgCANB);
    },
    txPeerClient(msgCANB) {
      console.log('txPeerClient', msgCANB);
      
      if (this.connection.conn && this.connection.conn.open) {
        this.connection.conn.send(msgCANB);
        // console.log("Sent: " + msg);
      } else {
        console.log('Connection is closed');
      }
    },
    rxPeerClient(msgPeer) {
      console.log('rxPeer', msgPeer);
    },
    
    showToast(msg, type, duration, icon) {
      console.log('showToast')
      console.log(msg, type, duration, icon)
    },
    /* Functions SerialPort */
    markDisconnected() {
      this.FG.port = undefined;
    },
    async disconnectFromPort()  {
        const localPort = this.FG.port;
        this.FG.port = undefined;

        if (this.FG.reader) await this.FG.reader.cancel();

        if (localPort) {
            try {
                await localPort.close();
            } catch (e) {
                console.error(e);
                console.log(`<ERROR: ${e.message}>`)
            }
        }
        this.markDisconnected();
    },
    async connectToPort() {
      let self = this;
      try {
        const serial = navigator.serial;
        self.FG.port = await serial.requestPort({});
      } catch (e) {
        console.log("Error abriendo el puerto.", e)
        return;
      }
      // const portOption = self.maybeAddNewPort(self.FG.port);
      // portOption.selected = true;
      
      if (!self.FG.port) return;

      const options = {
        // baudRate: 115200,
        baudRate: 500000,
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

      while (self.FG.port && self.FG.port.readable) {
        try {
          try {
            console.log('Usando option 1')
            // self.FG.reader = self.FG.port.readable.getReader({mode: 'byob'});
            self.FG.reader = self.FG.port.readable
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new TransformStream(new LineBreakTransformer()))
            .getReader();
          }
          catch {
            console.log('Usando option 2')
            let decoder = new TextDecoderStream();
            const inputDone = self.FG.port.readable.pipeTo(decoder.writable);
            const inputStream = decoder.readable.pipeThrough(new TransformStream(new LineBreakTransformer()));
            self.FG.reader = inputStream.getReader();
          }

          for (;;) {
            const { value, done } = await self.FG.reader.read();
            if (value && self.info.a.test(value)) console.log('value', value);
            if (done) break;
          }
          // Con buffer ----
          // let bufferSize = self.FG.bufferSize
          // try {
          //   self.FG.reader = self.FG.port.readable.getReader({mode: 'byob'});
          // } 
          // catch {
          //   self.FG.reader = self.FG.port.readable.getReader();
          // }
          // let buffer = null;
          // for (;;) {
          //   const {value, done} = await (async () => {
          //       if (self.FG.reader instanceof ReadableStreamBYOBReader) {
          //           if (!self.FG.buffer) {
          //               self.FG.buffer = new ArrayBuffer(bufferSize);
          //           }
          //           const {value, done} = await self.FG.reader.read(new Uint8Array(buffer, 0, bufferSize));
          //           buffer = value?.buffer;
          //           return {value, done};
          //       } else {
          //           return await self.FG.reader.read();
          //       }
          //   })();

          //   if (value) {
          //     console.log('value', value, JSON.stringify(value))
          //       // await new Promise<void>((resolve) => {
          //       //     self.FG.term.write(value, resolve);
          //       // });
          //       // // Send Auto
          //       // self.autoSendPeer(value);
          //   }
          //   if (done) {
          //       break;
          //   }
          // }
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

      if (self.FG.port) {
        try {
          await self.FG.port.close();
        } catch (e) {
          console.error(e);
        }
        this.markDisconnected();
      }
    },
    connSerial(){
      if (this.FG.port) this.disconnectFromPort();
      // else this.connectToPort();
      else this.connectToPort();
    },


  },
}