---
layout: page
title: Homework 9 (Dirichlet Process Prior)
permalink: /hwdpp/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

In this homework assignment you will use what you know (from the lecture on March 10) about Dirichlet process priors to compute the probability of each possible clustering of 3 genes.

Assume that there are 3 genes (A, B, and C), and that a **Dirichlet process prior** governs the clustering of genes according to preferred tree topology. 

One possible configuration seats all 3 genes at the same "table" (using the restaurant metaphor). In this configuration, all 3 genes mush share the same topology.

The configuration at the opposite extreme seats each of the 3 genes at its own table, and each table gets its own private tree topology. Note that the same "dish" (tree topology) can be served at different tables, so it is possible that all 3 genes share one topology despite sitting at different tables.

**Assuming $$\alpha = 3$$**, answer the following two questions (and show your work so I can figure out what happened if you get a different answer than me):

## Question 1

Calculate the prior probabilities of all possible configurations of the 3 genes under the Dirichlet process model. Note that slide 7 in the March 10 lecture notes provides almost everything you need to answer this question.

| configuration | probability |
| :-----------: | :---------: |
|      ABC      |             |
|     BC\|A     |             |
|     AC\|B     |             |
|     AB\|C     |             |
|    A\|B\|C    |             |

## Question 2

What is the expected number of groups? (See slide 12 from the March 10 lecture notes.)



