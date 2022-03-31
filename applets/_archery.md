---
layout: applet
title: Archery
permalink: /applets/archery/
---


<div class="details"></div>
<div class="container"></div>
<script type="text/javascript">


<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>D3: Archery</title>
        <script src="https://d3js.org/d3.v4.min.js"></script>
		<script type="text/javascript" src="../../lib/simjs/random-0.26.js"></script>
		<script type="text/javascript" src="../../lib/lgamma/lgamma.js"></script>
		<script type="text/javascript" src="../../lib/POLPanel.js"></script>
		<style type="text/css">
            svg text {
                cursor: default;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            svg text::selection {
                background: none;
            }

			.axis path,
			.axis line {
				fill: none;
				stroke: black;
				shape-rendering: crispEdges;
			}

			.axis text {
				font-family: sans-serif;
				font-size: 11px;
			}

            div#wpd3-2-0 {
                position: relative;
            }

            div#targetbox {
                display: inline-block;
                width: 400px;
                height: 400px;
                margin: 0px;
                /* border: 3px solid navy; */
                vertical-align:top;
            }
            div#plotbox {
                display: inline-block;
                width: 400px;
                height: 300px;
                margin: 0px;
                /* border: 3px solid navy; */
                vertical-align:top;
            }
            div#controlbox {
                position: absolute;
                top: 300px;
                left: 400px;
                width: 400px;
                height: 100px;
                vertical-align:top;
                text-align: center;
                /* border: 1px dotted blue; */
            }
		</style>
	</head>
	<body>

<div id="wpd3-2-0"></div>

