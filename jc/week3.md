---
layout: page
title: Week 3
permalink: /jcweek3/
---

## Goals

The goal this week is to learn how to use RevBayes to perform a Bayesian analysis of a data set. Last week you generated data sets with varying amounts of information and analyzed them with PAUP*, which finds the maximum likelihood (ML) tree. This ML tree is the best estimate, but this kind of analysis doesn't tell you how much confidence you should have in any of the groupings in the tree. RevBayes, on the other hand, will generate a posterior sample consisting of several thousand trees. Summarizing how many of those sampled trees have a particular group tells us something about how confident we can be in that grouping. You should find that data sets with low information (seq-gen scaling factor too high or too low) lead to more uncertainty about groups, whereas a scaling factor of, say, 0.01 should result in most trees in the posterior sample being the same topology as the true tree that we used to simulate the data.

## Simulate 4 data sets using Seq-Gen

Using seq-gen, generate 4 data sets with scaling factors 0.00001, 0.01, and 1.0. If you copy the following into your `sg.sh` file, you can generate all 4 data sets at once:

    $HOME/simlab/seq-gen -mHKY -l10000 -n1 -p1 -t0.5 -on -s0.00001 < tree.txt > slow.nex
    $HOME/simlab/seq-gen -mHKY -l10000 -n1 -p1 -t0.5 -on -s0.01 < tree.txt > medium.nex
    $HOME/simlab/seq-gen -mHKY -l10000 -n1 -p1 -t0.5 -on -s1.0 < tree.txt > fast.nex
    $HOME/simlab/seq-gen -mHKY -l500 -n1 -p1 -t0.5 -on -s1.0 < tree.txt > fast500.nex
    
You will need to run the file using the command 

    . sg.sh
    
The dot says to just issue the commands in the file as if they were typed directly into the console.

You should find 4 files after running `sg.sh`: `slow.nex`, `medium.nex`, `fast.nex`, and `fast500.nex`.

## Create 4 directories

It makes sense to create 4 different directories to keep everything tidy.

    cd
    mkdir week3
    cd week3
    mkdir fast
    mkdir fast500
    mkdir medium
    mkdir slow
    
The first `cd` command above is there to ensure that you start out in your home directory. If you issue the "change directory" command without giving a directory to change to, it just takes you to your home directory.

You should now have this structure (directories are indicated by a trailing slash):

    simlab/
        seq-gen
        sg.sh
        fast.nex
        fast500.nex
        medium.nex
        slow.nex
    week3/
        fast/
        fast500/
        medium/
        slow/
        
You can use the command `tree` to show you the structure of the current directory. It will show you everything, whereas my summary only shows the files and directories important to us for this exercise, but `tree` is a useful command to know about.

Move the simulated data files into the directories we created for them:

    cd
    mv simlab/fast.nex week3/fast
    mv simlab/fast500.nex week3/fast500
    mv simlab/medium.nex week3/medium
    mv simlab/slow.nex week3/slow
    
The `mv` command is used to "move" a file. Now the structure of your file system should look like this:

    simlab/
        seq-gen
        sg.sh
    week3/
        fast/
            fast.nex
        fast500/
            fast500.nex
        medium/
            medium.nex
        slow/
            slow.nex

Now navigate into the `medium` directory before continuing:

    cd ~/week3/medium
    
The `~/` stands for "home directory" and is another way to ensure that you are starting in the right place. The above command says to navigate to the directory `medium`, which is inside the directory `week3`, which is itself inside your home directory.

## RevBayes lab

Work through the first part of the [RevBayes lab](/revbayes/). Stop when you get to the end of the section entitled "Calculating the MAP (Maximum A-Posteriori) tree." 

Some things to keep in mind when doing this part:

* Take note of the `srun` command in the "Getting started" section: it is important to add the `--mem=5G`, otherwise, RevBayes will hang and never finish because it has run out of memory
* Note that the analyses might take a few minutes; it will be much slower than the PAUP* runs you did last week, expecially for the `fast.nex` data set
* The tutorial uses a file named `algaemd.nex`, but you will be using `medium.nex` instead. So, where `algaeme.nex` appears, substitute `medium.nex`
* The tutorial specifies several other files, such as `algae.log`, `algae.tree`, etc. You should replace `algae` in these file names with `medium` to reflect the data set you are analyzing
* At one point the tutorial specifies the datatype as "RNA", but you should change this to "DNA" because the data you simulated were DNA sequences
* The tutorial suggests making the outgroup `Anacystis_nidulans`, but the taxa in your `medium.nex` data file are named `A`, `B`, `C`, `D`, `E`, and `F`, so use one of those instead (it doesn't really matter which)

When you get the map tree file generated, use Cyberduck to download it to your laptop and open that file in FigTree. Check the box beside "Branch Labels", then expand that section of options and choose "posterior" for "Display". Save the tree as a PNG file using File > Export PNG... The numbers on the branches are posterior probabilities: these represent the probability that that branch exists in the true tree given the data you have and the model you used. We use the same model to generate the data as we used to analyze it. so the model assumption is pretty safe in this case! You should find that, for the `medium.nex` data, the posterior probabilities are all very high (with 1.0 being the highest possible value and 0.0 being the lowest).

Now repeat the analysis with the `slow.nex`, `fast.nex`, and `fast500.nex` data sets. You can save time by copying the RevBayes file you created for `medium.nex` into the other directories...

    cp ~/week3/medium/medium.Rev ~/week3/fast/fast.Rev
    cp ~/week3/medium/medium.Rev ~/week3/fast500/fast500.Rev
    cp ~/week3/medium/medium.Rev ~/week3/slow/slow.Rev
    
...and editing with nano, changing the word `medium` everywhere it occurs to the appropriate word (either `fast`, `fast500`, or `slow`).

Compare the PNG files for the fast, fast500 and slow datasets with the one for medium. You should find that the posterior probabiities are not as large because there is less information about the phylogeny in the data set (because the substitution rate was either very high or very low).

In case you are wondering, the fast500 data set has only 500 sites compared to the 10000 sites of the fast data set. Reducing the number of sites is another way to reduce information content. You should find that the fast500 data set has lower posteriors than the fast data set, even though they were simulated with the same substitution rate.

Let us know if you get stuck or confused. It is also Ok to just wait until our next meeting if you get stuck and we can figure out the problem together.

As mentioned in our last meeting, don't feel like you need to understand the RevBayes script. Let's get some results and only then worry about what RevBayes was doing to get there.

