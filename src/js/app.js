const V_APP = "app-0.0.0.d";
/*
const v_style = Vue.createApp({
	render(createElement) {
		return createElement("style", this.$slots.default);
	},
});*/

const vstyle = {
	template: "<div></div>",
	render(createElement) {
		return createElement("style", this.$slots.default);
	},
}

// 5. Create and mount the root instance.
const app = Vue.createApp({
	components: {
		vstyle
	},
	data: () => ({
		definition: null,
	}),
	async created() {
		console.log("Creando app");;
		var self = this;
		api.get('/openapi').then(function (response) {
		  self.definition = response.data;
			console.log(response.data);
		}).catch(function (error) {
		  console.log(error);
		}).finally(()=>{
		});
	},
	mounted() {
		console.log("Montando app");
	},
});
// Make sure to _use_ the router instance to make the
// whole app router-aware.
app.use(router);