//    Copyright 2017 Paul O. Lewis
//
//    This file is part of d3phylogeny.
//
//    d3phylogeny is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    d3phylogeny is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with d3phylogeny.  If not, see http://www.gnu.org/licenses/.

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function POLPanel(parent, idprefix, t, l, w, h) {
    this.prefix = idprefix;
    this.top = t;
    this.left = l;
    this.width = w;
    this.height = h;

    this.div = parent.append("div")
        .attr("id", idprefix)
        .style("position", "absolute")
        .style("top", t.toString() + "px")
        .style("left", l.toString() + "px")
        .style("width", w.toString() + "px")
        .style("height", h.toString() + "px")
        .style("vertical-align", "top")
        .style("text-align", "center");
    }

POLPanel.prototype.setup = function() {
    }

function POLHelpPanel(parent, idprefix, t, l, w, h) {
    POLPanel.apply(this, [parent, idprefix, t, l, w, h]);

    // Immediately hide this.div created in POLPanel constructor
    this.div.style("display", "none");

    // Create SVG element
    this.svg = this.div.append("svg")
        .attr("id", "helpsvg")
        .attr("width", this.width)
        .attr("height", this.height);

    // define an arrowhead marker
    // see http://vanseodesign.com/web-design/svg-markers/
    var defs = this.svg.append("defs");

    defs.append("marker")
        .attr("id", "forwardarrow")
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("refX", 0)
        .attr("refY", 2)
        .attr("orient", "auto")
        .attr("markerUnits", "strokeWidth")
        .append("path")
        .attr("d", "M0,0 L0,4 L6,2 z")
        .attr("fill", "white");

    defs.append("marker")
        .attr("id", "reversearrow")
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("refX", 6)
        .attr("refY", 2)
        .attr("orient", "auto")
        .attr("markerUnits", "strokeWidth")
        .append("path")
        .attr("d", "M6,0 L6,4 L0,2 z")
        .attr("fill", "white");

    this.svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("fill", d3.color("rgba(0, 0, 0, .6)"))
        .on("click", function() {
            d3.select("div#helpbox").style("display", "none");
        });
    }

POLHelpPanel.prototype.infoArrow = function(x0, y0, x1, y1, lw, twoheaded = false) {
    var arrow = this.svg.append("line")
        .attr("x1", x0)
        .attr("y1", y0)
        .attr("x2", x1)
        .attr("y2", y1)
        .attr("stroke", "white")
        .attr("stroke-width", lw)
        .attr("marker-end", "url(#forwardarrow)");
    if (twoheaded)
        arrow.attr("marker-start", "url(#reversearrow)");
    }

POLHelpPanel.prototype.infoText = function(x, y, fontsize, msg) {
    this.svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-family", "Verdana")
        .attr("font-size", fontsize)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text(msg);
    }

POLHelpPanel.prototype.infoHTML = function(x, y, fontsize, msg) {
    this.svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-family", "Verdana")
        .attr("font-size", fontsize)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .html(msg);
    }

function POLCanvasPanel(parent, idprefix, t, l, w, h) {
    POLPanel.apply(this, [parent, idprefix, t, l, w, h]);

    // var div = parent.append("div")
    //     .attr("id", idprefix + "-canvas");

    // Create SVG element
    this.svg = this.div.append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("mousemove", this.mousemoving)
        .on("mouseout", this.mouseleaving)
        .on("mousedown", this.dragstarting)
        .on("mouseup", this.dragstopping);

    // Draw rect around plot area
    // this.svg.append("rect")
    //     .attr("class", "boundingbox")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", this.width)
    //     .attr("height", this.height)
    //     .attr("stroke", "black")
    //     .attr("fill", "lavender")
    //     .attr("visibility", (show_bounding_boxes ? "visibility" : "hidden"))
    //     .style("pointer-events", "none");

    }

POLCanvasPanel.prototype.mousemoving = function() {
    }

POLCanvasPanel.prototype.mouseleaving = function() {
    }

POLCanvasPanel.prototype.dragstarting = function() {
    }

POLCanvasPanel.prototype.dragstopping = function() {
    }

