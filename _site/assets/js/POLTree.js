function TreeNode() {
    this.x = null,          // not copied by deepCopy
    this.y = null,          // not copied by deepCopy
    this.angle = 0,
    this.nchildren = 0,
    this.ndescendants = 0,
    this.backbone = false,
    this.lchild =  null,
    this.rsib = null,
    this.parent = null,
    this.edgelen = 0.0,
    this.height = 0.0,
    this.depth = 0.0,
    this.name = "",
    this.number = -1,
    this.info = null,
    this.tmp = 0;           // temporary workspace; not copied by deepCopy
    this.decorate = null;   // if defined, should be function(x, y, svg) that adds some elements to svg at point (x,y)
    }

function Tree() {
    this.nleaves = 0,
    this.root = null,
    this.preorder = [];     // TreeNode objects in preorder sequence
    this.leaforder = {};    // leaforder[nd] = k, where k is the order in which leaf nd appears in preorder sequence
    this.total_height = 0.0;
    this.xmax = 0.0;
    this.ymax = 0.0;
    }

Tree.prototype.deepCopy = function(t) {
    // Deep copies tree to t
    t.nleaves = this.nleaves;
    t.total_height = this.total_height;
    t.xmax = this.xmax;
    t.ymax = this.ymax;
        
    // First pass builds map m and sets everything except lchild, rsib, and parent
    t.preorder = [];
    t.leaforder = {};
    for (let i = 0; i < this.preorder.length; i++) {
        let nd = this.preorder[i];
        nd.tmp = i;
        
        let newnd = new TreeNode();
        newnd.x            = null;
        newnd.y            = null;
        newnd.angle        = nd.angle;
        newnd.nchildren    = nd.nchildren;
        newnd.ndescendants = nd.ndescendants;
        newnd.backbone     = nd.backbone;
        newnd.edgelen      = nd.edgelen;
        newnd.height       = nd.height;
        newnd.depth        = nd.depth;
        newnd.name         = nd.name;
        newnd.number       = nd.number;
        newnd.info         = nd.info;
        newnd.decorate     = nd.decorate;
        newnd.lchild       = null;
        newnd.rsib         = null;
        newnd.parent       = null;
                
        t.preorder.push(newnd);

        if (nd.lchild == null) {
            t.leaforder[newnd.number] = this.leaforder[nd.number];
        }
    }
    
    // Second pass sets lchild, rsib, and parent
    for (let i = 0; i < this.preorder.length; i++) {
        let nd    = this.preorder[i];
        let newnd = t.preorder[i];

        if (nd.lchild) {
            newnd.lchild = t.preorder[nd.lchild.tmp];
        }

        if (nd.rsib) {
            newnd.rsib   = t.preorder[nd.rsib.tmp];
        }

        if (nd.parent) {
            newnd.parent = t.preorder[nd.parent.tmp];
        }
    }
    
    t.root = t.preorder[0];
    
}

Tree.prototype.rebuildPreorder = function() {
    // Build preorder array
    this.preorder = [this.root];
    var num_nodes = this.nleaves;
    nd = this.root;
    nd.backbone = true;
    while (nd) {
        if (nd.parent) {
            nd.backbone = false;
            if (nd.parent.backbone && !nd.rsib) {
                nd.backbone = true;
                }
            this.preorder.push(nd);
            }

        if (nd.lchild != null) {
            // internal node
            nd.number = num_nodes;
            num_nodes += 1;
            nd = nd.lchild;
            }
        else {
            // leaf node
            while (nd && !nd.rsib)
                nd = nd.parent;
            if (nd)
                nd = nd.rsib;
            }
        }

    // Build leaforder lookup and determine node heights
    this.leaforder = {};
    var k = 0;
    this.total_height = 0.0;
    for (i in this.preorder) {
        var nd = this.preorder[i];

        nd.height = nd.edgelen;
        if (nd.parent != null)
            nd.height += nd.parent.height;

        if (nd.lchild == null) {
            if (nd.height > this.total_height)
                this.total_height = nd.height;
            this.leaforder[nd.number] = k++;
            }
        }
    }

Tree.prototype.makeNewick = function(precision) {
    var newick = "";
    var node_stack = [];

    var root_tip = null;
    for (i in this.preorder) {
        var nd = this.preorder[i];
        var ndnum = nd.number + 1;
        if (nd.lchild) {
            newick += "(";
            node_stack.push(nd);
            if (root_tip) {
                newick += ndnum + ":" + nd.edgelen.toFixed(precision);
                newick += ",";
                root_tip = null;
                }
            }
        else {
            newick += ndnum + ":" + nd.edgelen.toFixed(precision);
            if (nd.rsib)
                newick += ",";
            else {
                var popped = (node_stack.length == 0 ? 0 : node_stack[node_stack.length - 1]);
                while (popped && !popped.rsib) {
                    node_stack.pop();
                    if (node_stack.length == 0) {
                        newick += ")";
                        popped = null;
                        }
                    else {
                        newick += "):" + popped.edgelen.toFixed(precision);
                        popped = node_stack.pop();
                        node_stack.push(popped);
                        }
                    }
                if (popped && popped.rsib) {
                    node_stack.pop();
                    newick += "):" + popped.edgelen.toFixed(precision);
                    newick += ",";
                    }
                }
            }
        }

    return newick;
    }

