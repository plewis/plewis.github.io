---
layout: page
title: Homework 8 (Bloodroot problem)
permalink: /hwbloodroot/
---
[Up to the Phylogenetics main page](/phylogenetics2024/)

This homework is due the Tuesday after Spring Break, March 19.

## Background

You will analyze a (real) data set of five flowering plant sequences. Three sequences are from plants in the poppy family: _Sanguinaria_ (Bloodroot), _Eschscholzia_ (California Poppy), and _Bocconia_ (Tree Poppy). The remaining two sequences are from monocots: _Oryza_ (Rice, grass family) and _Disporum_ (Fairy Bells, crocus family). The 2 monocot taxa are distantly related to the 3 dicot taxa in the poppy family.

## What to do

Download the following data file (sequence alignment) to your account on the cluster:

    curl -O https://gnetum.eeb.uconn.edu/courses/phylogenetics/hw8.nex

Load the `paup/4.0a-166` module. The analyses you will carry out comprise:

* using the `alltrees` command to perform an exhaustive search using maximum likelihood (using the default model, which is HKY85 with trs:trv ratio 2 and empirical nucleotide frequencies);
* using the `lscores` command to obtain the log likelihood of the best tree; and 
* using the `bootstrap` command to perform a bootstrap analysis (1000 replicates). 

Do _all_ of the above for _each_ of these three sets of sites:

1. **Left half**: Include _only_ sites 1-180
2. **Right half**: Include _only_ sites 181-402
3. **Concatenated**: Include all sites (1-402)

## What to turn in

1. For each of the three analyses, draw (using your hand, not FigTree!) the bootstrap consensus as an _unrooted_ tree and show the bootstrap frequencies on the internal edges. To save writing, you can abbreviate the taxa as follows: **S** (_Sanguinaria_), **E** (_Eschscholzia_), **B** (_Bocconia_), **O** (_Oryza_), and **D** (_Disporum_).

2. Add together the log-likelihoods for the "left half" and "right half" and compare it to the log-likelihood from the "concatenated". Is the data less surprising if you allow each half of the gene to have its own tree topology _or_ is the data less surprising if all sites share the same topology?

3. Which of the 3 bootstrap analyses yields the highest confidence? Does this agree or disagree with your answer for question 2?

## Food for thought

Think about how you might go about explaining these results. You do not need to tell me your thoughts: we will discuss this in lecture after everyone has finished it.
