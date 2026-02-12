---
layout: page
title: Simulation Lab
permalink: /simulation/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

## Goals

The goal of this lab is to gain experience simulating DNA sequence data, which can be useful in testing null hypotheses of interest (parametric bootstrapping) as well as testing the robustness of models to violations of their assumptions and testing the correctness of software and algorithms. The workhorse for DNA simulations in phylogenetics is Andrew Rambaut's program [seq-gen](http://tree.bio.ed.ac.uk/software/seqgen/), which still available (and still as useful as it always was!)

I use a :large_blue_diamond: emoji below to indicate something you should do. Hopefully this will make it easier for you to see what to do next (as opposed to commentary on what you just did or notes).

## Template

Here is a template with the questions asked below. Copy this into a text file and turn
it in with your answers after the lab.

    Can you explain why nearly every site shows evidence of substitution?
    answer:

    How many sites would you expect to look at before seeing one that shows evidence of substitution?
    answer:

    How many data sets did seq-gen simulate?
    answer:

    What part of the seq-gen command told it to generate this many data sets?
    answer:

    How many trees obtained using the parsimony criterion have a topology identical to the true tree?
    answer:

    How many trees obtained using the likelihood criterion have a topology identical to the true tree?
    answer:

    What split characterizes the true tree: AB|CD, AC|BC, or AD|BC?
    answer:

    How many likelihood trees were AB|CD? AC|BD? AD|BC?
    answer:

    How many parsimony trees were AB|CD? AC|BD? AD|BC?
    answer:

    Explain why this phenomenon is called long branch attraction.
    answer:

    How many likelihood trees were AB|CD? AC|BD? AD|BC when rate heterogeneity was present?
    answer:

    Is likelihood susceptible to LBA if the model is incorrect in an important way?
    answer:    

## Getting started

:large_blue_diamond: Login to your account on the Storrs HPC cluster and start an interactive slurm session:

    ssh hpc
    gensrun
        
If `gensrun` fails, you can create the `gensrun` alias by opening the _.bashrc_ file in your home directory:

    nano ~/.bashrc
    
and typing the following (you can make it the first line of the file):

    alias gensrun='srun -p general -q general --pty bash'
    
Save the _.bashrc_ file and enter the following command (from within your home directory) to load the _.bashrc_ file (and thus load the `gensrun` alias):

    . .bashrc

The initial `.` means "read the following file". There should be a space between the initial `.` and `.bashrc`.

## Create a directory for this exercise

:large_blue_diamond: Create a directory to use for this lab and navigate into that directory:

    mkdir simlab
    cd simlab
    
## Using Seq-Gen to simulate sequence data

### Compiling seq-gen

The seq-gen program is not installed on the cluster, so you will need to download the source code and compile it yourself. What you will download is the **source code** (written in the computing language C), which needs to be compiled into an **executable file** before it can be used.

:large_blue_diamond: Download the seq-gen source code from GitHub using the following curl command:

    curl -LO https://github.com/rambaut/Seq-Gen/archive/refs/tags/1.3.4.tar.gz
    
:large_blue_diamond: Unpack the downloaded "tape archive" file _1.3.4.tar.gz_ as follows:

    tar zxvf 1.3.4.tar.gz
    
You should now have a directory named Seq-Gen-1.3.4 inside your _simlab_ directory. You can now delete the _1.3.4.tar.gz_ file:

    rm 1.3.4.tar.gz

:large_blue_diamond: Navigate into the _source_ subdirectory of the new _Seq-Gen-1.3.4_ directory:

    cd Seq-Gen-1.3.4/source
    
There is a file inside this directory named _Makefile_ that contains instructions for building seq-gen from the C source files (which are the files with names that end in either <tt>.c</tt> or <tt>.h</tt>). 

:large_blue_diamond: All you need to do now is type make to process these instructions:

    make

The C compiler will **compile** (note the <tt>-c</tt> on the command line) all the files ending in <tt>.c</tt> (including, as necessary, the files ending in <tt>.h</tt>), producing **object** files with the same prefix but ending in <tt>.o</tt>. You can ignore the warning that is issued along the way (errors are harder to ignore, but fortunately there should be no errors). These object files are then linked together (note the <tt>-o</tt> rather than <tt>-c</tt> this time) in the final step to create the executable file, which is named _seq-gen_. 

It is customary to store executable files in a directory named _bin_ (bin is short for binary because an executable file is just a sequence of 1s and 0s). You should already have a _bin_ directory (you earlier copied the paup executable file there).

