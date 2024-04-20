---
layout: page
title: Week 13 (April 22-26, 2024)
permalink: /jcweek13/
---

This week we'll reanalyze the real data using longer runs and more thinning to see if this improves the consistency between runs.

### 1. As usual, login and create a working directory

As usual, login to the Xanadu cluster...

    ssh eeb5349usr13@xanadu-submit-ext.cam.uchc.edu
    
Create a `week13` directory:

    mkdir week13
    cd week13
    
Copy the files we need from `week12` to `week13`:

    cp ../week12/*.nex .
    cp ../week12/info.Rev .
    cp ../week12/info.slurm .
    cp ../week12/summarize.py .
    cp ../week12/clean.sh .
    
### 2. Modify your Rev script

In _info.Rev_, change

    samplingiters  <- 10000
    printevery     <- 100
    saveevery      <- 1

to
    
    samplingiters  <- 100000
    printevery     <- 1000
    saveevery      <- 10
    
The `saveevery` part says to save only every 10th MCMC iteration. Note that I've added an extra zero onto `samplingiters`, so this means we will still end up with 10000 sample points, but they will be from a run that is 10 times longer than our original runs. We may need to go to 100 times longer runs, but let's see how 10x works first.

### 3. Start your array job

To start the run, be sure your email is the one that will be used by the _info.slurm_ script, then type

    sbatch info.slurm
    
You should see 6 directories created: _gene21_, _gene26_, _gene28_, _gene30_, _gene32_m and _gene32_.

You can check whether your run has finished using the `squeue` command:

    squeue -u eeb5349usr13
    
### 4. Summarize results

Run `summarize.py` like this:

    python3 summarize.py
    
This should give you a summary of the results in the two Galax output files _galax-combined.txt_ and _galax-separate.txt_ that have been created by Galax in each replicate directory.

We're concerned this week primarily with the last column: Dpct. Are all the Dpct values less than 0.1 this time? While one tenth of one percent dissonance is not very large, it would be nice to see these drop to, say, 0.01 or smaller.

Also, record how long the runs took using the `sacct` command:

    sacct -u eeb5349usr13 --format=Jobname,JobID%30,elapsed --state cd
    
The `-u eeb5349usr13` part just limits output to runs submitted by the user `eeb5349usr13` (i.e. you).

The `--format` part tells `sacct` what columns we want to see in the output (`Jobname`, `JobID`, and `elapsed` time). the `%30` after `JobID` tells it to use 30 spaces to show the jobid. You can leave off the `%30` if you want to see what happens if there is not enough space to show a long jobid (it only shows as much as it can and adds a `+` to the end to tell you there was some stuff that was left out). There is a ton of options for `--format`. You can type

    sacct --helpformat
    
to get a list of all of them.

the `--state cd` part limits the output to only completed jobs. If your job is still running, it would show up if you chose `--state r` instead.

You will see two lines for each of the 6 data sets analyzed. You can ignore the ones whose job name is `extern`. In fact, you can add `| grep info` to the end of your `sacct` command to only show the lines we want to see:

    sacct -u eeb5349usr13 --format=Jobname,JobID%30,elapsed --state cd | grep info
    
This pipes the output of `sacct` into the command `grep`, which then filters out all lines except those containing the word `info`.

