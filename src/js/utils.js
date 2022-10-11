
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

const utilsGlobal = {
  methods: {
    getUrlParam(name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
      var results = regex.exec(window.location.href);
      if (results == null) return null;
      else return results[1];
    },
  },
};

const utilsClient = {
  data: () => ({
    client: {
      lastPeerId: null,
      peer: null,
      conn: null,
      recvId: null,
      status: null,

      standbyBox: null,
    }
  }),
  mounted() {
    let self = this;
    (function () {
      var sendMessageBox = document.getElementById("sendMessageBox");
      var sendButton = document.getElementById("sendButton");

      self.client.standbyBox = document.getElementById("standby");
      var goBox = document.getElementById("go");
      var fadeBox = document.getElementById("fade");
      var offBox = document.getElementById("off");

      // Send message
      sendButton.addEventListener('click', function () {
          if (self.client.conn && self.client.conn.open) {
            var msg = sendMessageBox.value;
            sendMessageBox.value = "";
            self.client.conn.send(msg);
            console.log("Sent: " + msg)
          } else {
            console.log('Connection is closed');
          }
      });

      // initialize();
      self.initializePeerClient();
    })();
  },
  methods: {
    initializePeerClient() {
      let self = this;
      console.log('initializePeerClient');
      // Create own peer object with connection to shared PeerJS server
      self.client.peer = new Peer(null, {
          debug: 2
      });

      self.client.peer.on('open', function (id) {
          // Workaround for peer.reconnect deleting previous id
          if (self.client.peer.id === null) {
            console.log('Received null id from peer open');
            self.client.peer.id = self.client.lastPeerId;
          } else {
            self.client.lastPeerId = self.client.peer.id;
          }
          console.log('ID: ' + self.client.peer.id);
          self.client.recvId = self.client.peer.id;
          self.client.status = "Awaiting connection...";
      }).on('connection', function (c) {
          // Allow only a single connection
          if (self.client.conn && self.client.conn.open) {
            c.on('open', function() {
              c.send("Already connected to another client");
              setTimeout(function() { c.close(); }, 500);
            });
            return;
          }
          self.client.conn = c;
          console.log("Connected to: " + self.client.conn.peer);
          self.client.status = "Connected";
          self.ready();
      }).on('disconnected', function () {
        self.client.status = "Connection lost. Please reconnect";
        console.log('Connection lost. Please reconnect');

        // Workaround for peer.reconnect deleting previous id
        self.client.peer.id = self.client.lastPeerId;
        self.client.peer._lastServerId = self.client.lastPeerId;
        self.client.peer.reconnect();
      }).on('close', function() {
        self.client.conn = null;
        self.client.status = "Connection destroyed. Please refresh";
        console.log('Connection destroyed');
      }).on('error', function (err) {
        console.log(err);
        alert('' + err);
      });
    },
    go() {
      let self = this;
      self.client.standbyBox.className = "display-box hidden";
      self.client.goBox.className = "display-box go";
      self.client.fadeBox.className = "display-box hidden";
      self.client.offBox.className = "display-box hidden";
      return;
    },
    fade() {
      let self = this;
      self.client.standbyBox.className = "display-box hidden";
      self.client.goBox.className = "display-box hidden";
      self.client.fadeBox.className = "display-box fade";
      self.client.offBox.className = "display-box hidden";
      return;
    },
    off() {
      let self = this;
      self.client.standbyBox.className = "display-box hidden";
      self.client.goBox.className = "display-box hidden";
      self.client.fadeBox.className = "display-box hidden";
      self.client.offBox.className = "display-box off";
      return;
    },
    reset() {
      let self = this;
      self.client.standbyBox.className = "display-box standby";
      self.client.goBox.className = "display-box hidden";
      self.client.fadeBox.className = "display-box hidden";
      self.client.offBox.className = "display-box hidden";
      return;
    },
    ready() {
      let self = this;
      self.client.conn.on('data', function (data) {
        console.log("Data recieved");
        switch (data) {
          case 'Go':
            console.log('command Go')
            self.go();
            break;
          case 'Fade':
            console.log('command Fade')
            self.fade();
            break;
          case 'Off':
            console.log('command off')
            self.off();
            break;
          case 'Reset':
            console.log('command Reset')
            self.reset();
            break;
          default:
            console.log(data);
            break;
        };
      });
      self.client.conn.on('close', function () {
        self.client.status = "Connection reset<br>Awaiting connection...";
        self.client.conn = null;
      });
    },
  },
};

