---
layout: applet
title: Diagonalization
permalink: /applets/diagonalization/
---

## Diagonalization

This applet shows graphically the rotation and scaling operations involved in diagonalizing a matrix. Scroll below the applet to see more explanation.

* **Start:** chooses a point at random on the simplex represented by the dotted line. 
* **Project:** rotates the graph using the inverse eigenvector matrix. The x-axis and y-axis are now aligned with the eigenvectors (blue arrows).
* **Scale:** scales each axis by the diagonal eigenvalue matrix.
* **Finish:** rotates the graph using the eigenvector matrix to return to the original coordinate system.

<div class="details"></div>
<div class="container"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 26-Feb-2020

    // Create a pseudorandom number generator
    var lot = new Random(12345);

    // Variables related to animation
    var timedelay = 1000;
    var easing = d3.easeLinear;
    // var trans = d3.transition()
    //     .duration(3000)
    //     .ease(d3.easeLinear);

    // Eigenvectors and eigenvalues
    var betat = 0.5;
    var lambda1 = Math.exp(0);
    var lambda2 = Math.exp(-2.0*betat);

    // Dimensions of svg graphic
    var w  = 500; // svg width
    var h  = 500; // svg height
    var lm = 35; // left margin
    var rm = 35; // right margin
    var tm = 35; // top margin
    var bm = 35; // bottom margin
    
    //var x = 1.0;
    //var y = 1.0 - x;

    var equation_width  = 500;
    var equation_height = 120;
    var equation_tm     =  20;

    // Latch onto container div already created above
    var container_div = d3.select("div.container").attr("height", h+20);
    var details_div = d3.select("div.details").attr("class", "detailsbox");

    // Create two divs inside container: one for the plot and the other for user feedback
    var graphics_div = container_div.append("div").attr("class", "graphicsbox");
    //var details_div = container_div.append("div").attr("class", "detailsbox");
    var equation_div = container_div.append("div").attr("class", "equationbox");

function POLMatrix(mysvg) {
    this.font_size = 16;
    this.millisecs = 1000;
    this.easing    = d3.easeLinear;

    // Create text element to display top left element
    this.x11 = mysvg.append("text")
        .attr("x", 100)
        .attr("y", 100)
        .attr("font-family", "Arial")
        .attr("font-size", this.font_size)
        .attr("stroke", "black")
        .text("1.00")
        .style("visibility", "hidden");

    // Create text element to display bottom left element
    this.x21 = mysvg.append("text")
        .attr("x", 100)
        .attr("y", 100)
        .attr("font-family", "Arial")
        .attr("font-size", this.font_size)
        .attr("stroke", "black")
        .text("0.00")
        .style("visibility", "hidden");

    // Create text element to display top right element
    this.x12 = mysvg.append("text")
        .attr("x", 100)
        .attr("y", 100)
        .attr("font-family", "Arial")
        .attr("font-size", this.font_size)
        .attr("stroke", "black")
        .text("0.00")
        .style("visibility", "hidden");

    // Create text element to display bottom right element
    this.x22 = mysvg.append("text")
        .attr("x", 100)
        .attr("y", 100)
        .attr("font-family", "Arial")
        .attr("font-size", this.font_size)
        .attr("stroke", "black")
        .text("1.00")
        .style("visibility", "hidden");

    // Create left middle vertical line
    this.lm = mysvg.append("path")
        .attr("stroke-width", 3)
        .attr("stroke", "black")
        .style("visibility", "hidden");

    // Create right middle vertical line
    this.rm = mysvg.append("path")
        .attr("stroke-width", 3)
        .attr("stroke", "black")
        .style("visibility", "hidden");

    // this.dot1 = mysvg.append("circle")
    //     .attr("r", 3)
    //     .style("visibility", "hidden")
    //     .style("fill", "red");
    //
    // this.dot2 = mysvg.append("circle")
    //     .attr("r", 3)
    //     .style("visibility", "hidden")
    //     .style("fill", "orange");
    //
    // this.dot3 = mysvg.append("circle")
    //     .attr("r", 3)
    //     .style("visibility", "hidden")
    //     .style("fill", "green");
    //
    // this.dot4 = mysvg.append("circle")
    //     .attr("r", 3)
    //     .style("visibility", "hidden")
    //     .style("fill", "blue");
    //
    // this.dot5 = mysvg.append("circle")
    //     .attr("r", 3)
    //     .style("visibility", "hidden")
    //     .style("fill", "cyan");
    //
    // this.dot6 = mysvg.append("circle")
    //     .attr("r", 3)
    //     .style("visibility", "hidden")
    //     .style("fill", "magenta");
    //
    // this.dot7 = mysvg.append("circle")
    //     .attr("r", 3)
    //     .style("visibility", "hidden")
    //     .style("fill", "black");
    //
    // this.dot8 = mysvg.append("circle")
    //     .attr("r", 3)
    //     .style("visibility", "hidden")
    //     .style("fill", "brown");

    }

