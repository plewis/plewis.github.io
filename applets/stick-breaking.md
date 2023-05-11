---
layout: applet
title: Stick Breaking Process
permalink: /applets/stickbreaking/
---

## Stick Breaking Process and Dirichlet Process Priors

The stick-breaking process illustrated here provides a prior distribution known as the Dirichlet
Process Prior (DPP). The lavender rectangle below represents an unbroken stick. Press the "b"
key to break the stick at a random point. Pressing "b" again breaks the stick randomly again, but only 
in the rightmost section. This process could technically continue forever, as there will always 
be some interval representing the rightmost section, but once you have no detectable remainder,
press the "t" key to throw darts at the stick. This represents one draw from the DPP. 
The expected number of occupied segments is shown below as "E" and the observed number of occupied
segments is shown as "O". 

As a phylogenetic example, the darts might represent sites and the segments substitution
rate categories. The expected number of categories is determined by the parameter alpha (the
value of which you can change; see the key at the bottom of the page): higher alpha means more categories.

<div id="canvas"></div>
<script type="text/javascript">
    // Written by Paul O. Lewis 21-Mar-2020

    // width and height of svg
    var w = 600;
    var h = 220;
    var bm = 20;

    var alpha = 1.0;
    var alphamin = 0.1;
    
    var ndarts = 100;
    var ndartsmin = 10;
    var ndartsmax = 100;
    var dart_radius = 3;
    var num_occupied = 0;
    var somebad = false;
    
    var sticks = [];
    var darts = [];
    var Ek = [];
    var remainder = 1.0;
    var remainder_cutoff = 0.0001;
    
    var lot = new Random();
    
    var xscale = d3.scaleLinear()
        .domain([0,1])
        .range([0,w]);

    var yscale = d3.scaleLinear()
        .domain([0,1])
        .range([h-bm,0]);

    // Select DIV element already created (see above) to hold SVG
    var plot_div = d3.select("div#canvas");

    // Create SVG element
    var plot_svg = plot_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create rect outlining entire area of SVG
    plot_svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h-bm)
        .attr("fill", "lavender");
        
    // Create text showing current value of alpha
    plot_svg.append("text")
        .attr("id", "alpha")
        .attr("x", w/2)
        .attr("y", h - bm + 16)
        .attr("font-family", "Verdana")
        .attr("font-size", "16px")
        .style("text-anchor", "middle")
        .text("");     
        
    function precomputeExpectedNumberOccupiedTables() {
        // Compute expected number of occupied tables Ek
        Ek = [];
        var cum = 0.0;
        Ek.push(0.0);
        for (let i = 0; i < 10*ndartsmax; i++) {
            cum += alpha/(alpha + i);
            Ek.push(cum);
        }                
    }
    precomputeExpectedNumberOccupiedTables();
        
    function showStatus() {
        //console.log("alpha = " + alpha);
        if (somebad) {
            plot_svg.select("text#alpha")
                .text("alpha = " + alpha.toFixed(1) + " | n = " + ndarts + " | E = " + Ek[ndarts].toFixed(1) + " | O = NA (break more sticks)");            
        }
        else {
            plot_svg.select("text#alpha")
                .text("alpha = " + alpha.toFixed(1) + " | n = " + ndarts + " | E = " + Ek[ndarts].toFixed(1) + " | O = " + num_occupied);            
        }
    }       
    showStatus();
        
    function reset() {
        // Delete all existing sticks
        plot_svg.selectAll("rect.stick").remove();
        sticks = [];
        
        // Delete all existing darts
        plot_svg.selectAll("circle.dart").remove();
        darts = [];

        num_occupied = 0;
        somebad = false;
        remainder = 1.0;
        
        precomputeExpectedNumberOccupiedTables();
        showStatus();
    }
    
    function breakStick() {
        // Draw Beta(1,alpha) random variable
        let x = lot.gamma(1, 1);
        let y = lot.gamma(alpha, 1);
        let s = x/(x + y);
        let stickx = 1.0 - remainder; 
        let stickw = s*remainder;
        let r = Math.floor(lot.uniform(0,255));
        let g = Math.floor(lot.uniform(0,255));
        let b = Math.floor(lot.uniform(0,255));
        var stick = {"x":stickx, "width":stickw, "color":d3.color("rgba(" + r + ", " + g + ", " + b + ", 1)")};

        // console.log("~~~~~~~~~~~~~~~~~~~~~");
        // console.log("alpha     = " + alpha);
        // console.log("s         = " + s);
        // console.log("remainder = " + remainder);
        // console.log("stickx    = " + stickx);
        // console.log("stickw    = " + stickw);

        sticks.push(stick);
        plot_svg.selectAll("rect.stick")   
            .data(sticks)
            .enter()
            .append("rect")
            .attr("class", "stick")
            .attr("x", function(d) {return xscale(d.x);})
            .attr("y", 0)
            .attr("width", function(d) {return xscale(d.width);})
            .attr("height", h-bm)
            .attr("fill", function(d) {return d.color;})
            .attr("stroke", "white");
        remainder -= stickw;
    }
    
    function partition() {
        while (remainder > remainder_cutoff) {
            breakStick();
        }
    }

    function throwDarts() {
        plot_svg.selectAll("circle.dart").remove();
        
        // Create one bin for every stick
        bins = [];
        let cum = 0.0;
        for (let i = 0; i < sticks.length; i++) {
            cum += sticks[i].width;
            bins.push(0);
        }
        
        somebad = false;
        darts = [];
        for (let i = 0; i < ndarts; i++) {
            let cx = lot.uniform(0,1);
            let cy = lot.uniform(0,1);
            let isbad = cx > cum ? true : false;

            let dartcolor = "red";
            if (isbad) {
                somebad = true;
            }
            else {
                let scum = 0.0;
                for (let s = 0; s < sticks.length; s++) {
                    scum += sticks[s].width;
                    if (cx < scum) {
                        bins[s] += 1;
                        dartcolor = sticks[s].color;
                        break;
                    }
                }
            }
            darts.push({"cx":cx, "cy":cy, "color":dartcolor});
        }
        
        // Determine how many bins have darts in them
        num_occupied = 0;
        for (let i = 0; i < bins.length; i++) {
            if (bins[i] > 0)
                num_occupied += 1;
        }
        showStatus();
        
        plot_svg.selectAll("circle.dart")   
            .data(darts)
            .enter()
            .append("circle")
            .attr("class", "dart")
            .attr("cx", function(d) {return xscale(d.cx);})
            .attr("cy", function(d) {return yscale(d.cy);})
            .attr("r", dart_radius)
            .attr("fill", function(d) {return d.color;})
            .attr("stroke", "white");
    }
    
    function modifyAlpha(incr) {
        // alpha  10*alpha     a   incr = +1     incr = -1 
        // -----------------------------------------------
        //     2        20    20   30/10 = 3   10/10 =   1
        //  1.01      10.1    10   20/10 = 2    9/10 = 0.9
        //     1        10    10   20/10 = 2    9/10 = 0.9
        //  0.99       9.9    10   20/10 = 2    9/10 = 0.9
        //   0.9         9     9   10/10 = 1    8/10 = 0.8
        // -----------------------------------------------
        var a = Math.round(10*alpha);
        if (incr > 0) {
            a += (a < 10 ? 1 : 10);
        }
        else {
            a -= (a > 10 ? 10 : 1);
        }
        //console.log("a = " + a);
        alpha = a/10;
        if (alpha < alphamin)
            alpha = alphamin;
        reset();
    }

    function modifySampleSize(increment) {
        ndarts += increment;
        if (ndarts < ndartsmin)
            ndarts = ndartsmin;
        if (ndarts > ndartsmax)
            ndarts = ndartsmax;
        reset();
    }

    // Listen and react to keystrokes
    // key      code  key code  key code  key code  key code
    // -------------  --------  --------  --------  --------
    // tab         9    0   48    ~  192    a   65    n   78
    // return     13    1   49    ;  186    b   66    o   79
    // shift      16    2   50    =  187    c   67    p   80
    // control    17    3   51    ,  188    d   68    q   81
    // option     18    4   52    -  189    e   69    r   82
    // command    91    5   53    .  190    f   70    s   83
    // space      32    6   54    /  191    g   71    t   84
    // leftarrow  37    7   55    \  220    h   72    u   85
    // uparrow    38    8   56    [  219    i   73    v   86
    // rightarrow 39    9   57    ]  221    j   74    w   87
    // downarrow  40              '  222    k   75    x   88
    //                                      l   76    y   89
    //                                      m   77    z   90
    function keyDown() {
        //console.log("key was pressed: " + d3.event.keyCode);
        if (d3.event.keyCode == 84 || d3.event.keyCode == 68) {
            // 68 is the "d" key
            // 84 is the "t" key
            throwDarts();
        }
        else if (d3.event.keyCode == 66) {
            // 66 is the "b" key
            breakStick();
        }
        else if (d3.event.keyCode == 82) {
            // 82 is the "r" key
            reset();
        }
        else if (d3.event.keyCode == 38) {
            // 38 is the "up arrow" key
            modifyAlpha(1);
        }
        else if (d3.event.keyCode == 40) {
            // 40 is the "down arrow" key
            modifyAlpha(-1);
        }
        else if (d3.event.keyCode == 37) {
            // 37 is the "left arrow" key
            modifySampleSize(-10);
        }
        else if (d3.event.keyCode == 39) {
            // 39 is the "right arrow" key
            modifySampleSize(10);
        }
        else if (d3.event.keyCode == 80) {
            // 80 is the "p" key
            partition();
        }
    }
    d3.select("body")
        .on("keydown", keyDown);
</script>

## Details

Notes:
* b key breaks off fraction from the remainder (lavender) using a draw from Beta(1,alpha)
* p key mimics pressing the b key until the remainder is tiny (0.001)
* r key resets everything
* t key throws darts and computes the O statistic
* shift-up/shift-down arrow keys increase/decrease alpha (but smallest value is 0.1)
* shift-right/shift-left arrow keys increase/decrease the number of darts (within the range 10-100)
* E is the expected number of colored rectangles hit by at least one of the n darts
* O is the observed number of colored rectangles hit by at least one dart

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library. 
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
