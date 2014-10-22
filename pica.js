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
  process.emit('tts', {tosay:['ready', 'freddy', 4]});
}});
pica.pin17 = pica.mods.gpio.export(17, {direction:'out', ready:function() {
  process.emit('tts', {tosay:['ready', 'freddy', 17]});
}});
pica.pin22 = pica.mods.gpio.export(22, {direction:'in', ready:function() {
  process.emit('tts', {tosay:['ready', 'freddy', 22]});
}});

pica.pin4.on('change', function(val) {
  process.emit('tts', {tosay:['change', 4, val]});
});
pica.pin22.on('change', function(val) {
  process.emit('tts', {tosay:['change', 22, val]});
});

setInterval(function() {
  process.emit('tts', {tosay:['hear', 'ye', 4, pica.pin4.value]});
}, 5000);

setInterval(function() {
  process.emit('tts', {tosay:['hear', 'ye', 17, pica.pin17.value]});
  pica.pin17.set(!pica.pin17.value);
}, 17500);