POLMatrix.prototype.showAt = function(top, left, precision, display, fadein, fadeout, x11, x21, x12, x22) {
    var total_width = 0.0;

    // We use the same object for both vectors (1 column) and matrices (2 columns)
    // Figure out which one we are dealing with.
    var ncol = 2;
    var vector = false;
    if (x12 == null) {
        ncol = 1;
        vector = true;
        }

    var stroke_color = "rgba(0, 0, 0, 0)";
    var fill_color = "rgba(0, 0, 0, 0)";
    var visibility = "visible";
    if (display == "gray") {
        stroke_color = "lightgray";
        fill_color = "lightgray";
        //visibility = "visible";
        }
    else if (display == "black") {
        stroke_color = "black";
        fill_color = "black";
        //visibility = "visible";
        }
    else if (display == "hidden") {
        stroke_color = "rgba(0, 0, 0, 0)";
        fill_color = "rgba(0, 0, 0, 0)";
        //visibility = "hidden";
        }
    else {
        console.log("Error: unknown display option (" + display + ") supplied to POLMatrix.prototype.showAt");
        }

    // Determine how much space is needed for displaying values
    this.x11.attr("y", 0).text(x11.toFixed(precision));
    this.x21.attr("y", 0).text(x21.toFixed(precision));

    var bb = this.x11.node().getBBox();
    var text_width = bb.width;
    var text_height = bb.height;
    var descent = bb.height + bb.y; // this works because we set y=0 before calculating bbox

    bb = this.x21.node().getBBox();
    if (bb.width > text_width)
        text_width = bb.width;
    if (bb.height > text_height)
        text_height = bb.height;

    if (!vector) {
        this.x12.attr("y", 0).text(x12.toFixed(precision));
        this.x22.attr("y", 0).text(x22.toFixed(precision));

        bb = this.x12.node().getBBox();
        if (bb.width > text_width)
            text_width = bb.width;
        if (bb.height > text_height)
            text_height = bb.height;

        bb = this.x22.node().getBBox();
        if (bb.width > text_width)
            text_width = bb.width;
        if (bb.height > text_height)
            text_height = bb.height;
        }

    // vspacer is vertical space at top and bottom (2*vspacer between numbers)
    // hspacer is horizontal space on left and right (2*hspacer between numbers)
    var vspacer = 0.3*text_height;
    var hspacer = 0.2*text_width;

    total_width += text_width*ncol + 2.0*ncol*hspacer;

    // Offsets for bezier curves representing brackets
    var dx = 10;
    var dy = 10;

    // draw left bracket such that (left, top) is top endpoint of left bracket
    // (but note that bracket will bow out to the left of this point)
    var x1  = left;
    var y1  = top;
    var x2  = left;
    var y2  = top + 4*vspacer + 2*text_height;
    var cx1 = x1 - dx;
    var cy1 = y1 - dy;
    var cx2 = x2 - dx;
    var cy2 = y2 + dy;
    //this.dot1.attr("cx", x1).attr("cy", y1).style("visibility", "visible");     // red dot
    //this.dot2.attr("cx", cx1).attr("cy", cy1).style("visibility", "visible");   // orange dot
    //this.dot3.attr("cx", cx2).attr("cy", cy2).style("visibility", "visible");   // green dot
    //this.dot4.attr("cx", x2).attr("cy", y2).style("visibility", "visible");     // blue dot
    this.lm
        .attr("d", "M" + x1 + " " + y1 + " C " + cx1 + " " + cy1 + ", " + cx2 + " " + cy2 + ", " + x2 + " " + y2 + "")
        .style("stroke", stroke_color)
        .style("fill", "transparent")
        .style("visibility", visibility);
    if (fadein) {
        this.lm
            .transition()
            .delay(this.millisecs/2)
            .duration(this.millisecs)
            .ease(this.easing)
            .style("stroke", "black")
            .style("visibility", "visible");
        }
    if (fadeout) {
        this.lm
            .transition()
            .duration(this.millisecs)
            .ease(this.easing)
            // .on("end", function() {
            //     this.lm.style("visibility", "hidden");
            //     })
            .style("stroke", "rgba(0, 0, 0, 0)");
            //.style("visibility", "hidden");
        }

    bb = this.lm.node().getBBox();
    total_width += bb.width;

    this.x11
        .attr("x", left + hspacer + text_width)
        .attr("y", top  + vspacer + text_height - descent)
        .attr("text-anchor", "end")
        .attr("stroke", stroke_color)
        .style("fill", fill_color)
        .style("visibility", visibility);
    if (fadein) {
        this.x11
            .transition()
            .delay(this.millisecs/2)
            .duration(this.millisecs)
            .ease(this.easing)
            .style("stroke", "black")
            .style("fill", "black")
            .style("visibility", "visible");
        }
    if (fadeout) {
        this.x11
            .transition()
            .duration(this.millisecs)
            .ease(this.easing)
            // .on("end", function() {
            //     this.x11.style("visibility", "hidden");
            //     })
            .style("stroke", "rgba(0, 0, 0, 0)")
            .style("fill", "rgba(0, 0, 0, 0)");
            //.style("visibility", "hidden");
        }

    this.x21
        .attr("x", left + hspacer + text_width)
        .attr("y", top  + 3*vspacer + 2*text_height - descent)
        .attr("text-anchor", "end")
        .attr("stroke", stroke_color)
        .style("fill", fill_color)
        .style("visibility", visibility);
    if (fadein) {
        this.x21
            .transition()
            .delay(this.millisecs/2)
            .duration(this.millisecs)
            .ease(this.easing)
            .style("stroke", "black")
            .style("fill", "black")
            .style("visibility", "visible");
        }
    if (fadeout) {
        this.x21
            .transition()
            .duration(this.millisecs)
            .ease(this.easing)
            // .on("end", function() {
            //     this.x21.style("visibility", "hidden");
            //     })
            .style("stroke", "rgba(0, 0, 0, 0)")
            .style("fill", "rgba(0, 0, 0, 0)");
            //.style("visibility", "hidden");
        }

    if (!vector) {
        this.x12
            .attr("x", left + 3*hspacer + 2*text_width)
            .attr("y", top  + vspacer + text_height - descent)
            .attr("text-anchor", "end")
            .style("fill", fill_color)
            .attr("stroke", stroke_color)
            .style("visibility", visibility);
        if (fadein) {
            this.x12
                .transition()
                .delay(this.millisecs/2)
                .duration(this.millisecs)
                .ease(this.easing)
                .style("stroke", "black")
                .style("fill", "black")
                .style("visibility", "visible");
            }
        if (fadeout) {
            this.x12
                .transition()
                .duration(this.millisecs)
                .ease(this.easing)
                // .on("end", function() {
                //     this.x12.style("visibility", "hidden");
                //     })
                .style("stroke", "rgba(0, 0, 0, 0)")
                .style("fill", "rgba(0, 0, 0, 0)");
                //.style("visibility", "hidden");
            }

        this.x22
            .attr("x", left + 3*hspacer + 2*text_width)
            .attr("y", top  + 3*vspacer + 2*text_height - descent)
            .attr("text-anchor", "end")
            .style("fill", fill_color)
            .attr("stroke", stroke_color)
            .style("visibility", visibility);
        if (fadein) {
            this.x22
                .transition()
                .delay(this.millisecs/2)
                .duration(this.millisecs)
                .ease(this.easing)
                .style("stroke", "black")
                .style("fill", "black")
                .style("visibility", "visible");
            }
        if (fadeout) {
            this.x22
                .transition()
                .duration(this.millisecs)
                .ease(this.easing)
                // .on("end", function() {
                //     this.x22.style("visibility", "hidden");
                //     })
                .style("stroke", "rgba(0, 0, 0, 0)")
                .style("fill", "rgba(0, 0, 0, 0)");
                //.style("visibility", "hidden");
            }
        }

    x1  = left + 2*ncol*hspacer + ncol*text_width;
    y1  = top;
    x2  = left + 2*ncol*hspacer + ncol*text_width;
    y2  = top  + 4*vspacer + 2*text_height;
    cx1 = x1 + dx;
    cy1 = y1 - dy;
    cx2 = x2 + dx;
    cy2 = y2 + dy;
    //this.dot5.attr("cx", x1).attr("cy", y1).style("visibility", "visible");     // cyan dot
    //this.dot6.attr("cx", cx1).attr("cy", cy1).style("visibility", "visible");   // magenta dot
    //this.dot7.attr("cx", cx2).attr("cy", cy2).style("visibility", "visible");   // black dot
    //this.dot8.attr("cx", x2).attr("cy", y2).style("visibility", "visible");     // brown dot
    this.rm
        .attr("d", "M" + x1 + " " + y1 + " C " + cx1 + " " + cy1 + ", " + cx2 + " " + cy2 + ", " + x2 + " " + y2 + "")
        .style("stroke", stroke_color)
        .style("fill", "transparent")
        .style("visibility", visibility);
    if (fadein) {
        this.rm
            .transition()
            .delay(this.millisecs/2)
            .duration(this.millisecs)
            .ease(this.easing)
            .style("stroke", "black")
            .style("visibility", "visible");
        }
    if (fadeout) {
        this.rm
            .transition()
            .duration(this.millisecs)
            .ease(this.easing)
            // .on("end", function() {
            //     this.rm.style("visibility", "hidden");
            //     })
            .style("stroke", "rgba(0, 0, 0, 0)");
            //.style("visibility", "hidden");
        }

    bb = this.lm.node().getBBox();
    total_width += bb.width;

    return total_width;
    }

    // Create scale for X axis
    var xScale = d3.scaleLinear()
        .domain([-1, 1])
        //.range([lm, w - rm]);
        .range([-w/2+lm,w/2-rm]);

    // Create scale for Y axis
    var yScale = d3.scaleLinear()
         .domain([-1, 1])
         //.range([h - bm, tm]);
        .range([h/2-bm,-h/2+tm]);

    // Define function to draw a vector (with an optional label shown at its end point)
    var labelVector = function(vector_line, vector_label, x, y, t, endfunc, debug) {
        // Position the end of the vector
        /*if (!t) {
            vector_line
                .attr("x2", xScale(x))
                .attr("y2", xScale(-y));
            }
        else {
            if (endfunc == null) {
                vector_line
                    .transition()
                    .duration(timedelay)
                    .ease(easing)
                    .attr("x2", xScale(x))
                    .attr("y2", xScale(-y));
                }
            else {
                vector_line
                    .transition()
                    .duration(timedelay)
                    .ease(easing)
                    .on("end", endfunc)
                    .attr("x2", xScale(x))
                    .attr("y2", xScale(-y));
                }
            }*/

        // Create the label for the vector
        vector_label
            .text("(" + x.toFixed(2) + " " + y.toFixed(2) + ")");

        // Now that the label exists, we can calculate its bounding box, which tells us
        // how tall and how wide the text label is
        var bb = vector_label.node().getBBox();

        // Place label some distance off the end of the vector
        var theta = Math.atan(y/x) + (x < 0 ? Math.PI : 0);
        var labelx = x + .1*Math.cos(theta);
        var labely = y + .1*Math.sin(theta);
        var scaled_x = xScale(x);
        var scaled_y = yScale(y);
        var scaled_labelx = xScale(labelx);
        var scaled_labely = yScale(labely);

        var rightwedge  = false;
        var topwedge    = false;
        var leftwedge   = false;
        var bottomwedge = false;
        if (theta > 7.*Math.PI/4 || theta < 1.*Math.PI/4) {
            rightwedge = true;
            }
        else if (theta > 1.*Math.PI/4 && theta < 3.*Math.PI/4) {
            topwedge = true;
            }
        else if (theta > 3.*Math.PI/4 && theta < 5.*Math.PI/4) {
            leftwedge = true;
            }
        else if (theta > 5.*Math.PI/4 && theta < 7.*Math.PI/4) {
            bottomwedge = true;
            }

        if (debug) {
            console.log("theta = " + (theta/Math.PI) + "*PI");
            if (rightwedge) {
                console.log("rightwedge");
                }
            else if (topwedge) {
                console.log("topwedge");
                }
            else if (leftwedge) {
                console.log("leftwedge");
                }
            else if (bottomwedge) {
                console.log("bottomwedge");
                }
            else {
                console.log("no wedge");
                }
            }

        // Adjust label position if text will overlap the end of the vector
        var s = 10; // spacer
        if (rightwedge && scaled_labelx - bb.width/2 < scaled_x + s)
            scaled_labelx += (scaled_x + s) - (scaled_labelx - bb.width/2);
        if (leftwedge && scaled_labelx + bb.width/2 > scaled_x - s)
            scaled_labelx -= (scaled_labelx + bb.width/2) - (scaled_x - s);
        if (topwedge && scaled_labely + bb.height/2 > scaled_y - s)
            scaled_labely -=  (scaled_labely + bb.height/2) - (scaled_y - s);
        if (bottomwedge && scaled_labely - bb.height/2 < scaled_y + s)
            scaled_labely += (scaled_y + s) - (scaled_labely - bb.height/2);

        // Position the label
        if (!t) {
            vector_label
                .attr("x", scaled_labelx)
                .attr("y", scaled_labely);
            }
        else {
            if (endfunc == null) {
                vector_label
                    .transition()
                    .duration(timedelay)
                    .ease(easing)
                    .attr("x", scaled_labelx)
                    .attr("y", scaled_labely);
                }
            else {
                vector_label
                    .transition()
                    .duration(timedelay)
                    .ease(easing)
                    .on("end", endfunc)
                    .attr("x", scaled_labelx)
                    .attr("y", scaled_labely);
                }
            }

        if (debug) {
            debug_box
                .attr("x", scaled_labelx - bb.width/2)
                .attr("y", scaled_labely - bb.height/2)
                .attr("width", bb.width)
                .attr("height", bb.height);
            debug_point
                .attr("cx", scaled_labelx)
                .attr("cy", scaled_labely);
            }
        }

    // Create SVG element for plot
    var svg = graphics_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create SVG element for equation
    var eqsvg = equation_div.append("svg")
        .attr("width", equation_width)
        .attr("height", equation_height);
    var pol_uinvfreq = new POLMatrix(eqsvg);
    var pol_diaguinvfreq = new POLMatrix(eqsvg);
    var pol_umatdiaguinvfreq = new POLMatrix(eqsvg);
    var pol_umat = new POLMatrix(eqsvg);
    var pol_diag = new POLMatrix(eqsvg);
    var pol_uinv = new POLMatrix(eqsvg);
    var pol_freq = new POLMatrix(eqsvg);

    var rotated_group = svg.append("g")
        .attr("id", "axes")
        .attr("transform", "translate(" + (w/2) + " , " + (h/2) + ")");

    // var boundingbox = svg.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", w)
    //     .attr("height", h)
    //     .attr("fill", "none")
    //     .style("visibility", "hidden");
    // var plotbox = svg.append("rect")
    //     .attr("x", lm)
    //     .attr("y", tm)
    //     .attr("width", w - lm - rm) //
    //     .attr("height", h - bm - tm)
    //     .attr("fill", "lavender")
    //     .style("visibility", "hidden");

    // Add definition of arrowhead (http://logogin.blogspot.com/2013/02/d3js-arrowhead-markers.html)
    svg.append("defs").append("marker")
        .attr("id", "bluearrowhead")
        .attr("refX", 5) /*must be smarter way to calculate shift*/
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .attr("fill", "blue")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

    svg.append("defs").append("marker")
        .attr("id", "blackarrowhead")
        .attr("refX", 5) /*must be smarter way to calculate shift*/
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .attr("fill", "black")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

    // Create x and y axes (not using d3.axisBottom and d3.axisLeft due to strange behavior during rotation)
    var xaxis = rotated_group.append("g")
        .attr("id", "xaxis");

    xaxis.append("line")
        .attr("x1", -w/2 + lm)
        .attr("y1", 0)
        .attr("x2", w/2 - rm)
        .attr("y2", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    xaxis.append("text")
        .attr("x", -(w-lm-rm)/2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("-1.0");

    xaxis.append("text")
        .attr("x", -(w-lm-rm)/4)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("-0.5");

    xaxis.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("0.0");

    xaxis.append("text")
        .attr("x", (w-lm-rm)/4)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("0.5");

    xaxis.append("text")
        .attr("x", (w-lm-rm)/2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("1.0");

    var yaxis = rotated_group.append("g")
        .attr("id", "yaxis");

    yaxis.append("line")
        .attr("x1", 0)
        .attr("y1", -h/2 + tm)
        .attr("x2", 0)
        .attr("y2", h/2 - bm)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    yaxis.append("text")
        .attr("x", -20)
        .attr("y",  (h-tm-bm)/2)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("-1.0");

    yaxis.append("text")
        .attr("x", -20)
        .attr("y", (h-tm-bm)/4)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("-0.5");

    yaxis.append("text")
        .attr("x", -20)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("0.0");

    yaxis.append("text")
        .attr("x", -20)
        .attr("y", -(h-tm-bm)/4)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("0.5");

    yaxis.append("text")
        .attr("x", -20)
        .attr("y", -(h-tm-bm)/2)
        .attr("text-anchor", "middle")
        .style("font-family", "Verdana")
        .style("font-size", "10px")
        .text("1.0");

    // Define X axis
    // var xAxis = d3.axisBottom()
    //     .scale(xScale)
    //     .ticks(5);

    // Create X axis
    // var xaxis = rotated_group.append("g")
    //     .attr("class", "axis")
    //     //.attr("transform", "translate(0 " + ((h+tm-bm)/2) + ")")
    //     .attr("transform", "translate(0 " + (h/2) + ")")
    //     .call(xAxis);

    // Define Y axis
    // var yAxis = d3.axisLeft()
    //     .scale(yScale)
    //     .ticks(5);

    // Create Y axis
    // var yaxis = rotated_group.append("g")
    //     .attr("class", "axis")
    //     //.attr("transform", "translate(" + (lm + (w-lm-rm)/2) + " 0)")
    //     .attr("transform", "translate(" + (w/2) + " 0)")
    //     .call(yAxis);

    // Create dot at origin for reference while debugging
    // svg.append("circle")
    //     .attr("cx", xScale(0))
    //     .attr("cy", yScale(0))
    //     .attr("r", 5)
    //     .style("fill", "black");
    var equilibrium = rotated_group.append("circle")
        .attr("cx", xScale(0.5))
        .attr("cy", yScale(0.5))
        .attr("r", 4)
        .style("fill", "red");

    // Create dotted diagonal
    // var dotteddiagonal = svg.append("line")
    //     .attr("x1", xScale(0))
    //     .attr("y1", yScale(1))
    //     .attr("x2", xScale(1))
    //     .attr("y2", yScale(0))
    //     .style("stroke-width", 1)
    //     .style("stroke-dasharray", "2,2,2")
    //     .style("stroke", "rgb(220,220,220)")
    var dotteddiagonal = rotated_group.append("line")
        .attr("x1", 0)
        .attr("y1", -h/2+tm)
        .attr("x2", w/2-rm)
        .attr("y2", 0)
        .style("stroke-width", 1)
        .style("stroke-dasharray", "2,2,2")
        .style("stroke", "rgb(220,220,220)")

    var debug_box = rotated_group.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("stroke", "black")
        .style("fill", "gray")
        .style("visibility", "hidden");

    var debug_point = rotated_group.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 2)
        .style("stroke", "black")
        .style("fill", "gray")
        .style("visibility", "hidden");

    // Create global variables
    var x  =  0.5;
    var y  =  0.5;
    var xstar  =  0.5;
    var ystar  =  0.5;
    var u  =  0.0;
    var v  =  0.0;
    var ustar  =  0.0;
    var vstar  =  0.0;

    // Create starting vector
    var startingvector = rotated_group.append("line")
        .attr("id", "startingvector")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(0))
        .attr("y2", yScale(0))
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#blackarrowhead)")
        .attr("stroke", "black")
        .style("visibility", "hidden");

    // Create label showing coordinates of starting vector
    var startingvectorlabel = rotated_group.append("text")
        .attr("id", "startingvectorlabel")
        .attr("x", xScale(0.5))
        .attr("y", yScale(0.5))
        .attr("dx", 0)
        .attr("dy", 4)
        .text("(0.5 0.5)")
        .attr("text-anchor", "middle")
        .style("visibility", "hidden");

    var x1 =  1./Math.sqrt(2);
    var y1 =  1./Math.sqrt(2);

    // Create eigenvector 1
    var eigenvector1 = rotated_group.append("line")
        .attr("id", "eigenvector1")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x1))
        .attr("y2", yScale(y1))
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#bluearrowhead)")
        .attr("stroke", "blue")
        .style("visibility", "visible");

    // Create text element showing value of eigenvalue 1
    var eigenvalue1 = rotated_group.append("text")
        .attr("id", "eigenvalue1")
        .attr("x", xScale(x1))
        .attr("y", yScale(y1))
        .attr("dx", 0)
        .attr("dy", 4)
        .text(" ")
        .attr("text-anchor", "middle")
        .style("visibility", "hidden");

    labelVector(eigenvector1, eigenvalue1, x1, y1, null, null, false);
    eigenvalue1.style("visibility", "visible");

    // Create connector 1 (dotted line from startingvector to eigenvector 1)
    var connector1 = rotated_group.append("line")
        .attr("id", "connector1")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x1))
        .attr("y2", yScale(y1))
        .attr("stroke-width", 2)
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "2,2,2")
        .style("visibility", "hidden");

    // Create projection 1 (projection of startingvector on eigenvector 1)
    var projection1 = rotated_group.append("line")
        .attr("id", "projection1")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x1))
        .attr("y2", yScale(y1))
        .attr("stroke-width", 5)
        .attr("stroke", "blue")
        .style("visibility", "hidden");

    var x2 = -1./Math.sqrt(2);
    var y2 =  1./Math.sqrt(2);

    // Create eigenvector 2
    var eigenvector2 = rotated_group.append("line")
        .attr("id", "eigenvector2")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#bluearrowhead)")
        .attr("stroke", "blue")
        .style("visibility", "visible");

    // Create text element showing value of eigenvalue 2
    var eigenvalue2 = rotated_group.append("text")
        .attr("id", "eigenvalue2")
        .attr("x", xScale(x2))
        .attr("y", yScale(y2))
        .attr("dx", 0)
        .attr("dy", 4)
        .text(" ")
        .attr("text-anchor", "middle")
        .style("visibility", "visible");

    labelVector(eigenvector2, eigenvalue2, x2, y2, null, null, false);
    eigenvalue2.style("visibility", "visible");

    // Create connector 2 (dotted line from startingvector to eigenvector 2)
    var connector2 = rotated_group.append("line")
        .attr("id", "connector2")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke-width", 2)
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "2,2,2")
        .style("visibility", "hidden");

    // Create projection 2 (projection of startingvector on eigenvector 2)
    var projection2 = rotated_group.append("line")
        .attr("id", "projection2")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke-width", 5)
        .attr("stroke", "blue")
        .style("visibility", "hidden");

    var wumat = pol_umat.showAt(equation_tm, 100, 2, "hidden", false, false, 1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));
    var wdiag = pol_diag.showAt(equation_tm, 100, 2, "hidden", false, false, lambda1, 0.0, 0.0, lambda2);
    var wuinv = pol_uinv.showAt(equation_tm, 100, 2, "hidden", false, false, 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2), 1/Math.sqrt(2));
    var wfreq = pol_freq.showAt(equation_tm, 100, 2, "hidden", false, false, 0.42, 0.58);
    var equation_spacer = 20;
    var wall = wumat + equation_spacer + wdiag + equation_spacer + wuinv + equation_spacer + wfreq;
    var equation_lm = (equation_width - wall)/2;

    // Show U, D, and Uinv in gray initially
    pol_umat.showAt(equation_tm, equation_lm,                                             2, "gray",  false, false, 1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));
    pol_diag.showAt(equation_tm, equation_lm + wumat + equation_spacer,                   2, "gray",  false, false, lambda1, 0.0, 0.0, lambda2);
    pol_uinv.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,         2, "gray",  false, false, 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2), 1/Math.sqrt(2));

    // Transition probability matrix P times current point q:
    //
    //       /                                                     \ /   \
    //       | 0.5 + 0.5 exp(-2 betat)     0.5 - 0.5 exp(-2 betat) | | x |
    // P q = |                                                     | |   |
    //       | 0.5 - 0.5 exp(-2 betat)     0.5 + 0.5 exp(-2 betat) | | y |
    //       \                                                     / \   /
    //
    //       /       \
    //       | nextX |
    //     = |       |
    //       | nextY |
    //       \       /
    //
    var nextX = function(x) {
        return 0.5 + (x - 0.5)*Math.exp(-2*betat);
    }

    var nextY = function(y) {
        return 0.5 + (y - 0.5)*Math.exp(-2*betat);
    }

    var processButtonClick = function() {
        var btn = d3.select("#analysis-button");
        var type = btn.text(); //btn.attr("value");

        if (type == "Start") {
            // change Start button to Project button
            d3.select("#analysis-button")
                .text("Project");
                //.attr("value", "Project");
                //.style("visibility", "hidden");
                //.property("disabled", true);

            // Disable the beta*t dropdown list until we are done with this series
            d3.select("select#betat-dropdown").property("disabled", true);

            // Choose random starting frequency
            x = lot.random();
            y = 1.0 - x;
            
            // 20% of the time set starting frequency to 1 or 0
            // if (lot.random() < .2) {
            //     console.log("inside the 20 percent");
            //     if (lot.random() < .5) {
            //         x = 1.0;
            //         y = 0.0;
            //     }
            //     else {
            //         x = 0.0;
            //         y = 1.0;
            //     }
            // }
            console.log("starting frequency = " + x);

            // fade in freq vector, fade out final result from last round
            pol_umat.showAt(equation_tm, equation_lm,                                             2, "gray",  false, false, 1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));
            pol_diag.showAt(equation_tm, equation_lm + wumat + equation_spacer,                   2, "gray",  false, false, lambda1, 0.0, 0.0, lambda2);
            pol_uinv.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,         2, "gray",  false, false, 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2), 1/Math.sqrt(2));
            pol_freq.showAt(equation_tm, equation_lm + wumat + wdiag + wuinv + 3*equation_spacer, 2, "hidden", true,  false, x, y);
            //pol_uinvfreq.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,   2, "gray",  false, false, 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2), 1/Math.sqrt(2));
            //pol_diaguinvfreq.showAt(equation_tm, equation_lm + wumat + equation_spacer,         2, "gray",  false, false, lambda1, 0.0, 0.0, lambda2);
            pol_umatdiaguinvfreq.showAt(equation_tm, equation_lm,                                 2, "black", false, true,  1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));

            // Describe what is happening in this step
            var xpct = 100.*x;
            var ypct = 100.*y;
            //d3.select("#status-text")
            //    .text("The starting vector is (" + x.toFixed(2) + " " + y.toFixed(2) + "). ");

            startingvector
                .attr("x2", xScale(0.1))
                .attr("y2", xScale(-0.1));
            labelVector(startingvector, startingvectorlabel, 0.1, 0.1, null, null, false);
            startingvector.style("visibility", "visible");
            startingvector
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("x2", xScale(x))
                .attr("y2", xScale(-y));
            labelVector(startingvector, startingvectorlabel, x, y, true, function() {
                startingvectorlabel.style("visibility", "visible");
                }, false);
            //debug_box0.style("visibility", "visible");
            //debug_point0.style("visibility", "visible");

            labelVector(eigenvector1, eigenvalue1, x1, y1, null, null, false);
            eigenvector1.style("visibility", "visible");
            eigenvalue1.style("visibility", "visible");
            //debug_box1.style("visibility", "visible");
            //debug_point1.style("visibility", "visible");

            labelVector(eigenvector2, eigenvalue2, x2, y2, null, null, false);
            eigenvector2.style("visibility", "visible");
            eigenvalue2.style("visibility", "visible");
            //debug_box2.style("visibility", "visible");
            //debug_point2.style("visibility", "visible");
            }
        else if (type == "Project") {
            // change Project button to Scale button
            d3.select("#analysis-button")
                //.attr("value", "Scale");
                .text("Scale");

            // Project dot onto eigenvector
            //
            //                                  /         \
            //                                 |  x1   x2  |
            //  right eigenvector matrix = U = |           |
            //                                 |  y1   y2  |
            //                                  \         /
            //
            //                                  /                             \
            //                                 |      y2              -x2      |
            //                                 | -------------   ------------- |
            //                                 | x1 y2 - x2 y1   x1 y2 - x2 y1 |
            //         Inverse of U = U^{-1} = |                               |
            //                                 |     -y1               x1      |
            //                                 | -------------   ------------- |
            //                                 | x1 y2 - x2 y1   x1 y2 - x2 y1 |
            //                                  \                             /
            //
            //        / \      /                             \  / \      /              \
            //       |   |    |      y2              -x2      ||   |    |  x y2 - y x2   |
            //       | u |    | -------------   ------------- || x |    | -------------  |
            //       |   |    | x1 y2 - x2 y1   x1 y2 - x2 y1 ||   |    | x1 y2 - x2 y1  |
            //       |   |  = |                               ||   | =  |                |
            //       |   |    |     -y1               x1      ||   |    |  y x1 - x y1   |
            //       | v |    | -------------   ------------- || y |    | -------------  |
            //       |   |    | x1 y2 - x2 y1   x1 y2 - x2 y1 ||   |    | x1 y2 - x2 y1  |
            //        \ /      \                             /  \ /      \              /
            //
            u = (x*y2 - y*x2)/(x1*y2 - x2*y1);
            v = (y*x1 - x*y1)/(x1*y2 - x2*y1);
            var cx = w/2;
            var cy = h/2;

            // fade in uinvfreq vector, fade out uinv and freq
            pol_umat.showAt(equation_tm, equation_lm,                                             2, "gray",   false, false, 1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));
            pol_diag.showAt(equation_tm, equation_lm + wumat + equation_spacer,                   2, "gray",   false, false, lambda1, 0.0, 0.0, lambda2);
            pol_uinv.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,         2, "black",  false, true,  1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2), 1/Math.sqrt(2));
            pol_freq.showAt(equation_tm, equation_lm + wumat + wdiag + wuinv + 3*equation_spacer, 2, "black",  false, true,  x, y);
            pol_uinvfreq.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,     2, "hidden",  true, false, u, v);
            //pol_diaguinvfreq.showAt(equation_tm, equation_lm + wumat + equation_spacer,         2, "gray",   false, false, lambda1, 0.0, 0.0, lambda2);
            //pol_umatdiaguinvfreq.showAt(equation_tm, equation_lm,                               2, "gray",   false, false, 1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));

            // Describe what is happening in this step
            // d3.select("#status-text")
            //     .text("Rotate to eigenvector basis by premultiplying by inverse eigenvector matrix.");

            xaxis
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("transform", "rotate(45)");
            yaxis
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("transform", "rotate(45)");
            // xaxis
            //     .transition()
            //     .duration(timedelay)
            //     .ease(easing)
            //     .attr("transform", rotate + " " + translatey);
            // yaxis
            //     .transition()
            //     .duration(timedelay)
            //     .ease(easing)
            //     .attr("transform", rotate + " " + translatex);
            dotteddiagonal
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("transform", "rotate(45)");
            equilibrium
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("transform", "rotate(45)");
                //.attr("cx", xScale(1./Math.sqrt(2)))
                //.attr("cy", yScale(0.0));

            startingvector
                .transition()
                .duration(timedelay)
                .ease(easing)
                .on("start", function() {
                    startingvectorlabel.style("visibility", "hidden");
                    })
                .on("end", function() {
                    startingvectorlabel.style("visibility", "visible");
                    //startingvector.attr("transform", "rotate(0)");
                    labelVector(startingvector, startingvectorlabel, u, v, false, null, false);
                    })
                .attr("transform", "rotate(45)");

            eigenvector1
                .transition()
                .duration(timedelay)
                .ease(easing)
                 .on("start", function() {
                     eigenvalue1.style("visibility", "hidden");
                     })
                .on("end", function() {
                    eigenvalue1.style("visibility", "visible");
                    //eigenvector1.attr("transform", "rotate(0)");
                    labelVector(eigenvector1, eigenvalue1, 1, 0, false, null, false);
                    })
                .attr("transform", "rotate(45)");

            eigenvalue1
                .transition()
                .duration(timedelay)
                .ease(easing)
                .on("end", function() {
                    eigenvalue1.attr("transform", "rotate(0)");
                    labelVector(eigenvector1, eigenvalue1, 1, 0, false, null, false);
                    })
                .attr("transform", "rotate(45)");

            eigenvector2
                .transition()
                .duration(timedelay)
                .ease(easing)
                .on("start", function() {
                    eigenvalue2.style("visibility", "hidden");
                    })
                .on("end", function() {
                    eigenvalue2.style("visibility", "visible");
                    //eigenvector2.attr("transform", "rotate(0)");
                    labelVector(eigenvector2, eigenvalue2, 0, 1, false, null, false);
                    connector1
                        .attr("x1", xScale(u))
                        .attr("y1", yScale(v))
                        .attr("x2", xScale(u))
                        .attr("y2", yScale(0))
                        .style("visibility", "visible");
                    projection1
                        .attr("x1", xScale(0))
                        .attr("y1", yScale(0))
                        .attr("x2", xScale(u))
                        .attr("y2", yScale(0))
                        .style("visibility", "visible");
                    connector2
                        .attr("x1", xScale(u))
                        .attr("y1", yScale(v))
                        .attr("x2", xScale(0))
                        .attr("y2", yScale(v))
                        .style("visibility", "visible");
                    projection2
                        .attr("x1", xScale(0))
                        .attr("y1", yScale(0))
                        .attr("x2", xScale(0))
                        .attr("y2", yScale(v))
                        .style("visibility", "visible");
                    })
                .attr("transform", "rotate(45)");

            }
        else if (type == "Scale") {
            // change Scale button to Finish button
            d3.select("#analysis-button")
                //.attr("value", "Finish");
                .text("Finish");

            ustar = u*lambda1;
            vstar = v*lambda2;

            // fade in diaguinvfreq vector, fade out diag and uinvfreq
            pol_umat.showAt(equation_tm, equation_lm,                                               2, "gray",   false, false, 1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));
            pol_diag.showAt(equation_tm, equation_lm + wumat + equation_spacer,                     2, "black",  false, true,  lambda1, 0.0, 0.0, lambda2);
            //pol_uinv.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,         2, "black",  false, false, 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2), 1/Math.sqrt(2));
            //pol_freq.showAt(equation_tm, equation_lm + wumat + wdiag + wuinv + 3*equation_spacer, 2, "black",  false, false, x, y);
            pol_uinvfreq.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,       2, "black",  false, true,  u, v);
            pol_diaguinvfreq.showAt(equation_tm, equation_lm + wumat + equation_spacer,             2, "hidden", true,  false, ustar, vstar);
            //pol_umatdiaguinvfreq.showAt(equation_tm, equation_lm,                                 2, "gray",   false, false, 1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));

            // Describe what is happening in this step
            // d3.select("#status-text")
            //     .text("Scale each axis by premultiplying by diagonal matrix of eigenvalues.");

            connector1
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("x1", xScale(ustar))
                .attr("y1", yScale(vstar))
                .attr("x2", xScale(ustar))
                .attr("y2", yScale(0));
            projection1
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("x1", xScale(0))
                .attr("y1", yScale(0))
                .attr("x2", xScale(ustar))
                .attr("y2", yScale(0));
            connector2
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("x1", xScale(ustar))
                .attr("y1", yScale(vstar))
                .attr("x2", xScale(0))
                .attr("y2", yScale(vstar));
            projection2
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("x1", xScale(0))
                .attr("y1", yScale(0))
                .attr("x2", xScale(0))
                .attr("y2", yScale(vstar));
            startingvector
                .attr("transform", "rotate(0)")
                .attr("x2", xScale(u))
                .attr("y2", yScale(v));
            startingvector
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("x2", xScale(ustar))
                .attr("y2", yScale(vstar));
            labelVector(startingvector, startingvectorlabel, ustar, vstar, true, null, false);

            }
        else if (type == "Finish") {
            // prevdelay = timedelay;
            // timedelay = 2000;

            // change Scale button to Finish button
            d3.select("#analysis-button")
               // .attr("value", "Start");
               .text("Start");

            // Enable the beta*t dropdown again
            d3.select("select#betat-dropdown").property("disabled", false);

            xstar = nextX(x);
            ystar = nextY(y);

            // fade in umatdiaguinvfreq vector, fade out umat and diaguinvfreq
            pol_umat.showAt(equation_tm, equation_lm,                                                2, "black",  false, true,  1/Math.sqrt(2), 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2));
            //pol_diag.showAt(equation_tm, equation_lm + wumat + equation_spacer,                    2, "black",  false, false, lambda1, 0.0, 0.0, lambda2);
            //pol_uinv.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,          2, "black",  false, false, 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2), 1/Math.sqrt(2));
            //pol_freq.showAt(equation_tm, equation_lm + wumat + wdiag + wuinv + 3*equation_spacer,  2, "black",  false, false, x, y);
            //pol_uinvfreq.showAt(equation_tm, equation_lm + wumat + wdiag + 2*equation_spacer,      2, "gray",   false, false, 1/Math.sqrt(2), -1/Math.sqrt(2), 1/Math.sqrt(2), 1/Math.sqrt(2));
            pol_diaguinvfreq.showAt(equation_tm, equation_lm + wumat + equation_spacer,              2, "black",  false, true,  ustar, vstar);
            pol_umatdiaguinvfreq.showAt(equation_tm, equation_lm,                                    2, "hidden", true,  false, xstar, ystar);

            // Describe what is happening in this step
            // d3.select("#status-text")
            //     .text("Rotate back to the standard coordinate system by premultiplying by the eigenvector matrix.");

            var cx = w/2;
            var cy = h/2;
            // var rotate = "rotate(0 " + cx + " " + cy + ")";
            // var translatex = " translate(" + cx + " 0)";
            // var translatey = "translate(0 " + cy + ")";

            connector1
                .style("visibility", "hidden");
            projection1
                .style("visibility", "hidden");
            connector2
                .style("visibility", "hidden");
            projection2
                .style("visibility", "hidden");
            //eigenvector1
            //    .style("visibility", "hidden");
            //eigenvalue1
            //    .style("visibility", "hidden");
            //eigenvector2
            //    .style("visibility", "hidden");
            //eigenvalue2
            //    .style("visibility", "hidden");

            startingvector
                .attr("x2", xScale(xstar))
                .attr("y2", yScale(ystar))
                .attr("transform", "rotate(45)");
            startingvector
                .transition()
                .duration(timedelay)
                .ease(easing)
                .on("start", function() {
                    startingvectorlabel.style("visibility", "hidden");
                    })
                .attr("transform", "rotate(0)");

            labelVector(startingvector, startingvectorlabel, xstar, ystar, true, function() {
                startingvectorlabel.style("visibility", "visible");
                }, false);

            eigenvector1
                .attr("x2", xScale(x1))
                .attr("y2", yScale(y1))
                .attr("transform", "rotate(45)");
            eigenvector1
                .transition()
                .duration(timedelay)
                .ease(easing)
                .on("start", function() {
                    eigenvalue1.style("visibility", "hidden");
                    })
                .attr("transform", "rotate(0)");

            labelVector(eigenvector1, eigenvalue1, x1, y1, true, function() {
                eigenvalue1.style("visibility", "visible");
                }, false);

            eigenvector2
                .attr("x2", xScale(x2))
                .attr("y2", yScale(y2))
                .attr("transform", "rotate(45)");
            eigenvector2
                .transition()
                .duration(timedelay)
                .ease(easing)
                .on("start", function() {
                    eigenvalue2.style("visibility", "hidden");
                    })
                .attr("transform", "rotate(0)");

            labelVector(eigenvector2, eigenvalue2, x2, y2, true, function() {
                eigenvalue2.style("visibility", "visible");
                }, false);

            xaxis
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("transform", "rotate(0)");
            yaxis
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("transform", "rotate(0)");
            // xaxis
            //     .transition()
            //     .duration(timedelay)
            //     .ease(easing)
            //     .attr("transform", rotate + " " + translatey);
            // yaxis
            //     .transition()
            //     .duration(timedelay)
            //     .ease(easing)
            //     .attr("transform", rotate + " " + translatex);
            dotteddiagonal
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("transform", "rotate(0)");
            equilibrium
                .transition()
                .duration(timedelay)
                .ease(easing)
                .attr("transform", "rotate(0)");
                // .attr("cx", xScale(0.5))
                // .attr("cy", yScale(0.5));

            //timedelay = prevdelay;

            }
        }

    // Add button to details_div that allows user to step through the diagonalization
    addButton(details_div, "analysis-button", "Start", processButtonClick, "100px", true);
    d3.select("div#control-analysis-button").style("display", "inline-block").style("width", "30%");
    d3.select("#analysis-button").property("disabled", false);

    // Add dropdown list to determine betat value
    addStringDropdown(details_div, "betat-dropdown", "expected number of substitutions/character", ["0.1", "0.5", "1.0", "10.0"], 1, function() {
        var selected_index = d3.select(this).property('selectedIndex');
        if (selected_index == 0) {
            betat = 0.1;
            }
        else if (selected_index == 1) {
            betat = 0.5;
            }
        else if (selected_index == 2) {
            betat = 1.0;
            }
        else if (selected_index == 3) {
            betat = 10.0;
            }
        else {
            console.log("error: unknown choice; using 1.0 substitutions/character");
            betat = 1.0;
            }
        lambda2 = Math.exp(-2.0*betat);
        });
    d3.select("div#outerdiv-betat-dropdown")
        .style("display", "inline-block");
    d3.select("div#control-betat-dropdown")
        .style("font-family", "Verdana");
    d3.select("select#betat-dropdown")
        .style("font-family", "Verdana");

    // Add a text box that describes what's happening
    //addStatusText(details_div, "status-text", "", true);
    //d3.select("#status-text")
    //    .style("height", "30px")
    //    .style("font-family", "Verdana")
    //    .text("Press Start button to choose a frequency vector.");

