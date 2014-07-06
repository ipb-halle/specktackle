!function(){
    var st = {version: "0.0.1"};

/**
 * util stub.
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 */
st.util = {};

/**
 * Simple hash-based object cache.
 *
 * Adapted from:
 * http://markdaggett.com/blog/2012/03/28/client-side-request-caching-with-javascript/
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.cache
 * @returns object literal with a add, get, getKey, and exists property
 * 
 * @example
 * var cache = st.util.cache();
 * var cacheKey = cache.getKey(myObject);
 * if (cache.exists(cacheKey)) {
 *  var cachedObject = cache.get(cacheKey);
 * } else {
 *  var cachedObject = myObject;
 *  cache.add(cacheKey, cachedObject);
 * }
 */
st.util.cache = function () {
    var cache = {},
    keys = [],

    /**
     * Returns an element's index in an array or -1.
     * 
     * @method indexOf
     * @param {object[]} arr - element array
     * @param {object} obj - element
     * @returns the elemen'ts index or -1
     */
    indexOf = function (arr, obj) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            if (arr[i] === obj) {
                return i;
            }
        }
        return -1;
    },

    /**
     * Returns a string representation of any input.
     * 
     * @method serialize
     * @param {object} opts - input to stringify
     * @returns the stringified input object
     */
    serialize = function (opts) {
        if ((opts).toString() === "[object Object]") {
            return $.param(opts);
        } else {
            return (opts).toString();
        }
    },

     /**
     * Removes an element from the cache via its key.
     * 
     * @method remove
     * @param {string} key - the element's key
     */
    remove = function (key) {
        var t;
        if ((t = indexOf(keys, key)) > -1) {
            keys.splice(t, 1);
            delete cache[key];
        }
    },

    /**
     * Removes all elements from the cache.
     * 
     * @method removeAll
     */
    removeAll = function () {
        cache = {};
        keys = [];
    },

    /**
     * Adds an element to the cache.
     * 
     * @method add
     * @param {string} key - the element's key
     * @param {object} obj - the element to be added
     */
    add = function (key, obj) {
        if (keys.indexOf(key) === -1) {
            keys.push(key);
        }
        cache[key] = obj;
    },

    /**
     * Checks whether a key has already been added to the cache.
     * 
     * @method exists
     * @param {string} key - the element's key
     * @returns boolean if the key exists in the cache
     */
    exists = function (key) {
        return cache.hasOwnProperty(key);
    },

    /**
     * Removes a selected or all elements from the cache.
     * 
     * @method purge
     * @returns the purged cache array
     */
    purge = function () {
        if (arguments.length > 0) {
            remove(arguments[0]);
        } else {
            removeAll();
        }
        return $.extend(true, {}, cache);
    },

    /**
     * Returns matching keys from the cache in an array.
     * 
     * @method searchKeys
     * @param {string} str - the query key (string)
     * @returns the array of matching keys
     */
    searchKeys = function (str) {
        var keys = [];
        var rStr;
        rStr = new RegExp('\\b' + str + '\\b', 'i');
        $.each(keys, function (i, e) {
            if (e.match(rStr)) {
                keys.push(e);
            }
        });
        return keys;
    },

    /**
     * Returns the element for a given key.
     * 
     * @method get
     * @param {string} key - the element's key
     * @returns the key's cached object
     */
    get = function (key) {
        var val;
        if (cache[key] !== undefined) {
            if ((cache[key]).toString() === "[object Object]") {
                val = $.extend(true, {}, cache[key]);
            } else {
                val = cache[key];
            }
        }
        return val;
    },

    /**
     * Returns the string representation of the element.
     * 
     * @method getKey
     * @param {object} opts - the element to be stringified
     * @returns the string representation fo the element
     */
    getKey = function (opts) {
        return serialize(opts);
    },

    /**
     * Returns all keys stored in the cache.
     * 
     * @method getKeys
     * @returns the array of keys
     */
    getKeys = function () {
        return keys;
    };

    // reference visible (public) functions as properties
    return {
        add: add,
        get: get,
        getKey: getKey,
        exists: exists,
    };
};

/**
 * Color object that consistently returns one of six different colors 
 * for a given identifier.
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.colors
 */
st.util.colors = function () {
    var colors = {
        0: "red",
        1: "blue",
        2: "green",
        3: "orange",
        4: "yellow",
        5: "black"
    },

    index = 0,      // running index
    mapping = {},   // stores the id - color mappings

    /**
     * Gets the color for the identifier or - if id is unassigned - returns
     * a new color from the color hash.
     * 
     * @method get
     * @param {int} id - the identifier
     * @returns the color string for the identifier
     */
    get = function (id) {
        if (mapping[id]) {
            return mapping[id];
        }
        mapping[id] = next();
        return mapping[id];
    },

    /**
     * Returns the color string based on the running index. Resets the
     * index if it exceeds the color hash.
     * 
     * @method next
     * @returns the color string
     */
    next = function () {
        if (index === Object.keys(colors).length) {
            index = 0;
        }
        return colors[index++];
    };

    // reference visible (public) functions as properties
    return {
        get: get
    };
};

/**
 * Simple hash code generator for strings.
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.hashcode
 * @param {string} str - a string to be hashed
 * @returns the hashed string
 */
st.util.hashcode = function (str) {
    var hash = 0, i, chr, len;
    if (str.length == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // convert to 32bit integer
    }
    return hash;
};

/**
 * Helper function to resolve the order of domain extrema based on the 
 * direction of the scale, e.g. for inverted axes the min and max values 
 * need to be inverted.
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.domain
 * @param {object} scale - a d3 scale
 * @param {number[]} array - an array of length two with a min/max pair
 * @returns the sorted array
 */
st.util.domain = function (scale, array) {
    var domain = scale.domain();
    if (domain[0] > domain[1]) {
        return [
            array[1],
            array[0]
        ];
    }
    return [
        array[0],
        array[1]
    ];
};

/**
 * SVG molecule renderer for MDL Molfiles. The header block and 
 * connection table are loosely parsed according to Elsevier MDL's V2000
 * format.
 * 
 * The molecule title is taken from the header block.
 * 
 * The two dimensional coordinates, symbol, charge, and mass difference
 * information is extracted from the atom block. 
 * 
 * Connectivity and stereo information is extracted from the bond block.
 * Single, double, and triple bonds as well as symbols for wedge, hash,
 * and wiggly bonds are supported.
 * 
 * The renderer uses the CPK coloring convention.
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.mol2svg
 * @returns object literal with a draw and init property (functions)
 * 
 * @example
 * var instance = st.util.mol2svg(640, 480);
 * var url = 'http://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/30214/SDF';
 * instance.draw(url, '#myElement');
 *
 * Initializes the renderer setting the width and height of 
 * the viewport. The width and height should include a margin 
 * of 10 px, which is applied all around by default.
 * 
 * @param {number} width - width of the viewport
 * @param {number} height - height of the viewport
 */
