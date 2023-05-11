---
layout: applet
title: Confidence versus credible intervals
author: Paul O. Lewis
permalink: /applets/ci/
---
## Confidence/credible interval applet
Written by Paul O. Lewis (23-Mar-2020). See notes below the plot.

Illustrates the difference between a frequentist confidence interval and a Bayesian 
credible interval for a coin-flipping experiment.

In confidence interval mode, change the true value of theta (expected fraction of heads) 
using the mouse and see the expected distribution of estimated proportion of heads change. 
The confidence interval comprises the set of all theta values for which the original estimated
proportion of heads (dotted vertical line) is not surprising (i.e. somewhere in the black 
region of the histogram).

In credible interval mode, change the "water level" by dragging the horizontal line using 
your mouse. This defines a highest posterior density (HPD) credible interval with the
indicated posterior probability. The MLE of the proportion of heads is shown as a vertical
dotted line, even though the MLE has no role in the construction of a Bayesian credible interval.
Note how the Beta prior affects the posterior, which in turn affects the credible interval.

<div id="arbitrary"></div>
<div id="details"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 23-Mar-2020

    // width and height of svg
    var w = 1000;
    var h = 600;
    var padding = 80;

    var confidence_interval = true;
    var CI_left_bound = 0.0;
    var CI_right_bound = 1.0;

    // data and parameters
    var nheads = 25;
    var nflips = 50;
    var mle = 1.0*nheads/nflips;
    var slider_theta = mle;
    var slider_waterlevel = 0.5;
    var prior_a = 1.0;
    var prior_b = 1.0;

    // plotting-related
    var brickred = "#B82E2E";
    var xmax = 1.0;
    var ymax = 1.0;
    var epsilon = 0.001;
    var nsegments = 500;
    var histdata = [];
    var posterior_data = [];
    var credible_interval_data = [];
    var lower_credible = 0.0;
    var upper_credible = 1.0;
    var credible_interval_size = 0.0;

    // axes labels
    var axis_label_height = 12;
    var axis_label_height_pixels = axis_label_height + "px";

    // param labels
    var param_text_height = 18;
    var param_text_height_pixels = param_text_height + "px";

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

    // Function that calculates the probability of y heads in n flips given p
    function likelihood(y, n, p) {
        var ln_coeff = log_gamma(n+1) - log_gamma(y+1) - log_gamma(n-y+1);
        var ln_prob = ln_coeff + y*Math.log(p) + (n-y)*Math.log(1-p);
        return Math.exp(ln_prob);
    }

    // Returns cumulative probability of h >= nheads (assumes q < nheads/nflips)
    function calcRightTail(q) {
        var h = nheads;
        var like = likelihood(h, nflips, q);
        var cumlike = like;
        h += 1;
        while (h <= nflips) {
            like = likelihood(h, nflips, q);
            cumlike += like;
            h += 1;
            }
        return cumlike;
        }

    // Returns cumulative probability of h <= nheads (assumes q > nheads/nflips)
    function calcLeftTail(q) {
        var h = nheads;
        var like = likelihood(h, nflips, q);
        var cumlike = like;
        h -= 1;
        while (h >= 0) {
            like = likelihood(h, nflips, q);
            cumlike += like;
            h -= 1;
            }
        return cumlike;
        }

    // Given bracket provided, find theta value that comes closes to target water level
    function optimizeConfidenceBound(qlow, qhigh, target, right_tail) {
        var qlower = qlow;
        var qhigher = qhigh;
        var q = (qlower + qhigher)/2.0;
        var p = (right_tail ? calcRightTail(q) : calcLeftTail(q));
        var tol = 0.001;
        var niters = 0;
        var max_iters = 100;
        var diff = Math.abs(p - target);
        while (diff > tol) {
            if (right_tail) {
                // choosing q so that right tail area equals target
                if (p < target) {
                    // q too low
                    qlower = q;
                    q = (q + qhigher)/2.0;
                    p = calcRightTail(q);
                    }
                else {
                    // q too high
                    qhigher = q;
                    q = (qlower + q)/2.0;
                    p = calcRightTail(q);
                    }
                diff = Math.abs(p - target);
                }
            else {
                // choosing q so that left tail area equals target
                if (p > target) {
                    // q too low
                    qlower = q;
                    q = (q + qhigher)/2.0;
                    p = calcLeftTail(q);
                    }
                else {
                    // q too high
                    qhigher = q;
                    q = (qlower + q)/2.0;
                    p = calcLeftTail(q);
                    }
                diff = Math.abs(p - target);
                }
            niters++;
            if (niters > max_iters) {
                console.log("^^^^^ niters > max_iters in optimizeConfidenceBound ^^^^^");
                return q;
                }
            }
        return q;
        }

    CI_left_bound = optimizeConfidenceBound(0.0, mle, 0.025, true);
    CI_right_bound = optimizeConfidenceBound(mle, 1.0, 0.025, false);

    // Function that calculates the probability of y heads in n flips given p
    function posterior(y, n, a, b, p) {
        var ln_coeff = log_gamma(n+a+b+1) - log_gamma(y+a+1) - log_gamma(n-y+b+1);
        var ln_prob = ln_coeff + (y+a-1)*Math.log(p) + (n-y+b-1)*Math.log(1-p);
        return Math.exp(ln_prob);
    }

    //ymax = likelihood(0, nflips, epsilon);
    ymax = 1.5*likelihood(nheads, nflips, nheads/nflips);

    // Create scale for X axis
    var xscale = d3.scaleLinear()
        .domain([0, xmax])
        .range([padding, w - padding]);

    // Create scale for Y axis
    var yscale = d3.scaleLinear()
        .domain([0, ymax])
        .range([h - padding, padding]);

    // Create scale for drawing line segments
    var line_scale = d3.scaleBand()
        .domain(d3.range(nsegments+1))
        .range(xscale.domain());

    // Given bracket provided, find theta value that comes closes to target water level
    function optimizeThetaForWaterLevel(qlow, qhigh, target) {
        var qupper = qhigh;
        var pupper = posterior(nheads, nflips, prior_a, prior_b, qupper);
        var qlower = qlow;
        var plower = posterior(nheads, nflips, prior_a, prior_b, qlower);
        var increasing = (pupper > plower ? true : false);
        var decreasing = !increasing;
        var max_iter = 100;
        var tol = 0.0001;
        var q = (qlower + qupper)/2.;
        var p = posterior(nheads, nflips, prior_a, prior_b, q);
        var iter = 0;
        var diff = Math.abs(p - target);
        while (diff > tol) {
            iter += 1;
            if (iter > max_iter) {
                console.log("^^^^^ reached max_iter in optimizeThetaForWaterLevel ^^^^^");
                return {"theta":q, "density":p};
                }
            var optimum_above_q = ((increasing && p < target) || (decreasing && p > target));
            if (optimum_above_q) {
                // optimum above q because (q,qupper) brackets target
                qlower = q;
                q = (q + qupper)/2.;
                p = posterior(nheads, nflips, prior_a, prior_b, q);
                }
            else {
                // optimum below q because (qlower,q) brackets target
                qupper = q;
                q = (qlower + q)/2.;
                p = posterior(nheads, nflips, prior_a, prior_b, q);
                }
            diff = Math.abs(p - target);
            }

        return {"theta":q, "density":p};
        }

    // Function that recalculates the rectangles making up the histogram
    // and lines making up posterior density curve
    function recalcPlotData() {
        if (confidence_interval) {
            histdata = [];
            var cumprob_p = 0.0;
            for (var y = 0; y <= nflips; y++) {
                var p = 1.0*y/nflips;
                var prob_p = likelihood(y, nflips, slider_theta);
                cumprob_p += prob_p;
                histdata.push({'p':p, 'probp':prob_p, 'cumprobp':cumprob_p});
                }
            }
        else {
            posterior_data = [];
            credible_interval_data = [];
            var prev_theta = line_scale(0);
            var prev_density = 0.0;
            var last_included_i = 0;
            for (var i = 1; i < nsegments; i++) {
                var theta = line_scale(i);
                // calculate posterior for theta corresponding to this segment
                var density = posterior(nheads, nflips, prior_a, prior_b, theta);
                posterior_data.push({'x':theta, 'y':density});
                if (density >= slider_waterlevel) {
                    if (credible_interval_data.length == 0) {
                        // first element in credible_interval_data should comes as close as possible to slider_waterlevel
                        var closest = optimizeThetaForWaterLevel(prev_theta, theta, slider_waterlevel);
                        credible_interval_data.push({'x':closest.theta, 'y':0.0});
                        credible_interval_data.push({'x':closest.theta, 'y':closest.density});
                        }
                    else
                        credible_interval_data.push({'x':theta, 'y':density});
                    last_included_i = i;
                    }
                prev_theta = theta;
                prev_density = density;
                }

            if (credible_interval_data.length > 0) {
                // add one more element to credible_interval_data that comes as close as possible to slider_waterlevel
                prev_theta =  line_scale(last_included_i);
                prev_density = posterior(nheads, nflips, prior_a, prior_b, prev_theta);
                theta =  line_scale(last_included_i+1);
                density = posterior(nheads, nflips, prior_a, prior_b, theta);
                closest = optimizeThetaForWaterLevel(prev_theta, theta, slider_waterlevel);
                credible_interval_data.push({'x':closest.theta, 'y':closest.density});
                credible_interval_data.push({'x':closest.theta, 'y':0.0});
            }

            credible_interval_size = 0.0;
            if (credible_interval_data.length > 0) {
                lower_credible = credible_interval_data[0].x;
                upper_credible = credible_interval_data[credible_interval_data.length-1].x;
                credible_interval_size = incBeta(upper_credible, prior_a + nheads, prior_b + nflips - nheads);
                credible_interval_size -= incBeta(lower_credible, prior_a + nheads, prior_b + nflips - nheads);
                }
            }
    }
    recalcPlotData();

    // ###########################################################################
    // ############################## posterior ##################################
    // ###########################################################################

    // Create path representing density curve
    var lineFunc = d3.line()
        .x(function(d) {return xscale(d.x);})
        .y(function(d) {return yscale(d.y);});

    var hpc = svg.append("path")
            .attr("id", "hpc")
            .attr("d", lineFunc(credible_interval_data))
            .attr("fill", "lavender")
            .attr("stroke", "none")
            .style("pointer-events", "none")   // don't want line intercepting drag events
            .attr("visibility", "hidden");

    var posterior_density = svg.append("path")
            .attr("id", "posterior")
            .attr("d", lineFunc(posterior_data))
            .attr("fill", "none")
            .attr("stroke", brickred)
            .attr("stroke-width", 2)
            .style("pointer-events", "none")   // don't want line intercepting drag events
            .attr("visibility", "hidden");

    // ###########################################################################
    // ############################## histogram ##################################
    // ###########################################################################

    var ci_box = svg.append("rect")
        .attr("id", "ci-box")
        .attr("x", xscale(CI_left_bound))
        .attr("y", yscale(ymax))
        .attr("width", xscale(CI_right_bound) - xscale(CI_left_bound))
        .attr("height", yscale(0)- yscale(ymax) )
        .attr("fill", "lavender")
        .style("pointer-events", "none")   // don't want line intercepting drag events
        .attr("visibility", "visible");

    var histogram = svg.append("g")
        .attr("id", "histogram");
    histogram.selectAll("line.histbar")
        .data(histdata)
        .enter()
        .append("line")
        .attr("class","histbar")
        .attr("x1", function(d) {return xscale(d.p);})
        .attr("y1", function(d) {return yscale(0);})
        .attr("x2", function(d) {return xscale(d.p);})
        .attr("y2", function(d) {return yscale(d.probp);})
        .attr("stroke", function(d) {
            var stroke_color = "black";
            if ((d.cumprobp < 0.025) || (d.cumprobp > 0.975))
                stroke_color = brickred;
            return stroke_color;
            })
        .attr("stroke-width", xscale(1./nflips)-xscale(0))
        .style("pointer-events", "none")   // don't want line intercepting drag events
        .attr("visibility", "visible");

    var mle_line = svg.append("line")
        .attr("id", "mle")
        .attr("x1", xscale(mle))
        .attr("y1", yscale(0))
        .attr("x2", xscale(mle))
        .attr("y2", yscale(ymax))
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2,2,2")
        .attr("visibility", "visible");

    var slider_line = svg.append("line")
        .attr("id", "slider")
        .attr("x1", xscale(slider_theta))
        .attr("y1", yscale(0))
        .attr("x2", xscale(slider_theta))
        .attr("y2", yscale(ymax))
        .attr("stroke", "gray")
        .attr("visibility", "visible");

    // ###########################################################################
    // ############################## density ####################################
    // ###########################################################################

    var water_level = svg.append("line")
        .attr("id", "waterlevel")
        .attr("x1", xscale(0))
        .attr("y1", yscale(slider_waterlevel))
        .attr("x2", xscale(1))
        .attr("y2", yscale(slider_waterlevel))
        .attr("stroke", "gray")
        .attr("visibility", "hidden");

    var lower_bound = svg.append("line")
        .attr("id", "lower-bound")
        .attr("x1", xscale(0.5))
        .attr("y1", yscale(0.0))
        .attr("x2", xscale(0.5))
        .attr("y2", yscale(slider_waterlevel))
        .attr("stroke", "gray")
        .attr("visibility", "hidden");

    var upper_bound = svg.append("line")
        .attr("id", "upper-bound")
        .attr("x1", xscale(0.5))
        .attr("y1", yscale(0.0))
        .attr("x2", xscale(0.5))
        .attr("y2", yscale(slider_waterlevel))
        .attr("stroke", "gray")
        .attr("visibility", "hidden");

    // Create text showing current value of slider_theta
    var theta_text = svg.append("text")
        .attr("id", "vtext")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", param_text_height_pixels)
        .text("theta = " + d3.format(".5f")(slider_theta));
    CenterTextAroundPoint(theta_text, w/2, h - padding/2);

    // Create x axis
    var xaxis = d3.axisBottom(xscale)
        .ticks(5)
        .tickFormat(d3.format(".2f"));

    // Add x axis to svg
    var gxaxis = svg.append("g")
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
    var gyaxis = svg.append("g")
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
    // ######################## replotting functions #############################
    // ###########################################################################

    function replotCredible() {
        // show MLE, posterior density, hpc, and water_level
        mle_line.attr("visibility", "visible")
            .attr("x1", xscale(mle))
            .attr("x2", xscale(mle));
        posterior_density.attr("visibility", "visible")
            .attr("d", lineFunc(posterior_data));
        hpc.attr("visibility", "visible")
            .attr("d", lineFunc(credible_interval_data));
        water_level.attr("visibility", "visible")
            .attr("y1", yscale(slider_waterlevel))
            .attr("y2", yscale(slider_waterlevel));
        if (credible_interval_data.length > 0) {
            var xleft = credible_interval_data[0].x;
            lower_bound.attr("visibility", "visible")
                .attr("x1", xscale(xleft))
                .attr("x2", xscale(xleft))
                .attr("y2", yscale(slider_waterlevel));
            var xright = credible_interval_data[credible_interval_data.length-1].x;
            upper_bound.attr("visibility", "visible")
                .attr("x1", xscale(xright))
                .attr("x2", xscale(xright))
                .attr("y2", yscale(slider_waterlevel));
            theta_text.text(d3.format(".1f")(100.0*credible_interval_size) + "% credible interval = (" + d3.format(".3f")(xleft) + ", " + d3.format(".3f")(xright) + ")");
            }
        else {
            lower_bound.attr("visibility", "hidden");
            upper_bound.attr("visibility", "hidden");
            theta_text.text("(drag down to create credible interval)");
            }

        // hide histogram
        ci_box.attr("visibility", "hidden");
        histogram.selectAll("line.histbar").attr("visibility", "hidden");

        // hide slider
        slider_line.attr("visibility", "hidden");
        }

    function replotConfidence() {
        mle_line.attr("visibility", "visible")
            .attr("x1", xscale(mle))
            .attr("x2", xscale(mle));
        ci_box.attr("visibility", "visible")
            .attr("x", xscale(CI_left_bound))
            .attr("width", xscale(CI_right_bound) - xscale(CI_left_bound));
        histogram.selectAll("line.histbar")
            .data(histdata)
            .attr("y2", function(d) {return yscale(d.probp);})
            .attr("visibility", "visible")
            .attr("stroke", function(d) {
                var stroke_color = "black";
                if ((d.cumprobp < 0.025) || (d.cumprobp > 0.975))
                    stroke_color = brickred;
                return stroke_color;
                });
        slider_line
            .attr("x1", xscale(slider_theta))
            .attr("x2", xscale(slider_theta));

        // show slider
        slider_line.attr("visibility", "visible");

        // hide posterior density, hpc, and water_level
        posterior_density.attr("visibility", "hidden");
        water_level.attr("visibility", "hidden");
        hpc.attr("visibility", "hidden");
        lower_bound.attr("visibility", "hidden");
        upper_bound.attr("visibility", "hidden");

        // theta_text shows slider_theta value
        theta_text.text("theta = " + d3.format(".3f")(slider_theta) + " confidence interval = (" + d3.format(".3f")(CI_left_bound) + ", " + d3.format(".3f")(CI_right_bound) + ")");
        }

    function replot(refresh_histogram) {
        rescaleXAxis();
        console.log("xscale.domain() = " + xscale.domain());
        rescaleYAxis();
        recalcPlotData();

        if (refresh_histogram) {
            //calcConfidenceInterval();
            CI_left_bound = optimizeConfidenceBound(0.0, mle, 0.025, true);
            CI_right_bound = optimizeConfidenceBound(mle, 1.0, 0.025, false);

            histogram.selectAll("line.histbar").remove();
            histogram.selectAll("line.histbar")
                .data(histdata)
                .enter()
                .append("line")
                .attr("class","histbar")
                .attr("x1", function(d) {return xscale(d.p);})
                .attr("y1", function(d) {return yscale(0);})
                .attr("x2", function(d) {return xscale(d.p);})
                .attr("y2", function(d) {return yscale(d.probp);})
                .attr("stroke", function(d) {
                    var stroke_color = "black";
                    if ((d.cumprobp < 0.025) || (d.cumprobp > 0.975))
                        stroke_color = brickred;
                    return stroke_color;
                    })
                .attr("stroke-width", xscale(1./nflips) - xscale(0))
                .style("pointer-events", "none")   // don't want line intercepting drag events
                .attr("visibility", "visible");
            }
        if (confidence_interval)
            replotConfidence();
        else
            replotCredible();
        }
    replot(false);

    // ###########################################################################
    // ################################# drag ####################################
    // ###########################################################################

    // Create drag behavior
    var x_at_drag_start = null;
    var y_at_drag_start = null;
    var p_at_drag_start = null;
    var w_at_drag_start = null;
    var drag = d3.drag()
        .on("start", function() {
            x_at_drag_start = d3.event.x;
            y_at_drag_start = d3.event.y;
            p_at_drag_start = slider_theta;
            w_at_drag_start = slider_waterlevel;
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
        })
        .on("drag", function() {
            if (confidence_interval) {
                // Move slider_line by the amount corresponding to the x-component of the drag
                slider_theta = xscale.invert(xscale(slider_theta) + d3.event.dx);
                if (slider_theta <= epsilon)
                    slider_theta = epsilon;
                else if (slider_theta >= 1.0 - epsilon)
                    slider_theta = 1.0 - epsilon;
                }
            else {
                // Move slider_waterlevel by the amount corresponding to the y-component of the drag
                slider_waterlevel = yscale.invert(yscale(slider_waterlevel) + d3.event.dy);
                if (slider_waterlevel <= epsilon)
                    slider_waterlevel = epsilon;
                }
            recalcPlotData();
            replot(false);
        })
        .on("end", function() {
            d3.select(this).classed("dragging", false);
            recalcPlotData();
            replot(false);
        });

    bounding_rect.call(drag);

    // ###########################################################################
    // ############################## controls ###################################
    // ###########################################################################

    // Function that modifies the domain of xscale
    function rescaleXAxis() {
        //xmax = (nheads == 5 ? 0.4 : 1.0); // 2022-03-08: using 0.4 does not work well for some choices of prior
        xmax = 1.0;
        xscale.domain([0, xmax]);
        gxaxis.call(xaxis);
    }

    // Function that modifies the domain of yscale
    function rescaleYAxis() {
        if (confidence_interval) {
            // just make the yaxis 1.5 times the height of the posterior evaluated at the mle
            ymax = 1.5*likelihood(nheads, nflips, nheads/nflips);
        }
        else {
            // calculate height at peak of posterior density
            if (true) {
                var posterior_mode = 0.5;
                var post_a = prior_a + nheads;
                var post_b = prior_b + nflips - nheads;
                if (post_a > 1 && post_b > 1) {
                   posterior_mode = (post_a - 1)/(post_a + post_b - 2);
                   }
                else if (post_a > post_b) {
                   posterior_mode = 1.0;
                   }
                ymax = posterior(nheads, nflips, prior_a, prior_b, posterior_mode);
                }
            else {
                // just make the yaxis 1.5 tines the height of the posterior evaluated at the mle
                ymax = 1.5*posterior(nheads, nflips, prior_a, prior_b, nheads/nflips);
                }
        }

        if (slider_waterlevel < 0.0)
            slider_waterlevel = ymax;

        // reset domain of yscale
        yscale.domain([0, ymax]);
        gyaxis.call(yaxis);
    }

    var details_div = d3.select("div#details").attr("class", "detailsbox");

    // Prior dropdowns
    var prior_a_choices = ["1", "2", "10", "100"];
    addStringDropdown(details_div, "priora-dropdown", "shape 1", prior_a_choices, 0, function() {
        var selected_index = d3.select(this).property('selectedIndex');
        prior_a = parseFloat(prior_a_choices[selected_index]);
        slider_waterlevel = -1;
        replot(false);
        });
    d3.select("select#priora-dropdown").property("disabled", true);

    var prior_b_choices = ["1", "2", "10", "100"];
    addStringDropdown(details_div, "priorb-dropdown", "shape 2", prior_b_choices, 0, function() {
        var selected_index = d3.select(this).property('selectedIndex');
        prior_b = parseFloat(prior_b_choices[selected_index]);
        slider_waterlevel = -1;
        replot(false);
        });
    d3.select("select#priorb-dropdown").property("disabled", true);

    // Data dropdowns
    var data_choices = ["5/100", "25/50", "50/100"];
    addStringDropdown(details_div, "data-dropdown", "no. heads/no. flips", data_choices, 1, function() {
        var selected_index = d3.select(this).property('selectedIndex');
        var item = data_choices[selected_index];
        if (item == "25/50") {
            nheads = 25;
            nflips = 50;
            }
        else if (item == "50/100") {
            nheads = 50;
            nflips = 100;
            }
        else if (item == "5/100") {
            nheads = 5;
            nflips = 100;
            }
        else {
            nheads = 25;
            nflips = 50;
            };
        mle = 1.0*nheads/nflips;
        slider_theta = mle;
        replot(true);
        });

    // Interval type radio buttons
    addRadioButtons(details_div, "confidence-interval-checkbox", "Confidence interval", ["confidence", "credible"], "confidence", "Interval", function() {
        confidence_interval = ("confidence" == d3.select(this).attr('value'));
        if (confidence_interval) {
            slider_theta = mle;
            d3.select("select#priora-dropdown").property("disabled", true);
            d3.select("select#priorb-dropdown").property("disabled", true);
            }
        else {
            slider_waterlevel = -1;
            d3.select("select#priora-dropdown").property("disabled", false);
            d3.select("select#priorb-dropdown").property("disabled", false);
            }
        replot(true);
        });
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
