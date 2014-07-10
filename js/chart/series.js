import "chart";

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
        this.tooltips = this.panel.append('foreignObject')
            .attr('width', $(this.target).width())
            .attr('height', $(this.target).height())
            .style('pointer-events', 'none')
            .append('xhtml:div')
            .attr('class', 'st-tooltips')
            .style('position', 'absolute')
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
            if (chart.opts.xreverse) {
                var within = function () {
                    return plotx < plotdomain[0] && plotx >= plotdomain[1];
                }
            } else {
                var within = function () {
                    return plotx >= plotdomain[0] && plotx < plotdomain[1];
                }
            }
            if (within()) {
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
                    if (dp) {
                        var ploty = chart.scales.y(dp[accs[1]]);
                        if (ploty < 0) {
                            ploty = 0;
                        } else if (ploty > chart.height) {
                            ploty = chart.height;
                        }
                        chart.canvas.select('.' + chart.data.id(i) + 'focus')
                            .attr('display', 'inline')
                            .attr('transform', 'translate(' + 
                            chart.scales.x(dp[accs[0]]) + ',' + 
                             ploty + ')');
                    }
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
    series.renderdata = function () {
        var data = this.data.bin(this.width, this.scales.x);
        this.plotted = data;
        var chart = this;
        var format = d3.format('.2f');
        for (var i = 0; i < data.length; i++) {
            var series = data[i];
            var id = this.data.id(i);
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
                .attr('clip-path', 'url(#clip-' + this.target + ')')
                .style('stroke', this.colors.get(id))
                .attr('d', line(series));
            g.append('svg:circle')
                .attr('class', id + 'focus')
                .style('stroke', this.colors.get(id))
                .style('fill', 'none')
                .attr('r', 3)
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('display', 'none')
            g.selectAll('.' + id + '.circle').data(series)
                .enter()
                .append('svg:circle')
                .attr('clip-path', 'url(#clip-' + this.target + ')')
                .style('fill', this.colors.get(id))
                .style('stroke', this.colors.get(id))
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
                var pointer = d3.mouse(this);
                chart.tooltips
                    .style('display', 'inline');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0.9);
                chart.tooltips
                    .style('left', pointer[0] + chart.opts.margins[3] + 10 + 'px')
                    .style('top', pointer[1] + chart.opts.margins[0] - 10 + 'px')
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