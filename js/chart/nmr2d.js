import "chart";

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