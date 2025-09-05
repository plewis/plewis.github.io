---
layout: applet
title: Dirichlet Process Priors
author: Paul O. Lewis
permalink: /applets/dpp/
---
## Dirichlet Process Prior applet
Written by Paul O. Lewis (27-Mar-2020)

Instructions for how to use this applet are provided below the plot.

<br/>

## Description
Imagine the four coins (A, B, C, and D) have potentially different propensities for coming up heads on any given flip (you can set the true propensities for each coin using the drop-down controls). This applet demonstrates how you can use a Dirichlet Process Prior (DPP) to automatically cluster coins into groups. 

If all 4 coins have p = 0.5 and you flip them a sufficient number of times, the ABCD (all in one group) configuration should have the highest posterior probability. 

If coins A and B have p = 0.2 and coins C and D have p = 0.8, then (given sufficient flips) the configuration AB\|CD will have the highest probability. 

The concentration parameter alpha determines how much clustering is encouraged by the prior: small values of alpha lead to fewer groups, while large values of alpha encourage placing each coin in its own group.

Run the applet without data (all coins have n = 0) to see the prior (e.g. try changing alpha while n = 0). Now flip the coins a few hundred times to see the effect of information being added via the likelihood.

The small histogram in the lower right corner shows the distribution of p, the propensity to land heads on any given flip. This distribution is Beta(2,2) in the prior, but note how information in the data can easily make it bimodal or multimodal.

If you press the "Estimate alpha" button, the model becomes hierarchical with hyperparameter alpha, which now can be estimated. The hyperprior is Gamma(shape=1, scale=2), so if you are running without data (all coins have n=0) then alpha should hover around 2, the mean of its Gamma(1,2) hyperprior. Click the "Stop estimating alpha" button to return alpha to being fixed.

Notes: 
* If nothing seems to happen when you press the shortcut keys, click on the lavender plot box so that the app has the keyboard focus
* Hold down the shift key while using the arrow keys to modify alpha so that the browser does not scroll at the same time

## Acknowledgements

This applet makes use of the excellent [d3js](https://d3js.org/) javascript library. 
Please see the [GitHub site](https://github.com/plewis/plewis.github.io/tree/master/assets/js) for details about licensing of other libraries that may have been used in the source code for this applet.

## Licence

Creative Commons Attribution 4.0 International.
License (CC BY 4.0). To view a copy of this license, visit
[http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/) or send a letter to Creative Commons, 559
Nathan Abbott Way, Stanford, California 94305, USA.
