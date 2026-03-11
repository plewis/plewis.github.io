---
layout: applet
title: Coalescence
permalink: /applets/coalescence/
---

## Coalescence 

Simulates a coalescent history for n randomly-selected genes from among the 2*Ne genes in a random-mating population of size Ne. The MRCA is shown as a large, red-filled circle (if it is visible), but note that it will not be visible if it occurs at a time deeper than the T generations shown.

Use the drop-down controls below the plot to change **n**, **Ne**, or **T** The **Rewrite History** button regenerates the entire history (same as refreshing your browser except that n, Ne, and T do not revert to their default values). the **Resample** button (or **s** key) chooses a different random sample of n genes.

The status text at the bottom shows the generation at which the first coalescence event occurred, as well as the generation at which the most recent common ancestor (MRCA) of all sample genes occurs. After changing either n or Ne, each rewrite of history updates the mean time until the first coalescence. If it says "mean NA" (i.e. mean not available), it means that at least one run failed to coalesce at all over T generations, rendering the mean meaningless.

The expected time to the first coalescence is 4*Ne/(n*(n-1)), so increasing Ne results in longer average coalescence times while increasing n shortens the average coalescence time. The applet reports E[first] as the expected generation at which the first coalescence event happens (i.e. 1 greater than the expected time to coalescence). Note that the standard deviation of coalescence times equals the mean and can be quite large.