st.util.mol2svg = function (width, height) {

    var w = width || 200,   // width of the panel
        h = height || 200,  // height of the panel
        x = null,           // linear d3 x scale function
        y = null,           // linear d3 y scale function
        avgL = 0,   // scaled average bond length (required for font size scaling)
        cache = st.util.cache();

    /**
     * Loads the molfile data asynchronously, parses the file and 
     * creates the SVG. The SVG is appended to the element of the 
     * given identifier.    
     * 
     * @method draw
     * @param {string} molfile - URL of the MDL molfile (REST web service)
     * @param {string} id - id of the element 
     */
    var draw = function (molfile, id) {
        $(id).empty();
        var el = d3.select(id);
        var cacheKey = cache.getKey(molfile);
        if (cache.exists(cacheKey)) {
            var text = cache.get(cacheKey);
            parse(text, el);
        } else {
            d3.text(molfile, 'text/plain', function (error, text) {
                if (error) {
                    console.log('Invalid molfile url error ' + error);
                } else {
                    cache.add(cacheKey, text);
                    parse(text, el);
                }
            });
        }
    };

    /**
     * Parses the molfile, extracting the molecule title from the 
     * header block, two dimensional coordinates, symbol, charge, 
     * and mass difference information extracted from the atom block,
     * connectivity and stereo information from the bond block.
     * 
     * @method parse
     * @param {string} molfile - URL of the MDL molfile (REST web service)
     * @param {string} id - id of the element
     */
    var parse = function (molfile, el) {
        var lines = molfile.split(/\r\n|\n/),
            // title = lines[1],
            counter = lines[3].match(/\d+/g),
            nAtoms = parseFloat(counter[0]),
            nBonds = parseFloat(counter[1]);

        var atoms = atomBlock(lines, nAtoms),           // get all atoms
            bonds = bondBlock(lines, nAtoms, nBonds);   // get all bonds
        propsBlock(lines, atoms, nAtoms + nBonds);      // get properties

        var graph = initSvg(atoms, el);                 // layout SVG
        drawBonds(atoms, bonds, graph);
        drawAtoms(atoms, avgL, graph);
    };

    /**
     * Parses the atom block line by line.
     * 
     * @method atomBlock
     * @param {string[]} lines - molfile line array
     * @param {number} nAtoms - total number of atoms
     * @returns array of atom objects
     */
    var atomBlock = function (lines, nAtoms) {
        var atoms = [];
        var offset = 4; // the first three lines belong to the header block
        for (var i = offset; i < nAtoms + offset; i++) {
            var atom = lines[i].match(/-*\d+\.\d+|\w+/g);
            atoms.push({
                x: parseFloat(atom[0]),
                y: parseFloat(atom[1]),
                symbol: atom[3],
                mass: 0,    // deprecated
                charge: 0   // deprecated
            });
        }
        return atoms;
    };

    /**
     * Parses the bond block line by line.
     * 
     * @method bondBlock
     * @param {string[]} lines - molfile line array
     * @param {number} nAtoms - total number of atoms
     * @param {number} nBonds - total number of bonds
     * @returns array of bond objects
     */
    var bondBlock = function (lines, nAtoms, nBonds) {
        var bonds = [];
        var offset = 4; // the first three lines belong to the header block
        for (var j = nAtoms + offset; j < nAtoms + nBonds + offset; j++) {
            var bond = lines[j].match(/\d+/g);
            bonds.push({
                a1: parseInt(bond[0]) - 1,  // adjust to '0', atom counter starts at '1'
                a2: parseInt(bond[1]) - 1,
                order: parseInt(bond[2]),   // values 1, 2, 3
                stereo: parseInt(bond[3])   // values 0 (plain),1 (wedge),4 (wiggly),6 (hash)
            });
        }
        return bonds;
    };

    /**
     * Parses the properties block line by line.
     * 
     * @method propsBlock
     * @param {string[]} lines - molfile line array
     * @param {object[]} atoms - array of atom objects
     * @param {number} nAtomsBonds - total number of atoms and bonds
     */
    var propsBlock = function (lines, atoms, nAtomsBonds) {
        var offset = 4; // the first three lines belong to the header block
        for (var k = nAtomsBonds + offset; k < lines.length; k++) {
            if (lines[k].indexOf('M  ISO') !== -1) {
                var props = lines[k].match(/-*\d+/g);
                for (var l = 0, m = 1; l < props[0]; l++, m += 2) {
                    atoms[props[m] - 1].mass = parseInt(props[m + 1], 10);
                }
            } else if (lines[k].indexOf('M  CHG') !== -1) {
                var props = lines[k].match(/-*\d+/g);
                for (var l = 0, m = 1; l < props[0]; l++, m += 2) {
                    atoms[props[m] - 1].charge = parseInt(props[m + 1], 10);
                }
            }
        }
    };

    /**
     * Initializes the viewport and appends it to the element identified
     * by the given identifier. The linear d3 x- and y-scales are set 
     * to translate from the viewport coordinates to the mol coordinates.
     * 
     * @method initSvg
     * @param {object[]} atoms - array of atom objects
     * @param {string} id - id of the element
     * @returns initialized SVG element
     */
    var initSvg = function (atoms, el) {
        var xExtrema = d3.extent(atoms, function (atom) { // x minimum and maximum
            return atom.x;
        });
        var yExtrema = d3.extent(atoms, function (atom) { // y minimum and maximum
            return atom.y;
        });

        // dimensions of molecule graph
        var m = [10, 10, 10, 10];   // margins
        var wp = w - m[1] - m[3];   // width
        var hp = h - m[0] - m[2];   // height

        // maintain aspect ratio: divide/multiply height/width by the ratio (r)
        var r = (xExtrema[1] - xExtrema[0]) / (yExtrema[1] - yExtrema[0]);
        if (r > 1) {
            hp /= r;
        } else {
            wp *= r;
        }

        // X scale will fit all values within pixels 0-w
        x = d3.scale.linear().domain([xExtrema[0], xExtrema[1]]).range([0, wp]);
        // Y scale will fit all values within pixels h-0
        y = d3.scale.linear().domain([yExtrema[0], yExtrema[1]]).range([hp, 0]);

        // add an SVG element with the desired dimensions and margin
        // and center the drawing area
        var graph = el.append('svg:svg')
            .attr('width', wp + m[1] + m[3])
            .attr('height', hp + m[0] + m[2])
            .append('svg:g')
            .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')');

        return graph;
    };

    /**
     * Draws the bonds onto the SVG element. Note that the bonds are drawn
     * first before anything else is added.
     * 
     * @method drawBonds
     * @param {object[]} atoms - array of atom objects
     * @param {object[]} bonds - array of bond objects
     * @param {object} graph - SVG element
     */
    var drawBonds = function (atoms, bonds, graph) {
        for (var i = 0; i < bonds.length; i++) {
            var a1 = atoms[bonds[i].a1],
                a2 = atoms[bonds[i].a2];

            // apply backing by calculating the unit vector and
            // subsequent scaling: shortens the drawn bond
            var dox = a2.x - a1.x,
                doy = a2.y - a1.y,
                l = Math.sqrt(dox * dox + doy * doy),
                dx = (dox / l) * (0.2),
                dy = (doy / l) * (0.2);

            // get adjusted x and y coordinates
            var x1 = a1.x + dx,
                y1 = a1.y + dy,
                x2 = a2.x - dx,
                y2 = a2.y - dy;

            // update average bond length for font scaling
            avgL += distance(x(x1), y(y1), x(x2), y(y2));

            var off,    // offset factor for stereo bonds
                xOff,   // total offset in x
                yOff,   // total offset in y
                xyData = []; // two dimensional data array
            if (bonds[i].order === 1) {                 // single bond
                if (bonds[i].stereo === 1) {            // single wedge bond
                    var length = distance(x1, y1, x2, y2);
                    off = 0.1;
                    xOff = off * (y2 - y1) / length;
                    yOff = off * (x1 - x2) / length;
                    xyData = [
                        [x1, y1],
                        [x2 + xOff, y2 + yOff],
                        [x2 - xOff, y2 - yOff]
                    ];
                    graph.append('svg:path').attr('d', wedgeBond(xyData));
                } else if (bonds[i].stereo === 6) {     // single hash bond
                    off = 0.2;
                    xOff = off * (y2 - y1) / l;
                    yOff = off * (x1 - x2) / l;
                    var dxx1 = x2 + xOff - x1,
                        dyy1 = y2 + yOff - y1,
                        dxx2 = x2 - xOff - x1,
                        dyy2 = y2 - yOff - y1;
                    for (var j = 0.05; j <= 1; j += 0.15) {
                        xyData.push(
                            [x1 + dxx1 * j, y1 + dyy1 * j],
                            [x1 + dxx2 * j, y1 + dyy2 * j]
                            );
                    }

                    graph.append('svg:path').attr('d', hashBond(xyData)).attr('stroke', 'black');
                } else if (bonds[i].stereo === 4) {     // single wiggly bond
                    off = 0.2;
                    xOff = off * (y2 - y1) / l;
                    yOff = off * (x1 - x2) / l;
                    var dxx1 = x2 + xOff - x1,
                        dyy1 = y2 + yOff - y1,
                        dxx2 = x2 - xOff - x1,
                        dyy2 = y2 - yOff - y1;
                    for (var j = 0.05; j <= 1; j += 0.1) {
                        if (xyData.length % 2 === 0) {
                            xyData.push(
                                [x1 + dxx1 * j, y1 + dyy1 * j]
                                );
                        } else {
                            xyData.push(
                                [x1 + dxx2 * j, y1 + dyy2 * j]
                                );
                        }
                    }

                    graph.append('svg:path').attr('d', wigglyBond(xyData))
                        .attr('fill', 'none')
                        .attr('stroke', 'black');
                } else {                                // single plain bond
                    xyData = [
                        [x1, y1], [x2, y2]
                    ];
                    graph.append('svg:path').attr('d', plainBond(xyData))
                        .attr('stroke-width', '2')
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-linejoin', 'round')
                        .attr('stroke', 'black');
                }
            } else if (bonds[i].order === 2) {          // double bond
                off = 0.1;
                xOff = off * (y2 - y1) / l;
                yOff = off * (x1 - x2) / l;
                xyData = [
                    [x1 + xOff, y1 + yOff], [x2 + xOff, y2 + yOff],
                    [x1 - xOff, y1 - yOff], [x2 - xOff, y2 - yOff]
                ];
                graph.append('svg:path').attr('d', plainBond(xyData))
                        .attr('stroke-width', '2')
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-linejoin', 'round')
                        .attr('stroke', 'black');
            } else if (bonds[i].order === 3) {          // triple bond
                off = 0.15;
                xOff = off * (y2 - y1) / l;
                yOff = off * (x1 - x2) / l;
                xyData = [
                    [x1, y1], [x2, y2],
                    [x1 + xOff, y1 + yOff], [x2 + xOff, y2 + yOff],
                    [x1 - xOff, y1 - yOff], [x2 - xOff, y2 - yOff]
                ];
                graph.append('svg:path').attr('d', plainBond(xyData))
                        .attr('stroke-width', '2')
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-linejoin', 'round')
                        .attr('stroke', 'black');
            }
        }
        avgL /= bonds.length; // get average bond length
    };

    /**
     * Draws the atoms onto the SVG element. Note that the atoms are drawn
     * onto the bonds.
     * 
     * @method drawAtoms
     * @param {object[]} atoms - array of atom objects
     * @param {number} avgL - average bond length
     * @param {object} graph - SVG element
     */
    var drawAtoms = function (atoms, avgL, graph) {
        for (var i = 0; i < atoms.length; i++) {
            var atom = atoms[i];
            var atomCol = d3.rgb(atomColor[atom.symbol]);
            var g = graph.append('svg:g').attr('transform', 'translate(' + x(atom.x) + ',' + y(atom.y) + ')');
            g.append('svg:circle')                          // draw a circle underneath the text
                .attr('r', Math.ceil(avgL / 3))             // hack: magic number for scaling
                .attr('fill', 'white')
                .attr('opacity', '1');
            g.append('text')                                // draw the text string
                .attr('dy', Math.ceil(avgL / 4.5))          // hack: magic number for scaling
                .attr('text-anchor', 'middle')
                .attr('font-family', 'sans-serif')
                .attr('font-size', Math.ceil(avgL / 1.5))   // hack: magic number for scaling
                .attr('fill', atomCol)
                .text(atom.symbol);

            if (atom.charge !== 0) {
                var c = atom.charge;
                if (c < 0) {
                    c = (c === -1) ? '-' : (c + '-');
                } else {
                    c = (c === +1) ? '+' : (c + '+');
                }
                g.append('text')
                    .attr('dx', +1 * Math.ceil(avgL / 3))
                    .attr('dy', -1 * Math.ceil(avgL / 4.5))
                    .attr('text-anchor', 'left')
                    .attr('font-family', 'sans-serif')
                    // hack: magic number for scaling (half of symbol size)
                    .attr('fill', atomCol)
                    .attr('font-size', Math.ceil(avgL / 3)) 
                    .text(c);
            }

            if (atom.mass !== 0) {
                g.append('text')
                    .attr('dx', -2 * Math.ceil(avgL / 3))
                    .attr('dy', -1 * Math.ceil(avgL / 4.5))
                    .attr('text-anchor', 'left')
                    .attr('font-family', 'sans-serif')
                    // hack: magic number for scaling (half of symbol size)
                    .attr('font-size', Math.ceil(avgL / 3)) 
                    .attr('fill', atomCol)
                    .text(atom.mass);
            }
        }
    };

    /**
     * Calculates the Euclidean distance between two points.
     * 
     * @method distance
     * @private
     * @param {number} x1 - x value of first point
     * @param {number} y1 - y value of first point
     * @param {number} x2 - x value of second point
     * @param {number} y2 - y value of second point
     * @returns Euclidean distance
     */
    var distance = function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    };

    /**
     * d3 line function using the SVG path mini language to draw a plain bond.
     * 
     * @method plainBond
     */
    var plainBond = d3.svg.line()
        .interpolate(function (points) {
            var path = points[0][0] + ',' + points[0][1];
            for (var i = 1; i < points.length; i++) {
                if (i % 2 === 0) {
                    path += 'M' + points[i][0] + ',' + points[i][1];
                } else {
                    path += 'L' + points[i][0] + ',' + points[i][1];
                }
            }
            return path;
        })
        .x(function (d) {
            return x(d[0]);
        })
        .y(function (d) {
            return y(d[1]);
        });

    /**
     * d3 line function using the SVG path mini language to draw a wedge bond.
     * 
     * @method wedgeBond
     */
    var wedgeBond = d3.svg.line()
        .x(function (d) {
            return x(d[0]);
        })
        .y(function (d) {
            return y(d[1]);
        });

    /**
     * d3 line function using the SVG path mini language to draw a hash bond.
     * 
     * @method hashBond
     */
    var hashBond = d3.svg.line()
        .interpolate(function (points) {
            var path = points[0][0] + ',' + points[0][1];
            for (var i = 1; i < points.length; i++) {
                if (i % 2 === 0) {
                    path += 'M' + points[i][0] + ',' + points[i][1];
                } else {
                    path += 'L' + points[i][0] + ',' + points[i][1];
                }
            }
            return path;
        })
        .x(function (d) {
            return x(d[0]);
        })
        .y(function (d) {
            return y(d[1]);
        });

    /**
     * d3 line function using the SVG path mini language to draw a wiggly bond.
     * 
     * @method wigglyBond
     */
    var wigglyBond = d3.svg.line()
        .interpolate('cardinal')
        .x(function (d) {
            return x(d[0]);
        })
        .y(function (d) {
            return y(d[1]);
        });

    /*
     * Atom properties containing the CPK color values.
     */
    var atomColor = {
        H: '#000000',
        He: '#FFC0CB',
        Li: '#B22222',
        B: '#00FF00',
        C: '#000000',
        N: '#8F8FFF',
        O: '#F00000',
        F: '#DAA520',
        Na: '#0000FF',
        Mg: '#228B22',
        Al: '#808090',
        Si: '#DAA520',
        P: '#FFA500',
        S: '#FFC832',
        Cl: '#00FF00',
        Ca: '#808090',
        Ti: '#808090',
        Cr: '#808090',
        Mn: '#808090',
        Fe: '#FFA500',
        Ni: '#A52A2A',
        Cu: '#A52A2A',
        Zn: '#A52A2A',
        Br: '#A52A2A',
        Ag: '#808090',
        I: '#A020F0',
        Ba: '#FFA500',
        Au: '#DAA520'
    };

    // reference visible (public) functions as properties
    return {
        draw: draw
    };
};

