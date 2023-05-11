---
layout: applet
title: Dirichlet Nucleotide Frequency Prior
author: Paul O. Lewis
permalink: /applets/dirichlet-prior/
---
## Dirichlet Nucleotide Frequency Prior applet

The [Dirichlet distribution](https://en.wikipedia.org/wiki/Dirichlet_distribution) is normally used to specify the prior distribution for equilibrium base frequencies in Bayesian phylogenetics. Unfortunately, 4 dimensions are required to plot the probability density, so I've resorted to showing you samples from the distribution instead plotted using a [barycentric coordinate system](https://en.wikipedia.org/wiki/Barycentric_coordinate_system).

Drag right-to-left (or left-to-right) with mouse to rotate view. Use controls below plot to change sampling distribution. Relative distance from vertex A, for example, is proportional to nucleotide frequency of A.

<div class="container"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 22-June-2018

    var defineTetrahedron = function(edge_length) {
        // Wolfram MathWorld article on Regular Tetrahedron
        // provides coordinates (eq. 12) for the vertices of
        // a regular tetrahedron in which each edge has length a
        // see http://mathworld.wolfram.com/RegularTetrahedron.html
        //
        //                       x=0
        //   y=a/2  -->  C        |      This is the base of the tetrahedron
        //               +   +    |      peak is at (0,0,sqrt(6)*a/3)
        //               +       +|
        //               +        |  +
        //   y=0    --> -+--------|------A---------
        //               +        |  +   ^x=sqrt(3)*a/3
        //               +       +|
        //               +   +    |      The base is an equilateral triangle
        //   y=-a/2 -->  G        |      with each angle equal to pi/3
        //               ^x=-sqrt(3)*a/6
        //
        //                  x          y         z
        // ----------------------------------------------
        // G:          sqrt(3)*a/6   -a/2        0
        // C:          sqrt(3)*a/6    a/2        0
        // A:          sqrt(3)*a/3     0         0
        // T:               0          0     sqrt(6)*a/3
        // ----------------------------------------------
        // center:     sqrt(3)*a/6     0     sqrt(6)*a/12

        // Length of an edge in the tetrahedron
        var a = edge_length;

        // Define the four vertices
        var A =        [ a*Math.sqrt(3.0)/3.0,    0.0,                  0.0];
        var C =        [-a*Math.sqrt(3.0)/6.0,  a/2.0,                  0.0];
        var G =        [-a*Math.sqrt(3.0)/6.0, -a/2.0,                  0.0];
        var T =        [                  0.0,    0.0, a*Math.sqrt(6.0)/3.0];
        var centroid = [     a*Math.sqrt(3)/6,    0.0,    a*Math.sqrt(6)/12];

        // Translate so that tetrahedron is centered vertically
        /* A[0] -= centroid[0]; A[1] -= centroid[1]; */ A[2] -= centroid[2];
        /* C[0] -= centroid[0]; C[1] -= centroid[1]; */ C[2] -= centroid[2];
        /* G[0] -= centroid[0]; G[1] -= centroid[1]; */ G[2] -= centroid[2];
        /* T[0] -= centroid[0]; T[1] -= centroid[1]; */ T[2] -= centroid[2];

        //var aa = 1.2*a;
        //var AA = [ aa*Math.sqrt(3.0)/3.0,     0.0,                   0.0];
        //var CC = [-aa*Math.sqrt(3.0)/6.0,  aa/2.0,                   0.0];
        //var GG = [-aa*Math.sqrt(3.0)/6.0, -aa/2.0,                   0.0];
        //var TT = [                   0.0,     0.0, aa*Math.sqrt(6.0)/3.0];

        return [A, C, G, T]; //, AA, CC, GG, TT];
        }

    var simPoints = function(npoints) {
        // Draw random points from Dirichlet(beta[0], beta[1], beta[2], beta[3])
        var dataset = [];
        for (var i = 0; i < npoints; i++) {
            var g1 = lot.gamma(beta[0], 1.0);
            var g2 = lot.gamma(beta[1], 1.0);
            var g3 = lot.gamma(beta[2], 1.0);
            var g4 = lot.gamma(beta[3], 1.0);
            var gsum = g1 + g2 + g3 + g4;
            var piA = g1/gsum
            var piC = g2/gsum
            var piG = g3/gsum
            var piT = g4/gsum

            var A = tetrahedron[0]
            var C = tetrahedron[1]
            var G = tetrahedron[2]
            var T = tetrahedron[3]

            var x = piA*A[0] + piC*C[0] + piG*G[0] + piT*T[0];
            var y = piA*A[1] + piC*C[1] + piG*G[1] + piT*T[1];
            var z = piA*A[2] + piC*C[2] + piG*G[2] + piT*T[2];

            var p = {'coords':[x,y,z],'freqs':[piA, piC, piG, piT]}
            dataset.push(p);
            }
        return dataset;
        }

    var drawAxes = function(v) {
        // Create line for x-axis
        svg.append("line")
            .attr("id", "xaxis")
            .attr("x1", xscale(v.project([-1,0,0])[0]))
            .attr("y1", yscale(v.project([-1,0,0])[1]))
            .attr("x2", xscale(v.project([ 1,0,0])[0]))
            .attr("y2", yscale(v.project([ 1,0,0])[1]))
            .attr("stroke-width", 1)
            .attr("stroke", "blue")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        // Create x-axis label
        svg.append("text")
            .attr("id", "xaxislabel")
            .attr("x", xscale(v.project([1.1,0,0])[0]))
            .attr("y", yscale(v.project([1,0,0])[1]))
            .html("x")
            .attr("stroke", "black")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        // Create line for positive y-axis
        svg.append("line")
            .attr("id", "yaxis")
            .attr("x1", xscale(v.project([0,-1,0])[0]))
            .attr("y1", yscale(v.project([0,-1,0])[1]))
            .attr("x2", xscale(v.project([0, 1,0])[0]))
            .attr("y2", yscale(v.project([0, 1,0])[1]))
            .attr("stroke-width", 1)
            .attr("stroke", "red")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        // Create y-axis label
        svg.append("text")
            .attr("id", "yaxislabel")
            .attr("x", xscale(v.project([0,-1,0])[0]))
            .attr("y", yscale(v.project([0,-1.1,0])[1]))
            .html("y")
            .attr("stroke", "black")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        // Create line for positive z-axis
        svg.append("line")
            .attr("id", "zaxis")
            .attr("x1", xscale(v.project([0,0,-1])[0]))
            .attr("y1", yscale(v.project([0,0,-1])[1]))
            .attr("x2", xscale(v.project([0,0, 1])[0]))
            .attr("y2", yscale(v.project([0,0, 1])[1]))
            .attr("stroke-width", 1)
            .attr("stroke", "green")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        // Create x-axis label
        svg.append("text")
            .attr("id", "xaxislabel")
            .attr("x", xscale(v.project([0,0,1])[0]))
            .attr("y", yscale(v.project([0,0,1])[1]))
            .html("z")
            .attr("stroke", "green")
            .attr("visibility", (show_axes ? "visible" : "hidden"));
        }

    var rotateAxes = function(v) {
        svg.select("line#xaxis")
            .attr("x1", xscale(v.project([-1,0,0])[0]))
            .attr("y1", yscale(v.project([-1,0,0])[1]))
            .attr("x2", xscale(v.project([ 1,0,0])[0]))
            .attr("y2", yscale(v.project([ 1,0,0])[1]));

        svg.select("line#yaxis")
            .attr("x1", xscale(v.project([0,-1,0])[0]))
            .attr("y1", yscale(v.project([0,-1,0])[1]))
            .attr("x2", xscale(v.project([0, 1,0])[0]))
            .attr("y2", yscale(v.project([0, 1,0])[1]));

        svg.select("line#zaxis")
            .attr("x1", xscale(v.project([0,0,-1])[0]))
            .attr("y1", yscale(v.project([0,0,-1])[1]))
            .attr("x2", xscale(v.project([0,0, 1])[0]))
            .attr("y2", yscale(v.project([0,0, 1])[1]));

        svg.select("text#xaxislabel")
            .attr("x", xscale(v.project([1.1,0,0])[0]))
            .attr("y", yscale(v.project([1,0,0])[1]));

        svg.select("text#yaxislabel")
            .attr("x", xscale(v.project([0,-1,0])[0]))
            .attr("y", yscale(v.project([0,-1.1,0])[1]));

        svg.select("text#zaxislabel")
            .attr("x", xscale(v.project([0,0,1])[0]))
            .attr("y", yscale(v.project([0,0,1])[1]));
        }

    var refreshAxes = function() {
        svg.select("line#xaxis")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        svg.select("line#yaxis")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        svg.select("line#zaxis")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        svg.select("text#xaxislabel")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        svg.select("text#yaxislabel")
            .attr("visibility", (show_axes ? "visible" : "hidden"));

        svg.select("text#zaxislabel")
            .attr("visibility", (show_axes ? "visible" : "hidden"));
        }

    var drawBoundingBox = function() {
        // Draw rect around plot area
        svg.append("rect")
            .attr("id", "boundingbox")
            .attr("x", lm)
            .attr("y", bm)
            .attr("width", w-lm-rm)
            .attr("height", h-bm-tm)
            .attr("stroke", "purple")
            .attr("fill", "lavender")
            .attr("visibility", (show_bounding_box ? "visibility" : "hidden"));
        }

    var refreshBoundingBox = function() {
        svg.select("rect#boundingbox")
            .attr("visibility", (show_bounding_box ? "visible" : "hidden"));
        }

    var drawTetrahedron = function(v) {
        // Create edges of tetrahedron
        var A = v.project(tetrahedron[0])
        var C = v.project(tetrahedron[1])
        var G = v.project(tetrahedron[2])
        var T = v.project(tetrahedron[3])

        // Show edge connecting A and C
        svg.append("line")
            .attr("id", "edgePQ")
            .attr("x1", xscale(A[0]))
            .attr("y1", yscale(A[1]))
            .attr("x2", xscale(C[0]))
            .attr("y2", yscale(C[1]))
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2,2")
            .attr("stroke", "black")
            .attr("visibility", (show_tetrahedron ? "visible" : "hidden"));

        // Show edge connecting C and G
        svg.append("line")
            .attr("id", "edgeQR")
            .attr("x1", xscale(C[0]))
            .attr("y1", yscale(C[1]))
            .attr("x2", xscale(G[0]))
            .attr("y2", yscale(G[1]))
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2,2")
            .attr("stroke", "black")
            .attr("visibility", (show_tetrahedron ? "visible" : "hidden"));

        // Show edge connecting G and A
        svg.append("line")
            .attr("id", "edgeRP")
            .attr("x1", xscale(G[0]))
            .attr("y1", yscale(G[1]))
            .attr("x2", xscale(A[0]))
            .attr("y2", yscale(A[1]))
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2,2")
            .attr("stroke", "black")
            .attr("visibility", (show_tetrahedron ? "visible" : "hidden"));

        // Show edge connecting A and T
        svg.append("line")
            .attr("id", "edgePS")
            .attr("x1", xscale(A[0]))
            .attr("y1", yscale(A[1]))
            .attr("x2", xscale(T[0]))
            .attr("y2", yscale(T[1]))
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2,2")
            .attr("stroke", "black")
            .attr("visibility", (show_tetrahedron ? "visible" : "hidden"));

        // Show edge connecting C and T
        svg.append("line")
            .attr("id", "edgeQS")
            .attr("x1", xscale(C[0]))
            .attr("y1", yscale(C[1]))
            .attr("x2", xscale(T[0]))
            .attr("y2", yscale(T[1]))
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2,2")
            .attr("stroke", "black")
            .attr("visibility", (show_tetrahedron ? "visible" : "hidden"));

        // Show edge connecting G and T
        svg.append("line")
            .attr("id", "edgeRS")
            .attr("x1", xscale(G[0]))
            .attr("y1", yscale(G[1]))
            .attr("x2", xscale(T[0]))
            .attr("y2", yscale(T[1]))
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2,2")
            .attr("stroke", "black")
            .attr("visibility", (show_tetrahedron ? "visible" : "hidden"));

        // Show point at A
        svg.append("circle")
            .attr("id", "pointP")
            .attr("cx", xscale(A[0]))
            .attr("cy", yscale(A[1]))
            .attr("r", circle_radius)
            .attr("fill", "blue")
            .attr("visibility", (show_tetrahedron_vertices ? "visible" : "hidden"));

        // Show point at C
        svg.append("circle")
            .attr("id", "pointQ")
            .attr("cx", xscale(C[0]))
            .attr("cy", yscale(C[1]))
            .attr("r", circle_radius)
            .attr("fill", "red")
            .attr("visibility", (show_tetrahedron_vertices ? "visible" : "hidden"));

        // Show point at G
        svg.append("circle")
            .attr("id", "pointR")
            .attr("cx", xscale(G[0]))
            .attr("cy", yscale(G[1]))
            .attr("r", circle_radius)
            .attr("fill", "green")
            .attr("visibility", (show_tetrahedron_vertices ? "visible" : "hidden"));

        // Show point at T
        svg.append("circle")
            .attr("id", "pointS")
            .attr("cx", xscale(T[0]))
            .attr("cy", yscale(T[1]))
            .attr("r", circle_radius)
            .attr("fill", "black")
            .attr("visibility", (show_tetrahedron_vertices ? "visible" : "hidden"));

        //var AA = v.project(tetrahedron[4])
        //var CC = v.project(tetrahedron[5])
        //var GG = v.project(tetrahedron[6])
        //var TT = v.project(tetrahedron[7])

        // Show label at A
        svg.append("circle")
            .attr("id", "labelP")
            .attr("cx", xscale(A[0]))
            .attr("cy", yscale(A[1]) + vertex_label_font_size/4)
            .attr("r", vertex_label_font_size)
            .attr("stroke", "none")
            .attr("fill", "orange");
        svg.append("text")
            .attr("id", "labelP")
            .attr("class", "noselect")
            .attr("x", xscale(A[0]))
            .attr("y", yscale(A[1]) + vertex_label_font_size/2)
            .attr("visibility", (show_tetrahedron_vertex_labels ? "visible" : "hidden"))
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .style("font-size", vertex_label_font_size+"px")
            .text("A");

        // Show label at C
        svg.append("circle")
            .attr("id", "labelQ")
            .attr("cx", xscale(C[0]))
            .attr("cy", yscale(C[1]) + vertex_label_font_size/4)
            .attr("r", vertex_label_font_size)
            .attr("stroke", "none")
            .attr("fill", "orange");
        svg.append("text")
            .attr("id", "labelQ")
            .attr("class", "noselect")
            .attr("x", xscale(C[0]))
            .attr("y", yscale(C[1]) + vertex_label_font_size/2)
            .attr("visibility", (show_tetrahedron_vertex_labels ? "visible" : "hidden"))
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .style("font-size", vertex_label_font_size+"px")
            .text("C");

        // Show label at G
        svg.append("circle")
            .attr("id", "labelR")
            .attr("cx", xscale(G[0]))
            .attr("cy", yscale(G[1]) + vertex_label_font_size/4)
            .attr("r", vertex_label_font_size)
            .attr("stroke", "none")
            .attr("fill", "orange");
        svg.append("text")
            .attr("id", "labelR")
            .attr("class", "noselect")
            .attr("x", xscale(G[0]))
            .attr("y", yscale(G[1]) + vertex_label_font_size/2)
            .attr("visibility", (show_tetrahedron_vertex_labels ? "visible" : "hidden"))
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .style("font-size", vertex_label_font_size+"px")
            .text("G");

        // Show label at T
        svg.append("circle")
            .attr("id", "labelS")
            .attr("cx", xscale(T[0]))
            .attr("cy", yscale(T[1]) + vertex_label_font_size/4)
            .attr("r", vertex_label_font_size)
            .attr("stroke", "none")
            .attr("fill", "orange");
        svg.append("text")
            .attr("id", "labelS")
            .attr("class", "noselect")
            .attr("x", xscale(T[0]))
            .attr("y", yscale(T[1]) + vertex_label_font_size/2)
            .attr("visibility", (show_tetrahedron_vertex_labels ? "visible" : "hidden"))
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .style("font-size", vertex_label_font_size+"px")
            .text("T");
        }

    var rotateTetrahedron = function(v) {
        var A = v.project(tetrahedron[0])
        var C = v.project(tetrahedron[1])
        var G = v.project(tetrahedron[2])
        var T = v.project(tetrahedron[3])

        svg.select("line#edgePQ")
            .attr("x1", xscale(A[0]))
            .attr("y1", yscale(A[1]))
            .attr("x2", xscale(C[0]))
            .attr("y2", yscale(C[1]));

        svg.select("line#edgeQR")
            .attr("x1", xscale(C[0]))
            .attr("y1", yscale(C[1]))
            .attr("x2", xscale(G[0]))
            .attr("y2", yscale(G[1]));

        svg.select("line#edgeRP")
            .attr("x1", xscale(G[0]))
            .attr("y1", yscale(G[1]))
            .attr("x2", xscale(A[0]))
            .attr("y2", yscale(A[1]));

        svg.select("line#edgePS")
            .attr("x1", xscale(A[0]))
            .attr("y1", yscale(A[1]))
            .attr("x2", xscale(T[0]))
            .attr("y2", yscale(T[1]));

        svg.select("line#edgeQS")
            .attr("x1", xscale(C[0]))
            .attr("y1", yscale(C[1]))
            .attr("x2", xscale(T[0]))
            .attr("y2", yscale(T[1]));

        svg.select("line#edgeRS")
            .attr("x1", xscale(G[0]))
            .attr("y1", yscale(G[1]))
            .attr("x2", xscale(T[0]))
            .attr("y2", yscale(T[1]));

        svg.select("circle#pointP")
            .attr("cx", xscale(A[0]))
            .attr("cy", yscale(A[1]));

        svg.select("circle#pointQ")
            .attr("cx", xscale(C[0]))
            .attr("cy", yscale(C[1]));

        svg.select("circle#pointR")
            .attr("cx", xscale(G[0]))
            .attr("cy", yscale(G[1]));

        svg.select("circle#pointS")
            .attr("cx", xscale(T[0]))
            .attr("cy", yscale(T[1]));

        //var AA = v.project(tetrahedron[4])
        //var CC = v.project(tetrahedron[5])
        //var GG = v.project(tetrahedron[6])
        //var TT = v.project(tetrahedron[7])

        svg.select("circle#labelP")
            .attr("cx", xscale(A[0]))
            .attr("cy", yscale(A[1]) + vertex_label_font_size/4);
        svg.select("text#labelP")
            .attr("x", xscale(A[0]))
            .attr("y", yscale(A[1]) + vertex_label_font_size/2);

        svg.select("circle#labelQ")
            .attr("cx", xscale(C[0]))
            .attr("cy", yscale(C[1]) + vertex_label_font_size/4);
        svg.select("text#labelQ")
            .attr("x", xscale(C[0]))
            .attr("y", yscale(C[1]) + vertex_label_font_size/2);

        svg.select("circle#labelR")
            .attr("cx", xscale(G[0]))
            .attr("cy", yscale(G[1]) + vertex_label_font_size/4);
        svg.select("text#labelR")
            .attr("x", xscale(G[0]))
            .attr("y", yscale(G[1]) + vertex_label_font_size/2);

        svg.select("circle#labelS")
            .attr("cx", xscale(T[0]))
            .attr("cy", yscale(T[1]) + vertex_label_font_size/4);
        svg.select("text#labelS")
            .attr("x", xscale(T[0]))
            .attr("y", yscale(T[1]) + vertex_label_font_size/2);
        }

    /*var showFreqs = function(freqs) {
        console.log(freqs);
        // show values of points in freqs in div#sample

        var displayedhtml = "<pre>";
        for (i in freqs) {
            f = freqs[i];
            displayedhtml += f[0].toFixed(5) + "  " + f[1].toFixed(5) + "  " + f[2].toFixed(5) + "  " + f[3].toFixed(5) + "\n";
            }
        displayedhtml += "</pre>";

        d3.select("div#sample")
            .html(displayedhtml);
        }*/

    var drawPoints = function(pointdata, v) {
        // see https://en.wikipedia.org/wiki/Barycentric_coordinate_system
        svg.selectAll("circle.points")
            .data(pointdata)
            .enter()
            .append("circle")
            .attr("class", "points")
            .attr("cx", function(d) {
                return xscale(v.project(d['coords'])[0]);
                })
            .attr("cy", function(d) {
                return yscale(v.project(d['coords'])[1]);
                })
            .attr("r", circle_radius)
            .attr("visibility", (show_points ? "visible" : "hidden"))
            .attr("fill", "url(#radial-gradient)");

        if (pointdata.length == 1) {
            svg.selectAll("text.points")
                .data(pointdata)
                .enter()
                .append("text")
                .classed("points noselect", true)
                .attr("x", function(d) {
                    return point_label_offset_x + xscale(v.project(d['coords'])[0]);
                    })
                .attr("y", function(d) {
                    return point_label_offset_y + yscale(v.project(d['coords'])[1]);
                    })
                .style("font-family", "Courier")
                .style("font-size", font_size+"px")
                .text(function(d) {return "A=" + d['freqs'][0].toFixed(3) + " C=" + d['freqs'][1].toFixed(3) + " G=" + d['freqs'][2].toFixed(3) + " T=" + d['freqs'][3].toFixed(3);});
            }
        }

    var rotatePoints = function(v) {

        svg.selectAll("circle.points")
            .attr("cx", function(d) {
                return xscale(v.project(d['coords'])[0]);
                })
            .attr("cy", function(d) {
                return yscale(v.project(d['coords'])[1]);
                });
        svg.selectAll("text.points")
            .attr("x", function(d) {
                return point_label_offset_x + xscale(v.project(d['coords'])[0]);
                })
            .attr("y", function(d) {
                return point_label_offset_y + yscale(v.project(d['coords'])[1]);
                });
        }

    var destroyExistingPoints = function() {
        svg.selectAll("circle.points")
            .remove();
        svg.selectAll("text.points")
            .remove();
        }

    function rotateBy(delta) {
        rotation_around_z += delta;
        console.log("rotation_around_z = " + rotation_around_z);
        v = new Viewport([rotation_around_x, rotation_around_y, rotation_around_z]);
        rotateAxes(v);
        rotateTetrahedron(v);
        rotatePoints(v);
        }

    var mouse_damping_factor = -0.01;
    var mousex, prev_mousex = null;

    function mouseDown() {
        prev_mousex = d3.mouse(this)[0];
        //showVectors(false);
    }

    function mouseMove() {
        if (prev_mousex) {
            mousex = d3.mouse(this)[0];
            rotateBy(mouse_damping_factor*(mousex - prev_mousex));
            prev_mousex = mousex;
        }
    }

    function mouseUp() {
        prev_mousex = null;
        //showVectors(true);
    }

    var addDropdown = function(panel, id, label, choices, selected_index, onfunc) {
        var control_div = panel.append("div").append("div")
            .attr("class", "control");
        control_div.append("select")
            .attr("id", id)
            .on("change", onfunc)
            .selectAll("option")
            .data(choices)
            .enter()
            .append("option")
            .text(function(d) {return d.toFixed(0);});
        d3.select("select#" + id).property("selectedIndex", selected_index);
        control_div.append("label")
            .html("&nbsp;" + label);
        }

    var addCheckbox = function(panel, label, checked_by_default, onfunc) {
        var control_div = panel.append("div").append("div")
            .attr("class", "control");
        control_div.append("input")
            .attr("type", "checkbox")
            .property("checked", checked_by_default)
            .on("change", onfunc);
        control_div.append("label")
            .append("label")
            .html("&nbsp;" + label);
        }

    var addButton = function(panel, label, onfunc) {
        var control_div = panel.append("div").append("div")
            .attr("class", "control");
        control_div.append("input")
            .attr("value",label)
            .attr("type", "button")
            .on("click", onfunc);
        }

    var defineRadialGradient = function() {
        // Define radial gradient
        var radial_gradient = svg.append("defs")
            .append("radialGradient")
            .attr("id", "radial-gradient")
            .attr("fx", "75%")
            .attr("fy", "25%");
        radial_gradient.append("stop").attr("offset", "5%").attr("stop-color", "white");
        radial_gradient.append("stop").attr("offset", "95%").attr("stop-color", "navy");
    }

    var createPlotPanel = function() {
        var graphics_div = container_div.append("div")
            .attr("id", "graphicsbox");

        // Create SVG element
        svg = graphics_div.append("svg")
            .attr("width", w)
            .attr("height", h)
            .on("mousedown", mouseDown)
            .on("mousemove", mouseMove)
            .on("mouseup", mouseUp);

        drawBoundingBox();
        defineRadialGradient();
        drawBoundingBox();
        drawAxes(v);
        drawTetrahedron(v);
        var pointdata = simPoints(npoints);
        drawPoints(pointdata, v);
        //showFreqs(pointdata[1]);
        }

    var createDetailsPanel = function() {
        var details_div = container_div.append("div").attr("id", "detailsbox");

        // Create drop-down list within details_div to allow changing Dirichlet parameter
        addDropdown(details_div, "dropdownA", "A", beta_choices, beta_index, function() {
                var selected_index = d3.select(this).property('selectedIndex');
                beta[0] = beta_choices[selected_index];
                if (symmetric_dirichlet) {
                    beta[1] = beta[0];
                    beta[2] = beta[0];
                    beta[3] = beta[0];
                    d3.select("#dropdownC").property('selectedIndex', selected_index);
                    d3.select("#dropdownG").property('selectedIndex', selected_index);
                    d3.select("#dropdownT").property('selectedIndex', selected_index);
                    }
                destroyExistingPoints();
                var pointdata = simPoints(npoints);
                drawPoints(pointdata, v);
                //showFreqs(pointdata[1]);
                rotateBy(0.0);
                });
        addDropdown(details_div, "dropdownC", "C", beta_choices, beta_index, function() {
                var selected_index = d3.select(this).property('selectedIndex');
                beta[1] = beta_choices[selected_index];
                if (symmetric_dirichlet) {
                    beta[0] = beta[1];
                    beta[2] = beta[1];
                    beta[3] = beta[1];
                    d3.select("#dropdownA").property('selectedIndex', selected_index);
                    d3.select("#dropdownG").property('selectedIndex', selected_index);
                    d3.select("#dropdownT").property('selectedIndex', selected_index);
                    }
                destroyExistingPoints();
                var pointdata = simPoints(npoints);
                drawPoints(pointdata, v);
                //showFreqs(pointdata[1]);
                rotateBy(0.0);
                });
        addDropdown(details_div, "dropdownG", "G", beta_choices, beta_index, function() {
                var selected_index = d3.select(this).property('selectedIndex');
                beta[2] = beta_choices[selected_index];
                if (symmetric_dirichlet) {
                    beta[0] = beta[2];
                    beta[1] = beta[2];
                    beta[3] = beta[2];
                    d3.select("#dropdownA").property('selectedIndex', selected_index);
                    d3.select("#dropdownC").property('selectedIndex', selected_index);
                    d3.select("#dropdownT").property('selectedIndex', selected_index);
                    }
                destroyExistingPoints();
                var pointdata = simPoints(npoints);
                drawPoints(pointdata, v);
                //showFreqs(pointdata[1]);
                rotateBy(0.0);
                });
        addDropdown(details_div, "dropdownT", "T", beta_choices, beta_index, function() {
                var selected_index = d3.select(this).property('selectedIndex');
                beta[3] = beta_choices[selected_index];
                if (symmetric_dirichlet) {
                    beta[0] = beta[3];
                    beta[1] = beta[3];
                    beta[2] = beta[3];
                    d3.select("#dropdownA").property('selectedIndex', selected_index);
                    d3.select("#dropdownC").property('selectedIndex', selected_index);
                    d3.select("#dropdownG").property('selectedIndex', selected_index);
                    }
                destroyExistingPoints();
                var pointdata = simPoints(npoints);
                drawPoints(pointdata, v);
                //showFreqs(pointdata[1]);
                rotateBy(0.0);
                });
        addCheckbox(details_div, "Symmetric", symmetric_dirichlet, function() {
                symmetric_dirichlet = d3.select(this).property('checked');
                var selected_index = d3.select("#dropdownA").property('selectedIndex');
                console.log("symmetric_dirichlet = " + symmetric_dirichlet);
                if (symmetric_dirichlet) {
                    d3.select("#dropdownC").property('selectedIndex', selected_index);
                    d3.select("#dropdownG").property('selectedIndex', selected_index);
                    d3.select("#dropdownT").property('selectedIndex', selected_index);
                    beta[1] = beta[0];
                    beta[2] = beta[0];
                    beta[3] = beta[0];
                    destroyExistingPoints();
                    var pointdata = simPoints(npoints);
                    drawPoints(pointdata, v);
                    //showFreqs(pointdata[1]);
                    rotateBy(0.0);
                    }
                });
        details_div.append("div")
            .attr("class", "spacer")
            .style("font-size", "0")
            .style("height", "20px")
            .style("line-height", "0");
        addButton(details_div, "Draw new sample", function() {
                destroyExistingPoints();
                var pointdata = simPoints(npoints);
                drawPoints(pointdata, v);
                //showFreqs(pointdata[1]);
                rotateBy(0.0);
                });
        addDropdown(details_div, "samplesize", "Sample size", npoints_choices, npoints_index, function() {
                var selected_index = d3.select(this).property('selectedIndex');
                npoints = npoints_choices[selected_index];
                destroyExistingPoints();
                var pointdata = simPoints(npoints);
                drawPoints(pointdata, v);
                //showFreqs(pointdata[1]);
                rotateBy(0.0);
                });

        // Checkboxes (these debugging tools work but are disabled for production applet)
        //addCheckbox(details_div, "Show axes", function() {
        //        show_axes = d3.select(this).property("checked");
        //        refreshAxes();
        //        });
        //addCheckbox(details_div, "Show bounding box", function() {
        //        show_bounding_box = d3.select(this).property("checked");
        //        refreshBoundingBox();
        //        });

        /*details_div.append("div").append("label")
            .html("Show axes&nbsp;&nbsp;&nbsp;")
            .append("input")
            .attr("type", "checkbox")
            .on("change", function() {
                show_axes = d3.select(this).property("checked");
                console.log("showing axes = " + (show_axes ? "yes" : "no"));
                refreshAxes();
                });*/

        // See http://bl.ocks.org/eesur/9910343
        //var textbox_form = details_div.append("form");
            //.attr("name", "betaform")
            //.attr("onSubmit", "return handleTextBoxSubmit()");
        /*var beta_label = details_div.append("label")
            .html("<em>&beta;</em>");
        var beta_input = beta_label.append("input")
            .attr("id", "betavalue")
            .attr("type", "number")
            .attr("value", beta.toFixed(0))
            .attr("min", "1")
            .attr("maxlength", "5")
            .attr("step", "1")
            .on("change", function() {
                //d3.event.preventDefault();
                beta = document.getElementById("betavalue").value;
                console.log("new value of beta = " + beta);
                //console.log("npoints = " + npoints);
                //destroyExistingPoints();
                //var pointdata = simPoints(npoints);
                //drawPoints(pointdata, v);
                //rotateBy(0.0);
            });*/
        /*textbox_form.on("submit", function() {
                d3.event.preventDefault();
                beta = document.getElementById("betavalue").value;
                console.log("new value of beta = " + beta);
                console.log("npoints = " + npoints);
                //destroyExistingPoints();
                //var pointdata = simPoints(npoints);
                //drawPoints(pointdata, v);
                //rotateBy(0.0);
            });*/

        // Create buttons that can be used to regenerate new eigenvectors or random vectors
        //details_div.append("button")
        //    .attr("id", "eigenvectorbutton")
        //    .text("Eigenvectors")
        //    .on("click", newEigenvectors);
        //details_div.append("button")
        //    .attr("id", "randomvectorbutton")
        //    .text("Random Vectors")
        //    .on("click", newRandomVectors);
        }

    //####################################################################################
    //####################################################################################
    //####################################################################################

    // Flags determining what will be shown
    var show_bounding_box               = false;
    var show_axes                       = false;
    var show_tetrahedron                = true;
    var show_tetrahedron_vertices       = false;
    var show_tetrahedron_vertex_labels  = true;
    var show_points                     = true;

    // Create a pseudorandom number generator
    //var lot = new Random(12347);
    var lot = new Random();

    // Parameters of Dirichlet(beta, beta, beta, beta)
    var beta_choices = [1,2,5,10,100,1000];
    var beta_index = 0; // index of value selected at start
    var beta = [beta_choices[beta_index],beta_choices[beta_index],beta_choices[beta_index],beta_choices[beta_index]];

    // If true, changing any parameter changes all of them
    var symmetric_dirichlet = true;

    // Number of points to generate
    var npoints_choices = [1,10,100,1000];
    var npoints_index = 2; // index of value selected at start
    var npoints = npoints_choices[npoints_index];

    // Define the tetrahedron
    var tetrahedron = defineTetrahedron(1.5);

    // Dimensions of svg graphic
    var w = 600;  // svg width
    var h = w;    // svg height
    var lm = 1; // left margin
    var rm = lm;  // right margin
    var tm = lm;  // top margin
    var bm = lm;  // bottom margin
    var plotwh = w - lm - rm; // plot width (equal to plot height)
    var halfwh = plotwh/2;    // half plot width (equal to half plot height)

    // miscellaneous
    var font_size = 12;
    var vertex_label_font_size = 20;
    var circle_radius = 5;
    var point_label_offset_x = 10;
    var point_label_offset_y = 10;

    var xscale = d3.scaleLinear()
        .domain([-1,1])
        .range([lm,w-rm]);

    var yscale = d3.scaleLinear()
        .domain([-1,1])
        .range([tm,h-bm]);

    // Angles defining viewport
    // rotation_around_x = pi/2 only: view from negative end of y axis onto x-z plane
    // rotation_around_y = pi/2 only: view from negative end of x axis onto y-z plane
    // rotation_around_z = pi/2 only: view from positive end of z axis onto x-y plane
    var rotation_around_x = 0.7*Math.PI/2;  // rotation in yz plane (i.e. spin around x axis)
    var rotation_around_y = 0.0*Math.PI/2;  // rotation in xz plane (i.e. spin around y axis)
    var rotation_around_z = 0.05*Math.PI/2; // rotation in xy plane (i.e. spin around z axis)

    // Create d33d viewport
    var v = new Viewport([rotation_around_x, rotation_around_y, rotation_around_z]);

    // Latch onto container div already created above
    var container_div = d3.select("div.container").attr("height", h+20);

    // Create two divs inside container: one for the plot and the other for user feedback
    var graphics_div = createPlotPanel();
    var details_div  = createDetailsPanel();

</script>

<br/>

## Acknowledgements

This applet makes use of [d3js](https://d3js.org/) and Erik Bernhardsson's very useful [D3-3D code](https://github.com/erikbern/d3-3d).
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
