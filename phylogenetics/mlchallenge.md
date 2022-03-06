---
layout: page
title: Maximum Likelihood Challenge
permalink: /mlchallenge/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

## Goals

The goal of this lab is to challenge you to use the method of maximum likelihood along with a substitution model to learn what you can about the evolutionary process leading to an unusual (but empirical) dataset.

The data comprises two short genes, genes A and B (I'm using "gene" here to just mean a particular portion of a genome, not necessarily a complete protein-coding or RNA gene). 

Here are some things you will do/learn during this challenge:
1. Determine the best-fitting substitution model for these data as a whole
2. Obtain the ML tree under that model for the total (concatenated) data set
3. Obtain bootstrap support values under that model for the concatenated data set
4. Obtain the ML tree under that model for each gene separately
5. Test whether the concatenated ML tree is acceptable to gene A and gene B separately
6. Test whether gene A's ML tree is acceptable to gene B, and vice versa

In the last section, there are specific questions related to the above list that you will need to answer. Your job will be to figure out how to use PAUP* to answer them.

## Getting started

You will use PAUP* for all analyses today.

Login to your account on the Health Center (Xanadu) cluster, then issue

    srun --qos=mcbstudent --partition=mcbstudent --pty bash
    
to start a session on a node that is not currently running jobs. Once you see the prompt, type

    module load paup/4.0a-166
 
to load the necessary modules. (Remember: the command **module avail** shows a list of all modules.)

You will need to download the [twogenes.nex](/assets/data/twogenes.nex) data set also. Here is a curl command that can be used to download it directly to the cluster:

    curl -Ok https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/labs/twogenes.nex

## PAUP* cheat sheet

This lab will be a little different than the previous labs in that it does not contain detailed instructions. You will need to figure out how to answer the questions above using PAUP*. This section provides some hints about what commands in PAUP* to use for various things:

Remember that brief information about each command can be obtained by starting PAUP* and typing the command name followed by a space and then a question mark: e.g.

    paup> bootstrap ?

In the sections below, I've provided hints about some specific commands that will be useful. I strongly suggest that you **read through this entire section** before you begin (especially note the **sections in bold**). Refer back to individual sections of this cheat sheet section to help set up the analyses that will help you answer the questions at the end.

If it turns out you need more than my hints and PAUP* online help, there are other resources available:

* [PAUP* FAQ](https://paup.phylosolutions.com/documentation/faq/)
* [PAUP* QuickStart](http://paup.phylosolutions.com/tutorials/quick-start/)
* [PAUP* manual](http://phylosolutions.com/paup-documentation/paupmanual.pdf)

### Analysis template

For each question you are addressing, create a separate nexus file based on the template below:

    #nexus
    
    begin paup; 
      log start file=concat.log replace;
      exe twogenes.nex;
      set criterion=likelihood forcepolyt;
    end;
      
    begin paup;
      lset nst=6 basefreq=estimate rmatrix=estimate rates=gamma shape=estimate pinvar=estimate;
      alltrees;
      describe 1 / plot=phylogram;
      lscores 1;
      savetrees file=concat.tre brlens replace;

      log stop;
      quit;
    end;

The middle part (**lset** to **savetrees**) can be replaced for each analysis. **Feel free to use this file** as is for your first analysis, which will estimate the maximum likelihood tree under the GTR+I+G model and save it in the file _concat.tre_. To run this file, assuming you have saved it as _concat.nex_, simply supply the file name when starting paup:

    paup concat.nex

If you replace the **concat** in the log file name with something meaningful for each nexus file you create, you will have a record of the results for each analysis you did to address one particular question. 

You have probably noticed that there are **two separate paup blocks** in this file. Splitting the paup commands into two paup blocks is not needed for this analysis, but it will make it easier to insert a trees block between the two paup blocks, which you will need to do for some analyses. You need to have loaded data before specifying trees, and that is accomplished in the first paup block.

### Including and excluding subsets of sites

The commands **exclude** and **include** can be used to select certain subsets of sites for analysis. In particular, you can **exclude all** and then **include** one particular subset by name if that subset is defined as a charset in the data file 

### Finding the best-fitting substitution model

The **automodel** command comes in very handy for this! Once you find the best model according to the BIC criterion, **use that model for all subsequent analyses.**

### Bootstrapping

The **bootstrap** command can be used to perform bootstrapping. Be sure to specify values for **nreps** (to do more than the default number of bootstrap replicates) and **treefile** (to save the resulting bootstrap consensus tree to a file). 

### Topology testing

When asked whether a particular data subset can accept or tolerate one or more particular alternative tree topologies, create a trees block containing all tree topologies (see below) and then issue an **lset** command using the option **autest** to perform an AU topology test. The AU test will tell you which topologies are considered equally good according to the data subset(s) you have included when you issue the command.

### Finding all tree topologies

The **generatetrees** command is useful for generating all possible tree topologies, which we can do in this case because there are only 15 unrooted tree topologies for 5 taxa. This is important for the AU test, which is supposed to be supplied with all topologies that could possibly be the true tree. Can't do any better than giving AU all topologies! Note that you want to generate **all** 15 tree topologies, not a random set of trees. 

You can use the **savetrees** command to save these 15 topologies to a file (useful for figuring out which topology corresponds to, say, tree 15). You can also use **showtrees all** to show all 15 tree topologies.

{% comment %}
You can either import that saved treefile using the **gettrees** command or simply copy the trees block from the file into your nexus file (between the two paup blocks).
{% endcomment %}

## What to turn in

Slack to Zach the answers to these questions:

> :thinking: Would you say that the concatenated data exhibit a low or high amount of rate heterogeneity? Use estimates of rate heterogeneity parameters to defend your answer.

> :thinking: For the concatenated data, what substitution model parameters are most important according to BIC?

> :thinking: What is the ML tree **topology** for the concatenated data? Note: provide the newick description for just the topology (no branch lengths please)

> :thinking: Based on 1000 bootstrap replicates under the BIC-chosen model, how confident are you in the ML tree that you obtained for the concatenated data?

> :thinking: What is the ML tree **topology** for just the data for gene A? Note: just topology (no branch lengths please).

> :thinking: What is the ML tree **topology** for just the data for gene B? Note: just topology (no branch lengths please).

> :thinking: Can the data for gene A tolerate the concatenated topology? 

> :thinking: Can the data for gene B tolerate the concatenated topology? 

> :thinking: Can the data for gene A tolerate the gene B **ML** topology? 

> :thinking: Can the data for gene B tolerate the gene A **ML** topology? 

> :thinking: Based on your findings, how confident are you that one tree topology underlies both gene A and gene B? 

> :thinking: Are the results of bootstrapping the concatenated data consistent with what you've learned from the separate analyses of gene A and gene B? Briefly explain any inconsistencies you found.

