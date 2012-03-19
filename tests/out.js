(function() {

function blueprints(id, data) {
	return blueprints._store[id](data, blueprints);
}

blueprints._store = { };
blueprints._store["test.html"] = function(data) {
	var fragment = document.createDocumentFragment();
	var elem0 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem0);
	var elem1 = document.createElement("h1");
	fragment.appendChild(elem1);
	var elem2 = document.createTextNode(unescape("Hello%20world"));
	elem1.appendChild(elem2);
	var elem3 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem3);
	var elem4 = document.createElement("ul");
	elem4.setAttribute("class", "list");
	fragment.appendChild(elem4);
	var elem5 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem5);
	var elem6 = document.createElement("li");
	elem4.appendChild(elem6);
	var elem7 = document.createTextNode(unescape("some"));
	elem6.appendChild(elem7);
	var elem8 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem8);
	var elem9 = document.createElement("li");
	elem4.appendChild(elem9);
	var elem10 = document.createTextNode(unescape("list"));
	elem9.appendChild(elem10);
	var elem11 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem11);
	var elem12 = document.createElement("li");
	elem4.appendChild(elem12);
	var elem13 = document.createTextNode(unescape("items"));
	elem12.appendChild(elem13);
	var elem14 = document.createTextNode(unescape("%0A"));
	elem4.appendChild(elem14);
	var elem15 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem15);	return fragment;
};


blueprints._store["namespace:test.html"] = function(data) {
	var fragment = document.createDocumentFragment();
	var elem0 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem0);
	var elem1 = document.createElement("h1");
	fragment.appendChild(elem1);
	var elem2 = document.createTextNode(unescape("Hello%20world"));
	elem1.appendChild(elem2);
	var elem3 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem3);
	var elem4 = document.createElement("ul");
	elem4.setAttribute("class", "list");
	fragment.appendChild(elem4);
	var elem5 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem5);
	var elem6 = document.createElement("li");
	elem4.appendChild(elem6);
	var elem7 = document.createTextNode(unescape("some"));
	elem6.appendChild(elem7);
	var elem8 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem8);
	var elem9 = document.createElement("li");
	elem4.appendChild(elem9);
	var elem10 = document.createTextNode(unescape("list"));
	elem9.appendChild(elem10);
	var elem11 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem11);
	var elem12 = document.createElement("li");
	elem4.appendChild(elem12);
	var elem13 = document.createTextNode(unescape("items"));
	elem12.appendChild(elem13);
	var elem14 = document.createTextNode(unescape("%0A"));
	elem4.appendChild(elem14);
	var elem15 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem15);	return fragment;
};


blueprints._store["namespace:another:test.html"] = function(data) {
	var fragment = document.createDocumentFragment();
	var elem0 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem0);
	var elem1 = document.createElement("h1");
	fragment.appendChild(elem1);
	var elem2 = document.createTextNode(unescape("Hello%20world"));
	elem1.appendChild(elem2);
	var elem3 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem3);
	var elem4 = document.createElement("ul");
	elem4.setAttribute("class", "list");
	fragment.appendChild(elem4);
	var elem5 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem5);
	var elem6 = document.createElement("li");
	elem4.appendChild(elem6);
	var elem7 = document.createTextNode(unescape("some"));
	elem6.appendChild(elem7);
	var elem8 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem8);
	var elem9 = document.createElement("li");
	elem4.appendChild(elem9);
	var elem10 = document.createTextNode(unescape("list"));
	elem9.appendChild(elem10);
	var elem11 = document.createTextNode(unescape("%0A%20%20%20"));
	elem4.appendChild(elem11);
	var elem12 = document.createElement("li");
	elem4.appendChild(elem12);
	var elem13 = document.createTextNode(unescape("items"));
	elem12.appendChild(elem13);
	var elem14 = document.createTextNode(unescape("%0A"));
	elem4.appendChild(elem14);
	var elem15 = document.createTextNode(unescape("%0A"));
	fragment.appendChild(elem15);	return fragment;
};
window.blueprints = blueprints;
})();