/**
 * Helper function to create divs for the spinner animation (defined in css).
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.spinner
 * @param {string} el - an element id to append the spinner to
 * @return the spinner element
 */
st.util.spinner = function (el) {
    if ($('.st-spinner').length) {
        console.log("SDF");
        return $('.st-spinner');
    }
    
    $(el).append('<div class="st-spinner">' +
        '<div class="st-bounce1"></div>' + 
        '<div class="st-bounce2"></div>' +
        '<div class="st-bounce3"></div>' +
        '</div>');
        
    return $('.st-spinner');
};
/**
 * parser stub.
 *
 * Parsers for input data should extend this stub.
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 */
st.parser = {};

st.parser.jdx = function (url, callback) {
    d3.text(url, function (jdx) {
        var LABEL = '##',
            END = 'END',
            XYDATA = 'XYDATA',
            YTABLE = '(X++(Y..Y))',
            XFACTOR = 'XFACTOR',
            YFACTOR = 'YFACTOR',
            FIRSTX = 'FIRSTX',
            LASTX = 'LASTX',
            NPOINTS = 'NPOINTS';
        
        var objs = [];
        var obj = {},
            data = false,
            points = [];
            
        var pair,
            key,
            pkey,
            value;
    
        var lines = jdx.split(/\r\n|\r|\n/g);
        for (var i in lines) {
            var line = lines[i];
            if (line.indexOf(LABEL) === 0) {
                pair = line.split(/=\s(.*)/);
                if (pair.length < 2) {
                    continue;
                }
                key = pair[0].slice(2);
                value = pair[1].split(/\$\$(.*)/)[0].trim();
                if (key === XYDATA && value === YTABLE) {
                    data = true;
                } else if (key === END) {
                    if (data) {
                        if (parseFloat(obj[FIRSTX]) > 
                            parseFloat(obj[LASTX])) {
                            points.reverse();
                        }
                        obj[pkey] = points;
                        objs.push(obj);
                        // reset
                        obj = {};
                        data = false;
                        points = [];
                    }
                    data = false;
                } else {
                    obj[key] = value;
                }
                pkey = key;
            } else if (data) {
                //var deltax = (obj[LASTX] - obj[FIRSTX]) / (obj[NPOINTS] - 1);
                var entries = line.match(/(\+|-)*\d+\.*\d*/g);
                //var x = obj[XFACTOR] * entries[0];
                for (var j = 1; j < entries.length; j++) {
                    //x += (j - 1) * deltax;
                    var y = obj[YFACTOR] * entries[j];
                    points.push(y);
                }
            }
        }
        callback(objs);
    });
};
/**
 * data stub.
 *
 * Models for input data should extend this data stub. Options for two dimen-
 * sional data are provided: x and y accessors, x and y limits.
 *
 * Currently the source (src) option must specifiy one or more URL that point
 * to the JSON data.
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 */
st.data = {};

/**
 * Function returning the base data object that should be extended or modified
 * in models extending the st.data stub.
 * 
 * @method data
 * @returns the base data object to be extended/modified
 */
function data () {
    return {
        opts: {
            title: '',
            src: [],    // JSON URLs
            x: '',      // x accessor
            y: '',      // y accessor
            xlimits: [],// x axis limits: min, max
            ylimits: [] // y axis limits: min, max
        },
        
        raw: {          // globals summarising contained data
            gxlim: [ Number.MAX_VALUE, Number.MIN_VALUE], // global x limits
            gylim: [ Number.MAX_VALUE, Number.MIN_VALUE], // global y limits
            ids: {},
            series: []  // the total data to be displayed (array of data series)
        },
            
        /**
         * Sets the URL option.
         *
         * @param {string[]} x - an URL array 
         * @returns the data object
         */
        add: function (urls) {
            if (urls instanceof Array) {
                this.opts.src.push.apply(this.opts.src, urls);
            } else {
                this.opts.src.push(urls);
            }
        },
        
        /**
         * Removes a data series by its identifier or index.
         *
         * @param {string[]|number[]} x - indices or identifiers to remove
         * @returns the data object
         */
        remove: function (x) {
            var ids = [];
            if (x instanceof Array) {
                // TODO
            } else {
                if (isNaN(x)) {
                    for (var i in this.raw.series) {
                        if (this.raw.series[i].id === x) {
                            this.raw.series.splice(i, 1);
                            ids.push(this.raw.ids[x]);
                            delete this.raw.ids[x];
                            break;
                        }
                    }
                } else {
                    var spliced = this.raw.series.splice(x, 1);
                    ids.push(spliced[0].id);
                    delete this.raw.ids[spliced[0].id];
                }
            }
            return ids;
        },
        
        /**
         * Gets the id for a data series at a given index.
         *
         * @param {int} index - a data model index 
         * @returns the id of the data model
         */
        id: function (index) {
            return this.raw.series[index].id;
        },
        
        /**
         * Gets the title for a data series at a given index.
         *
         * @param {int} index - a data model index 
         * @returns the title of the data model
         */
        titleat: function (index) {
            return this.raw.series[index].title;
        },
        
        /**
         * Gets the x and y accessors for a data model at a given index.
         *
         * @param {int} index - a data model index 
         * @returns the x and y accessors of the data model
         */
        accs: function (index) {
            return this.raw.series[index].accs;
        },
        
        /**
         * Pushes the URLs currently in the URL option into the raw data array
         * and sets the global data options.
         *
         * @param {function} callback - callback function
         */
        push: function (callback) {
            var data = this;
            var deferreds = [];
            for (var i in this.opts.src) {
                if (typeof this.opts.src[i] !== 'string') {
                    this.fetch(this.opts.src[i]);
                } else {
                    deferreds.push(this.fetch(this.opts.src[i]));
                }
            }
            $.when.apply($, deferreds).done(function () {
                data.opts.src = [];
                callback();
            });
        },
        
        /**
         * Resets all global options.
         */
        reset: function () {
            for (var i in this.raw.series) {
                var series = this.raw.series[i];
                series.size = [
                    0,
                    series.data.length,
                    0
                ];
            }
        }
    };
}

/**
 * Function resovling axis limits based on whether key values, numeric values,
 * or no input values are provided.
 * 
 * @method fetch_limits
 * @params {object} series - the data object
 * @params {object} json - the complete data model
 * @params {number[]} limits - the min/max array
 * @params {string} acc - the data accessor
 * @returns the axis limts
 */
function fetch_limits (series, json, limits, acc) {
    var lim = [];
    if (limits.length === 2) {
        if (isNaN(limits[0]) && isNaN(limits[1])) {
            lim = [
                json[limits[0]],
                json[limits[1]]
            ];
        } else if (typeof limits[0] === 'number' 
                && typeof limits[1] === 'number') {
            lim = [
                limits[0],
                limits[1]
            ];
        } else {
            lim = d3.extent(series, function (d) {
                return d[acc];
            });   
        }                
    } else {
        lim = d3.extent(series, function (d) {
                return d[acc];
        });
    }
    lim[0] = parseFloat(lim[0]);
    lim[1] = parseFloat(lim[1]);
    return lim;
}


/**
 * Model for a two dimensional data set with x and y values given as array
 * of objects.
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.data.set
 * @returns the data set
 */
