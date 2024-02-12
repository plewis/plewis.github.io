---
layout: page
title: IQ-TREE Lab
permalink: /iqtree/
---
[Up to the Phylogenetics main page](/phylogenetics2024/)

## Goals

Today you will continue learning about maximum likelihood inference and will learn to use a program (IQ-TREE) known for its speed and ability to handle large-scale phylogenetic analyses. 

## Objectives

After completing this lab, you will be able to...
* estimate a (potentially large) phylogeny using IQ-TREE 
* obtain Ultrafast Bootstrap support values for the splits in the tree
* use IQ-TREE to find loci that conflict with other loci, suggesting paralogy, horizontal transfer, etc.

## Getting started

Login to your account on the Health Center (Xanadu) cluster

    srun --qos=mcbstudent --partition=mcbstudent --pty bash
    
to start a session on a node that is not currently running jobs. Once you see the prompt, type

    module load iqtree/2.2.2
 
to load the iqtree module. (How did I know to type "iqtree/2.2.2"? Use the command "module avail" to see a list of all modules.)

## About IQ-TREE

IQ-TREE is known for its speed and ability to handle large nucleotide or protein datasets. It's main competitor is RAxML, which is also an excellent choice. We don't have time to introduce you to every program that does phylogenetics, or even every important program that does phylogenetics. I've chosen IQ-TREE over RAxML mainly because it has [truly excellent documentation](http://www.iqtree.org/doc/). The explanation of options for this software is far better than for most other programs you will use this semester, and you can learn a lot about phylogenetics just looking up how to do things with IQ-TREE!

{% comment %}
## Download the beta version too

