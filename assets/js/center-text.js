//           bb.x   Set y=0 before calling getBBox so that bb.y equals
//           |      fraction of bb.height above the baseline
//  bb.y ____|_________________ ___
//           |                |  |            Example:
//           |                |  |              bb.x      = 484.28125
//           |                |  bb.height      bb.y      = -14
// (x,y) --> |................|  |              bb.width  = 31.421875
//           |________________| _|_             bb.height = 17
//           |----bb.width----|                 (thus, descent = 3 = 17 - 14)

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
