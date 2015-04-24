module.exports = function(grunt) {

	grunt.registerMultiTask('hashmap', function() {
		var dest = this.data.dest;
		var options = this.options({clean: false});

		if (grunt.hash) {
			var newMap = grunt.hash.map;
			if (options.clean === true) delete grunt.hash.map;

			if (newMap && dest) {
				var map = grunt.file.exists(dest) && grunt.file.readJSON(dest);
				map = grunt.util._.extend(map || {}, newMap);
				grunt.file.write(dest, JSON.stringify(map));

				grunt.log.writeln('write hash map success "%s"', dest);
				return;
			}
		}

		grunt.log.writeln('ignore write hash map "%s"', dest);
	});
};
