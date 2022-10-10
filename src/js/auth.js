const V_A = "auth-0.0.0.a";

const isAuthenticated = () => {
	getLoginStatus((response)=>{
		// console.log('isAuthenticated:getLoginStatus', response);
		return (response.status == "not_authorized");
	});
};

const getLoginStatus = () => {
  let status = "unknown";
  xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET", "/api/me", false);
  xmlhttp.send();
  return (xmlhttp.status == 200) ? "connected" : "not_authorized";
}

const getUserData = () => {
	let status = "unknown";
	xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET", "/api/me", false);
	xmlhttp.send();
	return (xmlhttp.status == 200) ? JSON.parse(xmlhttp.responseText) : null;
}