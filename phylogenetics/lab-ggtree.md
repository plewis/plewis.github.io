---
layout: page
title: ggtree Lab
permalink: /ggtree/
---
[Up to the Phylogenetics main page](/phylogenetics2024/)

### Goals

The goal of this lab is to learn how to make figures involving phylogenetic trees for purposes of publication using the software `ggtree` in R.

### Download a tree file

Navigate to the folder (on your local laptop) that you want to use for this lab and download [this tree file](https://gnetum.eeb.uconn.edu/courses/phylogenetics/lab/moths.txt).

### Install ggtree

Visit the [Bioconductor page for ggtree](http://bioconductor.org/packages/release/bioc/html/ggtree.html) and follow the instructions in the section labeled Installation to install the `ggtree` package. Here is what I typed in my R console within RStudio (but note that the instructions may have changed since I did this):

    if (!requireNamespace("BiocManager", quietly = TRUE))
        install.packages("BiocManager")
    BiocManager::install("ggtree")

This will end up installing several R packages: `ggtree`, `treeio`, `tidytree`, and `ggplot2` (from which `ggtree` is derived).

### Installing phytools

In addition to `ggtree`, we will also use the `phytools` package. Install this package using the Install button in the Packages panel of the output window within RStudio. Just type "phytools" into the Packages edit control and hit the Install button.

### Importing packages

You can import the packages we need for todays lab into your R session either using the command line or the Packages panel of the output window in RStudio.

To use the command line, type (or copy/paste) these lines:

    library("ggtree")
    library("treeio")
    library("phytools")
    library("tidytree")
    library("ggplot2")
    
To use RStudio, go to the Packages panel and click the checkbox beside each of these 5 packages. The search box can be used to easily find them if you don't want to do a lot of scrolling.

### Reading and storing a tree

We're dealing with a tree in the Newick file format, which the function `read.newick` from the package `treeio` can handle:

    tree <- read.newick("moths.txt")
    
You may need to use the `setwd` command to set the working directory to the same directory in which you saved the _moths.txt_ file. For example, if _moths.txt_ were in my `ggtreelab` directory, I would use a `setwd` command like this:

    setwd("/Users/plewis/ggtreelab") 

R can handle more than just Newick formatted tree files. To see what other file formats from the various phylogenetic software that R can handle, checkout `treeio`. The functionality within `treeio` used to be part of the `ggtree` package itself, but the authors recently split `ggtree` in two with one part (`ggtree`) handling mostly plotting, and the other other part (`treeio`) handling mostly file input/output operations.

### Creating a circle tree with two clades highlighted

#### Plot the tree using all default settings 

Let's plot the tree using the `ggtree` package:

    ggtree(tree)
    
Note that ggtree has plotted just the tree itself, with no taxon labels. `ggtree`, by default, plots almost nothing, assuming you will add what you want to your tree plot. The grammar/logic of `ggtree` is meant to model that of `ggplot2` and not the R language in general. The syntax of `ggtree` and `ggplot2` makes them easily extendable and particularly useful for graphics, but is by no means intuitive to someone used to R's plot function.

### Adding/Altering Tree Elements with Geoms and Geom-Like Functions

`ggtree` has a variety of functions available to you that allow you to add different elements to a tree. Many of them have the prefix `geoms` and are collectively referred to as _geoms_ (which stands for "geometric objects"). We'll only go over some of them. You start with a bare bones tree and add elements to the tree, function by function, until you get the tree looking like you want it to look. You'll see as we progress through this tutorial that visualizing trees in `ggtree` is a truly additive process.

### Leaf Labels

OK, this tree would be more useful with leaf labels. Let's add them using `geom_tiplab`:

    ggtree(tree) + geom_tiplab()
    
This tree is a little crowded. You can expand the graphics window vertically to get it all to fit, but it might be better to do a circular tree:

    ggtree(tree, layout="circular") + geom_tiplab()
    
OK that's a bit easier to work with. Those tip labels are nice but a little big. `geom_tiplab` has a bunch of arguments that you can play around with, including one for the text size. You can read more about the available arguments for a given function in the [ggtree manual](https://www.bioconductor.org/packages/release/bioc/manuals/ggtree/man/ggtree.pdf). 

Plot the tree again but with smaller labels (colored blue):

    ggtree(tree, layout="circular") + geom_tiplab2(size=1,color='blue')
    
Notice we are using `geom_tiplab2` and not `geom_tiplab` to show labels on the circular tree. The `geom_tiplab2` function is specific to circular trees.

### Saving to a PDF

We usually want to save the tree to a PDF file for use in a manuscript, so let's start doing that now. In order to save the tree to a file, you need to store it in a variable (we will call it `t`):

    t <- ggtree(tree, layout="circular") + geom_tiplab2(size=1,color='blue')

Then you pass your tree variable on to the `ggsave` command:

    ggsave(t, file="moth_tree.pdf", width=8, height=8)
    
The width and height are in inches, so I've sized it to fit nicely on a standard 8.5x11 inch letter-size page. But, you say, isn't 8 inches almost too wide? Circle trees in `ggtree` tend to leave some extra margin space (and apparently there is no way around this), so 8x8 scales the tree nicely for 8.5x11 paper.

Hint: You should get used to saving your tree to a PDF file and using that as the basis for further tweaking. Getting it to look good in the plot window may yield a tree that looks quite awful when printed (e.g. labels may be too big, lines may be too thick, etc.) Use the plot window as a crude guide, but when you get close, start saving to PDF and viewing what will actually be saved.

### Storing geoms in variables

The geoms that add layers to your plot can also be stored in variables, making for cleaner, less-cluttered code. This also means that you have less pasting to do when you want to tweak a plot:

    bluelabels <- geom_tiplab2(size=1,color='blue')
    circletree <- ggtree(tree, layout="circular")
    t <- circletree + bluelabels
    ggsave(t, file="moth_tree.pdf", width=8, height=8)

### Clean out your plot window periodically

Unbeknownst to you, each time you replot your tree (except when you use `ggsave`), the new plot gets drawn over the top of the previous plot. These plots pile up silently, leading to a lot of plot baggage in RStudio. Try clicking the red circle with a white X inside it in the toolbar of the plot window: you will see the blue-label version of your tree disappear and be replaced by the previous tree (with large black taxon labels). You can clean out all the old plots using the menu item Plots > Clear all... in the main menu of RStudio.

Now that we have everything stored in variables, you can replot your tree just by typing t!

    t

### Clade colors

In order to label clades, we need to tell `ggtree` which nodes represent the root of each clade we want to label. To get the clade root node of interest, use the `findMRCA` function (find Most Recent Common Ancestor) from the `phytools` package. We will pass the function two arguments: the labels of two tips that, when traced back in time, serve to locate the root node of each clade of interest. In [Keegan et al. (2019)](http://dx.doi.org/10.1111/syen.12336), the Amphipyrinae (as currently classified taxonomically) was found to be polyphyletic. Let's color two clades: one for the true Amphipyrinae, and one for a tribe (Stiriini) currently classified taxonomically in Amphipyrinae, that is far removed phylogenetically and thus has no business being classified within Amphipyrinae:

    amphipyrinae_clade <- findMRCA(tree, c("*Redingtonia_alba_KLKDNA0031","MM01162_Amphipyra_perflua"))
    stiriini_clade     <- findMRCA(tree, c("*Chrysoecia_scira_KLKDNA0002","*Annaphila_diva_KLKDNA0180"))

Now define a group that consists of the clades we want colored, and to tell `ggtree` that it should color the tree by according to the group.

    tree <- groupClade(tree, c(amphipyrinae_clade, stiriini_clade), group_name = "group")

In the above line of code, we pass the tree object to the `groupClade` function. We are not overwriting the tree and making it consist of only the Amphipyrinae and Stiriini clades, just defining clades within tree. Now if you were to execute `ggtree(tree, layout="circular")` the tree will still look the same. We need to amend the command to tell it to style the tree by the grouping of clades we just made called "group":

    circletree <- ggtree(tree, layout="circular", aes(color=group, linetype="solid"))

The `aes` stands for "aesthetics" and is used to supply various attributes affecting the look of the plotted tree to `ggtree`. As you can see the tree gets colored according to some default color scheme. We can define our own color scheme. Let's call it `palette`:

    palette <- c("#000000", "#009E73","#e5bc06")

The values in `palette` are color values represented by a hexadecimal value. You can Google one of these hexadecimal values and a little interactive hexadecimal color picker will pop up. Feel free to pick two colors of your choosing to use in the palette, but leave `#000000` as it is. 

When you're designing a figure for publication, be sure to consider how easily your colors can be distinguished from each other by colorblind. If you use a Mac, the app [Sim Daltonism](https://apps.apple.com/us/app/sim-daltonism/id693112260?mt=12) is very handy for choosing accessible colors.

Now let's amend the `ggtree` command and tell it to use the colors we defined:

    cladecolors <- scale_colour_manual(values = palette)
    circletree <- ggtree(tree, layout="circular", aes(color=group, linetype="solid"))
    circletree + cladecolors

Note that I've omitted leaf labels from `t` to avoid clutter.

The order in which clades are colored is determined by the order of clades in the `groupClade` command. Every lineage in the tree not within a defined clade (i.e. within `stiriini_clade` or `amphipyrinae_clade`) is automatically colored according to the first palette value. The first defined clade (`stiriini_clade`) is colored according to the second palette value, and the second defined clade (`amphipyrinae_clade`) is colored according to the third palette value.

### Clade labels

Let's add some labels to the two clades. This is relatively straightforward now that we've already defined the clade root nodes:

    a <- geom_cladelabel(node=amphipyrinae_clade, label="Amphipyrinae")
    s <- geom_cladelabel(node=stiriini_clade, label="Stiriini")
    circletree + cladecolors + a + s

OK, we should adjust the labels so they're not overlapping the grouping arcs, and let's hide the legend as it is really not adding anything:

    a <-geom_cladelabel(node=amphipyrinae_clade, label="Amphipyrinae", offset.text=0.1)
    s <- geom_cladelabel(node=stiriini_clade, label="Stiriini",offset.text=0.3)
    nolegend <- theme(legend.position="none")
    circletree + cladecolors + a + s + nolegend

#### Save the circle tree

Let's finish by saving the circle tree we've created to a file named _circletree.pdf_:

    t <- circletree + cladecolors + a + s + nolegend
    ggsave(t, file="circletree.pdf", width=8, height=8)

### Plotting a rectangular tree with bootstraps

It is common to want to create a figure of a tree with at least the most important bootstrap/posterior probabilities indicated.

Let's start by adding node labels to a rectangular (as opposed to circular) tree. We will use the labels to show nodal support values (e.g. bootstraps) which are stored as node labels. We can display the node labels using geom_label.

    recttree <- ggtree(tree, layout="rectangular",aes(color=group, linetype="solid"))
    bootstraps <- geom_label(aes(label=label))
    recttree + bootstraps + cladecolors + a + s + nolegend

You should see A LOT of node labels appear. Let's subset the node labels in order to just show the ones we want and reduce some of the clutter. We'll first grab the `data` dataframe from within tree `q`:

    q <- ggtree(tree)
    d <- q$data
    
You can explore the structure of objects in the Environment pane of RStudio. Try double-clicking on `d` to see what is now stored in that variable. You should see a table with headers `parent`, `node`, `branch.length`, `label`, `group`, `isTip`, `x`, `y`, `branch`, and `angle`. We will be using only the `label` and `isTip` columns. Note as you (slowly) scroll down the rows that the labels column includes taxon labels for tips (i.e. leaves) as well as bootstrap values for internal nodes (and there are a couple of nodes, 155 and 156, with empty labels).

We will use what, in R, is known as **logical indexing** to extract the subset of labels we want. To select only internal nodes, try this:

    ok <- !d$isTip
    
We've created a variable `ok` that is a vector of all rows in `d` for which `isTip` is `FALSE`. Type `View(ok)` to see what it looks like. You should see that `ok` has `FALSE` values up to element 155, after which all the elements are `TRUE`. Why is this?

Let's also filter out any nodes with bootstraps less than 90:

    ok <- !d$isTip & d$label > 90
    
You can count how many `TRUE` values are in the `ok` vector using `sum` (which adds 1 for every `TRUE` value and 0 for every `FALSE` value):

    sum(ok)
    
You can count the number of `FALSE` values using:

    sum(!ok)

And you can count all values using:

    length(ok)

Do the `TRUE` and `FALSE` values add to the total count? If so, we are ready to subset our labels:

    dsubset <- d[ok,]
    highboots <- geom_label(data=dsubset, aes(label=label))
    recttree + highboots + cladecolors + a + s + nolegend

The first line above selects only those rows of `d` for which `ok` is `TRUE` (that's logical indexing in action). The strange comma is necessary because `d` is a two dimensional data frame and we only want to mess with the row (first) dimension.

The second line constructs a label geom that takes its data from `dsubset` rather than the tree's `data` object. We still need the aesthetics because we only want the label column from `dsubset` (if you double-click `dsubset` in the Environment panel you'll see that there is more there than just node labels; it contains just 25 rows of `d` but retains all of `d`'s columns).

#### Scale Bar and Title

Create a scale bar using the scale bar geom. I've told it to place the scale bar at `x=0` (left side; the x axis is measured in units of branch length) and `y=12` (12 "taxa" up from the bottom; each unit of the y axis is equivalent to the distance between adjacent tip labels):

    scalebar <- geom_treescale(x=0, y=12)

Create a title using `ggtitle`. Use it just like you would a geom:

    title <- ggtitle("This is a Title")

### Export Plot to PDF

    t <- recttree + highboots + cladecolors + a + s + scalebar + title + nolegend
    ggsave(t,file="bstree.pdf", width=7, height=10)
    
If the layout of your tree just isn't quite what you wanted, go back and play around with the geoms and geom-like functions until the PDF is to your liking. In particular, you may wish to modify your definition of the `a` and `s` clade labels to remove the offsets that we used for the circle tree.

### Cite ggtree

Remember to cite `ggtree` if you use it in a published work!

    citation("ggtree")

### Getting Help

The [Google Group](https://groups.google.com/forum/#!forum/bioc-ggtree) for `ggtree` is fairly active. The lead author of `ggtree` chimes in regularly to answer people's questions; just be sure you've read the documentation first, otherwise you may be told that he can't read it for you!

Speaking of documentation there is:

* [ggtree manual](https://www.bioconductor.org/packages/release/bioc/manuals/ggtree/man/ggtree.pdf)

* [more accessible documentation](https://guangchuangyu.github.io/software/ggtree/documentation/)

* [gallery of examples](https://guangchuangyu.github.io/software/ggtree/gallery/) 

* a couple of tutorial-like vignettes: 

    * [Data Integration, Manipulation and Visualization of Phylogenetic Trees](https://guangchuangyu.github.io/software/ggtree/gallery/)
    
    * [Visualizing and Annotating Phylogenetic Trees with R+ggtree](https://4va.github.io/biodatasci/r-ggtree.html)
    
Most recently, the lead author of `ggtree` released a [comprehensive online book](https://yulab-smu.github.io/treedata-book/) on `ggtree`.

### References

K Keegan, JD Lafontaine, N Wahlberg, D Wagner. 2019. Towards resolving Amphipyrinae (Lepidoptera, Noctuoidea, Noctuidae): a massively polyphyletic taxon. Systematic Entomology 44:451-464. [DOI:10.1111/syen.12336](https://doi.org/10.1111/syen.12336)

G Yu, D Smith, H Zhu, Y Guan, and TT Lam. 2017. ggtree: an R package for visualization and annotation of phylogenetic trees with their covariates and other associated data. Methods in Ecology and Evolution 8:28-36. [DOI:10.1111/2041-210X.12628](https://doi.org/10.1111/2041-210X.12628)

### What to turn in

Choose _Knit to HTML_ from the _Knit_ dropdown at the top of your BAMM.Rmd window. This will generate a BAMM.html file in your directory. Please send that file to Zach for your lab participation points for today. Also send Zach the final plot with the heatmap for your single best shift senario. 

## Acknowledgements

This lab was developed by Kevin Keegan and only slightly modified later by Paul O. Lewis