function POLPlotPanel(parent, idprefix, t, l, w, h, mean, stdev, limits, xlab, ylab) {
    POLPanel.apply(this, [parent, idprefix, t, l, w, h]);

    this.labeldata = null;
    this.linedata = null;
    this.dragging_enabled = true;
    this.is_dragging = false;

    this.xlabel = xlab;
    this.ylabel = ylab;

    // Parameters representing mean and standard deviation of the distribution being displayed
    this.mu = mean;
    this.sigma = stdev;

    // Number of segments used to draw curve
    this.nsegments = 100;

    // Margins
    this.left_padding = (limits.leftpad ? limits.leftpad : 60);
    this.right_padding = (limits.rightpad ? limits.rightpad : 60);
    this.top_padding = (limits.toppad ? limits.toppad : 60);
    this.bottom_padding = (limits.bottompad ? limits.bottompad : 60);
    //this.left_right_padding = 60;
    //this.top_bottom_padding = 60;

    // Axis limits
    this.min_x = limits.xmin;
    this.max_x = limits.xmax;
    this.min_y = limits.ymin;
    this.max_y = limits.ymax;

    this.x_ticks = (limits.xticks ? limits.xticks : 5);
    this.y_ticks = (limits.yticks ? limits.yticks : 5);
    this.x_precision = (limits.xprecision ? limits.xprecision : 1);
    this.y_precision = (limits.yprecision ? limits.yprecision : 1);

    // Create SVG element
    this.svg = this.div.append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("mousemove", this.mousemoving)
        .on("mouseout", this.mouseleaving)
        .on("mousedown", this.dragstarting)
        .on("mouseup", this.dragstopping);

    // Create scale for X axis
    this.xscale = d3.scaleLinear()
        .domain([this.min_x, this.max_x])
        .range([this.left_padding, this.width - this.left_padding - this.right_padding]);

    // Create scale for calculating range bands for x axis
    this.line_scale = d3.scaleBand()
        .domain(d3.range(this.nsegments + 1))
        .range(this.xscale.domain());

    // Create scale for Y axis
    this.yscale = d3.scaleLinear()
        .domain([this.min_y, this.max_y])
        .range([this.height - this.bottom_padding, this.top_padding]);

    // Create X axis
    this.xaxis = d3.axisBottom(this.xscale)
        .ticks(this.x_ticks)
        .tickFormat(d3.format("." + this.x_precision + "f"));

    // Create Y axis
    this.yaxis = d3.axisLeft(this.yscale)
        .ticks(this.y_ticks)
        .tickFormat(d3.format("." + this.y_precision + "f"));

    this.recalcLineData();
    this.recalcLabelData();

    // Create background rectangle used to capture drag events
    /*var bounding_rect = this.svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("fill", "white");*/ /*bookmark*/

    // Draw hidden rect around plot area that can be made visible for debugging purposes
    /*this.svg.append("rect")
        .attr("class", "boundingbox")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("stroke", "black")
        .attr("fill", "lavender")
        .attr("visibility", "hidden")
        .style("pointer-events", "none");*/

    // Add X axis to svg
    this.svg.append("g")
        .attr("id", this.prefix + "-xaxis")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (this.height - this.bottom_padding) + ")")
        .call(this.xaxis);

    // Add Y axis to svg
    this.svg.append("g")
        .attr("id", this.prefix + "-yaxis")
        .attr("class", "axis")
        .attr("transform", "translate(" + this.left_padding + ",0)")
        .call(this.yaxis);

    // Style the axes
    this.svg.selectAll('.axis line, .axis path')
        .style({'stroke': 'black', 'fill': 'none', 'stroke-width': '2px', 'shape-rendering': 'crispEdges'});
    this.svg.selectAll('.axis text')
        .style({'font-family': 'Verdana', 'font-size': '28px'});
    this.svg.selectAll('#xaxis.axis text')
        .attr("transform", "translate(0, 10)");

    // Create x axis label
    if (this.xlabel !== null) {
        this.svg.append("text")
            .attr("id", this.prefix + "-xlab")
            .attr("x", this.width/2)
            .attr("y", this.height - 20)
            .style("text-anchor", "middle")
            .style("font-family", "Verdana")
            .style("font-size", "8pt")
            .style("pointer-events", "none")
            .text(this.xlabel);
        }

    // Create y axis label
    if (this.ylabel !== null) {
        this.svg.append("text")
            .attr("id", this.prefix + "-ylab")
            .attr("x", 10)
            .attr("y", this.height/2)
            .attr("transform", "rotate(-90 10," + this.height/2 + ")")
            .style("text-anchor", "middle")
            .style("font-family", "Verdana")
            .style("font-size", "8pt")
            .style("pointer-events", "none")
            .text(this.ylabel);
        }

    var self = this;

    // Create line generator function
    this.lineFunc = d3.line()
        .x(function(d) {return self.xscale(d.x);})
        .y(function(d) {return self.yscale(d.y);});

    // Create lines
    // this.linedata is vector of objects {color:<color>, thickness:5, data:[{x:<float>, y:<float>}, {x:<float>, y:<float>}, ...]}
    this.linegroup = this.svg.append("g").attr("id", this.prefix + "-plotlines");

    // DEJAVU: I originally had this.linegroup.selectAll("path.plotline") here, and for appended path elements
    // I classed then with both "plotline" and a class specified in each element of this.linedata. This caused
    // some weird behaviour in that lines from one POLPlotPanel-derived plot ended up in the plot area of a separate
    // POLPlotPanel-derived plot, and were hidden (as if they were being plotted behind the elements of the plot
    // that they were transferred to). I never got to the bottom of this, and it seems as if it could be a d3 bug,
    // but the problem was solved by having just one class for each path element that equals this.prefix + "-plotline"
    this.linegroup.selectAll("path." + this.prefix + "-plotline")
        .data(this.linedata)
        .enter()
        .append("path")
        .classed(this.prefix + "-plotline", true)
        .attr("d", function(d) {return self.lineFunc(d.data);})
        .attr("fill", "none")
        .attr("stroke", function(d) {return d.color;})
        .attr("stroke-width", function(d) {return d.thickness + "px";})
        .style("pointer-events", "none");   // don't want line intercepting drag events

    this.labelgroup = this.svg.append("g").attr("id", this.prefix + "-plotlabels");
    this.labelgroup.selectAll("text." + this.prefix + "-plotlabel")
        .data(this.labeldata)
        .enter()
        .append("text")
        .classed(this.prefix + "-plotlabel", true)
        .attr("x", function(d) {return self.xscale(d.x);})
        .attr("y", function(d) {return self.yscale(d.y);})
        .attr("fill", function(d) {return d.color;})
        .text(function(d) {return d.text;})
        .style("font-size", function(d) {return d.size + "pt";})
        .style("text-anchor", "middle")
        .style("pointer-events", "none");   // don't want line intercepting drag events

    // Create scales for choosing scaling factors for sigma based on drag extent
    // The sigma_pos_scale is used if user drags downward
    // The sigma_pos_scale is used if user drags upward
    this.sigma_pos_scale = d3.scaleLinear()
        .domain([0,this.height])
        .range([0.0,limits.dymouse[1]]);
    this.sigma_neg_scale = d3.scaleLinear()
        .domain([0,-this.height])
        .range([0.0,limits.dymouse[0]]);

    // For drag behavior
    this.y_at_drag_start = null;
    this.sigma_at_drag_start = null;
    /*drag = d3.drag()
        .on("start", function(d) {
            self.dragstarting();
        })
        .on("drag", function(d) {
            self.mousemoving();
        })
        .on("end", function(d) {
            self.dragstopping();
        });

    bounding_rect.call(drag);*/ /*bookmark*/
    }

