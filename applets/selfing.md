---
layout: applet
title: Effects of Repeated Selfing
permalink: /applets/selfing/
---

## Effects of repeated selfing

Key to genotype colors:
* ![](https://via.placeholder.com/20.png/FEFF0B/000000?text=+) AA (yellow)
* ![](https://via.placeholder.com/20.png/F08D08/000000?text=+) Aa (orange)
* ![](https://via.placeholder.com/20.png/FF0000/FFFFFF?text=+) aa (red)

The starting frequencies of AA, Aa, and aa are 0.25, 0.5, and 0.25, respectively. 
Press the "n" key to advance to the next generation. Repeat to see heterozygosity decrease to zero. 
Refresh your browser to start over.

<div id="arbitrary"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 10-Apr-2019
    
    // width and height of svg
    var plot_w = 600;
    var plot_h = 600;
    var status_h = 50;
    
    // There indivrows x indivcols diploid individuals
    var indivrows = 16;
    var indivcols = 16;
    
    // Dimensions of cells in which individuals are shown
    var wcell = plot_w/indivcols;
    var hcell = plot_h/indivrows;
    var cell_avg_diam = (wcell + hcell)/2;
    
    // Radius of circle representing a single individual
    var rindiv = 0.3*cell_avg_diam;

    // Determines amount of Gaussian jigger to impart to each individual's position
    //var jigger_stdev = 0.3*cell_avg_diam;
    
    // Genotype colors
    var genotype_color = ["yellow", "orange", "red"];
    
    // Initialize heterozygosity and frequency of A allele
    var freqAA = 0.25;
    var freqAa = 0.50;
    var freqaa = 0.25;
    
    // Returns index into data vector of individual on row indivrow, column indivcol
    function getDataIndex(indivrow, indivcol) {
        return indivrow*indivcols + indivcol;
    }
    
    // Randomly draw a genotype given frequencies of AA, Aa, and aa.
    function drawOneGenotype(pp, pq2, qq, self_fertilize) {
        let u = Math.random();
        if (u < pp)
            return 0;
        else if (u < pp + pq2) {
            if (self_fertilize) {
                let uu = Math.random();
                if (uu < 0.25)
                    return 0;
                else if (uu < 0.75)
                    return 1;
                else
                    return 2;
                }
            else
                return 1;
            }
        else
            return 2;
    }
    
    // Draw n genotypes
    function drawNGenotypes(n, self_fertilize, initialize) {
        let v = [];
        let nTotal = 0;
        let nAA = 0;
        let nAa = 0;
        let naa = 0;
        if (initialize) {
            nTotal = indivrows*indivcols;
            nAA = Math.floor(0.25*nTotal);
            nAa = Math.floor(0.5*nTotal);
            naa = Math.floor(0.25*nTotal);
            if (nAA + nAa + naa != nTotal) {
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
        }
        else {
            for (k = 0; k < n; k++) {
                let g = drawOneGenotype(freqAA, freqAa, freqaa, self_fertilize);
                v.push(g);
                if (g == 0)
                    nAA++;
                else if (g == 1)
                    nAa++;
                else 
                    naa++;
            }
            nTotal = nAA + nAa + naa;
        }
        freqAA = nAA/nTotal;
        freqAa = nAa/nTotal;
        freqaa = naa/nTotal;
        return v;
    }   
    
    function getCellX(indivcol) {
        return wcell*(indivcol + 0.5);
    }       
    
    function getCellY(indivrow) {
        return status_h + hcell*(indivrow + 0.5);
    }       
    
    // Data for individuals is stored as list of objects containing information about each individual
    var indiv_data = [];
    let n = indivrows*indivcols;
    let v = drawNGenotypes(n, false, true);
    for (let i = 0; i < indivrows; i++) {
        for (let j = 0; j < indivcols; j++) {
            let x = getCellX(j);
            let y = getCellY(i);
            indiv_data.push({"i":i, "j":j, "x":x, "y":y, "genotype":v[i*indivcols + j]});
        }
    }
    
    function getStatusText() {
        return "AA = " + freqAA.toFixed(3) + ", Aa = " + freqAa.toFixed(3) + ", aa = " + freqaa.toFixed(3);
    }
    
    function nextGeneration() {
        let n = indivrows*indivcols;
        let v = drawNGenotypes(n, true, false);
        for (let i = 0; i < indivrows; i++) {
            for (let j = 0; j < indivcols; j++) {
                let x = getCellX(j);
                let y = getCellY(i);
                let indiv = getDataIndex(i, j);
                indiv_data[indiv].genotype = v[i*indivcols + j];
            }
        }
        d3.selectAll("circle.indiv")
            .attr("cx", function(d) {return d.x;})
            .attr("cy", function(d) {return d.y;})
            .attr("fill", function(d) {return genotype_color[d.genotype];});
        d3.select("text#status")
            .text(getStatusText());
        CenterTextInRect(status_text, 0, 0, plot_w, status_h);                 
    }
    
    // Data for lines surrounding population
    var line_data = [];
    
    // top
    let x1 = 0;
    let x2 = plot_w;
    let y1 = status_h;
    let y2 = status_h;
    line_data.push({"x1":x1, "x2":x2, "y1":y1, "y2":y2});

    // bottom
    x1 = 0;
    x2 = plot_w;
    y1 = status_h + plot_h;
    y2 = status_h + plot_h;
    line_data.push({"x1":x1, "x2":x2, "y1":y1, "y2":y2});

    // left
    x1 = 0;
    x2 = 0;
    y1 = status_h;
    y2 = status_h + plot_h;
    line_data.push({"x1":x1, "x2":x2, "y1":y1, "y2":y2});
    
    // right
    x1 = plot_w;
    x2 = plot_w;
    y1 = status_h;
    y2 = status_h + plot_h;
    line_data.push({"x1":x1, "x2":x2, "y1":y1, "y2":y2});
    
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
    }
    d3.select("body")
        .on("keydown", keyDown);

    // Select DIV element already created (see above) to hold SVG
    var plot_div = d3.select("div#arbitrary");

    // Create SVG element
    var plot_svg = plot_div.append("svg")
        .attr("width", plot_w)
        .attr("height", plot_h + status_h);

    // Create rect outlining entire area of SVG
    plot_svg.append("rect")
        .attr("x", 0)
        .attr("y", status_h)
        .attr("width", plot_w)
        .attr("height", plot_h + status_h)
        .attr("fill", "lavender");
        
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
        .attr("stroke", "black");

    // Create blue line from center of plot area to right edge
    plot_svg.selectAll("line.popbounds")
        .data(line_data)
        .enter()
        .append("line")
        .attr("class", "popbounds")
        .attr("x1", function(d) {return d.x1;})
        .attr("y1", function(d) {return d.y1;})
        .attr("x2", function(d) {return d.x2;})
        .attr("y2", function(d) {return d.y2;})
        .attr("stroke", "black");
        
    var status_text = plot_svg.append("text")
        .attr("id", "status")
        .attr("x", plot_w/2)
        .attr("y", status_h/2)
        .attr("font-family", "Verdana")
        .attr("font-size", "12pt")
        .text(getStatusText());
    CenterTextInRect(status_text, 0, 0, plot_w, status_h);                 
</script>

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library. 
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
