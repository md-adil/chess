window.define = function(args, caller) {
	if(typeof args == 'string') {
		caller.call(undefined, require(args));
		return;
	}
	var modules = [];
	args.forEach(function(module, i) {
		modules.push(require(module));
	});
	caller.apply(undefined, modules);
}

window.define.amd = true;
