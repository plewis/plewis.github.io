---
layout: page
title: IQ-TREE Lab
permalink: /iqtree/
---
[Up to the Phylogenetics main page](/phylogenetics2024/)

## Goals

Today you will continue learning about maximum likelihood inference and will learn to use a program (IQ-TREE) known for its speed and ability to handle large-scale phylogenetic analyses. 

## Objectives

After completing this lab, you will be able to...
* estimate a (potentially large) phylogeny using IQ-TREE 
* obtain Ultrafast Bootstrap support values for the splits in the tree
* use IQ-TREE to find loci that conflict with other loci, suggesting paralogy, horizontal transfer, etc.

## Getting started

Login to your account on the Health Center (Xanadu) cluster

    srun --qos=mcbstudent --partition=mcbstudent --pty bash
    
to start a session on a node that is not currently running jobs. Once you see the prompt, type

    module load iqtree/2.2.2
 
to load the iqtree module. (How did I know to type "iqtree/2.2.2"? Use the command "module avail" to see a list of all modules.)

## About IQ-TREE

IQ-TREE is known for its speed and ability to handle large nucleotide or protein datasets. Its main competitor is RAxML, which is also an excellent choice. We don't have time to introduce you to every program that does phylogenetics; we've chosen IQ-TREE over RAxML mainly because it has [truly excellent documentation](http://www.iqtree.org/doc/). The explanation of options for this software is far better than for most other programs you will use this semester, and you can learn a lot about phylogenetics just looking up how to do things with IQ-TREE!

## Start the tutorial 

The tutorial below is a shortened version of [the one written by Bui Minh](http://www.iqtree.org/workshop/molevol2023) (one of the main developers of IQ-TREE) for the 2023 Woods Hole Workshop in Molecular Evolution. 

## Create a directory for today

Create a new directory named, for example, `iqlab` to store data and output files for today's lab. Navigate into the `iqlab` directory using the `cd` command.

## Copy the template

Copy the text below into a text file to record you answers to questions posed in this lab.

    TODO

## Download the data

Start by downloading the sequence data file (`turtle.fa`) and partition file (`turtle.nex`) that we will be analyzing today:

    curl -O http://www.iqtree.org/workshop/data/turtle.fa
    curl -O http://www.iqtree.org/workshop/data/turtle.nex
    
The file `turtle.fa` contains the actual sequence data. It is in [FASTA format](https://en.wikipedia.org/wiki/FASTA_format), which is very simple: the data for each taxon begins with a separate line beginning with a greater-than symbol (`>`) followed by the taxon name and sometimes other information. The sequence data for that taxon begins on the next line and continues over possibly several lines until the end of the file or another `>` is encountered.

> :thinking: How many taxa are represented in the turtle.fa file?

{% comment %}
16
{% endcomment %}

The file `turtle.nex` is a NEXUS format file but does not contain sequence data! Instead this file contains only a `sets` block with `charset` statements showing the range of sites corresponding to each locus.

> :thinking: How many loci are represented in the turtle.fa file?

{% comment %}
29
{% endcomment %}

## Background 

{% include figure.html description="The BT, BC, and CT hypotheses (images from [Phylopic](https://www.phylopic.org))" url="/assets/img/bird-croc-turtle.png" css="image-right" width="100px" targeturl="https://plewis.github.io/iqtree/" %}

We will use these data to infer relationships between three familiar groups: turtles (T), crocodiles (C), and birds (B). There are three possible rooted trees for the three taxa, shown in the figure on the right. I will refer to these three hypotheses simply by the taxa that are sister to each other: i.e. BC, BT, CT. 

These data represent a small subset of the 248-locus, 16-taxon data from [Chiari et al. 2012](https://doi.org/10.1186/1741-7007-10-65), who concluded that their data "...unambiguously support turtles as a sister group to birds and crocodiles" (i.e. BC) however they found that CT was supported by "more simplistic" models and attributed this artifactual grouping to substitutional saturation at 3rd codon positions.

During the lab today, you will discover that a couple of loci tell a different story than the others and are responsible for the tendency to get the CT grouping under common models. The fact that these loci are paralogs was discovered by [Jeremy Brown and Robert Thomson in 2017](https://doi.org/10.1093/sysbio/syw101). 

Let's try to figure out which two loci are the paralogs. Start by reminding yourself of the difference between paralogs and orthologs and why unknowingly mixing paralogs and orthologs can be misleading (see slides 38 and 40 in the [first lecture](https://gnetum.eeb.uconn.edu/courses/phylogenetics/01-intro-annotated.pdf)).

## Unpartitioned analysis

Create a directory inside `iqlab` named `unpart`. Use the `cd` command to navigate into the `unpart` directory.

Use this command to estimate the tree using maximum likelihood criterion:

    iqtree2 -s ../turtle.fa -B 1000 -nt AUTO

Here is a key to the settings we chose on the command line:

* `-s` specifies that the sequence data is in the file `turtle.fa`
* `-B` says to perform 1000 ultrafast bootstraps
* `-nt AUTO` says to figure out automatically how many threads to use

Note that we had to specify `../turtle.fa` rather than `turtle.fa` because this file is located in the parent directory (`iqlab`) of the `unpart` directory in which you are now located.

A **node** in a cluster is a machine that may have multiple **cores**, where a core is a single processor. A **thread** is a part of a program that can be run independently of other parts. A single program can use multiple threads of execution to perform cacalculations in parallel, saving time. Ideally, each thread operates on a different core, otherwise threads compete with one another for time on the processor.

By specifying `-nt AUTO`, IQ-TREE will use as many cores as possible on the node that you were assigned using the `srun` command (and will use one thread per core). If you leave off the `-nt` specification, IQ-TREE will tell you in its output how many threads it _could_ have used, but will actually just use 1 of them.

The `-B` setting tells IQ-TREE to assess support for individual edges (splits) using ultrafast bootstrapping. We will discuss what bootstrapping is in lecture (and how ultrafast bootstrapping differs from standard bootstrapping), but, for now, just know that this option will end up assigning a value to each edge in the summary consensus tree that tells you how plausible that edge is. Edges with ultrafast bootstraps > 95 are strongly supported, values smaller than that are more questionable.

View the output file `turtle.fa.iqtree` in your favorite text editor (nano, BBEdit, Notepad++, etc.).

> :thinking: How many models were tested?

{% comment %}
73
{% endcomment %}

> :thinking: What was the best model according to the Bayesian Information Criterion (BIC)?

{% comment %}
GTR+F+I+R3
{% endcomment %}

An `F` in a model name means "empirical nucleotide frequencies", an `I` in the name means "proportion of invariable sites, and an `R` refers to the "free rates" model of among-site rate heterogeneity. 

BIC will make more sense once you've had the introduction to Bayesian statistics, but, for now, just remember that models with **smaller BIC values** are **better**. BIC and the Akaike Information Criterion (AIC) are alternatives to using likelihood ratio tests and have the advantage that the models compared do not need to be nested.

Considering that C comprises `alligator` and `caiman`, B comprises `Taeniopygia` and `Gallus`, and T comprises `Emys`, `Chelonoidis`, `Caretta`, and `Phrynops`...

> :thinking: Which of the 3 hypotheses (BT, BC, or CT) is supported by the ML tree? 

{% comment %}
CT
{% endcomment %}

> :thinking: What is the BIC score for this tree?

{% comment %}
232826.2606
{% endcomment %}

You can answer the following question from looking at the text-based depiction of the tree in `turtle.fa.iqtree` or you can download `turtle.fa.treefile` to your laptop and open it in FigTree for a graphical depiction. To see the bootstrap support, type `ufboot` when it asks for `label` upon opening the file, then check the "Branch labels" check box, expand that tab, and specify `ufboot` for "Display". When FigTree opens, if there is some information about nodes or edges that is encoded in the tree description, it asks you what you want to call it. I told you to call it `ufboot` but you could have typed something else. Whatever you type will show up in the "Display" dropdown control.

> :thinking: What is the ultrafast bootstrap support for this hypothesis?

{% comment %}
84
{% endcomment %}

## Partitioned analysis

Let's now analyze the data when every locus has its own distinct relative rate. This means adding 28 relative rate parameters, one for each locus except for one (that final rate can be obtained from the others because the average relative rate must equal 1). 

Create a directory named `fullpart` under `iqlab` that is at the same level as your `unpart` directory and navigate into the new `fullpart` directory.

Enter this command to run IQ-TREE:

    iqtree2 -s ../turtle.fa -p ../turtle.nex -B 1000 -nt AUTO 

Some of these options you saw before, but here is a key to all of them anyway:
    
* the `-s` specifies the sequence data file
* the `-p` specifies the partition file (which shows which sites are associated with each locus)
* the `-B` specifies the number of ultrafast bootstraps
* the `-nt AUTO` means "determine the number of threads to use automatically"
with files created earlier

> :thinking: Which of the 3 hypotheses (BT, BC, or CT) is supported by the ML tree from partitioned data?

{% comment %}
BC
{% endcomment %}

> :thinking: What is the ultrafast bootstrap support for this hypothesis?

{% comment %}
63%
{% endcomment %}

> :thinking: What is the BIC score for this tree? Is it better (smaller) or worse (larger) than the BIC for the unpartitioned ML tree?

{% comment %}
233078.3970, worse (233078.3970 - 232826.2606 = 252.1364 units larger)
{% endcomment %}

## Looking for outlier loci

Hopefully you discovered that partitioning makes a difference in which hypothesis of turtle relationships is favored. The question we'll ask in this section is: "Do all gene loci agree, or is there conflict among loci as to the best topology".

We'll do this by computing the log likelihood for each locus on each of the two trees. The log likelihood is a measure of how well the model (which includes the tree topology and edge lengths) fits the data for a particular locus. If the log likelihood for a locus is higher on tree 1 than it is on tree 2, then the data for that locus fit tree 1 better (i.e. we are less surprised at the data for that locus if we assume tree 1 was the true tree).

Create a directory named `locuscomp` (short for "locus comparison") at the same level as `fullpart` and `unpart` and navigate into it.

First, we need to get the two trees we want to compare into the same file. You can use the `cat` ("concatenate") command to merge the two files `turtle.fa.treefile` and `turtle.merge.treefile` into a new file named `turtle.treefile`:

    cat ../unpart/turtle.fa.treefile ../fullpart/turtle.nex.treefile > turtle.trees
    
Second, run IQ-TREE to generate a file of locus-log-likelihoods:

    iqtree2 -s ../turtle.fa -p ../fullpart/turtle.nex.best_scheme.nex -z turtle.trees -n 0 -wpl --prefix turtle.wpl

Here is a key to the settings:

* the `-s` specifies the sequence data file
* the `-p` specifies the partition file (we'll use the partitioning scheme from the `fullpart` analysis)
* the `-z` specifies the file containing the trees to compare
* the `-n 0` means "do zero iterations to improve the likelihood" (we just want the likelihood of the tree as it is)
* the `-wpl` invokes the "writing partition log-likelihoods" functionality
* the `--prefix turtle.wpl` makes all output file names begin with `turtle.wpl` so that we don't overwrite files created earlier
 
When the analysis is finished, you should find a file named `turtle.wpl.partlh` in the directory. Make a copy of this file so that we can modify it without destroying the original:

    cp turtle.wpl.partlh turtle.R
    
The copy ends in the filenname extension `.R`. This is because we are going to convert this file (i.e. edit it in a text editor) into a file containing commands that can be executed by the programming language [R](https://en.wikipedia.org/wiki/R_(programming_language)). 

Open the file `turtle.R` in a text editor (e.g. nano). It should look like this:

    2 29
    Tree1      -5082.67 -3414.03 -3626.37 -4298.16 ... -4394.24
    Tree2      -5086.25 -3415.55 -3609.85 -4288.83 ... -4389.8

I've used elipses (`...`) to stand for 24 values left out. The 29 numbers on the 2nd and 3rd lines of this file are the log likelihoods for the loci specified in the `../fullpart/turtle.nex.best_scheme.nex` file for one of the two trees. 

> :thinking: Is Tree1 the tree from the unpart or fullpart analysis?

{% comment %}
unpart
{% endcomment %}

Delete the first line (`2 29`) of this file and edit the two remaining lines to look like this (except your version will not have any ellipses!):

    Tree1 <- c(-5082.67, -3414.03, -3626.37, -4298.16, ..., -4394.24)
    Tree2 <- c(-5086.25, -3415.55, -3609.85, -4288.83, ..., -4389.8)

(Note the commas separating each value - don't forget to add those.)

When R reads these lines, it will make two vectors of values corresponding to the log likelihoods of the 29 loci for Tree1 and Tree2

Now add a command at the end of the file to compute a vector of differences between the log likelihoods for Tree1 and Tree2 for each locus:

    diffs <- Tree1 - Tree2
    
In R, subtracting one 29-element vector from another 29-element vector creates a new vector of length 29 containing the differences between each element.

Finally, add one more line telling R to create a bar plot showing these 29 differences graphically:

    barplot(diffs)
    
Your final `turtle.R` file should now look like this (but, again, with no ellipses):

    Tree1 <- c(-5082.67, -3414.03, -3626.37, -4298.16, ..., -4394.24)
    Tree2 <- c(-5086.25, -3415.55, -3609.85, -4288.83, ..., -4389.8)
    diffs <- Tree1 - Tree2
    barplot(diffs)

Load the R module so that you can use R to run this file:

    module load R/3.6.1
    
Now execute your `turtle.R` file in R:

    rscript turtle.R
    
This should generate a file named `Rplots.pdf`. Pull this file back down to your laptop (there is no easy way to view it on the Xanadu cluster) using Cyberduck or `scp` and open it.

> :thinking: Which 2 loci (counting over starting at 1 for the leftmost bar in the plot) stand out as saying something very different than the others?

{% comment %}
14 and 18
{% endcomment %}

> :thinking: What are these loci? (i.e. look them up in the turtles.nex file you downloaded at the start of the lab)

{% comment %}
14 is ENSGALG00000008916
18 is ENSGALG00000011434
{% endcomment %}

You should find that these two loci are the ones identified by [Brown and Thomson 2019](https://doi.org/10.1093/sysbio/syw101) as paralogs (see first paragraph of p. 522).

> :thinking: Which hypothesis of turtle relationships do these 2 loci support?

{% comment %}
Tree1, which specifies CT
{% endcomment %}

> :thinking: Which hypothesis of turtle relationships do 20 of the remaining 27 loci support?

{% comment %}
Tree2, which specifies BC
{% endcomment %}

## Excluding the outliers

Let's rerun both the unpart and fullpart analyses without these 2 loci and see if they now agree on turtle relationships.

Create a new directory `final` at the same level as `unpart`, `fullpart`, and `locuscomp` and navigate into it.

Copy the `turtle.nex` file from the parent directory into your new `final` directory:

    cp ../turtle.nex .
    
Edit the copy to remove the two lines corresponding to the two paralogous loci.

Run IQ-TREE to estimate an ML tree for the unpartitioned data:

    iqtree2 -s ../turtle.fa -B 1000 -nt AUTO --prefix unpart
    
Run IQ-TREE to estimate an ML tree for the partitioned data:

    iqtree2 -s ../turtle.fa -p turtle.nex -B 1000 -nt AUTO --prefix fullpart
    
Finally, ask IQ-TREE to use the partition-finder algorithm to merge loci that are evolving at a rate that is similar enough that they can be modeled using the same relative rate:

    iqtree2 -s ../turtle.fa -p turtle.nex -B 1000 -nt AUTO -m MFP+MERGE -rcluster 10 --prefix bestpart

The new options we haven't seen before are:

* the `-m MFP+MERGE` invokes the relaxed-clustering partition-finder algorithm
* the `-rcluster 10` says to ony examine the top 10% of partition schemes

> :thinking: Which hypothesis is now supported by each analysis and what is the ultrafast support and BIC score? (fill out the table below)

    --------------------------------------------
                  Hypothesis     ufboot      BIC 
    --------------------------------------------
    unpart     
    --------------------------------------------
    fullpart
    --------------------------------------------
    bestpart
    --------------------------------------------

{% comment %}
--------------------------------------------
              Hypothesis     ufboot      BIC 
--------------------------------------------
unpart     
--------------------------------------------
fullpart
--------------------------------------------
bestpart
--------------------------------------------
{% endcomment %}

> :thinking: Did merging partition subsets improve the fit of the model? What evidence did you use to decide this?

{% comment %}
yes, BIC is smaller for bestpart than it is for fullpart
{% endcomment %}

> :thinking: Did removing the paralogous loci improve confidence in one hypothesis over the others? What evidence did you use to decide this?

{% comment %}
yes, ufboot is larger for the BC hypothesis now than it was when the paralogs were included and even the unpart analysis now supports BC
{% endcomment %}



