---
layout: page
title: Homework 6
permalink: /hw6/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

## Simulation

Your challenge for this homework assignment is to simulate data for a single nucleotide site under an F81 model on the tree shown below.

![The model tree](/assets/img/simulation-homework-model-tree.png)

Assume that the nucleotide frequencies are:

$$\pi_A=0.1, \pi_C=0.3, \pi_G=0.4, \pi_T=0.2$$

{% comment %}
![Nucleotide relative frequencies](/assets/img/simulation-homework-freqs.png)
{% endcomment %}

The rate matrix for the F81 model is shown below:

$$Q = \left( \begin{array}{cccc}
-(1-\pi_A) \beta &      \pi_C \beta &      \pi_G \beta &      \pi_T \beta \cr
     \pi_A \beta & -(1-\pi_C) \beta &      \pi_G \beta &      \pi_T \beta \cr
     \pi_A \beta &      \pi_C \beta & -(1-\pi_G) \beta &      \pi_T \beta \cr
     \pi_A \beta &      \pi_C \beta &      \pi_G \beta & -(1-\pi_T) \beta
\end{array} \right)$$

{% comment %}
![F81 rate matrix](/assets/img/simulation-homework-f81.png)
{% endcomment %}

The edge lengths (in expected number of substitutions) are given on the tree. 

The expected number of substitutions per site is the total substitution rate multiplied by time. The total substitution rate is a weighted average of the total substitution rate away from each nucleotide state, where the weights are provided by the nucleotide frequencies:

{% comment %}
![expected number of substitutions](/assets/img/simulation-homework-v.png)
{% endcomment %}

This allows us to obtain a formula for 