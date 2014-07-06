import "../util/domain";
import "../util/colors";
import "../data/array";
import "../data/set";
import "../data/data";

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
            this.scales = { 
                x: d3.scale.linear()
                    .range([0, this.width]),
                y: d3.scale.linear()
                    .range([this.height, 0])
            };
            
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