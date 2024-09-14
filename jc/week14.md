---
layout: page
title: Week 14 (Sep 16-20, 2024)
permalink: /jcweek14/
---

This week we will begin generating data that will be used in the paper. The first table we will need shows how information content estimation fails if the number of samples from the posterior does not greatly exceed the expected number of plausible tree topologies. Perform array jobs in which each of 20 tasks asks RevBayes to sample from the prior (zero info) for problems in which the number of taxa is 9 (1*3*5*7*9*11*13 = 135,135 unrooted topologies). Each array job examines a different posterior sample size (10k, 100k, 1000k, 10000k) and we expect information to be accurately estimate (i.e. 0.0 information) only for the 1000k and 10000k cases.

Note: you do not need to type (or copy) comments, which are the parts of lines after the hash `#` symbol.

### 1. Login to Xanadu and create a working directory

Create a `zeroinfo` directory:

    cd ~                  # ensures you are in your home directory (~ is shorthand for your home directory)
    mkdir zeroinfo
        
### 2. Download programs and files needed

Now that you have a new account, you will need to download _seq-gen_, _galax_, _bdtree2.py_, and _rb2nxs.py_ to your `~/bin` directory:

    mkdir ~/bin           # create a directory named "bin" in your home directory
    cd ~/bin              # navigate into your bin directory
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/seq-gen
    chmod +x ~/bin/seq-gen  # make seq-gen executable
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/galax
    chmod +x ~/bin/galax  # make galax executable
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/bdtree2.py
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/rb2nxs.py
    
Now download _zeroinfo.Rev_ into your `zeroinfo` directory:
    
    cd ~/zeroinfo         # navigate into your zeroinfo directory
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/zeroinfo.Rev
    
### 3. Create a bash script to help clean up after a run

Create a new file named `clean.sh` inside your `zeroinfo` directory using nano. Enter the following text into nano:

    #!/bin/bash
    
    cd .
    rm -rf testrun*.out
    rm -rf testrun*.err
    rm -rf simrep-*
    
After saving and exiting out of nano, make the `clean.sh` file executable:

    chmod +x clean.sh
        
### 4. Create the SLURM script

These instructions were prepared using the tutorial on the [Computational Biology Core](https://bioinformatics.uconn.edu) web site. To get there, choose "Tutorials and Instruction" from the main menu, then "Documentation and Tutorials", then click on the link for "Using job arrays in SLURM".

Issue the following command from within your `zeroinfo` directory:

    nano test.slurm
    
and edit the text you now have in "test.slurm" to match the following:

    #!/bin/bash
    
    #SBATCH --job-name=testrun
    #SBATCH -n 1
    #SBATCH -N 1
    #SBATCH -c 1
    #SBATCH --mem=5G
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
    # Simulate a tree of 9 taxa, and create sg.sh with scaling factor 1.0
    # Note that the log of the number of unrooted trees for 9 taxa is 11.81402956
    python3 $HOME/bin/bdtree2.py $SLURM_ARRAY_TASK_ID 1.0 9
    
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
    
### 5. Create the _summarize.py_ script

Be sure you are in your `~/zeroinfo` directory, then use nano to create a file named `summarize.py` with this content:

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

### 6: Adjust parameters in your _zeroinfo.Rev_ file

We need to generate samples of size 10000, 100000, 1000000, and 10000000 using RevBayes. At the top of _zeroinfo.Rev_ there are some variables that we can adjust to achieve these sample sizes. Here are the two that are relevant:

* `samplingiters` is the number of iterations to perform after burning in the MCMC chain
* `saveevery` is the number of iterations to skip between iterations in which a sample is saved

The total number of samples saved to the output file will equal `samplingiters` divided by `saveevery`. Let's always use 1000 for `saveevery`. To get 10000 trees saved, you would thus set `samplingiters` to 10000000.

Although it doesn't affect anything, I would set the variable `printevery` in the _zeroinfo.Rev_ file to 1% of `samplingiters`. That way, you will get 100 lines in the output showing the progress of the run.

In addition, you will want to make sure that the variable `ignore_data` is set to `TRUE` for each run.

You will need to perform a run (steps 7-9) for each of the four sample sizes. Before each run, after adjusting samplingiters and saveevery, make a copy of _zeroinfo.Rev_ like this:

    cp zeroinfo.Rev zeroinfo-10000.Rev   # for the run saving 10000 trees
    
This way we will have a copy of the file you actually used for each run in case one of the runs looks like it is not behaving the way we expected.
    
### 7. Start your array job

To start the run, be sure your email is the one that will be used by the _test.slurm_ script, then type

    sbatch test.slurm
    
You should see 20 directories created: _simrep-1_, _simrep-2_, ..., _simrep-20_, along with files that have names matching the patterns _testrun_*.err_ and _testrun_*.out_.

You can check whether your run has finished using the `squeue` command:

    squeue -u jechen
    
### 8. Summarize the results

Run `summarize.py` like this:

    python3 summarize.py
    
This should give you a summary of the results from all the simulation directories created by the `test.slurm` script. Make a copy of the output generated and save it to a file on your laptop with a name that reflects the sample size used (e.g. _summary-10000.txt_).

### 9. Clean up

If you are ready to delete all the `simrep-*` directories and slurm output files, you can run your _clean.sh_ script like this:

    ./clean.sh

Remember, the initial `./` is needed because the linux operating system does not look for executable files in the current directory (to prevent you from hurting yourself by accidentally running a program); the `./` says to run the `clean.sh` script in the current directory (the `.` is shorthand for "current directory").