<div id="plot"></div>
<div id="settings"></div>
<script type="text/javascript">
    // written by Paul O. Lewis Jan. 20, 2023
    // modified Jan. 17, 2024, to allow hiding sampled lineages
    // modified Mar. 11, 2026, to add ability to modify nsamples and adding status text
    let rnseed = Math.floor(10000*Math.random())
    let lot = new Random(rnseed);
    
    // color(0) returns first predefined color of 20 total in schemeCategory20
    let defaultcolor = d3.scaleOrdinal()
        .range(d3.schemeCategory20);

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
    
    // width and height of svg
    let w = 800;    // total width
    let h = 700;    // total height
    let lm = 70;    // left margin
    let rm = 30;    // right margin
    let tm = 0;    // top margin
    let bm = 0;    // bottom margin
    let spacer = 20; // time labels right-justified at lm - spacer from left edge
    
    // sampled lineages
    let sampled_node_radius =  6;
    let mrca_node_color = "red";
    let sampled_node_color = "navy";
    let sampled_line_color = "navy";
    let sampled_line_thickness = 4; 
    
    // unsampled lineages
    let unsampled_node_radius =  5;
    let unsampled_node_color = "silver";
    let unsampled_line_color = "silver";
    let unsampled_line_thickness = 2;

    let genetree_showing = true; // if true, lines and nodes comprising gene history are shown; if false, they are hidden
    let untangled = true; // if true, untangle lines so they don't cross from one gen to the next
    let nodes_labeled = false; // if true, number of each node is displayed

    // application specific settings
    let Ne_cutoff = 10; // sampled_node_radius reduced if Ne > Ne_cutoff
    let Ne_choices = [10,20,30];
    let Ne_index = 0; // index of value selected at start
    let Ne = Ne_choices[Ne_index];  // number of diploid individuals

    let nsampled_choices = [2,5,10];
    let nsampled_index = 0; // index of value selected at start
    let nsampled = nsampled_choices[nsampled_index];  // number of genes sampled

    let T_cutoff = 20; // sampled_node_radius reduced if T > T_cutoff
    let T_choices = [20,50];
    let T_index = 1; // index of value selected at start
    let T = T_choices[T_index];  // number of generations
    
    let cum_tfirst = 0.0; // sum of times to first coalescence since last change in n or Ne 
    let num_tfirst = 0.0;   // number of history rewrites since last change in n or Ne
    let valid_mean_tfirst = true; // becomes false if any runs fail to coalesce at all

    let plotw = w - lm - rm;    // plot width
    let ploth = h - tm - bm;    // plot height
    //let delta = plotw/(Ne+1);  // space between adjacent individual centers
    let delta = plotw/(Ne - 2/3);  // space between adjacent individual centers
    let tincr = ploth/(T+1);   // space between generations
    let eps = delta/6;        // offset for genes within individuals
    
    // Select DIV element already created (see above) to hold SVG
    let plot_div = d3.select("div#plot");

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
        .attr("fill", "lavender");

    function CoalNode(i, j) {
        this.number = j;      // unique identifier for this node (index can change, but number does not)
        this.index = i,       // index of this node on its row
        this.sampled = false; // if true, part of path shown in black
        this.down = null,     // points to parent of this node
        this.up = []          // list of pointers to descendants of this node
        this.mrca = false;    // set to true for the node that is the MRCA
        }
    
    let debugShowNodes = function() {
        console.log("Matrix of nodes:");
        for (let t = 0; t < T; t++) {
            for (let i = 0; i < 2*Ne; i++) {
                console.log("  nodes[" + t + "][" + i + "]:");
                console.log(nodes[t][i]);
            }                
        }
    }

    let copyNodes = function(from, to) {
        // Deep copy
        for (let t = 0; t < T-1; t++) {
            for (let i = 0; i < 2*Ne; i++) {
                let j = from[t][i].down.index;
                to[t][i].number = from[t][i].number;
                to[t][i].index = from[t][i].index;
                to[t][i].sampled = from[t][i].sampled;
                to[t][i].mrca = from[t][i].mrca;
                to[t][i].down = to[t+1][j];
                to[t+1][j].up.push(to[t][i]);
            }
        }   
        for (let i = 0; i < 2*Ne; i++) {
            to[T-1][i].number = from[T-1][i].number;
            to[T-1][i].index = from[T-1][i].index;
            to[T-1][i].sampled = from[T-1][i].sampled;
            to[T-1][i].mrca = from[T-1][i].mrca;
        }
    }

    let nodes0 = []; 
    let nodes = []; 
    
    let rebuildNodes = function() {
        // Create matrix of CoalNode objects
        nodes0 = []; 
        nodes = []; 
        let node_number = 0;
        for (let t = 0; t < T; t++) {
            let row0 = [];
            let row = [];
            for (let i = 0; i < 2*Ne; i++) {
                row0.push(new CoalNode(i, node_number));
                row.push(new CoalNode(i, node_number));
                node_number++;
            }
            nodes0.push(row0);
            nodes.push(row);
        }
                        
        // Choose parents for each gene in each generation backward in time
        for (let t = 0; t < T-1; t++) {
            for (let i = 0; i < 2*Ne; i++) {
                let j = Math.floor(lot.uniform(0,1)*2*Ne);
                nodes[t][i].down = nodes[t+1][j];
                nodes[t+1][j].up.push(nodes[t][i]);
            }
        }   
        
        copyNodes(nodes, nodes0);
    }
        
    let indivFromGene = function(i) {
        // i  i/2  indiv
        // -------------
        // 0  0.0    0
        // 1  0.5    0
        // 2  1.0    1
        // 3  1.5    1
        // 4  2.0    2
        // 5  2.5    2
        // 6  3.0    3
        // 7  3.5    3
        // 8  4.0    4
        // 8  4.5    4
        return Math.floor(i/2);
    }

    let untangleDiagram = function() {
        // Reorder nodes for each generation (except the last) forward in time
        for (let t = T-2; t >= 0; t--) {
            nodes[t].sort(function(a, b){
                return a.down.index - b.down.index
            });
            for (let i = 0; i < 2*Ne; i++) {
                nodes[t][i].index = i;
            }
        }
    } 

    let clearSample = function() { 
        // Clean the slate, returning node numbers of nodes that were flagged as sampled
        let sampled_numbers = [];
        for (let t = 0; t < T; t++) {
            for (let i = 0; i < 2*Ne; i++) {
                if (nodes[t][i].sampled)
                    sampled_numbers.push(nodes[t][i].number);
                nodes[t][i].sampled = false;
                nodes[t][i].mrca = false;
            }
        }
        return sampled_numbers;
    }

    let reinstateSample = function(sampled_numbers) {
        clearSample();
                            
        for (let i = 0; i < 2*Ne; i++) {
            let nd = nodes[0][i];
            if (sampled_numbers.includes(nd.number)) {
                nd.sampled = true;
                for (let t = 0; t < T-1; t++) {
                    nd = nd.down;
                    nd.sampled = true;
                }
            }
        }
    }
    
    function decreasing_time(a, b) {
        let comparison = 0;
        if (a.t > b.t) {
            // a will appear before b
            comparison = -1;
        } else if (a.t < b.t) {
            // b will appear before a
            comparison = 1;
        }
        return comparison;
    }

    let resample = function() {
        clearSample();
                            
        // Start with all genes available
        let available = [];
        for (let i = 0; i < 2*Ne; i++) {
            available.push(i);
        }
        
        // Choose nsampled nodes at time 0 to be sampled and propagate through to bottom
        // Keep track of the MRCA
        let MRCAs = [];
        for (let i = 0; i < nsampled; i++) {
            // Choose one of the available (i.e. unsampled) genes
            let it = Math.floor(lot.uniform(0,1)*available.length);
            let which = available[it];
            
            // Remove chosen gene from the list of available genes so that
            // it is not sampled a second time
            available.splice(it, 1);
            
            // Start with the chosen gene in generation 0 and follow the 
            // sampled gene's lineage all the way down, setting sampled
            // attribute for each node along the way
            let nd = nodes[0][which];
            nd.sampled = true;
            let done = false;
            for (let t = 0; t < T-1; t++) {
                nd = nd.down;
                if (!done && nd.sampled) {
                    MRCAs.push({t:t+1, i:nd.index});
                    done = true;
                }
                nd.sampled = true;
            }
        }
        
        let tfirst = 0;
        let nMRCAs = MRCAs.length;
        if (nMRCAs > 0) {
            // Sort MRCAs so that first one has largest t
            MRCAs.sort(decreasing_time);
            let t = MRCAs[0].t;
            let i = MRCAs[0].i;
            
            tfirst = MRCAs[nMRCAs-1].t + 1;
            expected_tfirst = 1 + 4.0*Ne/(nsampled*(nsampled - 1));
            cum_tfirst += tfirst;
            num_tfirst += 1.0;
            mean_tfirst = cum_tfirst/num_tfirst;
            
            // MRCAs[0] is the MRCA only if it is the only node on its row
            // that represents a sampled lineage
            let nlineages = 0;
            for (let j = 0; j < 2*Ne; j++) {
                if (nodes[t][j].sampled) {
                    nlineages++;
                }
            }
            console.log("t = " + t + ", i = " + i + ", nlineages = " + nlineages);
            
            if (nlineages == 1) {
                //console.log("The MRCA: t = " + t + ", i = " + i);
                nodes[t][i].mrca = true;
                if (valid_mean_tfirst) {
                    d3.select("text#mrcatime")
                        .html("first at " + tfirst + ", mean = " + mean_tfirst.toFixed(1) + ", E[first] = " + expected_tfirst + ", MRCA at " + (t+1));
                } else {
                    d3.select("text#mrcatime")
                        .html("first at " + tfirst + ", mean NA, E[first] = " + expected_tfirst + ", MRCA at " + (t+1));
                }
            }
            else {
                if (valid_mean_tfirst) {
                    d3.select("text#mrcatime")
                        .html("first at " + tfirst + ", mean = " + mean_tfirst.toFixed(1) + ", E[first] = " + expected_tfirst + ", MRCA > " + T);
                } else {
                    d3.select("text#mrcatime")
                        .html("first at " + tfirst + ", mean NA, E[first] = " + expected_tfirst + ", MRCA > " + T);
                }
            }
        }
        else {
            // No coalescence for T generations
            console.log("no coalescence: t > " + T);
            valid_mean_tfirst = false;
            d3.select("text#mrcatime")
                .html("first > " + T + ", mean NA, E[first] = " + expected_tfirst + ", MRCA > " + T);
        }
        
        
    }

    let refresh = function() {
        // Called when untangled is toggled or another sample is considered
        // Assume nodes and nodes0 already exist
        
        plot_svg.selectAll("line.ibd").remove();
        plot_svg.selectAll("circle.gene").remove();
        plot_svg.selectAll("text.gene").remove();
        plot_svg.selectAll("text.time").remove();
        
        sampled_node_radius = 6;
        unsampled_node_radius = 5;
        if (Ne > Ne_cutoff || T > T_cutoff) {
            sampled_node_radius -= 2;
            unsampled_node_radius -= 2;
        }
    
        // Create circle_data and line_data arrays
        let circle_data = [];      
        let line_data = [];      
        let time_data = [];      
        for (let t = 0; t < T; t++) {
            let y = (t+1)*tincr;
            time_data.push({time:t+1, y:y});
            let yy = (t+2)*tincr;
            for (let i = 0; i < 2*Ne; i++) {
                let indiv = indivFromGene(i);
                //let x = (indiv+1)*delta + (i % 2 == 0 ? -eps : eps);
                let x = eps + indiv*delta + (i % 2 == 0 ? -eps : eps);
                circle_data.push({id:nodes[t][i].number, sampled:nodes[t][i].sampled, mrca:nodes[t][i].mrca, gene:i, time:t, x:x, y:y});
                if (t < T-1) {
                    let x1 = x;
                    let y1 = y;
                    let ii = nodes[t][i].down.index;
                    let iindiv = indivFromGene(ii);
                    //let x2 = (iindiv+1)*delta + (ii % 2 == 0 ? -eps : eps);
                    let x2 = eps + iindiv*delta + (ii % 2 == 0 ? -eps : eps);
                    let y2 = yy;
                    let s = nodes[t][i].sampled;
                    line_data.push({sampled:s, x1:x1, y1:y1, x2:x2, y2:y2});
                }
            }
        }        
        
        // Create gray lines connecting genes across generations
        plot_svg.selectAll("line.ibd")
            .data(line_data)
            .enter()
            .append("line")
            .attr("class", function(d) {return d.sampled ? "ibd sampled" : "ibd unsampled";})
            .attr("x1", function(d) {return lm + d.x1;})
            .attr("y1", function(d) {return tm + d.y1;})
            .attr("x2", function(d) {return lm + d.x2;})
            .attr("y2", function(d) {return tm + d.y2;})
            .attr("stroke-width", function(d) {return d.sampled ? sampled_line_thickness : unsampled_line_thickness;})
            .attr("stroke", function(d) {return d.sampled ? sampled_line_color : unsampled_line_color;});

        // Create circles representing 2 Ne genes
        plot_svg.selectAll("circle.gene")
            .data(circle_data)
            .enter()
            .append("circle")
            .attr("id", function(d) {return "circle-id" + d.id + "g" + d.gene + "t" + d.time;})
            .attr("class", function(d) {return d.sampled ? "gene sampled" : "gene unsampled";})
            .attr("cx", function(d) {return lm + d.x;})
            .attr("cy", function(d) {return tm + d.y;})
            .attr("r", function(d) {return d.sampled ? (sampled_node_radius + (d.mrca ? 2 : 0)) : (unsampled_node_radius + (d.mrca ? 2 : 0));})
            .attr("fill", function(d) {return d.mrca ? mrca_node_color : (d.sampled ? sampled_node_color : unsampled_node_color);})
            .attr("stroke", function(d) {return d.sampled ? sampled_node_color : unsampled_node_color;});
        
        // Create text labels for each node
        plot_svg.selectAll("text.gene")
            .data(circle_data)
            .enter()
            .append("text")
            .attr("id", function(d) {return "text-id" + d.id + "g" + d.gene + "t" + d.time;})
            .attr("class", "gene")
            .attr("x", function(d) {return lm + d.x;})
            .attr("y", function(d) {return tm + d.y - 10;})
            .style("font-family", "Verdana")
            .style("font-size", 12)
            .attr("visibility", nodes_labeled ? "visible" : "hidden")
            .text(function(d) {return "nd-" + d.id;});
            
        // Use dummy text element to determine bounding box
        let dummy = plot_svg.append("text")
            .attr("id", "dummy")
            .attr("x", 0)
            .attr("y", 0)
            .style("font-family", "Verdana")
            .style("font-size", 12)
            .attr("visibility", "hidden")
            .text("99");
        let dummy_bb      = dummy.node().getBBox();
        let dummy_width   = dummy_bb.width;
        let dummy_height  = dummy_bb.height;
        let dummy_descent = dummy_bb.height + dummy_bb.y;
            
        // Create text labels for generations
        plot_svg.selectAll("text.time")
            .data(time_data)
            .enter()
            .append("text")
            .attr("id", function(d) {return "time-t" + d.time;})
            .attr("class", "time")
            .attr("x", lm - spacer)
            .attr("y", function(d) {return d.y + 0.4*(dummy_height - dummy_descent);})
            .style("text-anchor", "end")
            .style("font-family", "Verdana")
            .style("font-size", 12)
            .attr("visibility", "visible")
            .text(function(d) {return d.time;});
    }
    
    let replot = function() {
        // Called when N or T changes
        rebuildNodes();
        
        if (untangled)
            untangleDiagram();
            
        resample();
        refresh();
    }
    
    let toggleHideShow = function() {
        // added 2024-01-17 by POL
        if (genetree_showing) {
            genetree_showing = false;
            d3.selectAll('line.ibd.sampled')
                .attr('stroke', unsampled_line_color)
                .attr("stroke-width", unsampled_line_thickness);
            d3.selectAll('circle.gene.sampled')
                .attr('stroke', unsampled_node_color)
                .attr("fill", unsampled_node_color)
                .attr("r", unsampled_node_radius);
        }
        else {
            genetree_showing = true;
            refresh();
        }
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
        if (d3.event.keyCode == 84) {
            console.log("You pressed the T key to toggle tangle/untangle lines");
            if (untangled) {
                untangled = false;
                let sampled_node_numbers = clearSample();
                copyNodes(nodes0, nodes);
                reinstateSample(sampled_node_numbers);
            }
            else {
                untangled = true;
                let sampled_node_numbers = clearSample();
                untangleDiagram();
                reinstateSample(sampled_node_numbers);
            }
            refresh();
        }
        else if (d3.event.keyCode == 72) {
            toggleHideShow();
        }
        else if (d3.event.keyCode == 76) {
            console.log("You pressed the L key to toggle hide/show node labels");
            if (nodes_labeled) {
                nodes_labeled = false;
                d3.selectAll('text.gene').style('visibility', 'hidden');
            }
            else {
                nodes_labeled = true;
                d3.selectAll('text.gene').style('visibility', 'visible');
            }
        }
        else if (d3.event.keyCode == 83) {
            console.log("You pressed the S key to resample");
            resample();
            refresh();
        }
        else {
            console.log("You pressed the key with key code = " + d3.event.keyCode);
        }
    }

    var addButton = function(panel, label, onfunc) {
        let control_div = panel.append("div")
            .attr("class", "control")
            .style("margin", "10px")
            .style("display", "inline-block");
        control_div.append("input")
            .attr("value",label)
            .attr("type", "button")
            .on("click", onfunc);
        }

    var addDropdown = function(panel, id, label, choices, selected_index, onfunc) {
        let control_div = panel.append("div")
            .attr("class", "control")
            .style("margin", "10px")
            .style("display", "inline-block");
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
        
    var addStatusText = function(panel, id, html_content) {
        let control_div = panel.append("div")
            .attr("id", id)
            .attr("class", "control")
            .style("display", "inline-block");
        control_div.append("text")
            .attr("id", id)
            .style("margin-left", "1em")
            .style("margin-right", "1em")
            .style("font-family", "Verdana")
            .style("font-size", "10pt")
            .style("display", "inline-block")
            .html(html_content);
        }
        
    let settings_div = d3.select("div#settings");
    let createSettingsPanel = function() {
        addDropdown(settings_div, "samplesize", "n", nsampled_choices, nsampled_index, function() {
            let selected_index = d3.select(this).property('selectedIndex');
            nsampled = nsampled_choices[selected_index];
            console.log("new n chosen: " + nsampled);
            cum_tfirst = 0.0;
            num_tfirst = 0.0;
            valid_mean_tfirst = true;
            replot();
        });

        addDropdown(settings_div, "popsize", "Ne", Ne_choices, Ne_index, function() {
            let selected_index = d3.select(this).property('selectedIndex');
            Ne = Ne_choices[selected_index];
            //delta = plotw/(Ne+1);
            delta = plotw/(Ne - 2/3);
            eps = delta/6;
            console.log("new Ne chosen: " + Ne);
            cum_tfirst = 0.0;
            num_tfirst = 0.0;
            valid_mean_tfirst = true;
            replot();
        });

        addDropdown(settings_div, "generations", "T", T_choices, T_index, function() {
            let selected_index = d3.select(this).property('selectedIndex');
            T = T_choices[selected_index];
            tincr = ploth/(T+1);
            console.log("new T chosen: " + T);
            replot();
        });

        addButton(settings_div, "Rewrite History", function() {
            replot();
        });
        
        addButton(settings_div, "Resample", function() {
            resample();
            refresh();
        });
            
        addButton(settings_div, "Hide", function() {
            toggleHideShow();
        });
            
        addStatusText(settings_div, "mrcatime", "no results yet");
            
    }
    createSettingsPanel();
    replot();
    
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
