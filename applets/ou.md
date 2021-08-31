---
layout: applet
title: Ornstein-Uhlenbeck Model
permalink: /applets/ou/
---

## Ornstein-Uhlenbeck vs. Brownian motion model

This applet shows 5 independent Brownian motion (BM) or Ornstein-Uhlenbeck (OU) simulations. A trait evolving by BM performs a random walk independently for each of the two lineages that descend from the starting point. The variance (i.e. uncertainty) of the difference between the two trait values increases linearly with time. A trait evolving by OU tends to not stray far from the optimum (vertical dashed line). Theta determines the strength of this attraction.

Press S to simulate again, T to toggle between OU and BM, up/down arrow to change variance (hold down Shift key to prevent scrolling), left/right arrow to change OU strength, and [ or ] to change offset of OU mean from the starting point.

<div id="arbitrary"></div>
<script type="text/javascript">
    // The MIT License (MIT)
    //
    // Copyright (c) 2020 Paul O. Lewis
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
    // written by Paul O. Lewis 10-Apr-2020

    // width and height of svg
    let w = 840;
    let h = 670;
    let lm = 20;
    let rm = 20;
    let tm = 50;
    let bm = 20;
    
    let tick = 0;
    let nticks = 200;       // number of time units to travel from bottom to top                        
    let debugstop = null;
    let yincr = 1/nticks;   // amount traveled in y-axis over one time unit
    let npairs = 5;

    let brownian = false;
    
    // Brownian motion 
    let bmsd   = 5;        // s.d. = 5 pixels

    // Ornstein-Uhlenbeck
    let ousd   = 5;        // s.d. = 5 pixels
    let offset = 0.0;
    let theta  = 0.1;
    let oumufactor = Math.exp(-theta);
    let ousdfactor = Math.sqrt((1 - Math.exp(-2*theta))/(2*theta));
    
    let iterating = false;
    let iteration_milisecs = 5;
    
    let ystart = 0.0;
    let steps = [];
    let lot = new Random();

    // Select DIV element already created (see above) to hold SVG
    let plot_div = d3.select("div#arbitrary");

    // Create SVG element
    let plot_svg = plot_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create rect outlining entire area of SVG
    plot_svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "black");
        
    let title = plot_svg.append("text")
        .attr("id", "title")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "16")
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("");
        
    function increaseTheta() {
        if (theta <= 0.1) {
            // snap theta to nearest hundredth
            theta = theta + 0.01;
            theta = Math.round(100*theta)/100;
        }
        else {
            // snap shape to nearest tenth
            theta = theta + 0.1;
            theta = Math.round(10*theta)/10;
        }
        oumufactor = Math.exp(-theta);
        ousdfactor = Math.sqrt((1 - Math.exp(-2*theta))/(2*theta));
    }
        
    function decreaseTheta() {
        if (theta <= 0.1) {
            // snap theta to nearest hundredth
            theta = theta - 0.01;
            theta = Math.round(100*theta)/100;
        }
        else {
            // snap theta to nearest tenth
            theta = theta - 0.1;
            theta = Math.round(10*theta)/10;
        }
        if (theta <= 0.01)
            theta = 0.01;
        oumufactor = Math.exp(-theta);
        ousdfactor = Math.sqrt((1 - Math.exp(-2*theta))/(2*theta));
    }
        
    function CenterTextAroundPoint(text_element, x, y) {
        // center text_element horizontally
        text_element.attr("text-anchor", "middle");
        text_element.attr("x", x);

        // center text_element vertically
        text_element.attr("y", 0);
        var bb = text_element.node().getBBox();
        var descent = bb.height + bb.y;
        text_element.attr("y", y + bb.height/2 - descent);
        }

    function refreshTitle() {
        if (brownian) {
            plot_svg.select("text#title")
                .text("Brownian Motion (sd = " + bmsd + ")");
        }
        else {
            plot_svg.select("text#title")
                .text("Ornstein-Uhlenbeck (offset = " + offset.toFixed(2) + ", theta = " + theta.toFixed(2) + ", sd = " + ousd + ")");
        }
        CenterTextAroundPoint(title, w/2, tm/2);
    }
    refreshTitle();
    
    var xscale = d3.scaleLinear()
        .domain([0,1])
        .range([lm,w-rm]);

    var yscale = d3.scaleLinear()
        .domain([0,1])
        .range([h-bm,tm]);
        
    // Earth tones based on real clay pigments
    // From http://www.boomerinas.com/wp-content/uploads/2015/08/real-earth-tones-clay-pigment.jpg
    let earthcolor = d3.scaleOrdinal()
        .domain([0,11])
        .range([
            d3.rgb("#8B230D"),
            d3.rgb('#B0612A'),
            d3.rgb('#462D24'),
            d3.rgb('#84A18B'),
            d3.rgb('#E9BC5E'),
            d3.rgb('#66332C'),
            d3.rgb('#887D59'),
            d3.rgb('#D34F16'),
            d3.rgb('#976643'),
            d3.rgb('#D68D3D'),
            d3.rgb('#8C4B3A'),
            d3.rgb('#A39C90')
            ]);

    // color(0) returns first predefined color of 20 total in schemeCategory20
    let color = d3.scaleOrdinal()
        .range(d3.schemeCategory20);

    function refreshTrace(i) {
        //console.log("refreshing trace " + i);
        plot_svg.selectAll("line.lineage" + i)
            .data(steps[i])
            .enter()
            .append("line")
            .attr("class", "lineage" + i + " trace")
            .attr("x1", function(d) {return xscale(d.x0);})
            .attr("x2", function(d) {return xscale(d.x);})
            .attr("y1", function(d) {return yscale(d.y0);})
            .attr("y2", function(d) {return yscale(d.y);})
            .attr("stroke-width", "2")
            .attr("stroke", function(d) {return color(d.pair % 20);});
            //.attr("stroke", function(d) {return earthcolor(d.pair % 12);});
    }
    
    function resetTrace() {
        tick = 0;
        steps = [];
        plot_svg.selectAll("circle.start").remove();
        plot_svg.selectAll("line.mean").remove();
        plot_svg.selectAll("line.trace").remove();
        for (let i = 0; i < npairs; i++) {
            let xstart = (i+1)/(npairs + 1);
            //console.log("i = " + i + ", xstart = " + xstart)
            
            steps.push([{'x0':xstart, 'x':xstart, 'y0':ystart, 'y':ystart, 'pair':i}]);
            steps.push([{'x0':xstart, 'x':xstart, 'y0':ystart, 'y':ystart, 'pair':i}]);
            
            plot_svg.append("line")
                .attr("class", "mean")
                .attr("x1", xscale(xstart + (brownian ? 0 : offset)))
                .attr("y1", yscale(0))
                .attr("x2", xscale(xstart + (brownian ? 0 : offset)))
                .attr("y2", yscale(1))
                .attr("stroke", "white")
                .attr("stroke-width", "1")
                .attr("stroke-dasharray", "5,5,5");
            
            plot_svg.append("circle")
                .attr("class", "start")
                .attr("cx", xscale(xstart))
                .attr("cy", yscale(ystart))
                .attr("r", "3")
                .attr("fill", "red");
            
            refreshTrace(2*i+0);
            refreshTrace(2*i+1);
        }
    }
    
    function checkTimesUp() {
        if (tick == nticks || (debugstop && tick == debugstop)) {
            iterating = false;
        }
    }
    
    function jigger(x0, mu) {
        let xnew = 0.0;
        if (brownian) {
            // bmsd is in pixels, but dx needs to be in (0,1)            
            xnew = x0 + lot.normal(0,bmsd/(w-lm-rm));   
        }
        else {
            // Ornstein-Uhlenbeck
            // https://planetmath.org/ornsteinuhlenbeckprocess                    
            let target = mu + offset;
            xnew = lot.normal(target + (x0 - target)*oumufactor, ousd*ousdfactor/(w-lm-rm));   
        }
        return xnew;
    }
    
    function nextStep() {
        for (let i = 0; i < npairs; i++) {
            let mu = (i+1)/(npairs + 1);

            let s = steps[2*i+0];
            let last = s.length - 1;
            let p = s[last];
            let xnew = jigger(p.x,mu)
            let ynew = p.y + yincr;
            steps[2*i+0].push({'x0':p.x, 'x':xnew, 'y0':p.y, 'y':ynew, 'pair':i});
            refreshTrace(2*i+0);

            s = steps[2*i+1];
            last = s.length - 1;
            p = s[last];
            xnew = jigger(p.x,mu)
            ynew = p.y + yincr;
            steps[2*i+1].push({'x0':p.x, 'x':xnew, 'y0':p.y, 'y':ynew, 'pair':i});
            refreshTrace(2*i+1);
        }
        tick++;
        //console.log("tick = " + tick);
        checkTimesUp();
    }
    
    function startOrStop() {
        if (iterating)
            iterating = false;
        else {
            iterating = true;
            resetTrace();                    
            var timer = setInterval(function() {
                if (iterating)
                    nextStep();
                else
                    clearInterval(timer);
            }, iteration_milisecs);
        }
    }
    startOrStop();

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
        console.log("key was pressed: " + d3.event.keyCode);
        if (d3.event.keyCode == 83) {
            // 83 is the "s" key
            startOrStop();
        }
        else if (d3.event.keyCode == 38) {
            // 38 is the "uparrow" key
            if (brownian)
                bmsd++;
            else
                ousd++;
            refreshTitle();
        }
        else if (d3.event.keyCode == 40) {
            // 40 is the "downarrow" key
            if (brownian) {
                bmsd--;
                if (bmsd < 1)
                    bmsd = 1;
            }
            else {
                ousd--;
                if (ousd < 1)
                    ousd = 1;
            }
            refreshTitle();
        }
        else if (d3.event.keyCode == 37) {
            // 37 is the "leftarrow" key
            decreaseTheta();
            refreshTitle();
        }
        else if (d3.event.keyCode == 39) {
            // 39 is the "rightarrow" key
            increaseTheta();
            refreshTitle();
        }
        else if (d3.event.keyCode == 219) {
            // 219 is the "[" key
            offset -= 0.01;
            if (Math.abs(offset) < .005)
                offset = 0.0;
            refreshTitle();
        }
        else if (d3.event.keyCode == 221) {
            // 221 is the "]" key
            offset += 0.01;
            if (Math.abs(offset) < .005)
                offset = 0.0;
            refreshTitle();
        }
        else if (d3.event.keyCode == 66) {
            // 66 is the "b" key
            if (!brownian) {
                brownian = true;
                refreshTitle();
                startOrStop();
            }
        }
        else if (d3.event.keyCode == 79) {
            // 79 is the "o" key
            if (brownian) {
                brownian = false;
                refreshTitle();
                startOrStop();
            }
        }
        else if (d3.event.keyCode == 84) {
            // 84 is the "t" key
            brownian = (brownian ? false : true);
            refreshTitle();
            startOrStop();
        }
    }
    d3.select("body")
        .on("keydown", keyDown);

</script>

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
