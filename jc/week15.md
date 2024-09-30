---
layout: page
title: Week 15 (Sep 30 to Oct. 4, 2024)
permalink: /jcweek15/
---

This week we will try again to estimate information content for the case of posterior samples of size 10 million. Basically, you will repeat what you did a couple of weeks ago but with updated galax and summarize.py programs.

This time, be careful to set the variable `printevery` in your RevBayes file so that only 10 lines of output are generated during the run (see instructions in step 6 below). This will limit the size of the output files generated, which is good since we don't even use those files.

The following instructions are almost the same as before, but there are a few modifications so read each step carefully.

Note: you do not need to type (or copy) comments, which are the parts of lines after the hash `#` symbol.

### 1. Login to Xanadu and create a working directory

Create a `zeroinfo` directory:

    cd ~             # ensures you are in your home directory (~ is shorthand for your home directory)
    rm -rf zeroinfo  # this removes the old zeroinfo directory (-r = recursive, -f = force)
    mkdir zeroinfo
        
### 2. Download programs and files needed

You will need to download _galax_ to your `~/bin` directory because it has changed (_seq-gen and _bdtree2.py_ do not need to be refreshed, and we will not be using _rb2nxs.py_ any more):

    cd ~/bin              # navigate into your bin directory
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/galax
    chmod +x ~/bin/galax  # make galax executable
    
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
    # Simulate a tree of 9 taxa, and create sg.sh with scaling factor 1.0
    # Note that the log of the number of unrooted trees for 9 taxa is 11.81402956
    python3 $HOME/bin/bdtree2.py $SLURM_ARRAY_TASK_ID 1.0 9
    
    # Navigate into the new directory created for this replicate
    cd simrep-$SLURM_ARRAY_TASK_ID
    
    # Run seq-gen to simulate sequence data
    . sg.sh
    
    # Run RevBayes
    cp ../zeroinfo.Rev .
    sed -i "s/__RNSEED__/$SLURM_ARRAY_TASK_ID/" zeroinfo.Rev
    rb zeroinfo.Rev
        
    # Run Galax
    $HOME/bin/galax --treefile output/zeroinfo.trees --outfile galax-output
    
### 5. Create the _summarize.py_ script

Be sure you are in your `~/zeroinfo` directory, then use nano to create a file named `summarize.py` with this content:

    import math,re,glob,os,sys
    
    samplesize = None
    treefname = 'zeroinfo.tre'
    
    dirnames = glob.glob('simrep-*')
    print('%20s %20s %20s %12s %12s %12s %12s %12s %12s %12s %12s %12s %12s %12s %12s' % ('dir', 'samplesize', 'log(ss/ntopol)', 'coverage', 'Hprior', 'Hpost', 'I', 'Ipct', 'covH', 'covIpct', 'rawHprior', 'rawHpost', 'rawIpct', 'trueHpost', 'trueIpct'))
    for d in dirnames:
        galax_file_name = os.path.join(d, 'galax-output.txt')
        if not os.path.exists(galax_file_name):
            sys.exit('Could not find file "%s"' % galax_file_name)
        stuff = open(galax_file_name, 'r').read()
    
        # Look for lines like this and extract each of the 4 values:
        # 11.80705 raw posterior entropy
        # 10000001 sample size
        # 16.11810 maximum entropy given sample size
        # 11.81403 maximum entropy given total num. topologies
        # 26.74662 percent raw information given sample size
        #  0.05908 percent raw information given total num. topologies
        
        m = re.search(r'(?P<rawHpost>[.0-9]+) raw posterior entropy\s+(?P<samplesize>[0-9]+) sample size\s+(?P<rawHprior>[.0-9]+) maximum entropy given sample size\s+(?P<trueHprior>[.0-9]+) maximum entropy given total num. topologies\s+(?P<rawIpct>[.0-9]+) percent raw information given sample size\s+(?P<trueIpct>[.0-9]+) percent raw information given total num. topologies', stuff, re.M | re.S)
        if m is None:
            sys.exit('Could not find raw results in file "%s"' % galax_file_name)
        rawHpost   = float(m.group('rawHpost'))
        samplesize = float(m.group('samplesize'))
        rawHprior  = float(m.group('rawHprior'))
        trueHprior  = float(m.group('trueHprior'))
        rawIpct    = float(m.group('rawIpct'))
        trueIpct    = float(m.group('trueIpct'))
        
        m = re.search(r'%s\s+(?P<unique>\d+)\s+(?P<coverage>[.0-9]+)\s+(?P<H>[.0-9]+)\s+(?P<Hstar>[.0-9]+)\s+(?P<I>[.0-9]+)\s+(?P<Ipct>[.0-9]+)' % treefname, stuff, re.M | re.S)
        if m is None:
            sys.exit('Could not find conditional clade results in file "%s"' % galax_file_name)
        unique   = int(m.group('unique'))
        coverage = float(m.group('coverage'))
        Hprior   = float(m.group('H'))
        Hpost    = float(m.group('Hstar'))
        I        = float(m.group('I'))
        Ipct     = float(m.group('Ipct'))
        covH     = math.log(samplesize/coverage)
        covIpct  = 100.0*(covH - Hpost)/covH
        
        logRatioSampleSizeToNumTopologies = math.log(samplesize) - Hprior
        
        print('%20s %20d %20.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f' % (d, samplesize, logRatioSampleSizeToNumTopologies, coverage, Hprior, Hpost, I, Ipct, covH, covIpct, rawHprior, rawHpost, rawIpct, trueHprior, trueIpct))

### 6: Adjust parameters in your _zeroinfo.Rev_ file

We need to generate samples of size 10000000 using RevBayes. At the top of _zeroinfo.Rev_ there are some variables that we can adjust to achieve this sample size. Here are the three that are relevant:

* `samplingiters` is the number of iterations to perform after burning in the MCMC chain
* `printevery` is the number of iterations to skip between iterations in which a progress report is made
* `saveevery` is the number of iterations to skip between iterations in which a sample is saved

The total number of samples saved to the output file will equal `samplingiters` divided by `saveevery`. If we use 10 for `saveevery`, then to get 10000000 trees saved, you would thus set `samplingiters` to 100000000.

Set the variable `printevery` in the _zeroinfo.Rev_ file to 10% of `samplingiters`. That way, you will get 10 lines in the output showing the progress of the run. So, if you set `samplingiters` to 100000000, set `printevery` to 10000000 (i.e. `printevery` should have one fewer zero than `samplingiters`).

In addition, you will want to make sure that the variable `ignore_data` is set to `TRUE` for each run.

After adjusting `samplingiters` and `saveevery`, make a copy of _zeroinfo.Rev_ like this:

    cp zeroinfo.Rev zeroinfo-10M.Rev   # for the run saving 10 million trees
    
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
    
This should give you a summary of the results from all the simulation directories created by the `test.slurm` script. Make a copy of the output generated and save it to a file on your laptop with a name that reflects the sample size used (e.g. _summary-10M.txt_).

### 9. Clean up

If you are ready to delete all the `simrep-*` directories and slurm output files, you can run your _clean.sh_ script like this:

    ./clean.sh

Remember, the initial `./` is needed because the linux operating system does not look for executable files in the current directory (to prevent you from hurting yourself by accidentally running a program); the `./` says to run the `clean.sh` script in the current directory (the `.` is shorthand for "current directory").

