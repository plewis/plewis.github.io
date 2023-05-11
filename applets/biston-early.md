---
layout: applet
title: Biston betularia (1848-1898)
permalink: /applets/biston-early/
---
## _Biston betularia_ (peppered moth)
### Decline of the light-colored phenotype from 1848-1898
Use the slider to set the selection coefficient <em>s</em> in Haldane's model, which 
assumes that the light-colored (non-melanic) form is selected against with selection coefficient <em>s</em>. 

Can you find the value of <em>s</em> that reduces 
the light-colored phenotype from 0.99 down to 0.01 over the 50 year period 1948-1898?
Haldane (1924, p. 26) found the value to be approximately 0.3. 

<div id="ctrl" style="width:1000px;text-align:left"></div>
<div id="plot"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 22-Mar-2019

    // width and height of svg
    var w = 800;
    var h = 600;
    var padding = 80;

    // Model
    var s = 1.0;
    var starting_year = 1848;
    var ending_year = 1898;
    var starting_white_freq = 0.99;
    var white_freq = starting_white_freq;

    // plotting-related
    var brickred = "#B82E2E";
    var nsegments = ending_year - starting_year;
    var linedata = [];

    // axes labels
    var axis_label_height = 12;
    var axis_label_height_pixels = axis_label_height + "px";

    // Select DIV elements already created (see above)
    var ctrl_div = d3.select("div#ctrl");
    var plot_div = d3.select("div#plot");

    // Create SVG element
    var svg = plot_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create rect outlining entire area of SVG
    /*plot_svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "lavender");*/
        
    // Create scale for X axis
    var xscale = d3.scaleLinear()
        .domain([starting_year, ending_year])   // recalculated in refreshPlot()
        .range([padding, w - padding]);

    // Create scale for Y axis
    var yscale = d3.scaleLinear()
        .domain([0, 1])
        .range([h - padding, padding]);

    // Create scale for drawing line segments
    var line_scale = d3.scaleBand()
        .domain(d3.range(nsegments))
        .range(xscale.domain());

    // Function that recalculates the line segments making up the transition probability curve
    function recalcLineData() {
        linedata = [];
        white_freq = starting_white_freq; // frequency of bb genotype (white phenotype)
        let q = Math.sqrt(white_freq);
        let p = 1.0 - q;
        let wBB = 1.0;
        let wBb = 1.0;
        let wbb = 1.0 - s;
        for (var g = 0; g < nsegments; g++) {
            // zygote genotype frequencies (before selection)
            pp = p*p;
            qq = q*q;
            pq2 = 1.0 - pp - qq;
            
            // mean relative fitness
            let wmean = pp*wBB + pq2*wBb + qq*(wbb);
            
            // parental genotype frequencies (after selection)
            pp  = pp*wBB/wmean;                                                   
            pq2 = pq2*wBb/wmean;                                                   
            qq  = qq*wbb/wmean;  
            
            // allele frequencies in gamete pool
            p = pp + pq2/2.0;                                           
            q = 1.0 - p;
            
            // frequency of white phenotype in generation g+1
            white_freq = q*q;                                           
            linedata.push({'x':line_scale(g), 'y':white_freq});
        }
    }
    recalcLineData();

    // Create path representing frequency of white phenotype
    var lineFunc = d3.line()
        .x(function(d) {return xscale(d.x);})
        .y(function(d) {return yscale(d.y);});

    var phenotype_tragectory = svg.append("path")
        .attr("id", "trajectory")
        .attr("d", lineFunc(linedata))
        .attr("fill", "none")
        .attr("stroke", brickred)
        .attr("stroke-width", 2)
        .style("pointer-events", "none");   // don't want line intercepting drag events
        
    // Create text element showing final frequency of white phenotype
    var white_ending_freq = svg.append("text")
        .attr("id", "endfreq")
        .attr("x", w - padding + 20)
        .attr("y", yscale(white_freq))
        .text(" " + white_freq.toFixed(3));

    // Create x axis
    var xaxis = d3.axisBottom(xscale)
        .ticks(5)
        .tickFormat(d3.format("d"));

    // Add x axis to svg
    svg.append("g")
        .attr("id", "xaxis")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xaxis);

    // Style the x-axis
    svg.selectAll('.axis line, .axis path')
        .style('stroke', 'black')
        .style('fill', 'none')
        .style('stroke-width', '1px')
        .style('shape-rendering', 'crispEdges');
    svg.selectAll('g#xaxis g.tick text')
        .style('font-family', 'Helvetica')
        .style('font-size', axis_label_height_pixels);

    // Create y axis
    var yaxis = d3.axisLeft(yscale)
        .ticks(4)
        .tickFormat(d3.format(".2f"));

    // Add y axis to svg
    svg.append("g")
        .attr("id", "yaxis")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yaxis);

    // Style the y-axis
    svg.selectAll('.axis line, .axis path')
        .style('stroke', 'black')
        .style('fill', 'none')
        .style('stroke-width', '1px')
        .style('shape-rendering', 'crispEdges');
    svg.selectAll('g#xaxis g.tick text')
        .style('font-family', 'Helvetica')
        .style('font-size', axis_label_height_pixels);

    var addSlider = function(panel, id, label, starting_value, onfunc) {
        var control_div = panel.append("div").append("div")
            .attr("id", id)
            .attr("class", "control");
        control_div.append("input")
            .attr("id", id)
            .attr("type", "range")
            .attr("name", id)
            .attr("min", "0")
            .attr("max", "100")
            .attr("value", starting_value)
            .on("input", onfunc);
        control_div.append("label")
            .append("label")
            .attr("id", id)
            .html("&nbsp;" + label);
        }
        
    addSlider(ctrl_div, "selcoeff", " s = " + s.toFixed(3), 100.0*s, function() {
        // get percentage from slider position
        var pct = parseFloat(d3.select(this).property('value'));
        
        // get selection coefficient from percentage
        s = pct/100;
        
        // redo calculations with new s
        recalcLineData();
        
        // change the label on the slider
        d3.select("label#selcoeff").text(" s = " + s.toFixed(3));
        
        // change the label at the end of the line showing final white phenotype frequency
        white_ending_freq
            .attr("y", yscale(white_freq))
            .text(" " + white_freq.toFixed(3));
            
        // cause trajectory line to be redrawn by telling phenotype_tragectory
        // about the new linedata
        phenotype_tragectory.attr("d", lineFunc(linedata));
        });
        
    // Add explanatory text
    svg.append("text").attr("id", "info").attr("x", xscale(1860)).attr("y", yscale(0.9)).text("Curve and points show frequency of non-melanic form from 1848 to 1898.");
    svg.append("text").attr("id", "w1").attr("x",   xscale(1860)).attr("y", yscale(0.80)).text("BB fitness = 1");
    svg.append("text").attr("id", "w2").attr("x",   xscale(1860)).attr("y", yscale(0.75)).text("Bb fitness = 1");
    svg.append("text").attr("id", "w3").attr("x",   xscale(1860)).attr("y", yscale(0.70)).text("bb fitness = 1 - s");
    svg.append("text").attr("id", "darkallele").attr("x",  xscale(1870)).attr("y", yscale(0.80)).text("B: dominant melanic allele");
    svg.append("text").attr("id", "lightallele").attr("x", xscale(1870)).attr("y", yscale(0.75)).text("b: recessive non-melanic allele");

</script>

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library. Please see the 
[GitHub site](https://github.com/plewis/plewis.github.io/assets/js) 
for details about licensing of other libraries that may have been used in the 
source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
