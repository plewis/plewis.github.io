---
layout: page
title: Homework 6 (Bloodroot problem)
permalink: /hwbloodroot/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

## Background

You will analyze a (real) data set of five flowering plant sequences. Three sequences are from plants in the poppy family: _Sanguinaria_ (Bloodroot), _Eschscholzia_ (California Poppy), and _Bocconia_ (Tree Poppy). The remaining two sequences are from monocots: _Oryza_ (Rice, grass family) and _Disporum_ (Fairy Bells, crocus family). The 2 monocot taxa are quite distantly related to the 3 dicot taxa in the poppy family, so we expect the phylogeny to have an edge that separates _Sanguinaria_, _Eschscholzia_, and _Bocconia_ from _Oryza_ and _Disporum_.

## What to do

Download the following data file (sequence alignment) to your account on the cluster:

    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/bloodroot.nex

Carry out the following analyses using PAUP*:

* use the `alltrees` command to perform an exhaustive search using maximum likelihood (using the default model, which is HKY85 with trs:trv ratio 2 and empirical nucleotide frequencies);
* use the `lscores` command to obtain the log likelihood of the best tree; and 
* use the `bootstrap` command to perform a bootstrap analysis (1000 replicates). 

You should create a PAUP* nexus-formatted command file that carries out all three analyses (like the run.nex file we created in the first lab).

Do _all_ of the above for _each_ of these three sets of sites:

1. **Left half**: Include _only_ sites 1-180
2. **Right half**: Include _only_ sites 181-402
3. **Concatenated**: Include all sites (1-402)

To include only sites 181-402, for example, use the `exclude all` command followed by the `include 181-402` command in PAUP*. You can either do everything in one PAUP* command file or create three separate command files, one for analyzing the left half, the right half, and all sites.

## What to turn in

1. For each of the three analyses, draw (using your hand, not FigTree!) the bootstrap consensus as an _unrooted_ tree and show the bootstrap frequencies on the internal edges. To save writing, you can abbreviate the taxa as follows: **S** (_Sanguinaria_), **E** (_Eschscholzia_), **B** (_Bocconia_), **O** (_Oryza_), and **D** (_Disporum_).

2. Add together the log-likelihoods for the "left half" and "right half" and compare it to the log-likelihood from the "concatenated". Is the data less surprising if you allow each half of the gene to have its own tree topology _or_ is the data less surprising if all sites share the same topology?

3. Which of the 3 bootstrap analyses yields the highest confidence (sum the two bootstrap values)? Does this agree or disagree with your answer for question 2?

4. To make it easier for me to determine what you did, please send me your PAUP* command file. If you have created more than one command file, please put them in a directory and create a zip file of that directory.

## Food for thought

Think about how you might go about explaining these results. You do not need to tell me your thoughts: we will discuss this in lecture after everyone has finished it.