POLPlotPanel.prototype.recalcLabelData = function() {
    this.labeldata = [];
    }

POLPlotPanel.prototype.mousemoving = function() {
    // override this function and call handle_mousemoving from the override for the default behavior
    }

POLPlotPanel.prototype.mouseleaving = function() {
    // override this function and call handle_mouseleaving from the override for the default behavior
    }

POLPlotPanel.prototype.dragstarting = function() {
    // override this function and call handle_dragstarting from the override for the default behavior
    }

POLPlotPanel.prototype.dragstopping = function() {
    // override this function and call handle_dragstopping from the override for the default behavior
    }

POLPlotPanel.prototype.handle_mousemoving = function(mouse_event) {
    //console.log("POLPlotPanel.prototype.mousemoving");
    if (this.dragging_enabled && this.is_dragging) {
        //console.log("POLPlotPanel.prototype.mousemoving if dragging_enabled and is_dragging");
        // Move mu by the amount corresponding to the x-component of the drag
        this.mu = this.xscale.invert(this.xscale(this.mu) + mouse_event.movementX);
        if (this.mu < 0.0001)
            this.mu = 0.0001;

        // Adjust sigma based on extent of drag in vertical direction
        var dy = mouse_event.y - this.y_at_drag_start;
        if (dy < 0) {
            this.sigma = this.sigma_at_drag_start*Math.exp(this.sigma_neg_scale(dy));
        } else {
            this.sigma = this.sigma_at_drag_start*Math.exp(this.sigma_pos_scale(dy));
        }

        this.refreshPlot();
        this.duringdrag();
        }
    }