Tree.prototype.ladderize = function() {
    // Initialize data element for all nodes to 0
    for (var i in this.preorder) {
        this.preorder[i].backbone = false;
        this.preorder[i].ndescendants = 0;
        }

    // Down-pass sets data elements of internal nodes to the number of descendants they have
    var nnodes = this.preorder.length;
    for (var i = nnodes-1; i >= 0; i--) {
        var nd = this.preorder[i];
        if (nd.parent) {
            if (nd.lchild) {
                // internal node
                nd.parent.ndescendants += nd.ndescendants;
                }
            else {
                // leaf node
                nd.parent.ndescendants++;
                }
            }
        }

    // Up-pass swaps nodes if rightmost child has fewer children than leftmost
    for (var i in this.preorder) {
        var nd = this.preorder[i];
        if (nd.lchild && nd.lchild.rsib && nd.lchild.rsib.rsib) {
            // polytomy with 3 children
            var nodea = nd.lchild;
            var nodeb = nd.lchild.rsib;
            var nodec = nd.lchild.rsib.rsib;
            var a = nodea.ndescendants;
            var b = nodeb.ndescendants;
            var c = nodec.ndescendants;
            if (a >= b && a >= c) {
                nd.lchild = nodeb;
                nodeb.rsib = nodec;
                nodec.rsib = nodea;
                nodea.rsib = null;
                }
            else if (b >= a && b >= c) {
                nd.lchild = nodea;
                nodea.rsib = nodec;
                nodec.rsib = nodeb;
                nodeb.rsib = null;
                }
            }
        else if (nd.lchild && nd.lchild.ndescendants > nd.lchild.rsib.ndescendants) {
            // assumes no polyomies
            var tmp = nd.lchild;
            nd.lchild = tmp.rsib;
            nd.lchild.rsib = tmp;
            nd.lchild.rsib.rsib = null;
            }
        }

    this.rebuildPreorder();
    }

Tree.prototype.swallowComment = function(newick, c) {
    var msg = "";
    var ch = newick[c];
    while (c < newick.length && ch !== ']') {
        msg += ch;
        c++;
        ch = newick[c];
        }
    return {position:c, message:msg};
    }

