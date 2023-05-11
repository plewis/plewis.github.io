---
layout: applet
title: Genetic Drift
permalink: /applets/drift/
---

## Genetic drift 

Simulates genetic drift in 5 populations for 100 generations (corresponding to Fig. 7.15a-c, p. 247, in Herron and Freeman textbook). The horizontal (x) axis is the relative frequency of the focal allele: 0.0 at far left, 1.0 at far right. 

Keys that can be used:
* **S** repeats the simulation (result will be different each time)
* **Shift-Up-Arrow** increases effective population size (Ne)
* **Shift-Down-Arrow** decreases effective population size (Ne)
* **Right-Arrow** increases the starting allele frequency (p)
* **Left-Arrow** decreases the starting allele frequency (p)

<div id="arbitrary"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 22-Feb-2021

    // width and height of svg
    let w = 840;
    let h = 670;
    let lm = 20;
    let rm = 20;
    let tm = 50;
    let bm = 20;

    let slow_way = false;

    let tick      = 0;
    let ngen      = 100;
    let debugstop = null;
    let yincr     = 1/ngen;   // amount traveled in y-axis over one time unit

    let npops = 8;
    let Ne     = 10000; 
    let p0     = 0.5;

    let iterating = false;
    let iteration_milisecs = 5;

    let ystart = 1.0;
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

    function CenterTextInRect(text_element, x, y, w, h) {
        // center text_element horizontally
        text_element.attr("text-anchor", "middle");
        text_element.attr("x", x + w/2);

        // center text_element vertically
        text_element.attr("y", 0);
        var bb = text_element.node().getBBox();
        var descent = bb.height + bb.y;
        text_element.attr("y", y + h/2 + bb.height/2 - descent);
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

    function increasePopulationSize() {
        if (Ne < 10) {
            Ne = Ne + 1;
        }
        else if (Ne < 100) {
            Ne = Ne + 10;
        }
        else if (Ne < 1000) {
            Ne = Ne + 100;
        }
        else if (Ne < 10000) {
            Ne = Ne + 1000;
        }
        else if (Ne < 100000) {
            Ne = Ne + 10000;
        }
        else {
            Ne = Ne + 100000;
        }
        if (Ne > 1000000)
            Ne = 1000000;
    }

    function decreasePopulationSize() {
        if (Ne <= 10) {
            Ne = Ne - 1;
        }
        else if (Ne <= 100) {
            Ne = Ne - 10;
        }
        else if (Ne <= 1000) {
            Ne = Ne - 100;
        }
        else if (Ne <= 10000) {
            Ne = Ne - 1000;
        }
        else if (Ne <= 100000) {
            Ne = Ne - 10000;
        }
        else {
            Ne = Ne - 100000;
        }
        if (Ne <= 1)
            Ne = 1;
    }

    function increaseStartingFrequency() {
        if (p0 < 0.1 || p0 >= 0.9) {
            // snap p0 to nearest hundredth
            p0 = p0 + 0.01;
            p0 = Math.round(100*p0)/100;
        }
        else {
            // snap shape to nearest tenth
            p0 = p0 + 0.1;
            p0 = Math.round(10*p0)/10;
        }
        if (p0 >= 0.99)
            p0 = 0.99;
    }

    function decreaseStartingFrequency() {
        if (p0 <= 0.1 || p0 > 0.9) {
            // snap p0 to nearest hundredth
            p0 = p0 - 0.01;
            p0 = Math.round(100*p0)/100;
        }
        else {
            // snap p0 to nearest tenth
            p0 = p0 - 0.1;
            p0 = Math.round(10*p0)/10;
        }
        if (p0 <= 0.01)
            p0 = 0.01;
    }

    function refreshTitle() {
        plot_svg.select("text#title")
            .text("Genetic Drift (starting frequency = " + p0.toFixed(2) + ", Ne = " + Ne + ")");
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
            .attr("stroke", function(d) {return color(d.pop % 20);});
            //.attr("stroke", function(d) {return earthcolor(d.pop % 12);});
    }

    function resetTrace() {
        console.log("resetting traces");
        tick = 0;
        steps = [];
        let n1 = Math.round(2*Ne*p0);
        let n0 = 2*Ne - n1;
        plot_svg.selectAll("line.trace").remove();
        for (let i = 0; i < npops; i++) {
            let xstart = p0;
            var genes = [];
            for (let j = 0; j < n1; j++) {
                genes.push(1);
            }
            for (let j = n1; j < 2*Ne; j++) {
                genes.push(0);
            }
            if (slow_way)
                steps.push([{'x0':xstart, 'x':xstart, 'y0':ystart, 'y':ystart, 'pop':i, 'genes':genes}]);
            else
                steps.push([{'x0':xstart, 'x':xstart, 'y0':ystart, 'y':ystart, 'pop':i}]);
            refreshTrace(i);
        }
    }

    function checkTimesUp() {
        if (tick == ngen || (debugstop && tick == debugstop)) {
            iterating = false;
        }
    }

    function nextStep() {
        for (let i = 0; i < npops; i++) {
            let s = steps[i];
            let latest_generation = s.length - 1;
            let p = s[latest_generation];

            let ynew = p.y - yincr;
            if (slow_way) {
                // draw new generation by random sampling previous generation                    
                let xsum = 0.0;
                let newgenes = [];
                for (let j = 0; j < 2*Ne; j++) {
                    let u = lot.uniform(0,1);
                    let k = Math.floor(u*2*Ne);
                    let g = p.genes[k];
                    xsum += g;
                    newgenes.push(g);
                }
                let xnew = xsum/(2.0*Ne);
                steps[i].push({'x0':p.x, 'x':xnew, 'y0':p.y, 'y':ynew, 'pop':i, 'genes':newgenes});
            }
            else {
                // draw new allele frequency using normal deviate with appropriate mean and standard deviation
                if (p.x == 0.0 || p.x == 1.0)
                    steps[i].push({'x0':p.x, 'x':p.x, 'y0':p.y, 'y':ynew, 'pop':i});
                else {
                    // If K is binomial with parameter p and sample size n,
                    // Var(K) = n p (1-p)
                    // Relative frequency = K/n, so
                    // Var(K/n) = (1/n^2) Var(K) = n p (1-p) / n^2 = p(1-p)/n
                    // In our case, n = 2 Ne, so variance = p(1-p)/(2 Ne)
                    let mu = p.x;
                    let sd = Math.sqrt(p.x*(1.0 - p.x)/(2*Ne));
                    let xnew = lot.normal(mu, sd);
                    if (xnew <= 0.0)
                        xnew = 0.0;
                    else if (xnew >= 1.0)
                        xnew = 1.0;
                    steps[i].push({'x0':p.x, 'x':xnew, 'y0':p.y, 'y':ynew, 'pop':i});
                    //if (i == 0) {
                    //    console.log('i = ' + i + ' | y = ' + ynew);
                    //}
                }
            }
        
            refreshTrace(i);
        }
        tick++;
        checkTimesUp();
    }

    function reset() {
        if (iterating) {
            iterating = false;
            resetTrace();                    
        }
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
            increasePopulationSize();
            refreshTitle();
            reset();
        }
        else if (d3.event.keyCode == 40) {
            // 40 is the "downarrow" key
            decreasePopulationSize();
            refreshTitle();
            reset();
        }
        else if (d3.event.keyCode == 37) {
            // 37 is the "leftarrow" key
            decreaseStartingFrequency();
            refreshTitle();
            reset();
        }
        else if (d3.event.keyCode == 39) {
            // 39 is the "rightarrow" key
            increaseStartingFrequency();
            refreshTitle();
            reset();
        }
    }
    d3.select("body")
        .on("keydown", keyDown);
</script>

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library. 
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
