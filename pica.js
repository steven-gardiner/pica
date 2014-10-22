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

pica.pin4 = pica.mods.gpio.export(4, {direction:'in', interval: 200, ready:function() {
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
  //process.emit('tts', {tosay:['hear', 'ye', 4, pica.pin4.value]});
  console.error("NOW: %j", {value:pica.pin4.value, fresh: pica.ping4._get()});
}, 500);

setInterval(function() {
  return;
  process.emit('tts', {tosay:['hear', 'ye', 17, pica.pin17.value]});
  pica.pin17.set((1*!pica.pin17.value));
}, 5000);