Tree.prototype.buildFromNewick = function(translate, newick) {
    var nd = new TreeNode();
    this.root = nd;
    this.nleaves = 0;

    var Prev_Tok = {
        LParen:0x01,	// previous token was a left parenthesis ('(')
        RParen:0x02,	// previous token was a right parenthesis (')')
        Colon:0x04,	    // previous token was a colon (':')
        Comma:0x08,	    // previous token was a comma (',')
        Name:0x10,	    // previous token was a node name (e.g. '2', 'P._articulata')
        EdgeLen:0x20	// previous token was an edge length (e.g. '0.1', '1.7e-3')
    }
    var previous = Prev_Tok.LParen;

    // Some useful flag combinations
    var LParen_Valid = (Prev_Tok.LParen | Prev_Tok.Comma);
    var RParen_Valid = (Prev_Tok.RParen | Prev_Tok.Name | Prev_Tok.EdgeLen);
    var Comma_Valid  = (Prev_Tok.RParen | Prev_Tok.Name | Prev_Tok.EdgeLen);
    var Colon_Valid  = (Prev_Tok.RParen | Prev_Tok.Name);
    var Name_Valid   = (Prev_Tok.RParen | Prev_Tok.LParen | Prev_Tok.Comma);

    // loop through the characters in newick, building up tree as we go
    for (var c = 0; c < newick.length; c++)
        {
        var ch = newick[c];
        if (/\s/.test(ch))
            continue;
        switch(ch)
            {
            case ';':
                break;

            case ')':
                // If nd is bottommost node, expecting left paren or semicolon, but not right paren
                if (!nd.parent)
                    console.log("Too many right parentheses at position " + c + " in tree description");

                // Expect right paren only after an edge length, a node name, or another right paren
                if (!(previous & RParen_Valid))
                    console.log("Unexpected right parenthesisat position " + c + " in tree description");

                // Go down a level
                nd = nd.parent;
                if (!nd.lchild.rsib)
                    console.log("Internal node has only one child at position " + c + " in tree description");
                previous = Prev_Tok.RParen;
                break;

            case ':':
                // Expect colon only after a node name or another right paren
                if (!(previous & Colon_Valid))
                    console.log("Unexpected colon at position " + c + " in tree description");
                previous = Prev_Tok.Colon;
                break;

            case ',':
                // Expect comma only after an edge length, a node name, or a right paren
                if (!nd.parent || !(previous & Comma_Valid))
                    console.log("Unexpected comma at position " + c + " in tree description");

                // Create the sibling
                nd.rsib = new TreeNode();
                nd.rsib.parent = nd.parent;
                nd = nd.rsib;
                previous = Prev_Tok.Comma;
                break;

            case '(':
                // Expect left paren only after a comma or another left paren
                if (!(previous & LParen_Valid))
                    console.log("Not expecting left parenthesis at position " + c + " in tree description");

                // Create new node above and to the left of the current node
                nd.lchild = new TreeNode();
                nd.lchild.parent = nd;
                nd = nd.lchild;
                previous = Prev_Tok.LParen;
                break;

            case "'":
            case "\"":
                // Encountered an apostrophe, which always indicates the start of a
                // node name (but note that node names do not have to be quoted)

                // Expect node name only after a left paren (child's name), a comma (sib's name)
                // or a right paren (parent's name)
                if (!(previous & Name_Valid))
                    console.log("Not expecting node name at position " + c + " in tree description");

                // Get the rest of the name
                for (c++; c < newick.length; c++)
                    {
                    ch = newick[c];
                    if (ch == '\'' || ch == '\"')
                        break;
                    else if (/\s/.test(ch))
                        nd.name += ' ';
                    else
                        nd.name += ch;
                    }
                if (ch != "'" && ch != "\"")
                    console.log("Expecting single quote to mark the end of node name at position " + c + " in tree description");

                if (nd.lchild == null) {
                    if (translate) {
                        // If a translate object was provided, assume that the node
                        // node names are numbers and attempt to translate these numbers
                        // to names stored in the translate object
                        nd.number = Number(nd.name) - 1;
                        this.nleaves += 1;

                        // translate number to taxon name
                        var translated = translate[nd.name];
                        if (translated !== undefined) {
                            nd.name = translated;
                            }
                    } else {
                        // No translate object was provided, so use node names as is
                        nd.number = this.nleaves;
                        this.nleaves += 1;
                        }
                    }

                previous = Prev_Tok.Name;
                break;

            default:
                // Expecting either an edge length or an unquoted node name
                if (previous == Prev_Tok.Colon)
                    {
                    // Edge length expected (e.g. "235", "0.12345", "1.7e-3")
                    var edge_length_str = "";
                    var IC  = null;
                    var ICA = null;
                    for (; c < newick.length; c++)
                        {
                        ch = newick[c];
                        if (ch == '[') {
                            var comment = this.swallowComment(newick, c + 1);
                            nd.info = comment.message;
                            c = comment.position + 1;
                            ch = newick[c];
                            }
                        if (ch == ',' || ch == ')' || /\s/.test(ch))
                            break;
                        var valid = (ch =='e' || ch == 'E' || ch =='.' || ch == '-' || ch == '+' || /\d/.test(ch));
                        if (valid)
                            edge_length_str += ch;
                        else
                            console.log("Invalid branch length character (" + ch + ") at position " + c + " in tree description");
                        }
                    c--;
                    nd.edgelen = Number(edge_length_str);
                    if (nd.edgelen < 1.e-10)
                        nd.edgelen = 1.e-10;

                    previous = Prev_Tok.EdgeLen;
                    }
                else
                    {
                    // Get the node name
                    nd.name = "";
                    for (; c < newick.length; c++)
                        {
                        ch = newick[c];
                        if (ch == '(')
                            console.log("Unexpected left parenthesis inside node name at position " + c + " in tree description");
                        if (/\s/.test(ch) || ch == ':' || ch == ',' || ch == ')')
                            break;
                        nd.name += ch;
                        }
                    c--;

                    // Expect node name only after a left paren (child's name), a comma (sib's name) or a right paren (parent's name)
                    if (!(previous & Name_Valid))
                        console.log("Unexpected node name (" + nd.name + ") at position " + c + " in tree description");

                    if (nd.lchild == null) {
                        if (translate) {
                            nd.number = Number(nd.name) - 1;
                            this.nleaves += 1;

                            var translated = translate[nd.name];
                            if (translated !== undefined) {
                                nd.name = translated;
                                }
                        } else {
                            // No translate object was provided, so use node names as is
                            nd.number = this.nleaves;
                            this.nleaves += 1;
                            }
                        }

                    previous = Prev_Tok.Name;
                    }
            }
            if (c == newick.length-1)
                break;
        }   // loop over characters in newick string

    this.rebuildPreorder();
};

