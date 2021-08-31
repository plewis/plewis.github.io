// written by Paul O. Lewis 20-Dec-2018
// See https://developer.mozilla.org/en-US/docs/Web/SVG/Element
// See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute

var debugging = false;   // spits out info to console if true

var eps = 0.00001;
var popsize = 10;
var ngens = 50;

var show_me = false;
var show_which = 0;

var individuals = [];
var best = null;

var lot = new Random(Math.floor(10000*Math.random()));
var close_enough = 1.0;
var canopy = null;

// width and height of svg
var w = 600;
var h = 600;
var spacer = 10;

// bucket bottom y, width, and height
var bucket_width = 100;
var bucket_height = 400;
var bucket_bottom = h - spacer;
var bucket_top = bucket_bottom - bucket_height;
var bucket_thickness = 2;
var bucket_left  = w/2 - bucket_width/2;
var bucket_right = w/2 + bucket_width/2;
var bucket_area = (bucket_right - bucket_left)*(bucket_bottom - bucket_top);
if (debugging) {
    console.log("bucket_top     = " + bucket_top);
    console.log("bucket_bottom  = " + bucket_bottom);
    console.log("bucket_left    = " + bucket_left);
    console.log("bucket_right   = " + bucket_right);
    }

// circle queue
var queue_size = 18;
var queue_min_radius = bucket_width/4;
var queue_max_radius = bucket_width/3;
var queue_max_diameter = 2*queue_max_radius;
var queue_top = spacer;
var queue_bottom = bucket_bottom - bucket_height - spacer;

// keep track of balls already dropped
var placed = [];

// Select DIV element already created (see above) to hold SVG
var plot_div = d3.select("div#canvas");

// Create SVG element
var plot_svg = plot_div.append("svg")
    .attr("width", w)
    .attr("height", h);

// Create rect outlining entire area of SVG
plot_svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "lavender");

//#######################################################################
//######################### UTILITY FUNCTIONS ###########################
//#######################################################################

var chooseIndividual = function(cumprob) {
    let n = cumprob.length;
    let u = lot.random(0,1);
    for (let k in cumprob) {
        if (u < cumprob[k])
            return k;
        }
    return null;
    }

// example: addCircle(plot_svg, "tmp", "red", "black", intersect_left.x, intersect_left.y, 2);
var addCircle = function(plot_svg, cls, fillcol, strokecol, cx, cy, r, cr = 0) {
    plot_svg.append("circle")
        .attr("class", cls)
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .attr("fill", fillcol)
        .attr("stroke", strokecol);
    if (cr > 0) {
        // cr is radius of center point
        plot_svg.append("circle")
            .attr("class", cls)
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", cr)
            .attr("fill", strokecol)
            .attr("stroke", strokecol);
        }
    }

var addLine = function(plot_svg, cls, linecol, linew, x1, y1, x2, y2) {
    plot_svg.append("line")
        .attr("class", cls)
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke-width", linew)
        .attr("stroke", linecol);
    }

// example: addLabel(plot_svg, "tmp", "purple", a, intersects[a].x+5, intersects[a].y - 5, "end", 8);
var addLabel = function(plot_svg, cls, col, txt, x, y, anchor = "middle", sz = 10) {
    plot_svg.append("text")
        .attr("class", cls)
        .attr("x", x-2)
        .attr("y", y+2)
        .attr("font-family", "Verdana")
        .attr("font-size", sz + "px")
        .attr("stroke", "none")
        .attr("fill", col)
        .attr("text-anchor", anchor)
        .text(txt);
    }

