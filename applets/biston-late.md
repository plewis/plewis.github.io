---
layout: applet
title: Biston betularia (1959-2003)
permalink: /applets/biston-late/
---
## _Biston betularia_ (peppered moth)
### Decline of the melanic phenotype from 1959 to 2003
Use the slider to set the selection coefficient <em>s</em> in the model, which 
assumes that the melanic form is selected against with selection coefficient <em>s</em>. 

Can you find a single value of <em>s</em> that matches the points, which measure the 
frequency of the melanic form each year in a single place ([West Kirby, near Liverpool, 
England](https://goo.gl/maps/h9QniAYgzRr)). You may find that allowing the selection coefficient to change in 1976 helps 
in fitting the model to the empirical measurements. Does the best fitting model assume a 
constant selection coefficient, increasing selection against the melanic form, or 
decreasing selection against the melanic form?

<div id="ctrl"></div>
<div id="plot"></div>
<script type="text/javascript">
    // The MIT License (MIT)
    // 
    // Copyright (c) 2018 Paul O. Lewis
    // 
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the “Software”), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    // 
    // The above copyright notice and this permission notice shall be included in all
    // copies or substantial portions of the Software.
    // 
    // THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.
    // 
    // written by Paul O. Lewis 22-Mar-2019
    
    // Data from Clarke, Cyril A., Bruce Grant, Frieda M. M. Clarke, and 
    // Takahiro Asami. 1994. A long term assessment of Biston betularia (L.)
    // in one UK locality (Caldy Common near West Kirby, Wirral), 1959-1993, 
    // and glimpses elsewhere. The Linnean 10(2):18-26. Appendix I.
    // Data from mercury vapor lights only. Values after 1993 obtained by 
    // eye-balling Figure 2 in Cook, Laurence M. 2003. The rise and fall of 
    // the carbonaria form of the peppered moth. Quarterly Review of Biology 
    // 78(4): 399-417.
    var fraction_carbonaria = [
        {'year':1959, 'fraction':0.933},
        {'year':1960, 'fraction':0.942},
        {'year':1961, 'fraction':0.934},
        {'year':1962, 'fraction':0.929},
        {'year':1963, 'fraction':0.912},
        {'year':1964, 'fraction':0.902},
        {'year':1965, 'fraction':0.900},
        {'year':1966, 'fraction':0.925},
        {'year':1967, 'fraction':0.922},
        {'year':1968, 'fraction':0.893},
        {'year':1969, 'fraction':0.933},
        {'year':1970, 'fraction':0.913},
        {'year':1971, 'fraction':0.899},
        {'year':1972, 'fraction':0.895},
        {'year':1973, 'fraction':0.890},
        {'year':1974, 'fraction':0.878},
        {'year':1975, 'fraction':0.872},
        {'year':1976, 'fraction':0.846},
        {'year':1977, 'fraction':0.897},
        {'year':1978, 'fraction':0.830},
        {'year':1979, 'fraction':0.864},
        {'year':1980, 'fraction':0.763},
        {'year':1981, 'fraction':0.660},
        {'year':1982, 'fraction':0.721},
        {'year':1983, 'fraction':0.637},
        {'year':1984, 'fraction':0.608},
        {'year':1985, 'fraction':0.523},
        {'year':1986, 'fraction':0.470},
        {'year':1987, 'fraction':0.423},
        {'year':1988, 'fraction':0.408},
        {'year':1989, 'fraction':0.295},
        {'year':1990, 'fraction':0.331},
        {'year':1991, 'fraction':0.269},
        {'year':1992, 'fraction':0.235},
        {'year':1993, 'fraction':0.232},
        {'year':1994, 'fraction':0.19},
        {'year':1995, 'fraction':0.18},
        {'year':1996, 'fraction':0.09},
        {'year':1997, 'fraction':0.08},
        {'year':1998, 'fraction':0.12},
        {'year':1999, 'fraction':0.05},
        {'year':2000, 'fraction':0.10},
        {'year':2001, 'fraction':0.06},
        {'year':2002, 'fraction':0.02}
        ];

    // width and height of svg
    var w = 800;
    var h = 600;
    var padding = 80;
    var dot_radius = 2;

    // Model
    var s0 = 1.0;
    var s1 = 1.0;
    var slinked = true;
    var starting_year = 1959;
    var switch_year = 1976;
    var ending_year = 2002;
    var starting_melanic_freq = 0.933;
    var melanic_freq = starting_melanic_freq;

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
        
    // Create dots that represent empirical estimates of the frequency of the 
    // melanic form at each year
    var dots = svg.selectAll("circle.dots")
        .data(fraction_carbonaria)
        .enter()
        .append("circle")
        .attr("class", "dots")
        .attr("cx", function(d) {return xscale(d.year);})
        .attr("cy", function(d) {return yscale(d.fraction);})
        .attr("r", dot_radius)
        .attr("fill", "black");

    // Function that recalculates the line segments making up the transition probability curve
    function recalcLineData() {
        linedata = [];
        melanic_freq = starting_melanic_freq; // frequency of BB + Bb genotypes (melanic phenotype)
        let q = Math.sqrt(1. - melanic_freq);
        let p = 1.0 - q;
        let wBB = 1.0 - s0;
        let wBb = 1.0 - s0;
        let wbb = 1.0;
        for (var g = 0; g < nsegments; g++) {
            if (g == switch_year - starting_year) {
                wBB = 1.0 - s1;
                wBb = 1.0 - s1;
                wbb = 1.0;
            }
            
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
            
            // frequency of melanic phenotype in generation g+1
            melanic_freq = p*p + 2.0*p*q;                                           
            linedata.push({'x':line_scale(g), 'y':melanic_freq});
        }
    }
    recalcLineData();

    // Create path representing frequency of melanic phenotype
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
        
    // Create text element showing final frequency of melanic phenotype
    var melanic_ending_freq = svg.append("text")
        .attr("id", "endfreq")
        .attr("x", w - padding + 20)
        .attr("y", yscale(melanic_freq))
        .text(" " + melanic_freq.toFixed(3));

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
        
    var addCheckbox = function(panel, id, label, checked_by_default, onfunc) {
        var control_div = panel.append("div").append("div")
            .attr("id", id)
            .attr("class", "control");
        control_div.append("input")
            .attr("id", id)
            .attr("type", "checkbox")
            .property("checked", checked_by_default)
            .on("change", onfunc);
        control_div.append("label")
            .append("label")
            .html("&nbsp;" + label);
        }
        
    addCheckbox(ctrl_div, "lockcoeffs", "Selection coefficient constant", true, function() {
        var is_linked = d3.select(this).property('checked');
        if (is_linked) {
            // slinked going from false to true
            slinked = true;
            
            // modify sliders and trajectory to reflect average
            let pct0 = parseFloat(d3.select("input#early").property('value'));
            let pct1 = parseFloat(d3.select("input#late").property('value'));
            let pct = (pct0 + pct1)/2.0;
            adjustSliders(pct, 2);
        }
        else {
            // slinked going from true to false
            slinked = false;
            
            // no modification of sliders or trajectory is necessary
        }
    });
        
    function adjustSliders(pct, which) {
        // If which == 0, the early selection coefficient slider has changed
        // If which == 1, the late  selection coefficient slider has changed
        // If which == 2, both selection coefficient sliders have changed due to user checking the selection coefficient constant checkbox
        if (which > 1 && !slinked) {
            console.log("Error: which == " + which + " and slinked is false, which should not happen!");
        }
        
        // get selection coefficient from percentage
        s = pct/100;
        
        if (slinked) {
            s0 = s;
            s1 = s;
        }
        else {
            if (which == 0)
                s0 = s;
            else
                s1 = s;
        }
        
        // redo calculations with new s0
        recalcLineData();
        
        // change the labels on the sliders
        d3.select("label#early").text(" s (before " + switch_year + ") = " + s0.toFixed(3));
        d3.select("label#late").text(" s (after " + switch_year + ") = " + s1.toFixed(3));
        
        if (slinked) {
            // change value on other slider to match this slider
            if (which == 0)
                d3.select("input#late").property('value', pct);
            else if (which == 1)
                d3.select("input#early").property('value', pct);
            else {
                d3.select("input#early").property('value', pct);
                d3.select("input#late").property('value', pct);
            }
        }
        
        // change the label at the end of the line showing final melanic phenotype frequency
        melanic_ending_freq
            .attr("y", yscale(melanic_freq))
            .text(" " + melanic_freq.toFixed(3));
            
        // cause trajectory line to be redrawn by telling phenotype_tragectory
        // about the new linedata
        phenotype_tragectory.attr("d", lineFunc(linedata));
    }
        
    addSlider(ctrl_div, "early", " s (before " + switch_year + ") = " + s0.toFixed(3), 100.0*s0, function() {
        // get percentage from slider position
        let pct = parseFloat(d3.select(this).property('value'));
        adjustSliders(pct, 0);
        });

    addSlider(ctrl_div, "late", " s (after " + switch_year + ") = " + s1.toFixed(3), 100.0*s1, function() {
        // get percentage from slider position
        let pct = parseFloat(d3.select(this).property('value'));
        adjustSliders(pct, 1);
        });
        
    // Add explanatory text
    svg.append("text").attr("id", "info").attr("x",        xscale(1960)).attr("y", yscale(0.10)).text("Curve and points show frequency of melanic form from 1959 to 2003.");
    svg.append("text").attr("id", "w1").attr("x",          xscale(1960)).attr("y", yscale(0.50)).text("BB fitness = 1 - s");
    svg.append("text").attr("id", "w2").attr("x",          xscale(1960)).attr("y", yscale(0.45)).text("Bb fitness = 1 - s");
    svg.append("text").attr("id", "w3").attr("x",          xscale(1960)).attr("y", yscale(0.40)).text("bb fitness = 1");
    svg.append("text").attr("id", "darkallele").attr("x",  xscale(1960)).attr("y", yscale(0.30)).text("B: dominant melanic allele");
    svg.append("text").attr("id", "lightallele").attr("x", xscale(1960)).attr("y", yscale(0.25)).text("b: recessive non-melanic allele");

</script>

The data for the points are from Clarke, Cyril A., Bruce Grant, Frieda M. M. Clarke, and 
Takahiro Asami. 1994. A long term assessment of _Biston betularia_ (L.) in one UK locality 
(Caldy Common near West Kirby, Wirral), 1959-1993, and glimpses elsewhere. The Linnean 10(2):18-26.
Only data from mercury vapor lights was used from Appendix I. Values after 1993 were obtained by 
eye-balling Figure 2 in Cook, Laurence M. 2003. The rise and fall of 
the _carbonaria_ form of the peppered moth. Quarterly Review of Biology 
78(4):399-417.
