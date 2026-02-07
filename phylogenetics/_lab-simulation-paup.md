---
layout: page
title: Simulation Lab
permalink: /simulation/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

## Goals

The goal of this lab is to gain experience simulating DNA sequence data, which can be useful in testing null hypotheses of interest (parametric bootstrapping) as well as testing the robustness of models to violations of their assumptions and testing the correctness of software and algorithms. The workhorse for DNA simulations in phylogenetics is Andrew Rambaut's program [seq-gen](http://tree.bio.ed.ac.uk/software/seqgen/), which still available (and still as useful as it always was!)
{% comment %}
, but today we will use PAUP* to perform a simulation experiment to demonstrate the phenomenon known as long branch attraction.
{% endcomment %}

## Getting started

Login to your account on the Storrs HPC cluster and start an interactive slurm session:

    ssh hpc
    gensrun
        
If `gensrun` fails, you can create the `gensrun` alias by opening the _.bashrc_ file in your home directory:

    nano ~/.bashrc
    
and typing the following (you can make it the first line of the file):

    alias gensrun='srun -p general -q general --pty bash'
    
Save the _.bashrc_ file and enter the following command (from within your home directory) to load the _.bashrc_ file (and thus load the `gensrun` alias):

    . .bashrc

The initial `.` means "read the following file". There should be a space between the initial `.` and `.bashrc`.

## Create a directory for this exercise

First, create a directory to use for this lab and navigate into that directory:

    mkdir simlab
    cd simlab
    
## Template

Here is a template with the questions asked below. Copy this into a text file and turn
it in with your answers after the lab.

    What substitution model will PAUP* use?
    answer:
    
    Did both optimality criteria get the tree correct most of the time?
    answer: 
    
    Which optimality criterion performed best at recovering the true tree?
    answer: 

    Which (parsimony or ML) appears to be statistically consistent? Why?
    answer: 

    How did you modify your paupsimFZ.nex file in order to accomplish this?
    answer: 

    Is ML statistically consistent when the model is violated in this way? Why? 
    answer: 

    Make all branches in the true tree long (e.g. 10). 
    What is the proportion of constant sites? 
    answer: 

    How many substitutions are simulated, on average, per 
    site over the entire tree?
    answer: 

    Make all branches in the true tree short (e.g. 0.001). 
    What is the proportion of constant sites? 
    answer: 

    How many substitutions are simulated, on average, per 
    site over the entire tree?
    answer: 

    Make all branches in the true tree 10 but add significant 
    rate heterogeneity (gamma shape 0.01). What about the
    proportion of constant sites now? 
    answer: 

    How many substitutions are simulated, on average, per site 
    over the entire tree? 
    answer: 

    To which of the previous 2 simulated data sets is this data 
    set most similar in terms of the proportion of constant sites? 
    answer: 

    What fraction of sites are essentially invariable?
    answer: 

## Using PAUP* to perform simulation experiments

We will be using cutting-edge features in PAUP* -- so cutting edge that you will not be able to find any information about these features anywhere online or by using the <tt>help</tt> command in PAUP*! So don't get confused when you try to look up some of the components of the NEXUS file you will be using.  

### Simulation Template

Create an empty text file named _paupsim.nex_:

    #nexus

    begin trees;
        tree 1 = ((A:0.1,B:0.1):0.1,(C:0.1,D:0.1):0);
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
    
The <tt>trees</tt> block contains the description of the true tree that we will use to simulate data. By default, trees are considered unrooted.

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

Change the <tt>simdata nchar=10000;</tt> line to <tt>simdata nchar=(100 1000 10000);</tt> and change <tt>output=allreps</tt> to <tt>output=meansonly</tt>. Now PAUP* will simulate data sets of 3 different sequence lengths and summarize the results rather than spitting out a line for every simulation replicate.

> :thinking: Which (parsimony or ML) appears to be statistically consistent? Why?

{% comment %}
ML because it has convergence as an explanation for similarity whereas parsimony can only explain similarity by inhertitance
{% endcomment %}

Add substantial rate **HETERO**geneity (e.g. gamma shape = 0.01) to the simulated data and analyze the data under both parsimony and ML (using a model that assumes rate **HOMO**geneity). 

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

Can you figure out how to change your orignal paupsim.nex file (with no rate heterogenity) so that PAUP* simulates one data set and exports it to a file? Start PAUP* and use 

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

## Acknowledgements

Kevin Keegan contributed to a previous version of this lab exercise
