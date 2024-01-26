---
layout: page
title: Jessica Week 2
permalink: /jcweek2/
---

## Goals

The goal this week is to become comfortable simulating sequence data, estimating a phylogeny from the simulated data, and seeing what effect the amount of phylogenetic information in the data has on your ability to reconstruct the phylogeny accurately.

## Simulation

Work through the first part of the [simulation lab](/simulation/). Stop when you get to the section entitled "Using PAUP* to perform simulation experiments."

## Obtaining the maximum likelihood tree for simulated data

Go back to the [Introduction to PAUP*](/paup/) lab and recall how to load a data file into paup and perform an exhaustive search (using the `alltrees` command). You will need to set the optimality criterion to likelihood using the `set criterion=likelihood` command before calling `alltrees`. 

## Experiment

Using the scaling factor in SeqGen, create a series of data sets in which the scaling factor starts at 1.0 and get smaller by one order of magnitude. For example, start with 1.0, then 0.1, then 0.01, then 0.001, and so on. For each of these scaling factors, simulate a data file with 1000 sites (note that the instructions are for 10000 sites, so you will need to change that).

How small does the scaling factor need to be before the tree returned by PAUP* starts to be either unresolved or incorrect?

Now create a second series of simulated data sets in which the scaling factor gets larger by orders if magnitude: 1, 10, 100, 1000, etc. How far can you go before things break down in this direction?

Can you explain what happens at very small or very large scaling factors? Think about possible explanations and we will talk about this when we meet next week.