POLPlotPanel.prototype.handle_mouseleaving = function(mouse_event) {
    }

POLPlotPanel.prototype.handle_dragstarting = function(mouse_event) {
    //console.log("POLPlotPanel.prototype.dragstarting (this.dragging_enabled = " + (this.dragging_enabled ? "true" : "false") + ")");
    if (this.dragging_enabled) {
        this.is_dragging = true;
        this.y_at_drag_start = mouse_event.y;
        this.sigma_at_drag_start = this.sigma;
        //d3.select(this).classed("dragging", true);
        }
    }

POLPlotPanel.prototype.handle_dragstopping = function(mouse_event) {
    //console.log("POLPlotPanel.prototype.dragstopping");
    if (this.dragging_enabled) {
        this.is_dragging = false;
        //d3.select(this).classed("dragging", false);
        //console.log("Recalculating linedata...");

        // Recalculate linedata
        var self = this;
        this.recalcLineData();
        this.linegroup.selectAll("path.plotline")
            .transition()
            .duration(500)
            .attr("d", function(d) {return self.lineFunc(d.data);});

        this.afterdrag();
        }
    }

POLPlotPanel.prototype.enableDragging = function() {
    this.dragging_enabled = true;
    //console.log("dragging enabled");
    }

POLPlotPanel.prototype.disableDragging = function() {
    this.dragging_enabled = false;
    //console.log("dragging disabled");
    }

POLPlotPanel.prototype.duringdrag = function() {
    //console.log("POLPlotPanel.prototype.duringdrag");
    }

POLPlotPanel.prototype.afterdrag = function() {
    //console.log("POLPlotPanel.prototype.afterdrag");
    }

POLPlotPanel.prototype.refreshPlot = function() {
    var self = this;

    this.recalcLineData();
    this.linegroup.selectAll("path." + this.prefix + "-plotline").remove(); // ugly, should rewrite so that this is done only when necessary
    this.linegroup.selectAll("path." + this.prefix + "-plotline")
        .data(this.linedata)
        .enter()
        .append("path")
        .classed(this.prefix + "-plotline", true)
        .attr("d", function(d) {return self.lineFunc(d.data);})
        .attr("fill", "none")
        .attr("stroke", function(d) {return d.color;})
        .attr("stroke-width", function(d) {return d.thickness + "px";})
        .style("pointer-events", "none");   // don't want line intercepting drag events

    this.recalcLabelData();
    this.labelgroup.selectAll("text." + this.prefix + "-plotlabel").remove(); // ugly, should rewrite so that this is done only when necessary
    this.labelgroup.selectAll("text." + this.prefix + "-plotlabel")
        .data(this.labeldata)
        .enter()
        .append("text")
        .classed(this.prefix + "-plotlabel", true)
        .attr("x", function(d) {return self.xscale(d.x);})
        .attr("y", function(d) {return self.yscale(d.y);})
        .attr("fill", function(d) {return d.color;})
        .text(function(d) {return d.text;})
        .style("font-size", function(d) {return d.size + "pt";})
        .style("text-anchor", "middle")
        .style("pointer-events", "none");   // don't want line intercepting drag events
    }

POLPlotPanel.prototype.calcLogDensity = function(x) {
    // Exponential with mean mu
    var lambda = 1.0/this.param2;
    var logy = Math.log(lambda) - lambda*x;
    return logy;
    }

