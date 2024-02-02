---
layout: page
title: Week 3
permalink: /jcweek3/
---

## Goals

The goal this week is to learn how to use RevBayes to perform a Bayesian analysis of a data set. Last week you generated data sets with varying amounts of information and analyzed them with PAUP*, which finds the maximum likelihood (ML) tree. This ML tree is the best estimate, but this analysis doesn't tell you how much confidence you should have in any of the groupings in the tree. RevBayes, on the other hand, will generate a posterior sample of trees, which will tell you something about how confident you can be in the clades present in the best tree.

## RevBayes lab

Work through the first part of the [RevBayes lab](/revbayes/). Stop when you get to the section entitled "Adding rate heterogeneity"

* simulate data using JC model in seq-gen (show how)
* use your simulated data set instead of algaemb.nex
* use e.g. "A" rather than "Anacystis_nidulans" for outgroup
* datatype is DNA, not RNA
* might want to use a more appropriate name than "algae.tree" and "algae.log" in the monitor, treetrace, and map_tree commands, 
* how to get files back to your local computer from xanadu?
* show clade posteriors in FigTree