var intersectBetweenPlacedPair = function(placed_index1, placed_index2, new_radius) {
    // x0,y0,r0 are coordinates and radius for first placed ball
    var x0 = placed[placed_index1].cx;
    var y0 = placed[placed_index1].cy;
    var r0 = placed[placed_index1].r + new_radius;

    // x1,y1,r1 are coordinates and radius for second placed ball
    var x1 = placed[placed_index2].cx;
    var y1 = placed[placed_index2].cy;
    var r1 = placed[placed_index2].r + new_radius;
    
    // Calculate distance d between the two ball center points
    var r0sq = Math.pow(r0,2);
    var r1sq = Math.pow(r1,2);
    var dsq = Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2);
    var d = Math.sqrt(dsq);
    
    if (d > r0 + r1) {
        // Distance between center points is larger than it would be if
        // circles were touching, so circles do not intersect
        return null;
        }
    else if (d < Math.abs(r0 - r1)) {
        // Circles are nested if d + r0 < r1, where r0 is smaller than r1,
        // in which case circles do not intersect
        return null;
        }
    else {
        // Circles intersect
        
        // see http://paulbourke.net/geometry/circlesphere/
        //
        // The peak of the triangle below is one of two intersection points
        // between circle of radius r0 centered at x0,y0 and circle of radius
        // r1 centered at x1,y1. Height of peak from base is h. 
        //               +
        //              /|\
        //             / |  \
        //            /  |    \
        //         r0/   |      \r1
        //          /    h        \
        //         /     |          \
        //        /    x2,y2          \
        // x0,y0 +-------+-------------+ x1,y1
        //       |<- a ->|<--- d-a --->|
        //       |<-------- d -------->|
        //
        // From pythagorean theorem, we know that:
        //   h^2 + a^2 = r0^2
        //   h^2 + (d-a)^2 = r1^2
        // therefore:
        //   r0^2 - a^2 = r1^2 - (d-a)^2
        //   r0^2 - r1^2 = a^2 - (d^2 - 2ad + a^2)
        //   r0^2 - r1^2 + d^2 = 2ad
        //   a = (r0^2 - r1^2 + d^2)/(2d)
        var a = 0.5*(r0sq - r1sq + dsq)/d;
        
        // Now compute h using pythagorean theorem from left triangle:
        // h^2 + a^2 = r0^2 ==> h = sqrt(r0^2 - a^2)
        var asq = Math.pow(a,2);
        var hsq = r0sq - asq;
        var h = Math.sqrt(hsq);

        // Get coordinates of point x2,y2 that lies along line from x0,y0
        // to x1,y1 a distance a from x0,y0                    
        var x2 = x0 + (a/d)*(x1 - x0);
        var y2 = y0 + (a/d)*(y1 - y0);
        
        // Now get coordinates of P3=(x3,y3), the highest of the two 
        // intersection points. P2=(x2,y2) is the point along the line 
        // connecting the two circle centers, P0=(x0,y0) and P1=(x1,y1), 
        // such that the line P2 P3 is orthogonal to the line P0 P1.
        // Note that a point P on the line P2 P3 can be obtained as follows:
        //   P3 = P3
        //   P3 = P2 + (1)(P3 - P2)
        //      = P2 + [(P1 - P0)/(P1 - P0)] (P3 - P2)
        //      = P2 + [(P1 - P0)/d] h
        //      = P2 + (h/d)(P1 - P0)
        // The only remaining details follow from the fact that the y-axis 
        // is inverted (which is why the formulas for x3 and y3 are not 
        // identical) and of course whether x1 is to the right or left of x0.
        if (x1 > x0) {
            var x3 = x2 + (h/d)*(y1 - y0);
            var y3 = y2 - (h/d)*(x1 - x0);
            }
        else {
            var x3 = x2 - (h/d)*(y1 - y0);
            var y3 = y2 + (h/d)*(x1 - x0);
            }
            
        // Only return intersection point if circle with radius new_radius
        // placed at that point would not overlap left, right, or bottom
        // sides of the bucket
        if (x3 + new_radius > bucket_right || x3 - new_radius < bucket_left || y3 + new_radius > bucket_bottom)
            return null;
        else {
            return {'x':x3, 'y':y3};
            }
        }
    }
    
var intersectionWithLeftWall = function(placed_index, new_radius) {
    // Returns highest point at which a new ball (radius new_radius) could
    // be placed against the left wall and still touching the placed ball. 
    // Returns null if no such point can be found (i.e. the placed ball is 
    // not close enough to the left wall).
    var p = placed[placed_index];
    var left_wall_x = bucket_left + new_radius;
    var circle_leftmost_x = p.cx - p.r - new_radius;
    if (circle_leftmost_x < left_wall_x) {
        var x = p.cx - left_wall_x;
        var rr = p.r + new_radius;
        var y = Math.sqrt(rr*rr - x*x);
        return {'x':left_wall_x, 'y':p.cy - y};
        }
    return null;
    }
    
