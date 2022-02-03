---
layout: applet
title: Jukes-Cantor Model Transition Probabilities
author: Paul O. Lewis
permalink: /applets/jc-transition-probabilities/
---
## Jukes-Cantor Model Transition Probability applet
Written by Paul O. Lewis (4-Feb-2020)

One sequence of length 500 (50 sites/row, 10 rows) starts either with **all A** or **no A** at time 0. 

Use the slider to see the sequence at different times. 

If a site never experiences any substitution, its A will remain <span style="color:magenta">magenta</span>, so a **black** A means that the original A has changed to something else and then back again. 

**Uncheck the box** to start with a sequence containing **only C, G, and T**. Regardless of the starting state, the proportion of A approaches 1/4 given a sufficient number of substitutions.

<div id="arbitrary"></div>
<div id="details"></div>
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
    // written by Paul O. Lewis 20-Feb-2018, revised 3-Feb-2020

    var prob_same = true;

    // ###########################################################################
    // ############################## svg creation ###############################
    // ###########################################################################

    // width and height of svg
    var w = 1000;
    var h = 600;
    var padding = 80;
    var tmax = 10;          // maximum time along x-axis
    var nincr = 200;        // number of points that slider can visit along x-axis
    var tincr = tmax/nincr; // amount by which t changes each increment
    console.log("tincr = " + tincr);

    // Select DIV element already created (see above) to hold SVG
    var plot_div = d3.select("div#arbitrary");

    // Create SVG element
    var svg = plot_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    var sequences_group = svg.append("g");

    // Create scale for X axis
    var xscale = d3.scaleLinear()
        .domain([0, tmax])   // recalculated in refreshPlot()
        .range([padding, w - padding]);

    // Create scale for Y axis
    var yscale = d3.scaleLinear()
        .domain([0, 1])
        .range([h - padding, padding]);

    // ###########################################################################
    // ############################## density curve ##############################
    // ###########################################################################

    // transition probability parameters
    var beta = 0.1;

    var brickred = "#B82E2E";
    var nsegments = 100;
    var linedata = [];

    // Create scale for drawing line segments
    var line_scale = d3.scaleBand()
        .domain(d3.range(nsegments+1))
        .range(xscale.domain());

    function pA(b, t) {
        return 0.25 + (prob_same ? 0.75 : -0.25)*Math.exp(-4.0*b*t);
        }

    // Function that recalculates the line segments making up the transition probability curve
    function recalcLineData() {
        linedata = [];
        for (var i = 0; i < nsegments+1; i++) {
            var t = line_scale(i);
            var y = pA(beta, t);
            linedata.push({'x':t, 'y':y});
        }
    }
    recalcLineData();

    // Create path representing density curve
    var lineFunc = d3.line()
        .x(function(d) {return xscale(d.x);})
        .y(function(d) {return yscale(d.y);});

    var density = svg.append("path")
            .attr("id", "density")
            .attr("d", lineFunc(linedata))
            .attr("fill", "none")
            .attr("stroke", brickred)
            .attr("stroke-width", 2)
            .style("pointer-events", "none");   // don't want line intercepting drag events

    // ###########################################################################
    // ############################## x and y axes ###############################
    // ###########################################################################

    // axes labels
    var axis_label_height = 12;
    var axis_label_height_pixels = axis_label_height + "px";
    var xaxis_label_y = h - padding/2;

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

    // Text showing current fraction of A
    var xaxis_label = svg.append("text")
        .attr("id", "xaxislabel")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", param_text_height_pixels)
        .text("time");
    CenterTextAroundPoint(xaxis_label, xscale(tmax/2), xaxis_label_y);

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

    // ###########################################################################
    // ################## sequence simulation/display ############################
    // ###########################################################################

    // Create a random number generator
    var rnseed = d3.randomUniform(1, 1000)();
    var lot = new Random(rnseed);

    // display of sequence data
    var nucleotide_text_height = 16;
    var nucleotide_text_height_pixels = nucleotide_text_height + "px";
    var base_lookup = ["A", "C", "G", "T"];
    var base_color  = ["magenta", "orange", "green", "gray", "black", "orange", "green", "gray"];
    var nrows = 10;
    var ncols = 50;
    var xseqs0 = 200;
    var xseqs1 = 800;
    var yseqs0 = 40;
    var yseqs1 = 40 + nrows*nucleotide_text_height;

    // sizing and placement of textual elements
    var param_text_height = 18;
    var param_text_height_pixels = param_text_height + "px";
    var row_height = (padding - axis_label_height)/2; // height of space allotted for help button in pixels
    var stats_y = yseqs1 + nucleotide_text_height;

    // Create scale for x coordinates of sequences
    var seqxscale = d3.scaleLinear()
        .domain([0, ncols-1])
        .range([xseqs0, xseqs1]);

    // Create scale for y coordinates of sequences
    var seqyscale = d3.scaleLinear()
        .domain([0, nrows-1])
        .range([yseqs0, yseqs1]);

    var seqdatavect = null;
    var piA = null;   // piA[k] is fraction of A in simulated data for time increment k
    function simulateData() {
        // Simulate data at time t = 0
        var t = 0;
        seqdatavect = [];
        piA = [];
        var tdata = [];
        piA[0] = (prob_same ? 1.0 : 0.0);
        for (var i = 0; i < nrows; i++) {
            for (var j = 0; j < ncols; j++) {
                if (prob_same)
                    tdata.push({'x':j, 'y':i, 'base':0, 'color':0});
                else {
                    var u = lot.random(0,1);
                    if (u < 1/3) 
                        tdata.push({'x':j, 'y':i, 'base':1, 'color':1});
                    else if (u < 2/3)
                        tdata.push({'x':j, 'y':i, 'base':2, 'color':2});
                    else 
                        tdata.push({'x':j, 'y':i, 'base':3, 'color':3});
                }
            }
        }
        seqdatavect.push(tdata);
        var total = nrows*ncols;
        if (total != seqdatavect[0].length)
            console.log("oops: total = " + total + " but seqdatavect[0].length = " + seqdatavect[0].length);
            
        // Keep track of whether original base at each site has changed
        var changed = [];
        for (var k = 0; k < total; k++)
            changed.push(false);
        
        // Walk through time, updating sequences as we go
        var t0 = 0;
        for (t = tincr; t < tmax; t += tincr) {
            tdata = [];
            freqA = 0.0;
            for (var k = 0; k < total; k++) {
                var tmp = seqdatavect[t0][k];
                var x = tmp.x;
                var y = tmp.y;
                var b = tmp.base;
                var probsame = 0.25 + 0.75*Math.exp(-4.0*beta*tincr);
                var probdiff = 1.0 - probsame;
                var u = lot.random(0,1);
                if (u <= probdiff) {
                    //  1.0        2.0        3.0        4.0
                    //  |          |          |          |
                    //  1--------->2--------->3--------->4
                    let uu = lot.uniform(1,4); 
                    let x = Math.floor(uu);
                    b = (b + x) % 4;
                    changed[k] = true;
                }
                if (b == 0)
                    freqA += 1;
                var col = changed[k] ? (b+4) : b;
                tdata.push({'x':x, 'y':y, 'base':b, 'color':col});
            }
            seqdatavect.push(tdata);
            t0 += 1;
            freqA /= total;
            piA.push(freqA);
            //console.log("freqA for t = " + t0 + " = " + piA[t0]);
        }
        //console.log(piA);
    }
    simulateData();
    //console.log(seqdatavect);
    
    var seqdata = null;
    function copyDataForTime(t) {
        // 0.0        0.1        0.2        0.3        0.4
        //  |          |          |          |          |
        //  0--------->1--------->2--------->3--------->4          
        var x = Math.floor(t/tincr);
        if (x == nincr)
            x -= 1;
        //console.log("time unit is " + x);
        seqdata = seqdatavect[x];
    }
    copyDataForTime(0);

    // Create text elements representing nucleotides
    sequences_group.selectAll("text")
        .data(seqdata)
        .enter()
        .append("text")
        .attr("class", "nucleotide")
        .attr("x", function(d) {return seqxscale(d.x)})
        .attr("y", function(d) {return seqyscale(d.y)})
        .attr("fill", function(d) {return base_color[d.color]})
        .attr("stroke", function(d) {return base_color[d.color]})
        .style("pointer-events", "none")   // don't intercept drag events
        .attr("font-family", "Verdana")
        .attr("font-size", nucleotide_text_height_pixels)
        .text(function(d) {return base_lookup[d.base]});

    // Text showing current fraction of A
    var afrac_text = svg.append("text")
        .attr("id", "fractionA")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", param_text_height_pixels)
        .text("fraction A = " + d3.format(".1f")(piA[0])); // pi is \u03C0
    CenterTextAroundPoint(afrac_text, xscale(tmax/2), stats_y)

    // ###########################################################################
    // ################################ slider ###################################
    // ###########################################################################

    var time = 0;   // slider position
    var slider = svg.append("rect")
        .attr("id", "slider")
        .attr("x", xscale(time)-10)
        .attr("y", yscale(0)-15)
        .attr("width", 20)
        .attr("height", 30)
        .attr("stroke", "blue")
        .attr("fill", d3.color("rgba(0, 0, 128, .4)"));

    var vertical_dotted_line = svg.append("line")
        .attr("id", "vdotted")
        .attr("x1", xscale(time))
        .attr("y1", yscale(0)-15)
        .attr("x2", xscale(time))
        .attr("y2", yscale(pA(beta, time)))
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "2,2,2");

    var horizontal_dotted_line = svg.append("line")
        .attr("id", "hdotted")
        .attr("x1", xscale(time))
        .attr("y1", yscale(pA(beta, time)))
        .attr("x2", xscale(0))
        .attr("y2", yscale(pA(beta, time)))
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "2,2,2");

    // Create drag behavior
    var x_at_drag_start = null;
    var drag = d3.drag()
        .on("start", function(d) {
            x_at_drag_start = d3.event.x;
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
            //console.log("start drag");
        })
        .on("drag", function(d) {
            var dx = d3.event.x - x_at_drag_start;
            var x0 = xscale(time);
            var x = x0 + dx;
            if (xscale.invert(x) < 0)
                x = xscale(0);
            if (xscale.invert(x) > tmax)
                x = xscale(tmax);
            slider.attr("x", x - 10);
            var t = xscale.invert(x);
            var tindex = Math.floor(t/tincr);
            if (tindex == nincr)
                tindex -= 1;
            //simulateData(t);
            copyDataForTime(t);
            sequences_group.selectAll("text.nucleotide")
                .data(seqdata)
                .attr("fill", function(d) {return base_color[d.color]})
                .attr("stroke", function(d) {return base_color[d.color]})
                .text(function(d) {return base_lookup[d.base]});
            vertical_dotted_line
                .attr("x1", xscale(t))
                .attr("y1", yscale(0)-15)
                .attr("x2", xscale(t))
                .attr("y2", yscale(pA(beta, t)));
            horizontal_dotted_line
                .attr("x1", xscale(t))
                .attr("y1", yscale(pA(beta, t)))
                .attr("x2", xscale(0))
                .attr("y2", yscale(pA(beta, t)));
            afrac_text
                .text("fraction A = " + d3.format(".2f")(piA[tindex])); // pi is \u03C0
            //console.log("slider at time " + d3.format(".3f")(t) + ", pA = " +  d3.format(".3f")(pA(beta, t)));
        })
        .on("end", function(d) {
            var dx = d3.event.x - x_at_drag_start;
            var x0 = xscale(time);
            var x = x0 + dx;
            if (xscale.invert(x) < 0)
                x = xscale(0);
            if (xscale.invert(x) > tmax)
                x = xscale(tmax);
            time = xscale.invert(x);
            //simulateData(time);
            copyDataForTime(time);
            sequences_group.selectAll("text.nucleotide")
                .data(seqdata)
                .attr("fill", function(d) {return base_color[d.color]})
                .attr("stroke", function(d) {return base_color[d.color]})
                .text(function(d) {return base_lookup[d.base]});
            d3.select(this).classed("dragging", false);
            //console.log("end drag");
        });

    slider.call(drag);

    // ###########################################################################
    // ############################ add controls #################################
    // ###########################################################################

    var details_div = d3.select("div#details")
        .style("display", "block")
        .style("width", "600px")
        .style("margin-left", "10px")
        .style("vertical-align", "top");

    addCheckbox(details_div, "prsame-checkbox", "Start with every site A", true, function() {
        prob_same = d3.select(this).property('checked');
        recalcLineData();
        density.attr("d", lineFunc(linedata));
        time = 0;
        simulateData();
        copyDataForTime(time);
        sequences_group.selectAll("text.nucleotide")
            .data(seqdata)
            .attr("fill", function(d) {return base_color[d.color]})
            .attr("stroke", function(d) {return base_color[d.color]})
            .text(function(d) {return base_lookup[d.base]});
        vertical_dotted_line
            .attr("x1", xscale(time))
            .attr("y1", yscale(0)-15)
            .attr("x2", xscale(time))
            .attr("y2", yscale(pA(beta, time)));
        horizontal_dotted_line
            .attr("x1", xscale(time))
            .attr("y1", yscale(pA(beta, time)))
            .attr("x2", xscale(0))
            .attr("y2", yscale(pA(beta, time)));
        afrac_text
            .text("fraction A = " + d3.format(".2f")(piA[0])); // pi is \u03C0
        slider
            .attr("x", xscale(time)-10);
        });

    addStringDropdown(details_div, "beta-dropdown", "substitution rate", ["0.1", "0.5", "1.0", "10.0"], 0, function() {
        var selected_index = d3.select(this).property('selectedIndex');
        if (selected_index == 0) {
            beta = 0.1;
            }
        else if (selected_index == 1) {
            beta = 0.5;
            }
        else if (selected_index == 2) {
            beta = 1.0;
            }
        else if (selected_index == 3) {
            beta = 10.0;
            }
        else {
            console.log("error: unknown choice; using 1.0");
            beta = 1.0;
            }
        recalcLineData();
        density.attr("d", lineFunc(linedata));
        time = 0;
        simulateData();
        copyDataForTime(time);
        sequences_group.selectAll("text.nucleotide")
            .data(seqdata)
            .attr("fill", function(d) {return base_color[d.color]})
            .attr("stroke", function(d) {return base_color[d.color]})
            .text(function(d) {return base_lookup[d.base]});
        vertical_dotted_line
            .attr("x1", xscale(time))
            .attr("y1", yscale(0)-15)
            .attr("x2", xscale(time))
            .attr("y2", yscale(pA(beta, time)));
        horizontal_dotted_line
            .attr("x1", xscale(time))
            .attr("y1", yscale(pA(beta, time)))
            .attr("x2", xscale(0))
            .attr("y2", yscale(pA(beta, time)));
        afrac_text
            .text("fraction A = " + d3.format(".2f")(piA[0])); // pi is \u03C0
        slider
            .attr("x", xscale(time)-10);
        });

</script>
		
<br/>

## Licence
Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.