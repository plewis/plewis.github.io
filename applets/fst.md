---
layout: applet
title: Fst and Genetic Drift in Small Populations
permalink: /applets/fst/
---

## Fst and genetic drift in small populations

Key to genotype colors:
* AA (yellow)
* Aa (orange)
* aa (red)

{% comment %}
no longer works
Key to genotype colors:
* ![](https://via.placeholder.com/20.png/FEFF0B/000000?text=+) AA (yellow)
* ![](https://via.placeholder.com/20.png/F08D08/000000?text=+) Aa (orange)
* ![](https://via.placeholder.com/20.png/FF0000/FFFFFF?text=+) aa (red)
{% endcomment %}

The frequency of allele **A** used at the start is _p_ = 0.5 for all populations. Refresh your browser to start over.
Scroll down for more details.

<div id="arbitrary"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 16-April-2019
    
    // Colors
    var genotype_color = ["yellow", "orange", "red"];
    var genotype_stroke = "gray";
    var fstbar_color = "gold";
    var freqplot_color = "blue";
    var line_color = "black";
    var background_color = "floralwhite";

    // width and height of population grid
    var grid_w = 600;
    var grid_h = 600;

    // height of frequency plot area at the top
    var freqplot_h = 100;
    var freqplot_bars = 11;
    var freqplot_data = [];
    for (let b = 0; b < freqplot_bars; b++) {
        freqplot_data.push({"bin":b, "freq":0});
    }

    // height of Fst bar between freqplot and population grid
    var fstbar_h = 30;
    var Fst = 0.0;

    // height of status text area below population grid
    var status_h = 50;
    
    var ngens = 0;

    // There poprows x popcols isolated subpopulations
    var poprows = 4;
    var popcols = 4;
    var npops = poprows*popcols;

    // There indivrows x indivcols diploid individuals per subpopulation
    var tinypop = false;
    var indivrows = 4;
    var indivcols = 4;
    var indiv_data = [];
    
    var popbounds_hidden = false;

    // Dimensions of cells in which individuals are shown
    var wcell = grid_w/(popcols*indivcols);
    var hcell = grid_h/(poprows*indivrows);
    var cell_avg_diam = (wcell + hcell)/2;

    // Radius of circle representing a single individual
    var rindiv = 0.3*cell_avg_diam;

    // Determines amount of Gaussian jigger to impart to each individual's position
    var jigger_stdev = 0.3*cell_avg_diam;

    // scale for frequency plot at top
    var pscale = d3.scaleBand(
        [0, freqplot_bars-1],
        [0, grid_w]);

    // Initialize frequency of A allele in all subpopulations
    var Ho = 0.0;
    var He = 0.5;
    var heterozygosity = [];
    var freqA = [];
    var pbar = 0.0;
    for (let i = 0; i < poprows; i++) {
        for (let j = 0; j < popcols; j++) {
            let tmp = {"i":i, "j":j, "freq":0.5};
            freqA.push(tmp);
            heterozygosity.push({"i":i, "j":j, "heterozygosity":0.5});
        }
    }
    
    function resetFreqPlotData() {
        for (let b = 0; b < freqplot_bars; b++) {
            freqplot_data[b].freq = 0;
        }
    }

    // Returns index into data vector of individual on row indivrow, column indivcol,
    // in the subpopulation at row poprow and column popcol. 
    function getDataIndex(poprow, popcol, indivrow, indivcol) {
        return poprow*popcols*indivrows*indivcols + popcol*indivrows*indivcols + indivrow*indivcols + indivcol;
    }

    // Randomly draw a genotype given frequencies of AA, Aa, and aa.
    function drawOneGenotype(pp, pq2, qq) {
        let u = Math.random();
        if (u < pp)
            return 0;
        else if (u < pp + pq2)
            return 1;
        else
            return 2;
    }

    function tallyFreq(f) {
        let bin = Math.floor(f*(freqplot_bars-1));
        freqplot_data[bin].freq++;
    }

    // Draw n genotypes for subpop at row i, column j
    // and recompute freqA for that subpop using the new genotypes
    function drawNGenotypes(i, j, n, initialize) {
        let k = i*popcols + j;
        let v = [];
        if (initialize) {
            let nindivs = indivrows*indivcols;
            let nAA = Math.floor(0.25*nindivs);
            let nAa = Math.floor(0.5*nindivs);
            let naa = Math.floor(0.25*nindivs);
            if (nAA + nAa + naa != nindivs) {
                console.log("ERROR: number of individuals in each population should be a multiple of 4");
            }
            for (let i = 0; i < nAA; i++) {
                v.push(0);
            }
            for (let i = 0; i < nAa; i++) {
                v.push(1);
            }
            for (let i = 0; i < naa; i++) {
                v.push(2);
            }
            let indx = i*popcols + j;
            freqA[indx].freq = 0.5;
            tallyFreq(0.5);
            heterozygosity[i*popcols + j].heterozygosity = 0.5;
        }
        else {
            let p = freqA[k].freq;
            let pp = p*p;
            let pq2 = 2.0*p*(1.0-p);
            let qq = 1.0 - pp - pq2;
            let pcount = 0;
            let qcount = 0;
            let hcount = 0;
            for (k = 0; k < n; k++) {
                let g = drawOneGenotype(pp, pq2, qq);
                v.push(g);
                if (g == 0) {
                    pcount++;
                    pcount++;
                    }
                else if (g == 1) {
                    pcount++;
                    qcount++;
                    hcount++;
                    }
                else {
                    qcount++;
                    qcount++;
                    }
            }
            let total_count = pcount + qcount;
            let indx = i*popcols + j;
            freqA[indx].freq = pcount/total_count;
            tallyFreq(freqA[indx].freq);
            heterozygosity[i*popcols + j].heterozygosity = hcount/n;
        }
        return v;
    }   

    function getCellX(popcol, indivcol) {
        return wcell*(popcol*indivcols + indivcol + 0.5);
    }       

    function getCellY(poprow, indivrow) {
        return freqplot_h + fstbar_h + hcell*(poprow*indivrows + indivrow + 0.5);
    }       

    function recalcFst() {
        let sumsq = 0.0;
        let sum = 0.0;
        let n = freqA.length;
        for (let i = 0; i < n; i++) {
            let x = freqA[i].freq;
            sum += x;
            sumsq += x*x;
        }
        let mean = sum/n;
        let variance = (sumsq - n*mean*mean)/n;
        
        // X = 1 with probability p
        // X = 0 with probability 1-p
        // E[X] = (0)(1-p) + (1)(p) = p
        // Var(X) = E[X^2] - (E[X])^2
        //        = (0^2)(1-p) + (1^2)(p) - p^2
        //        = p - p^2
        //        = p(1-p)
        let maxvar = mean*(1-mean);
        Fst = variance/maxvar;
    }

    function getStatusText() {
        return "g = " + ngens + ", pmean = " + pbar.toFixed(3) + ", Ho = " + Ho.toFixed(3) + ", He = " + He.toFixed(3) + ", Fst = " + Fst.toFixed(3);
    }

    // Data for individuals is stored as list of objects containing information about each individual
    function initializePops(start = false) {
        ngens = 0;
        indiv_data = [];
        Ho = 0.0;
        pbar = 0.0;
        resetFreqPlotData();
        for (let i = 0; i < poprows; i++) {
            for (let j = 0; j < popcols; j++) {
                let n = indivrows*indivcols;
                let v = drawNGenotypes(i, j, n, true);
                Ho += heterozygosity[i*popcols + j].heterozygosity;
                pbar += freqA[i*popcols + j].freq;
                for (let k = 0; k < indivrows; k++) {
                    for (let m = 0; m < indivcols; m++) {
                        let x = getCellX(j, m);
                        let y = getCellY(i, k);
                        indiv_data.push({"i":i, "j":j, "k":k, "m":m, "x":x, "y":y, "genotype":v[k*indivcols + m]});
                    }
                }
            }
        }
        Ho /= (poprows*popcols);
        pbar /= (poprows*popcols);
        He = 2.0*pbar*(1.0 - pbar);
        recalcFst();
        
        if (!start) {
            // update gold colored Fst bar
            d3.select("rect#fst")
                .attr("width", grid_w*Fst)
                .attr("fill", fstbar_color);  
                  
            // update blue frequency histogram
            d3.selectAll("rect.hist")
                .attr("x", function(d) {return d.bin*grid_w/freqplot_bars;})
                .attr("y", function(d) {return freqplot_h - d.freq*freqplot_h/npops;})
                .attr("height", function(d) {return d.freq*freqplot_h/npops;})
                .attr("fill", freqplot_color);

            // reset circles representing individuals
            plot_svg.selectAll("circle.indiv")
                .data(indiv_data)
                .enter()
                .append("circle")
                .attr("class", "indiv")
                .attr("cx", function(d) {return d.x;})
                .attr("cy", function(d) {return d.y;})
                .attr("r", rindiv)
                .attr("fill", function(d) {return genotype_color[d.genotype];})
                .attr("stroke", genotype_stroke);
                
            // refresh status bar text
            d3.select("text#status")
                .text(getStatusText())
        }
    }
    initializePops(true);

    function nextGeneration() {
        ngens++;
        resetFreqPlotData();
        Ho = 0.0;
        pbar = 0.0;
        for (let i = 0; i < poprows; i++) {
            for (let j = 0; j < popcols; j++) {
                let n = indivrows*indivcols;
                let v = drawNGenotypes(i, j, n, false);
                Ho += heterozygosity[i*popcols + j].heterozygosity;
                pbar += freqA[i*popcols + j].freq;
                for (let k = 0; k < indivrows; k++) {
                    for (let m = 0; m < indivcols; m++) {
                        let x = getCellX(j, m);
                        let y = getCellY(i, k);
                        let indiv = getDataIndex(i, j, k, m);
                        indiv_data[indiv].genotype = v[k*indivcols + m];
                    }
                }
            }
        }
        Ho /= (poprows*popcols);
        pbar /= (poprows*popcols);
        He = 2.0*pbar*(1.0 - pbar);
        recalcFst();

        // update plot
        d3.select("rect#fst")
            .attr("width", grid_w*Fst)
            .attr("fill", fstbar_color);
        d3.selectAll("rect.hist")
            .attr("x", function(d) {return d.bin*grid_w/freqplot_bars;})
            .attr("y", function(d) {return freqplot_h - d.freq*freqplot_h/npops;})
            .attr("height", function(d) {return d.freq*freqplot_h/npops;})
            .attr("fill", freqplot_color);
        d3.selectAll("circle.indiv")
            .attr("cx", function(d) {return d.x;})
            .attr("cy", function(d) {return d.y;})
            .attr("fill", function(d) {return genotype_color[d.genotype];});
        d3.select("text#status")
            .text(getStatusText())
        CenterTextInRect(status_text, 0, freqplot_h, grid_w, fstbar_h);
    }

    // Data for lines separating populations
    var line_data = [];
    for (let i = 0; i < poprows + 1; i++) {
        let x1 = 0;
        let x2 = grid_w;
        let y1 = freqplot_h + fstbar_h + (grid_h/poprows)*i;
        let y2 = freqplot_h + fstbar_h + (grid_h/poprows)*i;
        line_data.push({"x1":x1, "x2":x2, "y1":y1, "y2":y2});
    }
    for (let j = 0; j < popcols + 1; j++) {
        let x1 = (grid_w/popcols)*j;
        let x2 = (grid_w/popcols)*j;
        let y1 = freqplot_h + fstbar_h;
        let y2 = freqplot_h + fstbar_h + grid_h;
        line_data.push({"x1":x1, "x2":x2, "y1":y1, "y2":y2});
    }

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

    // Listen and react to keystrokes
    function keyDown() {
        console.log("key was pressed: " + d3.event.keyCode);
        if (d3.event.keyCode == 78) {
            // 78 is the "n" key
            nextGeneration();
        }
        else if (d3.event.keyCode == 72) {
            // 72 is the "h" key
            if (popbounds_hidden) {
                d3.selectAll("line.popbounds").style("visibility", "visible");
                popbounds_hidden = false;
            }
            else {
                d3.selectAll("line.popbounds").style("visibility", "hidden");
                popbounds_hidden = true;
            }
        }
        else if (d3.event.keyCode == 83) {
            // 83 is the "s" key
            if (tinypop) {
                tinypop = false;
                indivrows = 4;
                indivcols = 4;
            }
            else {
                tinypop = true;
                indivrows = 2;
                indivcols = 2;
            }
            
            wcell = grid_w/(popcols*indivcols);
            hcell = grid_h/(poprows*indivrows);
            cell_avg_diam = (wcell + hcell)/2;
            
            d3.selectAll("circle.indiv").remove();
            initializePops();
        }
    }
    d3.select("body")
        .on("keydown", keyDown);

    // Select DIV element already created (see above) to hold SVG
    var plot_div = d3.select("div#arbitrary");

    // Create SVG element
    var plot_svg = plot_div.append("svg")
        .attr("width", grid_w)
        .attr("height", grid_h + freqplot_h + fstbar_h);

    // Create rect outlining entire area of SVG
    plot_svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", grid_w)
        .attr("height", grid_h + freqplot_h + fstbar_h)
        .attr("fill", background_color);

    // Create rectangle representing Fst bar
    plot_svg.append("rect")
        .attr("id", "fst")
        .attr("x", 0)
        .attr("y", freqplot_h)
        .attr("width", 0)
        .attr("height", fstbar_h)
        .attr("fill", fstbar_color)
        .attr("stroke", "none");

    // Create rectangles representing freqplot bars
    plot_svg.selectAll("rect.hist")
        .data(freqplot_data)
        .enter()
        .append("rect")
        .attr("class", "hist")
        .attr("x", function(d) {return d.bin*grid_w/freqplot_bars;})
        .attr("y", function(d) {return freqplot_h - d.freq*freqplot_h/npops;})
        .attr("width", grid_w/freqplot_bars)
        .attr("height", function(d) {return d.freq*freqplot_h/npops;})
        .attr("fill", freqplot_color)
        .attr("stroke", "none");

    // Create circles representing individuals
    plot_svg.selectAll("circle.indiv")
        .data(indiv_data)
        .enter()
        .append("circle")
        .attr("class", "indiv")
        .attr("cx", function(d) {return d.x;})
        .attr("cy", function(d) {return d.y;})
        .attr("r", rindiv)
        .attr("fill", function(d) {return genotype_color[d.genotype];})
        .attr("stroke", genotype_stroke);

    // Create lines separating populations
    plot_svg.selectAll("line.popbounds")
        .data(line_data)
        .enter()
        .append("line")
        .attr("class", "popbounds")
        .attr("x1", function(d) {return d.x1;})
        .attr("y1", function(d) {return d.y1;})
        .attr("x2", function(d) {return d.x2;})
        .attr("y2", function(d) {return d.y2;})
        .attr("stroke", line_color);

    var status_text = plot_svg.append("text")
        .attr("id", "status")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "12pt")
        .text(getStatusText())
    CenterTextInRect(status_text, 0, freqplot_h, grid_w, fstbar_h);                 
</script>

## Details

The following keys do something:
* 'n' advances to the next generation
* 's' toggles between 4 and 16 diploid individuals per population
* 'h' hides population boundaries

The status text shows:
* **g** = the number of generations of random mating within populations
* **pmean** = mean frequency of the A allele (_p_) over all populations
* **Ho** = observed heterozygosity = fraction of heterozygotes over all populations
* **He** = expected heterozygosity = expected fraction of heterozygotes = 2 pmean (1-pmean)
* **Fst** = variance of _p_ across populations divided by pmean (1 - pmean), which is the maximum possible variance of _p_ across populations

The **blue histogram** at the top shows the distribution of _p_ over the 12 populations (_p_ = 0 at far left, _p_ = 1 at far right).
 
With each new generation, drift increases the variance of _p_ across populations and thus 
increases **Fst** (indicated by the fraction of the status bar filled with **orange**) until, eventually, 
all populations are fixed for either the **A** or the **a** allele, the variance of _p_ is 
as large as it can get, and **Fst** equals 1.

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library. 
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
