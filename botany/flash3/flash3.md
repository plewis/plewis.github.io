---
layout: applet
title: Botany Flash Cards (part 3)
author: Paul O. Lewis
permalink: /botany/flash3/
---
## Botany Flash Cards
Written by Paul O. Lewis (2-Nov-2024). 

See if you can supply the answer to each question related to the image shown before revealing the answer by pressing the Return/Enter key.

These flash cards cover material for the 3rd exam (Fall Semester, 2024).

Note that the images and questions will continue to be updated throughout the remainder of the semester, so refresh your browser each time to use this site to get the latest questions.

This is intended to help you study, but note that not everything on the exam is represented here!

<div id="details"></div>
<script type="text/javascript">
        var already_seen = [];
        for (var i in cards) {
            already_seen.push(i);
            }

        // Number of columns and column width
        var ncols = 1;
        var cell_width  = 300;

        // Number of rows and row height
        var nrows = 1;
        var cell_height = 300;

        // Spacer prividing space for attribution above image
        var top_spacer  = 10;

        // Spacer prividing space for questions and answers below image
        var bottom_spacer  = 50;

        // Font size for queations and answers
        var font_size = 18;

        // Font size for attribution
        var attr_font_size = 8;

        // Dimensions of svg object
        var w = cell_width*ncols;
        var h = (cell_height + bottom_spacer)*nrows;

        var row = 0;
        var col = 0;
        for (i in cards) {
            var x = cell_width*col;
            var y = (cell_height + bottom_spacer)*row;
            cards[i]['x'] = x;
            cards[i]['y'] = y;
            cards[i]['w'] = cell_width;
            cards[i]['h'] = cell_height;
            cards[i]['index'] = i;
        }

        var color = d3.scaleOrdinal()
            .range(d3.schemeCategory20);

        var which = 0;
        var reveal = false;

        var details_div = d3.select("div#details")
            .attr("class", "detailsbox");

        // Listen and react to keystrokes
        d3.select("body")
            .on("keydown", keyDown);

        function keyDown() {
            if (reveal) {
                // Show the answer for the current selection
                answer_grid.select("text.answer-"+which).style("visibility", "visible");
                reveal = false;
                console.log("revealing answer: which = " + which);
                }
            else {
                // Hide current selection
                rect_grid.select("rect.card-"+which).style("visibility", "hidden");
                attribution_grid.select("text.attribution-"+which).style("visibility", "hidden");
                image_grid.select("image.image-"+which).style("visibility", "hidden");
                question_grid.select("text.question-"+which).style("visibility", "hidden");
                answer_grid.select("text.answer-"+which).style("visibility", "hidden");

                // Choose a new random card to display (no repeats until all seen)
                if (already_seen.length == 1) {
                    which = already_seen[0];
                    already_seen.length = 0;
                    for (let i in cards) {
                        already_seen.push(i);
                    }
                }
                else {
                    let k = Math.floor(already_seen.length*Math.random());
                    which = already_seen[k];
                    already_seen.splice(k,1);
                }

                // Display the new card image and question but hide the answer
                rect_grid.select("rect.card-"+which).style("visibility", "visible");
                attribution_grid.select("text.attribution-"+which).style("visibility", "visible");
                image_grid.select("image.image-"+which).style("visibility", "visible");
                question_grid.select("text.question-"+which).style("visibility", "visible");
                answer_grid.select("text.answer-"+which).style("visibility", "hidden");
                reveal = true;
                console.log("showing new card: which = " + which);
                }
        }

        // Create SVG element
        var svg = details_div
            .append("svg")
            .attr("width", w)
            .attr("height", h);
            
        // Use filled rect to delimit plot area for debugging
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "lavender");            

        // Create rects representing cards
        var rect_grid = svg.append("g");
        rect_grid.selectAll("rect")
            .data(cards)
            .enter()
            .append("rect")
            .attr("class", function(d) {return "card-"+d['index'];})
            .attr("x", function(d) {return d['x'];})
            .attr("y", function(d) {return d['y'];})
            .attr("width", function(d) {return d['w'];})
            .attr("height", function(d) {return d['h'];})
            .attr("fill", "none")
            .attr("stroke", "none")
            .attr("stroke-width", 1)
            .style("visibility", "hidden");

        // Create image elements
        var image_grid = svg.append("g");
        image_grid.selectAll("image")
            .data(cards)
            .enter()
            .append("image")
            .attr("class", function(d) {return "image-"+d['index'];})
            .attr("xlink:href", function(d) {return "img/" + d['filename'];})
            .attr("x", function(d) {return d['x'];})
            .attr("y", function(d) {return d['y'];})
            .attr("width", function(d) {return d['w'];})
            .attr("height", function(d) {return d['h'];})
            .style("visibility", "hidden");

        // Create text elements showing image attribution
        var attribution_grid = svg.append("g");
        attribution_grid.selectAll("text")
            .data(cards)
            .enter()
            .append("text")
            .attr("class", function(d) {return "attribution-"+d['index'];})
            .attr("x", "0")
            .attr("y", function(d) {return d['y'] + top_spacer;})
            .style("fill", function(d) {return d['attrcolor'];})
            .attr("font-family", "Verdana")
            .attr("font-size", attr_font_size.toFixed(0))
            .html(function(d) {return d['attribution'];})
            .style("visibility", "hidden");

        // Create text elements showing questions
        var question_grid = svg.append("g");
        question_grid.selectAll("text")
            .data(cards)
            .enter()
            .append("text")
            .attr("class", function(d) {return "question-"+d['index'];})
            .attr("x", "0")
            .attr("y", function(d) {return d['y'] + cell_height + 18;})
            .attr("font-family", "Verdana")
            .attr("font-size", font_size.toFixed(0))
            .text(function(d) {return d['question'];})
            .style("visibility", "hidden");

        // Create text elements showing answers
        var answer_grid = svg.append("g");
        answer_grid.selectAll("text")
            .data(cards)
            .enter()
            .append("text")
            .attr("class", function(d) {return "answer-"+d['index'];})
            .attr("x", "0")
            .attr("y", function(d) {return d['y'] + cell_height + 38;})
            .attr("font-family", "Verdana")
            .attr("font-size", font_size.toFixed(0))
            .text(function(d) {return d['answer'];})
            .style("visibility", "hidden");

        // center attribution horizontally
        attribution_grid.selectAll("text")
            .attr("x", function(d) {
                var textw = this.getBBox().width;
                return d['x'] + (cell_width - textw)/2;
            });

        // center question horizontally
        question_grid.selectAll("text")
            .attr("x", function(d) {
                var textw = this.getBBox().width;
                return d['x'] + (cell_width - textw)/2;
            });

        // center answer horizontally
        answer_grid.selectAll("text")
            .attr("x", function(d) {
                var textw = this.getBBox().width;
                return d['x'] + (cell_width - textw)/2;
            });

        keyDown();
</script>

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library.
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.

