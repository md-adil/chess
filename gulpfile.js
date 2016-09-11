var elixir = require('laravel-elixir');
require('laravel-elixir-browserify-official');

elixir.config.js.browserify.transformers.push({
    name: 'babelify',
    options: {
    	presets: ["es2015"]
    }
});
/*
elixir.config.js.browserify.transformers.push({
    name: 'deamdify'
});
*/
elixir.config.js.browserify.options.debug = true;

elixir(function(mix) {
    mix.browserify('main.js');
    mix.sass('main.scss');
});
