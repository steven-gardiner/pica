#!/usr/bin/env node

module.exports = function() {
  "use strict";

  var pica = {};

  pica.mods = {};
  pica.mods.cp = require('child_process');
  pica.mods.http = require('http');
  pica.mods.nomnom = require('nomnom');
  pica.mods.keypad = require('./keypad.js');
  pica.mods.parseurl = require('url').parse;
  
  pica.commandset = {
    "2": ["weather"],
    "3": ["suntime"],
    "9": ["gross"],
  };
  
  pica.Pica = function(spec) {
    var self = {};

    spec = spec || {};
    self.eq = spec.eq || process;   
    
    self.parser = pica.mods.nomnom();

    self.parser.nocommand({});
    for (var key in pica.commandset) {
      self.parser.command(key, {});
      //console.error("ADDCMD: %s", key);
    }

    self.organ = require("organ").listen(spec);
    
    self.eq.on('pica_parse', function(parseSpec) {
      var doSpec = Object.create(parseSpec);
      doSpec.args = parseSpec.args || process.argv.slice(2);
      doSpec.args = doSpec.args.map(function(x) { return x.toString(); });
      doSpec.opts = self.parser.parse(doSpec.args);
        console.error("PRADO: %j", doSpec);
      if (doSpec.opts["_"].length > 0) {
        doSpec.picaname = doSpec.opts["_"][0];
        doSpec.cmd = pica.commandset[doSpec.picaname];
        console.error("DO: %j", doSpec);

        self.eq.emit('organ_parse', doSpec);
      } else {
	self.eq.emit('pica_serve', doSpec);
      }
    });

    self.eq.on('keypress', function(spec) {
      console.error("PICAKEY: %j", spec);
    });
    
    self.serve = function(req, resp) {
      var spec = {};
      spec.url = pica.mods.parseurl(req.url);
      spec.path = spec.url.path.split("/");
      

      if ((spec.path.length !== 2) || (spec.path[0] !== '')) {
	resp.writeHead(404, {"Content-Type": "text/plain"});
	resp.end();
	return;
      }

      spec.cmdname = spec.path[1];
      console.error("SERVE %j", spec);

      self.eq.emit('pica_parse', {args: [spec.cmdname], output:resp});
    };
    
    self.eq.on('pica_serve', function(serveSpec) {
      self.keypad = new pica.mods.keypad.Keypad(serveSpec);
      self.http = pica.mods.http.createServer(self.serve).listen(3142);
    });
    
    return self;
  };

  pica.listen = function(emitter) {
    return new pica.Pica({eq:emitter});
  };

  return pica;
}();

var pica = module.exports;

if (module.parent) {
} else {
  var p = pica.listen(process);
  setTimeout(function() {
      process.emit("pica_parse", {output:process.stdout, args:process.argv.slice(2)});
    }, 1000);
}
