---
layout: page
title: ggtree Lab
permalink: /ggtree/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

## Goals

The goal of this lab is to learn how to make figures involving phylogenetic trees for purposes of publication. FigTree is one option, but today we will be using the software `ggtree` in R and [iTOL](https://itol.embl.de) for drawing elegant circle trees for large phylogenies.

We will not use the cluster today: everything will be installed and run from your local laptop.

## Using ggtree to make tree figures

### Download a tree file

:large_blue_diamond: Navigate to the folder (on your local laptop) that you want to use for this lab and download [this tree file](https://gnetum.eeb.uconn.edu/courses/phylogenetics/lab/moths.txt).

### Install ggtree

Visit the [Bioconductor page for ggtree](http://bioconductor.org/packages/release/bioc/html/ggtree.html) and follow the instructions in the section labeled Installation to install the `ggtree` package. 

:large_blue_diamond: Here is what I typed in my R console within RStudio (but note that the instructions may have changed since I did this):

    if (!requireNamespace("BiocManager", quietly = TRUE))
        install.packages("BiocManager")
    BiocManager::install("ggtree")

This will end up installing several R packages: `ggtree`, `treeio`, `tidytree`, and `ggplot2` (from which `ggtree` is derived).

### Installing phytools

In addition to `ggtree`, we will also use the `phytools` package. 

:large_blue_diamond: Install this package using the Install button in the Packages panel of the output window within RStudio. Just type "phytools" into the Packages edit control and hit the Install button.

### Importing packages

You can import the packages we need for todays lab into your R session either using the command line or the Packages panel of the output window in RStudio.

:large_blue_diamond: To use the command line, type (or copy/paste) these lines:

    library("ggtree")
    library("treeio")
    library("phytools")
    library("tidytree")
    library("ggplot2")
    
To use RStudio, go to the Packages panel and click the checkbox beside each of these 5 packages. The search box can be used to easily find them if you don't want to do a lot of scrolling.

### Reading and storing a tree

:large_blue_diamond: We're dealing with a tree in the Newick file format, which the function `read.newick` from the package `treeio` can handle:

    tree <- read.newick("moths.txt")
    
:large_blue_diamond: You may need to use the `setwd` command to set the working directory to the same directory in which you saved the _moths.txt_ file. For example, if _moths.txt_ were in my `ggtreelab` directory, I would use a `setwd` command like this:

    setwd("/Users/plewis/ggtreelab") 
    
The above working directory path is for a MacIntosh computer; the path specification is different for Windows machines. If you are confused about how to specify the path. try typing

    getwd()
    
to see what R thinks is the current working directory. This should give you some hints about how to specify your actual working directory path.

R can handle more than just Newick formatted tree files. To see what other file formats from the various phylogenetic software that R can handle, checkout `treeio`. The functionality within `treeio` used to be part of the `ggtree` package itself, but the authors recently split `ggtree` in two with one part (`ggtree`) handling mostly plotting, and the other other part (`treeio`) handling mostly file input/output operations.

### Creating a circle tree with two clades highlighted

#### Plot the tree using all default settings 

:large_blue_diamond: Plot the tree using the `ggtree` package:

    ggtree(tree)
    
Note that ggtree has plotted just the tree itself, with no taxon labels. `ggtree`, by default, plots almost nothing, assuming you will add what you want to your tree plot. The grammar/logic of `ggtree` is meant to model that of `ggplot2` and not the R language in general. The syntax of `ggtree` and `ggplot2` makes them easily extendable and particularly useful for graphics, but is by no means intuitive to someone used to R's plot function.

### Adding/Altering Tree Elements with Geoms and Geom-Like Functions

`ggtree` has a variety of functions available to you that allow you to add different elements to a tree. Many of them have the prefix `geoms` and are collectively referred to as **geoms** (which stands for **geometric objects**). We'll only go over some of them. You start with a bare bones tree and add elements to the tree, function by function, until you get the tree looking like you want it to look. You'll see as we progress through this tutorial that visualizing trees in `ggtree` is a truly additive process.

### Leaf Labels

OK, this tree would be more useful with leaf labels. 

:large_blue_diamond: Add leaf labels using `geom_tiplab`:

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

The geoms that add layers to your plot can also be stored in variables, making for cleaner, less-cluttered code. This also means that you have less pasting to do when you want to tweak a plot.

:large_blue_diamond: Try the following, which stores the label geom in a separate variable `bluelabels`:

    bluelabels <- geom_tiplab2(size=1,color='blue')
    circletree <- ggtree(tree, layout="circular")
    t <- circletree + bluelabels
    ggsave(t, file="moth_tree.pdf", width=8, height=8)

### Clean out your plot window periodically

Unbeknownst to you, each time you replot your tree (except when you use `ggsave`), the new plot gets drawn over the top of the previous plot. These plots pile up silently, leading to a lot of plot baggage in RStudio. Try clicking the red circle with a white X inside it <img src="https://https://plewis.github.io/assets/img/red-circle-white-x.png" width="20" height="20" alt="red circle with white x inside">in the toolbar of the plot window: you will see the blue-label version of your tree disappear and be replaced by the previous tree (with large black taxon labels). You can clean out all the old plots using the menu item _Plots > Clear all..._ in the main menu of RStudio.

:large_blue_diamond: Now that we have everything stored in variables, you can replot your tree inside RStudio just by typing `t`!

    t

### Clade colors

In order to label clades, we need to tell `ggtree` which nodes represent the root of each clade we want to label. To get the clade root node of interest, use the `findMRCA` function (find Most Recent Common Ancestor) from the `phytools` package. We will pass the function two arguments: the labels of two tips that, when traced back in time, serve to locate the root node of each clade of interest. In [Keegan et al. (2019)](http://dx.doi.org/10.1111/syen.12336), the Amphipyrinae (as currently classified taxonomically) was found to be polyphyletic. Let's color two clades: one for the true Amphipyrinae, and one for a tribe (Stiriini) currently classified taxonomically in Amphipyrinae but which is actually far removed phylogenetically and thus has no business being classified within Amphipyrinae.

:large_blue_diamond: Here is how to save the two clades in the variables `amphipyrinae_clade` and `stiriini_clade`:

    amphipyrinae_clade <- findMRCA(tree, c("*Redingtonia_alba_KLKDNA0031","MM01162_Amphipyra_perflua"))
    stiriini_clade     <- findMRCA(tree, c("*Chrysoecia_scira_KLKDNA0002","*Annaphila_diva_KLKDNA0180"))

:large_blue_diamond: Now define a group that consists of the clades we want colored, and to tell `ggtree` that it should color the tree by according to the group.

    tree <- groupClade(tree, c(amphipyrinae_clade, stiriini_clade), group_name = "group")

In the above line of code, we pass the tree object to the `groupClade` function. Depsite appearances, we are not overwriting `tree` so that it consists of only the Amphipyrinae and Stiriini clades, just defining clades within `tree`. Now if you were to execute `ggtree(tree, layout="circular")` the tree will still look the same. 

:large_blue_diamond: Amend the `ggtree` command to style the tree by the grouping of clades we just made named "group":

    circletree <- ggtree(tree, layout="circular", aes(color=group, linetype="solid"))
    circletree

The `aes` stands for **aesthetics** and is used to supply various attributes affecting the look of the plotted tree to `ggtree`. As you can see, the tree gets colored according to some default color scheme. We can define our own color scheme. Let's call it `palette`:

    palette <- c("#000000", "#009E73","#e5bc06")

The values in `palette` are color values represented by a hexadecimal value. You can Google one of these hexadecimal values and a little interactive hexadecimal color picker will pop up. Feel free to pick two colors of your choosing to use in the palette, but leave `#000000` as it is. 

When you're designing a figure for publication, be sure to consider how easily your colors can be distinguished from each other by colorblind. If you use a Mac, the app [Sim Daltonism](https://apps.apple.com/us/app/sim-daltonism/id693112260?mt=12) is very handy for choosing accessible colors.

:large_blue_diamond: Amend the `ggtree` command to use the colors we defined:

    cladecolors <- scale_colour_manual(values = palette)
    circletree <- ggtree(tree, layout="circular", aes(color=group, linetype="solid"))
    circletree + cladecolors

Note that I've omitted leaf labels from `t` to avoid clutter.

The order in which clades are colored is determined by the order of clades in the `groupClade` command. Every lineage in the tree not within a defined clade (i.e. within `stiriini_clade` or `amphipyrinae_clade`) is automatically colored according to the first palette value. The first defined clade (`stiriini_clade`) is colored according to the second palette value, and the second defined clade (`amphipyrinae_clade`) is colored according to the third palette value.

### Clade labels

:large_blue_diamond: Let's add some labels to the two clades. This is relatively straightforward now that we've already defined the clade root nodes:

    a <- geom_cladelabel(node=amphipyrinae_clade, label="Amphipyrinae")
    s <- geom_cladelabel(node=stiriini_clade, label="Stiriini")
    circletree + cladecolors + a + s

:large_blue_diamond: OK, it is clear that we should adjust the labels so they're not overlapping the grouping arcs, and let's hide the legend as it is really not adding anything:

    a <-geom_cladelabel(node=amphipyrinae_clade, label="Amphipyrinae", offset.text=0.1)
    s <- geom_cladelabel(node=stiriini_clade, label="Stiriini",offset.text=0.3)
    nolegend <- theme(legend.position="none")
    circletree + cladecolors + a + s + nolegend

#### Save the circle tree

:large_blue_diamond: Let's finish by saving the circle tree we've created to a file named _circletree.pdf_:

    t <- circletree + cladecolors + a + s + nolegend
    ggsave(t, file="circletree.pdf", width=8, height=8)
    
You will see some warnings, but the tree saved in _circletree.pdf_ should look OK.

### Plotting a rectangular tree with bootstraps

It is common to want to create a figure of a tree with at least the most important bootstrap/posterior probabilities indicated.

Let's start by adding node labels to a rectangular (as opposed to circular) tree. We will use the labels to show nodal support values (e.g. bootstraps) which are stored as node labels. 

:large_blue_diamond: Display the node labels using geom_label:

    recttree <- ggtree(tree, layout="rectangular",aes(color=group, linetype="solid"))
    bootstraps <- geom_label(aes(label=label))
    recttree + bootstraps + cladecolors + a + s + nolegend

You should see A LOT of node labels appear. Let's subset the node labels in order to just show the ones we want and reduce some of the clutter. 

:large_blue_diamond: We'll first grab the `data` dataframe from within tree `q`:

    q <- ggtree(tree)
    d <- q$data
    
You can explore the structure of objects in the Environment pane of RStudio. Try clicking on `d` to see what is now stored in that variable. You should see a table with headers `parent`, `node`, `branch.length`, `label`, `group`, `isTip`, `x`, `y`, `branch`, and `angle`. We will be using only the `label` and `isTip` columns. Note as you (slowly) scroll down the rows that the labels column includes taxon labels for tips (i.e. leaves) as well as bootstrap values for internal nodes (and there are a couple of nodes, 155 and 156, with empty labels).

We will use what, in R, is known as **logical indexing** to extract the subset of labels we want. 

:large_blue_diamond: To select only internal nodes, try this:

    ok <- !d$isTip
    
We've created a variable `ok` that is a vector of all rows in `d` for which `isTip` is `FALSE`. 

:large_blue_diamond: Type the following command to see what it looks like:

    ok

You should see that `ok` has `FALSE` values up to element 155, after which all the elements are `TRUE`. Why is this?

:large_blue_diamond: Let's also filter out any nodes with bootstraps less than 90:

    ok <- !d$isTip & d$label > 90
    
:large_blue_diamond: You can count how many TRUE values are in the `ok` vector using `sum` (which adds 1 for every TRUE value and 0 for every FALSE value):

    sum
    
:large_blue_diamond: You can count how many `TRUE` values are in the `ok` vector using `sum` (which adds 1 for every `TRUE` value and 0 for every `FALSE` value):

    sum(ok)
    
:large_blue_diamond: You can count the number of `FALSE` values using:

    sum(!ok)

:large_blue_diamond: And you can count all values using:

    length(ok)

:large_blue_diamond: Do the `TRUE` and `FALSE` values add to the total count? If so, we are ready to subset our labels:

    dsubset <- d[ok,]
    highboots <- geom_label(data=dsubset, aes(label=label))
    recttree + highboots + cladecolors + a + s + nolegend

The first line above selects only those rows of `d` for which `ok` is `TRUE` (that's logical indexing in action). The strange comma is necessary because `d` is a two dimensional data frame and we only want to mess with the row (first) dimension.

The second line constructs a label geom that takes its data from `dsubset` rather than the tree's `data` object. We still need the aesthetics because we only want the label column from `dsubset` (if you click `dsubset` in the Environment panel you'll see that there is more there than just node labels; it contains just 25 rows of `d` but retains all of `d`'s columns).

#### Scale Bar and Title

:large_blue_diamond: Create a scale bar using the scale bar geom:

    scalebar <- geom_treescale(x=0, y=12)
    
I've told it to place the scale bar at `x=0` (left side; the x axis is measured in units of branch length) and `y=12` (12 "taxa" up from the bottom; each unit of the y axis is equivalent to the distance between adjacent tip labels).    

:large_blue_diamond: Create a title using `ggtitle`. Use it just like you would a geom:

    title <- ggtitle("This is a Title")

### Export Plot to PDF

:large_blue_diamond: Save the tree labeled with bootstraps greater than 90:

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

## Using iTOL to make tree figures

If you thought ggtree was a bit difficult to use, you will probably become a big fan of [iTOL](https://itol.embl.de/)! Our purpose here is just to give you the barest introduction to this amazing software: the excellent documentation and video tutorials make it easy to learn how to do what you need to do on your own. If you've even wondered how people made those beautiful circle trees in journals such as_ Science_ and _Nature_, the answer is that they probably used iTOL.

### Download a tree file

:large_blue_diamond: Download [this tree file](https://gnetum.eeb.uconn.edu/courses/phylogenetics/lab/big-green-rbcl-tree.txt). This is a 700-taxon tree of green plants based on the chloroplast-encoded RuBisCO large subunit gene _rbc_L.

:large_blue_diamond: Open a web browswer and go to the [iTOL page](https://itol.embl.de/)

    https://itol.embl.de/
    
:large_blue_diamond: You may wish to create a free account now so that you can save your work. It is not necessary to create an account for purposes of completing this lab, however.

:large_blue_diamond: Click the _Upload_ button and select the _big-green-rbcl-tree.txt_ file. Name it whatever you like; I chose _Green plants_.

### Rerooting the tree

The first issue is that the tree is rooted in a terrible place. 

:large_blue_diamond: Type `Cyanophora` in the text field that results from clicking the Search Tree Nodes button in the left panel (labeled Aa). It should find a taxon named _Cyanophora paradoxa U30821.1_. Click on the link to see where this taxon is located in the tree.

:large_blue_diamond: Click on the branch highlighted in red, then choose _Tree stucture_ and then _Re-root the tree here_ from the pop-up menus.

### Coloring the branches of a clade

Let's thicken the branches of the angiosperm (flowering plant) clade and give these branches a different color.

:large_blue_diamond: Type `Amborella` using the Search Tree Nodes button in the left panel (labeled Aa). It should find a taxon named _Amborella trichopoda L12628.1_. Click on the link to see where this taxon is located in the tree. This taxon is sister to a small clade of 5 other taxa (call it the _Nuphar_ clade), and _Amborella_ plus the _Nuphar_ clade form the sister group to all other angiosperms. 

:large_blue_diamond: Click on the relatively long edge that is the parent of the _Amborella_ + _Nuphar_ clade. This should highlight a clade of 462 leaves (two thirds of all leaves in the tree) and choose _Branches_, then _Whole clade_, then _Color_ and choose a color of your choice. While here, set the width factor to 2 to make the edges in the angiosperm clade twice the normal thickness.

### Highlight a clade using shading

Let's now shade the clade of all ferns.

:large_blue_diamond: Type `Angiopteris` using the Search Tree Nodes button in the left panel (labeled Aa). It should find a taxon named _Angiopteris evecta L11052.1_. Click on the link to see where this taxon is located in the tree.

:large_blue_diamond: _Angiopteris evecta_ is sister to all other ferns in this tree, so click on the **parent** edge (the stem of the fern clade, which contains 61 leaves) and choose _Colored ranges_, then _Create a new range_ and choose a color of your choice as well as a label (e.g. "Ferns"). 

:large_blue_diamond: Click the _+ Create range_ button.

Note that you can choose _Label_ to shade the taxon labels in the clade, _Clade_ to shade the clade itself, or _Full_ to shade the clade all the way back to the root. You can also add a border around the shading using the _Colored ranges_ dialog box. 

### Exporting a tree image

:large_blue_diamond: To export the tree to a PDF file, click on the _Export_ tab of the main _Control panel_. 

:large_blue_diamond: Choose _PDF: Portable Document Format_ from the _Format_ dropdown.

:large_blue_diamond: Choose _Full image_ from the _Export area_ radio button panel.

:large_blue_diamond: Type a file name of your choice into the _File name_ text box.

:large_blue_diamond: Push the _Export_ button to start the process of generating the figure. You will be notified when the download has begun.

### Explore iTOL

We've just given you a very small taste of what iTOL can do. Check out the [Tree Gallery](https://itol.embl.de/gallery.cgi) page to see what's possible.

### References

K Keegan, JD Lafontaine, N Wahlberg, D Wagner. 2019. Towards resolving Amphipyrinae (Lepidoptera, Noctuoidea, Noctuidae): a massively polyphyletic taxon. Systematic Entomology 44:451-464. [DOI:10.1111/syen.12336](https://doi.org/10.1111/syen.12336)

G Yu, D Smith, H Zhu, Y Guan, and TT Lam. 2017. ggtree: an R package for visualization and annotation of phylogenetic trees with their covariates and other associated data. Methods in Ecology and Evolution 8:28-36. [DOI:10.1111/2041-210X.12628](https://doi.org/10.1111/2041-210X.12628)

### What to turn in

Send _circletree.pdf_ and _bstree.pdf_ to Analisa in order to get credit for this lab.

## Acknowledgements

The ggtree part of this lab was developed by [Kevin Keegan](https://carnegiemuseums.org/carnegie-magazine/summer-2023/custodians-of-collections/) and only slightly modified later by Paul O. Lewis
