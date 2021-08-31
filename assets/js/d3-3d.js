function Viewport(as) {
    // Precompute a rotation matrix by multiplying xy, yz, and zx rotation matrices
    var m = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (var i = 0; i < 3; i++) {
        var j = (i+1)%3, k = (i+2)%3;
        var c = Math.cos(as[i]), s = Math.sin(as[i]);
        var n = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        n[i][i] = 1;
        n[j][j] = c;
        n[j][k] = -s;
        n[k][j] = s;
        n[k][k] = c;
        var o = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (var p = 0; p < 3; p++)
            for (var q = 0; q < 3; q++)
                for (var r = 0; r < 3; r++)
                    o[p][r] += m[p][q] * n[q][r];
        m = o;
    }
    this.m = m;
    this.depth = 1.0;
}

Viewport.prototype.project = function(cs) {
    // Apply rotation matrix
    var ds = [0, 0, 0];
    for (var i = 0; i < 3; i++)
	    for (var j = 0; j < 3; j++)
	        ds[i] += this.m[i][j] * cs[j];

    // Apply depth transformation
    var x = ds[0]; // * this.depth / (ds[2] + this.depth);
    var y = ds[1]; // * this.depth / (ds[2] + this.depth);

    return [x, y];
}

function binom_gaussian(n) {
    // Generate a Gaussian approximation by taking a bunch of uniforms
    var x = -n / 2;
    for (var i = 0; i < n; i++)
	x += Math.random();
    return x / Math.sqrt(n);
}

function D33D(elmId, color) {
    this.a = Math.random(), this.b = Math.random(), this.c = Math.random();
    this.points = [];
    this.xyz = [];
    this.elmId = elmId;

    // Make an SVG Container
    var svgContainer = d3.select(elmId).append("svg")
	.attr("width", '100%')
	.attr("height", '100%');

    for (var i = 0; i < 50; i++) {
	var p = svgContainer.append('path').attr('fill', color).attr('stroke-width', '1px');
	this.points.push(p);
	this.xyz.push([binom_gaussian(10), binom_gaussian(10), binom_gaussian(10)]);
    }

}

D33D.prototype.loop = function(delay) {
    var self = this;
    setInterval(function() {
        self.a += 0.0010;
        self.b += 0.0007;
        self.c += 0.0008;

        self.render();
    }, delay);
    return this;
}

D33D.prototype.scroll = function(offset) {
    this.a = offset;
    this.render();
}

D33D.prototype.render = function() {
    var v = new Viewport([this.a, this.b, this.c]);
    var width = $(this.elmId).width();

    var xyz = this.xyz;
    for (var i = 0; i < this.points.length; i++) {
	var size = 0.1; // Cube size
	var corners = [];
	for (var j = 0; j < 8; j++) { // All 8 corners of the cube
	    var cs = [xyz[i][0] + (j>>2) * size,
		      xyz[i][1] + ((j>>1)&1) * size,
		      xyz[i][2] + (j&1) * size]
	    var xy = v.project(cs);
	    corners.push([(xy[0] + 0.5) * width, (xy[1] + 0.5) * width]);
	}
	// Use the convex hull to compute the polygon given the individual corner points
	this.points[i].attr('d', 'M' + d3.geom.hull(corners).join('L') + 'Z');
    console.log(this.points[i])
    }
}

function do3d(elmId, color) {
    return new D33D(elmId, color);
}
