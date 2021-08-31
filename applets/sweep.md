---
layout: applet
title: Selective Sweep
permalink: /applets/sweep/
---

## Selective Sweep

<div id="canvas"></div>
<script type="text/javascript">
    // The MIT License (MIT)
    // 
    // Copyright (c) 2019 Paul O. Lewis
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
    // written by Paul O. Lewis 13-Mar-2019
    
    var debugging = false;
    var allow_selfing = false;
    var locus_frac = 0.5;
    var selection_coefficient = 10;
    var ncrossovers = 2;
    
    // colors 
    var hitchhike_color     = "purple";
    var mating_box_color    = "#FDC468";
    var crossover_color     = "black";
    var sweep_color         = "red";
    var high_fitness_color  = "red";

    // population parameters
    var nindiv = 12;
    
    // width and height of svg
    var plotw = 800;
    var ploth = 600;
    var tm = 30;
    var bm = 10;
    var lm = 50;
    var rm = 10;
    var intrachromosome_padding = 5; // 5
    var interchromosome_padding = 12; // 12
    var xover_nudge = 3;
    var fitness_circle_radius = 5
    
    var chromosome_thickness = (ploth - (intrachromosome_padding*nindiv) - (interchromosome_padding*(nindiv-1)) - tm - bm)/(2*nindiv);
    var chromosome_length = (plotw - (2*interchromosome_padding) - lm - rm)/3;
    
    var showing_steps = true;
    var parent_chromosomes = [];
    var offspring_chromosomes = [];
    var nascent_chromosomes = [];
    var painted = [];
    var selected_indivs = [];
    var is_fixed = false;
    var lot = new Random();
    
    function createChromosome(x, y, w, h) {
        return {'weight':1, 'painted':[], 'x':x, 'y':y, 'w':w, 'h':h};
    }
    
    function topLeftCornerOfIndividual(i) {
        // Assuming i is 0-offset index of individual (0..nindiv-1)
        let indiv_thickness = 2*chromosome_thickness + intrachromosome_padding + interchromosome_padding;
        return tm + indiv_thickness*i
    }
    
    function rebuildChromosomes() {
        parent_chromosomes = [];
        let curr_top = tm;
        for (let i = 0; i < nindiv; i++) {
            parent_chromosomes.push(createChromosome(lm, curr_top, chromosome_length, chromosome_thickness));
            curr_top += chromosome_thickness + intrachromosome_padding;
            parent_chromosomes.push(createChromosome(lm, curr_top, chromosome_length, chromosome_thickness));
            curr_top += chromosome_thickness + interchromosome_padding;
        }
    }
    rebuildChromosomes();
    
    // Select DIV element already created (see above) to hold SVG
    var plot_div = d3.select("div#canvas");

    // Create SVG element
    var plot_svg = plot_div.append("svg")
        .attr("width", plotw)
        .attr("height", ploth);

    // Create rect outlining entire area of SVG
    plot_svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", plotw)
        .attr("height", ploth)
        .attr("fill", "lavender");

    // Create circles to left of parental chromosomes to show fitness
    function rebuildFitnessIndicators() {
        plot_svg.selectAll("circle.fitness").remove();
        plot_svg.selectAll("circle.fitness")
            .data(parent_chromosomes)
            .enter()
            .append("circle")
            .attr("class", "fitness")
            .attr("cx", lm/2)
            .attr("cy", function(d) {return d.y + chromosome_thickness/2;})
            .attr("r", fitness_circle_radius)
            .attr("stroke", "black")
            .attr("fill", function(d) {return d.weight > 0 ? high_fitness_color : "none"});
    }
    rebuildFitnessIndicators();
                
    // Create instructions
    var instructions = [
        "< Parental generation",
        " ",
        "Offspring generation >",
        " ",
        "\"Next\" button creates offspring",
        "one at a time.",
        " ",
        "\"Fast\" button simulates an entire",
        "generation all at once.",
        " ",
        "Red-filled dots on left indicate",
        "high fitness; open circles low fitness.",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        "Dotted line on left indicates",
        "location of selected gene.",
        " ",
        "Xs show crossovers during generation",
        "of gametes.",
        " ",
        "Note how selected locus carries nearby",
        "regions (purple) with it to fixation.",
        "This is called \"hitchhiking\".",
        " ",
        "Don't see purple hitchhike region? Keep",
        "clicking Fast button until mutation is fixed."
    ];
    plot_svg.selectAll("text.instructions")
        .data(instructions)
        .enter()
        .append("text")
        .classed("instructions noselect", true)
        .attr("x", lm + chromosome_length + interchromosome_padding + chromosome_length/2)
        .attr("y", function(d,i) {return 90 + i*14;})
        .attr("text-anchor", "middle")
        .style("font-family", "Arial")
        .style("font-size", "12")
        .style("pointer-events", "none")   // don't intercept drag events
        .text(function(d) {return d;});
        
    // Create box that will show (upon fixation) extent of hitchhiking region
    var hitchhike_rect = plot_svg.append("rect")
        .attr("x", lm + chromosome_length/2)
        .attr("y", tm)
        .attr("width", 1)
        .attr("height", ploth - tm - bm)
        .attr("stroke", "none")
        .attr("fill", hitchhike_color)
        .style("visibility", "hidden");

    // Create boxes that will show the two selected individuals for each mating
    var first_mate_rect = plot_svg.append("rect")
        .attr("id", "mate1")
        .attr("class", "matebox")
        .attr("x", lm - interchromosome_padding/2)
        .attr("y", tm - interchromosome_padding/2)
        .attr("width", chromosome_length + interchromosome_padding)
        .attr("height", 2*chromosome_thickness + interchromosome_padding + intrachromosome_padding)
        .attr("stroke", "none")
        .attr("fill", mating_box_color)
        .style("visibility", "hidden");

    var second_mate_rect = plot_svg.append("rect")
        .attr("id", "mate2")
        .attr("class", "matebox")
        .attr("x", lm - interchromosome_padding/2)
        .attr("y", tm - interchromosome_padding/2)
        .attr("width", chromosome_length + interchromosome_padding)
        .attr("height", 2*chromosome_thickness + interchromosome_padding + intrachromosome_padding)
        .attr("stroke", "none")
        .attr("fill", mating_box_color)
        .style("visibility", "hidden");

    // Draw vertical lines showing locus position
    plot_svg.append("line")
        .attr("id", "parentlocus")
        .attr("x1", lm + chromosome_length*locus_frac)
        .attr("y1", tm)
        .attr("x2", lm + chromosome_length*locus_frac)
        .attr("y2", ploth - bm)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2,2,2");
    // plot_svg.append("line")
    //     .attr("id", "offspringlocus")
    //     .attr("x1", plotw - rm - chromosome_length*(1 - locus_frac))
    //     .attr("y1", tm)
    //     .attr("x2", plotw - rm - chromosome_length*(1 - locus_frac))
    //     .attr("y2", ploth - bm)
    //     .attr("stroke", "black")
    //     .attr("stroke-width", 2)
    //     .attr("stroke-dasharray", "2,2,2")
    //     .style("visibility", "hidden");
        
    // Create Xs showing crossover points
    var xmarkdata = [];
    for (let k = 0; k < 2*ncrossovers; k++) {
        xmarkdata.push([0,0,0,0]);
    }

    function redrawXOverMarks() {
        plot_svg.selectAll("line.xover").remove();
        plot_svg.selectAll("line.xover")
            .data(xmarkdata)
            .enter()
            .append("line")
            .classed("xover noselect", true)
            .attr("x1", function(d) {return d[0];})
            .attr("y1", function(d) {return d[1];})
            .attr("x2", function(d) {return d[2];})
            .attr("y2", function(d) {return d[3];})
            .attr("stroke", crossover_color)
            .attr("stroke-width", 2)
            .style("visibility", "visible");
    }
        
    function hideCrossovers() {
        plot_svg.selectAll("line.xover").style("visibility", "hidden");
    }
    
    function showCrossoverAt(indiv_index, xover_frac, which) {
        let x = parent_chromosomes[2*indiv_index].x;
        let y = parent_chromosomes[2*indiv_index].y;

        let x1a = x + chromosome_length*xover_frac - xover_nudge;
        let x2a = x + chromosome_length*xover_frac + xover_nudge;
        
        let x1b = x + chromosome_length*xover_frac + xover_nudge;
        let x2b = x + chromosome_length*xover_frac - xover_nudge;

        let y1 = y + chromosome_thickness;
        let y2 = y + chromosome_thickness + intrachromosome_padding;
        
        xmarkdata[2*which + 0] = [x1a,y1,x2a,y2];
        xmarkdata[2*which + 1] = [x1b,y1,x2b,y2];
    }
    
    function addToPainted(chromosome) {
        if (debugging) {
            console.log("chromosome.painted.length = " + chromosome.painted.length);
        }
        for (let j = 0; j < chromosome.painted.length; j++) {
            let p = chromosome.painted[j];
            let px = chromosome.x + p[0]*chromosome_length;
            let py = chromosome.y;
            let pw = (p[1] - p[0])*chromosome_length;
            let ph = chromosome_thickness;
            painted.push({'x':px, 'y':py, 'w':pw, 'h':ph});
            if (debugging) {
                console.log("{x = " + px + ", y = " + py + ", w = " + pw + ", h = " + ph);
            }
        }
    }
    
    function recreatePaintedRectangles(chromosome) {
        plot_svg.selectAll("rect.painted").remove();
        plot_svg.selectAll("rect.painted")
            .data(painted)
            .enter()
            .append("rect")
            .attr("class", "painted")
            .attr("x", function(d) {return d.x;})
            .attr("y", function(d) {return d.y;})
            .attr("width", function(d) {return d.w;})
            .attr("height", function(d) {return d.h;})
            .attr("fill", sweep_color)
            .attr("stroke", "none");
    }
    
    function rebuildPainted() {
        painted = [];
        for (let i = 0; i < parent_chromosomes.length; i++) {
            //debugging = true;
            addToPainted(parent_chromosomes[i]);
            //debugging = false;
        }
        if (nascent_chromosomes.length == 2) {
            addToPainted(nascent_chromosomes[0]);
            addToPainted(nascent_chromosomes[1]);
        }
        for (let i = 0; i < offspring_chromosomes.length; i++) {
            //debugging = true;
            addToPainted(offspring_chromosomes[i]);
            //debugging = false;
        }
    }
    
    function replacePainted(chromosome_index, strand, begin_frac, end_frac) {
        var c = parent_chromosomes[2*chromosome_index + strand];
        c.painted = [];
        c.painted.push([begin_frac, end_frac]);
        c.weight = 1;
        if (begin_frac <= locus_frac && end_frac >= locus_frac)
            c.weight += selection_coefficient;
        rebuildPainted();
        recreatePaintedRectangles();
    }
    
    function redrawParentalChromosomes(at_start) {
        plot_svg.selectAll("rect.parents").remove();
        plot_svg.selectAll("rect.parents")
            .data(parent_chromosomes)
            .enter()
            .append("rect")
            .attr("class", "parents")
            .attr("x", function(d) {return d.x;})
            .attr("y", function(d) {return d.y;})
            .attr("width", function(d) {return d.w;})
            .attr("height", function(d) {return d.h;})
            .attr("fill", "white")
            .attr("stroke", "black");
            
        if (at_start) {
            // completely paint first strand in first individual
            replacePainted(0, 0, 0.0, 1.0);
        }
        
        // pre-select all individuals who will mate to form offspring generation
        selectIndivsForMating();
    }
    redrawParentalChromosomes(true);
    rebuildFitnessIndicators();

    function calcRelativeFitness(i) {
        let first_selected = false;
        let strand0 = parent_chromosomes[2*i + 0];
        for (let k = 0; k < strand0.painted.length; k++) {
            if (strand0.painted[k][0] < locus_frac && strand0.painted[k][1] > locus_frac) {
                first_selected = true;
                break;
            }
        }
        strand0.weight = (first_selected ? selection_coefficient : 0);
        
        let second_selected = false;
        let strand1 = parent_chromosomes[2*i + 1];
        for (let k = 0; k < strand1.painted.length; k++) {
            if (strand1.painted[k][0] < locus_frac && strand1.painted[k][1] > locus_frac) {
                second_selected = true;
                break;
            }
        }
        strand1.weight = (second_selected ? selection_coefficient : 0);
        
        return (1 + strand0.weight + strand1.weight);
    } 
    
    function selectIndivsForMating() {
        // Stores weights for each individual and compute sum of weights
        // Individual has weight 1 + w1 + w2, where w1 and w2 each equal 
        // selection_coefficient iff locus is in the red region for strands 1 and 2,
        // respectively.
        let wts = [];
        let sumwts = 0.0;
        for (let i = 0; i < nindiv; i++) {
            let wt = calcRelativeFitness(i);
            wts.push(wt);
            sumwts += wt;
        }
        
        // Calculate cumulative probabilities
        let cumprobs = [];
        let cumpr = 0.0;
        for (let i = 0; i < nindiv; i++) {
            cumpr += wts[i]/sumwts;
            cumprobs.push(cumpr);
        }  
        
        // Draw individuals according to cumprobs
        selected_indivs = [];
        let first_parent = null;
        for (let i = 0; i < nindiv; i++) {
            // Choose individual to generate for first chromosome
            let u = lot.random(0.0,1.0);
            for (let j = 0; j < nindiv; j++) {
                if (u < cumprobs[j]) {
                    selected_indivs.push(j);
                    first_parent = j;
                    break;
                }
            }      
                      
            // Choose individual to generate for second chromosome
            let second_parent = null;
            while (second_parent == null) {
                u = lot.random(0.0,1.0);
                for (let j = 0; j < nindiv; j++) {
                    if (u < cumprobs[j]) {
                        if (allow_selfing || j != first_parent) {
                            selected_indivs.push(j);
                            second_parent = j;
                        }
                        break;
                    }
                }                
            } 
        //console.log("offspring individual " + i + ", 1st gamete, from parent " + first_parent);
        //console.log("offspring individual " + i + ", 2nd gamete, from parent " + second_parent);
        }
    }
    
    function processCrossoverSegment(offspring, i, curr_strand, prev_xover, xover) {
        // Add all painted regions from left end of starting_strand up to crossover point
        for (let k = 0; k < parent_chromosomes[2*i + curr_strand].painted.length; k++) {
            let p = parent_chromosomes[2*i + curr_strand].painted[k];
            if (p[1] >= prev_xover && p[0] <= xover) {
                if (p[0] < prev_xover) {
                    if (p[1] > xover) {
                        // need to cut both ends
                        offspring.painted.push([prev_xover,xover]);
                    }
                    else {
                        // only need to cut left end
                        offspring.painted.push([prev_xover,p[1]]);
                    }
                }
                else {
                    if (p[1] > xover) {
                        // only need to cut right end
                        offspring.painted.push([p[0],xover]);
                    }
                    else {
                        // no need to cut either end
                        offspring.painted.push([p[0],p[1]]);
                    }
                }
            }
        }
    }
    
    function crossover(offspring, i, x, y, first) {
        // choose crossover points at random
        let xovers = [];
        for (let x = 0; x < ncrossovers; x++) {
            xovers.push(lot.random(0.0,1.0));
        }
        xovers.sort();
        
        // show crossover point
        if (showing_steps) {
            for (let x = 0; x < ncrossovers; x++) {
                let which = first ? x : ncrossovers + x;
                showCrossoverAt(i, xovers[x], which);
            }
            redrawXOverMarks();
        }
        
        // no-op if neither chromosome for individual i is painted
        if (parent_chromosomes[2*i].painted.length > 0 || parent_chromosomes[2*i+1].painted.length > 0) {
            // choose one strand at random
            let curr_strand = lot.random(0.0,1.0) < 0.5 ? 0 : 1;
            let prev_xover = 0.0;
            for (let x = 0; x < ncrossovers; x++) {
                let xover = xovers[x];
                processCrossoverSegment(offspring, i, curr_strand, prev_xover, xover);
                curr_strand = curr_strand == 0 ? 1 : 0; 
                prev_xover = xover;
            }
            processCrossoverSegment(offspring, i, curr_strand, prev_xover, 1.0);
        }
    }
        
    function pushOffspring() {
        if (showing_steps) {
            hideFastButton();
            hideCrossovers();
        }
        
        // no-op if nascent_chromosomes is empty
        if (nascent_chromosomes.length > 0) {
            let noffspring = offspring_chromosomes.length/2;
            let indiv_height = 2*chromosome_thickness + intrachromosome_padding;
            let x = plotw - rm - chromosome_length;
            let y0 = ploth - bm - noffspring*(indiv_height + interchromosome_padding) - indiv_height;
            let y1 = y0 + chromosome_thickness + intrachromosome_padding;
        
            // Move nascent offspring to offspring stack
            let chromosome = nascent_chromosomes[0];
            chromosome.x = x;
            chromosome.y = y0;
            offspring_chromosomes.push(chromosome);
            
            chromosome = nascent_chromosomes[1];
            chromosome.x = x;
            chromosome.y = y1;
            offspring_chromosomes.push(chromosome);
            nascent_chromosomes = [];
        
            if (showing_steps) {
                // Redraw in offspring panel
                d3.selectAll("rect#nascent0")
                    .attr("id", null)
                    .classed("nascent", false)
                    .classed("offspring", true)
                    .attr("x", x)
                    .attr("y", y0);
                d3.selectAll("rect#nascent1")
                    .attr("id", null)
                    .classed("nascent", false)
                    .classed("offspring", true)
                    .attr("x", x)
                    .attr("y", y1);
            }
        }
    }
    
    function mate() {
        nascent_chromosomes = [];
        let i = offspring_chromosomes.length/2;
        
        if (i < nindiv) {                
            // Generate first gamete
            let a = selected_indivs[2*i + 0];
            
            // Create new chromosome and position it in top half of central area
            let x = lm + chromosome_length + interchromosome_padding;
            let y = ploth/2 - intrachromosome_padding/2 - chromosome_thickness;
            var offspring0 = createChromosome(x, y, chromosome_length, chromosome_thickness);
            crossover(offspring0, a, x, y, true);
            nascent_chromosomes.push(offspring0);
        
            // Generate second gamete
            let b = selected_indivs[2*i + 1];
            
            // Create new chromosome and position it in bottom half of central area                    
            y = ploth/2 + intrachromosome_padding/2;
            var offspring1 = createChromosome(x, y, chromosome_length, chromosome_thickness);
            crossover(offspring1, b, x, y, false);
            nascent_chromosomes.push(offspring1);
        
            if (showing_steps) {
                // Show new offspring in the middle panel
                plot_svg.selectAll("rect.nascent")
                    .data(nascent_chromosomes)
                    .enter()
                    .append("rect")
                    .attr("id", function(d,i) {return "nascent"+i;})
                    .attr("class", "nascent")
                    .attr("x", function(d) {return d.x;})
                    .attr("y", function(d) {return d.y;})
                    .attr("width", function(d) {return d.w;})
                    .attr("height", function(d) {return d.h;})
                    .attr("fill", "white")
                    .attr("stroke", "black");
                    
                // Show boxes highlighting mated individuals
                plot_svg.select("rect#mate1")
                    .attr("y", topLeftCornerOfIndividual(selected_indivs[2*i + 0]) - interchromosome_padding/2)
                    .style("visibility", "visible");
                plot_svg.select("rect#mate2")
                    .attr("y", topLeftCornerOfIndividual(selected_indivs[2*i + 1]) - interchromosome_padding/2)
                    .style("visibility", "visible");
            }
        }                    
        if (showing_steps) {
            rebuildPainted();
            recreatePaintedRectangles();
        }
    }
    
    function mergeAdjacentPaintedRegions() {
        for (let i = 0; i < parent_chromosomes.length; i++) {
            // Sort painted array so that we can more easily identify adjacent regions
            parent_chromosomes[i].painted.sort();
            
            if (debugging) {
                let which = 1 + (parent_chromosomes[i].y - tm)/(chromosome_thickness + intrachromosome_padding);
                console.log("~~~~~~~~~~~~~~~~~~~~");
                console.log("chromosome before: " + which.toFixed(0) + " from top");
                for (let k = 0; k < parent_chromosomes[i].painted.length; k++) {
                    let pk = parent_chromosomes[i].painted[k];
                    console.log("  " + pk[0].toFixed(3) + "-->" + pk[1].toFixed(3));
                }
            }

            // Create new painted array that consolidates adjacent regions
            let one_pixel = 1.0/chromosome_length;
            let new_painted = [];
            let p = parent_chromosomes[i].painted[0];
            for (let k = 1; k < parent_chromosomes[i].painted.length; k++) {
                let pp = parent_chromosomes[i].painted[k];
                if (pp[0] - p[1] < one_pixel) {
                    // Merge pp into p
                    if (debugging)
                        console.log("merging (" + p[0].toFixed(3) + "," + p[1].toFixed(3) + ") with (" + pp[0].toFixed(3) + "," + pp[1].toFixed(3) + ")");
                    
                    p[1] = pp[1];
                }
                else {
                    // Can't merge, so add p to new_painted
                    new_painted.push([p[0],p[1]]);
                    p = pp;
                }
            }
            // Don't forget to add the last one
            new_painted.push([p[0],p[1]]);
            parent_chromosomes[i].painted = new_painted;

            if (debugging) {
                console.log("chromosome after: " + which.toFixed(0) + " from top");
                for (let k = 0; k < parent_chromosomes[i].painted.length; k++) {
                    let pk = parent_chromosomes[i].painted[k];
                    console.log("  " + pk[0].toFixed(3) + "-->" + pk[1].toFixed(3));
                }
            }
        }
    }
    
    function showHitchhikeRegion() {
        if (!is_fixed) {
            // check to see if population has just become fixed
            is_fixed = true;
            for (let i = 0; i < parent_chromosomes.length; i++) {
                if (parent_chromosomes[i].weight == 0) {
                    is_fixed = false;
                    break;
                }
            }
        }
        
        if (is_fixed) {
            mergeAdjacentPaintedRegions();
            
            let rightmost_left_end = 0.0;
            let leftmost_right_end = 1.0;
            for (let i = 0; i < parent_chromosomes.length; i++) {
                // Determine hitchhiking region extent
                for (let k = 0; k < parent_chromosomes[i].painted.length; k++) {
                    let p = parent_chromosomes[i].painted[k];
                    if (p[0] <= locus_frac && p[1] >= locus_frac) {
                        if (p[0] > rightmost_left_end)
                            rightmost_left_end = p[0];
                        if (p[1] < leftmost_right_end)
                            leftmost_right_end = p[1];
                    }
                }
            }
            let rectx = lm + chromosome_length*rightmost_left_end;
            let rectw = chromosome_length*(leftmost_right_end - rightmost_left_end);
            hitchhike_rect.attr("x", rectx).attr("width",rectw).style("visibility", "visible");
        }
    }
    
    function hideMateBoxes() {
        plot_svg.selectAll("rect.matebox")
            .style("visibility", "hidden");
    }
    
    function moveToNextGeneration() {
        // Begin by emptying parent_chromosomes, then copy all offspring chromosomes on the right side to the left
        // side (into parent_chromosomes) to begin the next generation
        parent_chromosomes = [];
        //console.log("**** offspring ****");
        for (let i = 0; i < offspring_chromosomes.length; i++) {
            //console.log("indiv = " + i + " | weight = " + offspring_chromosomes[i].weight + " | painted regions = " + offspring_chromosomes[i].painted.length);
            //for (let k = 0; k < offspring_chromosomes[i].painted.length; k++) {
            //    console.log("  " + offspring_chromosomes[i].painted[k][0] + " <--> " + offspring_chromosomes[i].painted[k][1]);
            //}
            offspring_chromosomes[i].x = lm; // make sure left edge of each chromosome is at the left margin
            parent_chromosomes.push(offspring_chromosomes[i]);
        }
        
        // Remove all traces of offspring on the right
        offspring_chromosomes = [];
        plot_svg.selectAll("rect.offspring").remove();
        redrawParentalChromosomes(false);

        if (debugging) {
            console.log("**** parents ****");
            for (let i = 0; i < parent_chromosomes.length; i++) {
                console.log("indiv = " + i + ") | y = " + parent_chromosomes[i].y + " | weight = " + parent_chromosomes[i].weight + " | painted regions = " + parent_chromosomes[i].painted.length);
                for (let k = 0; k < parent_chromosomes[i].painted.length; k++) {
                    console.log("  " + parent_chromosomes[i].painted[k][0] + " <--> " + parent_chromosomes[i].painted[k][1]);
                }
            }
        }

        rebuildFitnessIndicators();
        rebuildPainted();
        recreatePaintedRectangles();
        showFastButton();
        showHitchhikeRegion();
        hideMateBoxes();
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

    function createNextButton() {
        var next_button = plot_svg.append("rect")
            .attr("id", "nextbutton")
            .attr("x", lm + chromosome_length + interchromosome_padding + chromosome_length/2 - 20)
            .attr("y", 10)
            .attr("width", 40)
            .attr("height", 20)
            .attr("fill", "white")
            .attr("stroke", "black")
            .on("mouseover", function() {d3.select(this).attr("fill", "purple"); next_label.attr("fill", "white")})
            .on("mouseout", function() {d3.select(this).attr("fill", "white"); next_label.attr("fill", "black")})
            .on("click", function(d) {
                if (offspring_chromosomes.length < 2*nindiv) {
                    pushOffspring();
                    mate();
                }
                else {
                    moveToNextGeneration();
                }
            });
    
        var next_label = plot_svg.append("text")
            .attr("id", "nextbutton")
            .attr("class", "noselect")
            .attr("x", 0)
            .attr("y", 0)
            .style("font-family", "Arial")
            .style("font-size", "12")
            .style("pointer-events", "none")   // don't intercept drag events
            .text("Next");
        CenterTextInRect(next_label, lm + chromosome_length + interchromosome_padding + chromosome_length/2 - 20, 10, 40, 20);                 
    }
    createNextButton();
    
    function createFastButton() {
        var fast_button = plot_svg.append("rect")
            .attr("id", "fastbutton")
            .attr("x", lm + chromosome_length + interchromosome_padding + chromosome_length/2 - 20)
            .attr("y", 40)
            .attr("width", 40)
            .attr("height", 20)
            .attr("fill", "white")
            .attr("stroke", "black")
            .on("mouseover", function() {d3.select(this).attr("fill", "purple"); fast_label.attr("fill", "white")})
            .on("mouseout", function() {d3.select(this).attr("fill", "white"); fast_label.attr("fill", "black")})
            .on("click", function(d) {
                showing_steps = false;
                for (let i = 0; i < nindiv; i++) {
                    //console.log("creating offspring " + i);
                    pushOffspring();
                    mate();
                }
                pushOffspring();
                //console.log("moving offspring to parents");
                moveToNextGeneration();
                showing_steps = true;
            })
            .style("visibility", "visible");
    
        var fast_label = plot_svg.append("text")
            .attr("id", "fastlabel")
            .attr("class", "noselect")
            .attr("x", 0)
            .attr("y", 0)
            .style("font-family", "Arial")
            .style("font-size", "12")
            .style("pointer-events", "none")   // don't intercept drag events
            .text("Fast")
            .style("visibility", "visible");
        CenterTextInRect(fast_label, lm + chromosome_length + interchromosome_padding + chromosome_length/2 - 20, 40, 40, 20);                 
    }
    createFastButton();
    
    function showFastButton() {
        d3.select("text#fastlabel").style("visibility", "visible");
        d3.select("rect#fastbutton").style("visibility", "visible");
    }
    
    function hideFastButton() {
        d3.select("text#fastlabel").style("visibility", "hidden");
        d3.select("rect#fastbutton").style("visibility", "hidden");
    }
</script>
