---
layout: applet
title: Normal Snap
permalink: /applets/normal-snap/
---

## Normal Snap

Illustrates the concept of maximum likelihood estimation of the parameters of a univariate normal distribution.

### Some things to try: ###
* Drag your mouse **up** to **decrease** the standard deviation of the distribution (i.e. increase "sharpness")
* Drag your mouse **down** to **increase** the standard deviation  of the distribution (i.e. spread it out more)
* Drag your mouse **left** to **decrease** the mean of the distribution (i.e. move it to the left)
* Drag your mouse **right** to **increase** the mean of the distribution (i.e. move it to the right)
* Letting go of the mouse button causes the app to "snap" back to the maximum likelihood estimates of mean and standard deviation

You will note that dragging the distribution away from the maximum likelihood estimates (MLEs) causes the background to become increasingly red. This **increasing redness** corresponds with the **decreasing log-likelihood** shown below the plot. The log-likelihood measures the fit of the distribution to the data. Notice that lower log-likelihoods are associated with the sampled points being closer to the baseline (i.e. their probability density is lower than it would be if the mean and standard deviation were at their MLEs).

<div id="arbitrary"></div>
<script type="text/javascript">
    // Define color range for background feedback
    var begin_color = 'red';
    var end_color   = 'white';

    // Dimensions
    var w = 1000;
    var h = 600;
    var padding = 80;
    var point_radius = 2;
    var xfrac = 200.0;      // x-axis will be this percent bigger than data extent
    var yfrac = 50.0;      // y-axis will be this percent bigger than density height
    var axis_label_height = 12;
    var axis_label_height_pixels = axis_label_height + "px";
    var param_text_height = 18;
    var param_text_height_pixels = param_text_height + "px";
    var row_height = (padding - axis_label_height)/2; // height of space allotted for help button in pixels
    var stats_row = h - padding/2;
