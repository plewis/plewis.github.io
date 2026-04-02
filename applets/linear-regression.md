---
layout: applet
title: Linear Regression
permalink: /applets/linear-regression/
---

## Linear Regression

Illustrates the concept of linear regression.

Scroll down below the applet for more background and details.

<div id="forsvg"></div>
<script type="text/javascript">
    // written by Paul O. Lewis 2026-04-02
    
    let xy_same_scale = false;

    // scatterplot data
    //let scatter = [[2,1], [1,2], [3,3], [4,7], [5,6]];
    let scatter = [[4,1], [2,2], [6,3], [8,7], [10,6]];

    // Regression parameters
    let beta0mle = -0.4;
    //let beta1mle = 1.4;
    let beta1mle = 0.7;

    let beta0 = beta0mle;
    let beta1 = beta1mle;

    let thetamle = Math.atan(beta1mle);
    let theta = thetamle;
    let theta_incr = 0.02*Math.PI;

    let xmax = 12.0; // d3.max(scatter, function(d) {return d[0];});
    let xmin = 0.0; // d3.min(scatter, function(d) {return d[0];});
    let ymax = 10.0; // d3.max(scatter, function(d) {return d[1];});
    let ymin = -2.0; // d3.min(scatter, function(d) {return d[1];});
    
    let xcenter = 0.0;
    let ycenter = 0.0;
    
    // Define color range for background feedback
    let begin_color = 'red';
    let end_color   = 'silver';

    let xmean = calcXmean();
    let ymean = calcYmean();
    xcenter = xmean;
    ycenter = ymean;
    
    // normal density related
    let sigma = 0.7;
    let two_sigma_squared = 2.0*sigma*sigma;
    let nsegments = 100;

    let min_sum_of_squares = calcSS();
    let max_log_likelihood = -min_sum_of_squares/two_sigma_squared;
    let log_likelihood_range = 20.0;
    let min_log_likelihood = max_log_likelihood - log_likelihood_range;

    console.log("X mean     = " + xmean.toFixed(5));
    console.log("Y mean     = " + ymean.toFixed(5));
    console.log("Optimal SS = " + min_sum_of_squares.toFixed(5));
    console.log("theta      = " + theta);
    
    let precision_format = "d"; // use ".3f" (float) or "d" (integer)
    
    // width and height of svg
    let w = 800;
    let h = 800;
    let padding = 80;

    // plotting-related
    let brickred = "#B82E2E";
    let point_fill = "blue";
    let point_stroke = "blue";
    let point_stroke_width = 1;
    let point_radius = 10;
    let regression_line_color = end_color;
    let regression_line_width = 5;
    let residual_line_color = end_color
    let residual_line_width = 5;
    let residual_dash_array = "5,5,5";
    
    let status_text_x = 8.0;
    let status_text_y = -1.5;
    
    // axes labels
    let axis_label_height = 21;
    let axis_label_height_pixels = axis_label_height + "px";

    function calcy(x) {
        let y = beta0 + beta1*x; 
        
        return y
    }
    
    // Create path representing density curve
    var lineFunc = d3.line()
        .x(function(d) {return xscale(d.x);})
        .y(function(d) {return yscale(d.y);});

    let density_data = [];
    function recalcDensityData() {
        density_data = [];
        for (let k in scatter) {
            // Function that recalculates the line segments making up the normal density curve
            let data  = [];
            let xobs = scatter[k][0];
            let yobs = scatter[k][1];
            let ypred = calcy(xobs);
            let ylow  = ypred - 3.0*sigma;
            let yhigh = ypred + 3.0*sigma;
            let yincr = (yhigh - ylow)/(nsegments + 1);
            for (let i = 1; i < nsegments; i++) {
                let yi = ylow + yincr*i;
                let log_density = -1000000.;    // minus "infinity"
                log_density = -0.5*Math.pow((yi - ypred)/sigma, 2.0);
                let density = Math.exp(log_density);
                let xvalue = xobs + density;
                let yvalue = yi;
                data.push({'x':xvalue, 'y':yvalue});
            }
            density_data.push(data);
        }
    }
    recalcDensityData();            
                        
    function calcSS() {
        let ss = 0.0;
        for (let i in scatter) {
            let x = scatter[i][0];
            let y = scatter[i][1];
            let d = y - (beta0 + beta1*x);
            ss += d*d;
        }
        return ss;
    }
    
    function calcXmean() {
        let xsum = 0.0;
        let xtotal = 0.0;
        for (let i in scatter) {
            let x = scatter[i][0];
            xsum += x;
            xtotal += 1.0;
        }
        return xsum/xtotal;
    }
    
    function calcYmean() {
        let ysum = 0.0;
        let ytotal = 0.0;
        for (let i in scatter) {
            let y = scatter[i][1];
            ysum += y;
            ytotal += 1.0;
        }
        return ysum/ytotal;
    }
    
    function replotRegressionLine() {
        let x1 = xmin;
        let x2 = xmax;

        let y1 = calcy(xmin);
        let y2 = calcy(xmax);

        if (y1 < ymin) {
            y1 = ymin; // y1 = beta0 + beta1*x1
            x1 = (y1 - beta0)/beta1;
        }

        if (y1 > ymax) {
            y1 = ymax; // y1 = beta0 + beta1*x1
            x1 = (y1 - beta0)/beta1;
        }

        if (y2 < ymin) {
            y2 = ymin; // y1 = beta0 + beta1*x1
            x2 = (y2 - beta0)/beta1;
        }

        if (y2 > ymax) {
            y2 = ymax; // y1 = beta0 + beta1*x1
            x2 = (y2 - beta0)/beta1;
        }

        let ss = calcSS();
        let lnL = -ss/two_sigma_squared;
                        
        //console.log("x1 = " + x1.toFixed(1));
        //console.log("y1 = " + y1.toFixed(1));
        //console.log("x2 = " + x2.toFixed(1));
        //console.log("y2 = " + y2.toFixed(1));
        
        svg.select("line#regression")
            .attr("x1", xscale(x1))
            .attr("y1", yscale(y1))
            .attr("x2", xscale(x2))
            .attr("y2", yscale(y2))
            .attr("stroke", color_scale(lnL));
            
        recalcDensityData();            
        svg.selectAll("path.density")
            .attr("d", function(d,i) {return lineFunc(density_data[i]);});
            
        svg.selectAll("line.density")
            .attr("x2", function(d,i) {
                let xobs = d[0];
                let yobs = d[1];
                let ypred = calcy(d[0]);
                let log_density = -0.5*Math.pow((d[1] - ypred)/sigma, 2.0);
                let density = Math.exp(log_density);
                // console.log("point " + i + ":");
                // console.log("  xobs  = " + xobs);
                // console.log("  yobs  = " + yobs);
                // console.log("  ypred = " + ypred);
                // console.log("  log_density = " + log_density);
                // console.log("  density = " + density);
                return xscale(xobs + density);
            });
            
        svg.selectAll("line.residual")
            .attr("x1", function(d) {return xscale(d[0]);})
            .attr("y1", function(d) {return yscale(d[1]);})
            .attr("x2", function(d) {return xscale(d[0]);})
            .attr("y2", function(d) {
                let y2 = calcy(d[0]);
                if (y2 < ymin)
                    y2 = ymin;
                if (y2 > ymax)
                    y2 = ymax;
                return yscale(y2);
            })
            .attr("stroke", color_scale(lnL));
            
        svg.select("circle#center")
            .attr("cx", xscale(xcenter))
            .attr("cy", yscale(ycenter))
            .style("visibility", "hidden"); 
                                                    
        svg.select("text#lnL")
            .attr("x", xscale(status_text_x))
            .attr("y", yscale(status_text_y))
            .attr("font-family", "Times")
            .attr("font-style", "regular")
            .attr("font-size", "21")
            .style("text-anchor", "start")
            .text("log-likelihood = " + lnL.toFixed(1)); 
    }

    function increaseTheta() {
        let theta0 = theta;
        theta += theta_incr;
        let dx = xmin - xcenter;
        let dy = dx*Math.tan(theta);
        beta1 = dy/dx
        beta0 = ymean + dy + (ycenter - ymean);
        console.log("increaseTheta:");
        console.log("  theta0  = " + theta0.toFixed(5));
        console.log("  theta   = " + theta.toFixed(5));
        console.log("  xcenter = " + xcenter.toFixed(5));
        console.log("  ycenter = " + ycenter.toFixed(5));
        console.log("  xmean   = " + xmean.toFixed(5));
        console.log("  ymean   = " + ymean.toFixed(5));
        console.log("  dx      = " + dx.toFixed(5));
        console.log("  dy      = " + dy.toFixed(5));
        console.log("  beta0   = " + beta0.toFixed(5));
        console.log("  beta1   = " + beta1.toFixed(5));
        replotRegressionLine();
    }

    function decreaseTheta() {
        let theta0 = theta;
        theta -= theta_incr;
        let dx = xmin - xcenter;
        let dy = dx*Math.tan(theta);
        beta1 = dy/dx
        beta0 = ymean + dy + (ycenter - ymean);
        console.log("decreaseTheta:");
        console.log("  theta0  = " + theta0.toFixed(5));
        console.log("  theta   = " + theta.toFixed(5));
        console.log("  xcenter = " + xcenter.toFixed(5));
        console.log("  ycenter = " + ycenter.toFixed(5));
        console.log("  xmean   = " + xmean.toFixed(5));
        console.log("  ymean   = " + ymean.toFixed(5));
        console.log("  dx      = " + dx.toFixed(5));
        console.log("  dy      = " + dy.toFixed(5));
        console.log("  beta0   = " + beta0.toFixed(5));
        console.log("  beta1   = " + beta1.toFixed(5));
        replotRegressionLine();
    }

    function shiftUp() {
        ycenter += 0.5;
        beta0 += 0.5;
        replotRegressionLine();
    }

    function shiftDown() {
        ycenter -= 0.5;
        beta0 -= 0.5;
        replotRegressionLine();
    }
                
    if (xy_same_scale) {
        let xymax = d3.max([xmax, ymax])
        xmax = xymax;
        ymax = xymax;
        
        let xymin = d3.min([xmin, ymin])
        xmin = xymin;
        ymin = xymin;
    }

    // Select DIV element already created (see above) to hold SVG
    let plot_div = d3.select("div#forsvg");

    // Create SVG element
    let svg = plot_div.append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create rect outlining entire area of SVG
    //svg.append("rect")
    //    .attr("x", 0)
    //    .attr("y", 0)
    //    .attr("width", w)
    //    .attr("height", h)
    //    .attr("fill", "lavender");

    // Create scale for X axis
    let xscale = d3.scaleLinear()
        .domain([xmin, xmax])
        .range([padding, w - padding]);

    // Create scale for Y axis
    let yscale = d3.scaleLinear()
        .domain([ymin, ymax]) 
        .range([h - padding, padding]);

    // Create x axis
    let xaxis = d3.axisBottom(xscale)
        .ticks(4)
        .tickFormat(d3.format(precision_format));

    // Add x axis to svg
    svg.append("g")
        .attr("id", "xaxis")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xaxis);

    // Create y axis
    let yaxis = d3.axisLeft(yscale)
        .ticks(4)
        .tickFormat(d3.format(precision_format));

    // Add y axis to svg
    svg.append("g")
        .attr("id", "yaxis")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yaxis);

    // Style the x- and y-axis
    svg.selectAll('.axis line, .axis path')
        .style('stroke', 'black')
        .style('fill', 'none')
        .style('stroke-width', '1px')
        .style('shape-rendering', 'crispEdges');
    svg.selectAll('g#xaxis g.tick text')
        .classed('noselect', true)
        .style('font-family', 'Helvetica')
        .style('font-size', axis_label_height_pixels);
    svg.selectAll('g#yaxis g.tick text')
        .classed('noselect', true)
        .style('font-family', 'Helvetica')
        .style('font-size', axis_label_height_pixels);
        
    var color_scale = d3.scaleLinear()
        .domain([min_log_likelihood, max_log_likelihood])   // recalculated in refreshPlot()
        .range([begin_color, end_color]);

    // Plot the regression line
    svg.append("line")
        .attr("id", "regression")
        .attr("class", "regression")
        .attr("x1", xscale(xmin))
        .attr("y1", yscale(calcy(xmin)))
        .attr("x2", xscale(xmax))
        .attr("y2", yscale(calcy(xmax)))
        .attr("stroke-width", regression_line_width)
        .attr("stroke", regression_line_color);

    // Plot normal densities                
    svg.selectAll("path.density")
        .data(scatter)
        .enter()
        .append("path")
        .attr("id", function(d,i) {return "densityforpoint-" + i;})
        .attr("class", "density")
        .attr("d", function(d,i) {return lineFunc(density_data[i]);})
        .attr("fill", "none")
        .attr("stroke", brickred)
        .attr("stroke-width", 2)
        .style("pointer-events", "none");   // don't want line intercepting drag events

    // Plot heights of observed data points on normal densities                
    svg.selectAll("line.density")
        .data(scatter)
        .enter()
        .append("line")
        .attr("id", function(d,i) {return "lineforpoint-" + i;})
        .attr("class", "density")
        .attr("x1", function(d,i) {return xscale(d[0]);})
        .attr("y1", function(d,i) {return yscale(d[1]);})
        .attr("x2", function(d,i) {
            let xobs = d[0];
            let yobs = d[1];
            let ypred = calcy(d[0]);
            let log_density = -0.5*Math.pow((d[1] - ypred)/sigma, 2.0);
            let density = Math.exp(log_density);
            // console.log("point " + i + ":");
            // console.log("  xobs  = " + xobs);
            // console.log("  yobs  = " + yobs);
            // console.log("  ypred = " + ypred);
            // console.log("  log_density = " + log_density);
            // console.log("  density = " + density);
            return xscale(xobs + density);
        })
        .attr("y2", function(d,i) {return yscale(d[1]);})
        .attr("fill", "none")
        .attr("stroke", brickred)
        .attr("stroke-width", 2)
        .style("pointer-events", "none");   // don't want line intercepting drag events

    // Plot open circle at (xcenter,ycenter)
    svg.append("circle")
        .attr("id", "center")
        .attr("class", "center")
        .attr("cx", xscale(xcenter))
        .attr("cy", yscale(ycenter)) 
        .attr("r", point_radius)
        .attr("fill", "none")
        .attr("stroke-width", point_stroke_width)
        .attr("stroke", point_stroke);

    // Plot the residuals
    svg.selectAll("line.residual")
        .data(scatter)
        .enter()
        .append("line")
        .attr("class", "residual")
        .attr("x1", function(d) {return xscale(d[0]);})
        .attr("y1", function(d) {return yscale(d[1]);})
        .attr("x2", function(d) {return xscale(d[0]);})
        .attr("y2", function(d) {return yscale(d[1] - (d[1] - calcy(d[0])));})
        .attr("stroke-width", residual_line_width)
        .attr("stroke-dasharray", residual_dash_array)
        .attr("stroke", residual_line_color);
        
    // Plot the points
    svg.selectAll("circle.datapoint")
        .data(scatter)
        .enter()
        .append("circle")
        .attr("class", "datapoint")
        .attr("cx", function(d) {return xscale(d[0]);})
        .attr("cy", function(d) {return yscale(d[1]);})
        .attr("r", point_radius)
        .attr("fill", point_fill)
        .attr("stroke-width", point_stroke_width)
        .attr("stroke", point_stroke);
        
    svg.append("text")
        .attr("id", "lnL")
        .attr("class", "lnL")
        .attr("x", xmin)
        .attr("y", ymax)
        .attr("font-family", "Times")
        .attr("font-style", "italic")
        .attr("font-size", "16")
        .text("lnL = " + max_log_likelihood.toFixed(5));
        
    replotRegressionLine();
        
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
        if (d3.event.keyCode == 37) {
            // 37 is the leftarrow key
            increaseTheta();
        }
        else if (d3.event.keyCode == 39) {
            // 39 is the rightarrow key
            decreaseTheta();
        }
        else if (d3.event.keyCode == 38) {
            // 38 is the uparrow key
            shiftUp();
        }
        else if (d3.event.keyCode == 40) {
            // 40 is the downarrow key
            shiftDown();
        }
        else if (d3.event.keyCode == 82) {
            // 82 is the "r" key
            theta = thetamle;
            xcenter = xmean;
            ycenter = ymean;
            beta0 = beta0mle;
            beta1 = beta1mle;
            replotRegressionLine();
        }
    }
    d3.select("body")
        .on("keydown", keyDown);
</script>

## Details

Use the **left arrow** and **right arrow** to change the **slope** of the regresion line.

Use **up arrow** and **down arrow** to change the **intercept** of the regression line. (You may need to hold down the **Shift key** while using the up/down arrow keys to avoid scrolling.)

Use the **r** key to return to the maximum likelihood slope and intercept.

The **likelihood** is the product of **5 normal densities**, one for each observed data point. These normal densities are shown in a brick red color centered at the predicted y value. The **regression line** determines the predicted y value for each data point given the x value for that point, and the difference between the observed y value and the predicted y value is the **residual**, shown as a dashed line. 

The best-fitting regression line has slope and intercept such that the sum of squared residuals (SS) is minimized (the "least-squares" solution). This is equivalent to maximizing the log likelihood, which is proportional to the negative of SS. Note that the estimated regression slope and intercept will be the same regardless of the variance of the individual normal densities (but the numerical value of the log-likelihood will differ).

The regression line becomes more red as SS becomes larger (and the log likelihood becomes smaller) and is a neutral gray color if the slope and intercept of the regression line are at their maximum likelihood (or least squares) values.

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library.
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