<script type="text/javascript">
    var shootArrowsAtTarget = function(n, angle_a, angle_b, dist_a, dist_b) {

        // Draw n arrows choosing:
        // distance from center from Gamma(a,b) or Lognormal(a,b)
        // direction from Uniform(0, 2*pi)
        var dataset = [];
        for (var i = 0; i < n; i++) {
            var dist = null;
            if (distplot.is_lognormal) {
                dist  = Math.exp(lot.normal(dist_a, dist_b));
            } else {
                dist  = lot.gamma(dist_a, dist_b);
            }

            // Draw from Normal(angle_a, angle_b) distribution
            // Equals WN(angle_a, rho), where rho = exp(-angle_b^2/2) according to
            // this post: http://stats.stackexchange.com/questions/146424/sample-from-a-von-mises-distribution-by-transforming-a-rv
            var theta = lot.uniform(0, 2.0*Math.PI);
            if (!angleplot.is_uniform) {
                var x = lot.normal(angle_a, angle_b);
                var theta = x % (2.0*Math.PI);
                }

            var p = [dist, -theta]; // use -theta because y axis is inverted
            dataset.push(p);
            }
        return dataset;
        }

    var refreshBoundingBox = function(svg) {
        svg.select("rect.boundingbox")
            .attr("visibility", (show_bounding_boxes ? "visible" : "hidden"));
        }

    function inherit(p) {
        if (p == null)
            throw TypeError();
        if (Object.create)
            return Object.create(p);
        var t = typeof p;
        if (t !== "object" && t !== "function")
            throw TypeError();
        function f() {};
        f.prototype = p;
        return new f();
        }

    function HelpPanel(parent, prefix, t, l, w, h) {
        POLHelpPanel.apply(this, arguments);
        }
    HelpPanel.prototype = inherit(POLHelpPanel.prototype);
    HelpPanel.constructor = HelpPanel;

    HelpPanel.prototype.setup = function() {
        this.infoText(  400, 590,           14, "Written by Paul O. Lewis, January 2017");
        this.infoHTML(  600,  50,           14, "drag right (left) on plot to increase (decrease) &mu;");
        this.infoArrow( 550,  75, 650,  75,  3, true);
        this.infoHTML(  600, 125,           14, "drag up (down) on plot to increase (decrease) &sigma;"); //\u03C3
        this.infoArrow( 600, 170, 600, 220,  3, true);
        this.infoText(  600, 260,           14, "after dragging, arrows will be shot at target, with");
        this.infoText(  600, 280,           14, "distance to bull's eye drawn from specified Gamma");
        this.infoText(  600, 390,           14, "Note units are radians for x-axis of angle density plot");
        this.infoArrow( 600, 420, 600, 520,  3, false);
        this.infoText(  200, 125,           14, "mouse over target to see distance");
        this.infoText(  200, 145,           14, "from bull's eye on distance density plot");
        this.infoText(  200, 165,           14, "and angle on angle density plot");
        this.infoArrow( 200, 200, 250, 250,  2);
        }

    function TargetPanel(parent, prefix, t, l, w, h) {
        POLCanvasPanel.apply(this, arguments);
        }
    TargetPanel.prototype = inherit(POLCanvasPanel.prototype);
    TargetPanel.constructor = TargetPanel;

    TargetPanel.prototype.setup = function() {
        this.r = target_radius;
        this.n = nrings;

        this.hit_inside_target = 0;

        this.xyscale = d3.scaleLinear()
            .domain([-1.25*this.r, 1.25*this.r])
            .range([0,this.width]);

        // Create text showing number of arrows landing on target somewhere
        this.svg.append("text")
            .attr("id", "hittarget")
            .attr("x", this.width/2)
            .attr("y", 20)
            .style("text-anchor", "middle")
            .style("font-family", "Verdana")
            .style("font-size", "10pt")
            .style("pointer-events", "none")
            .text("(arrows inside target = ?)");

        this.drawTarget();
        }

    TargetPanel.prototype.mousemoving = function() {
        var x0 = target.xyscale(0);
        var y0 = x0;
        var coords = d3.mouse(this);
        var x = coords[0];
        var y = coords[1];

        // Compute distance r from (x0,y0) to (x,y)
        var r = Math.sqrt((x-x0)*(x-x0) + (y-y0)*(y-y0));
        var where = target.xyscale.invert(r + target.width/2);
        distplot.showWhere(where);

        // Compute angle of line from (x0,y0) to (x,y)
        //
        //         /|
        //        / |
        //       /  |
        //    r /   | dy = r*sin(theta)
        //     /    |
        //    /     |
        //   /______|
        //      dx = r*cos(theta)
        //
        var dx = x - x0;
        var dy = y0 - y; // reversed because y increases as you go down, not up
        if (dy < 0) {
            var theta = 2.0*Math.PI - Math.acos(dx/r);
            }
        else {
            var theta = Math.acos(dx/r);
            }
        angleplot.showWhere(theta);
        }

    TargetPanel.prototype.mouseleaving = function() {
        distplot.hideWhere();
        angleplot.hideWhere();
        }

    TargetPanel.prototype.drawTarget = function() {
        var ringw = this.r/this.n;
        for (var i = 0; i < this.n; i++) {
            var j = this.n - i;
            this.svg.append("circle")
                .attr("class", "ring")
                .attr("cx", this.xyscale(0))
                .attr("cy", this.xyscale(0))
                .attr("r", this.xyscale(ringw*j) - this.xyscale(0))
                .attr("fill", (i % 2 == 0 ? "white" : "red"))
                .style("pointer-events", "none");
            }

        // draw thin black line around perimeter
        this.svg.append("circle")
            .attr("id", "perimeter")
            .attr("cx", this.xyscale(0))
            .attr("cy", this.xyscale(0))
            .attr("r", this.xyscale(target_radius) - this.xyscale(0))
            .attr("stroke-width", "1")
            .attr("stroke", "black")
            .attr("fill", "none")
            .style("pointer-events", "none");

        // draw bull's eye
        this.svg.append("circle")
            .attr("class", "bullseye")
            .attr("cx", this.xyscale(0))
            .attr("cy", this.xyscale(0))
            .attr("r", this.xyscale(1) - this.xyscale(0))
            .attr("fill", "red")
            .style("pointer-events", "none");
        }

    TargetPanel.prototype.destroyExistingArrowHoles = function() {
        this.svg.selectAll("circle.arrowhole")
            .remove();
        }

    TargetPanel.prototype.drawArrowHoles = function(dataset) {
        // dataset[0] = r
        // dataset[1] = theta
        //
        //         /|
        //        / |
        //       /  |
        //    r /   | dy = r*sin(theta)
        //     /    |
        //    /     |
        //   /______|
        //      dx = r*cos(theta)
        //
        var scale = this.xyscale;
        this.svg.selectAll("circle.arrowhole")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "arrowhole")
            .attr("cx", function(d) {
                return scale(d[0]*Math.cos(d[1]));
                })
            .attr("cy", function(d) {
                return scale(d[0]*Math.sin(d[1]));
                })
            .attr("r", scale(1)-scale(0))
            .attr("visibility", (show_points ? "visible" : "hidden"))
            .attr("fill", "black")
            .style("pointer-events", "none");
        }

    var countHits = function(data, target_radius) {
        var n = 0;
        for (i in data) {
            if (data[i][0] < target_radius)
                n++;
            }
        return n;
        }

    // ###################################### AnglePlotPanel #############################

    function AnglePlotPanel(parent, prefix, t, l, w, h, mean, stdev, limits, xlab, ylab) {
        this.is_uniform = false;
        POLPlotPanel.apply(this, arguments);
        }
    AnglePlotPanel.prototype = inherit(POLPlotPanel.prototype);
    AnglePlotPanel.constructor = AnglePlotPanel;

    AnglePlotPanel.prototype.mousemoving = function() {
        angleplot.handle_mousemoving(d3.event);
        }

    AnglePlotPanel.prototype.mouseleaving = function() {
        angleplot.handle_mouseleaving(d3.event);
        }

    AnglePlotPanel.prototype.dragstarting = function() {
        angleplot.handle_dragstarting(d3.event);
        }

    AnglePlotPanel.prototype.dragstopping = function() {
        angleplot.handle_dragstopping(d3.event);
        }

    AnglePlotPanel.prototype.calcLogDensity = function(x) {
        // Wrapped Normal density function: see https://en.wikipedia.org/wiki/Wrapped_normal_distribution
        if (this.is_uniform) {
            return -Math.log(2.0*Math.PI);
            }
        var logy = 0.0;
        var two_sigma_squared = Math.pow(this.param2,2.0);
        var sumexpterms = 0.0;
        for (var k = -1; k < 2; k++) {
            sumexpterms += Math.exp(-Math.pow(x + 2.0*Math.PI*k - this.param1, 2.0)/two_sigma_squared);
            }
        logy += Math.log(sumexpterms);
        logy -= Math.log(this.param2)
        logy -= 0.5*Math.log(2.0*Math.PI);
        return logy;
        }

    AnglePlotPanel.prototype.recalcParams = function() {
        this.param1 = this.mu;
        this.param2 = this.sigma;
        }

    AnglePlotPanel.prototype.setup = function() {
        // Create text showing current mean and standard deviation of normal distribution
        this.meansd = this.svg.append("text")
            .attr("id", this.prefix + "-meansd")
            .attr("x", this.width/2)
            .attr("y", 20)
            .style("text-anchor", "middle")
            .style("font-family", "Verdana")
            .style("font-size", "12pt")
            .style("pointer-events", "none")
            .html("\u03BC = " + d3.format(".1f")(this.mu) + "&nbsp;&nbsp;&nbsp;\u03C3 = " + d3.format(".1f")(this.sigma));

        // Create vertical dotted line used to show where we are on the target
        this.show_where = this.svg.append("line")
            .attr("id", this.prefix + "-showwhere")
            .attr("x1", this.xscale(this.max_x/2))
            .attr("y1", this.yscale(0))
            .attr("x2", this.xscale(this.max_x/2))
            .attr("y2", this.yscale(this.max_y))
            .attr("stroke-width", 1)
            .attr("stroke-linecap", "round")
            .attr("stroke-dasharray", "1, 2")
            .attr("visibility", "hidden")
            .attr("stroke", "black");

        this.afterdrag();
        }

    AnglePlotPanel.prototype.showWhere = function(x) {
        this.show_where.attr("x1", this.xscale(x))
                       .attr("x2", this.xscale(x))
                       .attr("visibility", "visible");
        }

    AnglePlotPanel.prototype.hideWhere = function() {
        this.show_where.attr("visibility", "hidden");
        }

    AnglePlotPanel.prototype.duringdrag = function() {
        //console.log("AnglePlotPanel.prototype.duringdrag");
        this.meansd.html("\u03BC = " + d3.format(".1f")(this.mu) + "&nbsp;&nbsp;&nbsp;\u03C3 = " + d3.format(".1f")(this.sigma));
        }

    AnglePlotPanel.prototype.afterdrag = function() {
        this.meansd.html("\u03BC = " + d3.format(".1f")(this.mu) + "&nbsp;&nbsp;&nbsp;\u03C3 = " + d3.format(".1f")(this.sigma));

        // Empty the quiver
        target.destroyExistingArrowHoles();
        this.recalcParams();
        var pointdata = shootArrowsAtTarget(narrows, this.param1, this.param2, distplot.param1, distplot.param2);
        target.drawArrowHoles(pointdata);
        d3.select("text#hittarget").text("(arrows inside target = " + countHits(pointdata, target_radius) + ")");
        }

    // ###################################################################################

    function DistPlotPanel(parent, prefix, t, l, w, h, mean, stdev, limits, xlab, ylab) {
        this.is_lognormal = false;
        POLPlotPanel.apply(this, arguments);
        }
    DistPlotPanel.prototype = inherit(POLPlotPanel.prototype);
    DistPlotPanel.constructor = DistPlotPanel;

    DistPlotPanel.prototype.mousemoving = function() {
        distplot.handle_mousemoving(d3.event);
        }

    DistPlotPanel.prototype.mouseleaving = function() {
        distplot.handle_mouseleaving(d3.event);
        }

    DistPlotPanel.prototype.dragstarting = function() {
        distplot.handle_dragstarting(d3.event);
        }

    DistPlotPanel.prototype.dragstopping = function() {
        //d3.event.sourceEvent.stopPropagation();
        distplot.handle_dragstopping(d3.event);
        }

    DistPlotPanel.prototype.calcLogDensity = function(x) {
        var logy = 0.0;
        if (this.is_lognormal) {
            // Lognormal(param1, param2) density
            // logmu = 2.884160497896886
            // logsigma = 0.2231435513142097
            // x      = 0.39603960396039606
            // log(x) = -0.926241063
            // -(log(x) - mu)^2/(2 sigma^2) = pc "-pow(log(0.39604) - 2.88416, 2.)/(2.*.22314)"
            var logx = Math.log(x);
            logy -= Math.pow(logx - this.param1, 2.0)/(2.0*Math.pow(this.param2, 2.0));
            logy -= logx;
            logy -= Math.log(this.param2);
            logy -= Math.log(2.0*Math.PI)/2.0;
        } else {
            // Gamma(param1, param2) density (shape=param1, scale=param2, rate=1/param2)
            logy += (this.param1 - 1.0)*Math.log(x);
            logy -= x/this.param2;
            logy -= this.param1*Math.log(this.param2);
            logy -= log_gamma(this.param1);
        }
        return logy;
        }

    DistPlotPanel.prototype.recalcParams = function() {
        if (this.is_lognormal) {
            var m = this.mu;
            var mm = this.mu*this.mu;
            var v = this.sigma*this.sigma;
            var term = Math.sqrt(Math.log(v + mm) - Math.log(mm));
            this.param1 = Math.log(mm) - Math.log(m) - term/2.0;
            this.param2 = Math.sqrt(term);
            //console.log("lognormal: mu = " + this.mu + ", sigma = " + this.sigma + ", logmu = " + this.param1 + ", logsigma = " + this.param2);
            }
        else {
            this.param2 = this.sigma*this.sigma/this.mu;
            this.param1 = this.mu/this.param2;
            //console.log("gamma: mu = " + this.mu + ", sigma = " + this.sigma + ", shape = " + this.param1 + ", scale = " + this.param2);
            }
        }

    DistPlotPanel.prototype.setup = function() {
        // Create text showing current mean and standard deviation of gamma distribution
        this.meansd = this.svg.append("text")
            .attr("id", this.prefix + "-meansd")
            .attr("x", this.width/2)
            .attr("y", 20)
            .style("text-anchor", "middle")
            .style("font-family", "Verdana")
            .style("font-size", "12pt")
            .style("pointer-events", "none")
            .html("\u03BC = " + d3.format(".1f")(this.mu) + "&nbsp;&nbsp;&nbsp;\u03C3 = " + d3.format(".1f")(this.sigma));

        // Create vertical dotted line used to show where we are on the target
        this.show_where = this.svg.append("line")
            .attr("id", this.prefix + "-showwhere")
            .attr("x1", this.xscale(this.max_x/2))
            .attr("y1", this.yscale(0))
            .attr("x2", this.xscale(this.max_x/2))
            .attr("y2", this.yscale(this.max_y))
            .attr("stroke-width", 1)
            .attr("stroke-linecap", "round")
            .attr("stroke-dasharray", "1, 2")
            .attr("visibility", "hidden")
            .attr("stroke", "black");

        this.afterdrag();
        }

    DistPlotPanel.prototype.showWhere = function(x) {
        this.show_where.attr("x1", this.xscale(x))
                       .attr("x2", this.xscale(x))
                       .attr("visibility", "visible");
        }

    DistPlotPanel.prototype.hideWhere = function() {
        this.show_where.attr("visibility", "hidden");
        }

    DistPlotPanel.prototype.duringdrag = function() {
        //console.log("DistPlotPanel.prototype.duringdrag");
        this.meansd.html("\u03BC = " + d3.format(".1f")(this.mu) + "&nbsp;&nbsp;&nbsp;\u03C3 = " + d3.format(".1f")(this.sigma));
        }

    DistPlotPanel.prototype.afterdrag = function() {
        this.meansd.html("\u03BC = " + d3.format(".1f")(this.mu) + "&nbsp;&nbsp;&nbsp;\u03C3 = " + d3.format(".1f")(this.sigma));

        // Empty the quiver
        target.destroyExistingArrowHoles();
        this.recalcParams();
        var pointdata = shootArrowsAtTarget(narrows, angleplot.param1, angleplot.param2, this.param1, this.param2);
        target.drawArrowHoles(pointdata);
        d3.select("text#hittarget").text("(arrows inside target = " + countHits(pointdata, target_radius) + ")");
        }

    function ControlPanel(parent, prefix, t, l, w, h) {
        POLPanel.apply(this, arguments);
        }
    ControlPanel.prototype = inherit(POLPanel.prototype);
    ControlPanel.constructor = ControlPanel;

    ControlPanel.prototype.setup = function() {

        // Create drop-down list within details_div to allow changing number of arrows
        addIntDropdown(this.div,
            "arrows-in-quiver",
            "Number of arrows in quiver",
            arrow_number,
            arrow_number.indexOf(narrows),
            function() {
                var selected_index = d3.select(this).property('selectedIndex');
                //console.log("selected_index = " + selected_index);
                narrows = arrow_number[selected_index];
                //console.log("narrows = " + narrows);
                distplot.afterdrag();
                });

        /*addStringDropdown(this.div, "distance", "Distance", ["Gamma", "Lognormal"], 2, function() {
                var selected_index = d3.select(this).property('selectedIndex');
                console.log("selected_index = " + selected_index);
                if (selected_index == 0)
                    distplot.is_lognormal = false;
                else
                    distplot.is_lognormal = true;
                distplot.refreshPlot();
                distplot.afterdrag();
            });*/
        addRadioButtons(this.div,
            "distdistr",
            "distdistr",
            ["Gamma", "Lognormal"],
            (distplot.is_lognormal ? "Lognormal" : "Gamma"),
            "Distance Distribution",
            function() {
                var is_checked = d3.select(this).property('checked');
                var v = d3.select(this).attr("value");
                //console.log("radio " + v + " is " + (is_checked ? "checked" : "not checked"));
                if (v == "Gamma")
                    distplot.is_lognormal = false;
                else
                    distplot.is_lognormal = true;
                distplot.refreshPlot();
                distplot.afterdrag();
            });

        addRadioButtons(
            this.div,
            "angledistr",
            "angledistr",
            ["Uniform", "Normal"],
            (angleplot.is_uniform ? "Uniform" : "Normal"),
            "Angle Distribution",
            function() {
                var is_checked = d3.select(this).property('checked');
                var v = d3.select(this).attr("value");
                if (v == "Uniform") {
                    angleplot.is_uniform = true;
                    angleplot.recalcParams();
                    angleplot.disableDragging();
                    angleplot.meansd.attr("visibility", "hidden");
                    }
                else {
                    angleplot.is_uniform = false;
                    angleplot.enableDragging();
                    angleplot.meansd.attr("visibility", "visible");
                    }
                angleplot.refreshPlot();
                angleplot.afterdrag();
            });

        // Checkboxes
        // addCheckbox(div, "Show bounding boxes", function() {
        //         show_bounding_boxes = d3.select(this).property("checked");
        //         refreshBoundingBox(target.svg);
        //         refreshBoundingBox(plot_svg);
        //         });

        // Buttons
        addButton(
            this.div,
            "helpbtn",
            "Help",
            function() {
                d3.select("div#helpbox")
                    .style("display", "block");
                },
            "100px", true);

        // Create text showing current mean of gamma distribution
        // div.append("p")
        //     .attr("id", "meansd")
        //     .style("font-family", "Verdana")
        //     .style("font-size", "12pt")
        //     .html("\u03BC = " + d3.format(".1f")(distplot.mu) + "&nbsp;&nbsp;&nbsp;\u03C3 = " + d3.format(".1f")(distplot.sigma));
        //
        // Create text showing number of arrows landing on target somewhere
        // div.append("p")
        //     .attr("id", "hittarget")
        //     .style("font-family", "Verdana")
        //     .style("font-size", "10pt")
        //     .text("(arrows inside target = " + nhits + ")");
        }

    //####################################################################################
    //####################################################################################
    //####################################################################################

    // Flags determining what will be shown
    var show_bounding_boxes             = false;
    var show_axes                       = true;
    var show_points                     = true

    // Create a pseudorandom number generator
    //var lot = new Random(12347);
    var lot = new Random();

    // Target radius in centimeters
    var target_radius = 32.0;
    var nrings = 5;

    // Number of arrows to shoot
    var arrow_number = [10, 20, 50, 100];
    var narrows = 50;

    // Latch onto container div already created above
    var container_div = d3.select("div#wpd3-2-0");

    var target      = new TargetPanel(container_div, "target", 0, 0, 400, 400);
    var distplot    = new DistPlotPanel(container_div, "distplot", 0, 400, 400, 300, 20, 10, {"xmin": 0, "xmax": 40, "ymin": 0, "ymax": 0.2, "dymouse": [-5,30]}, null, "Probability density");
    var angleplot   = new AnglePlotPanel(container_div, "angleplot", 300, 400, 400, 300, Math.PI, .5, {"xmin": 0, "xmax": 2.0*Math.PI, "ymin": 0., "ymax": 5.0, "dymouse": [-5,30]}, null, "Probability density");
    var control     = new ControlPanel(container_div, "ctrl", 400, 0, 400, 100);
    var help        = new HelpPanel(container_div, "helpbox", 0, 0, 800, 600);

    target.setup();
    distplot.setup();
    angleplot.setup();
    control.setup();
    help.setup();

</script>
</body>
</html>

