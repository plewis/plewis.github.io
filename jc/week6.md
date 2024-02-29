---
layout: page
title: Week 6
permalink: /jcweek6/
---

## Background

By now you've learned enough that we can start answering the central question that is at the heart of this project!

The central question is "How well can we measure information content when there is very little (or no) information in the data". 

Remember that information is measured as the difference in entropy between the prior and posterior distributions. Entropy is a measure of how spread out the probability is among the possible tree topologies. Typically, we assume that, a priori, we know nothing about the tree topology, so we give each possible tree topology equal prior probability. The posterior distribution tells us how plausible each tree topology is after the data are considered. If there is no information in the data, the posterior will equal the prior, which means we've learned nothing about the tree topology (even though we might have a lot of data): that is, the posterior probability will also be the same for every possible tree topology.

If the data are very informative, then the posterior probability will all be concentrated in one tree topology. For the simplest example, here are the three possible rooted tree topologies for 3 taxa (A, B, C):

     A  B   C    A   C   B     B   C   A  
     \  /   /     \  /   /      \  /   /  
      \/   /       \/   /        \/   /   
       \  /         \  /          \  /    
        \/           \/            \/     

      0.333         0.333        0.333    <-- prior     (entropy = 1.09861229)
      0.000         1.000        0.000    <-- posterior (entropy = 0.0)
      
The fact that the posterior probability is 1 for the ((A,C),B) tree means that there is a enough information about the tree topology in the data that it is completely certain which tree is the true tree given the data we've collected (and assuming the model is correct).

The entropy for the prior is `log(3) = 1.09861229` whereas the entropy for the posterior is `0.0`. The percentage information content is equal to 100 times the difference in entropy divided by the prior entropy, or `100*1.09861229/1.09861229 = 100`.

What if there were no information in the data? Here's how things would look in this case:

     A  B   C    A   C   B     B   C   A  
     \  /   /     \  /   /      \  /   /  
      \/   /       \/   /        \/   /   
       \  /         \  /          \  /    
        \/           \/            \/     

      0.333         0.333        0.333    <-- prior     (entropy = 1.09861229)
      0.333         0.333        0.333    <-- posterior (entropy = 1.09861229)

If there is no information, the difference in entropy between prior and posterior is zero, which translates to 0% information.

Now, what if we look at a big problem and there is no information. The above problems had just 3 taxa, but For 15 taxa there are some 213,458,046,676,875 possible tree topologies! If we sample 1 million trees, and every tree has a different topology, what will the prior entropy and posterior entropy look like?

    prior entropy     = log(213458046676875) = 32.99446
    posterior entropy = log(1000000)         = 13.81551
    difference                               = 19.17895
    information = 100*19.17895/32.99446      = 58.12779
    
In other words, we don't have the time it would take to sample enough trees to sample every possible tree topology even once, so it looks like our posterior is concentrated over a small fraction of trees and we have a lot of information, when in fact we have zero information!

The goal is to see if we can remedy this by changing the denominator. That is, what if we used the posterior sample size (1 million) to compute the denomiator rather than the total number of possible trees?

    information = 100*19.17895/19.17895 = 0.0

Now we get zero percent information, which is what we should get. Basically, we are saying there is no information in the data if every sampled tree topology is distinct from all others that we've sampled.

