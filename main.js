try {
	if(V_API == undefined) throw "api.js no encontrado.";
	if(V_A == undefined) throw "auth.js no encontrado.";
	if(V_R == undefined) throw "router.js no encontrado.";
	if(V_APP == undefined) throw "app.js no encontrado.";
	console.log(V_API);
	console.log(V_A);
	console.log(V_R);
	console.log(V_APP);

			

	// Vue.component("v-style", {
	// render(createElement) {
	// 	return createElement("style", this.$slots.default);
	// },
	// });


	
	app.mount('#app');
	console.log("main-0.0.0.a");
} catch (e) {
	console.log("Error app.js", e);
	console.error(e);
}