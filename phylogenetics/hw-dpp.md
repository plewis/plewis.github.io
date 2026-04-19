---
layout: page
title: Homework 13 (Dirichlet Process Prior)
permalink: /hwdpp/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

In this homework assignment you will use what you know about Dirichlet process priors to compute the (prior) probability of each possible clustering of 3 genes.

Assume that there are 3 genes (A, B, and C), and that a **Dirichlet process prior** governs the clustering of genes according to preferred tree topology. 

One possible configuration "seats" all 3 genes at the same "table" (using the restaurant metaphor). In this configuration, all 3 genes must share the same "dish" (i.e. tree topology).

The configuration at the opposite extreme seats each of the 3 genes at its _own_ table, and each table gets its own private tree topology. 

**Assuming $$\alpha = 9$$**, answer the following two questions (and show your work so I can figure out what happened if you get a different answer than me):

## Question 1

{% include figure.html description="Slide 6" url="/assets/img/dppprobs.png" css="image-right noborder" width="200px" %}

Calculate the prior probabilities of all possible configurations of the 3 genes under the Dirichlet process model. Note that slide 6 in the [April 9 lecture notes on the DPP model](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-04-09-dpp.pdf) provides everything you need to answer this question.

| configuration | probability |
| :-----------: | :---------: |
|      ABC      |             |
|     BC\|A     |             |
|     AC\|B     |             |
|     AB\|C     |             |
|    A\|B\|C    |             |

## Question 2

{% include figure.html description="Slide 9" url="/assets/img/dppexpectation.png" css="image-right noborder" width="200px" %}

What is the expected number of groups? (See slide 9 from the April 9 lecture notes.)



