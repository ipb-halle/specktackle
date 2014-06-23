import "../util/domain";
import "data";

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
                array_fetch(json, src, array);
            });
        } else {
            array_fetch(src, '' + (new Date().getTime() * Math.random()), array);
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
     * @returns the binned data array
     */
    array.bin = function (width, xscale) {
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
                    if (dpb[series.accs[1]] > ys) {
                        binned[bin - cor] = dpb;
                    } else {
                        binned[bin - cor] = { 
                            x: x
                        };
                        binned[bin - cor][series.accs[1]] = ys;
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

function array_fetch (json, src, array) {
    var id = st.util.hashcode(src); // model id
    var xlim = [];                  // model x limits
    var ylim = [];                  // model y limits
    var size = [];                  // model size: min, max, nBins
    var xacc = 'x';                 // model x accessor
    var yacc = array.opts.y;        // model y accessor

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

    // add model as raw entry
    array.raw.series.push({
        id: id,             
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