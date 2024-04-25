---
layout: page
title: Week 2 (April 22-26, 2024)
permalink: /ekweek2/
---

## Batch jobs

In order to carry out runs in the background (called batch jobs), you need to create a slurm script.

Create a file named _mcmcmc.slurm_ using nano and copy the following text into it:

    #!/bin/bash
    
    #SBATCH --job-name=mcmcmc
    #SBATCH -n 1
    #SBATCH -N 1
    #SBATCH --mem=5G
    #SBATCH --partition=mcbstudent
    #SBATCH --qos=mcbstudent
    #SBATCH --mail-type=ALL
    #SBATCH --mail-user=elena.korte@uconn.edu
    #SBATCH -o %x_%A.out
    #SBATCH -e %x_%A.err
    
    # Load required modules
    module load RevBayes/1.1.1
    
    # Run RevBayes
    rb jc.Rev

You can now start the run as follows, assuming both _jc.Rev_ and _mcmcmc.slurm_ are in the same directory:

    sbatch mcmcmc.slurm
    
You can now log out of the cluster and the run will keep going in the background. You will get an email anytime anything significant happens (run starts, run stops, error encountered, etc.), but you can also check on progress using the `squeue` command:

    squeue -u eeb5349usr6
    
If you get nothing but headers, then the run has either finished or has aborted.

## Understanding the slurm script

The first line `#!/bin/bash` tells the system what program to use to interpret the commands in this file. The initial `#!` tells it that the path to a command interpreter program will follow and `/bin/bash` is the path to the interpreter program, in this case bash.

The `#SBATCH` commands are technically comments that are totally ignored by `bash`, but the slurm program `sbatch` intercepts these before handing over the script to `bash`. Here is some explanation of the `#SBATCH` commands at the top of your _mcmcmc.slurm_ script:

* `--job-name=mcmcmc` just names your run so that it is easy to identify in the `squeue` output.

* `-N 1` says just reserve one "node" (i.e. computer) for this analysis.

* `-n 1` says use one "core" (synonyms "slot", "processor"; most nodes have multiple processors).

* `--mem=5G` says to choose a node with at least 5 gigabytes memory.

* `--partition=mcbstudent` says to use the mcbstudent partition (this is used to select a node reserved for classroom use).

* `--qos=mcbstudent` says to use the quality-of-service named mcbstudent (this is used to select a node reserved for classroom use).

* `--mail-type=ALL` says to email you about everything that happens (you can, alternatively, say for example `--mail-type=END` to only email you when the program finishes).

* `--mail-user=elena.korte@uconn.edu` provides the email address to use.

* `-o %x_%A.out` says to send standard output to a file whose name looks something like _mcmcmc_7654321.out_. The `%x` part is replaced by the job name and the `%A` part is replaced by the job ID (assigned by the system once the job starts running).

* `-e %x_%A.err` provides the name of a file for error messages.

After the `#SBATCH` lines, you just insert the commands that you want to run. Note that I've told it to load the RevBayes module. Even if you loaded the RevBayes module before you ran `sbatch`, it will not carry over to your batch run; you need to load any modules needed inside your slurm script.

## Running multiple chains (robots)

The only change you need to make to your _jc.Rev_ script this week is to replace `mcmc` with `mcmcmc`. You will need to replace

    # Start the MCMC analsis
    mymcmc = mcmc(mymodel, monitors, moves, nruns=4, combine="sequential")
    mymcmc.run(generations=10000)
    
with

    # Start the MCMC analsis
    mymcmc = mcmcmc(mymodel, monitors, moves, nruns=4, combine="sequential")
    mymcmc.run(generations=10000)

You might also want to search for the word `filename` throughout the _jc.Rev_ file and replace the file names defined with ones that are different than what you used for the single-chain runs you did last week so that those results are not overwritten.

All four runs should converge on the same answer this time because swapping among the four chains should allow the cold chain to move between the two main islands freely.

