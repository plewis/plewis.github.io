---
layout: applet
title: Correlation
permalink: /applets/density-rain/
---

## Density Rain

Illustrates the concept of a probability density function using a Beta distribution.

Drag your mouse to create the desired Beta distribution, then 
press **T** to "throw darts" and then **D** to "rain" the darts down 
onto the horizontal axis.

Scroll down below the applet for more background and details.

<div id="arbitrary"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 30-Aug-2019
    // See https://developer.mozilla.org/en-US/docs/Web/SVG/Element
    // See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
    var lot = new Random(1234);

    // width and height of svg
    var w = 1000;
    var h = 600;
    var padding = 80;
    
    var dart_length = 10;   // in pixels
    var time_delay = 500;   // in milliseconds
    //var brick_red = "#B82E2E";
    var burnt_orange = "#8E281E";
    var density_color = "navy";
    var dart_fill_color = "orange";
    var dart_stroke_color = burnt_orange;

    // beta prior
    var prior_a  = 2.0;
    var prior_b  = 2.0;
    var phi = prior_a + prior_b;
    var beta_mean  = prior_a/phi;
    var beta_var = prior_a*prior_b/(phi*phi*(phi + 1));

    // plotting-related
    var nsegments = 100;
    var ymax = 5.0;
    var epsilon = 0.1;
    var dartradius = 4;
    var ndarts = 1000;
    var linedata = [];
    var dartdata = [];

    // axes labels
    var axis_label_height = 12;
    var axis_label_height_pixels = axis_label_height + "px";

    // param labels
    var param_text_height = 18;
    var param_text_height_pixels = param_text_height + "px";

    // hint text
    var hint_text_height = 12;
    var hint_text_height_pixels = hint_text_height + "px";

    // Select DIV element already created (see above) to hold SVG
    var plot_div = d3.select("div#arbitrary");

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
        .attr("fill", "white");

    // Create scale for X axis
    var xscale = d3.scaleLinear()
        .domain([0, 1])   // recalculated in refreshPlot()
        .range([padding, w - padding]);

    // Create scale for Y axis
    var yscale = d3.scaleLinear()
        .domain([0, ymax])
        .range([h - padding, padding]);

    // Create scale for drawing line segments
    var line_scale = d3.scaleBand()
        .domain(d3.range(nsegments+1))
        .range(xscale.domain());

    // Function that recalculates prior_a and prior_b from beta_mean and beta_var
    function recalcShapesFromMeanAndVariance() {
        phi = [beta_mean*(1.0 - beta_mean)/beta_var] - 1.0;
        prior_a = phi*beta_mean;
        prior_b = phi*(1.0 - beta_mean);
        var shove = 0.0;
        if (prior_a <= 0 && prior_b <= 0) {
            console.log("!!! prior_a = " + prior_a + ", prior_b = " + prior_b);
            shove = 0.002;
            if (prior_a < prior_b)
                shove -= prior_a;
            else
                shove -= prior_b;
        }
        else if (prior_a <= 0) {
            console.log("!!! prior_a = " + prior_a);
            shove = 0.002 - prior_a;
        }
        else if (prior_b <= 0) {
            console.log("!!! prior_b = " + prior_b);
            shove = 0.002 - prior_b;
            console.log("!!! prior_b = " + prior_b + " (beta_mean = " + beta_mean + ", beta_var = " + beta_var + ")");
        }
        prior_a += shove;
        prior_b += shove;
        phi = prior_a + prior_b;
        beta_mean = prior_a/phi;
        beta_var = prior_a*prior_b/(phi*phi*(phi + 1));
        recalcDist();
    }

    // Function that recalculates the line segments making up the transition probability curve
    function recalcLineData() {
        linedata = [];
        for (var i = 1; i < nsegments; i++) {
            var theta = line_scale(i);
            var log_density = -1000000.;
            log_density = (prior_a - 1.0)*Math.log(theta)
                + (prior_b - 1.0)*Math.log(1.0 - theta);
            //console.log("i = " + i + ", x = " + theta + ", log y = " + log_density);
            if (prior_a > 0 && prior_b > 0) 
                log_density += log_gamma(prior_a + prior_b);
            if (prior_a > 0) 
                log_density -= log_gamma(prior_a);
            if (prior_b > 0) 
                log_density -= log_gamma(prior_b);
            linedata.push({'x':theta, 'y':Math.exp(log_density)});
            //console.log("--> a = " + prior_a + ", b = " + prior_b + ", log y = " + log_density);
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
            .attr("stroke", density_color)
            .attr("stroke-width", 2)
            .style("pointer-events", "none");   // don't want line intercepting drag events

    // Create x axis
    var xaxis = d3.axisBottom(xscale)
        .ticks(5)
        .tickFormat(d3.format(".2f"));

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

    // Create hint text showing how to throw/drop darts
    var left_hint_text = svg.append("text")
        .attr("id", "lefthint")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", hint_text_height_pixels)
        .text("Press T key to throw darts");
    CenterTextAroundPoint(left_hint_text, xscale(.2), h - padding/2)

    // Create text showing name of distribution
    var distr_text = svg.append("text")
        .attr("id", "distr")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", param_text_height_pixels)
        .text("Beta(" + d3.format(".1f")(prior_a) + ", " + d3.format(".1f")(prior_b) + ")");
    CenterTextAroundPoint(distr_text, xscale(.5), h - padding/2)

    // Create text showing mean and variance
    var meanvar_text = svg.append("text")
        .attr("id", "meanvar")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", axis_label_height_pixels)
        .text("mean = " + d3.format(".5f")(beta_mean) + ", std. dev. = " + d3.format(".5f")(Math.sqrt(beta_var)));
    CenterTextAroundPoint(meanvar_text, xscale(.5), h - padding/4)

    // Create hint text showing how to modify distribution
    var right_hint_text_upper = svg.append("text")
        .attr("id", "righthint")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", hint_text_height_pixels)
        .text("Try dragging mouse or");
    var right_hint_text_lower = svg.append("text")
        .attr("id", "righthint")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", hint_text_height_pixels)
        .text("using arrow keys");
    CenterTextAroundPoint(right_hint_text_upper, xscale(.8), h - 0.6*padding)
    CenterTextAroundPoint(right_hint_text_lower, xscale(.8), h - 0.4*padding)

    // Create scales for choosing scaling factors for variance based on drag extent
    // The sigma_pos_scale is used if user drags downward
    // The sigma_pos_scale is used if user drags upward
    var variance_pos_scale = d3.scaleLinear()
        .domain([0,h])
        .range([0.0, 30.0]);
    var variance_neg_scale = d3.scaleLinear()
        .domain([0,-h])
        .range([0.0, -5.0]);
        
    function recalcDist() {
        // remove all circles and lines representing darts
        d3.selectAll("line.dart").remove();
        d3.selectAll("circle.dart").remove();

        recalcLineData();
        density.attr("d", lineFunc(linedata));
        distr_text.text("Beta(" + d3.format(".1f")(prior_a) + ", " + d3.format(".1f")(prior_b) + ")");
        meanvar_text.text("mean = " + d3.format(".5f")(beta_mean) + ", std. dev. = " + d3.format(".5f")(Math.sqrt(beta_var)));
    }
        
    function symmetricDist(a) {
        beta_mean = 0.5;
        beta_var = 1.0/(8*a + 4);
        if (beta_var > 0.249)
            beta_var = 0.249;
        recalcShapesFromMeanAndVariance();
    }
        
    function throwDarts() {
        console.log("throwing darts...");
        
        // remove all circles and lines representing darts
        d3.selectAll("line.dart").remove();
        d3.selectAll("circle.dart").remove();
        
        // change left hint text
        left_hint_text.text("Press D key to drop darts");
        
        // generate new dartdata
        dartdata = [];
        for (let i = 0; i < ndarts; i++) {
            // cx based on a Beta(prior_a, prior_b) random deviate
            let a = lot.gamma(prior_a ,1.0)
            let b = lot.gamma(prior_b ,1.0)
            let theta = a/(a + b);
            let cx = xscale(theta);
            
            // cy based on density of this point
            let log_density = -1000000.;
            log_density = (prior_a - 1.0)*Math.log(theta)
                + (prior_b - 1.0)*Math.log(1.0 - theta)
                + log_gamma(prior_a + prior_b)
                - log_gamma(prior_a)
                - log_gamma(prior_b);
            let cy = yscale(Math.exp(log_density)*Math.random());
            
            dartdata.push({"cx":cx, "cy":cy});
        }
        svg.selectAll("circle.dart")
            .data(dartdata)
            .enter()
            .append("circle")
            .attr("class", "dart")
            .attr("cx", function(d) {return d.cx;})
            .attr("cy", function(d) {return d.cy;})
            .attr("r", dartradius)
            .attr("fill", dart_fill_color)
            .attr("stroke", dart_stroke_color)
            .attr("stroke-width", 1); 
    }

    function dropDarts() {
        console.log("dropping darts...");
        left_hint_text.text("Press T key to throw darts");
        d3.selectAll("circle.dart").remove();
        svg.selectAll("line.dart")
            .data(dartdata)
            .enter()
            .append("line")
            .attr("class", "dart")
            .attr("x1", function(d) {return d.cx;})
            .attr("y1", function(d) {return d.cy;})
            .attr("x2", function(d) {return d.cx;})
            .attr("y2", function(d) {return d.cy - dart_length;})
            .attr("stroke", dart_stroke_color)
            .attr("stroke-width", 1)
            .transition()
            .duration(time_delay)
            .attr("y1", yscale(0.0))
            .attr("y2", yscale(0.0) - dart_length);
    }
    
    // Listen and react to keystrokes
    function keyDown() {
        console.log("key was pressed: " + d3.event.keyCode);
        if (d3.event.keyCode == 84) {
            // 84 is the "t" key
            throwDarts();
        }
        else if (d3.event.keyCode == 68) {
            // 68 is the "d" key
            dropDarts();
        }
        else if (d3.event.keyCode == 38) {
            // 38 is the "uparrow" key
            let shape = (prior_a + prior_b)/2.0;
            console.log("shape (before uparrow) = " + shape);
            if (shape <= 1.0) {
                // snap shape to nearest tenth
                shape = shape + 0.1;
                shape = Math.round(10*shape)/10;
            }
            else {
                // snap shape to nearest whole number
                shape = shape + 1.0;
                shape = Math.round(shape);
            }
            console.log("shape (after uparrow) = " + shape);
            symmetricDist(shape);
        }
        else if (d3.event.keyCode == 40) {
            // 40 is the "downarrow" key
            let shape = (prior_a + prior_b)/2.0;
            console.log("shape (before downarrow) = " + shape);
            if (shape <= 1.0) {
                // snap shape to nearest tenth
                shape = shape - 0.1;
                shape = Math.round(10*shape)/10;
            }
            else {
                // snap shape to nearest whole number
                shape = shape - 1.0;
                shape = Math.round(shape);
            }
            if (shape <= 0.0)
                shape = 0.0
            console.log("shape (after downarrow) = " + shape);
            symmetricDist(shape);
        }
        else if (d3.event.keyCode == 37) {
            // 37 is the "leftarrow" key
            phi = prior_a + prior_b;
            beta_mean = prior_a/phi;
            beta_var = prior_a*prior_b/(phi*phi*(phi + 1));
            console.log("mean (before leftarrow) = " + beta_mean);
            beta_mean = beta_mean - 0.1;
            recalcShapesFromMeanAndVariance();
            console.log("mean (after leftarrow) = " + beta_mean);
        }
        else if (d3.event.keyCode == 39) {
            // 39 is the "rightarrow" key
            phi = prior_a + prior_b;
            beta_mean = prior_a/phi;
            beta_var = prior_a*prior_b/(phi*phi*(phi + 1));
            console.log("mean (before leftarrow) = " + beta_mean);
            beta_mean = beta_mean + 0.1;
            recalcShapesFromMeanAndVariance();
            console.log("mean (after leftarrow) = " + beta_mean);
        }
    }
    d3.select("body")
        .on("keydown", keyDown);

    // Create drag behavior
    var x_at_drag_start = null;
    var y_at_drag_start = null;
    var mean_at_drag_start = null;
    var variance_at_drag_start = null;
    var drag = d3.drag()
        .on("start", function(d) {
            x_at_drag_start = d3.event.x;
            y_at_drag_start = d3.event.y;
            mean_at_drag_start = beta_mean;
            variance_at_drag_start = beta_var;
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);

            // remove all circles and lines representing darts
            d3.selectAll("line.dart").remove();
            d3.selectAll("circle.dart").remove();
        })
        .on("drag", function(d) {
            // Move mean by the amount corresponding to the x-component of the drag
            beta_mean = xscale.invert(xscale(beta_mean) + d3.event.dx);
            if (beta_mean <= epsilon)
                beta_mean = epsilon;
            else if (beta_mean >= 1.0 - epsilon)
                beta_mean = 1.0 - epsilon;

            //phi = 2*yscale.invert(yscale(phi/2) + d3.event.dy);
            //prior_a = phi*beta_mean;
            //prior_b = phi - prior_a;
            //beta_var = prior_a*prior_b/(phi*phi*(phi + 1));
            
            // polynomial regression for symmetrical beta
            // y ranges from 0 to 600-2*80=440
            // lm(formula = a ~ poly(y, 2, raw = TRUE))
            // y = 600 - 80 - ycoord
            // y: 0  88 176 264 362 440
            // a: 0   1   3   7  13  20
            var y = h - padding - d3.event.y;
            if (y < 1) {
                y = 1;
            }
            else {
                var a = y*y/9309;   
                beta_var = 1.0/(8*a + 4);
            }
            if (beta_var > 0.249)
                beta_var = 0.249;
            console.log("y = " + y + " (dy = " + d3.event.dy + ", beta_var = " + beta_var + ")");
            
            // Adjust sigma based on extent of drag in vertical direction
            //var dy = d3.event.y - y_at_drag_start;
            // if (dy < 0) {
            //     beta_var = variance_at_drag_start*Math.exp(variance_neg_scale(dy));
            // } else {
            //     beta_var = variance_at_drag_start*Math.exp(variance_pos_scale(dy));
            // }
            // if (beta_var <= epsilon)
            //     beta_var = epsilon;

            // Recalculate linedata
            recalcShapesFromMeanAndVariance();
            //recalcLineData();
            //density.attr("d", lineFunc(linedata));

            //left_hint_text.text("Press T key to throw darts");
            //distr_text.text("Beta(" + d3.format(".1f")(prior_a) + ", " + d3.format(".1f")(prior_b) + ")");
            //meanvar_text.text("mean = " + d3.format(".5f")(beta_mean) + ", std. dev. = " + d3.format(".5f")(Math.sqrt(beta_var)));
        })
        .on("end", function(d) {
            d3.select(this).classed("dragging", false);

            // Recalculate linedata
            recalcShapesFromMeanAndVariance();
            // recalcLineData();
            // density.transition()
            //     .duration(500)
            //     .attr("d", lineFunc(linedata));
            // 
            // left_hint_text.text("Press T key to throw darts");
            // distr_text.text("Beta(" + d3.format(".1f")(prior_a) + ", " + d3.format(".1f")(prior_b) + ")");
        });

    bounding_rect.call(drag);

</script>

## Details

The process of throwing darts (T) involves using data augmentation to sample value of $$X$$, 
the Beta random variable of interest. Let $$Y$$ be a uniform random variable conditional 
on the value of $$X$$ taking on any value between 0 and the height of the density function. 
Throwing a dart uniformly within the area underneath the density function is equivalent to 
jointly sampling a point $$(X,Y)$$ from the joint probability distribution $$p(X,Y)$$. 

The process of raining darts (D) involves integrating over all possible values of $$Y$$ 
for every value of $$X$$, yielding a valid sample from the distribution of $$X$$. 

$$p(x) = \int p(x,y) dy $$

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
