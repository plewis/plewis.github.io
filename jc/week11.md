---
layout: page
title: Week 11 (April 8-12, 2024)
permalink: /jcweek11/
---

This week let's try two new things:
* measure phylogenetic dissonance among replicate runs in addition to information content
* simulate data sets that have information, but not very much of it

Also, it might be a good idea for you to take a look at the original paper we wrote on this topic: you should be able to download a PDF version from here if you are on-campus: [https://doi.org/10.1093/sysbio/syw042](https://doi.org/10.1093/sysbio/syw042)

**Dissonance** refers to conflicting information. If one gene locus prefers one tree strongly and another locus prefers a different tree strongly, then (as we show in Figure 5 and Table 5 in the paper) an analysis that combines data from both loci may strongly prefer a tree that neither locus is happy with. 

I'm interested in how much dissonance there is between different independent runs of RevBayes. If the number of taxa is small (e.g. 10) so that we can produce a sample that is much larger than the number of possible tree topologies, we expect estimated dissonance to be close to zero because each run should produce the same posterior distribution of tree topologies.

However, if there is zero information (i.e. you tell RevBayes to ignore the data), then one run might produce 10000 sampled trees that are completely different than the 10000 sampled from a second run. This is due solely to the fact that we cannot run RevBayes long enough to visit each possible tree topology often enough to estimate the posterior distribution accurately. Thus, I expect dissonance to be pretty high when information is low and the sample size is much smaller than the number of possible trees.

Just to put this into perspective, the number of distinct unrooted tree topologies for 20 taxa is 221,643,077,000,000,000,000! Even if RevBayes could sample 1 million trees per second, it would take some 7 million years to visit each tree topology only once!

Some questions we can answer with the simulations you do this week are:

* For data sets that have some small amount of information, does dissonance drop to low levels between independent runs? 

* How much information is needed before dissonance drops to a certain level

### 1. As usual, login and create a working directory

As usual, login to the Xanadu cluster...

    ssh eeb5349usr13@xanadu-submit-ext.cam.uchc.edu
    
Create a `week11` directory:

    mkdir week11
    cd week11
    
### 2. Create files

Create a new _clean.sh_ in your new _week11_ directory. Let's use a quick method for creating small files. If you type `cat - > clean.sh`, making sure to leave a space between each component as shown, then the `cat` command will expect you to type in what you want to be stored in the new file names _clean.sh_. Paste in the following text and then press Control-d to tell `cat` that you are finished.

    #!/bin/bash
    
    cd .
    rm -rf *.out
    rm -rf *.err
    rm -rf simrep-*

You should now have a file named _clean.sh_ in your _week11_ directory. All you need do now is make it executable:

    chmod +x clean.sh
    
Copy the _test.slurm_ file you used last week:

    cp ../week10/test.slurm zeroinfo.slurm
    
Now edit _zeroinfo.slurm_ using nano and replace its contents with this:

    #!/bin/bash
    
    #SBATCH --job-name=zeroinfo
    #SBATCH -n 1
    #SBATCH -N 1
    #SBATCH -c 1
    #SBATCH --mem=5G
    #SBATCH --partition=mcbstudent
    #SBATCH --qos=mcbstudent
    #SBATCH --array=[1-5]%5
    #SBATCH --mail-type=ALL
    #SBATCH --mail-user=jessica.chen@uconn.edu
    #SBATCH -o %x_%A_%a.out
    #SBATCH -e %x_%A_%a.err
    
    # Load required modules
    module load gcc/10.2.0
    module load RevBayes/1.1.1
    
    # Use the bdtree2.py program to: (1) create a directory with name "simrep-ID",
    # where ID is the task id; (2) simulate a tree of 20 taxa; and (3) create 
    # sg.sh with scaling factor 1.0
    python3 $HOME/bin/bdtree2.py $SLURM_ARRAY_TASK_ID 1.0 20
    
    # Navigate into the new directory created for this replicate
    cd simrep-$SLURM_ARRAY_TASK_ID
    
    # Run seq-gen to simulate sequence data
    . sg.sh
    
    # Run RevBayes
    cp ../zeroinfo.Rev .
    rb zeroinfo.Rev
    
    # Convert RevBayes-style treefiles into nexus-formatted treefiles that Galax can read
    python3 $HOME/bin/rb2nxs.py "output/zeroinfo_run_1.trees" zeroinfo1.tre
    python3 $HOME/bin/rb2nxs.py "output/zeroinfo_run_2.trees" zeroinfo2.tre
    python3 $HOME/bin/rb2nxs.py "output/zeroinfo_run_3.trees" zeroinfo3.tre
    python3 $HOME/bin/rb2nxs.py "output/zeroinfo_run_4.trees" zeroinfo4.tre
    python3 $HOME/bin/rb2nxs.py "output/zeroinfo_run_*.trees" zeroinfo.tre
    
    # Run Galax on combined runs
    $HOME/bin/galax --treefile zeroinfo.tre --outfile galax-combined
    
    # Run Galax on separate runs
    echo "zeroinfo1.tre" > listfile.txt
    echo "zeroinfo2.tre" >> listfile.txt
    echo "zeroinfo3.tre" >> listfile.txt
    echo "zeroinfo4.tre" >> listfile.txt
    $HOME/bin/galax --listfile listfile.txt --outfile galax-separate
    
The `zeroinfo.slurm` script is pretty much the same except for the last few lines, which create a file named _listfile.txt_ that contains the tree file names from the four independent RevBayes runs on separate lines. This file is input to Galax in the final line so that Galax can measure dissonance between the four runs. The `echo` commands just echo the file name provided and the `>` stores the name in the file _listfile.txt_ (overwriting the file if it exists). The `>>` appends to _listfile.txt_, which we do on the last three `echo` lines because we don't want to erase the file names that we've already added. You can use `cat listfile.txt` to see the result after the slurm script runs.

### 3. Copy your RevBayes script

You will also need to copy _zeroinfo.Rev_ into your _week11_ directory:

    cd ~/week11
    cp ../week10/zeroinfo.Rev .

### 4. Start your array job

To start the run, be sure your email is the one that will be used by the _zeroinfo.slurm_ script, then type

    sbatch zeroinfo.slurm
    
You should see 5 directories created: _simrep-1_, _simrep-2_, _simrep-3_, _simrep-4_, and _simrep-5_, along with files that have names matching the patterns _zeroinfo_*.err_ and _zeroinfo_*.out_. The `zeroinfo` part comes from the job name (`#SBATCH --job-name=zeroinfo`).

You can check whether your run has finished using the `squeue` command:

    squeue -u eeb5349usr13
    
### 5. Create a new summarize.py script

Be sure you are in the `~/week11` directory, then use nano to create a file named `summarize.py` with this content:

    import math,re,glob,os,sys
    
    samplesize = 40000
    
    dirnames = glob.glob('simrep-*')
    print('%20s %12s %12s %12s %12s %12s %12s %12s %12s %12s' % ('dir', 'coverage', 'H', 'H*', 'I', 'Ipct', 'covH', 'covIpct', 'rawIpct', 'Dpct'))
    for d in dirnames:
        stuff = open(os.path.join(d, 'galax-combined.txt'), 'r').read()
    
        m = re.search('(?P<raw>[.0-9]+) percent information given sample size', stuff, re.M | re.S)
        assert m is not None
        rawIpct = float(m.group('raw'))
        
        m = re.search('treefile\s+unique\s+coverage\s+H\s+H[*]\s+I\s+Ipct\s+D\s+Dpct\s+\S+\s+(?P<unique>\d+)\s+(?P<coverage>[.0-9]+)\s+(?P<H>[.0-9]+)\s+(?P<Hstar>[.0-9]+)\s+(?P<I>[.0-9]+)\s+(?P<Ipct>[.0-9]+)', stuff, re.M | re.S)
        assert m is not None
        unique   = int(m.group('unique'))
        coverage = float(m.group('coverage'))
        H        = float(m.group('H'))
        Hstar    = float(m.group('Hstar'))
        I        = float(m.group('I'))
        Ipct     = float(m.group('Ipct'))
        covH     = math.log(samplesize/coverage)
        covIpct  = 100.0*(covH - Hstar)/covH
        
        # The galax-separate.txt file should have a merged line that looks like this
        # treefile  unique  coverage         H        H*         I      Ipct        D      Dpct
        # merged     40000   0.00020  46.84760  20.78265  26.06496  55.63776  4.86519  23.40989        
        stuff = open(os.path.join(d, 'galax-separate.txt'), 'r').read()
        m2 = re.search('merged\s+\d+\s+[.0-9]+\s+[.0-9]+\s+[.0-9]+\s+[.0-9]+\s+[.0-9]+\s+[.0-9]+\s+(?P<Dpct>[.0-9]+)', stuff, re.M | re.S)
        assert m2 is not None
        Dpct = float(m2.group('Dpct'))
        
        print('%20s %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f' % (d, coverage, H, Hstar, I, Ipct, covH, covIpct, rawIpct, Dpct))

Run `summarize.py` like this:

    python3 summarize.py
    
This should give you a summary of the results in the two Galax output files _galax-combined.txt_ and _galax-separate.txt_ that have been created by Galax in each replicate directory.

The last column is new: it records the percent dissonance measured by comparing the results from the four replicate runs.

### 6. Nearly zero information analyses

Use your _clean.sh_ script to remove the _simrep*_ directories and output/error files from the previous run (only do this when you're finished gathering all the information you need):

    ./clean.sh

Copy _zeroinfo.Rev_ to create _lowinfo.Rev_:

    cp zeroinfo.Rev lowinfo.Rev
    
and then edit _lowinfo.Rev_, changing `ignore_data <- TRUE` to `ignore_data <- FALSE`. You should also change the output file names to avoid confusion:

    treefname <- "output/zeroinfo.trees"
    logfname  <- "output/zeroinfo.log"
    mapfname  <- "output/zeroinfo-map.tree"

should be changed to

    treefname <- "output/lowinfo.trees"
    logfname  <- "output/lowinfo.log"
    mapfname  <- "output/lowinfo-map.tree"

Copy the zeroinfo.slurm_ file to create a file named _lowinfo.slurm_:

    cp zeroinfo.slurm lowinfo.slurm
    
Now edit _lowinfo.slurm_ and change this line

    python3 $HOME/bin/bdtree2.py $SLURM_ARRAY_TASK_ID 1.0 20

to look like this

    python3 $HOME/bin/bdtree2.py $SLURM_ARRAY_TASK_ID 0.001 20

Changing the `1.0` to `0.001` will result in seq-gen using a scaling factor of 0.001 rather than 1.0 when it simulates data. Making the substitution rate 1000 times smaller will result in the same number of sites but substantially less information.

You will also have to do more editing of _lowinfo.slurm_. Everywhere that `zeroinfo` appears should be changed to `lowinfo`.

Try running the low info analyses with different seq-gen scalers: for example, you might do a series of analyses with scalers equal to 1.1, 1.0, 0.1, 0.01, 0.001, 0.001, and 0.00001. This may take some time, however, so begin with, say, 1.1 and 0.001 and work your way through as many of the others as you have time for. Create a table showing how dissonance and information contant changes with the scaler used. I'm expecting information to increase and dissonance to decrease with increasing scalers, but we'll see on Friday what you found.
