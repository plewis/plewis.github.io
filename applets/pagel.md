---
layout: applet
title: Pagel's Tree Transformations
permalink: /applets/pagel/
---

## Pagel's Tree Transformations

This applet illustrates the effects of [Pagel's (1999)](https://doi.org/10.1038/44766) three transformations on rooted trees: 
lambda, delta, and kappa. A lambda value of 0.2 reduces the height of internal nodes 
to 20% of their original height. A delta value of 0.2 raises the height of every node 
(including leaf nodes) to the power 0.2. Finally, a kappa value of 0.2 raises every edge length 
to the power 0.2. Section 6.2 of [Luke Harmon's book](https://lukejharmon.github.io/pcm/) 
provides a good explanation of these transformations in the context of comparative methods.

Use the **left/right arrow keys** to cycle among the three parameters and the **up/down arrow keys** to 
increase/decrease the current parameter value. Note that the left/right arrow keys reset
the parameter value to 1.0, which is the unmodified tree. Hold down Shift when using
the arrow keys to avoid scrolling while changing parameter values. The **Simulate button** simulates 
a new tree using a pure birth model scaled to have total height 100.

<div id="details"></div>
<div class="container" style="clear: both"></div>
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
    
    // Written by Paul O. Lewis 15-Apr-2020

    let details_div = d3.select("div#details").attr("class", "detailsbox");
    let debugging = false;
    
    let lot = new Random(12345);

    // Background colors
    // browns: palegoldenrod, wheat, beige,
    // off-whites: whitesmoke, ghostwhite
    // purples: lavender, aliceblue
    let tree_background = "whitesmoke";

    //Width and height
    let w = 800;
    let h = 500;
    let traits = {
        padding:50,
        node_radius:.5,
        line_width:2    //,
        //tree: null,
        //taxa: null
    };
    
    let tree    = null;

    let ntaxa   =    20; // number of sampled taxa (maximum 26)
    
    // Pagel's parameters
    pagel_parameter = "lambda";
    pagels_lambda  = 1.0;
    pagels_delta   = 1.0;
    pagels_kappa   = 1.0;
    
    // diversification = birth - death
    let diversification_choices = ["0.1", "0.5", "1.0", "10.0"];
    let diversification_default = 2;
    let diversification = diversification_choices[diversification_default]; 

    // turnover = death/birth
    let turnover_choices        = ["0.0", "0.1", "0.5", "0.9", "0.99"];
    let turnover_default        = 0;
    let turnover = turnover_choices[turnover_default]; 

    // rho is fraction of all taxa sampled
    let rho_choices             = ["0.001", "0.01", "0.1", "0.5", "1.0"];
    let rho_default             = 4;
    let rho = rho_choices[rho_default]; 

    // root age is the time (looking back from the present) of basal fork
    let root_age_choices        = ["1", "10", "100", "500"];
    let root_age_default        = 2;
    let root_age = root_age_choices[root_age_default]; 

    let lambda = diversification/(1.0 - turnover);          // birth rate
    let mu     = diversification*turnover/(1.0 - turnover); // death rate

    // Create div to contain the plot (floated in case we want other divs to the right)
    tree_div = d3.select("div.container")
        .append("div").attr("id", "tree")
        .style("display", "inline-block")
        .style("float", "left")
        .attr("height", h+20);

    // Create SVG element for tree
    let tree_svg = tree_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create background rect
    tree_svg.append("rect")
        .attr("width", w)
        .attr("height", h)
        .attr("fill", tree_background);

    // Create time scale
    let tscale = d3.scaleLinear()
        .domain([100, 0])
        .range([traits.padding, w - traits.padding]);

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

    let title = tree_svg.append("text")
        .attr("id", "title")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "Verdana")
        .attr("font-size", "16")
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("");
        
    function refreshTitle() {
        if (pagel_parameter == "lambda") {
            tree_svg.select("text#title")
                .text("Pagel's lambda =" + pagels_lambda.toFixed(2));
        }
        else if (pagel_parameter == "delta") {
            tree_svg.select("text#title")
                .text("Pagel's delta =" + pagels_delta.toFixed(2));
        }
        else if (pagel_parameter == "kappa") {
            tree_svg.select("text#title")
                .text("Pagel's kappa =" + pagels_kappa.toFixed(2));
        }
        else {
            console.log("error: unknown pagel_parameter value: " + pagel_parameter);
        }
        CenterTextAroundPoint(title, w/2, 25);
    }
    refreshTitle();

    function debugShowLevelSet(levelset) {
        if (!debugging)
            return;

        if (true) {
            // list names of nodes in levelset
            level_names = [];
            for (k in levelset) {
                level_names.push(levelset[k].name);
            }
            console.log("  levelset: " + level_names.join(","));
        }

        if (false) {
            // show all node connections
            console.log("  --------------------");
            for (k in levelset) {
                let nd = levelset[k];
                console.log("  name   : " + nd.name);

                if (nd.lchild) {
                    let it = nd.lchild;
                    let itchild   = (it.lchild ? it.lchild.name : "null");
                    let itsibling = (it.rsib ? it.rsib.name : "null");
                    let itparent  = (it.parent ? it.parent.name : "null");
                    console.log("  lchild : " + it.name + " (" + itchild + ", " + itsibling + ", " + itparent + ")");
                }
                else {
                    console.log("  lchild : null");
                }

                if (nd.rsib) {
                    let it = nd.rsib;
                    let itchild   = (it.lchild ? it.lchild.name : "null");
                    let itsibling = (it.rsib ? it.rsib.name : "null");
                    let itparent  = (it.parent ? it.parent.name : "null");
                    console.log("  rsib   : " + it.name + " (" + itchild + ", " + itsibling + ", " + itparent + ")");
                }
                else {
                    console.log("  rsib   : null");
                }

                if (nd.parent) {
                    let it = nd.parent;
                    let itchild   = (it.lchild ? it.lchild.name : "null");
                    let itsibling = (it.rsib ? it.rsib.name : "null");
                    let itparent  = (it.parent ? it.parent.name : "null");
                    console.log("  parent : " + it.name + " (" + itchild + ", " + itsibling + ", " + itparent + ")");
                }
                else {
                    console.log("  parent : null");
                }

                console.log("  --------------------");
            }
        }
    }

    function birthDeathTree() {
        console.log("birthDeathTree starting...");
        console.log("  diversification = " + diversification);
        console.log("  turnover        = " + turnover);
        console.log("  rho             = " + rho);

        let i = 0;

        // Create array of taxon names
        if (ntaxa > 26) {
            ntaxa = 26;
        }
        let first_letter = 'A'.charCodeAt(0);
        let taxon_names = [];
        for (i = 0; i < ntaxa; i++) {
            taxon_names.push(String.fromCharCode(first_letter + i));
        }
        //if (debugging) console.log(taxon_names);

        // Draw ntaxa-1 internal node heights and store in vector heights
        // From Yang and Rannala. 1997. MBE 14(7):717-724
        // Smallest height is sojourn time leading to tips (tip height = 0)
        // Largest height is sojourn time from root (first fork) to first
        // speciation above root (root height = 1)
        // Tree height is determined by multiplying all height increments
        // by specified root_age
        let exp_mu_minus_lambda = Math.exp(mu - lambda);
        let phi = (rho*lambda*(exp_mu_minus_lambda - 1.0) + (mu - lambda)*exp_mu_minus_lambda)/(exp_mu_minus_lambda - 1.0);
        heights = [];
        for (i = 0; i < ntaxa-2; i++) {
            let u = lot.uniform(0,1);
            let y = null;
            if (mu == lambda) {
                y = u/(1.0 + lambda*rho*(1.0 - u));
            }
            else {
                y = (Math.log(phi - u*rho*lambda) - Math.log(phi - u*rho*lambda + u*(lambda - mu)))/(mu - lambda);
            }
            heights.push(y);
        }
        heights.push(1.0);
        heights.sort();
        if (debugging) console.log(heights);

        // Create tree and root node
        tree = new Tree();
        tree.nleaves = ntaxa;

        // Create first leaf node
        let prev_nd = new TreeNode();
        prev_nd.name = taxon_names[0];
        prev_nd.number = 0;

        // levelset keeps track of all nodes at the current level
        levelset = [prev_nd]

        // Add remaining ntaxa-1 leaves
        for (i = 1; i < ntaxa; i++) {
            let nd = new TreeNode();
            nd.name = taxon_names[i];
            nd.number = i;
            prev_nd.rsib = nd;
            prev_nd = nd;
            levelset.push(nd);
        }
        debugShowLevelSet(levelset);
        
        let TL = 0.0;
        
        let sum_recip = 0.0;
        for (let k = 2; k <= ntaxa; k++)
            sum_recip += 1/k;
        let expectedTL = root_age*(ntaxa-1)/sum_recip;

        // Successively join pairs of taxa
       for (i = 0; i < ntaxa-1; i++) {
            if (debugging) console.log("height at level " + i + " = " + heights[i]);
            debugShowLevelSet(levelset);

            // Compute height increment needed to bring all nodes up to height[i]
            let hincr = heights[i];
            if (i > 0) {
                hincr -= heights[i-1];
            }
            hincr *= root_age;

            // Add hincr to edges of all nodes currently in levelset
            if (debugging) console.log("hincr at level " + i + " = " + hincr);
            for (let j in levelset) {
                levelset[j].edgelen += hincr;
                TL += hincr;
            }

            // Remove a node at random from levelset
            let pos = Math.floor(lot.uniform(0,1)*levelset.length);
            let first = levelset[pos];
            let left_sib = null;
            if (pos > 0) {
                left_sib = levelset[pos-1];
                left_sib.rsib = first.rsib;
            }
            levelset.splice(pos,1);

            if (debugging) console.log("  removed " + first.name + " from position " + pos);
            debugShowLevelSet(levelset);

            // Remove a second node at random from levelset
            pos = Math.floor(lot.uniform(0,1)*levelset.length);
            let second = levelset[pos];
            left_sib = null;
            if (pos > 0) {
                left_sib = levelset[pos-1];
                left_sib.rsib = second.rsib;
            }
            let right_sib = second.rsib;
            levelset.splice(pos,1);

            if (debugging) console.log("  removed " + second.name + " from position " + pos);
            debugShowLevelSet(levelset);

            // Add first and second to new node
            let nd = new TreeNode();
            nd.name = first.name + second.name;
            nd.lchild = first;
            nd.rsib = right_sib;
            if (left_sib)
                left_sib.rsib = nd;
            first.rsib = second;
            second.rsib = null;
            first.parent = nd;
            second.parent = nd;

            // Add new node to levelset at position where second was removed
            levelset.splice(pos, 0, nd);

            if (debugging) console.log("  added " + nd.name + " to position " + pos);
            debugShowLevelSet(levelset);

            // Be sure tree always has a root, even if that root does not yet
            // contain all taxa at this point
            tree.root = nd;
        }

        // Add a stem of zero length
        let nd = new TreeNode();
        nd.name = "root";
        nd.edgelen = 0.0;
        nd.lchild = tree.root;
        nd.rsib = null;
        nd.parent = null;
        tree.root.parent = nd;
        tree.root = nd;

        tree.rebuildPreorder();
        tscale.domain([tree.total_height, 0]);
        console.log("TL = " + TL);
        if (debugging) {
            console.log("tree.total_height = " + tree.total_height);
            console.log("TL = " + TL);
            console.log("expected TL = " + expectedTL);
        }
    }

    function doSimulation() {
        let tree_elements = tree_svg.selectAll(".bdtree");
        if (tree_elements != null) {
            tree_elements.remove();
        }
        birthDeathTree();
        console.log(tree.makeNewick(5))
        tree.addTreeToSVG(tree_svg, "bdtree", tscale, traits);
    }
    doSimulation();
    
    function lambdaChanged() {
        // Multiply all internal node heights by factor pagels_lambda
        if (!tree)
            return;
            
        let tree_elements = tree_svg.selectAll(".bdtree");
        if (tree_elements != null) {
            tree_elements.remove();
        }
        
        let t = new Tree();
        tree.deepCopy(t);
            
        // Note that we can skip preorder[0], which is the root node
        for (let i = 1; i < t.preorder.length; i++) { 
            let nd = t.preorder[i];
            if (nd.lchild) {
                let v = nd.edgelen;
                nd.edgelen = v*pagels_lambda;
                nd.height = nd.parent.height + nd.edgelen;
            }
            else {
                nd.edgelen = t.total_height - nd.parent.height;
            }
        }

        tscale.domain([100, 0]);
        console.log(t.makeNewick(5))
        t.addTreeToSVG(tree_svg, "bdtree", tscale, traits);
    }

    function deltaChanged() {
        // Raise all node heights to power pagels_delta
        if (!tree)
            return;
            
        let tree_elements = tree_svg.selectAll(".bdtree");
        if (tree_elements != null) {
            tree_elements.remove();
        }
        
        let t = new Tree();
        tree.deepCopy(t);
        
        t.total_height = 0.0;
            
        // Note that we can skip preorder[0], which is the root node
        for (let i = 1; i < t.preorder.length; i++) { 
            let nd = t.preorder[i];
            nd.height = Math.pow(nd.height, pagels_delta);
            nd.edgelen = nd.height - nd.parent.height;
            if (nd.height > t.total_height)
                t.total_height = nd.height;
        }

        tscale.domain([t.total_height, 0]);
        console.log(t.makeNewick(5))
        t.addTreeToSVG(tree_svg, "bdtree", tscale, traits);
    }

    function kappaChanged() {
        // Raise all edge lengths by a power equal to pagels_kappa
        if (!tree)
            return;
            
        let tree_elements = tree_svg.selectAll(".bdtree");
        if (tree_elements != null) {
            tree_elements.remove();
        }
        
        let t = new Tree();
        tree.deepCopy(t);
        
        t.total_height = 0.0;
            
        // Note that we can skip preorder[0], which is the root node
        for (let i = 1; i < t.preorder.length; i++) { 
            let nd = t.preorder[i];
            nd.edgelen = Math.pow(nd.edgelen, pagels_kappa);
            nd.height = nd.parent.height + nd.edgelen;
            if (nd.height > t.total_height)
                t.total_height = nd.height;
        }

        tscale.domain([t.total_height, 0]);
        console.log(t.makeNewick(5))
        t.addTreeToSVG(tree_svg, "bdtree", tscale, traits);
    }

    function increaseLambda() {
        if (pagels_lambda < 1.0) {
            pagels_lambda = pagels_lambda + 0.1;
            pagels_lambda = Math.round(10*pagels_lambda)/10;
            lambdaChanged();
            refreshTitle();
        }
    }
    
    function decreaseLambda() {
        if (pagels_lambda > 0.0) {
            pagels_lambda = pagels_lambda - 0.1;
            pagels_lambda = Math.round(10*pagels_lambda)/10;
            lambdaChanged();
            refreshTitle();
        }
    }
    
    function increaseDelta() {
        pagels_delta = pagels_delta + 0.1;
        pagels_delta = Math.round(10*pagels_delta)/10;
        deltaChanged();
        refreshTitle();
    }
    
    function decreaseDelta() {
        if (pagels_delta > 0.0) {
            pagels_delta = pagels_delta - 0.1;
            pagels_delta = Math.round(10*pagels_delta)/10;
            deltaChanged();
            refreshTitle();
        }
    }
    
    function increaseKappa() {
        //if (pagels_kappa < 1.0) {
            pagels_kappa = pagels_kappa + 0.1;
            pagels_kappa = Math.round(10*pagels_kappa)/10;
            kappaChanged();
            refreshTitle();
        //}
    }
    
    function decreaseKappa() {
        if (pagels_kappa > 0.0) {
            pagels_kappa = pagels_kappa - 0.1;
            pagels_kappa = Math.round(10*pagels_kappa)/10;
            kappaChanged();
            refreshTitle();
        }
    }
    
    /*
    addStringDropdown(details_div, "diversification", "diversification", diversification_choices, diversification_default, function() {
        let i = d3.select(this).property('selectedIndex');
        diversification = parseFloat(diversification_choices[i]);
        lambda = diversification/(1.0 - turnover); // birth rate
        mu     = diversification*turnover/(1.0 - turnover); // death rate
        doSimulation();
    });

    addStringDropdown(details_div, "turnover", "turnover", turnover_choices, turnover_default, function() {
        let i = d3.select(this).property('selectedIndex');
        turnover = parseFloat(turnover_choices[i]);
        lambda = diversification/(1.0 - turnover); // birth rate
        mu     = diversification*turnover/(1.0 - turnover); // death rate
        doSimulation();
    });

    addStringDropdown(details_div, "rho", "rho", rho_choices, rho_default, function() {
        let i = d3.select(this).property('selectedIndex');
        rho = parseFloat(rho_choices[i]);
        doSimulation();
    });

    addStringDropdown(details_div, "rootage", "root age", root_age_choices, root_age_default, function() {
        let i = d3.select(this).property('selectedIndex');
        root_age = parseFloat(root_age_choices[i]);
        doSimulation();
    });
    */

    addButton(details_div, "simulate-button", "Simulate", function() {
        doSimulation();
    }, true);
    
    function showLambda() {
        if (pagel_parameter != "lambda") {
            pagel_parameter = "lambda";
            pagels_lambda = 1.0;
            lambdaChanged();
            refreshTitle();
        }
    }
    
    function showDelta() {
        if (pagel_parameter != "delta") {
            pagel_parameter = "delta";
            pagels_delta = 1.0;
            deltaChanged();
            refreshTitle();
        }
    }
    
    function showKappa() {
        if (pagel_parameter != "kappa") {
            pagel_parameter = "kappa";
            pagels_kappa= 1.0;
            kappaChanged();
            refreshTitle();
        }
    }
    
    function increaseCurrentPagelParameter() {
        if (pagel_parameter == "lambda") {
            increaseLambda();
        }
        else if (pagel_parameter == "delta") {
            increaseDelta();
        }
        else if (pagel_parameter == "kappa") {
            increaseKappa();
        }
        else {
            console.log("error: unknown pagel_parameter value: " + pagel_parameter);
        }
    }
    
    function decreaseCurrentPagelParameter() {
        if (pagel_parameter == "lambda") {
            decreaseLambda();
        }
        else if (pagel_parameter == "delta") {
            decreaseDelta();
        }
        else if (pagel_parameter == "kappa") {
            decreaseKappa();
        }
        else {
            console.log("error: unknown pagel_parameter value: " + pagel_parameter);
        }
    }
    
    function nextPagelParameter() {
        if (pagel_parameter == "lambda") {
            showDelta();
        }
        else if (pagel_parameter == "delta") {
            showKappa();
        }
        else if (pagel_parameter == "kappa") {
            showLambda();
        }
        else {
            console.log("error: unknown pagel_parameter value: " + pagel_parameter);
        }
    }
    
    function prevPagelParameter() {
        if (pagel_parameter == "lambda") {
            showKappa();
        }
        else if (pagel_parameter == "delta") {
            showLambda();
        }
        else if (pagel_parameter == "kappa") {
            showDelta();
        }
        else {
            console.log("error: unknown pagel_parameter value: " + pagel_parameter);
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
        console.log("key was pressed: " + d3.event.keyCode);
        if (d3.event.keyCode == 38) {
            // 38 is the "uparrow" key
            increaseCurrentPagelParameter();
        }
        else if (d3.event.keyCode == 40) {
            // 40 is the "downarrow" key
            decreaseCurrentPagelParameter();
        }
        else if (d3.event.keyCode == 68) {
            // 68 is the "D" key
            showDelta();
        }
        else if (d3.event.keyCode == 76) {
            // 76 is the "L" key
            showLambda();
        }
        else if (d3.event.keyCode == 75) {
            // 75 is the "K" key
            showKappa();
        }
        else if (d3.event.keyCode == 39) {
            // 39 is the "rightarrow" key
            nextPagelParameter();
        }
        else if (d3.event.keyCode == 37) {
            // 37 is the "leftarrow" key
            prevPagelParameter();
        }
    }
    d3.select("body")
        .on("keydown", keyDown);
    

</script>

## Literature Cited

M Pagel. 1999. Inferring the historical patterns of biological evolution. Nature 401:877-884. [DOI:10.1038/44766](https://doi.org/10.1038/44766)

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
