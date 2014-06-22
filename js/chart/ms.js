import "../util/mol2svg";
import "../util/spinner";
import "chart";

/**
 * Mass spectrometry chart extending the base chart. 
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.chart.ms
 * @returns the mass spectrometry chart
 */
st.chart.ms = function () {
    var ms = chart(); // create and extend base chart
    
    /**
     * Rescales the x domain.
     */
    ms.xscale = function () {
        this.scales.x
            .domain(this.data.raw.gxlim)
            .nice();
    };
    
    /**
     * Rescales the y domain.
     */
    ms.yscale = function () {
        this.scales.y
            .domain(this.data.raw.gylim)
            .nice();
    };
    
    /**
     * Adds utilities for custom behavior.
     */
    ms.behavior = function () {
        this.tooltips = d3.select(this.target).append('div')
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
   
    // add the MDL molfile to SVG renderer   
    ms.mol2svg = st.util.mol2svg(200, 200);
    
    /**
     * Renders the data.
     */
    ms.renderdata = function () {
        var data = this.data.bin(this.width, this.scales.x);
        var chart = this;
        var timeout;
        var format = d3.format('.2f');
        for (var i = 0; i < data.length; i++) {
            var series = data[i];
            var id = this.data.id(i);
            var accs = this.data.accs(i);
            this.canvas.selectAll('.' + id).remove();
            var g = this.canvas.append('g')
                .attr('class', id);
            g.selectAll('.' + id + '.line').data(series)
                .enter()
                .append('svg:line')
                .attr('clip-path', 'url(#clip)')
                .attr('x1', function (d) { 
                    return chart.scales.x(d[accs[0]])  
                })
                .attr('y1', function (d) { 
                    return chart.scales.y(d[accs[1]])  
                })
                .attr('x2', function (d) { 
                    return chart.scales.x(d[accs[0]])  
                })
                .attr('y2', this.height)
                .style('stroke', this.colors.get(i))
            .on('mouseover', function (d) {
                d3.select(this).style('stroke-width', 2);
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
                if (d.ref) {
                    var spinner = st.util.spinner('#tooltips-mol');
                    // var index = d.ref - 1;
                    // var className = this.className.baseVal;
                    timeout = setTimeout(function () {
                        spinner.css('display', 'none');
                        // get ref
                        chart.mol2svg.draw('http://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/174174/SDF', '#tooltips-mol');
                    }, 500);
                } else {
                    d3.selectAll('#tooltips-mol').html('');
                }
            })
            .on('mouseout', function () {
                clearTimeout(timeout);
                d3.selectAll('#tooltips-mol').html('');
                d3.select(this).style('stroke-width', '1');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0);
                chart.tooltips
                    .style('display', 'none');
            });
        }
    };
    
    return ms;
};