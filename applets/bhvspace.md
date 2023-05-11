---
layout: applet
title: BHV Space
permalink: /applets/bhvspace/
---
## BHV Space

An illustration of the space of phylogenetic trees described in the following paper:

> LJ Billera, SP Holmes, and K Vogtmann. 2001. Geometry of the space of phylogenetic trees. Advances in Applied Mathematics 27:733-767.

See the Details section below the plot for further explanation.

<div id="arbitrary"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 30-Aug-2019
    <div id="treespace" class="container"></div>
    <script type="text/javascript">
        // written by Paul O. Lewis 6-Dec-2017

        // width and height
        var w = 600;
        var h = 600;

        // center of the plot
        var x0 = w/2;
        var y0 = h/2;

        // center of tree shown in upper left quadrant
        var xtree = w/4;
        var ytree = h/4;

        // tree coordinates
        var treeA_x = x0 - w/4;
        var treeA_y = y0 + h/4;
        var treeA_prev_x = null;
        var treeA_prev_y = null;

        var treeB_x = x0 + w/4;
        var treeB_y = y0 - h/4;
        var treeB_prev_x = null;
        var treeB_prev_y = null;

        // used for sliding tree along path
        var source = "A";   // which tree (A or B) represents the starting point
        var leg = 1;        // which leg we're on currently

        var mover_x = treeA_x;
        var mover_y = treeA_y;

        var leg1 = 0.0;     // length of first leg
        var leg2 = 0.0;     // legnth of second leg

        var slope1 = 0.0;   // slope of first leg
        var slope2 = 0.0;   // slope of second leg

        var leg1_x1 = 0;    // x coordinate for leg1 starting point
        var leg1_y1 = 0;    // y coordinate for leg1 starting point
        var leg1_x2 = 0;    // x coordinate for leg1 ending point
        var leg1_y2 = 0;    // y coordinate for leg1 ending point

        var leg2_x1 = 0;    // x coordinate for leg2 starting point
        var leg2_y1 = 0;    // y coordinate for leg2 starting point
        var leg2_x2 = 0;    // x coordinate for leg2 ending point
        var leg2_y2 = 0;    // y coordinate for leg2 ending point

        var nsteps1 = 0;     // number of steps taken along leg1
        var nsteps2 = 0;     // number of steps taken along leg2

        var incr1 = 0.0;    // how far mover moves along leg1 each tick
        var incr2 = 0.0;    // how far mover moves along leg2 each tick

        var stride1 = 0;    // which stride we're on in leg1
        var stride2 = 0;    // which stride we're on in leg2

        // miscellaneous dimensions
        var axis_thickness = 5;
        var edge_thickness = 5;
        var point_radius = 8;
        var leaf_edge_length = 20.;
        var leaf_label_height = 18.;
        var max_internal_length = (y0 - 2.*(leaf_label_height + leaf_edge_length/Math.sqrt(2.)))/2.;
        var label_spacer = 8;

        // Arrowhead parameters
        //var xdelta = 0.2;  // half-width of yellow arrowhead
        //var ydelta = 0.1;  // height of yellow arrowhead

        // color(i) returns ith predefined color of 10 total in schemeCategory10
        //var color = d3.scaleOrdinal()
        //    .range(d3.schemeCategory10);

        // axis colors
        var S0color = "mediumorchid"; //color(9);
        var S1color = "mediumseagreen"; //color(7);
        var T0color = "sandybrown"; //color(8);
        var T1color = "steelblue"; //color(6);

        // point colors
        var Scolor  = "black";
        var Tcolor  = "black";

        //////////////////////
        // Set up treespace //
        //////////////////////

        // Listen and react to keystrokes
        d3.select("body")
            .on("keydown", keyDown);

        // Create DIV element to hold SVG
        var plot_div = d3.select("div#treespace");

        // Create SVG element
        var plot_svg = plot_div.append("svg")
            .attr("width", w)
            .attr("height", h)
            .on("mousemove", mouseMove)
            .on("mouseup", mouseUp);

        // Create rect outlining entire area of SVG
        plot_svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "lavender");

        // Create rect defining upper left quadrant that is outside treespace
        plot_svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", x0)
            .attr("height", y0)
            .attr("fill", "lightgray");

        // Create line defining S0 axis
        plot_svg.append("line")
            .attr("x1", x0)
            .attr("y1", y0)
            .attr("x2", 0)
            .attr("y2", y0)
            .attr("stroke-width", axis_thickness)
            .attr("stroke", S0color);

        // Create line defining T0 axis
        plot_svg.append("line")
            .attr("x1", x0)
            .attr("y1", y0)
            .attr("x2", w)
            .attr("y2", y0)
            .attr("stroke-width", axis_thickness)
            .attr("stroke", T0color);

        // Create line defining S1 axis
        plot_svg.append("line")
            .attr("x1", x0)
            .attr("y1", y0)
            .attr("x2", x0)
            .attr("y2", h)
            .attr("stroke-width", axis_thickness)
            .attr("stroke", S1color);

        // Create line defining T1 axis
        plot_svg.append("line")
            .attr("x1", x0)
            .attr("y1", y0)
            .attr("x2", x0)
            .attr("y2", 0)
            .attr("stroke-width", axis_thickness)
            .attr("stroke", T1color);

        //////////////////////////
        // Create path segments //
        //////////////////////////

        var path1 = plot_svg.append("line")
            .attr("id", "path1")
            .attr("x1", x0)
            .attr("y1", y0)
            .attr("x2", treeA_x)
            .attr("y2", treeA_y)
            .attr("stroke-width", edge_thickness)
            .attr("stroke", "black")
            .style("visibility", "visible");

        var path2 = plot_svg.append("line")
            .attr("id", "path2")
            .attr("x1", x0)
            .attr("y1", y0)
            .attr("x2", treeB_x)
            .attr("y2", treeB_y)
            .attr("stroke-width", edge_thickness)
            .attr("stroke", "black")
            .style("visibility", "visible");

        ///////////////////////////////////////////////
        // Create points representing path endpoints //
        ///////////////////////////////////////////////

        // Create point representing tree A location
        var treeA = plot_svg.append("circle")
            .attr("id", "treeA")
            .attr("cx", treeA_x)
            .attr("cy", treeA_y)
            .attr("r", point_radius)
            .attr("fill", Scolor)
            .on("mousedown", function() {
                treeA_prev_x = d3.mouse(this)[0];
                treeA_prev_y = d3.mouse(this)[1];
                treeA.attr("cx", treeA_prev_x).attr("cy", treeA_prev_y);
                });

        // Create point representing tree B location
        var treeB = plot_svg.append("circle")
            .attr("id", "treeB")
            .attr("cx", treeB_x)
            .attr("cy", treeB_y)
            .attr("r", point_radius)
            .attr("fill", Tcolor)
            .on("mousedown", function() {
                treeB_prev_x = d3.mouse(this)[0];
                treeB_prev_y = d3.mouse(this)[1];
                treeB.attr("cx", treeB_prev_x).attr("cy", treeB_prev_y);
                });

        // Create point representing mover location
        var mover = plot_svg.append("circle")
            .attr("id", "mover")
            .attr("cx", mover_x)
            .attr("cy", mover_y)
            .attr("r", point_radius)
            .attr("fill", "red")
            .attr("visibility", "hidden")
            .attr("pointer-events", "none");

        ////////////////////////////////////////
        // Create edges of the displayed tree //
        ////////////////////////////////////////

        var upper_internal = plot_svg.append("line")
            .attr("id", "upper")
            .attr("x1", xtree)
            .attr("y1", ytree)
            .attr("x2", xtree-1)    // temporary end point
            .attr("y2", ytree+1)    // temporary end point
            .attr("stroke-width", edge_thickness)
            .attr("stroke", S0color);

        var lower_internal = plot_svg.append("line")
            .attr("id", "lower")
            .attr("x1", xtree)
            .attr("y1", ytree)
            .attr("x2", xtree-1)    // temporary end point
            .attr("y2", ytree-1)    // temporary end point
            .attr("stroke-width", edge_thickness)
            .attr("stroke", S1color);

        var leaf0 = plot_svg.append("line")
            .attr("id", "leaf0")
            .attr("x1", xtree)
            .attr("y1", ytree)
            .attr("x2", xtree-1)    // temporary end point
            .attr("y2", ytree-1)    // temporary end point
            .attr("stroke-width", edge_thickness)
            .attr("stroke", "black");

        var leaf1 = plot_svg.append("line")
            .attr("id", "leaf1")
            .attr("x1", xtree)
            .attr("y1", ytree)
            .attr("x2", xtree-1)    // temporary end point
            .attr("y2", ytree-1)    // temporary end point
            .attr("stroke-width", edge_thickness)
            .attr("stroke", "black");

        var leaf2 = plot_svg.append("line")
            .attr("id", "leaf2")
            .attr("x1", xtree)
            .attr("y1", ytree)
            .attr("x2", xtree-1)    // temporary end point
            .attr("y2", ytree-1)    // temporary end point
            .attr("stroke-width", edge_thickness)
            .attr("stroke", "black");

        var leaf3 = plot_svg.append("line")
            .attr("id", "leaf3")
            .attr("x1", xtree)
            .attr("y1", ytree)
            .attr("x2", xtree-1)    // temporary end point
            .attr("y2", ytree-1)    // temporary end point
            .attr("stroke-width", edge_thickness)
            .attr("stroke", "black");

        var leaf4 = plot_svg.append("line")
            .attr("id", "leaf4")
            .attr("x1", xtree)
            .attr("y1", ytree)
            .attr("x2", xtree-1)    // temporary end point
            .attr("y2", ytree-1)    // temporary end point
            .attr("stroke-width", edge_thickness)
            .attr("stroke", "black");

        ///////////////////////////////////////////////
        // Create labels for nodes in displayed tree //
        ///////////////////////////////////////////////

        var label0 = plot_svg.append("text")
            .attr("id", "label0")
            .attr("x", xtree)
            .attr("y", ytree)
            .attr("stroke", "black")
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("0");

        var label1 = plot_svg.append("text")
            .attr("id", "label1")
            .attr("x", xtree)
            .attr("y", ytree)
            .attr("stroke", "black")
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("1");

        var label2 = plot_svg.append("text")
            .attr("id", "label2")
            .attr("x", xtree)
            .attr("y", ytree)
            .attr("stroke", "black")
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("2");

        var label3 = plot_svg.append("text")
            .attr("id", "label3")
            .attr("x", xtree)
            .attr("y", ytree)
            .attr("stroke", "black")
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("3");

        var label4 = plot_svg.append("text")
            .attr("id", "label4")
            .attr("x", xtree)
            .attr("y", ytree)
            .attr("stroke", "black")
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("4");

        ////////////////////////////
        // Create labels for axes //
        ////////////////////////////

        var s0axislabel = plot_svg.append("text")
            .attr("id", "s0axis")
            .attr("x", label_spacer)
            .attr("y", y0 + leaf_label_height + label_spacer)
            .attr("stroke", "black")
            .attr("text-anchor", "start")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("04|123");

        var s1axislabel = plot_svg.append("text")
            .attr("id", "s1axis")
            .attr("x", x0 + label_spacer)
            .attr("y", h - label_spacer)
            .attr("stroke", "black")
            .attr("text-anchor", "start")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("23|014");

        var t0axislabel = plot_svg.append("text")
            .attr("id", "t0axis")
            .attr("x", w - label_spacer)
            .attr("y", y0 + leaf_label_height + label_spacer)
            .attr("stroke", "black")
            .attr("text-anchor", "end")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("01|234");

        var t1axislabel = plot_svg.append("text")
            .attr("id", "t1axis")
            .attr("x", x0 + label_spacer)
            .attr("y", leaf_label_height + label_spacer)
            .attr("stroke", "black")
            .attr("text-anchor", "start")
            .attr("pointer-events", "none")
            .style("font-family", "Verdana")
            .style("font-size", leaf_label_height + "px")
            .text("34|012");

        ///////////////////////
        // quadrant function //
        ///////////////////////
        var quadrant = function(x, y) {
            if (x <= x0 && y >= y0)
                return 0;
            else if (x >= x0 && y >= y0)
                return 1;
            else if (x >= x0 && y <= y0)
                return 2;
            else
                return 3;
            }

        ////////////////////////
        // splitPath function //
        ////////////////////////
        var splitPath = function(a,b,x,y,c,d) {
            mover_x = a;
            mover_y = b;
            stride1 = 0;
            stride2 = 0;

            leg1 = Math.sqrt(Math.pow(a-x,2) + Math.pow(b-y,2));
            leg2 = Math.sqrt(Math.pow(x-c,2) + Math.pow(y-d,2));

            leg1_x1 = a;
            leg1_y1 = b;
            leg1_x2 = x;
            leg1_y2 = y;
            slope1 = (leg1_y2 - leg1_y1)/(leg1_x2 - leg1_x1)

            leg2_x1 = x;
            leg2_y1 = y;
            leg2_x2 = c;
            leg2_y2 = d;
            slope2 = (leg2_y2 - leg2_y1)/(leg2_x2 - leg2_x1)

            console.log("in SplitPath...leg1_x1 = " + leg1_x1 + ", leg1_y1 = " + leg1_y1);

            // Set strides so that we could cross entire diagonal in 20 steps (= 20 seconds)
            var diagonal_length = Math.sqrt(Math.pow(w,2) + Math.pow(h,2));
            var incr = diagonal_length/20;

            nsteps1 = Math.floor(leg1/incr);
            incr1 = leg1/nsteps1;
            nsteps2 = Math.floor(leg2/incr);
            incr2 = leg2/nsteps2;
            }

        ///////////////////////
        // conePath function //
        ///////////////////////
        var conePath = function(a,b,c,d) {
            console.log("cone path: (a,b) = (" + a + "," + b + ") ~ (c,d) = (" + c + "," + d + ")");
            console.log("  mover: (x,y) = (" + mover_x + "," + mover_y + ")");
            splitPath(a,b,x0,y0,c,d);
            mover.attr("cx", mover_x).attr("cy", mover_y);
            path1.attr("x1", a).attr("y1", b).attr("x2", x0).attr("y2", y0).attr("visibility", "visible");
            path2.attr("x1", c).attr("y1", d).attr("x2", x0).attr("y2", y0).attr("visibility", "visible");
            }

        ///////////////////////////
        // straightPath function //
        ///////////////////////////
        var straightPath = function(a,b,c,d) {
            console.log("straight path: (a,b) = (" + a + "," + b + ") ~ (c,d) = (" + c + "," + d + ")");
            console.log("  mover: (x,y) = (" + mover_x + "," + mover_y + ")");
            splitPath(a,b,(a+c)/2,(b+d)/2,c,d);
            mover.attr("cx", mover_x).attr("cy", mover_y);
            path1.attr("x1", a).attr("y1", b).attr("x2", (a+c)/2).attr("y2", (b+d)/2).attr("visibility", "visible");
            path2.attr("x1", (a+c)/2).attr("y1", (b+d)/2).attr("x2", c).attr("y2", d).attr("visibility", "visible");
            }

        ///////////////////////
        // showPath function //
        ///////////////////////
        var showPath = function() {
            leg = 1;
            stride1 = 0;
            stride2 = 0;
            if (quadrant(treeA_x, treeA_y) == 0 && quadrant(treeB_x, treeB_y) == 2) {
                var a = treeA_x;
                var b = treeA_y;
                var c = treeB_x;
                var d = treeB_y;
                var m = (d-b)/(c-a);
                var x_at_y0 = a + (y0-b)/m;
                var y_at_x0 = b + m*(x0-a);
                if (x_at_y0 < x0 && y_at_x0 < y0) {
                    if (source == "B")
                        conePath(c,d,a,b);
                    else
                        conePath(a,b,c,d);
                    }
                else {
                    if (source == "B")
                        straightPath(c,d,a,b);
                    else
                        straightPath(a,b,c,d);
                    }
                }
            else if (quadrant(treeA_x, treeA_y) == 2 && quadrant(treeB_x, treeB_y) == 0) {
                var a = treeB_x;
                var b = treeB_y;
                var c = treeA_x;
                var d = treeA_y;
                var m = (d-b)/(c-a);
                var x_at_y0 = a + (y0-b)/m;
                var y_at_x0 = b + m*(x0-a);
                if (x_at_y0 < x0 && y_at_x0 < y0) {
                    if (source == "A")
                        conePath(c,d,a,b);
                    else
                        conePath(a,b,c,d);
                    }
                else {
                    if (source == "A")
                        straightPath(c,d,a,b);
                    else
                        straightPath(a,b,c,d);
                    }
                }
            else {
                if (source == "A")
                    straightPath(treeA_x, treeA_y, treeB_x, treeB_y);
                else
                    straightPath(treeB_x, treeB_y, treeA_x, treeA_y);
                }
            }

        ///////////////////////
        // plotTree function //
        ///////////////////////
        var plotTree = function(x, y, milisecs) {
            var xC  = xtree;
            var xL  = xtree - leaf_edge_length/Math.sqrt(2.);
            var xR  = xtree + leaf_edge_length/Math.sqrt(2.);
            var xFR = xtree + leaf_edge_length;
            var yC = ytree;

            if (x <= x0 && y >= y0) {
                // lower left quadrant
                var s0 = (x0 - x)/(x0);
                var s1 = (y - y0)/(y0);
                var yNT = ytree - s0*max_internal_length;
                var yT = ytree - s0*max_internal_length - leaf_edge_length/Math.sqrt(2.);
                var yNB = ytree + s1*max_internal_length;
                var yB = ytree + s1*max_internal_length + leaf_edge_length/Math.sqrt(2.);
                leaf0.transition().duration(milisecs).attr("x1", xC).attr("y1", yNT).attr("x2", xL).attr("y2", yT);
                leaf4.transition().duration(milisecs).attr("x1", xC).attr("y1", yNT).attr("x2", xR).attr("y2", yT);
                leaf1.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xFR).attr("y2", yC);
                leaf2.transition().duration(milisecs).attr("x1", xC).attr("y1", yNB).attr("x2", xL).attr("y2", yB);
                leaf3.transition().duration(milisecs).attr("x1", xC).attr("y1", yNB).attr("x2", xR).attr("y2", yB);
                upper_internal.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xC).attr("y2", yNT).attr("stroke", S0color);
                lower_internal.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xC).attr("y2", yNB).attr("stroke", S1color);
                label0.transition().duration(milisecs).attr("x", xL).attr("y", yT - label_spacer);
                label4.transition().duration(milisecs).attr("x", xR).attr("y", yT - label_spacer);
                label1.transition().duration(milisecs).attr("x", xR + 2*label_spacer).attr("y", yC + 0.4*leaf_label_height);
                label2.transition().duration(milisecs).attr("x", xL).attr("y", yB + 2*label_spacer);
                label3.transition().duration(milisecs).attr("x", xR).attr("y", yB + 2*label_spacer);
                }
            else if (x >= x0 && y >= y0) {
                // lower right quadrant
                var t0 = (x - x0)/(x0);
                var s1 = (y - y0)/(y0);
                var yNT = ytree - t0*max_internal_length;
                var yT = ytree - t0*max_internal_length - leaf_edge_length/Math.sqrt(2.);
                var yNB = ytree + s1*max_internal_length;
                var yB = ytree + s1*max_internal_length + leaf_edge_length/Math.sqrt(2.);
                leaf0.transition().duration(milisecs).attr("x1", xC).attr("y1", yNT).attr("x2", xL).attr("y2", yT);
                leaf1.transition().duration(milisecs).attr("x1", xC).attr("y1", yNT).attr("x2", xR).attr("y2", yT);
                leaf4.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xFR).attr("y2", yC);
                leaf2.transition().duration(milisecs).attr("x1", xC).attr("y1", yNB).attr("x2", xL).attr("y2", yB);
                leaf3.transition().duration(milisecs).attr("x1", xC).attr("y1", yNB).attr("x2", xR).attr("y2", yB);
                upper_internal.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xC).attr("y2", yNT).attr("stroke", T0color);
                lower_internal.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xC).attr("y2", yNB).attr("stroke", S1color);
                label0.transition().duration(milisecs).attr("x", xL).attr("y", yT - label_spacer);
                label1.transition().duration(milisecs).attr("x", xR).attr("y", yT - label_spacer);
                label4.transition().duration(milisecs).attr("x", xR + 2*label_spacer).attr("y", yC + 0.4*leaf_label_height);
                label2.transition().duration(milisecs).attr("x", xL).attr("y", yB + 2*label_spacer);
                label3.transition().duration(milisecs).attr("x", xR).attr("y", yB + 2*label_spacer);
                }
            else if (x >= x0 && y <= y0) {
                // upper right quadrant
                var t0 = (x - x0)/(x0);
                var t1 = (y0 - y)/(y0);
                var yNT = ytree - t0*max_internal_length;
                var yT = ytree - t0*max_internal_length - leaf_edge_length/Math.sqrt(2.);
                var yNB = ytree + t1*max_internal_length;
                var yB = ytree + t1*max_internal_length + leaf_edge_length/Math.sqrt(2.);
                leaf0.transition().duration(milisecs).attr("x1", xC).attr("y1", yNT).attr("x2", xL).attr("y2", yT);
                leaf1.transition().duration(milisecs).attr("x1", xC).attr("y1", yNT).attr("x2", xR).attr("y2", yT);
                leaf2.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xFR).attr("y2", yC);
                leaf3.transition().duration(milisecs).attr("x1", xC).attr("y1", yNB).attr("x2", xL).attr("y2", yB);
                leaf4.transition().duration(milisecs).attr("x1", xC).attr("y1", yNB).attr("x2", xR).attr("y2", yB);
                upper_internal.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xC).attr("y2", yNT).attr("stroke", T0color);
                lower_internal.transition().duration(milisecs).attr("x1", xC).attr("y1", yC).attr("x2", xC).attr("y2", yNB).attr("stroke", T1color);
                label0.transition().duration(milisecs).attr("x", xL).attr("y", yT - label_spacer);
                label1.transition().duration(milisecs).attr("x", xR).attr("y", yT - label_spacer);
                label2.transition().duration(milisecs).attr("x", xR + 2*label_spacer).attr("y", yC + 0.4*leaf_label_height);
                label3.transition().duration(milisecs).attr("x", xL).attr("y", yB + 2*label_spacer);
                label4.transition().duration(milisecs).attr("x", xR).attr("y", yB + 2*label_spacer);
                }

        }
        plotTree(treeA_x, treeA_y, 0);
        showPath();

        /////////////////////
        // mouse functions //
        /////////////////////

        function mouseMove() {
            if (treeA_prev_x && treeA_prev_y) {
                var x = d3.mouse(this)[0];
                var y = d3.mouse(this)[1];
                if (x > x0 || y > y0) {
                    source = "A";
                    leg = 1;
                    treeA_x = x;
                    treeA_y = y;
                    treeA_prev_x = treeA_x;
                    treeA_prev_y = treeA_y;
                    treeA.attr("cx", treeA_x).attr("cy", treeA_y);
                    plotTree(treeA_x, treeA_y, 0);
                    showPath();
                    //console.log("treeA_x = " + treeA_x + ", treeA_y = " + treeA_y);
                }
            }
            else if (treeB_prev_x && treeB_prev_y) {
                var x = d3.mouse(this)[0];
                var y = d3.mouse(this)[1];
                if (x > x0 || y > y0) {
                    source = "B";
                    leg = 1;
                    treeB_x = x;
                    treeB_y = y;
                    treeB_prev_x = treeB_x;
                    treeB_prev_y = treeB_y;
                    treeB.attr("cx", treeB_x).attr("cy", treeB_y);
                    plotTree(treeB_x, treeB_y, 0);
                    showPath();
                    //console.log("treeB_x = " + treeB_x + ", treeB_y = " + treeB_y);
                }
            }
        }

        function mouseUp() {
            if (treeA_prev_x && treeA_prev_y) {
                treeA_prev_x = null;
                treeA_prev_y = null;
            }
            else if (treeB_prev_x && treeB_prev_y) {
                treeB_prev_x = null;
                treeB_prev_y = null;
            }
        }

        var animation_in_progress = false;
        function keyDown() {
            console.log("key was pressed: " + d3.event.keyCode);
            if (!animation_in_progress) {
                console.log("  starting animation");
                followPath();
                }
            else
                console.log("  animation in progress so keystroke ignored");
        }

        /////////////////////////
        // followPath function //
        /////////////////////////
        var timer;
        var followPath = function() {
            if (source == "A")
                plotTree(treeA_x, treeA_y, 0);
            else
                plotTree(treeB_x, treeB_y, 0);
            showPath();
            animation_in_progress = true;
            timer = setInterval(function() {
                console.log("taking next step...");

                // determine next position of tree along path
                if (leg == 1) {
                    // on first leg
                    stride1++;
                    var dx = (stride1/nsteps1)*(leg1_x2 - leg1_x1);
                    var dy = (stride1/nsteps1)*(leg1_y2 - leg1_y1);
                    mover_x = leg1_x1 + dx;
                    mover_y = leg1_y1 + dy;
                    if (stride1 == nsteps1) {
                        leg = 2;
                        stride2 = 0;
                    }
                    console.log("stride1 = " + stride1);
                    console.log("  leg1_x1 = " + leg1_x1);
                    console.log("  leg1_y1 = " + leg1_y1);
                    console.log("  dx      = " + dx);
                    console.log("  dy      = " + dy);
                    console.log("  mover_x = " + mover_x);
                    console.log("  mover_y = " + mover_y);
                    }
                else {
                    // on second leg
                    stride2++;
                    var dx = (stride2/nsteps2)*(leg2_x2 - leg2_x1);
                    var dy = (stride2/nsteps2)*(leg2_y2 - leg2_y1);
                    mover_x = leg2_x1 + dx;
                    mover_y = leg2_y1 + dy;
                    console.log("stride2 = " + stride2);
                    console.log("  leg2_x1 = " + leg2_x1);
                    console.log("  leg2_y1 = " + leg2_y1);
                    console.log("  dx      = " + dx);
                    console.log("  dy      = " + dy);
                    console.log("  mover_x = " + mover_x);
                    console.log("  mover_y = " + mover_y);
                    }

                mover.transition()
                    .duration(500)
                    .attr("cx", mover_x)
                    .attr("cy", mover_y)
                    .attr("visibility", "visible");
                plotTree(mover_x, mover_y, 500);

                var distance_traveled = (leg == 1 ? (stride1/nsteps1)*leg1 : leg1 + (stride2/nsteps2)*leg2);
                if (distance_traveled >= leg1 + leg2) {
                    clearInterval(timer);
                    console.log("done following path");
                    animation_in_progress = false;
                    }

                }, 1000);
            }

</script>

## Details

Drag the black solid dots at the ends of the path and press the space key to start an animation in which the phylogeny shown in the upper left panel changes as the path is traversed. Note that you cannot place either dot in the upper left panel because that would involve an impossible combination of splits. (This fact makes it an ideal place to display the tree!) Note that the upper left panel is similar to a building that prevents one from walking in a straight line from the starting point to the ending point.

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library.
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.