st.data.set = function () {
    // init base data to be extended
    var set = data();
    
    /**
     * Sets the title accessor.
     *
     * @param {string} x - a title accessor
     * @returns the data object
     */
    set.title = function (x) {
        this.opts.title = x;
        return this;
    };
    
    /**
     * Sets the x accessor.
     *
     * @param {string} x - a x accessor
     * @returns the data object
     */
    set.x = function (x) {
        this.opts.x = x;
        return this;
    };
    
    /**
     * Sets the y accessor.
     *
     * @param {string} y - a y accessor
     * @returns the data object
     */
    set.y = function (y) {
        this.opts.y = y;
        return this;
    };
    
    /**
     * Sets the x limits.
     *
     * @param {object[]} limits - a two element array of min and max limits
     * @returns the data object
     */
    set.xlimits = function (limits) {
        set.opts.xlimits = limits;
        return this;
    };
    
    /**
     * Sets the y limits.
     *
     * @param {object[]} limits - a two element array of min and max limits
     * @returns the data object
     */
    set.ylimits = function (limits) {
        set.opts.ylimits = limits;
        return this;
    };

    /**
     * Fetches the data and adds the model as raw entry.
     *
     * @param {string} src - a data url
     */
    set.fetch = function (src) {
        var set = this;
        var jqxhr = null;
        if (typeof src === 'string') {
            jqxhr = $.getJSON(src, function (json) {
                if (json instanceof Array) {
                    for (var i in json) {
                        set_fetch(json[i], set);
                    }
                } else {
                    set_fetch(json, set);
                }
            });
        } else {
            
            if (src instanceof Array) {
                for (var i in src) {
                    set_fetch(src[i], set);
                }
            } else {
                set_fetch(src, set);
            }
        }
        return jqxhr;
    };
    
    /**
     * Gets the unbinned data array for the current view.
     *
     * @param {int} width - the chart width
     * @param {function} xscale - the d3 x axis scale
     * @returns the unbinned data array
     */
    set.get = function (width, xscale) {
        var rawbinned = [];
        var ext = [
            xscale.invert(0),
            xscale.invert(width)
        ];
        ext = st.util.domain(xscale, ext);
        for (var i in this.raw.series) {
            var series = this.raw.series[i];
            var binned = [];
            for (var j in series.data) {
                var x = series.x(j);
                if (x >= ext[0] && x <= ext[1]) {
                    binned.push(series.data[j]);
                }
            }
            rawbinned.push(binned);
        }
        return rawbinned;
    };
    
    /**
     * Gets the binned data array for the current view.
     *
     * @param {int} width - the chart width
     * @param {function} xscale - the d3 x axis scale
     * @param {boolean} invert - whether to bin using min
     * @returns the binned data array
     */
    set.bin = function (width, xscale, invert) {
        var rawbinned = [];
        var ext = [
            xscale.invert(0),
            xscale.invert(width)
        ];
        ext = st.util.domain(xscale, ext);
        var binWidth = 1 // px
        for (var i in this.raw.series) {
            var series = this.raw.series[i];
            var serieslength = series.data.length;
            var tmp = series.size;
            if (tmp[2] === 0) {
                tmp[2] = Math.ceil(width / binWidth);
            }
            var step = Math.abs(ext[1] - ext[0]) / (tmp[2] - 1);
            var binned = [];
            var cor = 0; // shorten data array
            while (series.size[0] > 0) {
                var x = series.x(series.size[0]);
                if (x < ext[0]) {
                    break;
                }
                series.size[0] -= 1;
            }
            while (series.size[1] < serieslength) {
                var x = series.x(series.size[1]);
                if (x > ext[1]) {
                    break;
                }
                series.size[1] += 1;
            }
            for (var j = series.size[0]; j < series.size[1]; j++) {
                var x = series.x(j);
                if (x < ext[0]) {
                    tmp[0] = j;
                    continue;
                } else if (x > ext[1]) {
                    tmp[1] = j;
                    break;
                }
                var bin = Math.floor((x - ext[0]) / step);
                var dpb = binned[bin];
                var dps = series.data[j];
                if (dpb) {
                    if (invert) {
                        if (dpb[series.accs[1]] < dps[series.accs[1]]) {
                            binned[bin - cor] = dpb;
                        } else {
                            binned[bin - cor] = dps;
                        }                    
                    } else {
                        if (dpb[series.accs[1]] > dps[series.accs[1]]) {
                            binned[bin - cor] = dpb;
                        } else {
                            binned[bin - cor] = dps;
                        }
                    }
                } else {
                    cor = bin - binned.length;
                    binned[bin - cor] = dps;
                }
            }
            if (cor > 0) {
                tmp[2] = binned.length;
            }
            series.size = tmp;
            rawbinned.push(binned);
        }
        return rawbinned;
    };
    
    return set;
};

function set_fetch (json, set) {
    var id = st.util.hashcode((new Date().getTime() * Math.random()) + '');
    id = 'st' + id;                     // model id
    var title = json[set.opts.title];   // model title
    var xlim = [];                  // model x limits
    var ylim = [];                  // model y limits
    var size = [];                  // model size: min, max, nBins
    var xacc = set.opts.x;          // model x accessor
    var yacc = set.opts.y;          // model y accessor
    
    if (!title || title.length === 0) {
        title = id;
    }
    
    if (id in set.raw.ids) {
        console.log("SpeckTackle: Non unique identifier: " + id);
        return;
    }
    
    var acc = '';                   // resolve accessor stub
    if (xacc.lastIndexOf('.') !== -1) {
        acc = xacc.substr(0, xacc.lastIndexOf('.'))
        xacc = xacc.substr(xacc.lastIndexOf('.') + 1)
        yacc = yacc.substr(yacc.lastIndexOf('.') + 1)
    }

    var data = (acc === '') ? json : json[acc];
    // resolve limits
    xlim = fetch_limits(data, json, set.opts.xlimits, xacc);
    ylim = fetch_limits(data, json, set.opts.ylimits, yacc);
    size = [0, data.length, 0];
    
    // replace global limits if required
    if (xlim[0] < set.raw.gxlim[0]) {
        set.raw.gxlim[0] = xlim[0];
    }
    if (ylim[0] < set.raw.gylim[0]) {
        set.raw.gylim[0] = ylim[0];
    }
    if (xlim[1] > set.raw.gxlim[1]) {
        set.raw.gxlim[1] = xlim[1];
    }
    if (ylim[1] > set.raw.gylim[1]) {
        set.raw.gylim[1] = ylim[1];
    }                
    
    set.raw.ids[id] = true;
    
    // add model as raw entry
    set.raw.series.push({
        id: id,
        title: title,
        xlim: xlim,
        ylim: ylim,
        accs: [xacc, yacc],
        size: size,
        data: data,
        x: function (i) { // x accessor function
            return this.data[i][this.accs[0]];
        },
        y: function (i) {   // y accessor function
            return this.data[i][this.accs[1]];
        }
    });
}

/**
 * Model for a one dimensional data array with y values given as array.
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.data.array
 * @returns the data array
 */
st.data.array = function () {
    // init base data to be extended
    var array = data();
    
    /**
     * Sets the title accessor.
     *
     * @param {string} x - a title accessor
     * @returns the data object
     */
    array.title = function (x) {
        this.opts.title = x;
        return this;
    };
    
    /**
     * Sets the y accessor.
     *
     * @param {string} y - a y accessor
     * @returns the data object
     */
    array.y = function (y) {
        this.opts.y = y;
        return this;
    };
    
    /**
     * Sets the x limits.
     *
     * @param {object[]} limits - a two element array of min and max limits
     * @returns the data object
     */
    array.xlimits = function (x) {
        this.opts.xlimits = x;
        return this;
    };
    
    /**
     * Sets the y limits.
     *
     * @param {object[]} limits - a two element array of min and max limits
     * @returns the data object
     */
    array.ylimits = function (x) {
        this.opts.ylimits = x;
        return this;
    };

    /**
     * Fetches the data and adds the model as raw entry.
     *
     * @param {string} src - a data url
     */
    array.fetch = function (src) {
        var array = this;
        var jqxhr = null;
        if (typeof src === 'string') {
            jqxhr = $.getJSON(src, function (json) {
                array_fetch(json, array);
            });
        } else {
            array_fetch(src, array);
        }
        return jqxhr;
    };
    
    /**
     * Gets the unbinned data array for the current view.
     *
     * @param {int} width - the chart width
     * @param {function} xscale - the d3 x axis scale
     * @returns the unbinned data array
     */
    array.get = function (width, xscale) {
        var rawbinned = [];
        var ext = [
            xscale.invert(0),
            xscale.invert(width)
        ];
        ext = st.util.domain(xscale, ext);
        for (var i in this.raw.series) {
            var series = this.raw.series[i];
            var serieslength = series.data.length;
            var seriesstep = (series.xlim[1] - series.xlim[0]) / serieslength;
            var tmp = series.size;
            var binned = [];
            while (series.size[0] > 0) {
                var x = series.size[0] * seriesstep + series.xlim[0];
                if (x < ext[0]) {
                    break;
                }
                series.size[0] -= 1;
            }
            while (series.size[1] < serieslength) {
                var x = series.size[1] * seriesstep + series.xlim[0];
                if (x > ext[1]) {
                    break;
                }
                series.size[1] += 1;
            }
            for (var j = series.size[0]; j < series.size[1]; j++) {
                var x = j * seriesstep + series.xlim[0];
                if (x < ext[0]) {
                    tmp[0] = j;
                    continue;
                } else if (x > ext[1]) {
                    tmp[1] = j;
                    break;
                }
                var ys = series.data[j];
                var dp = {
                    x: x
                };
                dp[series.accs[1]] = ys;
                binned.push(dp);
            }
            series.size = tmp;
            rawbinned.push(binned);
        }
        return rawbinned;
    };
    
    /**
     * Gets the binned data array for the current view.
     *
     * @param {int} width - the chart width
     * @param {function} xscale - the d3 x axis scale
     * @param {boolean} invert - whether to bin using min
     * @returns the binned data array
     */
    array.bin = function (width, xscale, invert) {
        var rawbinned = [];
        var ext = [
            xscale.invert(0),
            xscale.invert(width)
        ];
        ext = st.util.domain(xscale, ext);
        var binWidth = 1 // px
        for (var i in this.raw.series) {
            var series = this.raw.series[i];
            var serieslength = series.data.length;
            var seriesstep = (series.xlim[1] - series.xlim[0]) / serieslength;
            var tmp = series.size;
            if (tmp[2] === 0) {
                tmp[2] = Math.ceil(width / binWidth);
            }
            var step = Math.abs(ext[1] - ext[0]) / (tmp[2] - 1);
            var binned = [];
            var cor = 0; // shorten data array
            while (series.size[0] > 0) {
                var x = series.size[0] * seriesstep + series.xlim[0];
                if (x < ext[0]) {
                    break;
                }
                series.size[0] -= 1;
            }
            while (series.size[1] < serieslength) {
                var x = series.size[1] * seriesstep + series.xlim[0];
                if (x > ext[1]) {
                    break;
                }
                series.size[1] += 1;
            }
            for (var j = series.size[0]; j < series.size[1]; j++) {
                var x = j * seriesstep + series.xlim[0];
                if (x < ext[0]) {
                    tmp[0] = j;
                    continue;
                } else if (x > ext[1]) {
                    tmp[1] = j;
                    break;
                }
                var bin = Math.floor((x - ext[0]) / step);
                var dpb = binned[bin];
                var ys = series.data[j];
                if (dpb) {
                    if (invert) {
                        if (dpb[series.accs[1]] < ys) {
                            binned[bin - cor] = dpb;
                        } else {
                            binned[bin - cor] = { 
                                x: x
                            };
                            binned[bin - cor][series.accs[1]] = ys;
                        }
                    } else {
                        if (dpb[series.accs[1]] > ys) {
                            binned[bin - cor] = dpb;
                        } else {
                            binned[bin - cor] = { 
                                x: x
                            };
                            binned[bin - cor][series.accs[1]] = ys;
                        }
                    }
                } else {
                    cor = bin - binned.length;
                    binned[bin - cor] = { 
                            x: x
                    };
                    binned[bin - cor][series.accs[1]] = ys;
                }
            }
            if (cor > 0) {
                tmp[2] = binned.length;
            }
            series.size = tmp;
            rawbinned.push(binned);
        }
        return rawbinned;
    };
    
    return array;
};

