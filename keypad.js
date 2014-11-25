var kp = {};

kp.mods = {};
kp.mods.cp = require('child_process');
kp.mods.gpio = require('gpio');

kp.Keypad = function(spec) {
  var self = {};

  self.spec = spec || {};
  self.eq = self.spec.eq || process;

  self.eq.on('tts', function(spec) {
    console.error("SAY: %j", spec.tosay);
    var tts = kp.mods.cp.spawn('tts', spec.tosay);
    tts.stdout.pipe(process.stdout);
    tts.stderr.pipe(process.stderr);
  });
  self.eq.on('keypress', function(spec) {
    console.error("KEY! %j", spec);
  });
  
  self.spec.gpiopins = self.spec.gpiopins || [5,6,7,8,19,20,21,26];
  self.spec.layout = self.spec.layout || [
					  [1,2,3,'A'],
					  [4,5,6,'B'],
					  [7,8,9,'C'],
					  ['*',0,'#','D'],		   
					  ];

  
  self.spec.rowpins = self.spec.rowpins || self.spec.gpiopins.slice(0,4);
  self.spec.colpins = self.spec.colpins || self.spec.gpiopins.slice(4);
  
  self.rowpins = [];
  self.colpins = [];

  self.spec.colpins.forEach(function(colpin) {
    var pinspec = Object.create(self.spec);
    pinspec.pinno = colpin;
    pinspec.pin = kp.mods.gpio.export(colpin, {
      direction:'in',
      interval: 50,
      ready: function() {	
        setTimeout(function() {
	  //self.eq.emit('tts', {tosay:['ready','freddy','in',colpin, pinspec.pin.value]});
        }, 1000);
    }});
    self.colpins.push(pinspec);
    pinspec.colno = -1 + self.colpins.length;
    pinspec.probe = function() {
      pinspec.rowno++;
      if (pinspec.rowno > self.rowpins.length) {
	console.error("UNID!");
	return;
      }
      var rowpin = self.rowpins[pinspec.rowno];
      rowpin.pin.set(0, function() {
	pinspec.pin.value = -1;
	pinspec.pin._get(function(val) {
	    //console.error("ID: %j", {rowno: rowpin.rowno, colno: pinspec.colno, val:val});
	  if (val) {
	    setTimeout(pinspec.probe, 0);
	  } else {
	    //console.error("ID! %j", {rowno: rowpin.rowno, colno: pinspec.colno, val:val});
	    self.eq.emit('keypress', {
	      rowno: rowpin.rowno,
	      colno: pinspec.colno,
	      key: self.spec.layout[rowpin.rowno][pinspec.colno]
	    });
	    pinspec.ignore = false;
	  }
	  rowpin.pin.set(1);	  
	});
      });
    };
    pinspec.pin.on('change', function(val) {
      if (pinspec.ignore) { return; }
      if (val) {
	pinspec.ignore = true;
	pinspec.done = false;
	pinspec.rowno = -1;
	setTimeout(pinspec.probe, 0);
	return;
	self.rowpins.forEach(function(rowpin) {
	  rowpin.pin.set(0, function() {
	    pinspec.pin._get(function(val) {
	      console.error("ID: %j", {rowno: rowpin.rowno, colno: pinspec.colno});
    	      rowpin.pin.set(1, function() { pinspec.ignore = false; });	      
	    });
	  });	  
	});
      }
      //self.eq.emit('tts', {tosay:['delta',pinspec.pinno,val,'=',pinspec.colno]});
    });
  });
  self.spec.rowpins.forEach(function(rowpin) {
    var pinspec = Object.create(self.spec);
    pinspec.pinno = rowpin;
    pinspec.logValue = function() {
      console.error("PIN! %j", {pinno:pinspec.pinno, value: pinspec.pin.value});
    };
    pinspec.pin = kp.mods.gpio.export(rowpin, {direction:'out', ready: function() {
      setTimeout(function() { pinspec.pin.set(pinspec.logValue); }, 500);
      setTimeout(function() {
	//self.eq.emit('tts', {tosay:['ready','freddy','out',pinspec.pinno, pinspec.pin.value]});
      }, 1000);
    }});
    self.rowpins.push(pinspec);
    pinspec.rowno = -1 + self.rowpins.length;

    //setInterval(pinspec.logValue, 3000);
  });
  
  return self;
};

module.exports = kp;

if (module.parent) {
} else {
  kp.keypad0 = new kp.Keypad();
}
