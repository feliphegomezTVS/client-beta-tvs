const Client = {
    mixins: [utilsGlobal],
    template: require("/views/client/client.html"),
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
      
      portSerial: null,
      timestamp: null,
      pings: [],
    }),
    mounted() {
        this.initializePeerClient();
        this.initSerialPort();
    },
    computed: {
        status_serial() {
            return (this.port) ? 'connected' : 'disconnected';
        },
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
          case 'CommandOne':
            console.log('CommandOne')
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

      initSerialPort() {
        const conn = SimpleSerial.connect({
            // requestButton: "request-access",
            baudRate: 9600,
            // requestAccessOnPageLoad: false,
            accessText: "conecte el dispositivo para continuar.",
            accessButtonLabel: "Conectar D",
            // transformer:  new LineBreakTransformer(),
            // requestAccessOnPageLoad: false,
            logIncomingSerialData: true,
            logOutgoingSerialData: true,
            // filters: [],
        });
        
        conn.on("pong", pingNumber => {
          const rounded = Math.round((performance.now() - timestamp));
          let msg = "Pingback arrived after ~" + rounded + "ms [#" + pingNumber + "]";
          console.log('pong', msg)
        });

        conn.on("log", function(data) {
            console.log("log: ", data + '\n');
        });

        // const element = document.getElementById("button-test");
        // this.portSerial.requestSerialAccessOnClick(element);
        // this.initPingDevice();
        this.portSerial = conn;
      },

      async testLatency() {
        // console.log('testLatency', this.pings.length);
        this.timestamp = performance.now();
        this.portSerial.send("ping", 0);
        console.log('ping', this.timestamp)
      },

      initPingDevice() {
        let self = this;
        setInterval(function() {
            self.latencyDeviceClient();
        }, 1000);
      },

    //   async latencyDeviceClient() {
    //     const byte = (this.toggleLED = !this.toggleLED) ? 0 : 1
    //     this.portSerial.sendEvent('led', byte);
    //   },
    },
};