var intersectionWithRightWall = function(placed_index, new_radius) {
    // Returns highest point at which a new ball (radius new_radius) could
    // be placed against the right wall and still touching the placed ball. 
    // Returns null if no such point can be found (i.e. the placed ball is 
    // not close enough to the right wall).
    var p = placed[placed_index];
    var right_wall_x = bucket_right - new_radius;
    var circle_rightmost_x = p.cx + p.r + new_radius;
    if (circle_rightmost_x > right_wall_x) {
        var x = right_wall_x - p.cx;
        var rr = p.r + new_radius;
        var y = Math.sqrt(rr*rr - x*x);
        return {'x':right_wall_x, 'y':p.cy - y};
        }
    return null;
    }
    
var intersectionWithBottomWall = function(placed_index, new_radius, intersect_left, intersect_right) {
    // Returns all points at which a new ball (radius new_radius) just outside
    // the shadow of a placed ball is touching the bottom wall. Returns null
    // if no such point could be found (i.e. the placed ball is not close 
    // enough to the bottom wall).
    var p = placed[placed_index];
    var bottom_wall_y = bucket_bottom - new_radius;
    var circle_bottommost_y = p.cy + p.r;
    if (circle_bottommost_y > bottom_wall_y) {
        //var y = bottom_wall_y - p.cy;
        //var rr = p.r + new_radius;
        //var x = Math.sqrt(rr*rr - y*y);
        var x = p.r + new_radius;
        var point_vect = []
        point_vect.push({'x':p.cx + x, 'y':bottom_wall_y});
        point_vect.push({'x':p.cx - x, 'y':bottom_wall_y});
        return point_vect;
        
        }
    return null;
    }

var findAllIntersects = function(r) {
    // Create list of all valid intersection points where new ball of radius
    // r could be placed.
    d3.selectAll("circle.tmp").remove();
    d3.selectAll("line.tmp").remove();
    d3.selectAll("text.tmp").remove();
    var intersects = [];
    for (var p = 0; p < placed.length; p++) {
        // Add intersects between each placed ball and left wall
        var intersect_left   = intersectionWithLeftWall(p, r);
        if (intersect_left) {
            intersects.push(intersect_left);
            }

        // Add intersects between each placed ball and right wall
        var intersect_right  = intersectionWithRightWall(p, r);
        if (intersect_right) {
            intersects.push(intersect_right);
            }

        // Add intersects between each placed ball and bottom wall
        var intersect_bottom_vect = intersectionWithBottomWall(p, r, intersect_left, intersect_right);
        if (intersect_bottom_vect) {
            for (var element in intersect_bottom_vect) {
                var point = intersect_bottom_vect[element];
                intersects.push(point);
                }
            }

        // Add intersects between each placed ball
        for (var pp = p + 1; pp < placed.length; pp++) {
            var intersect_other = intersectBetweenPlacedPair(p, pp, r);                            
            if (intersect_other) {
                intersects.push(intersect_other);
                }
            }
        }  
        
    // Remove any intersects that:
    // 1. would result in any part of the new ball being underneath a placed ball
    // 2. would result in any part of the new ball being inside a placed ball
    var removed_indices = [];
    for (var a in intersects) {
        var i = intersects[a];
        
        // Check if intersect is too far to the left
        if (i.x - r + eps < bucket_left) {
            removed_indices.push(a);
            continue;
            }
        
        // Check if intersect is too far to the right
        if (i.x + r - eps > bucket_right) {
            removed_indices.push(a);
            continue;
            }
        
        for (var b = 0; b < placed.length; b++) {
            var p = placed[b];
            
            // Check if new ball would intersect placed ball (i.e. ensure that
            // centers are further from each other than the sum of their radii).
            var dx = p.cx - i.x;
            var dy = p.cy - i.y;
            var distance_between_centers = Math.sqrt(dx*dx + dy*dy);
            var sum_of_radii = p.r + r;
            var inside_placed = distance_between_centers + eps < sum_of_radii;
            
            // Check if new ball is underneath placed ball (at least in part)
            var center_below_placed = i.y > p.cy;
            var overlap_right = (i.x > p.cx) && i.x - r < p.cx + p.r;
            var overlap_left  = (i.x < p.cx) && i.x + r > p.cx - p.r;
            var underneath_placed = center_below_placed && (overlap_left || overlap_right);
            
            if (inside_placed || underneath_placed) {
                removed_indices.push(a);
                break;
                }
            }
        }
        
    removed_indices.reverse();
    for (var index in removed_indices) {
        intersects.splice(removed_indices[index], 1);
        }
        
    return intersects;              
    }
    