</script>

## Background

Imagine a sequence comprising 50 sites in which 30 sites (60%) are in state 0 and the remaining 20 sites (40%) are in state 1.

 00101101101000010110000010100001010000001101110110
  
The fraction of sites in each of the two possible states can be represented by the (transposed) vector (0.6, 0.4). If this sequence were allowed to evolve for an infinite amount of time under an equal-rate (Cavender-Farris) model, the sequence composition would achieve an equilibrium in which half the sites were in state 0 and the other half in state 1. This ewquilibrium point is represented by the red dot on the simplex in the applet. 

If, however, the amount of time and the substitution rate were such that the expected number of substitutions is 0.5, the sequence would evolve toward the equilibrium, but how close would it come to the red dot? This applet illustrates how to predict the distance a sequence would evolve toward the equilibrium point. 

All possible vectors representing relative state frequencies must lie on the simplex represented in the applet by the dotted gray line. At one extreme (1.0 on the horizontal axis), the sequence comprises only state 0. At the other extreme (1.0 on the vertical axis), the sequence consists solely of sites in state 1. The dropdown list at the top allows you to select the length of the evolutionary path that the sequence will follow: higher numbers mean that the sequence will travel further toward the red equilibrium point because the substitution rate and/or time available is larger.

The transition probability matrix P = exp{Qt}, where t is time (measured in expected number of substitutions per site) and Q is the instantaneous rate matrix (scaled so that it represents one expected substitution per unit time. The exponentiation can be accomplished by first diagonalizing Q, which means Q is factored into an eigenvector matrix, a diagonal matrix of eigenvalues, and an inverse eigenvector matrix. The eigenvalues are then multiplied by t and exponentiated to yield the eigenvalues of the P matrix. The three 2x2 matrices shown below the graph in the applet represent the diagonalized version of the matrix P.

The applet shows that premultiplying a vector of relative state frequencies by the diagonalized P matrix transformed the starting relative frequency vector to the vector expected after the sequence has evolved for the evolutionary distance specified by the dropdown at the top. Premultipying by the inverse eigenvalue matrix rotates axes to align with the eigenvectors. Premultiplying by the diagonal matrix of eigenvalues scales the axes. Finally premultiplying by the eigenvector matrix rotates axes back to the original coordinate system. Note that all movement of the relative frequency vector is in the direction of the eigenvalues, with the eigenvectors determining the scale of the movement. Because one eigenvalue is 1, no movement occurs on one eigenvalue axis (multiplying by 1 does not change the value along that axis), so all movement is restricted to the line representing the simplex, which is parallel to the other eigenvector.

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library. I am also endebted to Grant Sanderson and his excellent [3Blue1Brown web site](https://www.3blue1brown.com/), where a much better explanation of eigenvectors and eigenvalues can be found in the Linear Algebra section, and to Mark Holder for showing me this amazing web site.

Please see the [GitHub site](https://github.com/plewis/plewis.github.io/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
