---
layout: page
title: Introduction to PAUP*
permalink: /paup/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

PAUP* is software for conducting phylogenetic analyses under a variety of optimality criteria and providing a diversity of search methods. PAUP* (the acronym PAUP originally stood for "Phylogenetic Analysis Using Parsimony"; the asterisk was added to indicate that it is no longer restricted to parsimony analyses). PAUP* was originally written (by [David L. Swofford](https://scholar.google.com/citations?user=H1jbCPkAAAAJ&hl=en)) in the 1980s, it gained a graphical user interface (GUI) in 1993 with version 3, and now is available either with or without a Windows or Mac GUI at the [Phylosolutions](https://paup.phylosolutions.com) web site. 

We will use a version of PAUP* installed on the cluster, but you can download and install it on your laptop as well if you like. Don't be put off by the "alpha test version" status: many papers have cited an alpha test version of the program. 

##  Record your answers

Each week in lab I ask you to turn in something for your lab participation points. This is just a heads-up that, as you work through this lab, you should copy the questions that begin with the "thinking" emoji (:thinking:) into a text file, separating multiple questions so that there is only one question per line, and provide your answers in the same file after each question. Attach this file to an email to us. (Please create a text file, **not** a Word file or Pages document. You can use [Notepad++](https://notepad-plus-plus.org/downloads/) on Windows to create such a file, or [BBEdit](https://www.barebones.com/products/bbedit/) on a Mac).

##  Using PAUP* to create a NEXUS data file 

First, download the file [angio35.txt](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/angio35.txt) to the cluster ([instructions](/xanadu/#downloading-files-to-the-cluster)).

Now login to the cluster (`ssh username@xanadu-submit-ext.cam.uchc.edu`) and type the following command:

    srun --partition=mcbstudent --qos=mcbstudent --pty bash

This will find a node that is not currently fully loaded with jobs and allow you to play with programs without bogging down the head node (the node everyone uses to access the cluster). You should always use `srun` if you are planning to do any computation interactively, as we will do today.

Once the system has moved you to a compute node, type the following commands to start the PAUP* program:

    module load paup/4.0a-166
    paup

Now type in the following (PAUP*) command:

    tonexus from=angio35.txt to=angio35.nex datatype=nucleotide format=text;

After the conversion, the file `angio35.nex` should be present. Type `quit` to quit PAUP*, then open this Nexus file in the nano editor to see what PAUP* did to convert the original file to Nexus format. (The most important thing PAUP* did was to count the number of nucleotides and set nchar for you.)

##  Automatically excluding sites using a default exset 

Create an assumptions block containing a default exclusion set that excludes the following sites automatically whenever the data file is executed. This should be added to the bottom of the newly-created Nexus file (i.e., after the data). You can use the nano editor for this.

    begin assumptions;
        exset * unused = 1-41 234-241 246 506-511 555 681-689 1393-1399 1797-1855 1856-1884 4754-4811;
    end;

These numbers represent nucleotide sites that are either missing a lot of data or are difficult to align. The name I gave to this exclusion set is `unused`, but you could name it anything you like. The asterisk tells PAUP* that you want this exset to be applied automatically every time the file is executed.

##  Defining sets of sites 

Create a sets block comprising the following three charset commands:
* The first charset should be named 18S and include sites 1 through 1855
* The second charset should be named rbcL and include sites 1856 through 3283
* The third charset should be named atpB and include sites 3284 through 4811
This block should be placed after the assumptions block. Look at the [description of the sets block](/nexus/#sets-block) and try to do this part on your own.

After saving the file in nano, start PAUP*, specifying the data file name on the command line:

    paup angio35.nex

If your assumptions block is correct, the output should include a statement saying that 219 characters have been excluded. If you set up your sets block correctly you should now be able to enter this command:

    exclude all;
    include rbcL;

and get no errors. In addition, PAUP* should tell you that 4592 characters were excluded (as a result of the exclude all command) and 1428 were re-included (as a result of the include rbcL command). For the rest of the exercise, we will be working with the data from all 3 genes, so re-include the 18S and atpB data:

    include 18S atpB;

PAUP* should now say that there are a total of 4811 included characters.

##  Setting up a log file 

The first item of business in starting an analysis in PAUP* is to begin logging the output to a file. The following command will begin saving all output to the file `output.txt`. Note that we have chosen to automatically replace the file if it already exists. If you are nervous about this (and would rather have PAUP* ask before overwriting an existing file), either leave off the replace keyword or substitute `append`, which tells PAUP* to simply add new output to the end of the file if it already exists.

    log file=output.txt start replace;

##  Getting help 

Type `set ?` to get a listing of the general settings. PAUP* has four "settings" commands: `set` for general settings; `pset` for settings specifically related to parsimony; `lset` for settings specifically related to likelihood; and `dset` for settings specifically related to distance methods.

> :thinking: From the output of the set command, can you determine which optimality criterion PAUP* would use if we were to do a search at this point?

{% comment %}
parsimony
{% endcomment %}

##  Performing a parsimony search 

To perform a parsimony search, first try the `alltrees` command. This command asks PAUP* to calculate the optimality criterion for every possible tree:

    alltrees;

> :thinking: What was PAUP*'s response to this request?

{% comment %}
Error(#531): Exhaustive search is not allowed for more than 12 taxa (unrooted trees). The number of trees would exceed the maximum that can be represented as a 32-bit integer value.
{% endcomment %}

Now try heuristic searching. This approach does not attempt to look at all possible trees, but instead only examines trees that are in the realm of possibility (which can still be a lot of trees!):

    hsearch;

> :thinking: What is the parsimony score of the best tree found during the search? (Write down this score somewhere for later reference.) How many trees were examined (look at "Total number of rearrangements tried")?

{% comment %}
5689: best tree found has parsimony score 
9805: rearrangements tried
{% endcomment %}

##  Showing and saving trees 

Now you probably want to take a look at the tree that PAUP* found and is now holding in memory. First, however, choose an outgroup taxon so that the (unrooted) tree will be drawn in a way that looks like it is rooted in a reasonable place, say between the gymnosperms (first 7 taxa) and angiosperms (remaining taxa):

    outgroup 1-7;
    showtree;

To make the tree appear to flow downward, which is more pleasing to the eye, tell PAUP* that you would like to use the tree order "right" (this is also commonly known as "ladderizing right"):

    set torder=right;
    showtree;

Before doing anything else, we should save this tree in a file so that it will be available later, perhaps for viewing or printing in FigTree. Let's call the treefile `pars.tre`. The `brlens` keyword in the command below tells PAUP* that you want to save the branch lengths as well as just the tree topology (almost always a good option to include):

    savetrees file=pars.tre brlens;

##  Scoring trees using the likelihood criterion 

You may have noticed that PAUP* found 5 most-parsimonious trees. These 5 trees are all indistinguishable using the parsimony criterion. Let's now use the likelihood criterion to evaluate these 5 trees: 

    set criterion=likelihood;
    lscores all;

These commands ask PAUP* to simply evaluate the likelihood score of the trees in memory. Note that because we arrived at these trees using parsimony, it is quite possible that none of these trees represents the maximum likelihood tree. That is, we may be able to find better trees under the likelihood criterion if we performed a search using the likelihood criterion. 

> :thinking: What is the likelihood score of the best tree? (As for parsimony, write this number down for later comparison.) Is the likelihood score the same for all 5 trees? Which tree is best?

{% comment %}
Tree             1           2           3           4           5
------------------------------------------------------------------
-ln L    38601.620   38612.462   38602.372   38613.245   38616.348
           (best)
{% endcomment %}

**Important:** PAUP* reports the _negative_ of the natural logarithm of the likelihood score. This means that **smaller numbers are better**, as smaller numbers represent higher likelihoods. Why does PAUP* do this? For the sake of consistency: in PAUP*, the minimum score is always the best score. You should always report log-likelihoods as negative numbers, however.

##  Comparing NJ to parsimony and likelihood 

Next, we will obtain a neighbor-joining tree. Neighbor-joining (NJ for short) is one of the algorithmic methods: that is, it uses an optimality criterion (the minimum evolution criterion) at each step of the algorithm, but in the end produces an estimate of the phylogeny without actually examining many trees:

    nj;

Let's see how the NJ tree compares to the tree found by parsimony. First, use the `lscores` command to compute the log-likelihood of the NJ tree:

    lscores all;

Now compute the parsimony score of the NJ tree using the `pscores` command:

    pscores all;

> :thinking: According to the parsimony criterion, is the NJ tree better than any of the trees found by parsimony? According to the likelihood criterion, is the NJ tree better than the best tree you have found thus far? Based on the work you have done, is it possible to say definitively whether the NJ tree is better or worse (according to the likelihood criterion) than the maximum likelihood tree?

{% comment %}
5718: parsimony score of the NJ tree (worse than tree found by parsimony 5689)
-37364.653: likelihood score of NJ tree (worse than likelihood score (-37266.208) of the parsimony tree)
can definitively say that NJ is worse than the ML tree because it is worse than a tree that is not as good as the ML tree
{% endcomment %}

##  Closing down 

That's all for today. The only thing left to do is to close the log file you opened and quit PAUP*:

    log stop;
    quit;

You can use `Ctrl-d` (or type `exit`) to quit your session on the cluster. Don't forget to send in your answers to the questions posed.
