#!/usr/bin/env node

var pica = {};

pica.mods = {};
pica.mods.gpio = require('gpio');
pica.mods.cp = require('child_process');
process.on('tts', function(spec) {
  console.error("SAY: %j", spec.tosay);
  var tts = pica.mods.cp.spawn('tts', spec.tosay);
  tts.stdout.pipe(process.stdout);
  tts.stderr.pipe(process.stderr);
});

pica.pin16 = pica.mods.gpio.export(16, {direction:'out', ready:function() {
  process.emit('tts', {tosay:['ready', 'freddy', 16]});
  pica.pin16.set();
}});
pica.pin21 = pica.mods.gpio.export(21, {direction:'in', ready:function() {
  process.emit('tts', {tosay:['ready', 'freddy', 21]});
}});

pica.pin21.on('change', function(val) {
  process.emit('tts', {tosay:['change', 21, val]});
});

pica.pin17 = pica.mods.gpio.export(17, {direction:'out', ready:function() {
  process.emit('tts', {tosay:['ready', 'freddy', 17]});
  pica.pin17.set();
}});
pica.pin22 = pica.mods.gpio.export(22, {direction:'in', ready:function() {
  process.emit('tts', {tosay:['ready', 'freddy', 22]});
}});

pica.pin22.on('change', function(val) {
  process.emit('tts', {tosay:['change', 22, val]});
});