This week, you will use the program [Galax](/software#galax) to estimate information content in simulated data sets, as you did last week. The difference is that we will estimate information content from the full posterior sample (which will be large enough to get a good estimate) and several smaller samples (you will just copy the tree file and delete some percentage of the trees therein). As the sample size gets smaller, we expect our measure of information content to increase (artifactually). Can we still get close to the right answer, however, if we use the modified information content measure above?

## Procedure for this week

### 1. Login and create a working directory

To begin, login to the Xanadu cluster...

    ssh eeb5349usr13@xanadu-submit-ext.cam.uchc.edu
    
request a free node to work on...

    srun --partition mcbstudent --qos mcbstudent --pty bash
    
load the `gcc/10.2.0` module (galax will need this to run)...

    module load gcc/10.2.0
    
and, finally, create a directory named `week6` and navigate into it...

    mkdir week6
    cd week6
    
### 2. Create a model tree to use for simulation

Download the progam `bdtree.py` using curl as follows:

    curl -LO https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/bdtree.py

This program will generate a random rooted phylogenetic tree with 6 taxa:

    python3 bdtree.py
    
It will create a tree file named `trees.txt` and a script named `sg.sh` that you use to run the seq-gen program. 

Edit `sg.sh` in nano and change the scaler specified on the `seq-gen` command line from 1.0 to 0.0001 so that the simulated data has low information content. You may also need to modify the first part of the line if `seq-gen` program is not located in your `bin` directory. For example, if `seq-gen` is in `~/week6`, you could specify

    $HOME/week6/seq-gen...
    
at the start of the line. (`$HOME` just stands for your home directory.)

To simulate data, just run the `sg.sh` script like this:

    . sg.sh
    
(The initial dot is important; it tells the command interpreter to just read in the contents of `sg.sh` and run the commands therein just as if you typed them into the console by hand.)

That should result in a data file named `simdata.nex` that you can read into RevBayes.

### 3. Run RevBayes to generate a posterior sample

Look back at [the week 3 instructions](/jcweek3/#revbayes-lab) to remind yourself how to run RevBayes. You will need to substitute `simdata.nex` into the RevBayes script before running so that you analyze the data set you just simulated.

This line in your RevBayes script

    mymcmc.run(generations=10000, underPrior=FALSE)
    
tells RevBayes to run for 10000 generations, and this line (a little bit before the `mymcmc.run` line) 

    monitors.append( mnFile(psi, filename="output/slow.trees", printgen=1) )
    
tells RevBayes to save a tree to the file `slow.trees` every generation (`printgen=1`). This means you will end up with a file containing 10000 trees. Because you specified `nruns=4`, RevBayes will actually carry out 4 independent runs, each one generating 10000 trees, so 40000 trees total.

There are 945 possible rooted tree topologies for 6 taxa, so a sample of 40000 should allow us to sample every possible tree about 40000/945 = 42.3 times if everything is working correctly. That should be enough sampling to estimate the information content quite well. 

In case you are interested, the number of rooted trees can be calculated as follows:

    taxa     rooted trees
       2     1
       3     1*3 = 3
       4     1*3*5 = 15
       5     1*3*5*7 = 105
       6     1*3*5*7*9 = 945
       7     1*3*5*7*9*11 = 10395
       8     1*3*5*7*9*11*13 = 135135
       9     1*3*5*7*9*11*13*15 = 2027025
      10     1*3*5*7*9*11*13*15*17 = 34459425

### 4. Run Galax to estimate information content

Now use the skills you learned last week to estimate the information content for the sampled trees generated by RevBayes. 

Please download and use the (new, improved!) program `rb2nxs.py` to convert RevBayes tree files to a nexus-formatted tree file that Galax can read:

    curl -LO https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/rb2nxs.py
    
You can run `rb2nxs.py` like this:

    python3 rb2nxs.py "test_run_*.trees" test.tre
    
The `"test_run_*.trees"` matches the 4 original files produced by RevBayes: `test_run_1.trees`, `test_run_2.trees`, `test_run_3.trees`, and `test_run_4.trees`.

The file `test.tre` is the nexus-formatted file suitable for Galax. Because the new, improved `rb2nex.py` program has combined all 4 original files, you can use this command to invoke Galax (no need to make a "list" file any more nor is there any need to specify `--skip 1`):

    ~/bin/galax --treefile test.tre --outfile test-output
    
If I've blocked you from using the copy of `galax` in `bin`, you can download it to your `week6` directory as follows:

    cd ~/week6
    curl -LO https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/galax
    chmod +x galax
    
(Note: the `chmod +x galax` line was added after you emailed me to alert me to the permissions problem.)
    
If it is in your `week6` directory, you should invoke it this way:

    cd ~/week6
    ./galax  --treefile test.tre --outfile test-output

### 5. Reduce the size of the posterior sample

The improvement made to `rb2nxs.py` is that now you can also run it like this:

    python3 rb2nxs.py "test_run_*.trees" test50.tre  50

The third argument 50 says "save only 50% of the trees in the 4 combined treefiles to `test50.tre`." (If the third argument is omitted, all trees will be saved.)

Try creating several files like this:

    python3 rb2nxs.py "test_run_*.trees" test100.tre
    python3 rb2nxs.py "test_run_*.trees" test50.tre  50
    python3 rb2nxs.py "test_run_*.trees" test10.tre  10
    python3 rb2nxs.py "test_run_*.trees" test5.tre  5
    python3 rb2nxs.py "test_run_*.trees" test1.tre  1

and analyzing each with Galax. Does the estimated information content (see the "merged" line in the galax output) start to increase as the sample size decreases? 1% of 40000 is 400, which is not enough to sample every one of the 945 possible tree topologies even once, so information content should be affected by the time you reduced down to 1% of the original sample size.

 