function array_fetch (json, array) {
    var id = st.util.hashcode((new Date().getTime() * Math.random()) + '');
    id = 'st' + id;                       // model id
    var title = json[array.opts.title];   // model title
    var xlim = [];                  // model x limits
    var ylim = [];                  // model y limits
    var size = [];                  // model size: min, max, nBins
    var xacc = 'x';                 // model x accessor
    var yacc = array.opts.y;        // model y accessor

    if (!title || title.length === 0) {
        title = id;
    }
    
    if (id in array.raw.ids) {
        console.log("SpeckTackle: Non unique identifier: " + id);
        return;
    }
    
    var data = (yacc === '') ? json : json[yacc];
    xlim = fetch_limits(data, json, array.opts.xlimits, xacc);
    ylim = fetch_limits(data, json, array.opts.ylimits, yacc);
    size = [0, data.length, 0];
    
    if (xlim[0] < array.raw.gxlim[0]) {
        array.raw.gxlim[0] = xlim[0];
    }
    if (ylim[0] < array.raw.gylim[0]) {
        array.raw.gylim[0] = ylim[0];
    }
    if (xlim[1] > array.raw.gxlim[1]) {
        array.raw.gxlim[1] = xlim[1];
    }
    if (ylim[1] > array.raw.gylim[1]) {
        array.raw.gylim[1] = ylim[1];
    }   

    array.raw.ids[id] = true;    

    // add model as raw entry
    array.raw.series.push({
        id: id,        
        title: title,
        xlim: xlim,
        ylim: ylim,
        accs: [xacc, yacc],
        size: size,
        data: data,
        x: function (i) {
            return i; // by default, just return i
        },
        y: function (i) {
            return this.data[i][this.accs[1]];
        }
    });
}

/**
 * chart stub.
 *
 * Custom charts should extend this chart stub. Default options include x- and
 * y-labels, margins, and a title. 
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 */
st.chart = {};

/**
 * Function returning the base chart object that should be extended or modified
 * in models extending the st.chart stub.
 * 
 * @method chart
 * @returns the base chart object to be extended/modified
 */
function chart () {
    return {
        opts: {
            title: '',
            xlabel: '',
            ylabel: '',
            xreverse: false,
            yreverse: false,
            legend: false,
            margins: [80, 80, 80, 120]
        },
        
        data: null,
        colors: st.util.colors(),
        
        /**
         * Sets the title option.
         *
         * @param {string} x - a title 
         * @returns the chart object
         */
        title: function (x) {
            this.opts.title = x;
            return this;
        },
        
        /**
         * Sets the x label option.
         *
         * @param {string} x - a x label
         * @returns the chart object
         */
        xlabel: function (x) {
            this.opts.xlabel = x;
            return this;
        },
        
        /**
         * Sets the y label option.
         *
         * @param {string} y - a y label
         * @returns the chart object
         */
        ylabel: function (x) {
            this.opts.ylabel = x;
            return this;
        },
        
        /**
         * Sets the x reverse axis option.
         *
         * @param {string} x - whether to reverse the x axis
         * @returns the chart object
         */
        xreverse: function (x) {
            this.opts.xreverse = x;
            return this;
        },
        
        /**
         * Sets the y reverse axis option.
         *
         * @param {string} x - whether to reverse the y axis
         * @returns the chart object
         */
        yreverse: function (x) {
            this.opts.yreverse = x;
            return this;
        },
        
        /**
         * Sets the legend option.
         *
         * @param {boolean} x - whether to display a legend
         * @returns the chart object
         */
        legend: function (x) {
            this.opts.legend = x;
            return this;
        },
        
        /**
         * Sets the margins option.
         *
         * @param {int[]} x - the margins: [top, right, bottom, left]
         * @returns the chart object
         */
        margins: function (x) {
            this.opts.margins = x;
            return this;
        },
        
        /**
         * Renders the base chart to the container.
         *
         * @params {string} x - the id of the container
         */
        render: function (x) {
            this.target = x;
            var margins = this.opts.margins;
            this.width = $(x).width() - margins[1] - margins[3];
            this.height = $(x).height() - margins[0] - margins[2];
        
            var chart = this;
            
            this.panel = d3.select(x)
                .append('svg:svg')
                .attr('class', 'st-base')
                .attr('width', this.width + margins[1] + margins[3])
                .attr('height', this.height + margins[0] + margins[2])
                .on('mousedown.zoom', function () { // --- mouse options ---
                    chart.mouseDown(this);
                })
                .on('mousemove.zoom', function () { // --- mouse options ---
                    chart.mouseMove(this);
                })
                .on('mouseup.zoom', function () {   // --- mouse options ---
                    chart.mouseUp();
                })
                .on('dblclick.zoom', function () {  // --- mouse options ---
                    chart.mouseDbl();
                });
                
            this.canvas = this.panel
                .append('svg:g') // append plot group within chart canvas
                .attr('transform', 'translate(' + margins[3] + ',' + margins[0] + ')');

            // add SVG clip path
            this.canvas.append('svg:clipPath')
                .attr('id', 'clip')
                .append('svg:rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', this.width)
                .attr('height', this.height);

            // add selection rectangle
            this.selection = this.canvas.append('svg:rect')
                .attr('class', 'st-selection')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 0)
                .attr('height', 0)
                .style('pointer-events', 'none')
                .attr('display', 'none');

            // container for x and y scale
            this.scales = {};
            if (this.opts.xreverse) {
                this.scales.x = d3.scale.linear()
                    .domain([1, 0])
                    .range([0, this.width])
            } else {
                this.scales.x = d3.scale.linear()
                    .domain([0, 1])
                    .range([0, this.width])
            }
            if (this.opts.yreverse) {
                this.scales.y = d3.scale.linear()
                    .domain([1, 0])
                    .range([this.height, 0])
            } else {
                this.scales.y = d3.scale.linear()
                    .domain([0, 1])
                    .range([this.height, 0])
            }
            
            // define custom behavior
            if (typeof this.behavior == 'function') {
                this.behavior();
            }
            
            // define and render axis
            this.renderAxes();
            
            // draw the title
            if (this.opts.title && this.opts.title.length !== 0) {
                this.panel.append('text')
                    .attr('x', margins[3] + (this.width / 2))
                    .attr('y', margins[0] * 0.75)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 'large')
                    .text(this.opts.title)
            }
        },
        
        /**
         * Defines and renders the axes (direction, tick marks, etc.).
         * Axes follow standard cartesian coordinate conventions.
         */
        renderAxes: function () {
            var margins = this.opts.margins;
            var xFormat = d3.format('.4g');
            var yFormat= d3.format(',.2g');
            
            this.xaxis = d3.svg.axis()
                .scale(this.scales.x)
                .ticks(6)
                .tickSubdivide(true)
                .tickFormat(xFormat)
                .orient('bottom');
            this.yaxis = d3.svg.axis().scale(this.scales.y)
                .ticks(4)
                .tickFormat(yFormat)
                .orient('left');

            this.canvas.append('svg:g')
                .attr('class', 'st-xaxis')
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(this.xaxis);
            this.canvas.append('svg:g')
                .attr('class', 'st-yaxis')
                .attr('transform', 'translate(-25, 0)')
                .call(this.yaxis);

            if (this.opts.xlabel !== '') {
                this.panel.select('.st-xaxis').append('text')
                    .text(this.opts.xlabel)
                    .attr('text-anchor', 'middle')
                    .attr('x', this.width / 2)
                    .attr('y', margins[2] / 2);
            }
            if (this.opts.ylabel !== '') {
                this.panel.select('.st-yaxis').append('text')
                    .text(this.opts.ylabel)
                    .attr('transform', 'rotate (-90)')
                    .attr('text-anchor', 'middle')
                    .attr('x', 0 - this.height / 2)
                    .attr('y', 0 - margins[3] / 2);
            }
        },
        
        /**
         * Defines default action for mouse down events.
         * 
         * @param event - mouse event
         */
        mouseDown: function (event) {
            var p = d3.mouse(event);
            var left = this.opts.margins[3];
            var top = this.opts.margins[0];
            this.panel.select('.st-selection')
                .attr('x', p[0] - left)
                .attr('xs', p[0] - left)
                .attr('y', p[1] - top)
                .attr('ys', p[1] - top)
                .attr('width', 1)
                .attr('height', 1)
                .attr('display', 'inline');
        },

        /**
         * Defines default action for mouse move events.
         * 
         * Updates the selection rectangle if visible.
         * 
         * @param event - mouse event
         */
        mouseMove: function (event) {
            var s = this.panel.select('.st-selection')
            if (s.attr('display') === 'inline') {
                var pointerX = d3.mouse(event)[0] - this.opts.margins[3],
                    pointerY = d3.mouse(event)[1] - this.opts.margins[0],
                    anchorWidth = parseInt(s.attr('width'), 10),
                    anchorHeight = parseInt(s.attr('height'), 10),
                    pointerMoveX = pointerX - parseInt(s.attr('x'), 10),
                    pointerMoveY = pointerY - parseInt(s.attr('y'), 10),
                    anchorXS = parseInt(s.attr('xs'), 10),
                    anchorYS = parseInt(s.attr('ys'), 10);
                    
                if ((pointerMoveX < 0 && pointerMoveY < 0)
                    || (pointerMoveX * 2 < anchorWidth
                    && pointerMoveY * 2 < anchorHeight)) {
                    s.attr('x', pointerX);
                    s.attr('width', anchorXS - pointerX);
                    s.attr('y', pointerY);
                    s.attr('height', anchorYS - pointerY);
                } else if (pointerMoveX < 0
                    || (pointerMoveX * 2 < anchorWidth)) {
                    s.attr('x', pointerX);
                    s.attr('width', anchorXS - pointerX);
                    s.attr('height', pointerMoveY);
                } else if (pointerMoveY < 0
                    || (pointerMoveY * 2 < anchorHeight)) {
                    s.attr('y', pointerY);
                    s.attr('height', anchorYS - pointerY);
                    s.attr('width', pointerMoveX);
                } else {
                    s.attr('width', pointerMoveX);
                    s.attr('height', pointerMoveY);
                }
            }
        },

        /**
         * Defines default action for mouse up events.
         * 
         * Zooms to the selected area in x and y.
         */
        mouseUp: function () {
            var tolerance = 5; // px threshold for selections
            var selection = this.panel.select('.st-selection');
            if (parseInt(selection.attr('width')) > tolerance
                && parseInt(selection.attr('height')) > tolerance) {
                var x = parseFloat(selection.attr('x'));
                var y = parseFloat(selection.attr('y'));
                var width = parseFloat(selection.attr('width'));
                var height = parseFloat(selection.attr('height'));

                width = this.scales.x.invert(x + width);
                height = this.scales.y.invert(y + height);

                x = this.scales.x.invert(x);
                y = this.scales.y.invert(y);

                if (height < 0) {
                    height = 0;
                }

                this.scales.x.domain([x, width]).nice();
                this.scales.y.domain([height, y]).nice();

                selection.attr('display', 'none');
                this.canvas.select('.st-xaxis').call(this.xaxis);
                this.canvas.select('.st-yaxis').call(this.yaxis);
                
                if (typeof this.renderdata == 'function' && this.data !== null) {
                    this.renderdata();
                }
            } else {
                selection.attr('display', 'none');
            }
        },

        /**
         * Defines default action for mouse double-click events.
         * 
         * Resets the chart zoom in x and y to 100%.
         */
        mouseDbl: function () {
            if (this.data === null) {
                var xdom = st.util.domain(this.scales.x, [0, 1]);
                var ydom = st.util.domain(this.scales.y, [0, 1]);
                this.scales.x.domain(xdom).nice();
                this.scales.y.domain(ydom).nice();
                this.canvas.select('.st-xaxis').call(this.xaxis);
                this.canvas.select('.st-yaxis').call(this.yaxis);
                return;
            }
            
            var gxlim = st.util.domain(this.scales.x, this.data.raw.gxlim);
            var gylim = st.util.domain(this.scales.y, this.data.raw.gylim);
            this.scales.x.domain(gxlim).nice();
            this.scales.y.domain(gylim).nice();

            this.canvas.select('.st-xaxis').call(this.xaxis);
            this.canvas.select('.st-yaxis').call(this.yaxis);
            
            if (typeof this.renderdata == 'function') {
                this.data.reset();
                this.renderdata();
            }
        },
        
        /**
         * Draws the chart legend in the top right corner.
         */
        renderLegend: function () {
            $('.st-legend').empty();
            var legend = this.canvas.append('g')
                .attr('class', 'st-legend')
                .style('cursor', 'pointer');
            var colors = this.colors;
            var chart = this;
            for (var i = 0; i < this.data.raw.series.length; i++) {
                var id = this.data.raw.series[i].id;
                var title = this.data.raw.series[i].title;
                var lg = legend.append('g').attr('stid', id);
                lg.append('svg:rect')
                    .attr('x', this.width + 5)
                    .attr('y', function () { return i * 20; })
                    .attr('width', 10)
                    .attr('height', 10)
                    .style('fill', function () { return colors.get(title); });
                lg.append('text')
                    .attr('x', this.width + 20)
                    .attr('y', function () { return i * 20 + 9; })
                    .text(function () {
                        var text = title;
                        return text;
                    });
                lg.on('mouseover', function() {
                    d3.select(this).style('fill', 'red');
                    var selectid = d3.select(this).attr('stid');
                    chart.canvas.selectAll('.' + selectid).style('stroke-width', 2);
                    for (var dataid in chart.data.raw.ids) {
                        if (dataid !== selectid) {
                            chart.canvas.selectAll('.' + dataid).style('opacity', 0.1);
                        }
                    }
                })
                lg.on('mouseout', function() {
                    d3.select(this).style('fill', 'black');
                    var selectid = d3.select(this).attr('stid');
                    chart.canvas.selectAll('.' + selectid).style('stroke-width', 1);
                    for (var dataid in chart.data.raw.ids) {
                        if (dataid !== selectid) {
                            chart.canvas.selectAll('.' + dataid).style('opacity', 1);
                        }
                    }
                })
            }
        },
        
        /**
         * Loads and associdates the data container with the chart.
         *
         * @param {object} data - the data container
         */
        load: function (data) {
            var chart = this;
            this.data = data; // associate with the chart
            var oldadd = data.add;
            data.add = function() {
                oldadd.apply(this, arguments);
                chart.data.push(function () {// callback
                    chart.xscale();              // rescale x
                    chart.yscale();              // rescale y
                    chart.canvas.select('.st-xaxis').call(chart.xaxis); // draw
                    chart.canvas.select('.st-yaxis').call(chart.yaxis); // draw
                    chart.renderdata();         // draw data
                    if (chart.opts.legend) {
                        chart.renderLegend();
                    }
                });
            };
            var oldremove = data.remove;
            data.remove = function() {
                var ids = oldremove.apply(this, arguments);
                for (var i in ids) {
                    chart.canvas.selectAll('.' + ids[i]).remove();
                }
                if (chart.opts.legend) {
                    chart.renderLegend();
                }
            };
        }
    };
}