The tutorial we will be using today requires a later version of IQ-TREE than any version currently installed on the Xanadu cluster. The proper thing to do under most circumstances is to use the software request form from the _Contact Us_ section of the [Computational Biology Core](https://bioinformatics.uconn.edu/) site to request that it be installed for everyone to use (it would become a new module that anyone could load). However, sometimes you need to just get an analysis done and would prefer to have access to the software immediately (perhaps to just see if it is useful). For this reason, it is good to know how to install and run software in your own home directory, accessible only by you.

Download version 2.0-rc1 of IQ-TREE as follows from your home directory on Xanadu:

    curl -LO https://github.com/Cibiv/IQ-TREE/releases/download/v2.0.6/iqtree-2.0.6-Linux.tar.gz

curl -LO https://github.com/Cibiv/IQ-TREE/releases/download/v2.0-rc1/iqtree-2.0-rc1-Linux.tar.gz

The curl ("copy url") command is a convenient way to download files from a web site into your current directory on the cluster. The **L** switch may not be necessary, but sometimes helps if the URL is an indirect reference to the file. The **O** (capital letter o, not zero) switch tells curl to save the file using the original file name (i.e. the name at the end of the URL, in this case _iqtree-2.0.6-Linux.tar.gz_).

Unpack the downloaded "tape" archive file using the tar command:

    tar zxvf iqtree-2.0.6-Linux.tar.gz
 
TAR files are single files containing the contents of an entire directory (or hierarchy of directories). Files in the original directory are simply concatenate into one big file (along with the information about what directory/subdirectory the file was in). The **z** tells tar to uncompress the file first (necessary because it has been compressed, as indicated by the _gz_ file ending). The **x** tells tar to extract the file (**c** means create, but we are not creating a tar file, we are instead **x** tracting one). The **v** tells tar to be verbose and tell us the name of each file as it is extracted. Finally, **f** says that the name of the tar file is the next thing to expect on the command line.

The executable file is now in the

    ~/iqtree-2.0.6-Linux/bin
    
directory, where **~** means "home directory" and is a synonym of <tt>$HOME</tt>, which is itself a synonym of the actual path of your home directory (something like _/home/CAM/plewis_). To make the new version of iqtree easy to access, and to give it a name consistent with the name used in the tutorial, execute this command:

    alias iqtree-beta="$HOME/iqtree-2.0.6-Linux/bin/iqtree2"
 
This will create an alias named _iqtreebeta_ so that when you type <tt>iqtree-beta</TT> on the command line it will be replaced by _~/iqtree-2.0.6-Linux/bin/iqtree2_. This alias will only be available to you while you are logged in; it will be lost when you logout. If you want it to be permanent, edit (using nano) the file _~/.bash_profile_ and place the alias command anywhere in the file (but on a line by itself. Now the alias will be automatically recreated every time you login.
{% endcomment %}

## Start the tutorial 

The tutorial below is modeled after [the one written by Bui Minh](http://www.iqtree.org/workshop/molevol2023) (one of the main developers of IQ-TREE) for the 2023 Woods Hole Workshop in Molecular Evolution. 

{% comment %}
**Important** The workshop that this tutorial was written for used version 2.2.2.6 and included some instructions in section "1) Input data" that don't apply to us. Just use the links provided to download the data files (_turtle.fa_ and _turtle.nex_) directly. You can either use the `curl` command to download these files directly to the Xanadu cluster or, alteratively, download the files to your laptop and use Cyberduck to move them to Xanadu.
{% endcomment %}

## Create a directory for today

Create a new directory named, for example, `iqlab` to store data and output files for today's lab. Navigate into the `iqlab` directory using the `cd` command.

## Download the data

Start by  file (`turtle.fa`) and partition file (`turtle.nex`) that we will be analyzing today:

    curl -O http://www.iqtree.org/workshop/data/turtle.fa
    curl -O http://www.iqtree.org/workshop/data/turtle.nex
    
## Background and goal of this lab

We will use these data to infer relationships between three familiar groups: turtles (T), crocodiles (C), and birds (B). There are three possibile rooted trees for the three taxa: ((C,B),T), ((T,B),C), or ((T,C),B). I will refer to these three hypotheses simply by the taxa that are sister to each other: i.e. (C,B), (T,B), and (T,C).

The file `turtle.fa` contains the actual sequence data. It is in [FASTA format](https://en.wikipedia.org/wiki/FASTA_format), which is very simple: the data for each taxon begins with a separate line beginning with a greater-than symbol (`>`) followed by the taxon name and sometimes other information. The sequence data for that taxon begins on the next line and continues over possibly several lines until the end of the file or another `>` is encountered.

The file `turtle.nex` is a NEXUS format file but does not contain sequence data! Instead this file contains only a `sets` block with `charset` statements showing the range of sites corresponding to each of the 29 gene loci.

These data represent a small subset of the 248-locus, 16-taxon data from [Chiari et al. 2012](https://doi.org/10.1186/1741-7007-10-65), who concluded that their data "...unambiguously support turtles as a sister group to birds and crocodiles" (i.e. (B,C)) however they found that (T,C) was supported by "more simplistic" models and attributed this artifactual grouping to substitutional saturation at 3rd codon positions.

During the lab today, you will discover that a couple of loci tell a different story than the others and are responsible for the tendency to get the artifactual (T,C) grouping under common models. The fact that these loci are paralogs was discovered by [Jeremy Brown and Robert Thomson in 2017](https://doi.org/10.1093/sysbio/syw101). 

Let's try to figure out which two loci are the paralogs. Start by reminding yourself of the difference between paralogs and orthologs and why unknowingly mixing paralogs and orthologs can be misleading (see slides 38 and 40 in the [first lecture](https://gnetum.eeb.uconn.edu/courses/phylogenetics/01-intro-annotated.pdf)).

{% comment %}
"While examining the distribution of BF values for turtle placement (Fig. 4), we were struck by two outlying genes in the Chiari et al. (2012) data set that strongly supported the placement of turtles as sister to crocodilians. These outlying values were notable both because of their large magnitude (2ln(BF) 130) and because the full data set of Chiari et al. (2012) prefers a placement of turtles sister to crocodilians under standard models of sequence evolution" -- Brown and Thomson 2017
 
paralogs support        (T,C),B
whole dataset supports  (T,C),B under standard models
Chiari et al. concluded (B,C),T using species tree methods
Chiari et al. thought (T,C) under simple models was due to saturation at 3rd positions
 
"While exploring the distributions of 2ln(BF) values across genes, we noticed that two genes in the data set of Chiari et al. (2012) seemed to be strong outliers in the strength of their support for a sister relationship between crocodilians and turtles (alignments ENSGALG00000008916 and ENSGALG00000011434)." -- Brown and Thomson 2017
{% endcomment %}

## Estimate the tree and degree of support for groups

Use this command to estimate the tree using maximum likelihood criterion:

    iqtree2 -s turtle.fa -B 1000 -nt AUTO

Here is a key to the settings we chose on the command line:

* `-s` specifies that the sequence data is in the file `turtle.fa`
* `-B` says to perform 1000 ultrafast bootstraps
* `-nt AUTO` says to figure out automatically how many threads to use

A **node** in a cluster is a machine that may have multiple **cores**, where a core is a single processor. By specifying `-nt AUTO`, IQ-TREE will use as many cores as possible on the node that you were assigned using the `srun` command. Using more than one thread can speed up the analysis by doing computations that are independent of one another in parallel (i.e. simultaneously on different processors). If you leave off the `-nt` specification, IQ-TREE will tell you in its output how many threads it could have used, but will just use 1 of them.

The `-B` setting tells IQ-TREE to assess support for individual edges (splits) using ultrafast bootstrapping. We will discuss what bootstrapping is in lecture (and how ultrafast bootstrapping differs from standard bootstrapping), but, for now, just know that this option will end up assigning a value to each edge in the summary consensus tree that tells you how plausible that edge is. Edges with ultrafast bootstraps > 95 are strongly supported, values smaller than that are more questionable.


