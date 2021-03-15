var fs = require("fs"),
    uglify = require("uglify-js");

var filename = process.argv[2];
var code = fs.readFileSync(filename, "utf8");
var options = {
    toplevel: true,
    compress: {
        global_defs: {
            "@console.log": "alert"
        },
        passes: 2
    },
    output: {
        beautify: false,
        preamble: "/* uglified */"
    }
};
var output = uglify.minify(code, options); 

console.log(output);