/**
 * Time series chart extending the base chart. 
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.chart.series
 * @returns the time series chart
 */
st.chart.series = function () {
    var series = chart(); // create and extend base chart
    
    /**
     * Rescales the x domain.
     */
    series.xscale = function () {
        var array = this.data.raw.gxlim;
        if (this.opts.xreverse) {
            array = [
                array[1],
                array[0]
            ];
        }
        this.scales.x
            .domain(array)
            .nice();
    };
    
    /**
     * Rescales the y domain.
     */
    series.yscale = function () {
        this.scales.y
            .domain(this.data.raw.gylim)
            .nice();
    };
    
    /**
     * Adds utilities for custom behavior.
     */
    series.behavior = function () {
        this.tooltips = d3.select('body').append('div')
            .attr('id', 'tooltips')
            .attr('class', 'st-tooltips')
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('opacity', 0);

        this.tooltips.append('div')
            .attr('id', 'tooltips-meta')
            .style('height', '50%')
            .style('width', '100%');

        this.tooltips.append('div')
            .attr('id', 'tooltips-mol')
            .style('height', '50%')
            .style('width', '100%');
    };
    
    /**
     * Renders the data.
     */
    series.renderdata = function () {
        var data = this.data.bin(this.width, this.scales.x);
        var chart = this;
        var format = d3.format('.2f');
        for (var i = 0; i < data.length; i++) {
            var series = data[i];
            var id = this.data.id(i);
            var title = this.data.titleat(i);
            var accs = this.data.accs(i);
            var line = d3.svg.line()
                .interpolate('cardinal-open')
                .x(function (d) {
                    return chart.scales.x(d[accs[0]]);
                })
                .y(function (d) {
                    return chart.scales.y(d[accs[1]]);
                });
            this.canvas.selectAll('.' + id).remove();
            var g = this.canvas.append('g')
                .attr('class', id);
            g.append('svg:path')
                .attr('clip-path', 'url(#clip)')
                .style('stroke', this.colors.get(title))
                .attr('d', line(series));
            g.selectAll('.' + id + '.circle').data(series)
                .enter()
                .append('svg:circle')
                .attr('clip-path', 'url(#clip)')
                .style('fill', this.colors.get(title))
                .style('stroke', this.colors.get(title))
                .attr("opacity", 0)
                .attr("r", 3)
                .attr("cx", function (d) { 
                    return chart.scales.x(d[accs[0]]) 
                })
                .attr("cy", function (d) { 
                    return chart.scales.y(d[accs[1]]) 
                })
            .on('mouseover', function (d) {
                d3.select(this).attr('opacity', 0.8);
                chart.tooltips
                    .style('display', 'inline');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0.9);
                chart.tooltips
                    .style('left', d3.event.pageX + 10 + 'px')
                    .style('top', d3.event.pageY - 10 + 'px')
                    .style('opacity', 0.9)
                    .style('border', 'dashed')
                    .style('border-width', '1px')
                    .style('padding', '3px')
                    .style('border-radius', '10px')
                    .style('background-color', 'white');
                var x = format(d[accs[0]]);
                var y = format(d[accs[1]]);
                d3.selectAll('#tooltips-meta').html(
                    chart.opts.xlabel + ': ' + 
                    x + '<br/>' + chart.opts.ylabel + ': ' + y
                );
            })
            .on('mouseout', function () {
                d3.select(this).attr('opacity', '0');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0);
                chart.tooltips
                    .style('display', 'none');
            });
        }
    };
    
    return series;
};

/**
 * Mass spectrometry chart extending the base chart. 
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.chart.ms
 * @returns the mass spectrometry chart
 */
