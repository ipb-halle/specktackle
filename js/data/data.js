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
            x: 'x',     // x accessor
            y: 'y',     // y accessor
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
                    if (x < this.raw.series.length) {
                        var spliced = this.raw.series.splice(x, 1);
                        ids.push(spliced[0].id);
                        delete this.raw.ids[spliced[0].id];
                    }
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
        
        annotation: function (type, name) {
            if (type === st.annotation.ANNOTATION) {
            
            } else if (type === st.annotation.TOOLTIP) {
            
            } else {
                console.log('Unknown annotation type: ' + type);
            }
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

