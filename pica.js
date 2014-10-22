#!/usr/bin/env node

var pica = {};

pica.mods = {};
pica.mods.gpio = require('gpio');
pica.mods.cp = require('child_process');
process.on('tts', function(spec) {
  var tts = pica.mods.cp.spawn('tts', spec.tosay);
  tts.stdout.pipe(process.stdout);
  tts.stderr.pipe(process.stderr);
});

pica.pin4 = pica.mods.gpio.export(4, {direction:'in', ready:function() {
  process.emit('tts', {tosay:['ready', 'freddy']});
}});

pica.pin4.on('change', function(val) {
  process.emit('tts', {tosay:['change', val]});
});
