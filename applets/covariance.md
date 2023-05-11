---
layout: applet
title: Covariance
permalink: /applets/covariance/
---

## Covariance, standard deviation, and correlation

<div id="plot"></div>
<div id="controls"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 20-Feb-2018

    // pseudo-random number generator
    var lot = new Random(12345);
    
    // determines whether regression line shown
    var regression = true;

    // width and height of svg
    var w = 600;
    var h = 600;
    var padding_top    = 80;
    var padding_bottom = 80;
    var padding_left   = 100;
    var padding_right  = 60;
    var plot_width     = w - padding_left - padding_right;
    var plot_height    = h - padding_top - padding_bottom;

    // bivariate normal
    var sdX   =  1.0;
    var sdY   =  1.0;
    var rho   =  0.5;
    var muX   =  5.0;
    var muY   =  5.0;
    
    var min_sd   = 0.001;
    var max_sd   = 1.5;
    var beta1min = -sdY/sdX;
    var beta1max =  sdY/sdX;
    var covmin   = -sdY*sdX;
    var covmax   =  sdY*sdX;
    
    // regression/correlation
    var beta0 = muY - beta1*muX;
    var beta1 = rho*sdY/sdX;
    var cov   = rho*sdX*sdY;
    
    // used for debugging
    var covXYhat = rho*sdX*sdY;
    var varXhat  = sdX*sdX;
    var sdXhat   = sdX;
    var varYhat  = sdY*sdY;
    var sdYhat   = sdY;
    var beta1hat = beta1;
    var rhohat   = rho;
    
    // plotting-related
    var xmin  =  0.0;
    var xmax  = 10.0;
    var ymin  =  0.0;
    var ymax  = 10.0;

    var npoints = 100; 
    var point_radius = 3;
    var pointdata = [];

    var nsegments = 100;
    var linedata = [];

    var brickred = "#B82E2E";
    
    // axes labels
    var axis_label_height = 12;
    var axis_label_height_pixels = axis_label_height + "px";

    // param labels
    var param_text_height = 14;
    var param_text_height_pixels = param_text_height + "px";

    // Select DIV element already created (see above) to hold SVG
    var plot_div = d3.select("div#plot");

    // Create SVG element
    var svg = plot_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create background rectangle used to capture drag events
    var bounding_rect = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "lavender");

    // Create scale for X axis
    var xscale = d3.scaleLinear()
        .domain([xmin, xmax])   // recalculated in refreshPlot()
        .range([padding_left, w - padding_right]);

    // Create scale for Y axis
    var yscale = d3.scaleLinear()
        .domain([ymin, ymax])
        .range([h - padding_bottom, padding_top]);
        
    // Create histogram for marginal X
    var histogramX = d3.histogram()
        .domain(xscale.domain())
        .thresholds(xscale.ticks(35))
        .value(function(d, i, data) {return d.cx;});
    
    // Create histogram for marginal Y
    var histogramY = d3.histogram()
        .domain(yscale.domain())
        .thresholds(yscale.ticks(35))
        .value(function(d, i, data) {return d.cy;});

    // Create scale for drawing line segments
    var line_scale = d3.scaleBand()
        .domain(d3.range(nsegments+1))
        .range(xscale.domain());

    // Function that draws a new sample of points
    pointdata = Array(npoints).fill({'cx':0, 'cy':0});
    function chooseNewPoints() {
        // Cholesky decomposition of Var-Cov matrix
        let A11 = sdX;
        let A12 = 0.0;
        let A21 = rho*sdY;
        let A22 = Math.sqrt(sdY*sdY - rho*rho*sdY*sdY);
        
        for (var i = 0; i < npoints; i++) {
            // uniform(0,1) random deviates
            let u1 = lot.random(0.0,1.0);
            let u2 = lot.random(0.0,1.0);
        
            // normal(0,1) random deviates
            let z1 = Math.sqrt(-2.0*Math.log(u1))*Math.cos(2.0*Math.PI*u2);
            let z2 = Math.sqrt(-2.0*Math.log(u1))*Math.sin(2.0*Math.PI*u2);
        
            let x = muX + A11*z1 + A12*z2;
            let y = muY + A21*z1 + A22*z2;
            pointdata[i] = {'cx':x, 'cy':y};
        }
    }
    chooseNewPoints();
    
    // Draw points
    function redrawPoints() {
        svg.selectAll("circle.points").remove();
        svg.selectAll("circle.points")
            .data(pointdata)
            .enter()
            .append("circle")
            .attr("class", "points")
            .attr("cx", function(d) {return xscale(d.cx);})
            .attr("cy", function(d) {return yscale(d.cy);})
            .attr("r", point_radius)
            .attr("fill", "black")
            .attr("stroke", "black")
            .style("visibility", function(d) {return d.cx >= xmin && d.cx <= xmax && d.cy >= ymin && d.cy <= ymax ? "visible" : "hidden"});
    }
    redrawPoints();
    
    // Draw histogram along X axis
    function redrawHistogramX() {
        var xbins = histogramX(pointdata);
        var xbinmax = Math.max.apply(Math, xbins.map(function(d) {return d.length;}))
        svg.selectAll("rect.histX").remove();
        svg.selectAll("rect.histX")
            .data(xbins)
            .enter()
            .append("rect")
            .attr("class", "histX")
            .attr("x", function(d) {return xscale(d.x0);})
            .attr("y", h - padding_bottom)
            .attr("width", function(d) {return xscale(d.x1) - xscale(d.x0);})
            .attr("height", function(d) {return 0.8*padding_bottom*d.length/xbinmax;})
            .attr("fill", function(d) {
                return "rgb(0, 0, " + (Math.floor(255.0*d.length/xbinmax)) + ")";
            })
            .attr("stroke", "none");
    }
    redrawHistogramX();
    
    // Draw histogram along Y axis
    function redrawHistogramY() {
        var ybins = histogramY(pointdata);
        var ybinmax = Math.max.apply(Math, ybins.map(function(d) {return d.length;}))
        svg.selectAll("rect.histY").remove();
        svg.selectAll("rect.histY")
            .data(ybins)
            .enter()
            .append("rect")
            .attr("class", "histY")
            .attr("x", function(d) {return padding_left - 0.8*padding_left*d.length/ybinmax;})
            .attr("y", function(d) {return yscale(d.x0);})
            .attr("width", function(d) {return 0.8*padding_left*d.length/ybinmax;})
            .attr("height", function(d) {return yscale(d.x0) - yscale(d.x1);})
            .attr("fill", function(d) {
                return "rgb(0, 0, " + (Math.floor(255.0*d.length/ybinmax)) + ")";
            })
            .attr("stroke", "none");
    }
    redrawHistogramY();
    
    function debugSummaryStats() {
        let sumXX = 0.0;                             
        let sumXY = 0.0;                             
        let sumYY = 0.0; 
        for (let i = 0; i < npoints; i++) {
            let x  = pointdata[i].cx;
            let cx = x - muX;
            let y  = pointdata[i].cy;
            let cy = y - muY;
            sumXX += cx*cx;
            sumYY += cy*cy;
            sumXY += cx*cy;
        }
        covXYhat = sumXY/(npoints-1);
        varXhat = sumXX/(npoints - 1);
        sdXhat = Math.sqrt(varXhat);
        varYhat = sumYY/(npoints - 1);
        sdYhat = Math.sqrt(varYhat);
        beta1hat = covXYhat/varXhat;
        rhohat   = beta1hat*sdXhat/sdYhat;
    }

    // Function that recalculates the line segments making up the main axis
    function recalcLineData() {
        linedata = [];
        beta0 = muY - beta1*muX;
        for (var i = 1; i < nsegments; i++) {
            let x = line_scale(i);
            let y = beta0 + beta1*x;
            if (x >= xmin && x <= xmax && y >= ymin && y <= ymax)
                linedata.push({'x':x, 'y':y});
        }
    }
    if (regression) {
        recalcLineData();
    }
    
    // Create path representing density curve
    var lineFunc = d3.line()
        .x(function(d) {return xscale(d.x);})
        .y(function(d) {return yscale(d.y);});

    // Draw regression line
    if (regression) {
        var regression_line = svg.append("path")
            .attr("id", "regression")
            .attr("d", lineFunc(linedata))
            .attr("fill", "none")
            .attr("stroke", brickred)
            .attr("stroke-width", 2)
            .style("pointer-events", "none");   // prevent line from intercepting drag events
    }

    // Create x axis
    var xaxis = d3.axisBottom(xscale)
        .tickValues([])
        .tickSize(0);
        //.ticks(4)
        //.tickFormat(d3.format(".2f"));

    // Add x axis to svg
    svg.append("g")
        .attr("id", "xaxis")
        .attr("class", "axis noselect")
        .attr("transform", "translate(0," + (h - padding_bottom) + ")")
        .call(xaxis);

    // Create y axis
    var yaxis = d3.axisLeft(yscale)
        .tickValues([])
        .tickSize(0);
        //.ticks(4)
        //.tickFormat(d3.format(".2f"));

    // Add y axis to svg
    svg.append("g")
        .attr("id", "yaxis")
        .attr("class", "axis noselect")
        .attr("transform", "translate(" + padding_left + ",0)")
        .call(yaxis);

    // Style the axes
    svg.selectAll('.axis line, .axis path')
        .style('stroke', 'black')
        .style('fill', 'none')
        .style('stroke-width', '1px')
        .style('shape-rendering', 'crispEdges');
    svg.selectAll('g#xaxis g.tick text')
        .style('font-family', 'Helvetica')
        .style('font-size', axis_label_height_pixels)
        .style('visibility','hidden');
    svg.selectAll('g#yaxis g.tick text')
        .style('font-family', 'Helvetica')
        .style('font-size', axis_label_height_pixels)
        .style('visibility','hidden');
    
    function updateSliders() {
        covmin = -sdY*sdX;
        covmax =  sdY*sdX;
        let covpct = 100*(cov - covmin)/(covmax - covmin);
        d3.select("input#covslider").property('value', covpct);                
        d3.select("label#covslider").html("&nbsp;covariance = " + d3.format(".3f")(cov));

        let sdXpct = 100*sdX/max_sd;
        d3.select("input#sdXslider").property('value', sdXpct);                
        d3.select("label#sdXslider").html("&nbsp;sdX = " + d3.format(".3f")(sdX));

        let sdYpct = 100*sdY/max_sd;
        d3.select("input#sdYslider").property('value', sdYpct);                
        d3.select("label#sdYslider").html("&nbsp;sdY = " + d3.format(".3f")(sdY));
        
        if (regression) {
            d3.select("p#betatext").html("slope = " + d3.format(".3f")(beta1));
        }
        d3.select("p#rhotext").html("correlation = " + d3.format(".3f")(rho));
    }
    
    function updatePlot() {
        // Recalculate points
        chooseNewPoints();
        redrawPoints();
        redrawHistogramX();
        redrawHistogramY();

        // Recalculate regression line and points
        if (regression) {
            recalcLineData();
            regression_line.attr("d", lineFunc(linedata));
        }
        
        //updateParameterDisplays();
        updateSliders();
    }

    // Select DIV element already created (see above) to hold SVG
    var controls_div  = d3.select("div#controls");
    
    //        cov              cov
    // rho = -----    beta1 = -----
    //       sX sY             sX^2
    
    if (regression) {
        addStatusText(controls_div, "betatext", "slope = " + d3.format(".3f")(beta1), false);
    }
    addStatusText(controls_div, "rhotext",  "correlation = " + d3.format(".3f")(rho), false);
    addSlider(controls_div, "covslider", "covariance", 100*(cov - covmin)/(covmax - covmin), function() {
        var pct = parseFloat(d3.select(this).property('value'));
        covmin = -sdY*sdX;
        covmax =  sdY*sdX;
        cov    =  covmin + pct*(covmax - covmin)/100;
        beta1  =  cov/(sdX*sdX);
        rho    =  cov/(sdX*sdY);
        updatePlot();
    });
    addSlider(controls_div, "sdXslider", "sdX", 100*(sdX/max_sd), function() {
        var pct = parseFloat(d3.select(this).property('value'));
        sdX = max_sd*pct/100;
        if (sdX < min_sd)
            sdX = min_sd;
        covmin = -sdY*sdX;
        covmax =  sdY*sdX;
        if (cov > covmax)
            cov = covmax;
        if (cov < covmin)
            cov = covmin;
        beta1  =  cov/(sdX*sdX);
        rho    =  cov/(sdX*sdY);
        updatePlot();
    });
    addSlider(controls_div, "sdYslider", "sdY", 100*(sdY/max_sd), function() {
        var pct = parseFloat(d3.select(this).property('value'));
        sdY = max_sd*pct/100;
        if (sdY < beta1*sdX)
            sdY = beta1*sdX;
        if (sdY < min_sd)
            sdY = min_sd;
        covmin = -sdY*sdX;
        covmax =  sdY*sdX;
        if (cov > covmax)
            cov = covmax;
        if (cov < covmin)
            cov = covmin;
        beta1  =  cov/(sdX*sdX);
        rho    =  cov/(sdX*sdY);
        updatePlot();
    });
    updateSliders();
    
    // set font for labels
    d3.selectAll("label")
        .style('font-family', 'Helvetica')
        .style('font-size', param_text_height_pixels);
</script>

The sliders allow you to change the covariance as well as the standard deviation (square root of the variance) of the X and Y variables.

When you move a slider, the applet simulates new data with that combination of covariance and standard deviations, and recalculates the slope of the best-fitting trend line and the correlation coefficient.

The correlation is a standardized version of the covariance that ranges from -1 to 1. The correlation coefficient equals the covariance divided by the product of the two standard deviations. That is, correlation = covariance/(sdX*sdY).

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