st.chart.ms = function () {
    var ms = chart(); // create and extend base chart
    
    /**
     * Rescales the x domain.
     */
    ms.xscale = function () {
        this.scales.x
            .domain(this.data.raw.gxlim)
            .nice();
    };
    
    /**
     * Rescales the y domain.
     */
    ms.yscale = function () {
        this.scales.y
            .domain(this.data.raw.gylim)
            .nice();
    };
    
    /**
     * Adds utilities for custom behavior.
     */
    ms.behavior = function () {
        this.tooltips = d3.select(this.target).append('div')
            .attr('id', 'tooltips')
            .attr('class', 'st-tooltips')
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('opacity', 0);

        this.tooltips.append('div')
            .attr('id', 'tooltips-meta')
            .style('height', '50%')
            .style('width', '100%');

        this.tooltips.append('div')
            .attr('id', 'tooltips-mol')
            .style('height', '50%')
            .style('width', '100%');
    };
   
    // add the MDL molfile to SVG renderer   
    ms.mol2svg = st.util.mol2svg(200, 200);
    
    /**
     * Renders the data.
     */
    ms.renderdata = function () {
        var data = this.data.bin(this.width, this.scales.x);
        var chart = this;
        var timeout;
        var format = d3.format('.2f');
        for (var i = 0; i < data.length; i++) {
            var series = data[i];
            var id = this.data.id(i);
            var title = this.data.titleat(i);
            var accs = this.data.accs(i);
            this.canvas.selectAll('.' + id).remove();
            var g = this.canvas.append('g')
                .attr('class', id);
            g.selectAll('.' + id + '.line').data(series)
                .enter()
                .append('svg:line')
                .attr('clip-path', 'url(#clip)')
                .attr('x1', function (d) { 
                    return chart.scales.x(d[accs[0]])  
                })
                .attr('y1', function (d) { 
                    return chart.scales.y(d[accs[1]])  
                })
                .attr('x2', function (d) { 
                    return chart.scales.x(d[accs[0]])  
                })
                .attr('y2', this.height)
                .style('stroke', this.colors.get(title))
            .on('mouseover', function (d) {
                d3.select(this).style('stroke-width', 2);
                chart.tooltips
                    .style('display', 'inline');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0.9);
                chart.tooltips
                    .style('left', d3.event.pageX + 10 + 'px')
                    .style('top', d3.event.pageY - 10 + 'px')
                    .style('opacity', 0.9)
                    .style('border', 'dashed')
                    .style('border-width', '1px')
                    .style('padding', '3px')
                    .style('border-radius', '10px')
                    .style('background-color', 'white');
                var x = format(d[accs[0]]);
                var y = format(d[accs[1]]);
                d3.selectAll('#tooltips-meta').html(
                    chart.opts.xlabel + ': ' + 
                    x + '<br/>' + chart.opts.ylabel + ': ' + y
                );
                if (d.ref) {
                    var spinner = st.util.spinner('#tooltips-mol');
                    // var index = d.ref - 1;
                    // var className = this.className.baseVal;
                    timeout = setTimeout(function () {
                        spinner.css('display', 'none');
                        // get ref
                        chart.mol2svg.draw('http://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/174174/SDF', '#tooltips-mol');
                    }, 500);
                } else {
                    d3.selectAll('#tooltips-mol').html('');
                }
            })
            .on('mouseout', function () {
                clearTimeout(timeout);
                d3.selectAll('#tooltips-mol').html('');
                d3.select(this).style('stroke-width', '1');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0);
                chart.tooltips
                    .style('display', 'none');
            });
        }
    };
    
    return ms;
};

/**
 * Infrared chart extending the base chart. 
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.chart.series
 * @returns the IR chart
 */
st.chart.ir = function () {
    var ir = chart(); // create and extend base chart
    
    /**
     * Rescales the x domain.
     */
    ir.xscale = function () {
        this.scales.x
            .domain([
                this.data.raw.gxlim[1],
                this.data.raw.gxlim[0]
            ])
            .nice();
    };
    
    /**
     * Rescales the y domain.
     */
    ir.yscale = function () {
        this.scales.y
            .domain(this.data.raw.gylim)
            .nice();
    };
    
    /**
     * Adds utilities for custom behavior.
     */
    ir.behavior = function () {
        this.scales.x.domain([1, 0]);
        this.tooltips = d3.select('body').append('div')
            .attr('id', 'tooltips')
            .attr('class', 'st-tooltips')
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('opacity', 0);

        this.tooltips.append('div')
            .attr('id', 'tooltips-meta')
            .style('height', '50%')
            .style('width', '100%');

        this.tooltips.append('div')
            .attr('id', 'tooltips-mol')
            .style('height', '50%')
            .style('width', '100%');
        
        this.xpointer = this.panel.append('text')
            .attr('x', this.opts.margins[3])
            .attr('y', this.opts.margins[0])
            //.attr('text-anchor', 'left')
            .attr('font-size', 'x-small')
            .text('')
        var chart = this;
        var xFormat = d3.format('.4g');
        this.plotted = [];
        this.panel.on('mousemove', function () {
            var mousex = d3.mouse(this)[0] - chart.opts.margins[3];
            var plotx = chart.scales.x.invert(mousex);
            chart.xpointer.text('x = ' + xFormat(plotx));
            var plotdomain = chart.scales.x.domain();
            if (plotx < plotdomain[0] && plotx >= plotdomain[1]) {
                for (var i = 0; i < chart.plotted.length; i++) {
                    var accs = chart.data.accs(i);
                    var bisector = d3.bisector(function (d) {
                        return d[accs[0]];
                    }).left;
                    var j = bisector(chart.plotted[i], plotx);
                    // translate existing element
                    // http://bl.ocks.org/gniemetz/4618602
                    if (j > chart.plotted[i].length - 1) {
                        j = chart.plotted[i].length - 1;
                    }
                    var dp = chart.plotted[i][j];
                    chart.canvas.select('.' + chart.data.id(i) + 'focus')
                        .attr('display', 'inline')
                        .attr('transform', 'translate(' + 
                        chart.scales.x(dp[accs[0]]) + ',' + 
                        chart.scales.y(dp[accs[1]]) + ')');
                }
            }
        });
    };
    
    /**
     * Renders the data.
     */
    ir.renderdata = function () {
        var data = this.data.bin(this.width, this.scales.x, true);
        this.plotted = data;
        var chart = this;
        var format = d3.format('.2f');
        for (var i = 0; i < data.length; i++) {
            var series = data[i];
            var id = this.data.id(i);
            var title = this.data.titleat(i);
            var accs = this.data.accs(i);
            var line = d3.svg.line()
                .interpolate('cardinal-open')
                .x(function (d) {
                    return chart.scales.x(d[accs[0]]);
                })
                .y(function (d) {
                    return chart.scales.y(d[accs[1]]);
                });
            this.canvas.selectAll('.' + id).remove();
            var g = this.canvas.append('g')
                .attr('class', id);
            g.append('svg:path')
                .attr('clip-path', 'url(#clip)')
                .style('stroke', this.colors.get(title))
                .attr('d', line(series));
            g.append('svg:circle')
                .attr('class', id + 'focus')
                .style('stroke', this.colors.get(title))
                .style('fill', 'none')
                .attr('r', 3)
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('display', 'none')
            g.selectAll('.' + id + '.circle').data(series)
                .enter()
                .append('svg:circle')
                .attr('clip-path', 'url(#clip)')
                .style('fill', this.colors.get(title))
                .style('stroke', this.colors.get(title))
                .attr("opacity", 0)
                .attr("r", 3)
                .attr("cx", function (d) { 
                    return chart.scales.x(d[accs[0]]) 
                })
                .attr("cy", function (d) { 
                    return chart.scales.y(d[accs[1]]) 
                })
            .on('mouseover', function (d) {
                d3.select(this).attr('opacity', 0.8);
                chart.tooltips
                    .style('display', 'inline');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0.9);
                chart.tooltips
                    .style('left', d3.event.pageX + 10 + 'px')
                    .style('top', d3.event.pageY - 10 + 'px')
                    .style('opacity', 0.9)
                    .style('border', 'dashed')
                    .style('border-width', '1px')
                    .style('padding', '3px')
                    .style('border-radius', '10px')
                    .style('background-color', 'white');
                var x = format(d[accs[0]]);
                var y = format(d[accs[1]]);
                d3.selectAll('#tooltips-meta').html(
                    chart.opts.xlabel + ': ' + 
                    x + '<br/>' + chart.opts.ylabel + ': ' + y
                );
            })
            .on('mouseout', function () {
                d3.select(this).attr('opacity', '0');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0);
                chart.tooltips
                    .style('display', 'none');
            });
        }
    };
    
    return ir;
};

/**
 * NMR chart extending the base chart. 
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.chart.nmr
 * @returns the NMR chart
 */
