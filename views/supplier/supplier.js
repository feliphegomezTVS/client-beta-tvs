const Supplier = {
    mixins: [utilsGlobal],
    template: require("/views/supplier/supplier.html"),
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
    mounted() {
      this.initializePeerSupplier(); // Since all our callbacks are setup, start the process of obtaining an ID
    },
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
      peerConnectionOpenSupplier(id) {
        if (this.peer.id === null) {
          console.log('Received null id from peer open');
          this.peer.id = this.lastPeerId;
        } else this.lastPeerId = this.peer.id;
        console.log('ID: ' + this.peer.id);
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
      
      // RxT Peer
      rxPeerSupplier(dataIn) {
        // console.log('rxPeerSupplier', dataIn);
        switch (dataIn) {
          case 'CommandOne':
            console.log('CommandOne');
            break;
          default:
            console.log('default RX Supplier: ', dataIn);
            // this.txSerialSupplier(dataIn); /// SIGUI
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