/*
 * grunt-hash
 * https://github.com/jgallen23/grunt-hash
 *
 * Copyright (c) 2012 Greg Allen
 * Licensed under the MIT license.
 */
var crypto = require('crypto');

function unixify(path) {
  return path.split('\\').join('/');
}

function getHash(source, src) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(source, 'utf8');

  return md5sum.digest('hex');
}

module.exports = function(grunt) {
  var path = require('path');

  grunt.registerMultiTask('hash', 'Append a unique hash to tne end of a file for cache busting.', function() {
    var options = this.options({
      hashLength: 8,
      hashFunction: getHash,
      hashSeparator: '.',
      mapping: ''
    });
    var map = {};
    var mappingExt = path.extname(options.mapping);

    // If mapping file is a .json, read it and just override current modifications
    if (mappingExt === '.json' && grunt.file.exists(options.mapping)) {
      map = grunt.file.readJSON(options.mapping);
    }
    map.last = {};
    map.all || (map.all = {});

    this.files.forEach(function(file) {
      var src = file.src[0];
      if (!grunt.file.isFile(src)) return;

      var hash = options.hashFunction(grunt.file.read(src), src).substr(0, options.hashLength);
      var ext = path.extname(src);
      var basename = path.basename(src, ext);
      var outputFile = path.join(path.dirname(file.dest), basename + (hash ? options.hashSeparator + hash : '') + ext);

      grunt.file.copy(src, outputFile);
      grunt.log.writeln('Generated: ' + outputFile);

      // map
      map.last[unixify(src)] = hash;
      map.all[unixify(src)] = hash;
    });

    if (options.mapping) {
      var output = '';

      if (mappingExt === '.php') {
        output = "<?php return json_decode('" + JSON.stringify(map) + "'); ?>";
      } else {
        output = JSON.stringify(map, null, "  ");
      }

      grunt.file.write(options.mapping, output);
      grunt.log.writeln('Generated mapping: ' + options.mapping);
    }

  });

};