st.chart.nmr = function () {
    var nmr = chart(); // create and extend base chart
    
    /**
     * Renders the base chart to the container.
     *
     * @params {string} x - the id of the container
     */
    nmr.render = function (x) {
        var margins = this.opts.margins;
        this.width = $(x).width() - margins[1] - margins[3];
        this.height = $(x).height() - margins[0] - margins[2];
    
        var chart = this;

        // container for x and y scale
        this.scales = { 
            x: d3.scale.linear()
                .domain([1, 0])
                .range([0, this.width]),
            y: d3.scale.linear()
                .range([this.height, 0])
        };
        
        this.mousewheel = d3.behavior.zoom()
            .y(this.scales.y)
            .center([0, this.scales.y(0)])
            .on("zoom", function() {
                chart.renderdata();
            });
        
        this.panel = d3.select(x)
            .append('svg:svg')
            .attr('class', 'st-base')
            .attr('width', this.width + margins[1] + margins[3])
            .attr('height', this.height + margins[0] + margins[2])
            .call(this.mousewheel)
            .on('mousedown.zoom', function () { // --- mouse options ---
                chart.mouseDown(this);
            })
            .on('mousemove.zoom', function () { // --- mouse options ---
                chart.mouseMove(this);
            })
            .on('mouseup.zoom', function () {   // --- mouse options ---
                chart.mouseUp(this);
            })
            .on('dblclick.zoom', function () {  // --- mouse options ---
                chart.mouseDbl();
            });
            
        this.canvas = this.panel
            .append('svg:g') // append plot group within chart canvas
            .attr('transform', 'translate(' + margins[3] + ',' + margins[0] + ')');

        // add SVG clip path
        this.canvas.append('svg:clipPath')
            .attr('id', 'clip')
            .append('svg:rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height);

        // add selection rectangle
        this.selection = this.canvas.append('svg:rect')
            .attr('class', 'st-selection')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 0)
            .attr('height', 0)
            .style('pointer-events', 'none')
            .attr('display', 'none');
        
        // define and render axis
        this.renderAxes();
        
        // draw the title
        if (this.opts.title && this.opts.title.length !== 0) {
            this.panel.append('text')
                .attr('x', margins[3] + (this.width / 2))
                .attr('y', margins[0] * 0.75)
                .attr('text-anchor', 'middle')
                .attr('font-size', 'large')
                .text(this.opts.title)
        }
            
        // define custom behavior
        if (typeof this.behavior == 'function') {
            this.behavior();
        }
        
        return this;
    };
    
    /**
     * Rescales the x domain.
     */
    nmr.xscale = function () {
        this.scales.x
            .domain([
                this.data.raw.gxlim[1],
                this.data.raw.gxlim[0]
            ])
            .nice();
    };
    
    /**
     * Rescales the y domain.
     */
    nmr.yscale = function () {
        this.scales.y
            .domain(this.data.raw.gylim)
            .nice();
    };
    
    /**
     * Defines and renders the axes (direction, tick marks, etc.).
     * Axes follow standard cartesian coordinate conventions.
     */
    nmr.renderAxes = function () {
        var margins = this.opts.margins;
        var xFormat = d3.format('.4g');
        
        this.xaxis = d3.svg.axis()
            .scale(this.scales.x)
            .ticks(6)
            .tickSubdivide(true)
            .tickFormat(xFormat)
            .orient('bottom');

        this.canvas.append('svg:g')
            .attr('class', 'st-xaxis')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(this.xaxis);

        if (this.opts.xlabel !== '') {
            this.panel.select('.st-xaxis').append('text')
                .text(this.opts.xlabel)
                .attr('text-anchor', 'middle')
                .attr('x', this.width / 2)
                .attr('y', margins[2] / 2);
        }
    };
    
    /**
     * Defines default action for mouse down events.
     * 
     * @param event - mouse event
     */
    nmr.mouseDown = function (event) {
        var p = d3.mouse(event);
        var left = this.opts.margins[3];
        this.panel.select('.st-selection')
            .attr('x', p[0] - left)
            .attr('xs', p[0] - left)
            .attr('width', 1)
            .attr('height', this.height)
            .attr('display', 'inline');
    };

    /**
     * Defines default action for mouse move events.
     * 
     * Updates the selection rectangle if visible.
     * 
     * @param event - mouse event
     */
    nmr.mouseMove = function (event) {
        var s = this.panel.select('.st-selection')
        if (s.attr('display') === 'inline') {
            var pointerX = d3.mouse(event)[0] - this.opts.margins[3],
                anchorWidth = parseInt(s.attr('width'), 10),
                pointerMoveX = pointerX - parseInt(s.attr('x'), 10),
                anchorXS = parseInt(s.attr('xs'), 10);
                
            if (pointerMoveX < 1 && (pointerMoveX * 2) < anchorWidth) {
                s.attr('x', pointerX);
                s.attr('width', anchorXS - pointerX);
            } else {
                s.attr('width', pointerMoveX);
            }
        }
    };

    /**
     * Defines default action for mouse up events.
     * 
     * Zooms to the selected area in x and y.
     * 
     * @param event - mouse event
     */
    nmr.mouseUp = function () {
        var tolerance = 5; // px threshold for selections
        var selection = this.panel.select('.st-selection');
        if (parseInt(selection.attr('width')) > tolerance) {
            var x = parseFloat(selection.attr('x'));
            var width = parseFloat(selection.attr('width'));

            width = this.scales.x.invert(x + width);

            x = this.scales.x.invert(x);
            this.scales.x.domain([x, width]).nice();

            selection.attr('display', 'none');
            this.canvas.select('.st-xaxis').call(this.xaxis);
            
            if (typeof this.renderdata == 'function' && this.data !== null) {
                this.renderdata();
            }
        } else {
            selection.attr('display', 'none');
        }
    };

    /**
     * Defines default action for mouse double-click events.
     * 
     * Resets the chart zoom in x and y to 100%.
     */
    nmr.mouseDbl = function () {
        if (this.data === null) {
            this.scales.x.domain([1, 0]).nice();
            this.scales.y.domain([0, 1]).nice();
            this.canvas.select('.st-xaxis').call(this.xaxis);
            return;
        }
    
        this.scales.x.domain([
            this.data.raw.gxlim[1],
            this.data.raw.gxlim[0]
        ]).nice();
        this.scales.y.domain(this.data.raw.gylim).nice();

        this.canvas.select('.st-xaxis').call(this.xaxis);
        
        if (typeof this.renderdata == 'function') {
            this.data.reset();
            this.renderdata();
        }
    };
    
    /**
     * Loads and associdates the data container with the chart.
     *
     * @param {object} data - the data container
     */
    nmr.load = function (data) {
        var chart = this;
        this.data = data;
        var oldadd = data.add;
        data.add = function() {
            oldadd.apply(this, arguments);
            chart.data.push(function () {
                chart.xscale();
                chart.yscale();
                chart.mousewheel.y(chart.scales.y)
                    .center([0, chart.scales.y(0)]);
            
                chart.canvas.select('.st-xaxis').call(chart.xaxis);            
                chart.renderdata();
                if (chart.opts.legend) {
                    chart.renderLegend();
                }
            });
        };
        var oldremove = data.remove;
        data.remove = function() {
            var ids = oldremove.apply(this, arguments);
            for (var i in ids) {
                chart.canvas.selectAll('.' + ids[i]).remove();
            }
            if (chart.opts.legend) {
                chart.renderLegend();
            }
        };
    };
    
    /**
     * Renders the data.
     */
    nmr.renderdata = function () {
        var data = this.data.bin(this.width, this.scales.x);
        var chart = this;
        for (var i = 0; i < data.length; i++) {
            var series = data[i];
            var id = this.data.id(i);
            var title = this.data.titleat(i);
            var accs = this.data.accs(i);
            var line = d3.svg.line()
                .x(function (d) {
                    return chart.scales.x(d[accs[0]]);
                })
                .y(function (d) {
                    return chart.scales.y(d[accs[1]]);
                });
            this.canvas.selectAll('.' + id).remove();
            var g = this.canvas.append('g')
                .attr('class', id);
            g.append('svg:path')
                .attr('clip-path', 'url(#clip)')
                .style('stroke', this.colors.get(title))
                .attr('d', line(series));
        }
    };
    
    return nmr;
};

/**
 * 2D NMR chart extending the base chart. 
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.chart.nmr2d
 * @returns the 2d NMR chart
 */
st.chart.nmr2d = function () {
    var nmr2d = chart(); // create and extend base chart
    
    /**
     * Rescales the x domain.
     */
    nmr2d.xscale = function () {
        this.scales.x
            .domain([
                this.data.raw.gxlim[1],
                this.data.raw.gxlim[0]
            ])
            .nice();
    };
    
    /**
     * Rescales the y domain.
     */
    nmr2d.yscale = function () {
        this.scales.y
            .domain([
                this.data.raw.gylim[1],
                this.data.raw.gylim[0]
            ])
            .nice();
    };
    
    /**
     * Adds utilities for custom behavior.
     */
    nmr2d.behavior = function () {
        this.scales.x.domain([1, 0]);
        this.scales.y.domain([1, 0]);
        var selX = this.canvas.append('svg:rect')
            .attr('class', 'st-selection')
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', this.height)
            .style('pointer-events', 'none')
            .attr('visibility', 'hidden');
        var selY = this.canvas.append('svg:rect')
            .attr('class', 'st-selection')
            .attr('x', 0)
            .attr('width', this.width)
            .attr('height', 1)
            .style('pointer-events', 'none')
            .attr('visibility', 'hidden');
        var that = this;
        d3.select('.st-base').on('mousemove', function () {
            var pointerX = d3.mouse(this)[0] - that.opts.margins[3];
            var pointerY = d3.mouse(this)[1] - that.opts.margins[0];
            if (pointerX < 0 || pointerX > that.width
                || pointerY < 0 || pointerY > that.height) {
                selX.attr('visibility', 'hidden');
                selY.attr('visibility', 'hidden');
            } else {
                selX.attr('x', pointerX);
                selY.attr('y', pointerY);
                selX.attr('visibility', 'visible');
                selY.attr('visibility', 'visible');
            }
            })
            .append('svg:rect')
            .attr('class', 'st-mouse-capture')
            .style('visibility', 'hidden')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height);
    };
    /**
     * Defines and renders the axes (direction, tick marks, etc.).
     * Axes follow standard cartesian coordinate conventions.
     */
    nmr2d.renderAxes = function () {
        var margins = this.opts.margins;
        var xFormat = d3.format('.3g');
        
        this.xaxis = d3.svg.axis()
            .scale(this.scales.x)
            .ticks(6)
            .tickSubdivide(true)
            .tickFormat(xFormat)
            .tickSize(-this.height)
            .tickPadding(5)
            .orient('bottom');
        this.yaxis = d3.svg.axis().scale(this.scales.y)
            .ticks(6)
            .tickFormat(xFormat)
            .tickSize(-this.width)
            .tickPadding(5)
            .orient('right');

        this.canvas.append('svg:g')
            .attr('class', 'st-xaxis')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(this.xaxis);
        this.canvas.append('svg:g')
            .attr('class', 'st-yaxis')
            .attr('transform', 'translate(' + this.width + ',0)')
            .call(this.yaxis);

        if (this.opts.xlabel !== '') {
            d3.select('.st-xaxis').append('text')
                .text(this.opts.xlabel)
                .attr('text-anchor', 'middle')
                .attr('x', this.width / 2)
                .attr('y', margins[2] / 2);
        }
        if (this.opts.ylabel !== '') {
            d3.select('.st-yaxis').append('text')
                .text(this.opts.ylabel)
                .attr('transform', 'rotate (-90)')
                .attr('text-anchor', 'middle')
                .attr('x', 0 - this.height / 2)
                .attr('y', margins[1] / 2);
        }
    };
    
    /**
     * Renders the data.
     */
    nmr2d.renderdata = function () {
        var data = this.data.get(this.width, this.scales.x);
        var chart = this;
        for (var i = 0; i < data.length; i++) {
            var series = data[i];
            var id = this.data.id(i);
            var title = this.data.titleat(i);
            var accs = this.data.accs(i);
            this.canvas.selectAll('.' + id).remove();
            var g = this.canvas.append('g')
                .attr('class', id);
            g.selectAll('.' + id + '.circle').data(series)
                .enter()
                .append('svg:circle')
                .attr('clip-path', 'url(#clip)')
                .style('fill', this.colors.get(title))
                .style('stroke', this.colors.get(title))
                .attr("r", 3)
                .attr("cx", function (d) { 
                    return chart.scales.x(d[accs[0]]) 
                })
                .attr("cy", function (d) { 
                    return chart.scales.y(d[accs[1]]) 
                })
        }
    };
    
    return nmr2d;
};

if (typeof define === 'function' && define.amd) {
    define(st);
} else if (typeof module === 'object' && module.exports) {
    module.exports = st;
} else {
    this.st = st;
}
}();
