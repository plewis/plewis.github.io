---
layout: page
title: Week 9 (March 25-29, 2024)
permalink: /jcweek9/
---

This week will be devoted to learning about "array jobs" on the cluster.

### 1. Login and create a working directory

To begin, login to the Xanadu cluster...

    ssh eeb5349usr13@xanadu-submit-ext.cam.uchc.edu
    
Create a directory named `week9` and navigate into it...

    mkdir week9
    cd week9
    
### 2. Download bdtree2.py

    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/bdtree2.py
    mv bdtree2.py ~/bin
    
### 3. Download rb2nxs.py

    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/rb2nxs.py
    mv rb2nxs.py ~/bin
    
### 4. Download the RevBayes script template

    cd ~/week9  # just to ensure you are in the week9 directory
    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/jc/zeroinfo.Rev

### 5. Create the SLURM script

These instructions were prepared using the tutorial on the [Computational Biology Core](https://bioinformatics.uconn.edu) web site. To get there, choose "Tutorials and Instruction" from the main menu, then "Tutorials", then click on the link for "Array Job Submission".

Issue the command 

    nano test.slurm
    
and copy the following text into the new file named "test.slurm" and save the file.

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
    ##SBATCH --mail-user=jessica.chen@uconn.edu
    #SBATCH --mail-user=paul.lewis@uconn.edu
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
    rb zeroinfo.Rev
    
    # Convert RevBayes-style treefile into a nexus-formatted treefile that Galax can read
    python3 $HOME/bin/rb2nxs.py "output/zeroinfo_run_*.trees" zeroinfo.tre
    
    # Run Galax
    $HOME/bin/galax --treefile zeroinfo.tre --outfile galax-output
    
    # Get the coverage from "galax-output.txt"
    COVERAGE=`cat galax-output.txt | grep "^zeroinfo[.]tre" | cut -c27-38 | tr -d ' '`
    
    # Get the estimated entropy (H*) from "galax-output.txt"
    HSTAR=`cat galax-output.txt | grep "^zeroinfo[.]tre" | cut -c53-64 | tr -d ' '`

    # Get the estimated information (Ipct) from "galax-output.txt"
    PICT=`cat galax-output.txt | grep "^zeroinfo[.]tre" | cut -c79-80 | tr -d ' '`

    # Calculate the corrected Ipct
    CIPCT=`python3 -c "from math import log; H = log(40000/$COVERAGE); cipct = 100.0*(H - $HSTAR)/H; print(cipct)"`
    
    echo "Coverage       = $COVERAGE"
    echo "H*             = $HSTAR"
    echo "Ipct           = $IPCT"
    echo "Corrected Ipct = $CIPCT"

Let me explain what is going on in lines like this:

    COVERAGE=`cat galax-output.txt | grep "^zeroinfo[.]tre" | cut -c27-38 | tr -d ' '`


The file _galax-output.txt_ should contain a line that looks something like this:

    zeroinfo.tre        10165      0.97954      9.24908      9.23864      0.01044      0.11289...
    
The `cat galax-output.txt` command spits out the entire contents of the file _galax-output.txt_.

The `|` character is called a _pipe_; it turns the output of one command into the input of the next command.

The `grep "^zeroinfo[.]tre"` command selects the line beginning with `zeroinfo.tre` (the carat character `^` denotes the beginning of a line). The `[.]` is needed because the grep command treats dot characters as wildcards, so a dot by itself would match any character. This would work fine in our case because it would match the dot in `zeroinfo.tre`, but it is good to be explicit.

The `cut -c27-38` selects characters 27 to 38 from the output of the grep command (the `c` stands for "column").

The `tr -d ' '` command trims all spaces from the result (the `d` stands for "delimiter").

The backticks at the beginning and end of the line assign the result of the command to the variable `coverage`.

The last four `echo` lines spit out the information we've gleaned from _galax-output.txt_.

### 6. Start your array job

To start the run, be sure your email is the one that will be used by the _test.slurm_ script, then type

    sbatch test.slurm
    
You should see 5 directories created: _simrep-1_, _simrep-2_, _simrep-3_, _simrep-4_, and _simrep-5_, along with files that have names matching the patterns _testrun_*.err_ and _testrun_*.out_.

You can check whether your run has finished using the `squeue` command:

    squeue -u eeb5349usr13
    
Once the run is finished, you can get it to show you the numbers for each run using the `tail` command:

    tail -n 4 testrun_*.out
    
This shows the last 4 lines of all the _testrun_*.out_ files. Ideally, the corrected Ipct should be 0.0 for all these runs, but my experiments are resulting in negative numbers. Just summarize the values (i.e. calculate the average) for now.

When you are finished with your results, you can delete everything created during the run as follows:

    rm -rf simrep-* testrun*.out testrun*.err
    
This uses the remove command `rm`, telling it to not ask questions (`-f`) and recursively delete files in subdirectories (`-r`) for the file patterns provided. Note that you should be careful with the `rm` command. **There is no undo** for `rm`. Once it deletes files and directories, they are gone for good, so be sure you are in the correct directory (e.g. type `pwd` to make sure you are in the `week9` directory) when you issue this command. Using specific file patterns is good also because it restricts `rm` to removing only files that match that pattern. Non-specific file patterns are very dangerous: for example, never type `rm -rf *` as that will delete everything in the current directory!

### 7. Something else to try

The file _zeroinfo.Rev_ is set up (as the name suggests) for running RevBayes without data so that there really is zero information. It might be interesting to copy _zeroinfo.Rev_ to _hasinfo.Rev_:

    cp zeroinfo.Rev hasinfo.Rev

and then edit _hasinfo.Rev_ to change the `ignore_data <- TRUE` to `ignore_data <- FALSE`. You will also need to edit your _test.slurm_ script (or modify a copy of this file) to use _hasinfo.Rev_ rather than _zeroinfo.Rev_. The run will take longer because now RevBayes needs to calculate likelihoods, but we should see the corrected Ipct much higher (e.g. maybe even reaching 100) because there is information in the data about the tree.

You can also try changing the scaling factor used by seq-gen to lower the amount of information in the data it generates. This would involve changing this line in _test.slurm_:

    python3 $HOME/bin/bdtree2.py $SLURM_ARRAY_TASK_ID 1.0 20

The `1.0` (next to last thing on the line) is the scaling factor encoded in the _sg.sh_ file created by _bdtree2.py_. If you make this scaling factor, say, 0.001, you will generate data with 3 orders of magnitude smaller substitution rates, which should result in less information about the tree topology.

### 8. Keep your experiments small for now

We will eventually ramp up to doing perhaps hundreds of simulation replicates, but keep the number of replicates small (e.g. 5, as used here) until we are sure everything is working.

