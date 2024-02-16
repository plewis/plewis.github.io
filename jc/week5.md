---
layout: page
title: Week 5
permalink: /jcweek5/
---

This week, you will use the program [Galax](/software#galax) to estimate information content in your simulated data sets.

The web site provides versions for Windows and Mac, but not for the Linux operating system, which is what you are using when you login to the cluster.

I have created a version for you that will work on the cluster and put it in the `bin` directory for you. I've also put a Python program, `rb2nxs.py`, in your `bin` directory; you will need this to convert tree files output by RevBayes into a form that galax can read.

To being, login to the Xanadu cluster...

    ssh eeb5349usr13@xanadu-submit-ext.cam.uchc.edu
    
request a free node to work on...

    srun --partition mcbstudent --qos mcbstudent --pty bash
    
load the `gcc/10.2.0` module (galax will need this to run)...

    module load gcc/10.2.0
    
and, finally, create a directory named `info` and navigate into it...

    mkdir info
    cd info
    
Copy one set of RevBayes tree files into the `info` directory. The command below will copy the four files `medium_run_1.trees`, `medium_run_2.trees`, `medium_run_3.trees`, and `medium_run_4.trees` from the `~/rblab/output` directory (the `~` stands for your home directory) to the current directory (`.`):

    cp ~/rblab/output/`medium_run_?.trees` .

RevBayes creates tree files in a format that galax can't understand, so we'll need to run a program to convert these tree files to a nexus-format version that galax can read:

    python3 ~/bin/rb2nxs.py medium_run_1.trees medium1.tre
    python3 ~/bin/rb2nxs.py medium_run_2.trees medium2.tre
    python3 ~/bin/rb2nxs.py medium_run_3.trees medium3.tre
    python3 ~/bin/rb2nxs.py medium_run_4.trees medium4.tre
    
Using nano, create a file listing the four treefile names that you want galax to process:

    nano medium-treefiles.txt
    
Copy the following lines into nano and save:

    medium1.tre
    medium2.tre
    medium3.tre
    medium4.tre

Now you can try running galax:

    ~/bin/galax --listfile medium-treefiles.txt --skip 1 --outfile medium-output
    
This will cause galax to read all four files listed in `medium-treefiles.txt`, skip the first tree in each file (because the first tree is the starting tree and is not representative of the posterior distribution we want to summarize), and create output files whose names begin with the letters `medium-output`.

Once it has finished, open `medium-output.txt` in nano and look at the line labeled "merged" in the "treefile" column. The "merged" treefile combines the trees from all four input treefiles.

The "H" column measures the entropy of the **prior** distribution (the distribution you get when the sequence data is ignored). Entropy is highest when every possible tree is represented equally in the treefiles. 

The "H*" column measures the entropy of the **posterior** distribution (the distribution you get when the sequence data is used). This value would equal the number in the "H" column if there was zero information in the data about the phylogeny. 

The "I" column just measures the difference between "H" and "H*": the bigger the difference, the more information there is.

The "Ipct" column just scales "I" between 0 and 1, where 0 means no information and 1 means maximum possible information. The maximum possible information is achieved when there is only one tree topology represented in the tree files. 

The "D" and "Dpct" columns measure **dissonance**. You should not see much dissonance because each run of RevBayes should give you a sample that is pretty much the same as every other run. If there were big differences between runs, dissonance would be high and we'd worry that something funny was going on (either we didn't run RevBayes long enough, or there is some sort of conflict in the data about which tree topology is the true tree topology).

For this week, run galax on all four of the scenarios you simulated: "fast", "fast500", "medium", and "slow". Next week when we meet we will go over the results. Before we meet, see if the "Ipct" results make sense in light of what you know about the conditions of each simulation. That is, can you predict which data sets will have high vs. low information?




