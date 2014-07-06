import "chart";

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
            .attr('font-size', 'x-small')
            .text('')
        var chart = this;
        var xFormat = d3.format('.4g');
        this.plotted = [];
        this.panel.on('mousemove', function () {
            var mousex = d3.mouse(this)[0] - chart.opts.margins[3];
            var plotx = chart.scales.x.invert(mousex);
            var plotdomain = chart.scales.x.domain();
            if (plotx < plotdomain[0] && plotx >= plotdomain[1]) {
                chart.xpointer.text('x = ' + xFormat(plotx));
                for (var i = 0; i < chart.plotted.length; i++) {
                    var accs = chart.data.accs(i);
                    var bisector = d3.bisector(function (d) {
                        return d[accs[0]];
                    }).left;
                    var j = bisector(chart.plotted[i], plotx);
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
            } else {
                chart.xpointer.text('');
                for (var i = 0; i < chart.plotted.length; i++) {
                    chart.canvas.select('.' + chart.data.id(i) + 'focus')
                        .attr('display', 'none');
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