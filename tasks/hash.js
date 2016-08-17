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
	return crypto.createHash('md5')
		.update(source, 'binary')
		.digest('hex');
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
		var IgnoreFileCount = 0, GenerateFileCount = 0;

		this.files.forEach(function(file) {
			var src = file.src[0];
			if (!src || !grunt.file.isFile(src)) return;

			var hash = options.generate(grunt.file.read(src, {encoding: 'binary'}), src).substr(0, options.length);
			var ext = path.extname(src);
			var basename = path.basename(src, ext);
			var outputFile = path.join(path.dirname(file.dest), basename + (hash ? options.separator + hash : '') + ext);

			if (options.checkExists && grunt.file.exists(outputFile)) {
				grunt.verbose.writeln('Ignore: %s', outputFile);
				IgnoreFileCount++;
			} else {
				grunt.file.copy(src, outputFile);
				grunt.verbose.writeln('Generated: %s', outputFile);
				GenerateFileCount++;
			}

			// map
			var srcKey = path.relative(file.orig.cwd || '', src).replace(/\\/g, '/');
			map[srcKey] = hash;
		});

		grunt.log.writeln('Ignore file:'+(''+IgnoreFileCount).green+' Generated file:'+(''+GenerateFileCount).green);

	});
};
