---
layout: page
title: Week 10 (April 1-5, 2024)
permalink: /jcweek10/
---

This week will be devoted to repeating your array jobs on the cluster with a new, improved galax program.

### 1. Login and create a working directory

As usual, login to the Xanadu cluster...

    ssh eeb5349usr13@xanadu-submit-ext.cam.uchc.edu
    
Let's just rename `week9` to `week10`...

    mv week9 week10
    cd week10
    
### 2. Download galax

Galax has been modified, so replace the copy that is now in your `~/bin` directory with a new version:

    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/galax
    mv galax ~/bin
    
### 3. Create a bash script to help clean up after a run

Create a new file named `clean.sh` using nano containing this text:

    #!/bin/bash
    
    cd .
    rm -rf testrun*.out
    rm -rf testrun*.err
    rm -rf simrep-*
    
After saving and exiting out of nano, make the `clean.sh` file executable:

    chmod +x clean.sh
    
You can now run it like this (but only do this if you are ready to delete all the `simrep-*` directories and slurm output files):

    ./clean.sh

The initial `./` is needed because the linux operating system does not look for executable files in the current directory (to prevent you from hurting yourself by accidentally running a program); the `./` says to run the `clean.sh` script in the current directory (the `.` is shorthand for "current directory").
    
### 4. Create the SLURM script

These instructions were prepared using the tutorial on the [Computational Biology Core](https://bioinformatics.uconn.edu) web site. To get there, choose "Tutorials and Instruction" from the main menu, then "Tutorials", then click on the link for "Array Job Submission".

Issue the command 

    nano test.slurm
    
and edit the text you now have in "test.slurm" to match the following:

    #!/bin/bash
    
    #SBATCH --job-name=testrun
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
    
    # Create directory with name "simrep-ID" where ID is the task id
    # Simulate a tree of 20 taxa, and create sg.sh with scaling factor 1.0
    # Note that the log of the number of unrooted trees for 20 taxa is 46.8476
    python3 $HOME/bin/bdtree2.py $SLURM_ARRAY_TASK_ID 1.0 20
    
    # Navigate into the new directory created for this replicate
    cd simrep-$SLURM_ARRAY_TASK_ID
    
    # Run seq-gen to simulate sequence data
    . sg.sh
    
    # Run RevBayes
    cp ../zeroinfo.Rev .
    rb zeroinfo.Rev
    
    # Convert RevBayes-style treefile into a nexus-formatted treefile that Galax can read
    python3 $HOME/bin/rb2nxs.py "output/zeroinfo_run_*.trees" zeroinfo.tre
    
    # Run Galax
    $HOME/bin/galax --treefile zeroinfo.tre --outfile galax-output
    
The `test.slurm` script is pretty much the same as before. I've just eliminated the lines that do computations. We'll use a new python script for that after the run finishes.    

### 5. Start your array job

To start the run, be sure your email is the one that will be used by the _test.slurm_ script, then type

    sbatch test.slurm
    
You should see 5 directories created: _simrep-1_, _simrep-2_, _simrep-3_, _simrep-4_, and _simrep-5_, along with files that have names matching the patterns _testrun_*.err_ and _testrun_*.out_.

You can check whether your run has finished using the `squeue` command:

    squeue -u eeb5349usr13
    
### 6. Create the summarize.py script

Be sure you are in the `~/week10` directory, then use nano to create a file named `summarize.py` with this content:

    import math,re,glob,os,sys
    
    samplesize = 40000
    treefname = 'zeroinfo.tre'
    
    dirnames = glob.glob('simrep-*')
    print('%20s %12s %12s %12s %12s %12s %12s %12s %12s' % ('dir', 'coverage', 'H', 'H*', 'I', 'Ipct', 'covH', 'covIpct', 'rawIpct'))
    for d in dirnames:
        stuff = open(os.path.join(d, 'galax-output.txt'), 'r').read()
    
        m = re.search('(?P<raw>[.0-9]+) percent information given sample size', stuff, re.M | re.S)
        assert m is not None
        rawIpct = float(m.group('raw'))
        
        m = re.search('%s\s+(?P<unique>\d+)\s+(?P<coverage>[.0-9]+)\s+(?P<H>[.0-9]+)\s+(?P<Hstar>[.0-9]+)\s+(?P<I>[.0-9]+)\s+(?P<Ipct>[.0-9]+)' % treefname, stuff, re.M | re.S)
        assert m is not None
        unique   = int(m.group('unique'))
        coverage = float(m.group('coverage'))
        H        = float(m.group('H'))
        Hstar    = float(m.group('Hstar'))
        I        = float(m.group('I'))
        Ipct     = float(m.group('Ipct'))
        covH     = math.log(samplesize/coverage)
        covIpct  = 100.0*(covH - Hstar)/covH
        
        print('%20s %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f' % (d, coverage, H, Hstar, I, Ipct, covH, covIpct, rawIpct))

Run `summarize.py` like this:

    python3 summarize.py`
    
This should give you a summary of the results from all the simulation directories created by the `test.slurm` script.

The last column shows the raw percent information content. This is a new quantity that is just based on the raw entropy (with no attempt to extend the reach by estimating coverage). This is a simpler version of what we've been calculating, but has the advantage that it cannot be negative, so hopefully it will be close to zero (and not, say, -8!) for runs in which the data is ignored.

### 7. Something else to try

The file _zeroinfo.Rev_ is set up (as the name suggests) for running RevBayes without data so that there really is zero information. It might be interesting to copy _zeroinfo.Rev_ to _hasinfo.Rev_:

    cp zeroinfo.Rev hasinfo.Rev

and then edit _hasinfo.Rev_ to change the `ignore_data <- TRUE` to `ignore_data <- FALSE`. You will also need to edit your _test.slurm_ script (or modify a copy of this file) to use _hasinfo.Rev_ rather than _zeroinfo.Rev_. The run will take longer because now RevBayes needs to calculate likelihoods, but we should see the corrected Ipct much higher (e.g. maybe even reaching 100) because there is information in the data about the tree.

You can also try changing the scaling factor used by seq-gen to lower the amount of information in the data it generates. This would involve changing this line in _test.slurm_:

    python3 $HOME/bin/bdtree2.py $SLURM_ARRAY_TASK_ID 1.0 20

The `1.0` (next to last thing on the line) is the scaling factor encoded in the _sg.sh_ file created by _bdtree2.py_. If you make this scaling factor, say, 0.001, you will generate data with 3 orders of magnitude smaller substitution rates, which should result in less information about the tree topology.

### 8. Keep your experiments small for now

We will eventually ramp up to doing perhaps hundreds of simulation replicates, but keep the number of replicates small (e.g. 5, as used here) until we are sure everything is working.

