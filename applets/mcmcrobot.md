---
layout: applet
title: MCMC Robot
author: Paul O. Lewis
permalink: /applets/mcmc-robot/
---
## MCMC Robot applet

[Markov chain Monte Carlo (MCMC)](https://en.wikipedia.org/wiki/Markov_chain_Monte_Carlo) is a form of computer simulation that can be used to create a "topographical map" of a probability density surface. This applet allows you to create your own two-dimensional "landscape" composed of a mixture of bivariate normal "hills". A metaphorical "MCMC robot" walks around on this surface, and the rules that it follows about where to step next end up causing it to spend an amount of time in any one spot that is proportional to the probability density of that spot. 

<div id="mcmcrobot"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 21-July-2017 (uploaded 3-Mar-2020)
    
    var color1 = "cyan";
    var color2 = "green";
    var color3 = "orange";
    var color4 = "red";
    var colorfail = "magenta";
    var linewidth = 2;
    var dotradius0 = 5;
    var dotradius = 3;

    //##################################
    //############# Chain ##############
    //##################################
    
    function Chain(chain_power, col, pzero) {
        this.color = col;
        this.power = chain_power;
        this.robotsteps = [];
        this.failedsteps = [];
        this.p0 = pzero;
        this.prevp = this.p0;
        }

    Chain.prototype.foray = function(nsteps) {
        //console.log("chain with power " + this.power.toFixed(3) + " proposing " + nsteps + " steps");
        var p = this.prevp;
        for (var i = 0; i < nsteps; i++) {
            p = robot_panel.proposeStep(this);
            this.robotsteps.push({prev:this.prevp, curr:p});
            this.prevp = p;
            }
        }

    //##################################
    //############## Hill ##############
    //##################################
    
    function Hill(x,y,radius,i) {
        this.number = i;
        this.cx = x;
        this.cy = y;
        this.r95 = radius;
        this.r50 = this.calc50from95(radius);
        }

    Hill.prototype.calc50from95 = function(radius) {
        return 0.4810179*radius;
        }

    Hill.prototype.proximity = function(p) {
        var d = Math.sqrt(Math.pow(this.cx - p[0],2) + Math.pow(this.cy - p[1],2));
        if (d < this.r50) {
            return 2;
            }
        else if (d < this.r95) {
            return 1;
            }
        return 0;
        }

    //##################################
    //########## RobotPanel ############
    //##################################
    
    function RobotPanel(parent, idprefix, t, l, w, h) {
        this.prefix = idprefix;
        this.top = t;
        this.left = l;
        this.width = w;
        this.height = h;

        this.div = parent.append("div")
            .attr("id", idprefix)
            //.style("position", "absolute")
            //.style("top", t.toString() + "px")
            //.style("left", l.toString() + "px")
            .style("width", w.toString() + "px")
            .style("height", h.toString() + "px")
            .style("vertical-align", "top")
            .style("text-align", "center");
        
        // Create SVG element
        this.svg = this.div.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .on("mousemove", this.mousemoving)
            .on("mouseout", this.mouseleaving)
            .on("mousedown", this.dragstarting)
            .on("mouseup", this.dragstopping);
        
        }

    //RobotPanel.prototype.setup = function() {
    //}

    //function RobotPanel(parent, prefix, top, left, width, height) {
    //    POLCanvasPanel.apply(this, arguments);
    //    }
    //RobotPanel.prototype = inherit(POLCanvasPanel.prototype);
    //RobotPanel.constructor = RobotPanel;

    RobotPanel.prototype.setup = function() {
        this.logging = false;

        //this.editing = false;
        this.lot = new Random(13579);

        // width and height of robot's field
        this.plot_width = this.width;
        this.plot_height = this.height;

        // settings
        this.power_alpha = 0.5; // power for chain k = 0, 1, ..., K will be [(K-k)/K]^{1/power_alpha}, where K = nchains-1
        this.chain_colors = [color1, color2, color3, color4];

        this.mean_step_lengths = [1,5,10,50,100,500];
        this.mean_step_length = 50;

        this.CVs = [0,1,5,10,100];
        this.CV = 1;

        this.steps_per_foray = [1, 10, 100, 1000];
        this.nsteps = 100;

        this.chain_number_choices = [1, 2, 3, 4];
        this.nchains = 1;

        this.chain_view_choices = ["1","2","3","4","all"];
        this.showchain = "all";

        this.min_radius = 2.0;

        // Wrapped-Normal distribution determines bias in the angle component of the proposal distribution
        // https://en.wikipedia.org/wiki/Wrapped_normal_distribution
        // http://stats.stackexchange.com/questions/146424/sample-from-a-von-mises-distribution-by-transforming-a-rv
        this.bias_mean_choices = ["0", "45", "90", "135", "180", "225", "270", "315"];
        this.bias_mean_choice = "0";    // current value from bias_mean_choices
        this.bias_mean_radians = 0.0;   // value actually used (calculated from bias_mean_choice)
        this.bias_sd_choices = ["1", "1.5", "2", "unbiased"];
        this.bias_sd_choice = "unbiased";   // current value from bias_sd_choices
        this.bias_sd = 10.0;               // value actually used (calculated from bias_sd_choice)

        // statistics
        this.n_cold_steps = 0;
        this.pct_inner = 0.0;
        this.pct_outer = 0.0;

        // booleans
        this.show_fails = true;
        this.show_trajectory = true;
        this.swapping_chains = true;
        this.MwG = false;
        this.last_MwG_vertical = false;

        // data for bivariate normal hills (vector of Hill objects)
        this.hills = [];

        // drag related
        this.drag_start = null;
        this.hill_being_moved = null;
        this.hill_selected = null;

        // This is the black background for the field in which the robot moves
        this.svg.append("rect")
            .attr("id", "plotarea")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.plot_width)
            .attr("height", this.plot_height)
            .style("fill", "black");

        // These are groups into which the lines and circles representing steps are
        // placed (ensures that chains with lower indices will be drawn on top of
        // chains with higher indices)
        this.g = [];
        this.g[3] = this.svg.append("g").attr("id", "chain3");
        this.g[2] = this.svg.append("g").attr("id", "chain2");
        this.g[1] = this.svg.append("g").attr("id", "chain1");
        this.g[0] = this.svg.append("g").attr("id", "chain0");

        // These are the filled circles representing the starting point for each chain
        for (var c = 0; c < 4; c++) {
            this.g[c].append("circle")
                .classed("start start"+ c, true)
                .attr("cx", 1)
                .attr("cy", 1)
                .attr("r", dotradius0)
                .attr("visibility", "hidden")
                .style("fill", this.chain_colors[c]);
            }

        // data for chains
        this.setupChains();

        // This is the circle that will be visible when the mouse is dragged to create a new hill
        this.svg.append("circle")
            .attr("id", "ninetyfive")
            .attr("cx", 0.5*this.plot_width)
            .attr("cy", 0.5*this.plot_height)
            .attr("r", 0.5*this.plot_width)
            .attr("visibility", "hidden")
            .style("stroke-width", 1)
            .style("stroke", "white");

        // These are the square handles that define the hill that is being moved
        this.handle_data  = [
            {compass:"E",  angle:0            },
            {compass:"NE", angle:Math.PI/4    },
            {compass:"N",  angle:Math.PI/2    },
            {compass:"NW", angle:3*Math.PI/4  },
            {compass:"W",  angle:Math.PI      },
            {compass:"SW", angle:5*Math.PI/4  },
            {compass:"S",  angle:3*Math.PI/2  },
            {compass:"SE", angle:7*Math.PI/4  }
            ];
        this.svg.selectAll("rect.handle")
            .data(this.handle_data)
            .enter()
            .append("rect")
            .attr("id", function(d) {return "handle" + d.compass;})
            .attr("class", "handle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 4)
            .attr("height", 4)
            .attr("visibility", "hidden")
            .style("fill", "white");

        if (true) {
            // one hill to begin with
            this.hills.push(new Hill(this.plot_width/2, this.plot_height/2, 0.25*this.plot_width, this.hills.length));
            }
        else {
            // two hills to begin with
            this.hills.push(new Hill(1*this.plot_width/4, 1*this.plot_height/4, 0.1*this.plot_width, this.hills.length));
            this.hills.push(new Hill(3*this.plot_width/4, 3*this.plot_height/4, 0.1*this.plot_width, this.hills.length));
            }
        this.showNewHills();

        var tooltip = d3.select("div#mcmcworkspace").append("div")
            .attr("id", "tooltip")
            .attr("class", "hidden");
        tooltip.append("p")
            .html("<strong>Cold chain statistics:</strong>");
        tooltip.append("p").append("span")
            .attr("id", "coldstatsinfo");
        tooltip.append("div").append("input")
            .attr("id", "coldstatsbtn")
            .attr("type", "button")
            .attr("value", "OK")
            .on("click", function() {
                d3.select("div#tooltip").classed("hidden", true);
                });

        this.setupSettings();
        }

    RobotPanel.prototype.setupSettings = function() {
        var settings = d3.select("div#mcmcworkspace").append("div")
            .attr("id", "settings")
            .attr("class", "hidden");

        // Add a drop-down list allowing user to choose number of steps to take in each foray
        addIntDropdown(settings, "steps-per-foray", "Steps/foray", robot_panel.steps_per_foray, robot_panel.steps_per_foray.indexOf(robot_panel.nsteps), function() {
            var selected_index = d3.select(this).property('selectedIndex');
            robot_panel.nsteps = robot_panel.steps_per_foray[selected_index];
            //console.log("robot_panel.nsteps = " + robot_panel.nsteps);
            });

        d3.select("#steps-per-foray")
            .style("margin", "2px");

        // Add a drop-down list allowing user to choose among several possible mean step lengths
        addIntDropdown(settings, "step-length-mean", "Step length mean", robot_panel.mean_step_lengths, robot_panel.mean_step_lengths.indexOf(robot_panel.mean_step_length), function() {
            var selected_index = d3.select(this).property('selectedIndex');
            robot_panel.mean_step_length = robot_panel.mean_step_lengths[selected_index];
            //console.log("robot_panel.mean_step_length = " + robot_panel.mean_step_length);
            });

        d3.select("#step-length-mean")
            .style("margin", "2px");

        // Add a drop-down list allowing user to choose among several possible coefficients of variation for step length
        addIntDropdown(settings, "step-length-cv", "Step length sd/mean", robot_panel.CVs, robot_panel.CVs.indexOf(robot_panel.CV), function() {
            var selected_index = d3.select(this).property('selectedIndex');
            robot_panel.CV = robot_panel.CVs[selected_index];
            //console.log("robot_panel.CV = " + robot_panel.CV);
            });

        d3.select("#step-length-cv")
            .style("margin", "2px");

        // Add a drop-down list allowing user to choose how many chains to use
        addIntDropdown(settings, "num-chains", "Number of chains", robot_panel.chain_number_choices, robot_panel.chain_number_choices.indexOf(robot_panel.nchains), function() {
            robot_panel.clearStepData();
            var selected_index = d3.select(this).property('selectedIndex');
            robot_panel.nchains = robot_panel.chain_number_choices[selected_index];
            robot_panel.setupChains();
            robot_panel.showSteps();
            //console.log("robot_panel.nchains = " + robot_panel.nchains);
            });

        d3.select("#num-chains")
            .style("margin", "2px");

        // Add a drop-down list allowing user to choose which chain (or "all") to show
        addStringDropdown(settings, "show-chain", "Show chain", robot_panel.chain_view_choices, robot_panel.chain_view_choices.indexOf(robot_panel.showchain), function() {
            var selected_index = d3.select(this).property('selectedIndex');
            robot_panel.showchain = robot_panel.chain_view_choices[selected_index];
            robot_panel.showSteps();
            //console.log("robot_panel.showchain = " + robot_panel.showchain);
            });

        d3.select("#show-chain")
            .style("margin", "2px");

        // Create a div element in which to place bias-related items
        var biasdiv = settings.append("div")
            .style("padding", "2px");

        // Add a drop-down list allowing user to choose mean of the wrapped-normal distribution that determines directional bias
        addStringDropdown(biasdiv, "bias-mean", "Bias mean", robot_panel.bias_mean_choices, robot_panel.bias_mean_choices.indexOf(robot_panel.bias_mean_choice), function() {
            var selected_index = d3.select(this).property('selectedIndex');
            robot_panel.bias_mean_choice = robot_panel.bias_mean_choices[selected_index];
            robot_panel.bias_mean_radians = -2.0*Math.PI*parseFloat(robot_panel.bias_mean_choice)/360.0;
            //console.log("robot_panel.bias_mean = " + robot_panel.bias_mean_radians);
            });

        // Add a drop-down list allowing user to choose standard deviation of the wrapped-normal distribution that determines directional bias
        addStringDropdown(biasdiv, "bias-sd", "Bias std. dev.", robot_panel.bias_sd_choices, robot_panel.bias_sd_choices.indexOf(robot_panel.bias_sd_choice), function() {
            var selected_index = d3.select(this).property('selectedIndex');
            robot_panel.bias_sd_choice = robot_panel.bias_sd_choices[selected_index];
            if (robot_panel.bias_sd_choice == "unbiased") {
                d3.select("select#bias-mean")
                    .property("disabled", true);
                robot_panel.bias_sd = 1000.0;
                }
            else {
                d3.select("select#bias-mean")
                    .property("disabled", false);
                robot_panel.bias_sd = parseFloat(robot_panel.bias_sd_choice);
                }
            //console.log("robot_panel.bias_sd = " + robot_panel.bias_sd);
            });

        // If unbiased, disable mean dropdown list
        if (robot_panel.bias_sd_choice == "unbiased") {
            d3.select("select#bias-mean")
                .property("disabled", true);
            }

        // Create a div element in which to stuff most of the remaining buttons
        var btndiv = settings.append("div")
            .style("padding", "2px");

        addToggleButton(btndiv, "showfails", "Show fails", "Hide fails"
            , function() {return robot_panel.show_fails;}
            , function() {robot_panel.show_fails = robot_panel.show_fails ? false : true; robot_panel.showSteps();}
            , false);

        addToggleButton(btndiv, "showtrajectory", "Show trajector", "Hide trajectory"
            , function() {return robot_panel.show_trajectory;}
            , function() {robot_panel.show_trajectory = robot_panel.show_trajectory ? false : true; robot_panel.showSteps();}
            , false);

        addToggleButton(btndiv, "swapchains", "Swapping", "No swapping"
            , function() {return robot_panel.swapping_chains;}
            , function() {robot_panel.swapping_chains = robot_panel.swapping_chains ? false : true;}
            , false);

        addToggleButton(settings, "mwgbtn", "Metropolis within Gibbs", "Metropolis"
            , function() {
                if (robot_panel.MwG)
                   d3.select("p#status").text("Using Metropolis within Gibbs");
                else
                   d3.select("p#status").text("Using Metropolis");
                return robot_panel.MwG;}
            , function() {robot_panel.MwG = robot_panel.MwG ? false : true}
            , true);

        d3.select("#mwgbtn")
            .style("margin", "2px");

        settings.append("div").append("input")
            .attr("id", "settingsbtn")
            .attr("type", "button")
            .attr("value", "OK")
            .style("margin", "2px")
            .on("click", function() {
                d3.select("div#settings").classed("hidden", true);
                });
        }

    RobotPanel.prototype.setupChains = function() {
        this.chain = [];
        var K = this.nchains - 1;
        for (var k = 0; k < 4; k++) {
            if (k <= K) {
                var pzero = [this.lot.random(0,1)*this.width,this.lot.random(0,1)*this.height];
                var power = K == 0 ? 1.0 : Math.pow(1.0*(K-k)/K, 1.0/this.power_alpha);
                var chain = new Chain(power, this.chain_colors[k], pzero);
                this.chain.push(chain);
                d3.select("select#show-chain option.choice" + (k+1))
                    .property("disabled", false);
                d3.select("circle.start" + k)
                    .attr("cx", pzero[0])
                    .attr("cy", pzero[1])
                    .attr("visibility", "visible");
                }
            else {
                d3.select("select#show-chain option.choice" + (k+1))
                    .property("disabled", true);
                d3.select("circle.start" + k)
                    .attr("visibility", "hidden");
                }
            }
        this.showSteps();
        }

    RobotPanel.prototype.showSteps = function() {
        //console.log("Showing steps (show_fails = " + this.show_fails + ")");

        if (this.showchain == "all") {
            for (var c = 0; c < this.nchains; c++)
                {
                // Show all circles representing starting points
                d3.selectAll("circle.start"+c)
                    .attr("visibility", "visible");

                // Show circles representing steps taken
                d3.selectAll("circle.step"+c)
                    .attr("visibility", "visible");

                // Show lines connecting new steps
                d3.selectAll("line.step"+c)
                    .attr("visibility", this.show_trajectory ? "visible" : "hidden");

                // Show lines representing failed steps
                d3.selectAll("line.fail"+c)
                    .attr("visibility", this.show_fails ? "visible" : "hidden");
                }
            }
        else {
            var c = parseInt(this.showchain) - 1;
            //console.log("c = " + c);

            // Hide all circles and lines
            d3.selectAll("circle.start")
                .attr("visibility", "hidden");
            d3.selectAll("circle.step")
                .attr("visibility", "hidden");
            d3.selectAll("line.step")
                .attr("visibility", "hidden");
            d3.selectAll("line.fail")
                .attr("visibility", "hidden");

            // Show circle representing starting point for chain c
            d3.selectAll("circle.start" + c)
                .attr("visibility", "visible");

            // Show circles representing steps taken
            d3.selectAll("circle.step" + c)
                .attr("visibility", "visible");

            // Show lines connecting new steps
            d3.selectAll("line.step" + c)
                .attr("visibility", this.show_trajectory ? "visible" : "hidden");

            // Show lines representing failed steps
            d3.selectAll("line.fail" + c)
                .attr("visibility", this.show_fails ? "visible" : "hidden");
            }
        }

    RobotPanel.prototype.createNewPoints = function(c) {
        // Create new filled circles representing steps taken by chain c
        var chain_visible = (this.showchain == "all" || parseInt(this.showchain) == c+1);
        /*
        console.log("chain " + c + ":");
        console.log("   power = " + this.chain[c].power.toFixed(3));
        console.log("   robotsteps.length  = " + this.chain[c].robotsteps.length);
        console.log("   failedsteps.length = " + this.chain[c].failedsteps.length);
        if (chain_visible)
            console.log("   visible");
        else
            console.log("   hidden");
        */

        this.g[c].selectAll("circle.step" + c)
            .data(this.chain[c].robotsteps)
            .enter()
            .append("circle")
            .classed("step step" + c, true)
            .attr("cx", function(d) {return d.curr[0];})
            .attr("cy", function(d) {return d.curr[1];})
            .attr("r", dotradius)
            .attr("visibility", chain_visible ? "visible" : "hidden")
            .style("fill", this.chain[c].color);

        // Create new lines connecting new steps
        this.g[c].selectAll("line.step" + c)
            .data(this.chain[c].robotsteps)
            .enter()
            .append("line")
            .classed("step step" + c, true)
            .attr("x1", function(d) {return d.prev[0];})
            .attr("y1", function(d) {return d.prev[1];})
            .attr("x2", function(d) {return d.curr[0];})
            .attr("y2", function(d) {return d.curr[1];})
            .attr("visibility", (chain_visible && this.show_trajectory) ? "visible" : "hidden")
            .style("stroke-width", linewidth)
            .style("stroke", this.chain[c].color);

        // Create new colorfail lines showing failed steps
        this.g[c].selectAll("line.fail" + c)
            .data(this.chain[c].failedsteps)
            .enter()
            .append("line")
            .classed("fail fail" + c, true)
            .attr("x1", function(d) {return d.prev[0];})
            .attr("y1", function(d) {return d.prev[1];})
            .attr("x2", function(d) {return d.curr[0];})
            .attr("y2", function(d) {return d.curr[1];})
            .attr("visibility", (chain_visible && this.show_fails) ? "visible" : "hidden")
            .style("stroke-width", linewidth)
            .style("stroke", colorfail);

        //console.log("   no. circle.step" + c + " = " + d3.selectAll("circle.step" + c).size())
        }

    RobotPanel.prototype.clearSelectedHill = function() {
        this.svg.selectAll("rect.handle").attr("visibility", "hidden");
        this.hill_selected = null;
        }

    RobotPanel.prototype.clearStepData = function() {
        //console.log("Clearing all steps");
        this.clearSelectedHill();
        d3.selectAll("circle.step").remove();
        d3.selectAll("line.step").remove();
        d3.selectAll("line.fail").remove();
        for (var c = 0; c < this.nchains; c++) {
            this.chain[c].robotsteps = [];
            this.chain[c].failedsteps = [];
            this.chain[c].prevp = this.chain[c].p0;
            }
        }

    RobotPanel.prototype.showNewHills = function() {
        //console.log("Showing all newly-defined hills");

        // Create new white circles representing 95% contour of hills
        this.svg.selectAll("circle.hill95")
            .data(this.hills)
            .enter()
            .append("circle")
            .classed("hill hill95", true)
            .attr("cx", function(d) {return d.cx;})
            .attr("cy", function(d) {return d.cy;})
            .attr("r", function(d) {return d.r95;})
            .attr("visibility", "visible")
            .style("stroke", "white")
            .style("fill", "none");

        // Create new white circles representing 50% contour of hills
        this.svg.selectAll("circle.hill50")
            .data(this.hills)
            .enter()
            .append("circle")
            .classed("hill hill50", true)
            .attr("cx", function(d) {return d.cx;})
            .attr("cy", function(d) {return d.cy;})
            .attr("r", function(d) {return d.r50;})
            .attr("visibility", "visible")
            .style("stroke", "white")
            .style("fill", "none");
        }

    RobotPanel.prototype.clearHillData = function() {
        //console.log("Clearing all hills");
        this.hills = [];
        this.svg.selectAll("circle.hill").remove();
        this.clearStepData();
        }

    RobotPanel.prototype.densityAt = function(x, y, power) {
        // need to take account of rho here (currently assuming rho=0)
        var n = this.hills.length;
        var f = 0.0;
        if (n == 0) {
            // return 1 if there are no hills defined
            f = 1.0;
        } else {
            // Return mixture density if there are hills defined
            //
            // Transforming the bivariate normal density to polar coordinates,
            //   alpha = int_0^{2 pi} int_0^{r_alpha} f(r,theta) dr dtheta
            //         = 1 - exp{-r_alpha^2/(2 sigma^2)}
            // r_alpha = sigma sqrt{-2 log(1 - alpha)}
            //
            // Let c_alpha = sqrt{-2 log(1 - alpha)}
            // r_alpha = sigma c_alpha
            // sigma = r_alpha/c_alpha
            //
            var c95 = Math.sqrt(-2.0*Math.log(0.05));
            var mixingProp = 1.0/n;
            for (var h in this.hills) {
                var hill = this.hills[h];
                var sX = hill.r95/c95;
                var sY = sX;
                var muX = hill.cx;
                var muY = hill.cy;
                var tmp = Math.pow((x - muX)/sX, 2.0) + Math.pow((y - muY)/sY, 2.0);
                var expTerm = Math.exp(-tmp/2.0);
                var denom = 2.0*Math.PI*sX*sY;
                var fHill = expTerm/denom;
                f += mixingProp*fHill;
            }
        }
        return Math.pow(f,power);
    }

    RobotPanel.prototype.foray = function() {
        // Take the next set of steps

        //console.log("RobotPanel.prototype.foray: nchains = " + this.nchains);
        for (var n = 0; n < this.nsteps; n++) {
            for (var crev = 0; crev < this.nchains; crev++) {
                //var c = this.nchains - crev - 1;
                this.chain[crev].foray(1);
                }

            // swap two random chains if swapping is turned on
            if (this.swapping_chains && this.nchains > 1) {
                if (this.nchains == 2) {
                    var chain_a = 0;
                    var chain_b = 1;
                    }
                else {
                    // make list of available chains
                    var available = d3.range(0, this.nchains);

                    // choose index of first chain to be swapped
                    var which = Math.floor(available.length*this.lot.random(0,1));
                    var chain_a = available.splice(which, 1);

                    // choose index of second chain to be swapped
                    which = Math.floor(available.length*this.lot.random(0,1));
                    var chain_b = available[which];
                    }
                this.swapChains(chain_a, chain_b);
                }

            // show newly created points from all chains
            for (c = 0; c < this.nchains; c++) {
                this.createNewPoints(c);
                }
            }

        // Update cold chain statistics
        this.n_cold_steps = this.chain[0].robotsteps.length;
        if (this.MwG) {
            d3.select("p#status")
                .text("" + this.n_cold_steps + " Metropolis within Gibbs steps taken");
        } else {
            d3.select("p#status")
                .text("" + this.n_cold_steps + " Metropolis steps taken");
            }
        }

    RobotPanel.prototype.calcColdChainStatistics = function() {
        // Update cold chain statistics
        var n_cold_inner = 0;
        var n_cold_outer = 0;
        this.n_cold_steps = this.chain[0].robotsteps.length;
        for (var i in this.chain[0].robotsteps) {
            var p = this.chain[0].robotsteps[i].curr;
            for (var j in this.hills) {
                var h = this.hills[j];
                var prox = h.proximity(p);
                if (prox == 1) {
                    n_cold_outer++;
                    break;
                    }
                else if (prox == 2) {
                    n_cold_outer++;
                    n_cold_inner++;
                    break;
                    }
                }
            }
        this.pct_inner = this.n_cold_steps == 0 ? 0.0 : 100.0*n_cold_inner/this.n_cold_steps;
        this.pct_outer = this.n_cold_steps == 0 ? 0.0 : 100.0*n_cold_outer/this.n_cold_steps;
        }

    RobotPanel.prototype.swapChains = function(a, b) {
        // Propose swap of chains a and b
        // Proposed state swap will be successful if a uniform random deviate is <=
        //    R = Ra * Rb = (Pa(b) / Pa(a)) * (Pb(a) / Pb(b))
        var apower = this.chain[a].power;
        var aprev = this.chain[a].prevp;

        var bpower = this.chain[b].power;
        var bprev = this.chain[b].prevp;

        // calculate log of accept ratio for chain a moving to point where chain b is located
        var log_a_at_a = Math.log(this.densityAt(aprev[0], aprev[1], apower));
        var log_a_at_b = Math.log(this.densityAt(bprev[0], bprev[1], apower));
        var logRa = log_a_at_b - log_a_at_a;

        // calculate log of accept ratio for chain b moving to point where chain a is located
        var log_b_at_a = Math.log(this.densityAt(aprev[0], aprev[1], bpower));
        var log_b_at_b = Math.log(this.densityAt(bprev[0], bprev[1], bpower));
        var logRb = log_b_at_a - log_b_at_b;

        var logR = logRa + logRb;

        var u = this.lot.random(0,1);
        var acceptable = (Math.log(u) < logR);
        if (acceptable) {
            //console.log("swapping chains " + a + " and " + b);
            // jump chain a to chain b's current location
            this.chain[a].robotsteps.push({prev:aprev, curr:bprev});
            this.chain[a].prevp = bprev;

            // jump chain b to chain a's current location
            this.chain[b].robotsteps.push({prev:bprev, curr:aprev});
            this.chain[b].prevp = aprev;
            }
        }

    RobotPanel.prototype.overlapsExistingHill = function(x, y, r) {
        for (i in this.hills) {
            var x0 = this.hills[i].cx;
            var y0 = this.hills[i].cy;
            var r95 = this.hills[i].r95;
            var distance_between_centers = Math.sqrt(Math.pow(x-x0,2) + Math.pow(y-y0,2));
            if (distance_between_centers < r + r95) {
                return this.hills[i];
                }
            }
        return null;
        }

    RobotPanel.prototype.insideHill = function(x, y) {
        for (i in this.hills) {
            var x0 = this.hills[i].cx;
            var y0 = this.hills[i].cy;
            var r95 = this.hills[i].r95;
            var r = Math.sqrt(Math.pow(x-x0,2) + Math.pow(y-y0,2));
            if (r < r95) {
                return this.hills[i];
                }
            }
        return null;
        }

    RobotPanel.prototype.proposeStep = function(chain) {
        var p0 = chain.prevp;

        // Calculate step distribution parameters from mean and CV of step length
        if (this.CV === 0) {
            var r = this.mean_step_length;
            }
        else {
            var variance = Math.pow(this.CV*this.mean_step_length, 2);
            var slbeta  = variance/this.mean_step_length;
            var slalpha = this.mean_step_length/slbeta;
            var r = this.lot.gamma(slalpha,slbeta);
            }

        var theta = 2.0*Math.PI*this.lot.random();
        if (this.bias_sd_choice != "unbiased") {
            // sample theta from a wrapped-normal distribution
            // http://stats.stackexchange.com/questions/146424/sample-from-a-von-mises-distribution-by-transforming-a-rv
            var x = this.lot.normal(this.bias_mean_radians, this.bias_sd);
            theta = x % (2.0*Math.PI);

            // ensure theta is a positive number
            if (theta < 0.0)
                theta = 2.0*Math.PI + theta;
            }

        if (this.MwG) {
            // old way - choose direction randomly, then snap to closest axis
            //if ((theta < Math.PI/4) || (theta > 7*Math.PI/4))
            //    theta = 0.0;
            //else if ((theta >= Math.PI/4) && (theta < 3*Math.PI/4))
            //    theta = Math.PI/2;
            //else if ((theta >= 3*Math.PI/4) && (theta < 5*Math.PI/4))
            //    theta = Math.PI;
            //else
            //    theta = 3*Math.PI/2;

            // new way
            // alternate between horizontal moves and vertical moves but use
            // direction to determine whether to go up or down (if vertical)
            // or left or right (if horizontal). This allows us to add
            // a bias if user has selected a directional bias.
            if (this.last_MwG_vertical) {
                // this one should be horizontal
                if ((theta < Math.PI/2) || (theta > 3*Math.PI/2)) {
                    theta = 0.0;
                    }
                else {
                    theta = Math.PI;
                    }
                this.last_MwG_vertical = false;
                }
            else {
                // this one should be vertical
                if ((theta < Math.PI) && (theta > 0)) {
                    theta = Math.PI/2;
                    }
                else {
                    theta = 3*Math.PI/2;
                    }
                this.last_MwG_vertical = true;
                }
            }
        var x = p0[0] + r*Math.cos(theta);
        var y = p0[1] + r*Math.sin(theta);
        var prev_density = this.densityAt(p0[0], p0[1], chain.power);
        var curr_density = this.densityAt(x, y, chain.power);
        var inside_bounds = 0.0;
        if (x >= 0.0 && x < this.plot_width && y >= 0.0 && y < this.plot_height) {
            inside_bounds = 1.0;
            }
        var u = this.lot.random(0.0,1.0);
        var R = inside_bounds*curr_density/prev_density;
        if (u < R) {
            // accepted
            if (this.logging)
                console.log("accept,"+x+","+y+","+curr_density+","+chain.power);
            return [x,y];
            }
        else {
            // proposed step rejected
            if (this.logging)
                console.log("reject,"+p0[0]+","+p0[1]+","+prev_density+","+chain.power);
            chain.failedsteps.push({prev:p0, curr:[x,y]});
            return p0;
            }
        }

    RobotPanel.prototype.setDragStartPoint = function(mousepos) {
        this.drag_start = mousepos;
        }

    RobotPanel.prototype.clearDragStartPoint = function() {
        this.drag_start = null;
        }

    RobotPanel.prototype.keydown = function(keycode) {
        console.log("key " + keycode + " pressed");
        if (robot_panel.hill_selected && keycode == 8) {
            console.log("removing hill " + robot_panel.hill_selected.number);
            this.svg.selectAll("circle.hill")
                .filter(function(d){return d.number == robot_panel.hill_selected.number;})
                .remove();
            this.svg.selectAll("rect.handle").attr("visibility", "hidden");
            var index = this.hills.indexOf(robot_panel.hill_selected);
            this.hills.splice(index, 1);
            }
        }

    RobotPanel.prototype.dragstarting = function() {
        var coords = d3.mouse(this);
        var x = coords[0];
        var y = coords[1];
        var mousepos = d3.mouse(this);
        robot_panel.setDragStartPoint(mousepos);
        robot_panel.hill_being_moved = robot_panel.insideHill(x,y);
        robot_panel.hill_selected = robot_panel.hill_being_moved;
        console.log("dragstarting: hill_selected = " + robot_panel.hill_selected);

        if (robot_panel.hill_being_moved) {
            // decorate hill being moved with handles
            d3.selectAll("rect.handle")
                .attr("x", function(d) {return robot_panel.hill_being_moved.cx + robot_panel.hill_being_moved.r95*Math.cos(d.angle) - 2;})
                .attr("y", function(d) {return robot_panel.hill_being_moved.cy + robot_panel.hill_being_moved.r95*Math.sin(d.angle) - 2;})
                .attr("visibility", "vislble");
            }
        else {
            // identify hill being created with circle
            d3.select("circle#ninetyfive")
                .attr("cx", mousepos[0])
                .attr("cy", mousepos[1])
                .attr("r", 0.0)
                .attr("visibility", "visible");

            // decorate hill being created with handles
            d3.selectAll("rect.handle")
                .attr("x", mousepos[0] - 2)
                .attr("y", mousepos[1] - 2)
                .attr("visibility", "vislble");
            }
        }

    RobotPanel.prototype.mousemoving = function() {
        if (robot_panel.drag_start) {
            //console.log("Mouse moving");
            var x0 = robot_panel.drag_start[0];
            var y0 = robot_panel.drag_start[1];
            var coords = d3.mouse(this);
            var x = coords[0];
            var y = coords[1];
            var dx = x - x0;
            var dy = y - y0;
            var r = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));

            if (robot_panel.hill_being_moved) {
                if (d3.event.altKey) {
                    // r95 is the r95 radius of the focal hill
                    var r95 = robot_panel.hill_being_moved.r95;

                    // rc is distance from current mouse position to center of focal hill
                    var xc = robot_panel.hill_being_moved.cx;
                    var yc = robot_panel.hill_being_moved.cy;
                    var rc = Math.sqrt(Math.pow(x - xc,2) + Math.pow(y - yc,2));

                    // r0 is distance from starting mouse position to center of focal hill
                    var r0 = Math.sqrt(Math.pow(x0 - xc,2) + Math.pow(y0 - yc,2));

                    // rr is the amount to add to r95
                    // rr is negative if the current mouse position is closer to the center of the focal hill
                    //    than the starting mouse position
                    var rr = r;
                    if (rc < r0)
                        rr = r95 - r > 0 ? -r : -r95;

                    //console.log("r = " + r.toFixed(1) + ", r0 = " + r0.toFixed(1) + ", rc = " + rc.toFixed(1) + ", rr = " + rr.toFixed(1));

                    // hill being resized
                    //console.log("resizing: cx = " + robot_panel.hill_being_moved.cx + ", cy = " + robot_panel.hill_being_moved.cy + ", dx = " + dx + ", dy = " + dy + ", r = " + r);
                    d3.selectAll("circle.hill95")
                        .filter(function(d){return d.number == robot_panel.hill_being_moved.number;})
                        .attr("r", robot_panel.hill_being_moved.r95 + rr);
                    d3.selectAll("circle.hill50")
                        .filter(function(d){return d.number == robot_panel.hill_being_moved.number;})
                        .attr("r", robot_panel.hill_being_moved.calc50from95(robot_panel.hill_being_moved.r95 + rr));
                    d3.selectAll("rect.handle")
                        .attr("x", function(d){return robot_panel.hill_being_moved.cx + (robot_panel.hill_being_moved.r95 + rr)*Math.cos(d.angle) - 2;})
                        .attr("y", function(d){return robot_panel.hill_being_moved.cy + (robot_panel.hill_being_moved.r95 + rr)*Math.sin(d.angle) - 2;});
                    }
                else {
                    d3.selectAll("circle.hill")
                        .filter(function(d){return d.number == robot_panel.hill_being_moved.number;})
                        .attr("cx", robot_panel.hill_being_moved.cx + dx)
                        .attr("cy", robot_panel.hill_being_moved.cy + dy);
                    d3.selectAll("rect.handle")
                        .attr("x", function(d){return robot_panel.hill_being_moved.cx + dx + robot_panel.hill_being_moved.r95*Math.cos(d.angle) - 2;})
                        .attr("y", function(d){return robot_panel.hill_being_moved.cy + dy + robot_panel.hill_being_moved.r95*Math.sin(d.angle) - 2;});
                    }
                }
            else {
                d3.select("circle#ninetyfive")
                    .attr("cx", x0)
                    .attr("cy", y0)
                    .attr("r", r);
                d3.selectAll("rect.handle")
                    .attr("x", function(d){return x0 + r*Math.cos(d.angle) - 2;})
                    .attr("y", function(d){return y0 + r*Math.sin(d.angle) - 2;});
                }

            }
        }

    RobotPanel.prototype.dragstopping = function() {
        //console.log("Drag stopping");
        var x0 = robot_panel.drag_start[0];
        var y0 = robot_panel.drag_start[1];
        var coords = d3.mouse(this);
        var x = coords[0];
        var y = coords[1];
        var dx = x - x0;
        var dy = y - y0;
        var r = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));

        //d3.selectAll("rect.handle")
        //    .attr("visibility", "hidden");

        if (robot_panel.hill_being_moved) {
            if (d3.event.altKey) {
                // r95 is the r95 radius of the focal hill
                var r95 = robot_panel.hill_being_moved.r95;

                // rc is distance from current mouse position to center of focal hill
                var xc = robot_panel.hill_being_moved.cx;
                var yc = robot_panel.hill_being_moved.cy;
                var rc = Math.sqrt(Math.pow(x - xc,2) + Math.pow(y - yc,2));

                // r0 is distance from starting mouse position to center of focal hill
                var r0 = Math.sqrt(Math.pow(x0 - xc,2) + Math.pow(y0 - yc,2));

                // rr is the amount to add to r95
                // rr is negative if the current mouse position is closer to the center of the focal hill
                //    than the starting mouse position
                var rr = r;
                if (rc < r0)
                    rr = r95 - r > 0 ? -r : -r95;

                robot_panel.hill_being_moved.r95 = r95 + rr;
                robot_panel.hill_being_moved.r50 = robot_panel.hill_being_moved.calc50from95(r95 + rr);
                d3.selectAll("circle.hill95")
                    .filter(function(d){return d.number == robot_panel.hill_being_moved.number;})
                    .attr("r", function(d) {return d.r95;});
                d3.selectAll("circle.hill50")
                    .filter(function(d){return d.number == robot_panel.hill_being_moved.number;})
                    .attr("r", function(d) {return d.r50;});
                robot_panel.hill_being_moved = null;
                }
            else {
                robot_panel.hill_being_moved.cx += dx;
                robot_panel.hill_being_moved.cy += dy;
                d3.selectAll("circle.hill")
                    .filter(function(d){return d.number == robot_panel.hill_being_moved.number;})
                    .attr("cx", function(d) {return d.cx;})
                    .attr("cy", function(d) {return d.cy;});
                robot_panel.hill_being_moved = null;
                }
            //console.log("dragstopping: hill_being_moved = null");
            }
        else {
            // Hide temporary circle showing hill being defined
            d3.select("circle#ninetyfive")
                .attr("visibility", "hidden");

            if (r < robot_panel.min_radius) {
                // Select new start point
                if (robot_panel.showchain == "all") {
                    //console.log("New starting point (" + robot_panel.drag_start[0] + "," + robot_panel.drag_start[1] + ") chosen for all " + robot_panel.nchains + " chains");
                    for (var c = 0; c < robot_panel.nchains; c++) {
                        var cx = robot_panel.drag_start[0];
                        var cy = robot_panel.drag_start[1];
                        //console.log("cx = " + cx.toFixed(1) + ", cy = " + cy.toFixed(1));
                        d3.select("circle.start" + c)
                            .attr("cx", cx)
                            .attr("cy", cy);
                        robot_panel.chain[c].p0 = robot_panel.drag_start;
                        }
                    }
                else {
                    var c = parseInt(robot_panel.showchain) - 1;
                    robot_panel.chain[c].p0 = robot_panel.drag_start;
                    d3.select("circle.start" + c)
                        .attr("cx", robot_panel.chain[c].p0[0])
                        .attr("cy", robot_panel.chain[c].p0[1]);
                    }
                robot_panel.clearStepData();
                }
            else {
                // Create new Hill object
                robot_panel.hills.push(new Hill(x0, y0, r, robot_panel.hills.length));
                robot_panel.showNewHills();
                }
            }
        robot_panel.clearDragStartPoint();
        }

    RobotPanel.prototype.mouseleaving = function() {
        //console.log("mouse leaving");
        }
        
    //##################################
    //########## ControlPanel ##########
    //##################################

    function ControlPanel(parent, idprefix, t, l, w, h) {
        this.prefix = idprefix;
        this.top = t;
        this.left = l;
        this.width = w;
        this.height = h;

        this.div = parent.append("div")
            .attr("id", idprefix)
            .style("layout", "inline-block")
            //.style("position", "absolute")
            //.style("top", t.toString() + "px")
            //.style("left", l.toString() + "px")
            .style("width", w.toString() + "px")
            .style("height", h.toString() + "px")
            .style("vertical-align", "top")
            .style("text-align", "center");
        }

    //function ControlPanel(parent, prefix, t, l, w, h) {
    //    POLPanel.apply(this, arguments);
    //    }
    //ControlPanel.prototype = inherit(POLPanel.prototype);
    //ControlPanel.constructor = ControlPanel;

    ControlPanel.prototype.setup = function() {
        addButton(this.div, "settingsbtn", "Settings", function() {
            // Show the tooltip
            d3.select("div#settings").classed("hidden", false);
            }, "100px", false);

        addButton(this.div, "statsbtn", "Stats", function() {
            robot_panel.calcColdChainStatistics();

            // Replace the text
            d3.select("span#coldstatsinfo")
                .html("Cold chain steps: " + robot_panel.n_cold_steps
                + "<br/>Percent inside inner circles: " + robot_panel.pct_inner.toFixed(1)
                + "<br/>Percent inside outer circles: " + robot_panel.pct_outer.toFixed(1));

            // Show the tooltip
            d3.select("div#tooltip").classed("hidden", false);

            }, "100px", false);

        addButton(this.div, "resetbtn", "Reset", function() {
            //console.log("Resetting (deletes both hill and step data)");
            robot_panel.clearStepData();
            robot_panel.clearHillData();
            }, "100px", false);

        addButton(this.div, "clearbtn", "Clear", function() {
            //console.log("Clearing (deletes step data but leaves hills intact)");
            robot_panel.clearStepData();
            }, "100px", false);

        addButton(this.div, "runbtn", "Run", function() {
            //console.log("Going on foray");
            robot_panel.foray();
            }, "100px", false);

        addStatusText(this.div, "status", "Ready", true);
        d3.select("div#status p#status").style("color", "white");
    }

    //##################################
    //############## Main ##############
    //##################################

    var field_width          = 800;
    var field_height         = 700;
    var spacer               =  20;
    var control_panel_height = 100;

    var mcmcrobot_div = d3.select("div#mcmcrobot")
        .attr("height", field_height+spacer+control_panel_height+"px");
    var container_div = mcmcrobot_div.append("div")
        .attr("id", "mcmcworkspace")
        .style("position", "relative");
    var robot_panel   = new RobotPanel(container_div, "robotpanel", 0, 0, field_width, field_height); // top, left, width, height
    var control_panel = new ControlPanel(container_div, "ctrl", field_height+spacer, 0, field_width, control_panel_height);   // top, left, width, height
    robot_panel.setup();
    control_panel.setup();

    d3.select("body")
        .on("keydown", function() {robot_panel.keydown(d3.event.keyCode);});