POLPlotPanel.prototype.recalcLineData = function() {
    this.recalcParams();    // calculate param1 and param2 from mu and sigma
    this.linedata = [];
    var line = {color:"blue", thickness:1, classs:"density", data:[]};
    for (var i = 1; i < this.nsegments + 1; i++) {
        // note that we skip i=0 to avoid calculating density at x=0.0 (which may be infinity)
        var x = this.line_scale(i);
        var logy = this.calcLogDensity(x);
        var y = Math.exp(logy);
        line.data.push({'x':x, 'y':y});
        }
    this.linedata.push(line);
    }

POLPlotPanel.prototype.recalcParams = function() {
    this.param1 = 1.0;
    this.param2 = this.mu;
    //console.log("recalcParams: mu = " + this.mu + ", sigma = " + this.sigma + ", shape = " + this.param1 + ", scale = " + this.param2);
    }

//addStringDropdown(details_div, "beta-dropdown", "substitution rate", ["0.1", "0.5", "1.0", "10.0"], 0, function() {
//  var selected_index = d3.select(this).property('selectedIndex');
//  ...
//  });
var addStringDropdown = function(panel, id, label, choices, default_choice, onfunc) {
    var control_div = panel.append("div")
        .attr("id", "outerdiv-" + id).append("div")
        .attr("id", "control-" + id)
        .attr("class", "control");
    var select = control_div.append("select")
        .attr("id", id)
        .on("change", onfunc);
    select.selectAll("option")
        .data(choices)
        .enter()
        .append("option")
        .attr("class", function(d) {return "choice"+d;})
        .property("selected", function(d,i) {return (i == default_choice ? true : false);})
        .text(function(d) {return d;});
    control_div.append("label")
        .style("font-family", "Verdana")
        .style("font-size", "10pt")
        .html("&nbsp;" + label);
    //console.log("selectedIndex for \"" + label + "\" dropdown = " + select.property("selectedIndex"));
    }

var addIntDropdown = function(panel, id, label, choices, default_choice, onfunc) {
    var control_div = panel.append("div").append("div")
        .attr("class", "control");
    var select = control_div.append("select")
        .attr("id", id)
        .on("change", onfunc);
    select.selectAll("option")
        .data(choices)
        .enter()
        .append("option")
        .attr("class", function(d) {return "choice"+d;})
        .property("selected", function(d,i) {return (i == default_choice ? true : false);})
        .text(function(d) {return d.toFixed(0);});
    control_div.append("label")
        .style("font-family", "Verdana")
        .style("font-size", "10pt")
        .html("&nbsp;" + label);
    //console.log("selectedIndex for \"" + label + "\" dropdown = " + select.property("selectedIndex"));
    }

// addSlider(controls_div, "rhoslider", "correlation", 100*(rho+1)/2, function() {
//     var pct = parseFloat(d3.select(this).property('value'));
//     rho = -1.0 + 2.0*pct/100;
//     beta1 = rho*sdY/sdX;
//     updatePlot();
// });
var addSlider = function(panel, id, label, starting_value, onfunc) {
    var control_div = panel.append("div").append("div")
        .attr("id", id)
        .attr("class", "control");
    control_div.append("input")
        .attr("id", id)
        .attr("type", "range")
        .attr("name", id)
        .attr("min", "0")
        .attr("max", "100")
        .attr("value", starting_value)
        .on("input", onfunc);
    control_div.append("label")
        .append("label")
        .attr("id", id)
        .html("&nbsp;" + label);
    }

var addNumberField = function(panel, id, label, def_value, min_value, max_value, step_value, onfunc) {
    var control_div = panel.append("div").append("div")
        .attr("id", id)
        .attr("class", "control");
    control_div.append("input")
        .attr("id", id)
        .attr("type", "number")
        .attr("name", id)
        .attr("value", def_value)
        .attr("step", step_value ? step_value : "")
        .attr("min", min_value ? min_value : "")
        .attr("max", max_value ? max_value : "")
        .on("change", onfunc);
    control_div.append("label")
        .append("label")
        .html("&nbsp;" + label);
    }

// addCheckbox(details_div, "prsame-checkbox", "Start all A", true, function() {
//   var checked = d3.select(this).property('checked');
//   ...
//   });
var addCheckbox = function(panel, id, label, checked_by_default, onfunc) {
    var control_div = panel.append("div").append("div")
        .attr("id", id)
        .attr("class", "control");
    control_div.append("input")
        .attr("id", id)
        .attr("type", "checkbox")
        .property("checked", checked_by_default)
        .on("change", onfunc);
    control_div.append("label")
        .append("label")
        .html("&nbsp;" + label);
    }