var findLowestIntersect = function(points) {
    // Given a vector of points (objects with 'x' and 'y'), return the lowest
    // one (i.e. with greatest 'y' value 
    var lowest = null;
    for (var i in points) {
        var p = points[i];
        if (!lowest || p.y > lowest.y) {
            lowest = p;
            }
       }
    return lowest;
    }
    
var showSummary = function() {
    let placed_area = 0.0;
    for (var i in placed) {
        let p = placed[i];
        if (debugging) 
            console.log("placed " + i + ": cx = " + p.cx.toFixed(1) + ", cy = " + p.cy.toFixed(1) + ", r = " + p.r.toFixed(1) + ", PI = " + Math.PI.toFixed(5));
        let a = Math.PI*p.r*p.r;
        placed_area += a;    
        }
    //let label_x = 0.65*w;
    //let label_y = 0.8*h;
    let label_x = w/2;
    let label_y = 20;
    let label_color = "black";
    let you_pct = 100.0*placed_area/bucket_area;
    let sel_pct = 100.0*best.fitness/bucket_area;
    addLabel(plot_svg, "summary", label_color, "your area = " + placed_area.toFixed(1) + " (" + you_pct.toFixed(1) + "%)", label_x - 20, label_y, "end", 14);
    addLabel(plot_svg, "summary", label_color, "best area = " + best.fitness.toFixed(1) + " (" + sel_pct.toFixed(1) + "%)", label_x + 20, label_y, "start", 14);
    }
    
//###################################################################
//######################### CREATE BUCKET ###########################
//###################################################################

if (true) {
    var x_top_left = 0
    var y_top_left = bucket_top;
    
    var x_bucket_top_left = w/2 - bucket_width/2 - bucket_thickness;
    var y_bucket_top_left = bucket_top;
    
    var x_bucket_bottom_left = bucket_left - bucket_thickness;
    var y_bucket_bottom_left = bucket_bottom;
    
    var x_bucket_bottom_right = bucket_right + bucket_thickness;
    var y_bucket_bottom_right = bucket_bottom;
    
    var x_bucket_top_right = bucket_right + bucket_thickness;
    var y_bucket_top_right = bucket_top;
    
    var x_top_right = w;
    var y_top_right = bucket_top;
    
    var x_bottom_right = w;
    var y_bottom_right = h;
    
    var x_bottom_left = 0;
    var y_bottom_left = h;
    
    var points = "";
    points += " " + x_top_left            + "," + y_top_left;
    points += " " + x_bucket_top_left     + "," + y_bucket_top_left;
    points += " " + x_bucket_bottom_left  + "," + y_bucket_bottom_left;
    points += " " + x_bucket_bottom_right + "," + y_bucket_bottom_right;
    points += " " + x_bucket_top_right    + "," + y_bucket_top_right;
    points += " " + x_top_right           + "," + y_top_right;
    points += " " + x_bottom_right        + "," + y_bottom_right;
    points += " " + x_bottom_left        + "," + y_bottom_left;
    points += " " + x_top_left            + "," + y_top_left;
    //var pit_color = "#962938"; // brick red
    //var pit_color = "#008081"; // teal
    var pit_color = "#003152"; // prussian
    plot_svg.append("polyline")
        .attr("points", points)
        .attr("stroke", pit_color)
        .attr("fill", pit_color);
}
else {
    // Create bucket top
    var x1 = w/2 - bucket_width/2 - bucket_thickness;
    var x2 = w/2 + bucket_width/2 + bucket_thickness;
    var y1 = bucket_top;
    var y2 = bucket_top;
    addLine(plot_svg, "bucket", "gray", 2, x1, y1, x2, y2);

    // Create bucket left side
    x1 = bucket_left - bucket_thickness;
    x2 = bucket_left - bucket_thickness;
    y1 = bucket_bottom - bucket_height;
    y2 = bucket_bottom;
    addLine(plot_svg, "bucket", "black", 2, x1, y1, x2, y2);

    // Create bucket bottom
    x1 = w/2 - bucket_width/2 - bucket_thickness;
    x2 = w/2 + bucket_width/2 + bucket_thickness;
    y1 = bucket_bottom;
    y2 = bucket_bottom;
    addLine(plot_svg, "bucket", "black", 2, x1, y1, x2, y2);

    // Create bucket right side
    x1 = bucket_right + bucket_thickness;
    x2 = bucket_right + bucket_thickness;
    y1 = bucket_bottom - bucket_height;
    y2 = bucket_bottom;
    addLine(plot_svg, "bucket", "black", 2, x1, y1, x2, y2);
}