const utilsSupplier = {
  data: () => ({
    supplier: {
      status: null,
      lastPeerId: null,
      peer: null,
      conn: null,
      recvIdInput: null,
      txPeerManual: '',
    }
  }),
  methods: {
    rxPeerSupplier(dataIn) {
      console.log('rxPeer', dataIn)
    },
    initializePeerSupplier() {
      let self = this;
      // Create own peer object with connection to shared PeerJS server
      self.supplier.peer = new Peer(null, {
          debug: 2
      });

      self.supplier.peer.on('open', function (id) {
          // Workaround for self.supplier.peer.reconnect deleting previous id
          if (self.supplier.peer.id === null) {
              console.log('Received null id from peer open');
              self.supplier.peer.id = self.supplier.lastPeerId;
          } else {
            self.supplier.lastPeerId = self.supplier.peer.id;
          }
          console.log('ID: ' + self.supplier.peer.id);
      }).on('connection', function (c) {
          // Disallow incoming connections
          c.on('open', function() {
              c.send("Sender does not accept incoming connections");
              setTimeout(function() { c.close(); }, 500);
          });
      }).on('disconnected', function () {
        self.supplier.status = "Connection lost. Please reconnect";
          console.log('Connection lost. Please reconnect');

          // Workaround for self.supplier.peer.reconnect deleting previous id
          self.supplier.peer.id = self.supplier.lastPeerId;
          self.supplier.peer._lastServerId = self.supplier.lastPeerId;
          self.supplier.peer.reconnect();
      }).on('close', function() {
          self.supplier.conn = null;
          self.supplier.status = "Connection destroyed. Please refresh";
          console.log('Connection destroyed');
      }).on('error', function (err) {
          console.log(err);
          alert('' + err);
      });
    },
    joinPeerSupplier() {
      let self = this;
      console.log('joinPeerSupplier');
      if (self.supplier.conn) self.supplier.conn.close();// Close old connection

      // Create connection to destination self.supplier.peer specified in the input field
      self.supplier.conn = self.supplier.peer.connect(self.supplier.recvIdInput, {
        reliable: true
      });

      self.supplier.conn.on('open', function () {
        self.supplier.status = "Connected to: " + self.supplier.conn.peer;
        console.log("Connected to: " + self.supplier.conn.peer);
        // Check URL params for comamnds that should be sent immediately
        var command = self.getUrlParam("command");
        if (command) self.supplier.conn.send(command);
      }).on('data', function (data) {
        console.log("<span class=\"peerMsg\">Peer:</span> " + data);
      }).on('close', function () {
        self.supplier.status = "Connection closed";
      });
    },
    txPeerSupplier(dataOutputPeer) {
      let self = this;
      if (self.supplier.conn && self.supplier.conn.open) {
        self.supplier.conn.send(dataOutputPeer);
        console.log(dataOutputPeer, dataOutputPeer);
      } else {
        console.log('Connection is closed');
      }
    },
    txPeerSupplierManual() {
      let self = this;
      if (self.supplier.conn && self.supplier.conn.open) {
        var msg = self.supplier.txPeerManual;
        self.supplier.txPeerManual = "";
        self.txPeerSupplier(msg);
      } else {
        console.log('Connection is closed');
      }
    }
  },
  
  mounted() {
    let self = this;
    self.initializePeerSupplier(); // Since all our callbacks are setup, start the process of obtaining an ID
  },
};