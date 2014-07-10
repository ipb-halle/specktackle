import "chart";

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
        
        this.panel = d3.select(x)
            .append('svg:svg')
            .attr('class', 'st-base')
            .attr('width', this.width + margins[1] + margins[3])
            .attr('height', this.height + margins[0] + margins[2]);    
        init_mouse (chart);
            
        this.canvas = this.panel
            .append('svg:g') // append plot group within chart canvas
            .attr('transform', 'translate(' + margins[3] + ',' + margins[0] + ')');

        // add SVG clip path
        this.canvas.append('svg:clipPath')
            .attr('id', 'clip-' + this.target)
            .append('svg:rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height);

        // add selection rectangle
        this.selection = this.canvas.append('svg:rect')
            .attr('class', 'st-selection')
            .attr('clip-path', 'url(#clip-' + this.target + ')')
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
                .attr('class', 'st-title')
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
            .domain(this.data.raw.gylim);
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
        this.scales.y.domain(this.data.raw.gylim);

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
                init_mouse (chart);                
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
                chart.colors.remove(ids[i]);
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
                .attr('clip-path', 'url(#clip-' + this.target + ')')
                .style('stroke', this.colors.get(id))
                .attr('d', line(series));
        }
    };
    
    return nmr;
};

function init_mouse (chart) {
    var mousewheel = d3.behavior.zoom()
        .y(chart.scales.y)
        .center([0, chart.scales.y(0)])
        .on("zoom", function() {
            if (typeof this.renderdata == 'function' && this.data !== null) {
                chart.renderdata();
            }
        });
    chart.panel.call(mousewheel)
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
        })
}