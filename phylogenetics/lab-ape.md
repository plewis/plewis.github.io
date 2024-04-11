---
layout: page
title: APE (and related tools) Lab
permalink: /ape/
---
[Up to the Phylogenetics main page](/phylogenetics2024/)

## Goals

This lab is an introduction to some of the capabilities of APE, a phylogenetic analysis package written for the R language. We will also make use of some tools built upon the APE foundation, such as phytools, geiger, and caper. In this lab, you will use these to compute the simple examples of Felsenstein's independent contrasts and PGLS presented in lecture, and will explore ways to measure phylogenetic information in continuous traits.

Here is an overview of today's themes:

* [Exploring tree structure](#exploring-tree-structure) shows how to easily plot trees using the plotTrees function in phytools
* [Diversification analyses](#diversification-analyses) uses APE to make lineage through time (LTT) plots and estimate diversification rates
* [Independent contrasts](#independent-contrasts) uses the pic function in ape to calculate Felsenstein's independent contrasts for the simple example we did by hand in lecture
* [PGLS regression](#phylogenetic-generalized-least-squares-regression) uses the pgls command in caper to compute the intercept and slope for the simple PGLS example we did by hand in lecture
* [An empirical example](#an-empirical-example) uses the pgls function in caper to examine a real question in a real data file (that is much too big to do by hand!) and uses the phylosig function in phytools to estimate phylogenetic signal with Pagel's lambda and Blomberg's K.

## Template for recording your answers to questions

    1. What is the slope of this line (on log scale)? Is it close to the birth rate 10? 
    answer:
    
    2. What is the death rate estimated by APE? 
    answer:
    
    3. Is the true diversification rate within one standard error of the estimated diversification rate? 
    answer:
    
    4. Are the true diversification and relative extinction values within the profile likelihood 95% confidence intervals? 
    answer:
    
    5. What is the estimate of the intercept? 
    answer:
    
    6. What is the estimate of the slope? 
    answer:

    6. Which elements of the variance-covariance matrix tell you that this matrix represents no phylogenetic information?
    answer:
    
    7. Is the relationship between body size (as measured by wing length) and the two song traits statistically significant once phylogeny is taking into account? What part of the model summary output tells you the answer to this?
    answer:
    
    8. Is body size positively or negatively associated with the length of notes in songs? (Hint: look at the estimated coefficient for Note_Length.)
    answer:
    
    10. Is body size positively or negatively associated with the frequency of songs? (Hint: look at the estimated coefficient for Dominant_frequency.)
    answer:
    
    11. What are the estimated values of Pagel's lambda and Blomberg's K? What does this imply about phylogenetic signal?
    answer:
    
    12. Does this character have more or less signal than Note_Length? Does it have a significant amount of signal?
    answer:
    
## Installing APE and related packages

**APE** is a package largely written and maintained by [Emmanuel Paradis](http://ape-package.ird.fr/ep/), who has written a very nice book ([Paradis 2006](/phylogenetics2022#literature-cited)) explaining in detail how to use APE. APE is designed to be used inside the [R](http://www.r-project.org/) programming language, which you are no doubt familiar with and was the subject of an earlier lab this semester (see [Using R to explore probability distributions](/rprobdist/)). APE can do an impressive array of analyses. For example, it is possible to estimate trees using neighbor-joining or maximum likelihood, estimate ancestral states (for either discrete or continuous data), perform Sanderson's penalized likelihood relaxed clock method to estimate divergence times, evaluate Felsenstein's independent contrasts, estimate birth/death rates, perform bootstrapping, and even automatically pull sequences from GenBank given a vector of accession numbers! APE also has impressive tree plotting capabilities, of which we will only scratch the surface today (flip through Chapter 4 of the Paradis book to see what more APE can do).

APE is also the foundation for many other R packages. Here are some examples of other R packages used in phylogenetics that depend on APE: [phytools](https://cran.r-project.org/web/packages/phytools/index.html) by [Liam Revell](http://faculty.umb.edu/liam.revell/), [geiger](https://cran.r-project.org/web/packages/geiger/index.html) by [Matthew Pennell](https://www.zoology.ubc.ca/person/matthew-pennell), and [hisse](https://cran.r-project.org/web/packages/hisse/index.html) by [Jeremy Beaulieu](https://www.jeremybeaulieu.org/people.html) and [Brian O'Meara](http://brianomeara.info). The full list can be seen by looking at the "Reverse depends" section of the [APE CRAN site](https://cran.r-project.org/web/packages/ape/index.html).

None of the analyses we will do today are very computationally demanding, so I'll assume you are using R installed on your own laptop. I highly recommend using [RStudio](https://rstudio.com/products/rstudio/) because it provides a nice interface to R that allows you to type commands, plot things, and get help all within one multi-paned application window.

If you haven't used APE before, you will need to install it as well as some derived packages that we will use today. Start R and type the following at the R command prompt (which looks like a greater-than symbol, $$>$$):

     install.packages("ape")
     install.packages("phytools")
     install.packages("caper")
     install.packages("geiger")
     
Assuming you are connected to the internet, R should locate these packages and install them for you. After they are installed, you will need to load them into R in order to use them (note that no quotes are used this time):

     library(ape)
     library(phytools)
     library(caper)
     library(geiger)
     
You should never again need to issue the `install.packages` command for this package again, but you will need to use the `library` command to load them whenever you want to use them.

## Exploring tree structure

Download the file _yule.tre_ into a new, empty folder somewhere on your computer. If you are using a Mac or Linux (or if you are using Windows but you have opened a Git for Windows Bash terminal), you can use curl as follows:

    curl -O https://plewis.github.io/assets/data/yule.tre
    
Tell R where this folder is using the `setwd` (set working directory) command. For example, I created a folder named `apelab` on my desktop, so I typed this to make that folder my working directory:

    setwd("/Users/plewis/Desktop/apelab")
    
(If you are using R Studio in Windows, you'll need to use the Windows-style path with the backslashes rather than forward slashes.)

Now you should be able to read in the tree using this ape command (the `t` is an arbitrary name I chose for the variable used to hold the tree; you could use `tree` if you want):

    t <- read.nexus("yule.tre")
    
We use `read.nexus` because the tree at hand is in NEXUS format, but APE has a variety of functions to read in different tree file types. If APE can't read your tree file, then give the package treeio a spin. APE stores trees as an object of type "phylo". 

### Getting a tree summary

Some basic information about the tree can be obtained by simply typing the name of the variable you used to store the tree:

    t
    
    Phylogenetic tree with 20 tips and 19 internal nodes.
    
    Tip labels:
 	  B, C, D, E, F, G, ...
    
    Rooted; includes branch lengths.

### Obtaining vectors of tip and internal node labels

The variable `t` has several attributes that can be queried by following the variable name with a dollar sign and then the name of the attribute. For example, the vector of tip labels can be obtained as follows:

    t$tip.label
    [1] "B" "C" "D" "E" "F" "G" "H" "I" "J" "K" "L" "M" "N" "O" "P" "Q" "R" "S" "T" "U"
    
The internal node labels, if they exist, can be obtained this way:

    t$node.label
    NULL
    
The `NULL` result above means that labels for the internal nodes were not stored with this tree.

### Obtaining the nodes attached to each edge 

The nodes at the ends of all the edges in the tree can be had by asking for the edge attribute:

    t$edge
           [,1] [,2]
      [1,]   21   22
      [2,]   22   23
      [3,]   23    1
        .     .    .
        .     .    .
        .     .    .
     [38,]   38   12 

#### Obtaining a vector of edge lengths 

The edge lengths can be printed thusly:

    t$edge.length
      [1] 0.07193600 0.01755700 0.17661500 0.02632500 0.01009100 0.06893900 0.07126000 0.03970200 0.01912900
     [10] 0.01243000 0.01243000 0.03155800 0.05901300 0.08118600 0.08118600 0.00476400 0.14552600 0.07604800
     [19] 0.00070400 0.06877400 0.06877400 0.02423800 0.02848800 0.01675100 0.01675100 0.04524000 0.19417200
     [28] 0.07015000 0.12596600 0.06999200 0.06797400 0.00201900 0.00201900 0.12462600 0.07128300 0.00004969
     [37] 0.00004969 0.07133200

### About the tree 

The tree in the file `yule.tre` was obtained using PAUP from 10,000 nucleotide sites simulated from a Yule tree. The model used to generate the simulated data (HKY model, kappa = 4, base frequencies = 0.3 A, 0.2 C, 0.2 G, and 0.3 T, no rate heterogeneity) was also used in the analysis by PAUP (the final ML tree was made ultrametric by enforcing the clock constraint).

{% comment %}
I analyzed these data in BEAST for part of a lecture. See slide 22 and beyond in [http://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/DivTimeBayesianBEAST.pdf this PDF file] for details.
{% endcomment %}

### Plotting trees using the PhyTools plotTree command

You can plot trees easily using the **plot** command in APE or the **plotTree** command in PhyTools. 

To plot the tree using all defaults, use this PhyTools command:

    plotTree(t)

### Hide the taxon names

    plotTree(t, ftype="off")

The default behavior is to show the taxon names.

### Make the edges thicker

    plotTree(t, lwd=4)

An edge width of 1 is the default.

### Make taxon labels smaller or larger

    plotTree(t, fsize=.5)

The `fsize` parameter governs relative scaling of the taxon labels, with 1.0 being the default. Thus, the command above makes the taxon labels half the default size.

### Change the orientation

The default direction is "rightwards", but "leftwards", "upwards", and "downwards" are possible.

    plotTree(t, direction="leftwards")

### Put a dot at each node

FALSE (F) is the default for the `pts` parameter, but you can add dots by changing it to TRUE (T):

    plotTree(t, pts=T)
    
### Change the plotting style

The default for `type` is "phylogram", but "fan" and "cladogram" are options: 

    plotTree(t, type="fan")
    plotTree(t, type="cladogram")
        
## Diversification analyses

APE can perform some lineage-through-time type analyses. The tree read in from the file `yule.tre` that you already have in memory is perfect for testing APE's diversification analyses because we know (since it is based on simulated data) that this tree was generated under a pure-birth (Yule) model.

### Lineage through time plots

This is a rather small tree, so a lineage through time (LTT) plot will be rather crude, but let's go through the motions anyway.

    ltt.plot(t)

LTT plots usually have a log scale for the number of lineages (y-axis), and this can be easily accomplished:

    ltt.plot(t, log = "y")

Now add a line extending from the point (t = -0.265, N = 2) to the point (t = 0, N = 20) using the command `segments` (note that the `segments` command is a core R command, not something added by the APE package):

    segments(-0.265, 2, 0, 20, lty="dotted")

The slope of this line should (ideally) be equal to the birth rate of the yule process used to generate the tree, which was $$\lambda=10$$.

> :thinking: What is the slope of this line (on log scale)? Is it close to the birth rate 10? 

{% comment %}
8.689
{% endcomment %}

If you get something like 68 for the slope, then you probably used _common_ logarithms rather than _natural_ logarithms of 2 and 20. The plot uses a log scale for the y-axis, so the two endpoints of the dotted line are really (-0.265, log(2)) and (0, log(20)).

### Birth/death analysis

Now let's perform a birth/death analysis. APE's `birthdeath` command estimates the birth and death rates using the node ages in a tree:

    birthdeath(t)
     Estimation of Speciation and Extinction Rates
                 with Birth-Death Models 
 
          Phylogenetic tree: t 
             Number of tips: 20 
                   Deviance: -120.4538 
             Log-likelihood: 60.22689 
        Parameter estimates:
           d / b = 0   StdErr = 0 
           b - d = 8.674513   StdErr = 1.445897 
        (b: speciation rate, d: extinction rate)
        Profile likelihood 95% confidence intervals:
           d / b: [-1.193549, 0.5286254]
           b - d: [5.25955, 13.32028]

See the excellent [APE manual](https://cran.r-project.org/web/packages/ape/ape.pdf) to learn more about the `birthdeath` function. 

> :thinking: What is the death rate estimated by APE? 

{% comment %}
0.0
{% endcomment %}

> :thinking: Is the true diversification rate within one standard error of the estimated diversification rate? 

{% comment %}
yes, one standard error each side of (10-0) is the interval from 8.554 to 11.446, and 8.674513 is inside that interval
{% endcomment %}

> :thinking: Are the true diversification and relative extinction values within the profile likelihood 95% confidence intervals? 

{% comment %}
yes
{% endcomment %}

A **profile likelihood** is obtained by varying one parameter in the model and re-estimating all the other parameters conditional on the current value of the focal parameter. Confidence intervals based on the profile likelihood are better than the usual confidence intervals when the parameter value is near a hard boundary because the usual method for estimating confidence intervals assumes that the likelihood curve is approximately normal and thus symmetric around the MLE.

{% comment %}
> :thinking: What is the correct way to interpret the 95% confidence interval for b - d: [5.25955, 13.32028]? Is it that there is 95% chance that the true value of b - d is in that interval? 

no, that is the definition of a Bayesian credible interval

> :thinking: Or, does it mean that our estimate (8.674513) is within the middle 95% of values that would be produced if the true b - d value was in that interval? 

yes
{% endcomment %}

{% comment %}
### Analyses involving tree shape

**apTreeshape** is a different R package (written by Nicolas Bortolussi et al.) that we will also make use of today. You will probably need to both install and load this package:

     install.packages("apTreeshape")
     library(apTreeshape)

The apTreeshape package (as the name applies) lets you perform analyses of tree shape (which measure how balanced or imbalanced a tree is). apTreeshape stores trees differently than APE, so you can't use a tree object that you created with APE in functions associated with apTreeshape. You can, however, convert a "phylo" object from APE to a "treeshape" object used by apTreeshape:

    ts <- as.treeshape(t)
    
Here, I'm assuming that `t` still refers to the tree you read in from the file `yule.tre` using the APE command `read.nexus`. We can now obtain a measure of **tree imbalance** known as Colless's index:

    c <- colless(ts)
    c
    [1] 44
    
The formula for Colless's index is easy to understand. Each internal node branches into a left and right lineage. The absolute value of the difference between the number of left-hand leaves and right-hand leaves provides a measure of how imbalanced the tree is with respect to that particular node. Adding these imbalance measures up over all internal nodes yields Colless's overall tree imbalance index:

$$I_C = \sum_{j=1}^{n-1} |L_j - R_j|$$

apTreeshape can do an analysis to assess whether the tree has the amount of imbalance one would expect from a Yule tree:

    colless.test(ts, model = "yule", alternative="greater", n.mc = 1000)
    
This generates 1000 trees from a Yule process and compares the Colless index from our tree (44) to the distribution of such indices obtained from the simulated trees. The p-value is the proportion of the 1000 trees generated from the null distribution that have indices greater than 44 (i.e. the proportion of Yule trees that are more _im_balanced than our tree). If the p-value was 0.5, for example, then our tree would be right in the middle of the distribution expected for Yule trees. If the p-value was 0.01, however, it would mean that very few Yule trees are as imbalanced as our tree, which would make it hard to believe that our tree is a Yule tree.

> :thinking: Does the p-value indicate that we should reject the hypothesis that a Yule process generated our tree? 

I got 0.288 so no, the Yule process can easily generate trees with the same level of imbalance as our tree

You can also test one other model with the `colless` function: the "proportional to distinguishable" (or PDA) model. This null model produces random trees by starting with three taxa joined to a single internal node, then building upon that by adding new taxa to randomly-chosen (discrete uniform distribution) edges that already exist in the (unrooted) tree. The edge to which a new taxon is added can be an internal edge as well as a terminal edge, which causes this process to produce trees with a different distribution of shapes than the Yule process, which only adds new taxa to the tips of a growing rooted tree.

    colless.test(ts, model = "pda", alternative="greater", n.mc = 1000)
    
> :thinking: Does the p-value indicate that we should reject the hypothesis that our tree is a PDA tree? 

I got 0.912, so no, PDA trees are almost always less imbalanced (more balanced) than our tree

You might also wish to test whether our tree is more _balanced_ than would be expected under the Yule or PDA models. apTreeshape let's you look at the other end of the distribution too:

    colless.test(ts, model = "yule", alternative="less", n.mc = 1000)
    colless.test(ts, model = "pda", alternative="less", n.mc = 1000)

> :thinking: Does the p-value for the first test above indicate that our tree is more balanced than would be expected were it a Yule tree? 

I got 0.716, so no, most Yule trees are more balanced than our tree

> :thinking: Does the p-value for the second test above indicate that our tree is more balanced than would be expected were it a PDA tree? 

I got 0.064, so no, our tree is not significantly more balanced than a PDA tree, but it is getting close

You might want to see a histogram of the Colless index like that used to determine the p-values for the tests above. apTreeshape lets you generate 10 trees each with 20 tips under a Yule model as follows:

    rtreeshape(10,20,model="yule")
    
That spits out a summary of the 10 trees created, but what we really wanted was to know the Colless index for each of the trees generated. To do this, use the R command `sapply` to call the apTreeshape command `colless` for each tree generated by the `rtreeshape` command:

    sapply(rtreeshape(10,20,model="yule"),FUN=colless)
      [1] 38 92 85 91 73 71 94 75 72 93

> :thinking: Why do you think your Colless indices differ from the ones above?

In a Yule model, the time between speciation events is determined by drawing random numbers from an exponential distribution. If we all started with the same initial (seed) random number, then our Colless indices would be identical.

That's more like it! Now, generate 1000 Yule trees instead of just 10, and create a histogram using the standard R command `hist`:

    yulecolless <- sapply(rtreeshape(1000,20,model="yule"),FUN=colless)
    hist(yulecolless)

Now create a histogram for PDA trees:

    pdacolless <- sapply(rtreeshape(1000,20,model="pda"),FUN=colless)
    hist(pdacolless)

Use the following to compare the mean Colless index for the PDA trees to the Yule trees:

    summary(yulecolless)
    summary(pdacolless)

> :thinking: Which generates the most balanced trees, on average: Yule or PDA? 

Yule trees are more balanced, with mean Colless index 39 versus 81 for PDA

apTreeshape provides one more function (`likelihood.test`) that performs a likelihood ratio test of the PDA model against the Yule model null hypothesis. This test says that we cannot reject the null hypothesis of a Yule model in favor of the PDA model:

    likelihood.test(ts)
    
> :thinking: Does the p-value indicate that we should reject the hypothesis that our tree is a Yule tree? 

I got 0.4095684, so no, our tree is consistent with a Yule tree
{% endcomment %}

## Independent contrasts

APE can compute Felsenstein's independent contrasts, as well as several other methods for assessing phylogenetically-corrected correlations between traits that I did not discuss in lecture (autocorrelation, generalized least squares, mixed models and variance partitioning, and the very interesting Ornstein-Uhlenbeck model, which can be used to assess the correlation between a continuous character and a discrete habitat variable).

Today, however, we will just play with independent contrasts and phylogenetic generalized least squares (PGLS) regression. Let's try to use APE's `pic` command to reproduce the [Independent Contrasts example from lecture](https://gnetum.eeb.uconn.edu/courses/phylogenetics/19a-indep-contrasts-annotated.pdf):

|       |   X  |    Y  | Var  |   X*   |   Y*   |  
| :---: | ---: | ----: | ---: | -----: | -----: |
|  A-B  |  -4  |   -4  |   2  | -2.83  | -2.83  |
|  C-D  |   2  |   -6  |   2  |  1.41  | -4.24  |
|  E-F  |  12  | -237  |  21  |  2.62  | -51.7  |

In the table, X and Y denote the raw contrasts, while X* and Y* denote the rescaled contrasts (raw contrasts divided by the square root of the variance). The correlation among the rescaled contrasts was -0.63.

### Enter the tree

Start by entering the tree:

    t <- read.tree(text="((A:1,B:1)E:10,(C:1,D:1)F:10)G;")
    
The attribute `text` is needed because we are entering the Newick tree description in the form of a string, not supplying a file name. Note that I have labeled the root node G and the two interior nodes E (ancestor of A and B) and F (ancestor of C and D).

Plot the tree to make sure the tree definition worked:

    plot(t, show.node.label=T)
    axisPhylo()
    
Here we're using APE's `plot` command (earlier we used PhyTools' `plotTree` command). `axisPhylo` is also an APE command. You can find out which package this (or some other) command is in using either 

    ?axisPhylo
    
to show the help for the command, or just type the command without the parentheses and look for the namespace at the end of the output produced.

    axisPhylo
    function (side = 1, root.time = NULL, backward = TRUE, ...) 
    .
    .
    .
    <environment: namespace:ape>

### Enter the data

Now we must tell APE the X and Y values. Do this by supplying vectors of numbers. We will tell APE which tips these numbers are associated with in the next step:

    x <- c(28, 32, 19, 17)
    y <- c(-96, -92, 140, 146)

Here's how we tell APE what taxa the numbers belong to:

    names(x) <- c("A","B","C","D")
    names(y) <- c("A","B","C","D")

If you want to avoid repetition, you can enter the names for both x and y simultaneously like this:

    names(x) <- names(y) <- c("A","B","C","D")

### Compute independent contrasts

Now compute the contrasts with the APE function `pic`:

    cx <- pic(x,t)
    cy <- pic(y,t)

The variables cx and cy are arbitrary; you could use different names for these if you wanted. Let's see what values cx and cy hold: 

    cx
            G         E         F 
     2.618615 -2.828427  1.414214 
    cy
             G          E          F 
    -51.717640  -2.828427  -4.242641 

The top row in each case holds the node name in the tree (the contrast is between the 2 descendants of this node), the bottom row holds the rescaled contrasts.

### Label interior nodes with the contrasts

APE makes it fairly easy to label the tree with the contrasts:

    plot(t)
    nodelabels(round(cx,3), adj=c(0,-1), frame="n")
    nodelabels(round(cy,3), adj=c(0,+1), frame="n")
    
In the nodelabels command, we supply the numbers with which to label the nodes. The vectors `cx` and `cy` contain information about the nodes to label, so APE knows from this which numbers to place at which nodes in the tree. The `round` command simply rounds the contrasts to 3 decimal places. The `adj` setting adjusts the spacing so that the contrasts for X are not placed directly on top of the contrasts for Y. The command `adj=c(0,-1)` causes the labels to be horizontally displaced 0 lines and vertically displaced one line up (the -1 means go up 1 line) from where they would normally be plotted. The contrasts for Y are displaced vertically one line down from where they would normally appear. Finally, the `frame="n"` just says to not place a box or circle around the labels.

You should find that the contrasts are the same as those shown as X* and Y* in the table above (as well as the summary slide (slide 13) in the [Independent Contrasts](https://gnetum.eeb.uconn.edu/courses/phylogenetics/19a-indep-contrasts-annotated.pdf) lecture. 

Computing the correlation coefficient is as easy as:

    cor(cx, cy)
     [1] -0.689693

## Phylogenetic Generalized Least Squares regression

Let's reproduce the [PGLS regression example given in lecture](https://gnetum.eeb.uconn.edu/courses/phylogenetics/19b-pgls-regression-annotated.pdf) using the **caper** package. Here are the data we used:

|       |   X   |   Y   |
| :---: | :---: | :---: |
|   A   |   2   |   1   |
|   B   |   3   |   3   |
|   C   |   1   |   2   |
|   D   |   4   |   7   |
|   E   |   5   |   6   |

Create a data frame to hold the data:

    species <- c("A","B","C","D","E")
    x <- c(2,3,1,4,5)
    y <- c(1,3,2,7,6)
    df <- data.frame(species,x,y)
    row.names(df) <- df[[1]]
    names(df) <- c("Species", "X", "Y")

The above code creates 3 vectors and then creates a data frame named `df` out of them. The row names are set using the first column of the data frame (these are the species names). The column names are specified in the last line.

{% comment %}
In order to carry out generalized least squares regression, we will need the `gls` command, which is part of the `nlme` R package. Thus, you will need to load this package before you can use the `gls` command:

    library(nlme)

Let's first do an ordinary linear regression for comparison:

    m0 <- gls(y ~ x)
    summary(m0) 
    
The command name **gls** stands for generalized least squares. The **least squares** part means that it finds the regression line that minimizes the sum of squared residuals. The **generalized** part means that it allows you to specify a variance-covariance matrix to use for the residuals, which is important when we want to incorporate the phylogeny. Right now, however, the **generalized part is not being used** because we have not specified a variance-covariance matrix.

The `y ~ x` part says to regress y on x. That is, let the variable x be the independent variable and y the dependent variable in the regression. 

> :thinking: What is the estimate of the intercept? 

-0.4

> :thinking: What is the estimate of the slope? 

1.4

Let's plot the regression line on the original data:

    plot(x, y, pch=19, xlim=c(0,6), ylim=c(0,8))
    text(x, y, labels=c("A", "B", "C", "D", "E"), pos=4, offset=1)
    segments(0, -0.4, 6, -0.4 + 1.4*6, lwd=2, lty="solid", col="blue")
    
You will have noticed that the **first line** plots the points using a filled circle (pch=19), specifying that the x-axis should go from 0 to 6 and the y-axis should extend from 0 to 8. The **second line** labels the points with the taxon to make it easier to interpret the plot. Here, pos=4 says to put the labels to the right of each point (pos = 1, 2, 3 means below, left, and above, respectively) and offset=1 specifies how far away from the point each label should be. The **third line** draws the regression line using the intercept and slope values provided by gls, making the line width 2 (lwd=2) and solid (lty="solid") and blue (col="blue").
{% endcomment %}

To do PGLS, we will need to enter the tree with edge lengths:

    t <- read.tree(text="(((A:1,B:1)F:1,C:2)G:1,(D:0.5,E:0.5)H:2.5)I;")
    
Use the APE plot command to show the tree with internal nodes labeled:

    plot(t, show.node.label=T)

### Creating a comparative data object

The caper package uses a comparative data object to combine the tree with the data.

    comp.data <- comparative.data(t, df, names.col="Species", vcv.dim=2, warn.dropped=TRUE)

Here, the tree (t) and data (df) are provided to the caper `comparative.data` function. `names.col` specifies the column in the data frame that contains the names that are used in the tree. `vcv.dim` specifies the type of variance-covariance matrix to construct from the tree. `warn.dropped=TRUE` causes caper to warn us if there are missing data for any taxon in the tree.

We can now conduct a PGLS analysis:

    m1 <- pgls(Y ~ X, data=comp.data)
    
Here's how to see the Variance-Covariance matrix constructed by caper:

    m1$Vt
    
You can see that this is the same matrix we built during lecture.

Here is a summary of the results:

    summary(m1)

{% comment %}
You are ready to estimate the parameters of the PGLS regression model:

    m1 <- gls(y ~ x, correlation=corBrownian(1,t), data=df)
    summary(m1) 

Note that this time we are using the generalized part of generalized least squares by specifying a variance-covariance matrix in the correlation parameter. 
{% endcomment %}

> :thinking: What is the estimate of the intercept? 

{% comment %}
1.75212
{% endcomment %}

> :thinking: What is the estimate of the slope? 

{% comment %}
0.70551
{% endcomment %}

{% comment %}
> :thinking: The `corBrownian` function specified for the correlation in the gls command comes from the APE package. What does `corBrownian` do? You might want to check out the excellent [APE manual](https://cran.r-project.org/web/packages/ape/ape.pdf) 

it computes the variance-covariance matrix from the tree t assuming a Brownian motion model

> :thinking: In `corBrownian(1,t)`, t is the tree, but what do you think the 1 signifies? 

It is the variance per unit time for the Brownian motion model
{% endcomment %}

### Using Pagel's lambda to modify the variance-covariance matrix

The caper package allows you to specify a value for Pagel's lambda, so let's specify 0.0. This will have the effect of removing the information provided by the phylogeny so that our subsequent PGLS analysis will be just a naïve least squares regression (i.e. without the "generalized" part). By default, caper sets the lower bound for lambda to 0.000001, so if we want it to use exactly 0.0, we need to reset the bounds too.

    m0 <- pgls(Y ~ X, data=comp.data, lambda=0.0, bounds=list(lambda=c(0,1)))
    m0$Vt
    summary(m0)
    
> :thinking: Which elements of the variance-covariance matrix tell you that this matrix represents no phylogenetic information?

{% comment %}
The fact that the off-diagonal elements are all zero meana that no two lineages share any of their history.
{% endcomment %}

### Plot both regression lines and the data

Let's plot the regression line on top of a scatter plot of the original data:

    plot(x, y, pch=19, xlim=c(0,6), ylim=c(0,8))
    text(x, y, labels=c("A", "B", "C", "D", "E"), pos=4, offset=1)
    segments(0, -0.4, 6, -0.4 + 1.4*6, lwd=2, lty="solid", col="blue")
    
You will have noticed that the **first line** plots the points using a filled circle (pch=19), specifying that the x-axis should go from 0 to 6 and the y-axis should extend from 0 to 8. The **second line** labels the points with the taxon to make it easier to interpret the plot. Here, pos=4 says to put the labels to the right of each point (pos = 1, 2, 3 means below, left, and above, respectively) and offset=1 specifies how far away from the point each label should be. The **third line** draws the regression line using the intercept and slope values provided by caper (model m0), making the line width 2 (lwd=2) and solid (lty="solid") and blue (col="blue").

Let's now add the PGLS regression line to the existing plot:

    segments(0, 1.75212, 6, 1.75212 + 0.70551*6, lwd=2, lty="dotted", col="blue")
    
## An empirical example

This part of the lab combines parts of two other tutorials, both of which are great resources on their own: [PGLS tutorial](http://www.phytools.org/Cordoba2017/ex/4/PGLS.html) and [Continuous trait models tutorial](http://www.phytools.org/Cordoba2017/ex/5/Cont-char-models.html). The index for this series of tutorials by Liam Revell, Luke Harmon, and colleagues is [here](http://www.phytools.org/Cordoba2017/).

The data we will use come from the following paper on Asian birds called [barbets](https://en.wikipedia.org/wiki/Asian_barbet):

[A Gonzalez-Voyer, R-J Den Tex, A Castello and JA Leonard. 2013. Evolution of acoustic and visual signals in Asian barbets. Journal of Evolutionary Biology 26:647-659](https://doi.org/10.1111/jeb.12084)

In these songbirds, larger birds sing at a lower frequency than smaller birds (**song frequency** is significantly **negatively** correlated with **body size**). This has to do with syrinx mass (a larger syrinx can generate a lower frequency).

Larger birds also create longer notes than do smaller birds (**note length** is significantly **positively** correlated with **body size**). This has to do with lung capacity.

Note length and song frequency can thus be used by a bird to determine the size of a potential mate. As you can see, there are good reasons to think that correlations of note length and song frequency with body size are real and maintained by sexual selection. Let's see if these correlations remain after the correlation due to phylogeny is taking into account.

Start by downloading the files [barbet-data.csv](/assets/data/barbet-data.csv) and [barbet.tre](/assets/data/barbet.tre) using curl or some other means. 

Issue a `setwd` command in R studio if these files are not in the same directory that you've been working in.

Read in the character data:

    barbet_all_data <- read.csv("barbet-data.csv", header=TRUE)
    barbet_data <- subset(barbet_all_data, select=c("Species", "Wing", "Note_Length", "Dominant_frequency"))
    row.names(barbet_data) <- barbet_data[[1]]
    
The _barbet-data.csv_ file contains data for 23 traits, but we just need data for 3 to do this analysis. The second line above selects just this subset of characters we are interested in.

The last line above sets the names of the rows equal to the species names that compose the first column in the data frame. We need row names defined so that the caper package knows how to associate rows in the data matrix with taxa in the tree.
        
Read in the tree:

    barbet_tree <- read.tree("barbet.tre")
    
Plot the tree using the phytools plotTree function:

    plotTree(barbet_tree, fsize=.7)
    
The original paper conducted a **multiple linear regression** analysis to test whether body size was related to both longer notes as well as lower frequency. To recreate their analysis, we first need to create a comparative data object in caper that associates `barbet_tree` with `barbet_data`:

    comp.data <- comparative.data(barbet_tree, barbet_data, names.col="Species", vcv.dim=2, warn.dropped=TRUE)
    
You should see a warning in red that some data were dropped when compiling the comparative data object. To see what tips in the tree were dropped, first get a list of indices showing which tips were dropped, then show the labels for those tips:

    dropped <- as.numeric(comp.data$dropped$tips)
    barbet_tree$tip.label[dropped]
    
If you show all but the first column of `barbet_data` (which just contains the species names), you can see that the species that were dropped were those that had missing data for the `Note_Length` and `Dominant_frequency` characters:

    barbet_data[c(-1)]
    
Now it's time to do PGLS on the remaining data
    
    m2 <- pgls(Wing ~ Note_Length + Dominant_frequency, data=comp.data)
    summary(m2)
    
> :thinking: Is the relationship between body size (as measured by wing length) and the two song traits statistically significant once phylogeny is taking into account? What part of the model summary output tells you the answer to this?

{% comment %}
Yes, the P value is 0.01949.
{% endcomment %}

> :thinking: Is body size positively or negatively associated with the length of notes in songs? (Hint: look at the estimated coefficient for Note_Length.)

{% comment %}
Positively, the regression coefficient for Note_Length was 0.44828.
{% endcomment %}

> :thinking: Is body size positively or negatively associated with the frequency of songs? (Hint: look at the estimated coefficient for Dominant_frequency.)

{% comment %}
Negatively, the regression coefficient for Dominant_frequency was -0.15813.
{% endcomment %}

### Measuring phylogenetic signal

The PhyTools package lets you estimate Pagel's lambda and Blomberg's K, both of which tell you something about how much phylogenetic signal is present in a continuous character. PhyTools expects the data to consist of just one character for these analyses, so we will need to isolate each character's column separately, using the R function `setNames` to assign the species name to each row. The PhyTools `phylosig` function estimates lambda and K for the character data provided on the specified tree:

    onetrait <- setNames(barbet_all_data$Note_Length, barbet_all_data$Species)
    phylosig(barbet_tree, onetrait, method="lambda", test=TRUE)
    phylosig(barbet_tree, onetrait, method="K", test=TRUE)
    
> :thinking: What are the estimated values of Pagel's lambda and Blomberg's K? What does this imply about phylogenetic signal?

{% comment %}
lambda = 1.01576 and K = 1.06906. A value of 1.0 for either statistic means that this character has about the same amount of signal as would be present if brownian motion were the true model, so both measures indicate that there is a tiny bit more correlation with phylogeny than would happen if Brownian motion was responsible.
{% endcomment %}

Now measure phylogenetic signal for the character **Colours** (the number of colors used in the color patches on the heads of these birds).

> :thinking: Does this character have more or less signal than Note_Length? Does it have a significant amount of signal?

{% comment %}
Colours has less signal than Note_Length (lambda = 0.669, K=0.205), but there is still a borderline significant amount of signal (P-value = .07 for lambda and P-value = 0.015 for K).
{% endcomment %}

## What to turn in

To get points for completing this lab, send the answers to the :thinking: thinking questions to Analisa via Slack. 

