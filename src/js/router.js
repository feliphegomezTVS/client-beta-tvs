const V_R = "router-0.0.0.a";

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

// 1. Define route components.
// These can be imported from other files
const Home       = {
  template: require("/views/home/index.html"),
  created() {
    router.push({
      name: 'Diagnostic'
    })
  },
}

const Login      = {
  template: require("/views/login/index.html"),
  data: () => ({
    formLogin: {
      username: '',
      password: '',
    },
    messageFormLogin: ''
  }),
  methods: {
    formSubmit() {
      let self = this;
      self.messageFormLogin = 'Validando datos';
      api.post('/login', this.formLogin).then(function (response) {
        console.log(response);
        self.messageFormLogin = 'Ingreso exitoso';
        router.push({
          name: 'Home'
        })
      }).catch(function (error) {
        // console.log(error.response);
        if(error.response.data.code != undefined) {
          console.log(error.response.data);
          self.messageFormLogin = error.response.data.message;
        }
      }).finally(()=>{
      });
    },
  },
}

const Diagnostic = {
  template: require("/views/diagnostic/index.html"),
  data: () => ({
    me: null,
    /* Data SerialPort */
    FG: {
      portSelector: HTMLSelectElement || undefined,
      connectButton: HTMLButtonElement || undefined,
      baudRateSelector: HTMLSelectElement || undefined,
      customBaudRateInput: HTMLInputElement || undefined,
      dataBitsSelector: HTMLSelectElement || undefined,
      paritySelector: HTMLSelectElement || undefined,
      stopBitsSelector: HTMLSelectElement || undefined,
      flowControlCheckbox: HTMLInputElement || undefined,
      echoCheckbox: HTMLInputElement || undefined,
      flushOnEnterCheckbox: HTMLInputElement || undefined,
      autoconnectCheckbox: HTMLInputElement || undefined,
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
      a: null,
      b: null,
      c: null,
      d: null,
      e: null,
      f: null,
      g: null,
      h: null,
      i: null,
      j: null,
      k: null,
      l: null,
      m: null,
      n: null,
      o: null,
    },
    info: {
      a: null,
      b: null,
      c: null,
      d: null,
      e: null,
      f: null,
      g: null,
      h: null,
      i: null,
      j: null,
      k: null,
      l: null,
      m: null,
      n: null,
      o: null,
      p: null,
      q: null,
      r: null,
      s: null,
      t: null,
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
  mounted() {
    console.log('mounted Diagnostic');
    this.me = getUserData();
    this.iniSessionTimer();
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

    iniSessionTimer() {
      let elapsed = 0;
      const pad = number => (number < 10 ? '0' : '') + number;
      setInterval(() => {
        elapsed += 1000;
        const {hours, minutes, seconds} = this.getTime(Math.floor(elapsed / 1000));
        this.sessionTime.hh = pad(hours);
        this.sessionTime.mm = pad(minutes)
        this.sessionTime.ss = pad(seconds); // PARA QUE?
      }, 1000)
    },
    initPeer() {
      console.log('init Peer');
      this.connection.peer = new Peer(null, this.connection.config);
      this.connection.peer.on('open', this.connOpen);
      this.connection.peer.on('connection', this.connUniqueLimit);
      this.connection.peer.on('disconnected', this.connDisconnected);
      this.connection.peer.on('close', this.connDestroyed);
      this.connection.peer.on('error', this.connError);
    },
    emptyIpArray() {
      if (this.arrayTempWrite.length > 0) {
        const item = this.arrayTempWrite[0];
        this.IPmsgActions(item);
        if ((this.pauseIP === false) || (this.skippauseIPinstant === true)) {
          if ((this.info.b.test(item)) && (!this.info.c.test(item))) {
            this.pauseIP = true;
            clearTimeout(this.resetPause);
            this.resetPause = setTimeout(() => {
              this.pauseIP = false;
            }, 5500);
            this.IPActionGUI = this.dinf.b;
          } else {
            this.pauseIP = false;
          }
          if ((this.info.d.test(item)) && (this.skippauseIPinstant === false)) {
            this.pauseIP = true;
            this.pauseIPinstant = true;
            clearTimeout(this.resetPause2);
            this.resetPause2 = setTimeout(() => {
              this.pauseIP = false;
              this.pauseIPinstant = false;
            }, 5500);
            this.CANActionGUI = this.dinf.c;
            this.skippauseIPinstant = false;
          }
          if (this.pauseIPinstant === false) {
            if (!this.info.g.test(item)) {
              this.skippauseIPinstant = false;
            }
            this.flashBlockCounterCheck(item);
            this.createArrayLastFlashBlock(item);
            this.arrayTempWrite.shift();
            if (this.arrayTempWrite.length > 0) {
              this.TempArraySize = this.arrayTempWrite.length;
              this.emptyIpArray();
            } else {
              setTimeout(this.emptyIpArray, 5);
            }
          } else {
            setTimeout(this.emptyIpArray, 5);
          }
        } else {
          setTimeout(this.emptyIpArray, 5);
        }
      } else {
        setTimeout(this.emptyIpArray, 5);
      }
    },
    getTime(input) {
      const hours = Math.floor(input / (60 * 60));
      const minutesDivisor = input % (60 * 60);
      const minutes = Math.floor(minutesDivisor / 60);
      const secondsDivisor = minutesDivisor % 60;
      const seconds = Math.ceil(secondsDivisor);
      return {
        hours,
        minutes,
        seconds
      };
    },
    addZero(t) {
      if (t < 10) t = "0" + t;
      return t;
    },
    isAbv(value) {
        return value && value.buffer instanceof ArrayBuffer && value.byteLength !== undefined;
    },
    inputData(data) {
      let self = this;
      // console.log("Data recieved", data);
      switch (data) {
        case 'Go':
          console.log('Comando Go: ', data);
          break;
        default:
          // console.log('Default: ', data);
          try {
            let dataServer = JSON.parse(data);
            if(Array.isArray(dataServer)) {
              // console.log('isArray');
              dataServer.forEach((IPMessageGUItemp) => { self.actionInput(IPMessageGUItemp); });
            }
            else self.actionInput(dataServer);
          }
          catch (e) {
            self.actionInput(data);
          }
          break;
      };
    },
    actionInput(input) {
      console.log('actionInput:', input);
      let dataServer = input.split(/[\s,\r,\n,x,X]/);
      dataServer.forEach((IPMessageGUItemp)=>{
        // if (/^[\],:{}\s]*$/.test(IPMessageGUItemp.replace(/\\["\\\/bfnrtu]/g, '@').
        //   replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        //   replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        if (IPMessageGUItemp) {
          console.log('IPMessageGUItemp',IPMessageGUItemp);
          this.txSerialClient(IPMessageGUItemp);
          if (IPMessageGUItemp.slice(4, 5) !== "2" && IPMessageGUItemp.slice(4, 5) !== "9") {
            this.IPMessageGUI = IPMessageGUItemp;
            this.IPCounterGUI = this.IPCounterGUI + dataServer.length;
          }
          this.arrayTempWrite = this.arrayTempWrite.concat(dataServer);
          if (this.arrayTempWrite.length > 0) this.TempArraySize = this.arrayTempWrite.length;
        }
      });
    },
    connOpen(id) {
      let self = this;
      if (self.connection.peer.id === null) {
        console.log('Received null id from peer open');
        self.connection.peer.id = self.connection.lastPeerId;
      } else {
        self.connection.lastPeerId = self.connection.peer.id;
      }
      console.log('ID: ' + self.connection.peer.id);
      self.connection.recvId = self.connection.peer.id;
      self.connection.status = "awaiting";

      api.put('/records/users/'+self.me.id, {
        peer_id: self.connection.peer.id
      })
      .then((r)=>{
        console.log(r);
        self.me.peer_id = self.connection.peer.id;
      })
      .catch(console.log);
    },
    connUniqueLimit(c) {
      if (this.connection.conn && this.connection.conn.open) {
        c.on('open', function() {
          c.send("client:busy");
          setTimeout(function() { c.close(); }, 500);
        });
        return;
      }
      this.connection.conn = c;
      // console.log("Connected to: " + this.connection.conn.peer);
      this.connection.peerId = this.connection.conn.peer;
      this.connection.status = "connected";
      this.ready();
    },
    connClosePeer() {
      this.connection.status = "reset-awaiting";
      this.connection.conn = null;
      this.connection.peerId = '';
    },
    connDisconnected() {
      this.connection.status = "lost";
      // console.log('Connection lost. Please reconnect');
      // Solución alternativa para peer.reconnect eliminando la identificación anterior
      this.connection.peer.id = this.connection.lastPeerId;
      this.connection.peer._lastServerId = this.connection.lastPeerId;
      this.connection.peer.reconnect();
    },
    connDestroyed() {
      this.connection.conn = null;
      this.connection.status = "destroyed";
      this.connection.peerId = '';
      console.log('Connection destroyed');
    },
    connError(err) {
      console.log(err);
      alert('' + err);
    },
    ready() {
      // this.connection.conn.serialization = 'json'
      this.connection.conn.on('data', this.rxPeerClient);
      this.connection.conn.on('close', this.connClosePeer);
      this.commandInitSerial();
    },
    commandInitSerial() {
      console.log('commandInitSerial')
    },
    addMessage(origin, msg, type) {
      console.log('addMessage', origin, msg, type);
      return;
      // let now =-essage.innerHTML = "<br><span class=\"msg-time\">" + h + ":" + m + ":" + s + "</span>  -  " + msg + message.innerHTML;
    },
  },
}
const PageNotFound = { template: '<div>PageNotFound</div>' }

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
	{ path: '/', component: Home, name: 'Home' },
	{ path: '/login', component: Login, name: 'Login' },
	{ path: '/diagnostic', component: Diagnostic, name: 'Diagnostic' },
	{ path: '/:pathMatch(.*)*', name: 'NotFound', component: PageNotFound },
	// { path: '/*', component: PageNotFound },
]

// 3-5. To main.js
// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = VueRouter.createRouter({
	// base: '/',
	// 4. Provide the history implementation to use. We are using the hash history for simplicity here.
	history: VueRouter.createWebHistory(), // createWebHistory or createWebHashHistory
	routes, // short for `routes: routes`
});

router.beforeEach(async (to, from) => {
  console.log('beforeEach')
  // console.log('to', to)
  // console.log('from', from)
  // getLoginStatus((response)=>{
  //   console.log('response', response)
	// });
  let statusSession = getLoginStatus();
  console.log('statusSession', statusSession);
	if (statusSession !== "connected" && to.name !== 'Login') return { name: 'Login' }
  else if(statusSession == "connected" && to.name == 'Login') return { name: 'Home' }
  console.log('beforeEach--')
})

// 4. In app.js