// addRadioButtons(this.div, "method-radio", "method", ["Compatibility", "Bottom --> Top", "Top --> Bottom"], "Compatibility", "Method", function() {
//   plot_panel.show_what = d3.select(this).attr("value");
//   ...
//   });
var addRadioButtons = function(panel, id, name, values, default_value, label, onfunc) {
    var control_div = panel.append("div").append("div")
        .attr("id", id)
        .attr("class", "control");
    control_div.append("label")
        .attr("id", id)
        .append("label")
        .html(label + ":&nbsp;&nbsp;");
    for (v in values) {
        control_div.append("input")
            .attr("type", "radio")
            .attr("name", name)
            .attr("value", values[v])
            .property("checked", (values[v] == default_value ? true : false))
            .on("change", onfunc);
        control_div.append("label")
            .html(values[v] + "&nbsp;&nbsp;&nbsp;");
        }
    }

// addButton(this.div, "showbtn", "Show/hide", function() {
//     strplot.toggleShowDeviations();
//     }, true);
var addButton = function(panel, id, label, onfunc, w, create_new_div) {
    var control_div = panel;
    if (create_new_div) {
        control_div = panel.append("div")
            .attr("id", "control-"+id)
            .attr("class", "control");
        }
    if (id) {
        //control_div.append("input")
        //    .attr("id", id)
        //    .attr("type", "button")
        //    .attr("value", label)
        //    .on("click", onfunc);
        control_div.append("button")
            .style("width", w)
            .attr("id", id)
            .on("click", onfunc)
            .text(label);
        }
    else {
        // control_div.append("input")
        //     .attr("type", "button")
        //     .attr("value", label)
        //     .on("click", onfunc);
        control_div.append("button")
            .style("width", w)
            .on("click", onfunc)
            .text(label);
        }
    }

/*    addPushButton(this.div, "choosestart", "Choose start point", "green"
        , function() {return robot_panel.choosing_start_point;}
        , function() {robot_panel.choosing_start_point = robot_panel.choosing_start_point ? false : true;}
        , false);
*/
var addPushButton = function(panel, id, label, bgcolor, accessfunc, togglefunc, create_new_div) {
    var control_div = panel;
    if (create_new_div) {
        control_div = panel.append("div")
            .attr("class", "control");
        }
    control_div.append("input")
        .attr("id", id)
        .attr("type", "button")
        .attr("value", label)
        .on("click", function() {
            togglefunc();
            var c = accessfunc() ? bgcolor : "buttonface";
            d3.select("input#" + id).style("background-color", c);
            });
    }

var addToggleButton = function(panel, id, onlabel, offlabel, accessfunc, togglefunc, create_new_div) {
    var control_div = panel;
    if (create_new_div) {
        control_div = panel.append("div")
            .attr("class", "control");
        }
    var label = onlabel;
    if (accessfunc())
        label = offlabel;
    control_div.append("input")
        .attr("id", id)
        .attr("type", "button")
        .attr("value", label)
        .on("click", function() {
            togglefunc();
            d3.select("input#" + id).attr("value", accessfunc() ? offlabel : onlabel);
            });
    }

//addStatusText(this.div, "tvalue", "<strong>t:</strong> " + this.t.toFixed(1), true);
var addStatusText = function(panel, id, html_content, create_new_div) {
    var control_div = panel;
    if (create_new_div) {
        control_div = panel.append("div")
        .attr("id", id)
        .attr("class", "control");
        }
    control_div.append("p")
        .attr("id", id)
        .style("margin-left", "1em")
        .style("margin-right", "1em")
        .style("font-family", "Verdana")
        .style("font-size", "10pt")
        .style("display", "inline-block")
        .html(html_content);
    }

function inherit(p) {
    if (p == null)
        throw TypeError();
    if (Object.create)
        return Object.create(p);
    var t = typeof p;
    if (t !== "object" && t !== "function")
        throw TypeError();
    function f() {};
    f.prototype = p;
    return new f();
    }