</script>

## Things to try

Here is the sequence of activities I normally use when demonstrating MCMC using this applet.

1. **Start far off** Click on the default hill and move it to the bottom left corner. Click near the upper right corner to choose a starting point as far away from the hill as possible. Click Run to show that the robot can quickly find its way to to base of the hill. Turn off trajectories and fails to see the burnin trail.

2. **Fails usually point away from hill** because those are downhill moves that are not automatically accepted.

3. **Summary statistics** After clicking Run a few times, click Stats to summarize. The percent inside inner circle should be about 50 and within the outer circle should be about 95.

4. **Baby steps** Clear and then choose step length mean equal to 1. Press run a few times to show that the robot heads toward the hill but using tiny steps. Clearly this step size would not lead to good mixing. Note that there are very few fails, however. Most steps succeed because none are "off a cliff".

5. **Giant leaps** Clear and then choose step length mean equal to 500. Press run a couple of times to show that there are many fails because the robot often proposes steps far away (and thus likely way downhill) from where it is currently.

6. **Metropolis within Gibbs** Reset step length mean to 50 and click Metropolis within Gibbs to show that alternating the dimension updated works well, despite the very rectangular paths taken.

7. **Hide trajectory** Hide both fails and trajectory to just see the distribution of points.

8. **Multimodal landscape** Reset to delete the default hill and create three small, isolated hills. Click somewhere near one of the hills, set the foray length to 1000 steps, and click Run. This shows that the robot usually gets stuck on the nearest hill to the starting point.

9. **Multiple chains** Switch to using 4 chains and repeat previous run (showing just the cold chain) to see the extensive swapping. Turn off trajetories and fails to see that mixing is much better.

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library. 
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
