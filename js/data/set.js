import "../util/domain";
import "../util/hashcode";
import "data";

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
    set.fetch = function (src, anno) {
        var set = this;
        var jqxhr = null;
        if (typeof src === 'string') {
            if (typeof anno === 'string' && anno) {
                jqxhr = $.when(
                    $.get(src),
                    $.get(anno)
                ).then(function(json, json2) {
                    if (json[0] instanceof Array) {
                        for (var i in json[0]) {
                            set_fetch(json[0][i], json2[0][i], set);
                        }
                    } else {
                        set_fetch(json[0], json2[0], set);
                    }
                });
            } else {
                jqxhr = $.when(
                    $.get(src)
                ).then(function(json) {
                    if (json instanceof Array) {
                        for (var i in json) {
                            set_fetch(json[i], anno[i], set);
                        }
                    } else {
                        set_fetch(json, anno, set);
                    }
                });
            }
        } else {
            if (typeof anno === 'string' && anno) {
                jqxhr = $.when(
                    $.get(anno)
                ).then(function(json) {
                    if (src instanceof Array) {
                        for (var i in src) {
                            set_fetch(src[i], json[i], set);
                        }
                    } else {
                        set_fetch(src, json, set);
                    }
                });
            } else {
                if (src instanceof Array) {
                    for (var i in src) {
                        set_fetch(src[i], anno[i], set);
                    }
                } else {
                    set_fetch(src, anno, set);
                }
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
                        if (Math.abs(dpb[series.accs[1]]) > 
                            Math.abs(dps[series.accs[1]])) {
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

function set_fetch (json, json2, set) {
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
    
    // assign annotations
    if (json2) {
        var bisector = d3.bisector(function (d) {
            return d[xacc];
        }).left;
        for (var i in json2) {
            var ref = json2[i][0];
            var refpos = bisector(data, ref);
            if (refpos !== -1 && ref === data[refpos][xacc]) {
                for (var j = 0; j < set.opts.annoTypes.length; j++) {
                    if (set.opts.annoTypes[j] === st.annotation.ANNOTATION) {
                        data[refpos].annotation = json2[i][j + 1];
                    } else if (set.opts.annoTypes[j] === st.annotation.TOOLTIP) {
                        if (!data[refpos].tooltip) {
                            data[refpos].tooltip = {};
                        }
                        data[refpos].tooltip[set.opts.annoTexts[j]] = json2[i][j + 1];
                    } else if (set.opts.annoTypes[j] === st.annotation.TOOLTIP_MOL) {
                        if (!data[refpos].tooltipmol) {
                            data[refpos].tooltipmol = {};
                        }
                        data[refpos].tooltipmol[set.opts.annoTexts[j]] = json2[i][j + 1];
                    }
                }
            }
        }
    }
    
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