---
layout: page
title: Simulate data with topology homogeneity but edge length heterogeneity
permalink: /hw13/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

Simulate a data set comprising 10,000 sites in which the topology is identical for all sites but half the sites have one set of edge lengths and the other set have a very different set of edge lengths. The two model trees are shown below:

{% include figure.html description="The model trees to use for tree1.txt and tree2.txt" url="/assets/img/heterotachy.png" css="image-center noborder" width="500px" %}

## Compiling the seq-gen program

We'll use Andrew Rambaut's classic simulation program seq-gen to simulate the data. Unfortunately, seq-gen is not available as a module on the cluster, so you will have to compile it from source code in your home directory. 

Login to the Xanadu cluster and curl the source code file to your home directory using this command:

    curl -OL https://github.com/rambaut/Seq-Gen/archive/refs/tags/1.3.4.tar.gz
    
(I found this URL by going to [Andrew Rambaut's seq-gen GitHub page](https://github.com/rambaut/Seq-Gen), which I discovered by Googling **seq-gen rambaut**, and clicking on the link for the latest release on the right side of the main page.)

Note that I had to add an L to the usual O in my curl command. The L command line switch tells curl to follow any redirects, which is important because the URL on the GitHub page does redirect to a different URL and, without the L, curl will simply download the HTML code for the redirect rather than the 1.3.4.tar.gz file. Remember to try using the L switch if you ever have trouble using curl to download a file.

Unpack the gzipped tar file as follows:

    tar zxvf 1.3.4.tar.gz
    
This will create a directory named _Seq-Gen-1.3.4_. Navigate into the _source_ subdirectory of the _Seq-Gen-1.3.4_ directory using the cd command:

    cd Seq-Gen-1.3.4/source

Make sure you have the gcc C compiler loaded:

    module load gcc/10.2.0
    
If you issue an ls command, you will see a file named _Makefile_ in that _source_ directory. A makefile provides all the information needed to compile the source code into a working executable file. To start the process, simply type make the prompt:

    make
    
You may see some warnings, but you should get no errors, and, after the make command finishes, you should find a new file names _seq-gen_ in that directory. 

Create a subdirectory in your home directory for this homework exercise and copy the seq-gen executable file to that directory (and then navigate to that directory):

    mkdir ~/hw13
    cp seq-gen ~/hw13
    cd ~/hw13

## Simulating a data set

Now simulate two data sets, one using each tree above. You will need to create two text files, _tree1.txt_ and _tree2.txt_, each encoding one of the two trees above. **Both of these files should contain just one line**, and that line should be a newick tree description with edge lengths specified. 

Here is an example (but **don't use this** because it does not represent either of the two model trees):

    (A:1.0,B:1.0,((C:1.0,D:1.0):1.0,(E:1.0,F:1.0):1.0):1.0)
    
Copy the following two lines to a file named _sg.sh_:

    ./seq-gen -mHKY -l5000 -n1 -p1 -f 0.25 0.25 0.25 0.25 -t0.5 -z13579 -on < tree1.txt > sim1.nex
    ./seq-gen -mHKY -l5000 -n1 -p1 -f 0.25 0.25 0.25 0.25 -t0.5 -z13579 -on < tree2.txt > sim2.nex
    
Here is a seq-gen cheat sheet that can serve as a key to the options we used (note that we are using default values for some of these):

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
    # -s0.0001                    branch length scaling factor

To carry out the simulation, source the _sg.sh_ file as follows:

    source sg.sh
    
Note: the period character serves as a shortcut for the word source, so you could also type this shorter version:

    . sg.sh
    
Both commands above simply treat the lines in your _sg.sh_ file as if you typed them into the command line directly.

Combine the two files into one file named _sim.nex_. Copy _sim1.nex_ to _sim.nex_, load _sim.nex_ into nano (or bring it back to your laptop and use BBedit or Notepad++). You need to insert the second block of simulations (from _sim2.nex_ into the matrix to create a file that has this basic structure:

    #NEXUS
    Begin DATA;
        Dimensions NTAX=4 NCHAR=10000;
        Format MISSING=? GAP=- DATATYPE=DNA interleave;
        Matrix
    A TAGCT...T
    B AACCA...A
    C ACACG...G
    D AACCA...A

    A TACCG...G
    B CTTGT...T
    C AAACC...G
    D GGGCA...A
        ;
    END;

I've eliminated the comment [enclosed by square brackets] inserted by seq-gen and used elipses (<tt>...</tt>) to represent all but 5 sites in each sequence. 

Note the word **interleave** that I've added to the **Format** statement. That allows us to easily create a data matrix that has two separate parts without manually having to add each sequence from _sim2.nex_ to the end of the corresponding sequence from _sim1.nex_.

Note also that I've changed the **<tt>NHAR=5000</tt>** to **<tt>NCHAR=10000</tt>**.

Finally, obtain a maximum likelihood tree from this concatenated data set in _sim.nex_ using paup. You will need to create a second nexus file (name it _paup.nex_) containing a paup block that includes a command **<tt>exe sim.nex</tt>** to load the sequence data.

Your paup block should use the **<tt>alltrees;</tt>** paup command to do an exhaustive search. Be sure to (earlier) **<tt>set crit=like;</tt>** so that you perform a maximum likelihood search rather than parsimony search. Also, just use a JC69 model (that's the model we used when we simulated the data): **<tt>lset nst=1 basefreq=equal rates=equal;</tt>**. You can ask PAUP\* to show you the tree using the **<tt>describetree 1 / plot=phylogram brlen;</tt>** command.

## What to turn in

Please send me all 5 files you created:

    tree1.txt
    tree2.txt
    sg.sh
    sim.nex
    paup.nex
    
I prefer having these all packaged into one zip file, but, if you don't know how to do this, feel free to send me an email with 5 attached files.

Also, please answer this question as best you can (we haven't yet talked about this problem, but I want you to think about it before I talk about it in lecture):

> :thinking: Why was the estimated tree topology incorrect? What was it about the simulated data that caused maximum likelihood to be misled? After all, we simulated all data on the same topology and all sites were simulated using the JC69 model!




