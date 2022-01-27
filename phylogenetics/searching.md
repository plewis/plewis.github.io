---
layout: page
title: Searching through treespace
permalink: /searching/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

This lab explores different search strategies under the parsimony criterion.

## Getting started

Log into your account on the Health Center (Xanadu) cluster:

    ssh username@xanadu-submit-ext.cam.uchc.edu
    
Then type:

    srun --partition=mcbstudent --qos=mcbstudent --pty bash
    
This asks the scheduler to find a node (computer) in the cluster that is currently not busy. It should transfer your session from the head node to a different node. The reason we are using `srun` today is that some of the analyses we are going to run take more than a few seconds to complete. If all of us ran long jobs on the head node simultaneously, users would notice significant slowdown in response time, which is very annoying to other users. Thus, we will start developing good habits and will use `srun` to perform our interactive analyses on a node that no one else is currently using.

Once you see the prompt, type

    module load paup/4.0a-166

This will make the most recent installed version available to you. Without this line, typing `paup` may fail to do anything or may start a version of PAUP* that is (perhaps) years old!

## Download a copy of the data file

If you have not already downloaded the  [angio35.nex](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/angio35.nex) file, you can recreate it in your current directory as follows:

    curl -Ok https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/angio35.nex

## Create a command file

Now start the nano editor (do not specify a file name because you will be creating a new file) and enter the following text, saving the file as `run.nex`:

    #nexus

    begin paup;
        log file=output.txt start replace;
        execute angio35.nex;
        delete 6-.;
        alltrees fd=barchart;
        quit;
    end;

While it is possible to put a paup block directly into a data file such as _angio35.nex_, there are at least a couple of advantages to creating a separate NEXUS file like `run.nex` that contains the paup block. First, executing `run.nex` automatically starts a log file so that you will have a record of what you did. Second, it is not a great idea to put commands inside of the data file (_angio35.nex_) itself. Doing so may seem convenient at the time, but you will later forget that executing _angio35.nex_ involves starting a possibly long-running analysis that also may immediately overwrite output files that took a long time to create (if the analysis is indeed long-running).

Note that because we used the `replace` keyword in the `log` command, the file `output.txt` will be overwritten without warning if it exists. Yes, this is called _living dangerously_ but saves some frustration if a run must be restarted.

The delete command

    delete 6-.

causes PAUP* to ignore all taxa except Ephedrasinica, Gnetum_gnemJS, WelwitschiaJS, Ginkgo_biloba, and Pinus_ellCH.

The `alltrees` command conducts an exhaustive search under the parsimony criterion (parsimony is the default optimality criterion). 

The `quit` command causes PAUP* to quit.

Start PAUP*, specifying `run.nex` as the file to execute:

    paup run.nex

You will find that you need to type `y` in order to answer the question _Warning: there are unsaved trees. Do you want to quit anyway?_. You can avoid having to answer that question each time you execute _run.nex_ by placing the following just above the line containing the `quit` command:

    set nowarntsave;

This analysis should finish very quickly because you now have only 5 taxa. The `fd=barchart` setting tells PAUP to output a bar chart showing the distribution parsimony scores. 

> :thinking: How many separate tree topologies did PAUP* examine? What is the parsimony treelength of the best tree? The worst tree? How many steps separate the best tree from the next best? (consult the bar chart to determine the answer)

## Determine NNI rearrangements 

Because we performed an exhaustive enumeration, we now know which tree is the globally most parsimonious tree. We are thus guaranteed to never find a better tree were we to start an heuristic search with this tree. 

Let's do an experiment: perform an NNI heuristic search, starting with the best tree, and have PAUP* save all the trees it encounters in this search. In the end, PAUP* will have 5 trees in memory: the starting tree and the 4 trees corresponding to all possible NNI rearrangements of that starting tree.

### Exercise to turn in before the end of lab

Before you start the NNI search, use the `showtree` command to show you the tree obtained from the exhaustive enumeration. 

Draw this tree as an **unrooted** tree on a piece of paper, abbreviating the taxa as **E** for _Ephedra_, ***P*** for _Pinus_, ***W*** for _Welwitschia_, ***Gg*** for _Gnetum_ gnemon, and ***Gb*** for _Ginkgo biloba_.

