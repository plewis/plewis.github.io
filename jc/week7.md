---
layout: page
title: Week 7 (March 4-8, 2024)
permalink: /jcweek7/
---

## Procedure for this week

Because of all the problems we had last week, let's just keep the same procedure this week with minor modification.

### 1. Login and create a working directory

Same as [last week](/jcweek6/), except create a new directory named `week7` for this week to keep everything separate.

Here is a cheat-sheet of the commands you will need:

    ssh eeb5349usr13@xanadu-submit-ext.cam.uchc.edu
    srun --partition mcbstudent --qos mcbstudent --mem=5G --pty bash
    module load gcc/10.2.0
    module load RevBayes/1.1.1
    mkdir week7
    
### 2. Create a model tree to use for simulation

Same as [last week](/jcweek6/), but repeat it in your `week7` directory so that you will have a `sg.sh` and `trees.txt` file to work with.

Commands needed:

    cd ~/week7
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/bdtree.py
    python3 bdtree.py
    . sg.sh

### 3. Run RevBayes to generate a posterior sample

One minor change to step 3. We will tell RevBayes to completely ignore the data when performing MCMC. This will be equivalent to analyzing a data set that truly does not have any information whatsoever.

To tell RevBayes to ignore the data entirely, change these 2 lines...

    mymcmc.burnin(generations=10000, tuningInterval=100, underPrior=FALSE) 
    mymcmc.run(generations=10000, underPrior=FALSE)

to this...

    mymcmc.burnin(generations=10000, tuningInterval=100, underPrior=TRUE) 
    mymcmc.run(generations=10000, underPrior=TRUE)

We must give RevBayes a data file, but setting `underPrior=TRUE` tells RevBayes to ignore the data except for the taxon names.

It also makes sense to create some variables at the top of the RevBayes script to store the output file names so that they are easy to change. I've put a complete RevBayes script on the server for you. Just download it to your `week7` directory as follows:

    cd ~/week7
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/zeroinfo.Rev
    
If you open `zeroinfo.Rev` in nano, you will see that it begins like this:

    datafname <- "simdata.nex"
    treefname <- "output/zeroinfo.trees"
    logfname  <- "output/zeroinfo.log"
    mapfname  <- "output/zeroinfo-map.tree"
    
    # Read in sequence data for both genes
    data = readDiscreteCharacterData(datafname)
    
I've created the variables `datafname` (the data file name), `treefname` (output tree file name), `logfname` (output log file), and `mapfname` (output map tree file name). I've used these in the rest of the script (see for example the `data = ` line).

Run RevBayes using this command:

    rb zeroinfo.Rev
    
This will run really fast (because it is ignoring the data) and will save all the output files to a new directory `~/week7/output`.\

I changed the following text in the instructions for [last week](/jcweek6/) because I realized that RevBayes is exploring unrooted (not rooted) trees. Here is what that text should say:

There are 105 possible unrooted tree topologies for 6 taxa, so a sample of 40000 should allow us to sample every possible tree about 380 times if everything is working correctly. That should be enough sampling to estimate the information content quite well. 

In case you are interested, the number of unrooted trees can be calculated as follows:

    taxa     unrooted trees
       3     1
       4     1*3 = 3
       5     1*3*5 = 15
       6     1*3*5*7 = 105
       7     1*3*5*7*9 = 945
       8     1*3*5*7*9*11 = 10395
       9     1*3*5*7*9*11*13 = 135135
      10     1*3*5*7*9*11*13*15 = 2027025
      11     1*3*5*7*9*11*13*15*17 = 34459425

### 4. Run Galax to estimate information content

Same as [last week](/jcweek6/), but repeat it in your `week7` directory.

Commands needed:

    cd ~/week7/output
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/rb2nxs.py
    python3 rb2nxs.py "zeroinfo_run_*.trees" test100.tre
    ~/bin/galax --treefile test100.tre --outfile test100-output
    
Note that I've specified `"zeroinfo_run_*.trees"` when running the `rb2nxs.py` script. This matches the `treefname` variable that we specified in the `zeroinfo.Rev` script.

### 5. Reduce the size of the posterior sample

Same as [last week](/jcweek6/), but repeat it in your `week7` directory.

Commands needed:

    python3 rb2nxs.py "zeroinfo_run_*.trees" test50.tre  50
    ~/bin/galax --treefile test50.tre --outfile test50-output

    python3 rb2nxs.py "zeroinfo_run_*.trees" test10.tre  10
    ~/bin/galax --treefile test10.tre --outfile test10-output

    python3 rb2nxs.py "zeroinfo_run_*.trees" test5.tre  5
    ~/bin/galax --treefile test5.tre --outfile test5-output

    python3 rb2nxs.py "zeroinfo_run_*.trees" test1.tre  1
    ~/bin/galax --treefile test1.tre --outfile test1-output

    python3 rb2nxs.py "zeroinfo_run_*.trees" test1.tre  0.05
    ~/bin/galax --treefile test05.tre --outfile test05-output

    python3 rb2nxs.py "zeroinfo_run_*.trees" test1.tre  0.01
    ~/bin/galax --treefile test01.tre --outfile test01-output

When does the estimate of information content (Ipct) start getting really bad (e.g. Ipct > 5)? Does this inflection point have anything to do with the sample size (i.e. how many trees are in the tree file provided to galax vs. the number of possible tree topologies (i.e. 105)?