//###################################################################
//######################### ADD INSTRUCTIONS ########################
//###################################################################
let side_width = w/2 - bucket_width/2;

let instr_x = side_width/2;
let instr_y = bucket_top + .25*bucket_height;
let instr_color = "white";
addLabel(plot_svg, "instr", instr_color, "Click balls one at a time", instr_x, instr_y, "middle", 14);
addLabel(plot_svg, "instr", instr_color, "to drop into well", instr_x, instr_y + 20, "middle", 14);

let goal_x = w - side_width/2
let goal_y = bucket_top + .25*bucket_height;
let goal_color = "white";
addLabel(plot_svg, "goal", goal_color, "Goal: maximize volume", goal_x, goal_y, "middle", 14);
addLabel(plot_svg, "goal", goal_color, "of packed balls", goal_x, goal_y + 20, "middle", 14);

//###################################################################
//########################### CREATE QUEUE ##########################
//###################################################################

var queue = [];
var createQueue = function() {
    if (debugging)
        console.clear();
    var num_rows = 0;
    var cum_row_width = 0.0;
    queue = [];
    for (var i = 0; i < queue_size; i++) {
        var r = queue_min_radius + (queue_max_radius - queue_min_radius)*lot.random(0,1);
        cum_row_width += 2*r;
        if (cum_row_width > w - 2*spacer) {
            cum_row_width = 2*r;
            num_rows++;
            }
        var cx = spacer + cum_row_width - r;
        var cy = queue_bottom - num_rows*queue_max_diameter - r;
        queue.push({'cx':cx, 'cy':cy, 'r':r, 'index':i});
        }
    }
createQueue();

//###################################################################
//######################## INDIVIDUAL CLASS #########################
//###################################################################
var indiv_index = 0;
class Individual {
    constructor(index, chromosome, fitness) {
        this.index = index;
        this.genome = chromosome;
        this.fitness = fitness;
        }
        
    clone() {
        let genome_copy = [];
        for (let g in this.genome)
            genome_copy.push(this.genome[g]);
        return new Individual(this.index, genome_copy, this.fitness);
        }
    
    calcFitness(queue) {
        placed = [];
    
        // Place first ball at bottom left
        var b = 0;
        var ball = queue[this.genome[b]];
        var new_cx = w/2 - bucket_width/2 + ball.r;
        var new_cy = bucket_bottom - ball.r;
        placed.push({'cx':new_cx, 'cy':new_cy, 'r':ball.r});
        this.fitness = Math.PI*ball.r*ball.r

        var bucket_full = false;
        while (!bucket_full) {
            b++;
            ball = queue[this.genome[b]];
        
            // Find all intersection points
            var intersects = findAllIntersects(ball.r);

            // Find lowest intersection point
            let lowest_intersect = findLowestIntersect(intersects);

            // Move clicked ball to lowest intersection point if bucket is not yet full
            bucket_full = lowest_intersect.y - ball.r < bucket_top;
            if (!bucket_full) {
                this.fitness += Math.PI*ball.r*ball.r
                placed.push({'cx':lowest_intersect.x, 'cy':lowest_intersect.y, 'r':ball.r});
                }
            }
        
        placed = [];
        return this.fitness;
        }
    
    mutate() {
        var first = Math.floor(this.genome.length*lot.random(0,1));
        var second = Math.floor(this.genome.length*lot.random(0,1));
        while (second == first) {
            second = Math.floor(this.genome.length*lot.random(0,1));
            }
        
        // Swap first and second elements of genome
        var tmp = this.genome[first];
        this.genome[first] = this.genome[second];
        this.genome[second] = tmp;
        }
    }
    
//###################################################################
//########## POPULATION CLASS (for use with console.table) ##########
//###################################################################
class Population {
    constructor(i, f, b) {
        this.index         = i;
        this.fitness       = f;
        this.best_thus_far = b;
        }
    }
    
//###################################################################
//########## GENERATION CLASS (for use with console.table) ##########
//###################################################################
class Generation {
    constructor(i, f, p, a) {
        this.best_index   = i;
        this.best_fitness = f;
        this.percentage   = p;
        this.average      = a;
        }
    }
    
//###################################################################
//########## ORDERING CLASS (for use with console.table) ##########
//###################################################################
class Ordering {
    constructor(b, a, cum) {
        this.ball     = b;
        this.area     = a;
        this.cum_area = cum;
        }
    }
    
