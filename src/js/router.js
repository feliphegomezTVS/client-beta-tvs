// import * from './views/diagnostic/diagnostic.js';

// function dynamicallyLoadScript(url) {
//   var script = document.createElement("script");  // create a script DOM node
//   script.src = url;  // set its src to the provided URL
//   document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
// }

// dynamicallyLoadScript('/views/diagnostic/diagnostic.js');

const V_R = "router-0.0.0.a";

// 1. Define route components.
// These can be imported from other files
const Home       = {
  template: require("/views/home/index.html"),
  created() {
    // router.push({
    //   name: 'Diagnostic'
    // })
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

const PageNotFound = { template: '<div>PageNotFound</div>' }

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
	{ path: '/', component: Home, name: 'Home' },
	{ path: '/login', component: Login, name: 'Login' },
	
  { path: '/client', component: Client, name: 'Client' },
	{ path: '/supplier', component: Supplier, name: 'Supplier' },

	// { path: '/test/peerjs/receive', component: TestPeerjsReceive, name: 'Test-Peerjs-Receive' },
	// { path: '/test/peerjs/send', component: TestPeerjsSend, name: 'Test-Peerjs-Send' },
	// { path: '/test/peerjs-serial/receive', component: TestPeerjsSerialReceive, name: 'Test-Peerjs-Serial-Receive' },
	// { path: '/test/peerjs-serial/send', component: TestPeerjsSerialSend, name: 'Test-Peerjs-Serial-Send' },
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

router.beforeEach(async (to, from, next) => {
  console.log('beforeEach');
  next();
  return;
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