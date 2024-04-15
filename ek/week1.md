---
layout: page
title: Week 1 (April 15-19, 2024)
permalink: /ekweek1/
---

### Instructions for this week

1. Login to your cluster account that we use for phylogenetics.

2. Create a directory named _mcmcmc_ to use for this project

3. Download the _DS1.nex_ data file (disregard the data set I AirDropped to you on Monday)

        curl -u <username> -O https://gnetum.eeb.uconn.edu/projects/mcmcmc/DS1.nex
    
    I will send you the username (which you should use in place of `<username>` above) and password via email. You will be prompted for the password once you issue the `curl` command. Note that the computer will not show you what you type when entering the password; this is to prevent someone from looking over your shoulder while you are typing and stealing your password. Thus, you'll have to just trust in your typing skills!
    
4. Carry out the analysis in the [RevBayes lab done in Phylogenetics class on March 21](/revbayes/). See note below before you start.

### Notes

You might want to change file names in the RevBayes script from "algae" to "ds1" to avoid confusion. For example, change 

    monitors.append( mnFile(psi, filename="output/algae.trees", printgen=1) )
    
to

    monitors.append( mnFile(psi, filename="output/ds1.trees", printgen=1) )


In the "Clade posteriors" section of the lab, you can replace the "chlorophyllb" clade definition with these lines:

    # Calculate the	posterior probability of a diagnostic clade in the tree of Figure 4a
    # of Whidden and Matsen (2015) DOI:10.1093/sysbio/syv006
    fig4a <- clade("Hyla_cinerea", "Bufo_valliceps", "Nesomantis_thomasseti", "Eleutherodactylus_cuneatus", "Gastrophryne_carolinensis")
    treetrace.cladeProbability( fig4a )
    
    # Calculate the	posterior probability of a diagnostic clade in the tree of Figure 4b
    # of Whidden and Matsen (2015) DOI:10.1093/sysbio/syv006
    fig4b <- clade("Ambystoma_mexicanum", "Siren_intermedia", "Typhlonectes_natans", "Discoglossus_pictus")
    treetrace.cladeProbability( fig4a )

The "fig4a" and "fig4b" refer to the two trees shown in Figure 4 in the Whidden and Matsen (2015) paper:

> C Whidden and FA Matsen IV. 2015. Quantifying MCMC exploration of phylogenetic tree space. Systematic Biology 64(3):472-491. [DOI:10.1093/sysbio/syv006](https://doi.org/10.1093/sysbio/syv006)

Without using Metropolis-coupling (i.e. multiple robots), I'm assuming that on any given run, either the "fig4a" or "fig4b" clade will have high posterior probability, but not both.

One important thing to consider: RevBayes will combine posterior samples from the four independent runs into one tree file because of the "combine" setting in this line:

    mymcmc = mcmc(mymodel, monitors, moves, nruns=4, combine="sequential")
    
If you analyze that combined file, it may be difficult to tell whether the individual runs are getting stuck on one peak. For example, if RevBayes gets stuck on the A peak in 2 runs and the B peak in the other 2 runs, then combining the results will make it appear that RevBayes did not get stuck at all! You should therefore be sure to analyze one run at a time when computing the marginal posterior for clade "fig4a" and "fig4b".

Let us know if you get stuck or have questions.

