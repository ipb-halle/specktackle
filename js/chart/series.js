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
        this.scales.x
            .domain(this.data.raw.gxlim)
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
                .attr("r", 2)
                .attr("cx", function (d) { 
                    return chart.scales.x(d[accs[0]]) 
                })
                .attr("cy", function (d) { 
                    return chart.scales.y(d[accs[1]]) 
                })
            .on('mouseover', function (d) {
                d3.select(this).attr('r', 4);
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
                d3.select(this).attr('r', '2');
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