:large_blue_diamond: Move the seq-gen executable file into your _~/bin_ directory so that it is easier to use for this lab:

    mv seq-gen ~/bin
    
:large_blue_diamond: You can now delete the _Seq-Gen-1.3.4_ directory:

    cd ~/simlab
    rm -rf Seq-Gen-1.3.4
    
The `-rf` part of the remove (`rm`) command says to delete files recursively (`-r`) and forcibly (`-f`). The "forcibly" part means that rm will not ask if it is OK to delete any file it finds, it will just delete it. The recursive part is necessary because this is a directory and rm will not do anything with a directory unless you specify that the removal is recursive.
    
### Viewing the seq-gen documentation

The documentation is in the form of an HTML file, _Seq-Gen.Manual.html_, which is located in the _Seq-Gen-1.3.4/documentation_ directory. It is not that convenient to view web pages on the cluster, so you may wish to download the [zip file version](https://github.com/rambaut/Seq-Gen/archive/refs/tags/1.3.4.zip) to your local laptop in order to get the file _Seq-Gen.Manual.html_ where you can open it in a web browser.

### Using seq-gen

:large_blue_diamond: Return to the _simlab_ directory now:

    cd ~/simlab 

:large_blue_diamond: Using nano, create a file named _tree.txt_ that contains the following single line:

    (A:1.0,B:1.0,((C:1.0,D:1.0):1.0,(E:1.0,F:1.0):1.0):1.0)
    
:large_blue_diamond: Now, create a file named _sg.sh_ containing the following:

    seq-gen -mHKY -l10000 -n1 -p1 -on < tree.txt > simdata.nex
    
    # -mHKY                       use the HKY substitution model
    #                             (HKY, F84, GTR, JTT, WAG, PAM, BLOSUM, MTREV, CPREV or GENERAL)
    # -l10000                     sequence length (number of sites to simulate)
    # -n1                         number of data sets to simulate from this gene tree
    # -p1                         number of data partitions
    # -f 0.25 0.25 0.25 0.25      nucleotide frequencies
    # -t2.0                       transition/transversion ratio (not the rate ratio!)
    # -r 1.0 4.0 1.0 1.0 4.0 1.0  GTR exchangeabilities)
    # -a0.5                       shape parameter of gamma among-site rate heterogeneity
    # -i0.5                       proportion of invariable sites
    # -z123579                    random number seed
    # -on                         output format (on=nexus, op=phylip, or=relaxed phylip)
    # -x paupblock.txt            insert contents of the file paupblock.txt after each simulated data set
    # -s1.0                       branch length scaling factor (1.0 says to not scale branch lengths at all)
    #
    # tree.txt should look something like this:
    # (A:1.0,B:1.0,((C:1.0,D:1.0):1.0,(E:1.0,F:1.0):1.0):1.0)
    #
    # paupblock.txt, if used, should look something like this:
    # begin paup;
    #   set crit=like;
    #   lset nst=1 basefreq=equal rates=equal;
    #   hsearch;
    # end;
    
Most of the contents of this file are comments (lines starting with `#`). I included those as a sort of cheat-sheet for using seq-gen to save having to look everything up in the manual.

:large_blue_diamond: You will need to execute the command on the first line of the _sg.sh_ file, and the easiest way to run Linux commands that are stored in a file is to "source" the file:

    . sg.sh
    
The initial dot tells the bash interpreter to simply issue the commands found in the following "shell script" file as if you typed them into the console. 

You could skip the creation of _sg.sh_ in the first place by simply issuing the command on the command line, like this:

    seq-gen -mHKY -l10000 -n1 -p1 -on < tree.txt > simdata.nex
    
I showed you how to store the command in a file because that provides a record of what you did and allows you to easily modify the command and run it again.

Note: if the _sg.sh_ file fails to run, it may be because the system cannot find the _seq-gen_ executable file. Try replacing `seq-gen` in the _sg.sh_ script with `$HOME/bin/seq-gen`. If this works, it means that something went wrong when you worked through the section on [Creating your own bin directory](/storrshpc/#creating-your-own-bin-directory) in the first lab of the semester. Feel free to ask one of us for help getting your _bin_ directory set up correctly.

> :thinking: Take a look at the file seq-gen generated. Can you explain why nearly every site shows evidence of substitution? (hint1: look at the branch lengths specified in the true tree)

{% comment %}
all 9 branch lengths are 1, which means that, on average, there will be 9 substitutions at every site over the entire tree, so it is not surprising that there are no constant sites.
{% endcomment %}

:large_blue_diamond: Modify your _sg.sh_ specifying a branch length scaling factor of 0.0001 and rerun it.

    seq-gen -mHKY -l10000 -n1 -p1 -on -s.0001 < tree.txt > simdata.nex

> :thinking: Take a look at the file seq-gen generated. How many sites would you expect to look at before seeing one that shows evidence of substitution? (hint: I'm not asking you to count constant sites! You can answer this using the true tree branch lengths and scaling factor)

{% comment %}
Now all 9 branch lengths are 0.0001, so we expect only 0.0009 substitutions per site over the tree, which translates to 1 substitution every 1111 sites.
{% endcomment %}

## Analyzing multiple simulated data sets

Ordinarily, simulation studies involve analyzing hundreds if not thousands of simulated data sets to make overall trends discoverable. Let's use seg-gen to generate several simulated data sets and analyze each with PAUP* under the parsimony and likelihood criteria.

:large_blue_diamond: Using nano, replace the contents of your _tree.txt_ file with the following single line:

    (A:0.05,B:0.05,(C:0.05,D:0.05):0.05)

:large_blue_diamond: Now, replace the first line of your _sg.sh_ file with this (note: only the first, uncommented line matters):

    seq-gen -mHKY -l1000 -n10 -p1 -on -x paupblock.txt < tree.txt > simdata.nex

:large_blue_diamond: Finally, use nano to create a file named _paupblock.txt_ with these contents:

    begin paup;
      set crit=parsimony;
      hsearch;
      savetrees file=parsimony-results.tre format=newick brlens append;
      set crit=likelihood;
      hsearch;
      savetrees file=likelihood-results.tre format=newick brlens append;
    end;

:large_blue_diamond: Run _sg.sh_ as before:

    . sg.sh
    
:large_blue_diamond: Use the `tail` command to see the last 30 lines of the file _simdata.nex_:

    tail -n 30 simdata.nex    

> :thinking: How many data sets did seq-gen simulate? (Hint: seq-gen reports this number in a comment after "Begin DATA;", but you may need to scroll up a bit to see it)

{% comment %}
10
{% endcomment %}

> :thinking: What part of the seq-gen command told it to generate this many data sets?

{% comment %}
-n10
{% endcomment %}

:large_blue_diamond: Run _simdata.nex_ in PAUP*:

    paup -L logfile.txt simdata.nex
    
You will need to type `q` at PAUP*'s prompt to get out of PAUP*.
    
Type `paup --help` to see what the command line switch `-L` does.

:large_blue_diamond: Download the two files _parsimony-results.tre_ and _likelihood-results.tre_ to your local laptop using either Cyberduck or the `scp` command. The `scp` command would look something like this (type this into a terminal on your **local laptop**):

    scp hpc:simlab/parsimony-results.tre .
    scp hpc:simlab/likelihood-results.tre .

{% comment %}
## Using rsync to copy whole directories 

If you want to learn about a command-line way to transfer an entire directory from the cluster to your laptop, read on!

in a terminal console **on your laptop**, type the following (be careful to enter this exactly as written: don't let your console automatically fill in a `/` character after `simlab`!):

    rsync -azPv hpc:simlab .
    
This will transfer the entire _simlab_ directory on the cluster to the current directory. The `rsync` program is very efficient, compressing each file before sending and then uncompressing it again on your laptop.

The reason I asked you to be careful is that placing a slash at the end of a directory name in an `rsync` command can be somewhat disastrous if you didn't intend to place the slash there. A slash on the end of a directory tells `rsync` to transfer just the **contents** of the directory, not the directory itself. So, if you had 1000 files in your _simlab_ directory on the cluster and you typed `hpc:simlab/` rather than `hpc:simlab`, you would end up with 1000 files dumped into your current directory instead of a single directory **containing** 1000 files.

If, for some reason, you wanted to copy a directory named _tmp_ from your local laptop to the cluster, your rsync command would be:

    rsync -azPv tmp hpc:
    
The first thing after the `-azPv` is the "from" location; the second thing is the "to" location. Using `hpc:` specifies that the location is on the remote cluster (the `hpc` part comes from the alias you set up in your _~/.ssh/config_ file, and the `:` separates the remote machine specification from the location relative to your home directory on the remote machine).
    
The `-azPv` part means:
* `a` archive mode (i.e. you want to recursively transfer everything under the target)
* `z` compress files being transferred (greatly speeds up the transfer)
* `P` keep partially transferred files and show progress during transfer
* `v` verbose mode (show what is happening)

You will always use these four options, so you may want to create an alias in your _.bashrc_ file (both on your local laptop and on the cluster) that keeps you from having to remember them:

    alias rsync='rsync -azPv'
    
With the alias in place, you can just type:

    rsync hpc:simlab .
{% endcomment %}
    
## How did parsimony and likelihood do?

:large_blue_diamond: Open _parsimony-results.tre_ in FigTree on your local laptop and flip through the trees.

> :thinking: How many trees obtained using the parsimony criterion have a topology identical to the true tree?

{% comment %}
10
{% endcomment %}

:large_blue_diamond: Open _likelihood-results.tre_ in FigTree on your local laptop and flip through the trees.

> :thinking: How many trees obtained using the likelihood criterion have a topology identical to the true tree?

{% comment %}
10
{% endcomment %}

## Long branch attraction and the Felsenstein zone

In addition to inventing the field of likelihood-based phylogenetics (Felsenstein 1981), Joe Felsenstein published an earlier paper in 1978 that created quite a stir for quite some time titled "Cases in which parsimony or compatibility methods will be positively misleading." This is the paper that first considered the phenomenon of **long branch attraction** (**LBA**).

Let's demonstrate LBA using simulation. 

:large_blue_diamond: Using nano, replace the contents of your _tree.txt_ file with the following single line:

    (A:0.5,B:0.05,(C:0.05,D:0.5):0.05)

:large_blue_diamond: Before going further, copy this tree description and paste it into FigTree to see what this tree looks like. 

The key is that this tree has two unrelated edges that are an order of magnitude longer than all other edges in the tree.

> :thinking: What split characterizes the true tree: AB\|CD, AC\|BC, or AD\|BC?

{% comment %}
AB|CD
{% endcomment %}

:large_blue_diamond: Replace the contents of your _sg.sh_ file with this (I've left out the comments this time):

    seq-gen -mHKY -l1000 -n1000 -p1 -on -x paupblock.txt -z12345 < tree.txt > simdata.nex

Note that I've set `-n1000` instead of `-n10` this time and have specified a random number seed `-z12345`. 

:large_blue_diamond: Replace the random number seed above with one of your choosing (try to think of one that no one else will think of) so that we all get different results. We can increase our sample size from 1000 to N*1000 by combining results from N people.

:large_blue_diamond: Run seq-gen to regenerate _simdata.nex_:

    . sg.sh

:large_blue_diamond: Before running _simdata.nex_ in PAUP*, delete your _logfile.txt_, _likelihood-results.tre_ and _parsimony-results.tre_ files so that we don't mix results from two different analyses:

    rm logfile.txt likelihood-results.tre parsimony-results.tre
    
:large_blue_diamond: Run PAUP* as before:

    paup -L logfile.txt simdata.nex

### How did likelihood fare?

This time, let's avoid the tedium of actually counting how many trees were estimated correctly by using PAUP*'s `treedist` command. 

You should still be in PAUP* (evidenced by the prompt `paup>`). If you quit paup, start it up again without specifying a data file by typing just `paup`.

:large_blue_diamond: Load the trees from _likelihood-results.tre_ into PAUP*:

    paup> gettrees file=likelihood-results.tre

PAUP* will probably ask you some questions at this point:
* Respond `y` to the question about increasing `maxtrees`
* Respond to the question about a new values for `maxtrees` by accepting the default (just hit Enter)
* Respond to the question about the action to take if this limit is hit by typing `2`

PAUP* will respond by saying `1000 trees read from file`.

{% comment %}
:large_blue_diamond: Take a look at the first tree in the file:

    paup> showtrees 1

NOTE: IF THIS SECTION IS EVER UNCOMMENTED, BE SURE TO ADD THIS QUESTION TO THE TEMPLATE
> :thinking: What split characterizes the first likelihood tree: AB\|CD, AC\|BC, or AD\|BC?

:large_blue_diamond: Calculate the Robinson-Foulds distance between that first tree and all the others in the file:

    paup> treedist reftree=1
    
You will see an RF distance of 0 for every focal tree that is identical to the reference tree (tree 1) and 2 for every tree that differs from the reference tree. The reason that the RF distance will be 2 is that it counts the number of splits in the reference tree that are not in the focal tree (i.e. 1) and adds to that the number of splits in the focal tree that are absent from the reference tree (i.e. 1) to give a sum of 2.
    
One problem  that trees with a distance of 2 may not all be the same. 

You can run `treedist` again with a different `reftree` to verify (or prove false) that all the 2s in the list are actually the same tree. For example:

    paup> treedist reftree=846
    
Using this method, tally the number of trees with each of the three possible splits.
{% endcomment %}

## Using the contree command to summarize splits

:large_blue_diamond: Start PAUP*, read in the trees from the _likelihood-results.tre_ file, and compute a majority-rule consensus tree (`majrule`) while turning off calculation of the default strict concensus (`nostrict`):

    paup
    paup> gettrees file=likelihood-results.tre
    paup> contree all / nostrict majrule
    
Note the table at the bottom of the output that summarizes all splits. Since these are 4-taxon trees, there is only one internal split per tree, so the numbers in this table equate to the number of trees having a particular topology.

> :thinking: How many likelihood trees were AB\|CD? AC\|BD? AD\|BC? (Make sure your numbers add up to the total number of trees.)

{% comment %}
I got:
    994 AB|CD
      1 AC|BD
      5 AD|BC
-------------
   1000 = 994 + 1 + 5
{% endcomment %}

### How did parsimony fare?

There are probably more than 1000 trees in _parsimony-results.tre_ because of ties (some simulated data sets will probably result in two or more trees with the same parsimony score). 

:large_blue_diamond: To prevent PAUP* from asking whether we want to increase `maxtrees`, let's change some settings:

    paup> set maxtrees=1000 increase=auto autoinc=200

:large_blue_diamond: Load the trees from _parsimony-results.tre_ into PAUP*:

    paup> gettrees file=parsimony-results.tre
    
PAUP* should respond by saying something like 

    Keeping: trees from file (replacing any trees already in memory)
    1012 trees read from file
      
(although your results may differ slightly). 

> :thinking: How many parsimony trees were AB\|CD? AC\|BD? AD\|BC? (Use the consensus tree approach again)

{% comment %}
I got:
     60 AB|CD
      0 AC|BD
    952 AD|BC
-------------
   1012 = 60 + 0 + 952
{% endcomment %}

> :thinking: Explain why this phenomenon is called long branch attraction.

{% comment %}
The true tree was AB|CD but edges leading to A and D were much longer than the others. Parsimony results in the AD|BC tree most of the time, incorrectly making the taxa at the ends of the two long edges sister taxa.
{% endcomment %}

## Is likelihood immune from LBA?

I don't want to leave you with the notion that likelihood is immune from problems such as LBA.

:large_blue_diamond: Revise your _sg.sh_ file to contain this seq-gen command:

    seq-gen -mHKY -l1000 -n1000 -p1 -t2.0 -on -x paupblock.txt -z12345 -a0.1 < tree.txt > simdata.nex
    
The only thing I've added is `-a0.1` which adds a considerable amount of among-site rate heterogeneity to the model used to simulate the data. This means that many sites will evolve very slowly but some sites will evolve very quickly (the overall mean rate is the same). We will not tell the likelihood model used by PAUP* about this rate heterogeneity, so the analysis model will assume that every site evolves under the same rate.

:large_blue_diamond: Run _sg.sh_ to generate _simdata.nex_ anew.
    
:large_blue_diamond: Be sure to delete or rename your _logfile.txt_, _likelihood-results.tre_, and _parsimony-results.tre_ files before running PAUP* and analyzing the results.

> :thinking: How many likelihood trees were AB\|CD? AC\|BD? AD\|BC when rate heterogeneity was present?

{% comment %}
I got:
    136 AB|CD
     14 AC|BD
    850 AD|BC
-------------
   1000 = 136 + 14 + 850
{% endcomment %}

> :thinking: Is likelihood susceptible to LBA if the model is incorrect in an important way?

{% comment %}
yes!
{% endcomment %}

# Literature Cited

Felsenstein, J. 1978. [Cases in which parsimony or compatibility methods will be positively misleading.](https://doi.org/10.1093/sysbio/27.4.401) Systematic Biology 27:401-410. 

Felsenstein, J. 1981. [Evolutionary trees from DNA sequences: a maximum likelihood approach.](https://doi.org/10.1007/BF01734359)  Journal of Molecular Evolution 17:368-376.

