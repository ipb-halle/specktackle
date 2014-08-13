import "../util/domain";
import "../util/mol2svg";
import "../util/spinner";
import "../util/colors";
import "../data/array";
import "../data/set";
import "../data/data";

/**
 * Base chart to be extended by custom charts.
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @constructor
 * @returns {object} the base chart
 */
st.chart = {};

/**
 * Builds the base chart object that serves as base for custom charts.
 * 
 * @constructor
 * @returns {object} the base chart
 */
function chart () {
    return {
        opts: { // chart options
            title: '',          // chart title
            xlabel: '',         // chart x-axis label
            ylabel: '',         // chart y-axis label
            xreverse: false,    // whether to reverse the x-axis
            yreverse: false,    // whether to reverse the y-axis
            legend: false,      // whether to display the legend
            margins: [80, 80, 80, 120]  // canvas margins: t, r, b, l
        },
        
        // internal data binding: references the data set
        data: null,
        // internal timeout object for async. requests
        timeout: null,
        // internal color chooser
        colors: st.util.colors(),
        // SDfile SVG renderer object set for an output of 250 px by 250 px
        mol2svg: st.util.mol2svg(250, 250),
        
        /**
         * Sets the chart title option.
         *
         * @param {string} title A chart title 
         * @returns {object} the base chart
         */
        title: function (title) {
            this.opts.title = title;
            return this;
        },
        
        /**
         * Sets the chart x-axis label option.
         *
         * @param {string} xlabel A x-axis label
         * @returns {object} the base chart
         */
        xlabel: function (xlabel) {
            this.opts.xlabel = xlabel;
            return this;
        },
        
        /**
         * Sets the chart y-axis label option.
         *
         * @param {string} ylabel A y-axis label
         * @returns {object} the base chart
         */
        ylabel: function (ylabel) {
            this.opts.ylabel = ylabel;
            return this;
        },
        
        /**
         * Sets whether to reverse the x-axis.
         *
         * @param {boolean} reverse Whether to reverse the x-axis
         * @returns {object} the base chart
         */
        xreverse: function (reverse) {
            this.opts.xreverse = reverse;
            return this;
        },
        
        /**
         * Sets whether to reverse the y-axis.
         *
         * @param {boolean} reverse Whether to reverse the y-axis
         * @returns {object} the base chart
         */
        yreverse: function (reverse) {
            this.opts.yreverse = reverse;
            return this;
        },
        
        /**
         * Sets whether to display the legend.
         *
         * @param {boolean} display Whether to display the legend
         * @returns {object} the base chart
         */
        legend: function (display) {
            this.opts.legend = display;
            return this;
        },
        
        /**
         * Sets the chart margins.
         *
         * @param {int[]} margs The margins: top, right, bottom, left
         * @returns {object} the base chart
         */
        margins: function (margs) {
            this.opts.margins = margs;
            return this;
        },
        
        /**
         * Renders the base chart to the target div.
         *
         * <div id="stgraph" class="stgraph">
         *
         * |-----------------------------------|
         * |Panel                              |
         * |   |----------------------| Legend |
         * |   |Canvas                |  s1    |
         * |   |        ..            |  s2    |
         * |   |      .    .          |        |
         * |   |     .     .          |        |
         * |   |    .       ..        |        |
         * |   |  ..          ...     |        |
         * |   |----------------------|        |
         * |                                   |
         * |-----------------------------------|
         * 
         * </div>
         *
         * @params {string} x The id of the div
         */
        render: function (x) {
            // reference id of the div
            this.target = x;
            // get margin option...
            var margins = this.opts.margins;
            // ...calculate width and height of the canvas inside the panel
            this.width = $(x).width() - margins[1] - margins[3];
            this.height = $(x).height() - margins[0] - margins[2];
        
            // self-reference for nested functions
            var chart = this;
            
            // create the panel SVG element and define the base zoom behavior
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
                .on('mouseout', function() {        // --- mouse options ---
                    chart.mouseOut(this);
                })
                .on('dblclick.zoom', function () {  // --- mouse options ---
                    chart.mouseDbl();
                });
                
            // append the chart canvas as group within the chart panel
            this.canvas = this.panel
                .append('svg:g')
                .attr('transform', 'translate(' + 
                    margins[3] + ',' + margins[0] + ')');

            // add the SVG clip path on top of the canvas
            this.canvas.append('svg:clipPath')
                .attr('id', 'clip-' + this.target)
                .append('svg:rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', this.width)
                .attr('height', this.height);

            // add a hidden selection rectangle
            this.selection = this.canvas.append('svg:rect')
                .attr('class', 'st-selection')
                .attr('clip-path', 'url(#clip-' + this.target + ')')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 0)
                .attr('height', 0)
                .style('pointer-events', 'none')
                .attr('display', 'none');

            // scale object with initial d3 x- and y-scale functions
            this.scales = {};
            if (this.opts.xreverse) {   // check whether axis is reversed...
                this.scales.x = d3.scale.linear()
                    .domain([1, 0])      // ...invert the x-domain limits
                    .range([0, this.width])
            } else {
                this.scales.x = d3.scale.linear()
                    .domain([0, 1])
                    .range([0, this.width])
            }
            if (this.opts.yreverse) {   // check whether axis is reversed...
                this.scales.y = d3.scale.linear()
                    .domain([1, 0])      // ...invert the y-domain limits
                    .range([this.height, 0])
            } else {
                this.scales.y = d3.scale.linear()
                    .domain([0, 1])
                    .range([this.height, 0])
            }
            
            // add a hidden div that serves as tooltip
            this.tooltips = d3.select(x).append('div')
                .attr('width', $(x).width())
                .attr('height', $(x).height())
                .style('pointer-events', 'none')
                .attr('class', 'st-tooltips')
                .style('position', 'absolute')
                .style('opacity', 0);
            // split the tooltip div into a key-value pair section for
            // annotations of type st.annotation.TOOLTIP...
            this.tooltips.append('div')
                .attr('id', 'tooltips-meta')
                .style('height', '50%')
                .style('width', '100%');
            // ...and a section for molecules resolved through URLs pointing
            // to SDfiles for annotations of type st.annotation.TOOLTIP_MOL
            this.tooltips.append('div')
                .attr('id', 'tooltips-mol')
                .style('height', '50%')
                .style('width', '100%');
            
            // implement custom behavior if defined in the extension
            if (typeof this.behavior == 'function') {
                this.behavior();
            }
            
            // define and render the x- and y-axis
            this.renderAxes();
            
            // draw the title
            if (this.opts.title && this.opts.title.length !== 0) {
                this.panel.append('text')
                    .attr('class', 'st-title')
                    .attr('x', margins[3] + (this.width / 2))
                    .attr('y', margins[0] * 0.75)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 'large')
                    .text(this.opts.title)
            }
        },
        
        /**
         * Defines and renders the x- and y-axis (direction, tick marks, etc.).
         * Axes follow standard cartesian coordinate conventions.
         */
        renderAxes: function () {
            var margins = this.opts.margins;
            // format numbers to four decimals: 1.2345678 to 1.2346
            var xFormat = d3.format('.4g');
            // format numbers to two decimals: 1.2345678 to 1.23
            var yFormat= d3.format(',.2g');
            
            this.xaxis = d3.svg.axis()  // define the x-axis
                .scale(this.scales.x)
                .ticks(6)
                .tickSubdivide(true)
                .tickFormat(xFormat)
                .orient('bottom');
            this.yaxis = d3.svg.axis()  // define the y-axis
                .scale(this.scales.y)
                .ticks(4)
                .tickFormat(yFormat)
                .orient('left');

            this.canvas.append('svg:g') // draw the x-axis
                .attr('class', 'st-xaxis')
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(this.xaxis);
            this.canvas.append('svg:g') // draw the y-axis
                .attr('class', 'st-yaxis')
                .attr('transform', 'translate(-25, 0)')
                .call(this.yaxis);

            if (this.opts.xlabel !== '') {  // draw x-label if defined
                this.panel.select('.st-xaxis').append('text')
                    .text(this.opts.xlabel)
                    .attr('text-anchor', 'middle')
                    .attr('x', this.width / 2)
                    .attr('y', margins[2] / 2);
            }
            if (this.opts.ylabel !== '') {  // draw y-label if defined
                this.panel.select('.st-yaxis').append('text')
                    .text(this.opts.ylabel)
                    .attr('transform', 'rotate (-90)')
                    .attr('text-anchor', 'middle')
                    .attr('x', 0 - this.height / 2)
                    .attr('y', 0 - margins[3] / 2);
            }
        },
        
        /**
         * Defines the default zoom action for mouse down events.
         * 
         * @param {object} event A mouse event
         */
        mouseDown: function (event) {
            var p = d3.mouse(event);            // get the mouse position
            var left = this.opts.margins[3];
            var top = this.opts.margins[0];
            this.panel.select('.st-selection')  // set the selection rectangle
                .attr('x', p[0] - left)         // to the mouse position on
                .attr('xs', p[0] - left)        // the canvas and make the sel-
                .attr('y', p[1] - top)          // ection rectangle visible
                .attr('ys', p[1] - top)
                .attr('width', 1)
                .attr('height', 1)
                .attr('display', 'inline');
        },

        /**
         * Defines the default zoom action for mouse move events.
         * 
         * @param {object} event A mouse event
         */
        mouseMove: function (event) {
            // get the selection rectangle
            var s = this.panel.select('.st-selection')
            if (s.attr('display') === 'inline') { // proceed only if visible
                // get the corected mouse position on the canvas
                var pointerX = d3.mouse(event)[0] - this.opts.margins[3],
                    pointerY = d3.mouse(event)[1] - this.opts.margins[0],
                    // get the width and height of the selection rectangle
                    anchorWidth = parseInt(s.attr('width'), 10),
                    anchorHeight = parseInt(s.attr('height'), 10),
                    // get the distance between the selection rectangle start
                    // coordinates and the corrected mouse position
                    pointerMoveX = pointerX - parseInt(s.attr('x'), 10),
                    pointerMoveY = pointerY - parseInt(s.attr('y'), 10),
                    // get the original start coordinates of the rectangle
                    anchorXS = parseInt(s.attr('xs'), 10),
                    anchorYS = parseInt(s.attr('ys'), 10);
                
                // update the selection rectangle...
                if ((pointerMoveX < 0 && pointerMoveY < 0) // ...quadrant II
                    || (pointerMoveX * 2 < anchorWidth
                    && pointerMoveY * 2 < anchorHeight)) {
                    s.attr('x', pointerX);
                    s.attr('width', anchorXS - pointerX);
                    s.attr('y', pointerY);
                    s.attr('height', anchorYS - pointerY);
                } else if (pointerMoveX < 0                 // ...quadrant I
                    || (pointerMoveX * 2 < anchorWidth)) {
                    s.attr('x', pointerX);
                    s.attr('width', anchorXS - pointerX);
                    s.attr('height', pointerMoveY);
                } else if (pointerMoveY < 0                 // ...quadrant I
                    || (pointerMoveY * 2 < anchorHeight)) {
                    s.attr('y', pointerY);
                    s.attr('height', anchorYS - pointerY);
                    s.attr('width', pointerMoveX);
                } else {                                    // ...quadrant IV
                    s.attr('width', pointerMoveX);
                    s.attr('height', pointerMoveY);
                }
            }
        },

        /**
         * Defines the default zoom action for mouse up events.
         */
        mouseUp: function () {
            // px threshold for selections
            var tolerance = 5; 
            // get the selection rectangle
            var selection = this.panel.select('.st-selection');
            
            // check if the px threshold has been exceeded in x and y
            if (parseInt(selection.attr('width')) > tolerance
                && parseInt(selection.attr('height')) > tolerance) {
                // get the start coordinates of the rectangle
                var x = parseFloat(selection.attr('x'));
                var y = parseFloat(selection.attr('y'));
                // get the width and height of the selection rectangle
                var width = parseFloat(selection.attr('width'));
                var height = parseFloat(selection.attr('height'));
                
                // convert the width and height to the domain range
                width = this.scales.x.invert(x + width);
                height = this.scales.y.invert(y + height);
                // convert the start coordinates to the domain range
                x = this.scales.x.invert(x);
                y = this.scales.y.invert(y);

                if (height < 0) { // sanity check
                    height = 0;
                }

                // rescale the x and y domain based on the new values
                this.scales.x.domain([x, width]).nice();
                this.scales.y.domain([height, y]).nice();
                
                // clean up: hide the selection rectangle
                selection.attr('display', 'none');
                // clean up: re-draw the x- and y-axis
                this.canvas.select('.st-xaxis').call(this.xaxis);
                this.canvas.select('.st-yaxis').call(this.yaxis);
                // clean up: re-draw the data set
                if (typeof this.renderdata == 'function' && 
                    this.data !== null) {
                    this.renderdata();
                }
            } else {
                // hide the selection rectangle
                selection.attr('display', 'none');
            }
        },
        
        /**
         * Defines the default zoom action for mouse out events.
         */
        mouseOut: function(event) {
            // get the selection rectangle
            var selection = this.panel.select('.st-selection');
            // get the mouse position
            var pointerX = d3.mouse(event)[0],
                pointerY = d3.mouse(event)[1];
            
            // hide the selection rectangle if the
            // mouse has left the panel of the chart
            if (pointerX < 0 || pointerY < 0 ||
                pointerX > $(this.target).width() ||
                pointerY > $(this.target).height()) {
                    selection.attr('display', 'none');
            }
        },

        /**
         * Defines the default zoom action for mouse double-click events.
         */
        mouseDbl: function () {
            if (this.data === null) {   // default for empty charts
                var xdom = st.util.domain(this.scales.x, [0, 1]);
                var ydom = st.util.domain(this.scales.y, [0, 1]);
                this.scales.x.domain(xdom).nice();
                this.scales.y.domain(ydom).nice();
                this.canvas.select('.st-xaxis').call(this.xaxis);
                this.canvas.select('.st-yaxis').call(this.yaxis);
                return;
            }
            
            // reset the global x and y domain limits
            var gxlim = st.util.domain(this.scales.x, this.data.raw.gxlim);
            var gylim = st.util.domain(this.scales.y, this.data.raw.gylim);
            // rescale the x and y domains
            this.scales.x.domain(gxlim).nice();
            this.scales.y.domain(gylim).nice();
            // re-draw the x- and y-axis
            this.canvas.select('.st-xaxis').call(this.xaxis);
            this.canvas.select('.st-yaxis').call(this.yaxis);
            // re-draw the data set
            if (typeof this.renderdata == 'function') {
                this.data.reset();
                this.renderdata();
            }
        },
        
        /**
         * Defines the default tooltip action for mouse over events.
         * 
         * @param {object} event A mouse event
         * @param {object} d A series data point
         * @param {string[]} accs A series data point accessor array
         */
        mouseOverAction: function (event, d, accs) {
            this.tooltips   // show the tooltip
                .style('display', 'inline');
            this.tooltips   // fade in the tooltip
                .transition()
                .duration(300)
                .style('opacity', 0.9);
            // format numbers to two decimals: 1.2345678 to 1.23
            var format = d3.format('.2f');
            // get the mouse position of the event on the panel
            var pointer = d3.mouse(event);
            
            // get the translated transformation matrix...
            var matrix = event.getScreenCTM()
                .translate(+pointer[0], +pointer[1]);
            // ...to adjust the x- and y-position of the tooltip
            this.tooltips
                .style('left', (window.pageXOffset + matrix.e + 10) + 'px')
                .style('top', (window.pageYOffset + matrix.f - 10) + 'px')
                .style('opacity', 0.9)
                .style('border', 'dashed')
                .style('border-width', '1px')
                .style('padding', '3px')
                .style('border-radius', '10px')
                .style('background-color', 'white');
            var x = format(d[accs[0]]); // format the x value
            var y = format(d[accs[1]]); // format the y value
            // add the x and y value to the tooltip HTML
            d3.selectAll('#tooltips-meta').html(
                this.opts.xlabel + ': ' + 
                x + '<br/>' + this.opts.ylabel + ': ' + y + '<br/>'
            );
            // self-reference for nested functions
            var chart = this;
            // check whether tooltips are assigned to the series point
            if (d.tooltip || d.tooltipmol) {
                // copy the tooltip-meta sub-div 
                var tooltip = d3.selectAll('#tooltips-meta').html();
                // add the tooltip key-value pairs to the tooltip HTML
                for (var key in d.tooltip) {
                    tooltip += key + ': ' + d.tooltip[key] + '<br/>';
                }
                // add the HTML string to the tooltip
                d3.selectAll('#tooltips-meta').html(tooltip + '<br/>');
                // initiate the spinner on the tooltip-mol sub-div 
                var spinner = st.util.spinner('#tooltips-meta');
                // wait 500 ms before XHR is executed
                this.timeout = setTimeout(function () {
                    // hide the spinner
                    spinner.css('display', 'none');
                    // resolve all SDfile URLs one by one 
                    for (var molkey in d.tooltipmol) {
                        var moldivid = '#tooltips-mol-' + molkey;
                        var moldiv = d3.selectAll('#tooltips-mol')
                            .append('div')
                            .attr('id', 'tooltips-mol-' + molkey)
                            .style('float', 'left')
                            .style('height', '100%')
                            .style('width', '50%');
                        // draw to the tooltip-mol sub-div and assign a title
                        d3.selectAll(moldivid).html(
                            '<em>' + molkey + '</em><br/>'
                        );
                        chart.mol2svg.draw(d.tooltipmol[molkey], moldivid);
                    }
                }, 500);
            } else {
                // clear the tooltip-mol sub-div 
                d3.selectAll('#tooltips-mol').html('');
            }
        },
        
        /**
         * Defines the default tooltip action for mouse out events.
         */
        mouseOutAction: function () {
            // clear any timeout from an async. request
            clearTimeout(this.timeout);
            // clear the tooltip-mol sub-div 
            d3.selectAll('#tooltips-mol').html('');
            this.tooltips   // fade the tooltip
                .transition()
                .duration(300)
                .style('opacity', 0);
            this.tooltips   // hide the tooltip
                .style('display', 'none');
        },
        
        /**
         * Draws the chart legend in the top right corner.
         */
        renderLegend: function () {
            // remove the current legend
            this.canvas.select('.st-legend').remove();
            // create a new group element for the data series records
            var legend = this.canvas.append('g')
                .attr('class', 'st-legend')
                .style('cursor', 'pointer');
                
            // self-reference for nested functions
            var colors = this.colors;
            // self-reference for nested functions
            var chart = this;
            
            // iterate over all data series
            for (var i = 0; i < this.data.raw.series.length; i++) {
                // get the series identifier
                var id = this.data.raw.series[i].id;
                // get the series title
                var title = this.data.raw.series[i].title;
                
                // create a new group element for each series
                var lg = legend.append('g').attr('stid', id);
                lg.append('svg:rect')   // append the legend symbol
                    .attr('x', this.width + 5)
                    .attr('y', function () { return i * 20; })
                    .attr('width', 10)
                    .attr('height', 10)
                    .style('fill', function () { return colors.get(id); });
                lg.append('text')       // append the data series's legend text
                    .attr('x', this.width + 20)
                    .attr('y', function () { return i * 20 + 9; })
                    .text(function () {
                        return title;
                    });
                // define series highlights on mouse over events
                lg.on('mouseover', function() { 
                    // select the series
                    d3.select(this).style('fill', 'red');
                    var selectid = d3.select(this).attr('stid');
                    // highlight the selected series
                    chart.canvas.selectAll('.' + selectid)
                        .style('stroke-width', 2);
                    // fade all other series
                    for (var dataid in chart.data.raw.ids) {
                        if (dataid !== selectid) {
                            chart.canvas.selectAll('.' + dataid)
                                .style('opacity', 0.1);
                        }
                    }
                })
                // define series highlight removal on mouse out events
                lg.on('mouseout', function() {
                    // select the series
                    d3.select(this).style('fill', 'black');
                    var selectid = d3.select(this).attr('stid');
                    // reset the selected series
                    chart.canvas.selectAll('.' + selectid)
                        .style('stroke-width', 1);
                    // reset all other series
                    for (var dataid in chart.data.raw.ids) {
                        if (dataid !== selectid) {
                            chart.canvas.selectAll('.' + dataid)
                                .style('opacity', 1);
                        }
                    }
                })
            }
        },
        
        /**
         * Loads and binds the data set to the chart.
         *
         * @param {object} data A data set
         */
        load: function (data) {
            var chart = this;       // self-reference for nested functions
            this.data = data;       // associate with the chart
            var oldadd = data.add;  // copy of the old function
            data.add = function() { // redefine
                oldadd.apply(this, arguments);   // execute old copy
                chart.data.push(function () {    // define callback
                    chart.xscale();              // rescale x
                    chart.yscale();              // rescale y
                    chart.canvas.select('.st-xaxis')
                        .call(chart.xaxis);     // draw the x-axis
                    chart.canvas.select('.st-yaxis')
                        .call(chart.yaxis);     // draw the y-axis
                    chart.renderdata();         // draw the data set
                    if (chart.opts.legend) {
                        chart.renderLegend();   // draw the legend
                    }
                });
            };
            var oldremove = data.remove;    // copy of the old function
            data.remove = function() {      // redefine
                var ids = oldremove.apply(this, arguments); // execute old copy
                // iterate over the identifiers of the removed series
                for (var i in ids) {
                    // remove color entries
                    chart.colors.remove(ids[i]);
                    // remove associated SVG elements from the canvas
                    chart.canvas.selectAll('.' + ids[i]).remove();
                }
                if (chart.opts.legend) {
                    chart.renderLegend(); // redraw the legend
                }
            };
        }
    };
}