//             var row_one = h - padding + axis_label_height;
//             var row_two = h - padding + axis_label_height + row_height;
    var button_margin = 2;

    // Parameters
    var mu0 = 10.0;          // mean used for sampling
    var sigma0 = 2.0;       // standard deviation used for sampling
    var n0 = 50;            // number of points to sample
    var nchoices = [5,50,500];  // must match choices in select element defined above
    var n = 100;            // number of line segments used in density plot
    var max_sigma = 100;

    // Select DIV element already created (see above) to hold SVG
    var plot_div = d3.select("div#arbitrary");
    
    // Create SVG element
    var svg = plot_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create scale for X axis
    var xscale = d3.scaleLinear()
        .domain([-10, 10])   // recalculated in refreshPlot()
        .range([padding, w - padding]);

    // Create scale for Y axis
    var yscale = d3.scaleLinear()
        .domain([0, (1.0 + yfrac/100.0)*0.5])   // recalculated in refreshPlot()
        .range([h - padding, padding]);

    // Create scale for sigma
    var sigmascale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, h]);

    // Create scale for coloring background rectangle
    var color_scale = d3.scaleLinear()
        .domain([-1000.0, 0.0])   // recalculated in refreshPlot()
        .range([begin_color, end_color]);

    // Create scale for drawing line segments
    var line_scale = d3.scaleBand()
        .domain(d3.range(n+1))
        .range(xscale.domain());    // recalculated in refreshPlot()

    var linedata = [];
    var dataset = [];
    var log_likelihood  = 0.0; // recalculated in refreshPlot()
    var sample_mean     = 0.0; // recalculated in refreshPlot()
    var sample_stddev   = 1.0; // recalculated in refreshPlot()
    var mu              = mu0; // recalculated in refreshPlot()
    var sigma           = sigma0; // recalculated in refreshPlot()
    var xleft           = xscale.domain()[0]; // recalculated in refreshPlot()
    var xright          = xscale.domain()[1]; // recalculated in refreshPlot()
    var ybottom         = yscale.domain()[0]; // recalculated in refreshPlot()
    var ytop            = yscale.domain()[1]; // recalculated in refreshPlot()

    // Function that recalculates the log probability density of one x value
    function calcLogDensity(x, mean, sd) {
        var variance = Math.pow(sd, 2.0);
        var logp = -0.5*Math.log(2.0*Math.PI*variance) - Math.pow(x - mean, 2.0)/(2.0*variance);
        return logp;
    }

    // Function that recalculates the probability density of all points
    // as well as the log-likelihood
    function recalcLogLikelihood(mean, sd) {
        var variance = Math.pow(sd, 2.0);
        var sumi = 0.0;
        for (var i = 0; i < n0; i++) {
            sumi += Math.pow(dataset[i].x - mean, 2.0);
            var logp = calcLogDensity(dataset[i].x, mean, sd);
            dataset[i].density = Math.exp(logp);
        }
        var const_term = -0.5*n0*Math.log(2.0*Math.PI);
        log_likelihood = const_term - 0.5*n0*Math.log(variance) - sumi/(2.0*variance);
    }

    // Create background rectangle whose color indicates log-likelihood
    // and which is used to capture drag events
    var bounding_rect = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", color_scale(log_likelihood));
        //.attr("fill", "orange");

    var points_group = svg.append("g");

    // Create path representing density curve
    var lineFunc = d3.line() // recalculated in refreshPlot()
        .x(function(d) {return xscale(d.x);})
        .y(function(d) {return yscale(d.y);});
    var density = svg.append("path")
            .attr("id", "density")
            .attr("d", lineFunc(linedata))
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .style("pointer-events", "none");   // don't want line intercepting drag events

    // Function that recalculates the line segments making up the normal density curve
    function recalcLineData(mean, sd) {
        linedata = [];
        for (var i = 0; i < n+1; i++) {
            var x = line_scale(i);
            var y = Math.exp(calcLogDensity(x, mean, sd));
            linedata.push({'x':x, 'y':y});
        }
    }

    // Create X axis
    var xaxis = d3.axisBottom(xscale)
        .ticks(5)
        .tickFormat(d3.format(".1f"));

    // Create rect to be used for help overlay
    var help_group = svg.append("g")
        .attr("id", "helpbox")
        .style("display", "none");
    help_group.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", d3.color("rgba(0, 0, 0, .6)"))
        .on("click", function() {
            d3.select("g#helpbox").style("display", "none");
            d3.select("input#helpbtn").attr("value", "Help");
            }
        );

    // Add text to help overlay - only shown when help is invoked
    var help_line1 = help_group.append("text")
        .attr("id", "help-left-right")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "12")
        .style("fill", "white")
        .text("Drag left/right to change mean");
    CenterTextAroundPoint(help_line1, w/2, 2*h/25)

    var help_line2 = help_group.append("text")
        .attr("id", "help-up-down")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "12")
        .style("fill", "white")
        .text("Drag up/down to change standard deviation");
    CenterTextAroundPoint(help_line2, w/2, 3*h/25)

    var help_line3 = help_group.append("text")
        .attr("id", "help-snap")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "12")
        .style("fill", "white")
        .text("Snaps to maximum likelihood estimate after dragging");
    CenterTextAroundPoint(help_line3, w/2, 4*h/25)

    var help_line4 = help_group.append("text")
        .attr("id", "help-red")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "12")
        .style("fill", "white")
        .text("Red background means poor fit, i.e. low log-likelihood (lnL)");
    CenterTextAroundPoint(help_line4, w/2, 5*h/25)

    var help_line5 = help_group.append("text")
        .attr("id", "help-refresh")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "12")
        .style("fill", "white")
        .text("Choose from dropdown to draw new sample of chosen size from Normal(\u03BC = " + d3.format(".1f")(mu0) + ", \u03C3 = " + d3.format(".1f")(sigma0) + ")");
    CenterTextAroundPoint(help_line5, w/2, 6*h/25)

    var help_line6 = help_group.append("text")
        .attr("id", "help-title-author")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "12")
        .style("fill", "white")
        .html("NormalSnap (by Paul O. Lewis 2017; <a target=\"blank\" href=\"http://phylogeny.uconn.edu/\">http://phylogeny.uconn.edu/</a>)");
    CenterTextAroundPoint(help_line6, w/2, 7*h/25)

    d3.selectAll("a:link").style("fill", "silver");

    // Add X axis to svg
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

    // Create text showing current mean of normal density
    var mean_x = xleft + 0.25*(xright - xleft);
    var mean_text = svg.append("text")
        .attr("id", "mean")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", param_text_height_pixels)
        .text("\u03BC = " + d3.format(".1f")(mu));
    CenterTextAroundPoint(mean_text, xscale(mean_x), stats_row)

    // Create text showing current standard deviation of normal density
    var sd_x = xleft + 0.50*(xright - xleft);
    var sd_text = svg.append("text")
        .attr("id", "sd")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", param_text_height_pixels)
        .text("\u03C3 = " + d3.format(".1f")(sigma));
    CenterTextAroundPoint(sd_text,   xscale(sd_x),   stats_row)

    // Create text showing current log-likelihood
    var lnL_x = xleft + 0.75*(xright - xleft);
    var lnL_text = svg.append("text")
        .attr("id", "lnL")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", param_text_height_pixels)
        .text("lnL = " + d3.format(".3f")(log_likelihood));
    CenterTextAroundPoint(lnL_text,  xscale(lnL_x),  stats_row)

    function simulateData() {
        dataset = [];

        // Generate data by sampling n values from N(mu, sigma)
        var randomNormalDeviate = d3.randomNormal(mu0, sigma0);
        var sum_v = 0.0;
        var sum_squared_v = 0.0;
        for (var i = 0; i < n0; i++) {
            var v = randomNormalDeviate();
            sum_v += v;
            sum_squared_v += v*v;
            dataset.push({'x':v, 'density':0.0});
        }

        // Compute sample mean and standard deviation (maximum likelihood estimates
        // to which density is "snapped" after dragging)
        sample_mean = sum_v/n0;
        var sample_variance = (sum_squared_v - sample_mean*sample_mean*n0)/n0;
        sample_stddev = Math.sqrt(sample_variance);
    }

    // Function called whenever user changes n0
    function refreshPlot() {
        linedata = [];
        simulateData();

        // Mean, standard deviation, and number of points
        // used to draw the line representing the density curve
        mu = sample_mean;
        sigma = sample_stddev;

        // Recalculate domain for xscale
        var minValue = d3.min(dataset, function(d) {return d.x;});
        var maxValue = d3.max(dataset, function(d) {return d.x;});
        var xbreadth = maxValue - minValue;
        xscale.domain([minValue - (xfrac/200.0)*xbreadth, maxValue + (xfrac/200.0)*xbreadth]);

        console.log("xscale.domain:");
        console.log(xscale.domain());

        // Create new xaxis now that xscale domain has changed
        var xaxis = d3.axisBottom(xscale)
            .ticks(5)
            .tickFormat(d3.format(".1f"));

        // Replace X axis in svg
        svg.select("g#xaxis").remove();
        svg.append("g")
            .attr("id", "xaxis")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xaxis);

        // Recalculate domain for yscale
        recalcLogLikelihood(sample_mean, sample_stddev);
        var maximized_log_likelihood = log_likelihood;
        var maxDensity = d3.max(dataset, function(d) {return d.density;});
        yscale.domain([0, (1.0 + yfrac/100.0)*maxDensity]);

        // Recalculate domain for color_scale
        // worst_lnL: if all n0 points were 5 std. dev. from the mean
        var worst_lnL = (calcLogDensity(mu0 + sigma0*5, mu0, sigma0))*n0;
        var best_lnL = maximized_log_likelihood;
        color_scale.domain([worst_lnL, best_lnL]);

        // Recalculate the line segments making up the density curve
        line_scale.range(xscale.domain());
        recalcLineData(mu, sigma);

        xleft           = xscale.domain()[0]; // recalculated in refreshPlot()
        xright          = xscale.domain()[1]; // recalculated in refreshPlot()
        ybottom         = yscale.domain()[0]; // recalculated in refreshPlot()
        ytop            = yscale.domain()[1]; // recalculated in refreshPlot()

        // Create filled circles representing sampled points
        points_group.selectAll("circle").remove();
        var points = points_group.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d) {return xscale(d.x)})
            .attr("cy", function(d) {return yscale(d.density)})
            .attr("r", point_radius)
            .attr("fill", "red")
            .attr("stroke", "#8B230D")
            .attr("stroke-width", 1)
            .style("pointer-events", "none");   // don't want circles intercepting drag events

        // Create line representing probability density
        lineFunc = d3.line()
            .x(function(d) {return xscale(d.x);})
            .y(function(d) {return yscale(d.y);});
        density = svg.select("path#density")
            .attr("d", lineFunc(linedata));

        mean_text.text("\u03BC = " + d3.format(".1f")(mu));
        sd_text.text(  "\u03C3 = " + d3.format(".1f")(sigma));
        lnL_text.text( "lnL = " + d3.format(".3f")(log_likelihood));
    }
    refreshPlot();

    // provide action for drop-down select
    var nchoice_select = d3.select("select#nchoice")
         .on("change", function() {
            var selected_index = d3.select(this).property('selectedIndex');
            n0 = nchoices[selected_index];
            refreshPlot();
            });

    // provide action for Help button
    var help_button = d3.select("input#helpbtn")
         .on("click", function() {
            var v = help_button.attr("value");
            if (v == "Help") {
                d3.select("g#helpbox").style("display", "inline");
                help_button.attr("value", "Back");
                }
            else {
                d3.select("g#helpbox").style("display", "none");
                help_button.attr("value", "Help");
                }
            }
         );

    // Create scales for choosing scaling factors for sigma based on drag extent
    // The sigma_pos_scale is used if user drags downward
    // The sigma_pos_scale is used if user drags upward
    var sigma_pos_scale = d3.scaleLinear()
        .domain([0,h])
        .range([0.0,30.0]);
    var sigma_neg_scale = d3.scaleLinear()
        .domain([0,-h])
        .range([0.0,-5.0]);

    // Create drag behavior
    var y_at_drag_start = null;
    var sigma_at_drag_start = null;
    var drag = d3.drag()
        .on("start", function(d) {
            y_at_drag_start = d3.event.y;
            sigma_at_drag_start = sigma;
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
        })
        .on("drag", function(d) {
            // Move mu by the amount corresponding to the x-component of the drag
            mu = xscale.invert(xscale(mu) + d3.event.dx);

            // Adjust sigma based on extent of drag in vertical direction
            var dy = d3.event.y - y_at_drag_start;
            if (dy < 0) {
                sigma = sigma_at_drag_start*Math.exp(sigma_neg_scale(dy));
            } else {
                sigma = sigma_at_drag_start*Math.exp(sigma_pos_scale(dy));
            }

            // Recalculate linedata
            recalcLineData(mu, sigma);
            density.attr("d", lineFunc(linedata));

            // Reposition points
            recalcLogLikelihood(mu, sigma);
            var points = points_group.selectAll("circle")
                .attr("cx", function(d) {return xscale(d.x)})
                .attr("cy", function(d) {return yscale(d.density)});

            bounding_rect.attr("fill", color_scale(log_likelihood));

            mean_text.text("\u03BC = " + d3.format(".1f")(mu));
            sd_text.text("\u03C3 = " + d3.format(".1f")(sigma));
            lnL_text.text("lnL = " + d3.format(".3f")(log_likelihood));
        })
        .on("end", function(d) {
            d3.select(this).classed("dragging", false);

            // Move mu back to its MLE
            mu = sample_mean;

            // Move sigma back to its MLE
            sigma = sample_stddev;

            // Recalculate linedata
            recalcLineData(mu, sigma);
            density.transition()
                .duration(500)
                .attr("d", lineFunc(linedata));

            // Reposition points
            recalcLogLikelihood(mu, sigma);
            var points = points_group.selectAll("circle")
                .transition()
                .duration(500)
                .attr("cx", function(d) {return xscale(d.x)})
                .attr("cy", function(d) {return yscale(d.density)});

            bounding_rect.transition()
                .duration(500)
                .attr("fill", color_scale(log_likelihood));

            mean_text.text("\u03BC = " + d3.format(".1f")(mu));
            sd_text.text("\u03C3 = " + d3.format(".1f")(sigma));
            lnL_text.text("lnL = " + d3.format(".3f")(log_likelihood));
        });

    bounding_rect.call(drag);
</script>

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library.
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
