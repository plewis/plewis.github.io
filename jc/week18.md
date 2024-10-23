---
layout: page
title: Week 18 (Oct. 21-25, 2024)
permalink: /jcweek18/
---

### 1. Login to Xanadu and create a working directory

Create a `someinfo` directory:

    cd ~ 
    rm -rf someinfo
    mkdir someinfo
        
### 2. Download new version of bdtree

You will need to download _bdtree3.py_, which differs from _bdtree2.py_ in allowing a sequence length to be specified:

    cd ~/bin
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/bdtree3.py
    
### 3. Create _someinfo.Rev_ and copy your clean and summarize.py scripts

Copy _zeroinfo.Rev_ into your `someinfo` directory and change its name to _someinfo.Rev_:
    
    cd ~/zeroinfo
    cp zeroinfo.Rev ../someinfo
    cp clean.sh ../someinfo
    cp summarize.py ../someinfo
    cd ../someinfo   # navigate back one directory level and down again into someinfo
    mv  zeroinfo.Rev someinfoRev
    
Edit the lines at the top of your _someinfo.Rev_ script to look like this:

    datafname <- "simdata.nex"
    treefname <- "output/someinfo.trees"
    logfname  <- "output/someinfo.log"
    mapfname  <- "output/someinfo-map.tree"
    burniniters    <- 1000
    tuneevery      <- 100
    samplingiters  <- 10000
    printevery     <- 100
    saveevery      <- 10
    numruns        <- 1
    ignore_data <- FALSE
    
These settings are for the 1K case (`samplingiters = 10000` and `saveevery = 10`, so `10000/10 = 1000` samples will be saved). You will need to modify `samplingiters` for the other cases to achieve the correct number of samples.
            
### 4. Create the SLURM script

Issue the following command from within your `someinfo` directory:

    nano test.slurm
    
and edit the text you now have in _test.slurm_ to match the following (note that _bdtree2.py_ has been changed to _bdtree3.py_):

    #!/bin/bash
    
    #SBATCH --job-name=testrun
    #SBATCH -n 1
    #SBATCH -N 1
    #SBATCH -c 1
    #SBATCH --mem=10G
    #SBATCH --partition=general
    #SBATCH --qos=general
    #SBATCH --array=[1-20]%20
    #SBATCH --mail-type=ALL
    #SBATCH --mail-user=jessica.chen@uconn.edu
    #SBATCH -o %x_%A_%a.out
    #SBATCH -e %x_%A_%a.err
    
    # Load required modules
    module load gcc/10.2.0
    module load RevBayes/1.1.1
    
    # Create directory with name "simrep-ID" where ID is the task id
    # Simulate a tree of 9 taxa, and create sg.sh with scaling factor 1.0 and seqlen equal to 1000
    # Note that the log of the number of unrooted trees for 9 taxa is 11.81402956
    python3 $HOME/bin/bdtree3.py $SLURM_ARRAY_TASK_ID 1.0 9 1000
    
    # Navigate into the new directory created for this replicate
    cd simrep-$SLURM_ARRAY_TASK_ID
    
    # Run seq-gen to simulate sequence data
    . sg.sh
    
    # Navigate into the new directory created for this replicate

    # Run RevBayes
    cp ../someinfo.Rev .
    sed -i "s/__RNSEED__/$SLURM_ARRAY_TASK_ID/" someinfo.Rev
    rb someinfo.Rev
        
    # Run Galax
    $HOME/bin/galax --treefile output/someinfo.trees --outfile galax-output
        
### 6. Start your array job

To start the run, be sure your email is the one that will be used by the _test.slurm_ script, then type

    cd ~/someinfo
    sbatch test.slurm
    
You should see 20 directories created: _simrep-1_, _simrep-2_, ..., _simrep-20_, along with files that have names matching the patterns _testrun_*.err_ and _testrun_*.out_.

You can check whether your run has finished using the `squeue` command:

    squeue -u jechen
    
### 8. Summarize the results

Run `summarize.py` like this:

    python3 summarize.py
    
This should give you a summary of the results from all the simulation directories created by the `test.slurm` script. Make a copy of the output generated and save it to a file on your laptop with a name that reflects the number of sites and sample size used (e.g. _1000sites-10M.txt_).

### 9. Clean up

If you are ready to delete all the `simrep-*` directories and slurm output files, you can run your _clean.sh_ script like this:

    ./clean.sh

Remember, the initial `./` is needed because the linux operating system does not look for executable files in the current directory (to prevent you from hurting yourself by accidentally running a program); the `./` says to run the `clean.sh` script in the current directory (the `.` is shorthand for "current directory").

