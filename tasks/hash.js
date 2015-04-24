/*
 * grunt-hash
 * https://github.com/jgallen23/grunt-hash
 *
 * Copyright (c) 2012 Greg Allen
 * Licensed under the MIT license.
 */
var crypto = require('crypto');
var path = require('path');


function getHash(source, src) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(source, 'utf8');

	return md5sum.digest('hex');
}

module.exports = function(grunt) {

	grunt.registerMultiTask('ckhash', 'Append a unique hash to tne end of a file for cache busting.', function() {
		var options = this.options({
			length: 8,
			generate: getHash,
			checkExists: false,
			separator: '.'
		});

		grunt.hash || (grunt.hash = {});
		var map = grunt.hash.map || (grunt.hash.map = {});

		this.files.forEach(function(file) {
			var src = file.src[0];
			if (!src || !grunt.file.isFile(src)) return;

			var hash = options.generate(grunt.file.read(src), src).substr(0, options.length);
			var ext = path.extname(src);
			var basename = path.basename(src, ext);
			var outputFile = path.join(path.dirname(file.dest), basename + (hash ? options.separator + hash : '') + ext);

			if (options.checkExists && grunt.file.exists(outputFile)) {
				grunt.log.writeln('Ignore: %s', outputFile);
			} else {
				grunt.file.copy(src, outputFile);
				grunt.log.writeln('Generated: %s', outputFile);
			}

			// map
			var srcKey = path.relative(file.orig.cwd || '', src).replace(/\\/g, '/');
			map[srcKey] = hash;
		});

	});
};
