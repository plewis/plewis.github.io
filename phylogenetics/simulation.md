---
layout: page
title: Simulation Lab
permalink: /simulation/
---
## Goals

The goal of this lab is to gain experience simulating DNA sequence data, which can be useful in testing null hypotheses of interest (parametric bootstrapping) as well as testing the robustness of models to violations of their assumptions and testing the correctness of software and algorithms. The workhorse for DNA simulations in phylogenetics is Andrew Rambaut's program [seq-gen](http://tree.bio.ed.ac.uk/software/seqgen/), which still available (and still as useful as it always was!). I will also show you how to perform simulation experiments with PAUP*, which we will use to demonstrate long branch attraction.

As always, start by logging into the Xanadu cluster and grabbing a node on the cluster that is free:

    srun --qos=mcbstudent --partition=mcbstudent --pty bash

{% comment %}
## Introduction

The development of models and algorithms of any kind requires testing to see how they perform. All models and algorithms make assumptions: they take the infinite complexity of nature and distill them into few components that the maker of the model/algorithm assumes are important. With models of DNA evolution and phylogenetic inference algorithms, **one important way of testing** the capability of a model/algorithm is by simulating DNA sequence data based on a known phylogeny, and seeing how the model/algorithm performs. If the model/algorithm allows for the recovery of the known or "true" phylogeny then we can rest assured that our model/algorithm is relatively accurate in its distillation of the complexity of the processes it attempts to capture.
{% endcomment %}

## Using Seq-Gen to simulate sequence data

### Compiling seq-gen

There is no module for seq-gen on the Xanadu cluster, so you will need to download the source code and compile it yourself. In the [IQ-TREE lab](/iqtree/), you learned how to download and unpack an _executable_ file, but seq-gen is different in that what you will download is the _source code_ (written in the computing language C), which needs to be compiled into an executable file before it can be used.

First, create a directory to use for this lab and navigate into that directory:

    mkdir simlab
    cd simlab
    
Download the seq-gen source code from GitHub using the following curl command:

    curl -LO https://github.com/rambaut/Seq-Gen/archive/refs/tags/1.3.4.tar.gz
    
Unpack the downloaded "tape archive" file _1.3.4.tar.gz_ as follows:

    tar zxvf 1.3.4.tar.gz
    
You should now have a directory named Seq-Gen-1.3.4 inside your _simlab_ directory. Navigate into the _source_ subdirectory of the new _Seq-Gen-1.3.4_ directory:

    cd Seq-Gen-1.3.4/source
    
There is a file inside this directory named _Makefile_ that contains instructions for building seq-gen from the C source files (which are the files with names that end in either <tt>.c</tt> or <tt>.h</tt>). All you need to do now is type make to process these instructions:

    make

The C compiler will "compile" (note the <tt>-c</tt> on the command line) all the files ending in <tt>.c</tt> (including, as necessary, the files ending in <tt>.h</tt>), producing files with the same prefix but ending in <tt>.o</tt>. You can ignore the warning that is issued along the way (errors are harder to ignore, but fortunately there should be no errors). These "object" files are then linked together (note the <tt>-o</tt> rather than <tt>-c</tt> this time) in the final step to create the executable file, which is named _seq-gen_. Move the executable file back to the _simlab_ directory so that it is easier to use for this lab:

    mv seq-gen ~/simlab
    cd ~/simlab
    
### Viewing the seq-gen documentation