Tree.prototype.decorateNode = function(nm, func) {
    var nd = null;
    for (i in this.preorder) {
        var curr = this.preorder[i];
        if (curr.name == nm) {
            nd = curr;
            break;
            }
        }
    nd.decorate = func;
    }

// From https://en.wikipedia.org/wiki/Logarithmic_spiral
// Logarithmic spiral polar coordinates:
//   r = a e^{b \theta}
//   \theta = (1/b) log(r/a)
// Logarithmic spiral parametric form:
//   x(t) = r(t) cos(t) = a e^{bt} cos(t)
//   y(t) = r(t) sin(t) = a e^{bt} sin(t)
// phi = arctan(1/b)
// pitch = complement of phi
Tree.prototype.createLogarithmicSpiralData = function(a, b, pct, ntheta, nleaves) {
    var thetas_per_leaf = Math.round(ntheta/nleaves);
    ntheta = thetas_per_leaf*nleaves + 1;
    var data = {'curve':[], 'tips':[], 'debugline':[], 'debugcircle':[]};
    var theta1 = 0.0;
    var r = a*Math.exp(b*theta1);
    var x1 = r*Math.cos(theta1);
    var y1 = r*Math.sin(theta1);
    xmin = x1;
    xmax = x1;
    ymin = y1;
    ymax = y1;
    for (var t = 1; t < ntheta; t++) {
        theta2 = t*Math.PI/180;
        var r = a*Math.exp(b*theta2);
        var x2 = r*Math.cos(theta2);
        var y2 = r*Math.sin(theta2);
        if (x2 < xmin) xmin = x2;
        if (x2 > xmax) xmax = x2;
        if (y2 < ymin) ymin = y2;
        if (y2 > ymax) ymax = y2;
        data.curve.push({'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2, 'theta1':theta1, 'theta2':theta2});

        if (t % thetas_per_leaf == 0) {
            var theta_far = theta2 + 2*Math.PI;
            r = pct*a*Math.exp(b*theta_far);
            var x2_far = r*Math.cos(theta_far);
            var y2_far = r*Math.sin(theta_far);
            data.tips.push({'x2':x2_far, 'y2':y2_far, 'theta2':theta_far});
            console.log("t = " + t + ", t/180 = " + (t/180) + ", r = " + r)
            var phi = Math.atan(1/b);
            var thetatmp = theta2 + phi;
            var rtmp = 30;
            var xtmp = r*Math.cos(thetatmp);
            var ytmp = r*Math.sin(thetatmp);
            data.debugline.push({'x1':xtmp, 'y1':ytmp, 'x2':x2, 'y2':y2, 'col':"orange"});
            data.debugline.push({'x1':0, 'y1':0, 'x2':x2, 'y2':y2, 'col':"black"});
            data.debugcircle.push({'x2':xtmp, 'y2':ytmp, 'col':"orange"});
            data.debugcircle.push({'x2':x2, 'y2':y2, 'col':"magenta"});
            }

        x1 = x2;
        y1 = y2;
        theta1 = theta2;
        }

    return data;
    }

// assumes tree has been ladderized right already and backbone nodes identified
Tree.prototype.fitTreeToLogarithmicSpiral = function(leaf_coord, a, pct, b) {
    console.log("a = " + a + ", b = " + b);

    // postorder traversal to calculate depths of backbone nodes
    var nodes = this.preorder;
    for (var i = nodes.length - 1; i >= 0; i--) {
        var nd = nodes[i];
        if (nd.lchild && !nd.backbone) {
            // non-backbone internal node
            nd.parent.depth = nd.depth + nd.edgelen;
            }
        else if (!nd.lchild) {
            // leaf node
            nd.parent.depth = nd.edgelen;
            }
        }

    // preorder traversal to modify edge lengths above backbone nodes
    // to be proportions of total height down to backbone
    var backbone_depth = null;
    for (var i in this.preorder) {
        var nd = this.preorder[i];

        if (nd.backbone) {
            backbone_depth = nd.depth;
            }
        else {
            nd.edgelen /= backbone_depth;
            nd.depth /= backbone_depth;
            }

        console.log("nd.name = " + nd.name + ", nd.edgelen = " + nd.edgelen + ", nd.depth = " + nd.depth + ", backbone_depth = " + backbone_depth + " " + (nd.backbone ? "(backbone) " : (nd.lchild ? "(internal) " : "(leaf) ")));
        }

    // postorder traversal to set x,y coordinates of all nodes
    var leaf = 0;
    var data = {"circles":[], "lines":[], "labels":[]};
    var nodes = this.preorder;
    console.log("length of this.preorder = " + nodes.length);
    for (var i = nodes.length - 1; i >= 0; i--) {
        var nd = nodes[i];

        if (nd.lchild) {
            // internal node
            nd.angle /= nd.nchildren;
            if (nd.backbone) {
                // node is on the spiral
                var r = pct*a*Math.exp(b*(nd.angle));;
                //var r = a*Math.exp(b*nd.angle);
                nd.x = r*Math.cos(nd.angle);
                nd.y = r*Math.sin(nd.angle);
                data.circles.push({"x2":nd.x, "y2":nd.y, "col":"blue"});
                //data.labels.push({"x2":nd.x, "y2":nd.y, "text":nd.name});
                //console.log("nd.name = " + nd.name + ", nd.x = " + nd.x + ", nd.y = " + nd.y + " " + (nd.backbone ? "(backbone) " : (nd.lchild ? "(internal) " : "(leaf) ")));
                }
            else if (false) {
                // node is "above" the spiral
                var rdist = pct*a*Math.exp(b*(nd.angle));
                var rprox = a*Math.exp(b*(nd.angle - 2*Math.PI)); // angle negative inside first spiral?
                var r = rprox + (1.0 - nd.depth)*(rdist - rprox);
                nd.x = r*Math.cos(nd.angle);
                nd.y = r*Math.sin(nd.angle);
                //data.circles.push({"x2":nd.x, "y2":nd.y, "col":"red"});
                //data.labels.push({"x2":nd.x, "y2":nd.y, "text":nd.name});

                // draw line back to parent
                var rparent = rprox + (1.0 - nd.parent.depth)*(rdist - rprox);
                var xparent = rparent*Math.cos(nd.angle);
                var yparent = rparent*Math.sin(nd.angle);
                //data.lines.push({'x1':xparent, 'y1':yparent, 'x2':nd.x, 'y2':nd.y});

                // draw shoulder to left child
                rdist = pct*a*Math.exp(b*(nd.lchild.angle));
                rprox = a*Math.exp(b*(nd.lchild.angle - 2*Math.PI)); // angle negative inside first spiral?
                var rlchild = rprox + (1.0 - nd.depth)*(rdist - rprox);
                var xlchild = rlchild*Math.cos(nd.lchild.angle);
                var ylchild = rlchild*Math.sin(nd.lchild.angle);
                //data.lines.push({'x1':xlchild, 'y1':ylchild, 'x2':nd.x, 'y2':nd.y});

                // draw shoulder to right child
                var rchild = nd.lchild;
                while (rchild.rsib) {
                    rchild = rchild.rsib;
                    }
                rdist = pct*a*Math.exp(b*(rchild.angle));
                rprox = a*Math.exp(b*(rchild.angle - 2*Math.PI)); // angle negative inside first spiral?
                var rrchild = rprox + (1.0 - nd.depth)*(rdist - rprox);
                var rrchild = (1.0 - nd.depth)*pct*a*Math.exp(b*(rchild.angle));
                var xrchild = r*Math.cos(rchild.angle);
                var yrchild = r*Math.sin(rchild.angle);
                //data.lines.push({'x1':xrchild, 'y1':yrchild, 'x2':nd.x, 'y2':nd.y});

                //console.log("nd.name = " + nd.name + ", nd.x = " + nd.x + ", nd.y = " + nd.y + " " + (nd.backbone ? "(backbone) " : (nd.lchild ? "(internal) " : "(leaf) ")));
                }
            }
        else {
            // leaf node is on the outermost spiral at preselected, evenly-spaced points
            //nd.x = leaf_coord[leaf].x2;
            //nd.y = leaf_coord[leaf].y2;
            nd.angle = leaf_coord[leaf].theta2; // angle is the "far out" angle
            var r = a*Math.exp(b*(nd.angle));;
            nd.x = r*Math.cos(nd.angle);
            nd.y = r*Math.sin(nd.angle);
            //data.circles.push({"x2":nd.x, "y2":nd.y, "col":"green"});
            //data.labels.push({"x2":nd.x, "y2":nd.y, "text":nd.name});

            // edge projects backward at nd.angle a fraction (determined by nd.edgelen) of the way to the spiral
            if (!nd.parent.backbone) {
                var r = (1.0 - nd.parent.depth)*a*Math.exp(b*(nd.angle));
                var xprox = r*Math.cos(nd.angle);
                var yprox = r*Math.sin(nd.angle);
                //data.lines.push({'x1':xprox, 'y1':yprox, 'x2':nd.x, 'y2':nd.y});
                }
            //console.log("nd.name = " + nd.name + ", nd.x = " + nd.x + ", nd.y = " + nd.y + " " + (nd.backbone ? "(backbone) " : (nd.lchild ? "(internal) " : "(leaf) ")));
            leaf++;
            }

        if (nd.parent && !nd.backbone) {
            if (!nd.rsib) {
                // right-most child of parent, set parent's angle
                nd.parent.angle = nd.angle;
                nd.parent.nchildren = 1;
                }
            else {
                // not right-most child, add to parent's angle
                if (nd.parent != null) {
                    // add to parent's angle
                    nd.parent.angle += nd.angle;
                    nd.parent.nchildren++;
                    }
                }
            }
        }

    console.log("length of data.circles  = " + data.circles.length);
    console.log("length of data.lines    = " + data.lines.length);
    console.log("length of data.labels   = " + data.labels.length);
    return data;
    }

// svg is the SVG on which the tree should be plotted
// css_class is the class used for all objects (to make it easy to delete everything)
Tree.prototype.addSpiralTreeToSVG = function(svg, css_class, traits, a, pct, b) {
    var w = svg.attr("width");
    var h = svg.attr("height");
    var points = this.createLogarithmicSpiralData(a, b, pct, 2000, this.nleaves);
    //var tipdata = this.createLogarithmicSpiralData(pct*a, b, this.nleaves, 2.);
    var nodedata = this.fitTreeToLogarithmicSpiral(points.tips, a, pct, b);
    var xdiff = xmax - xmin;
    var ydiff = ymax - ymin;
    console.log(" ");
    svg.selectAll("circle." + css_class)
        .data(nodedata.circles)
        .enter()
        .append("circle")
        .attr("class", css_class)
        .attr("cx", function(d) {return w/2 + d.x2;})
        .attr("cy", function(d) {return h/2 + d.y2;})
        .attr("r", 2)
        .attr("fill", function(d) {return d.col;})
        .attr("stroke", function(d) {return d.col;});
    svg.selectAll("text." + css_class)
        .data(nodedata.labels)
        .enter()
        .append("text")
        .attr("class", css_class)
        .attr("x", function(d) {return w/2 + d.x2 + 3;})
        .attr("y", function(d) {return h/2 + d.y2 + 3;})
        .text(function(d) {return d.text;});
    svg.selectAll("line.edges")
        .data(nodedata.lines)
        .enter()
        .append("line")
        .attr("class", "edges")
        .attr("x1", function(d) {return w/2 + d.x1;})
        .attr("y1", function(d) {return h/2 + d.y1;})
        .attr("x2", function(d) {return w/2 + d.x2;})
        .attr("y2", function(d) {return h/2 + d.y2;})
        .attr("stroke", "maroon");
    svg.selectAll("line." + css_class)
        .data(points.curve)
        .enter()
        .append("line")
        .attr("class", css_class)
        .attr("x1", function(d) {return w/2 + d.x1;})
        .attr("y1", function(d) {return h/2 + d.y1;})
        .attr("x2", function(d) {return w/2 + d.x2;})
        .attr("y2", function(d) {return h/2 + d.y2;})
        .attr("stroke", "blue");
    svg.selectAll("line." + 'debug-line')
        .data(points.debugline)
        .enter()
        .append("line")
        .attr("class", 'debug-line')
        .attr("x1", function(d) {return w/2 + d.x1;})
        .attr("y1", function(d) {return h/2 + d.y1;})
        .attr("x2", function(d) {return w/2 + d.x2;})
        .attr("y2", function(d) {return h/2 + d.y2;})
        .attr("stroke", function(d) {return d.col;});
    svg.selectAll("circle." + 'debug-circle')
        .data(points.debugcircle)
        .enter()
        .append("circle")
        .attr("class", 'debug-circle')
        .attr("cx", function(d) {return w/2 + d.x2;})
        .attr("cy", function(d) {return h/2 + d.y2;})
        .attr("r", 2)
        .attr("fill", "none")
        .attr("stroke", function(d) {return d.col;});
    }

// svg is the SVG on which the tree should be plotted
// css_class is the class used for all objects (to make it easy to delete everything)
// tscale is a linear scale for translating tree heights to x-coordinates
Tree.prototype.addTreeToSVG = function(svg, css_class, tscale, traits, showtimeline = true) {
    this.xmax = 0.0;
    this.ymax = 0.0;
    var total_info = 0.0;

    var w = svg.attr("width");
    var h = svg.attr("height");

    // Provide defaults if some traits were not specified
    if (!('padding' in traits)) {
        traits.padding = 50;
    }
    if (!('node_radius' in traits)) {
        traits.node_radius = 2;
    }
    if (!('line_width' in traits)) {
        traits.line_width = 1;
    }
    if (!('taxon_labels' in traits)) {
        traits.taxon_labels = true;
    }
    if (!('show_backbone' in traits)) {
        traits.show_backbone = false;
    }

    // Set x coordinate of each node
    var nd = this.root;
    nd.x = 0.0;
    this.xmax = 0.0;
    for (var i in this.preorder) {
        nd = this.preorder[i];
        nd.x = nd.edgelen;
        if (nd.parent != null)
            nd.x += nd.parent.x;
        if (nd.x > this.xmax)
            this.xmax = nd.x;
    }

    // Set y coordinate of internal nodes to be average y coordinate of its children
    var nodes = this.preorder;
    this.ymax = 0.0;
    for (i = nodes.length - 1; i >= 0; i--) {
        nd = nodes[i];
        nd.x *= 1.0/this.xmax; // scale x coordinates to fit inside svg element width
        if (nd.lchild) {
            // non-root internal node: y already the sum of children's y values
            // divide by number of children to obtain average y value
            var nchildren = 1;
            var child = nd.lchild;
            while (child.rsib) {
                child = child.rsib;
                nchildren++;
                }
            nd.y /= nchildren;
        }
        else {
            // leaf node
            nd.y = 2*this.leaforder[nd.number];
        }

        if (nd.parent) {
            if (nd.parent.y) {
                nd.parent.y += nd.y;
            }
            else {
                nd.parent.y = nd.y;
            }
        }

        if (nd.y > this.ymax)
            this.ymax = nd.y;
    }

    // Create leaf names now so that xScale and tscale can accommodate longest name
    var widest_taxon_name = 0.0;
    if (traits.taxon_labels) {
        var taxon_names = svg.selectAll("text." + css_class)
            .data(this.preorder)
            .enter()
            .append("text")
            .attr("class", css_class)
            .attr("font-family", "Times")
            .attr("font-style", "italic")
            .attr("font-size", "16")
            .text(function(d) {
                if (d.lchild == null)
                    return d.name;
                else
                    return "";
            });

        // Determine the widest bounding box width for any taxon name
        taxon_names.each(function() {
            var w = this.getBBox().width;
            if (w > widest_taxon_name)
                widest_taxon_name = w;
        });
    }

    // debugging code to create R code for scatterplot of taxon name lengths (number of
    // characters) vs. bounding box width
    // var doofx = [];
    // var doofy = [];
    // taxon_names.each(function() {
    //     if (this.textContent.length > 0) {
    //         doofx.push(this.textContent.length);
    //         doofy.push(this.getBBox().width);
    //     }
    // });
    // console.log("x = c(" + doofx.join(",") + ")");
    // console.log("y = c(" + doofy.join(",") + ")");

    // Create scale for X axis
    xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([traits.padding, w - traits.padding - widest_taxon_name]);

    // Create scale for Y axis
    yScale = d3.scaleLinear()
        .domain([0, 2*(this.nleaves-1)])
        .range([traits.padding, h - traits.padding]);

    // Create time axis
    tscale.range([traits.padding, w - traits.padding - widest_taxon_name]);
    var taxis = d3.axisBottom(tscale)
        .ticks(5)
        .tickFormat(d3.format(".1f"));

    if (showtimeline) {
        svg.append("g")
            .attr("id", "taxis")
            .attr("class", "axis " + css_class)
            .attr("transform", "translate(0," + (h - traits.padding/2.0) + ")")
            .call(taxis);
        }

    // Walk tree in postorder sequence, creating circles for nodes
    // and connecting the circles with lines

    // nodedata is an array of integers from 0 to number_of_nodes - 1
    // any node i can be accessed as this.preorder[i]
    //var nodedata = Object.keys(this.preorder).map(Number);
    //console.log("nodedata = ", nodedata);

    // Create all circles representing nodes
    var circles = svg.selectAll("circle." + css_class)
        .data(this.preorder)
        .enter()
        .append("circle")
        .attr("class", css_class)
        .attr("cx", function(d) {
            return xScale(d.x);
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("r", function(d) {return (traits.show_backbone && d.backbone ? 2 : traits.node_radius);})
        .attr("fill",  function(d) {return (traits.show_backbone && d.backbone ? "red" : "blue");})
        .on("mouseover", function(d) {
            console.log("d.name " + d.name + ", d.x = " + d.x + ", d.y = " + d.y + ", d.edgelen =" + d.edgelen);
            //if (d.lchild == null) {
                // leaf node
                //var svgRect = d3.select("svg").node().getBoundingClientRect();
                // var rect = d3.select(this).node().getBoundingClientRect();
                // var x = xScale(d.x);
                // var y = yScale(d.y);
                // console.log("x = " + x + ", y = " + y + ", rect = ",rect);
                // d3.select("#tooltip")
                //     .style("left", x + "px")
                //     .style("top", y + "px")
                //     .select("#nodeinfo")
                //     .html(d.info);
                // d3.select("#tooltip").classed("hidden", false);
            //}
            //else {
            //    // internal node
            //    console.log("edge length =" + d.edgelen);
            //}
        })
        .on("mouseout", function() {
            d3.select("#tooltip").classed("hidden", true);
        });

    // Set x and y coordinates for taxon names
    if (traits.taxon_labels) {
        taxon_names.attr("x", function(d) {
                return xScale(d.x) + 10;
            })
            .attr("y", function(d) {
                return yScale(d.y) + 4;
            });
        }

    // Create lines extending back from each node
    var lines = svg.selectAll("polyline." + css_class)
        .data(this.preorder)
        .enter()
        .append("polyline")
        .attr("class", css_class)
        .attr("points", function(d) {
            var points = "";

            // start with the node itself
            var x = xScale(d.x);
            var y = yScale(d.y);
            points += x.toFixed(2) + "," + y.toFixed(2);

            if (d.parent != null) {
                // go straight back to parent's level (if there is a parent)
                x = xScale(d.parent.x);
                y = yScale(d.y);
                points += " " + x.toFixed(2) + "," + y.toFixed(2);

                // now up or down to parent's node
                x = xScale(d.parent.x);
                y = yScale(d.parent.y);
                points += " " + x.toFixed(2) + "," + y.toFixed(2);
            }
            //console.log(points);
            return points;
        })
        .attr("fill", "none")
        .attr("stroke-width", traits.line_width)
        .attr("stroke", "navy");

    // Call decorate function for each node if defined
    for (var i in this.preorder) {
        var nd = this.preorder[i];
        var func = nd.decorate;
        if (func) {
            func((xScale(nd.x) + xScale(nd.parent.x))/2, yScale(nd.y), svg);
            }
        }
    };

Tree.prototype.varCovMatrix = function(verbose) {
    // Returns Variance-Covariance Matrix in which variance terms are path lengths from
    // root to tip and covariances are path lengths from root to most recent common ancestor

    // Create nleaves X nleaves matrix and set every element to zero
    var V = [];
    for (var k = 0; k < this.nleaves; k++) {
        var row = [];
        for (var m = 0; m < this.nleaves; m++) {
            row.push(0.0);
            }
        V.push(row);
        }

    for (var i = 0; i < this.preorder.length; i++) {
        var nd = this.preorder[i];
        var edge_length = nd.edgelen;
        if (nd.parent != null) {
            if (nd.lchild == null) {
                //console.log("~~> adding leaf edge length " + edge_length + " to V[" + nd.number + "][" + nd.number + "]");
                V[nd.number][nd.number] += edge_length;
                }
            else {
                // make a list of all descendant leaf node numbers
                //console.log("Ancestral node number " + nd.number + " has these descendants:");
                var leaves = [];
                leaves.length = 0;
                for (var j = i+1; j < this.preorder.length; j++) {
                    var descendant = this.preorder[j];
                    if (descendant == nd.rsib)
                        break;
                    else if (descendant.lchild == null) {
                        //console.log("  leaf number " + descendant.number + " (name = " + descendant.name  + ")");
                        leaves.push(descendant.number);
                        }
                    }

                //console.log("descendants of node " + nd.number + " are:");
                //console.log(leaves);

                // add edge_length to every pairwise comparison involving elements of leaves
                for (var x = 0; x < leaves.length - 1; x++) {
                    var ndx = leaves[x];
                    V[ndx][ndx] += edge_length;
                    //console.log("~~> adding internal edge length " + edge_length + " to V[" + x + "][" + x + "]");
                    for (var y = x + 1; y < leaves.length; y++) {
                        var ndy = leaves[y];
                        V[ndx][ndy] += edge_length;
                        V[ndy][ndx] += edge_length;
                        //console.log("~~> adding internal edge length " + edge_length + " to V[" + ndx + "][" + ndy + "]");
                        //console.log("~~> adding internal edge length " + edge_length + " to V[" + ndy + "][" + ndx + "]");
                        }
                    }
                var last = leaves[leaves.length - 1];
                V[last][last] += edge_length;
                //console.log("~~> adding internal edge length " + edge_length + " to V[" + last + "][" + last + "]");
                }
            }
        }

    if (verbose) {
        console.log("Variance-Covariance Matrix:");
        var last = V.length - 1;
        var varcov = "[";
        for (var i in V) {
            varcov += "[";
            for (var j in V[i]) {
                varcov += V[i][j].toFixed(5);
                varcov += (j == last ? "]" : ",");
                }
            varcov += (i == last ? "]" : ",");
            }
        console.log("  V = np.array(" + varcov + ")");
        }

    return V;
    };