//######################################################################
//######################## CREATING POPULATION #########################
//######################################################################
var createPopulation = function() {
    if (debugging) {
        console.log("###########################");
        console.log("### Creating population ###");
        console.log("###########################");
        var population = [];
        }
    individuals = [];
    best = null;
    for (let i = 0; i < popsize; i++) {
        let tmp = [];
        for (var j=0; j < queue.length; j++)
            tmp.push(j);
        
        let chromosome = [];
        for (var j=0; j < queue.length; j++) {
            var k = Math.floor(tmp.length*lot.random(0,1));
            chromosome.push(tmp.splice(k,1)[0]);
            }
        
        let individual = new Individual(indiv_index++, chromosome, 0.0);
        individual.calcFitness(queue);
        if (!best || individual.fitness > best.fitness) {
            best = individual.clone();
            if (debugging)
                population.push(new Population(best.index, best.fitness, "yes"));
            }
        else if (debugging)
            population.push(new Population(individual.index, individual.fitness, "no"));

        individuals.push(individual);
        }
    if (debugging)
        console.table(population);
    
    if (debugging) {
        console.log("###########################");
        console.log("### Evolving population ###");
        console.log("###########################");
        var generations = [];
        }
    for (var gen = 0; gen < ngens; gen++) {
        let cumprob = [];
        let total_fitness = 0.0;
    
        // Mutation
        for (let i in individuals) {
            let individual = individuals[i];
            individual.mutate();
            individual.calcFitness(queue);
        
            cumprob.push(individual.fitness);
            total_fitness += individual.fitness;
        
            if (individual.fitness > best.fitness) {
                best = individual.clone();
                }
            }
        
        // Normalize fitnesses 
        for (let b in cumprob) {
            cumprob[b] /= total_fitness;
            cumprob[b] += (b > 0 ? cumprob[b-1] : 0.0);
            }
        
        // Selection
        let avg = 0.0;
        let offspring = [];
        for (let i in individuals) {
            let k = chooseIndividual(cumprob);
            let indiv = individuals[k].clone();
            offspring.push(indiv);
            avg += indiv.fitness;
            }  
        avg /= individuals.length;              
        individuals = offspring;
    
        let pct = best.fitness/bucket_area;
    
        if (debugging) {
            generations.push(new Generation(best.index, best.fitness, pct, avg));
            }
        }
    if (debugging) {
        console.table(generations);
        }
    
    if (debugging) {
        console.log("#################################################");
        console.log("### Best ordering found by mutation/selection ###");
        console.log("#################################################");
        var ordering = [];
        }
    let cum = 0.0;
    for (let g in best.genome) {
        let w = best.genome[g];
        let r = queue[w].r;
        let a = Math.PI*r*r;
        cum += a;
        if (cum > best.fitness)
            break;
        if (debugging)
            ordering.push(new Ordering(w, a, cum));
        }
    if (debugging) {
        console.table(ordering);
        }
    }
createPopulation();

//###################################################################
//####################### CREATE RED BALLS ##########################
//###################################################################

// Define radial gradients
// see https://www.visualcinnamon.com/2016/05/data-based-svg-gradient-d3.html
var showme_color = "#964120"; // maroonish
//var showme_color = "#E0B463"; // yellowish
//var showme_color = "#518E87"; // greenish
//var showme_color = "#515CA8"; // blueish
//var showme_color = "#D1E3F4"; // whiteish
var radialGradient0 = plot_svg.append("defs").append("radialGradient")
    .attr("id", "radial-gradient-showme")
    .attr("cx", "35%")
    .attr("cy", "35%")
    .attr("r", "60%");
radialGradient0.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", function(d) {
        return d3.rgb(showme_color).brighter(1);
    });
radialGradient0.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", function(d) {
        return showme_color;
    });
radialGradient0.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", function(d) {
        return d3.rgb(showme_color).darker(1.75);
    });
    
var normal_color = "#F8800F";
var radialGradient1 = plot_svg.append("defs").append("radialGradient")
    .attr("id", "radial-gradient-normal")
    .attr("cx", "35%")
    .attr("cy", "35%")
    .attr("r", "60%");
radialGradient1.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", function(d) {
        return d3.rgb(normal_color).brighter(1);
    });
radialGradient1.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", function(d) {
        return normal_color;
    });
radialGradient1.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", function(d) {
        return d3.rgb(normal_color).darker(1.75);
    });