The documentation is in the form of an HTML file, _Seq-Gen.Manual.html_, which is located in the _Seq-Gen-1.3.4/documentation_ directory. It is not that convenient to view web pages on the cluster, so you may wish to download the [zip file version](https://github.com/rambaut/Seq-Gen/archive/refs/tags/1.3.4.zip) to your local laptop in order to get the file _Seq-Gen.Manual.html_ where you can open it in a web browser.

That said, you _can_ read this file while on the cluster using the `lynx` command:

    cd Seq-Gen-1.3.4/documentation
    lynx Seq-Gen.Manual.html
    
Type Q to quit when you've seen enough.

### Using seq-gen

Return to the _simlab_ directory now, where your _seq-gen_ executable is located. 

Using nano, create a file named _tree.txt_ that contains the following single line:

    (A:1.0,B:1.0,((C:1.0,D:1.0):1.0,(E:1.0,F:1.0):1.0):1.0)
    
Now, create a file named _sg.sh_ containing the following:

    $HOME/simlab/seq-gen -mHKY -l10000 -n1 -p1 -t2.0 -on < tree.txt > simdata.nex

    # -mHKY                       use the HKY substitution model
    #                             (HKY, F84, GTR, JTT, WAG, PAM, BLOSUM, MTREV, CPREV or GENERAL)
    # -l10000                     sequence length (number of sites to simulate)
    # -n1                         number of data sets to simulate from this gene tree
    # -p1                         number of data partitions
    # -f 0.25 0.25 0.25 0.25      nucleotide frequencies
    # -t2.0                       transition/transversion ratio (not the rate ratio!)
    # -r 1.0 4.0 1.0 1.0 4.0 1.0  GTR exchangeabilities)
    # -a0.5                       shape parameter of gamma among-site rate heterogeneity
    # -i0.5                       proportion of invariable sites
    # -z123579                    random number seed
    # -on                         output format (on=nexus, op=phylip, or=relaxed phylip)
    # -s1.0                       branch length scaling factor (1.0 says to not scale branch lengths at all)
    #
    # tree.txt
    #
    # (A:1.0,B:1.0,((C:1.0,D:1.0):1.0,(E:1.0,F:1.0):1.0):1.0)
    
Most of the contents of this file are comments (lines starting with <tt>#</tt>). I included those as a sort of cheat-sheet for using seq-gen to save having to look some things up in the manual.

You will need to execute the command at the top of this file, and the easiest way to run Linux commands that are stored in a file is to "source" the file:

    . sg.sh
    
The initial dot tells the bash interpreter to simply issue the commands found in the following "shell script" file as if you typed them into the console. You could skip the creation of _sg.sh_ in the first place by simply issuing the command on the command line, like this:

    $HOME/simlab/seq-gen -mHKY -l10000 -n1 -p1 -t2.0 -a0.5 -on < tree.txt > simdata.nex
    
I showed you how to store the command in a file because that provides a record of what you did and allows you to easily modify the command and run it again.

> :thinking: Take a look at the file seq-gen generated. Can you explain why nearly every site show evidence of substitution? (hint1: look at the branch lengths specified in the true tree)

{% comment %}
all 9 branch lengths are 1, which means that, on average, there will be 9 substitutions at every site over the entire tree, so it is not surprising that there are no constant sites.
{% endcomment %}

Modify your _sg.sh_ specifying a branch length scaling factor of 0.0001 and rerun it.

> :thinking: Take a look at the file seq-gen generated. How many sites would you expect to look at before seeing one that shows evidence of substitution? (hint: I'm not asking you to count constant sites! You can answer this using the true tree branch lengths and scaling factor)

{% comment %}
Now all 9 branch lengths are 0.0001, so we expect only 0.0009 substitutions per site over the tree, which translates to 1 substitution every 1111 sites.
{% endcomment %}

## Using PAUP* to perform simulation experiments

We will be using cutting-edge features in PAUP* -- so cutting edge that you will not be able to find any information about these features anywhere online or by using the <tt>help</tt> command in PAUP*! So don't get confused when you try to look up some of the components of the NEXUS file you will be using.  

### Simulation Template

Create an empty text file named _paupsim.nex_:

    #nexus

    begin trees;
        tree 1 = ((A:0.1,B:0.1):0.1,(C:0.1,D:0.1));
    end;

    begin dnasim;
        simdata nchar=10000;
        lset nst=1 basefreq=equal rates=equal pinvar=0;
        truetree source=memory treenum=1 showtruetree=brlens;
        beginsim nreps=100 seed=12345 monitor=no resultsfile=(name=results.txt replace output=allreps);
            [parsimony]
                set criterion=parsimony;
                alltrees;
                tally parsimony;
            [likelihood]
                set criterion=likelihood;
                alltrees;
                tally 'ML-JC';
        endsim; 
    end;

    begin paup;
        set nowarntsave;
        quit;
    end;
The <tt>trees</tt> block contains the description of the true tree that we will use to simulate data. By default, trees are considered unrooted, but the obscure <tt>[&R]</tt> says that this tree is rooted.

The <tt>beginsim...endsim</tt> loop in the <tt>dnasim</tt> block tells PAUP* to simulate 100 nucleotide data sets (<tt>nreps=100</tt>). 

> :thinking: What substitution model will PAUP* use? (hint: the <tt>lset</tt> command specifies the model.)

{% comment %}
JC (no rate heterogeneity)
{% endcomment %}

For each of the 100 data sets simulated, two analyses will be performed: (1) an exhaustive search using parsimony and (2) and exhaustive search using maximum likelihood. I've added the <tt>[parsimony]</tt> and <tt>[likelihood]</tt> comments along with indentation to show you where these two searches are defined. 

The <tt>tally</tt> commands keep track of how many times parsimony and ML infer a tree identical to the true tree used for simulation, and the tallied information is stored in the file <tt>results.txt</tt>. The name supplied after the tally command will end up being the column name in the file. Note that I had to surround the <tt>ML-JC</tt> with single quotes because of the embedded hyphen. (The quotes would also be necessary if you wanted a space inside the column name.)

For both parsimony and ML, tally calculates the following quantities (where NAME is either "parsimony" or "ML-JC"):
* NAME_Ntrees, the number of trees tied for being best (ideally 1)
* NAME_P, the fraction of splits in the true tree that were found in the inferred tree (averaged over number of trees inferred)
* NAME_correct, same as NAME_P if no incorrect splits are found in the inferred tree, otherwise 0 (averaged over number of trees inferred)

The final paup block sets nowarntsave, which means PAUP will not warn you if you quit without saving stored trees, then quits.

### Execute the NEXUS File

Log on to the cluster, start a session using

    srun --partition=mcbstudent --qos=mcbstudent --pty bash
    
then load the current module of PAUP*

    module load paup/4.0a-166
    
Start PAUP*, and execute your NEXUS file: 

    paup paupsim.nex

Note that PAUP* quits after performing the simulations (because we told it to quit in that final paup block). You can also view the _results.txt_ file directly in your terminal by typing 

    column -t results.txt
    
The <tt>-t</tt> makes the columns align. 

> :thinking: Did both optimality criteria get the tree correct most of the time?

{% comment %}
Yes, both got it right 100 percent of the time
{% endcomment %}

### Enter the Felsenstein Zone

As you've learned in lecture, parsimony is particularly prone to long branch attraction while maximum likelihood is able to resist joining long edges if the model is correct in the important details. Copy your NEXUS file to create a file named _paupsimFZ.nex_. Edit the new file and change two edge lengths to 1.0 in order to create a true tree that falls in the Felsenstein zone. Also change the name of the results.txt file to _resultsFZ.txt_ so that you will not overwrite your previous results.

Execute _paupsimFZ.nex_, then `cat` the new _resultsFZ.txt_ file and consider the results of your simulations.

> :thinking: Which optimality criterion performed best at recovering the true tree?

{% comment %}
ML-JC
{% endcomment %}

Change the <tt>simdata nchar=10000;</tt> line to <tt>simdata nchar=(10 100 1000 10000);</tt> and change <tt>output=allreps</tt> to <tt>output=meansonly</tt>. Now PAUP* will simulate data sets of four different sequence lengths and summarize the results rather than spitting out a line for every simulation replicate.

> :thinking: Which (parsimony or ML) appears to be statistically consistent? Why?

{% comment %}
ML because it has convergence as an explanation for similarity whereas parsimony can only explain similarity by inhertitance
{% endcomment %}

Add substantial rate heterogeneity (e.g. gamma shape = 0.01) to the simulated data and analyze the data under both parsimony and ML (using a model that assumes rate homogeneity). 

> :thinking: How did you modify your paupsimFZ.nex file in order to accomplish this?

{% comment %}
changed "rates=equal" to "rates=gamma shape=0.01" in the "lset" command
added "lset rates=equal" after "set criterion=likelihood" in the likelihood section of the beginsim...endsim section
{% endcomment %}

> :thinking: Is ML statistically consistent when the model is violated in this way? Why? (hint: think about which data are hard to model accurately with high heterogeneity) 

{% comment %}
no, assuming rate homogeneity results in underestimation of edge lengths, which in turn makes it easier for ML to misinterpret convergent similarity as similarity due to inheritance from the common ancestor.
{% endcomment %}

## Saving Simulated Data

Can you figure out how to change your NEXUS file so that PAUP* simulates one data set and exports it to a file? Start PAUP* and use 

    export ?
    
to figure out how to use the export command to save the simulated data to a file. You will want to delete both the parsimony and ML analysis code between the beginsim and endsim lines and replace it with your export command. You should also add a <tt>cstatus</tt> command to help answer the questions about proportion of constant sites.

You will also probably want to make these other changes to your file:
* specify only 1 sequence length (e.g. <tt>nchar=1000</tt>)
* specify only 1 simulation replicate (i.e. <tt>nreps=1</tt>)
* specify that you want to see output (i.e. <tt>monitor=yes</tt>) 

> :thinking: Make all branches in the true tree long (e.g. 10). What is the proportion of constant sites? 

{% comment %}
proportion of constant = 0.01
{% endcomment %}

> :thinking: How many substitutions are simulated, on average, per site over the entire tree?

{% comment %}
expected number of substitutions per site over entire tree is 50
{% endcomment %}

> :thinking: Make all branches in the true tree short (e.g. 0.001). What is the proportion of constant sites? 

{% comment %}
proportion of constant = 0.997
{% endcomment %}

> :thinking: How many substitutions are simulated, on average, per site over the entire tree?

{% comment %}
expected number of substitutions per site over entire tree is 0.005
{% endcomment %}

> :thinking: Make all branches in the true tree 10 but add significant rate heterogeneity (gamma shape 0.01). What about the proportion of constant sites now? 

{% comment %}
proportion of constant = 0.917
{% endcomment %}

> :thinking: How many substitutions are simulated, on average, per site over the entire tree? 

{% comment %}
expected number of substitutions per site over entire tree is 50
{% endcomment %}

> :thinking: To which of the previous 2 simulated data sets is this data set most similar in terms of the proportion of constant sites? 

{% comment %}
It is most similar to the tree having very short branches 0.001
{% endcomment %}

Start PAUP* (without specifying a data file) and use the <tt>gammaplot shape=0.01</tt> command to examine the rate means for the four categories of rates. 

> :thinking: What fraction of sites are essentially invariable?

{% comment %}
75 percent of sites (3 of the 4 categories) are expected to have rate essentially 0.0 when shape = 0.01.
{% endcomment %}

##  Strimmer and Rambaut (2002) Study

Download this paper, which I'll refer to as SR from now on:

> [Strimmer K., and Rambaut A. 2002. Inferring confidence sets of possibly misspecified gene trees. Proc. Biol. Sci. 269:137–142.](https://doi.org/10.1098/rspb.2001.1862)

{% include figure.html description="SR Fig. 1" url="/assets/img/SR1.png" css="image-right noborder" width="400px" %}

SR simulated data on the tree shown in Figure 1 of their paper and expected the SH (Shimodaira and Hasegawa, 1999) test to reveal that all three possible resolutions of the polytomy were equally supported by the data. Makes sense, doesn't it? What they found instead was that (unless they simulated 4000 sites or more) all 15 (rooted) trees for the four taxa A, B, C, and D were considered equal by the SH test. They concluded that the SH test has a bias making it overly conservative and this bias dissipates as sequence lengths increase. This result motivated Shimodaira to create the AU (Approximately Unbiased) test (Shimodaira, 2002).

Can you recreate SR's results for 500 and 5000 sites (see their Table 3)? 

To do this, start with the original _paupsim.nex_ file shown above in the "Simulation template" section. You will need to make your true tree equal the tree SR show in their Figure 1, and you need to make the simulation model equal to the one they used (see the bottom right part of SR p. 140). You can delete all the commands and comments inside the <tt>beginsim...endsim</tt> loop, replacing these with

    set maxtrees=105;
    generatetrees all model=equiprobable;
    lscores all / shtest autest RELL bootreps=1000;
    
which generates all 105 possible trees and tests them all using the SH test. To see the output, you'll need to say <tt>monitor=yes</tt> in your <tt>beginsim</tt> command, and you can delete the <tt>resultsfile</tt> statement.

(Note: look at the column labeled <tt>SH</tt>, not the column labeled <tt>wtd-SH</tt>.)

> :thinking: How many of the 105 trees were not significant using the SH test for 500 sites? 5000 sites?

{% comment %} There were only two trees non-significant trees using the SH test for 5000 sites, while there were 14 non-significant trees using the SH test for 500 sites.
{% endcomment %}

> :thinking: Does the AU test produce a different result?

{% comment %} The AU test has only two trees non-significant trees for both 500 and 5000 sites. 
{% endcomment %}

## Literature Cited

H Shimodaira and M Hasegawa. 1999. Multiple comparisons of log-likelihoods with applications to phylogenetic inference. Molelcular Biology and Evolution 16:1114–1116.

H Shimodaira. 2002. An Approximately Unbiased Test of Phylogenetic Tree Selection. Systematic Biology 51:492–508.

## Acknowledgements

Kevin Keegan contributed to a previous version of this lab exercise