Draw the 4 possible NNI rearrangements (refer to the [description of NNI in your lecture notes (slide 13)](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/SearchingConsensus.pdf) if you've forgotten) and label them with the tree number from the PAUP* output (which you shall obtain shortly).

## Perform an NNI search

Add an `hsearch` and `describe` command to your `run.nex` file, which should afterwards look like this:

    #nexus

    begin paup;
        log file=output.txt start replace;
        execute angio35.nex;
        delete 6-.;
        
        [! *** Conduct an exhaustive search]
        alltrees fd=barchart;

        [! *** Here is the best tree from the exhaustive search]
        showtree;
        
        [! *** Conduct NNI heuristic search starting with best tree]
        hsearch start=1 swap=nni nbest=15;
        
        [! *** Describe all trees]
        describe all;
        
        [! *** Quit]
        set nowarntsave;
        quit;
    end;

As you can see, I've added some  

    [!comments that begin with an exclamation point]
    
NEXUS comments that begin with ! are _printable_ comments: they will appear in the _output.txt_ log file, which provides a nice way to document what you did both in the command file as well as the output. The *** at the beginning of each comment is not necessary, but I find it helps to locate my annotations in the output file later.
    
The `hsearch` command is broken down as follows:
* `start=1` starts the search from the tree currently in memory (i.e., the best tree resulting from your exhaustive search using the parsimony criterion)
* `swap=nni` causes the Nearest-Neighbor Interchange (NNI) method to be used for branch swapping
* `nbest=15` saves the 15 best trees found during the search. Thus, were PAUP to examine every possible tree, we would end up saving all of them in memory. The reason this command is needed is that PAUP ordinarily does not save trees that are worse than the best one it has seen thus far. Here, we are interested in seeing the trees that are examined during the course of the search, even if they are not as good as the starting tree.

The `describe all` command plots the 5 trees currently in memory. The reason we are using the `describe` command rather than the `showtrees` command is because we want PAUP to show us the numbers it has assigned to the internal nodes, something that `showtrees` doesn't do.

> :thinking: Which tree was the original tree? Which trees correspond to NNI rearrangments of which internal edges on the original tree?

{% comment %}
Which tree was the original tree? 1
Which trees correspond to NNI rearrangments of which internal edges on the original tree?
Edge 36-38: tree 2 (Gn <-> E), tree 3 (W <-> E)
Edge 37-38: tree 4 (Gb <-> E), tree 5 (P <-> E)
{% endcomment %}

## Find the most parsimonious tree for all 35 taxa 

Modify your _run.nex_ file to conduct a heuristic search on _all 35 taxa_ having the following characteristics:
* The starting trees are each generated by the stepwise addition method, using random addition of sequences (you will employ the `addseq` and `start` keywords for this)
* Swap using NNI branch swapping (you will employ the `swap` keyword for this)
* Reset the `nbest` option to `all` because we want to be saving just the best trees, not suboptimal trees (yes, this option is a little confusing).
* Set the random number seed to 5555 using the `rseed` option (this determines the sequence of pseudorandom numbers used for the random additions; ordinarily you would not need to set the random number seed, but we will do this here to ensure that we all get the same results)
* Do 500 replicate searches; each replicate represents an independent search starting from a different random-addition tree (you will use the `nreps` keyword for this).

Use the following command to get PAUP to list the options for hsearch:

    hsearch ?

{% comment %}
hsearch start=stepwise addseq=random swap=nni nbest=all rseed=5555 nreps=500;
{% endcomment %}

Remember you can comment out portions of your Nexus file if you don't want to lose them: e.g.,

    #nexus

    begin paup;
        log file=output.txt start replace;
        execute angio35.nex;
        [delete 6-.;]
        [alltrees fd=barchart;]
        [showtree;]

        [! *** Conduct NNI heuristic search starting with random stepwise addition]
        hsearch [put your new options here];

        [describe all;]

        [! *** Quit]
        set nowarntsave;
        quit;
    end;

> :thinking: How many tree islands were found? How long did the search take? How many rearrangements were tried?

{% comment %}
How many tree islands were found? 51
How long did the search take? 0.75 secs
How many rearrangements were tried? 151704
{% endcomment %}

## Conduct a second search with SPR swapping 

Construct another heuristic search using SPR branch swapping. Be sure to reset the random number seed to 5555.

> :thinking: How many tree islands were found? What are the scores of the trees in each island? How long did the search take this time? How many rearrangements were tried?

{% comment %}
How many tree islands were found? 3
What are the scores of the trees in each island? 5689, 5689, and 5697
How long did the search take this time? 4.11 secs
How many rearrangements were tried? 4011561
{% endcomment %}

## Now conduct a third search with TBR swapping

> :thinking: How many tree islands were found? What are the scores of the trees in each island? How long did the search take this time? How many rearrangements were tried? How many trees are currently in memory (use the `treeinfo` command)? Has PAUP saved trees from all islands discovered during this search? (Hint: compare "Number of trees retained" to the sum of the "Size" column in the Tree-island profile.) Explain why PAUP saved the number of trees it did.

{% comment %}
How many tree islands were found? 3
What are the scores of the trees in each island? 5689, 5689, 5697
How long did the search take this time? 4.97 secs
How many rearrangements were tried? 10465462
How many trees are currently in memory? 2
Has PAUP saved trees from all islands discovered during this search? no
Explain why PAUP saved the number of trees it did. It saved the best trees, but one island contained suboptimal trees and therefore none of these trees were saved.
{% endcomment %}

Wondering about this warning?

_Multiple hits on islands of unsaved trees may in fact represent different islands._

When PAUP encounters a new island, it will find all trees composing that particular island in the process of branch swapping. If, in a new search, it encounters any trees already stored in memory, it knows that it has hit an island that it found previously. Note that it would be pointless to continue on this tack, because it will only find all the trees on that island again. For trees retained in memory, PAUP can keep track of which island they belong to (remember that it is possible for trees with the same parsimony score to be in different tree islands!). But for trees that are not retained in memory, PAUP only knows that it has encountered an island of trees having score X; it has no way of finding out how many islands are actually represented amongst the trees having score X.

> :thinking: Of the three types of branch swapping (NNI, SPR, TBR), which is the most thorough? Least thorough? How many TBR rearrangements can PAUP examine on the computer you are using in one second (on average)? Based on this, how long (in billions of years) would it take to examine all possible unrooted tree topologies if only 22 sequences were included?

{% comment %}
Of the three types of branch swapping (NNI, SPR, TBR), which is the most thorough? SPR is 26 times more thorough than NNI, TBR is 69 times more thorough than NNI and 2.6 times more thorough than SPR.
Least thorough? NNI
How many TBR rearrangements can PAUP examine on the computer you are using in one second (on average)? 10465462/4.97 = 2,105,727
Based on this, how long (in billions of years) would it take to examine all possible unrooted tree topologies if only 22 sequences were included? 
54.1220796428 <-- pc "lgamma(2*22-5+1) - (22-3)*log(2) - lgamma(22-3+1)"
bya = (exp(54.1220796428) trees)*(4.97 secs/10465462 trees)*(1 min/60 secs)*(1 hour/60 mins)*(1 day/24 hours)*(1 year/365 days)*(1 bya/1000000000 years)
4.8 bya = pc "exp(54.1220796428)*(4.97/10465462)*(1./60)*(1./60)*(1./24)*(1./365)*(1./1000000000)"
{% endcomment %}

## Compare NJ with a comparable heuristic search

In this exercise, you will conduct a Neighbor-joining (NJ) analysis using HKY distances and compare this with an heuristic search using the minimum evolution criterion. The goal of this section is to demonstrate that it is possible for heuristic searching to find a better tree than NJ, even using the same optimality criterion.

Please quit PAUP* if it is still running. The purpose of restarting is to return all settings to their default values. It is possible to do this without restarting PAUP*, but restarting is simpler.

Create a new file using nano containing the following lines. Note that we are again using the _angio35.nex_ file:

    #nexus

    begin paup; 
        execute angio35.nex;
        dset distance=hky objective=me;
        nj;
        dscores 1; [!*** NJ score above ***]
        hsearch start=1;
        dscores 1; [!*** Heuristic search score above ***]
    end;
    
(Reminder: the text surrounded by square brackets is a comment, and the initial exclamation point ! tells PAUP that you would like this comment to appear in the output.) Run this file in paup by typing the following at the linux prompt:

    paup <filename>
    
(Of course, replace <filename> with the actual name of the file you just created.) 

> :thinking: What is the minimum evolution score for the NJ tree? (scroll down from the beginning of the PAUP* output looking for the phrase "ME-score" right above the point where the comment `*** NJ score above ***` was printed)

{% comment %}
What is the minimum evolution score for the NJ tree? 1.15452
{% endcomment %}

> :thinking: What is the minimum evolution score for the tree found by heuristic search starting with the NJ tree? (Look just above the comment `*** Heuristic search score above ***`)

{% comment %}
What is the minimum evolution score for the tree found by heuristic search starting with the NJ tree? 1.17026
{% endcomment %}

> :thinking: What is wrong with this picture? Why is the minimum evolution score of the heuristic search worse than that of the starting tree? (Hint: take a look at the "Heuristic search settings" section of the output.)

{% comment %}
What is wrong with this picture? Why is the minimum evolution score of the heuristic search worse than that of the starting tree? using parsimony criterion, not distance. The tree with the better parsimony score has a worse ME score.
{% endcomment %}

Once you have figured out what is going on (ask us for help if you are stumped), fix your paup block and re-execute the file. You may need to get PAUP to help you with the criterion setting; type the following to get PAUP to spit out the current settings, then look for criterion near the top of the list:
 set ?

In your reanalysis, you should find that the heuristic search starting with the NJ tree found a better tree using the same optimality criterion (minimum evolution) being used by NJ. That is not to say that NJ does not find a good tree, and it might even find the true tree, but it usually will not find the best tree. NJ is an excellent way to obtain a starting tree for an heuristic search, however.

## What to turn in

Please copy the questions in the sections starting with the "thinking" emoji along with your answers into a plain text file (i.e., use Notepad++ on Windows or BBEdit on Mac).

{% comment %}
ME-score    1.15452
*** NJ score above ***
ME-score    1.15357
*** Heuristic search score above ***
{% endcomment %}

{% comment %}
## Using SplitsTree
We will now abandon PAUP* and explore a program called SplitsTree. You will use SplitsTree on your own computer, not the cluster. Go to the [http://splitstree.org/ SplitsTree web site] and download and install a version appropriate for your computer.

Start SplitsTree by double-clicking its icon. After it loads, use ''Open...'' from the ''File'' menu to navigate to the Examples folder and open `bees.nex`. Note the webbiness, which indicates that some characters prefer one tree, and other characters prefer a different tree. You can make the tree bigger using your scroll wheel (or the buttons at the top of the main window), and if you select a node, the program allows you to swivel the edges of the graph.

[[Image:New_Zealand_map.PNG|right|thumb|Map of NZ showing major cities. Click to enlarge]]Most phylogeny programs will not make it clear when a tree is not the best way to represent the data. SplitsTree excels at this. Open the example file `colors.nex`. The distance matrix provided in this case comprises pairwise distances between different colors, which you would not expect to be especially treelike. 

The example file `south.nex` contains the pairwise distances between cities on the south island of New Zealand (plus Wellington, which is the southernmost city on the north island). A quick look at the map of New Zealand on the right will convince you that the "tree" shown by SplitsTree is actually a fairly good map of the south island of New Zealand!

SplitsTree makes use of the NEXUS format, so you can create a distance matrix in PAUP* and then read it in to SplitsTree. SplitsTree uses several types of blocks that PAUP* does not recognize, however, including `Splits`, `st_graph` and `st_assumptions`. Some of these blocks are added to your data file when you execute it, which is why when you try to close a window SplitsTree asks you whether you want to save the modified data file.

Return to the `bees.nex` example. To show the split weights on the tree, choose ''Select Edges'' from the ''Edit'' menu, then choose ''Format Nodes and Edges...'' from the ''View'' menu. In the dialog box that appears, check the ''Weights'' checkbox beside ''Edge labels''.

The SplitsTree program allows you to save the tree in various graphics file formats, including jpg, eps, svg, gif or png. Use the ''Export Image...'' menu command from the ''File'' menu to create a file of one of these types.
{% endcomment %}