//var radialGradient1 = plot_svg.append("defs").append("radialGradient").attr("id", "radial-gradient-1");
//radialGradient1.append("stop").attr("offset", "0%").attr("stop-color", "white");
//radialGradient1.append("stop").attr("offset", "100%").attr("stop-color", "blue");

var createBalls = function() {
    placed = [];
    d3.selectAll("text.summary").remove();
    d3.selectAll("circle.ball").remove();
    plot_svg.selectAll("circle.ball")
        .data(queue)
        .enter()
        .append("circle")
        .attr("id", function(d,i) {return "ball-"+i})
        .attr("class", "ball")
        .attr("cx", function(d) {return d.cx;})
        .attr("cy", function(d) {return d.cy;})
        .attr("r",  function(d) {return d.r;})
        //.attr("fill", function(d,i) {return (show_me && i == best.genome[show_which] ? "blue" : "red");})
        .attr("fill", function(d,i) {
            if (show_me && i == best.genome[show_which])
                return "url(#radial-gradient-showme)";
            else
                return "url(#radial-gradient-normal)";
        })                    
        //.attr("stroke", function(d,i) {return (show_me && i == best.genome[show_which] ? "blue" : "red");})
        .on("click", function(d) {
            if (show_me) {
                show_which++;
                d3.select("circle#ball-"+best.genome[show_which])
                    .attr("fill", function(d,i) {
                        return "url(#radial-gradient-showme)";
                    });
                    //.attr("fill", "blue")
                    //.attr("stroke", "blue");
                }
            if (placed.length == 0) {
                // No balls have yet been placed.
                // Place ball at bottom left (guaranteed to fit since all balls are less wide than the container)
                var new_cx = w/2 - bucket_width/2 + d.r;
                var new_cy = bucket_bottom - d.r;
                placed.push({'cx':new_cx, 'cy':new_cy, 'r':d.r});
                //d3.select(this).transition().duration(500).attr("cx", new_cx).attr("cy", new_cy);
                this.parentNode.appendChild(this); // bring to front (see https://stackoverflow.com/questions/13595175/updating-svg-element-z-index-with-d3)
                d3.select(this).transition().duration(500).attr("cx", new_cx).transition().duration(500).attr("cy", new_cy);
                }
            else {
                // Find all intersection points
                var intersects = findAllIntersects(d.r);
    
                // Find lowest intersection point
                let lowest_intersect = findLowestIntersect(intersects);

                var bucket_full = lowest_intersect.y - d.r < bucket_top;

                // Move clicked ball to lowest intersection point if bucket is not 
                // yet full
                if (bucket_full) {
                    d3.selectAll("circle.ball").attr("fill", "gray").attr("stroke", "gray");
                    showSummary();
                    }
                else {
                    placed.push({'cx':lowest_intersect.x, 'cy':lowest_intersect.y, 'r':d.r});
                    this.parentNode.appendChild(this); // bring to front (see https://stackoverflow.com/questions/13595175/updating-svg-element-z-index-with-d3)
                    d3.select(this).transition().duration(500).attr("cx", lowest_intersect.x).transition().duration(500).attr("cy", lowest_intersect.y);
                    }
                }
            });
        
        d3.selectAll("text.ball").remove();
        plot_svg.selectAll("text.ball")
            .data(queue)
            .enter()
            .append("text")
            .classed("ball noselect", true)
            .attr("x", function(d) {return d.cx;})
            .attr("y", function(d) {return d.cy;})
            .attr("fill", "white")
            .attr("stroke", "none")
            .attr("font-family", "Verdana")
            .attr("font-size", "10px")
            .style("pointer-events", "none")   // don't intercept drag events
            .style("visibility", "hidden")
            //.style("visibility", "visible")
            .text(function(d,i) {return i;});
    }
createBalls();

// var ctrl_div = d3.select("div#control");
// addButton(ctrl_div, "tryagainbtn", "Try Again", function() {
//     show_me = false;
//     createBalls();
//     }, false);
// addButton(ctrl_div, "showmebtn", "Show Me", function() {
//     show_me = true;
//     show_which = 0;
//     createBalls();
//     }, false);
// addButton(ctrl_div, "resetbtn", "New balls", function() {
//     show_me = false;
//     lot = new Random(Math.floor(10000*Math.random()));
//     createQueue();
//     createPopulation();                
//     createBalls();
//     }, false);
//     

