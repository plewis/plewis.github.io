---
layout: page
title: RevBayes Lab
permalink: /revbayes2/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

## Goals

This lab exercise will continue introducing you to [RevBayes](https://revbayes.github.io).

One of today's goals is to determine whether an MCMC analysis converged. An MCMC analysis is said to have converged if it mixed well and independent runs resulted in statistically indistinguishable posterior samples. We will use the R software package "convenience" to assess convergence.

The [RevBayes part 1](/revbayes1/) lab left you with a cliff-hanger ending: the chlorophyll-b clade had a very low (almost zero) marginal posterior probability. We know from the [likelihood lab](/likelihood/) that we must get important aspects of the model correct in order to recover the chlorophyll-b clade. We will thus also be estimating marginal likelihoods to help in choosing an appropriate model.

## Template

Here is the template to use for recording your answers to the :thinking: thinking questions.

    1. Did your JC run converge or fail to converge?
    answer:
    
    2. What is the log marginal likelihood for the JC model estimated by steppingstone sampling?
    answer:
    
    3. What is the log marginal likelihood estimated for the JC model by path sampling?
    answer:
    
    4. What is the log marginal likelihood estimated for the JC+I+G model by steppingstone sampling?
    answer:
    
    5. What is the log marginal likelihood estimated for the JC+I+G model by path sampling?
    answer:
    
    6. Does the JC+I+G model fit the data better on average than the JC model? Why did you conclude this?
    answer:
    
    7. What is the posterior probability of the chlorophyll b clade now that we've accommodated rate heterogeneity?
    answer:
    
    8. Why do we need to make Qmatrix a deterministic node in the GTR model rather whereas we used a constant node in the JC model?
    answer:
    
    9. What is the posterior probability of the chlorophyll b clade under the GTR+I+G model?
    answer:
    
    10. What is the log marginal likelihood of the GTR+I+G model using steppingstone and path sampling?
    answer:
    
    11. Does the GTR+I+G model fit better or worse than the JC+I+G model?
    answer:
    
    12. How many additional parameters does the GTR+I+G model have compared to the JC+I+G model? (Please list the added parameters, don't just provide the number)
    answer:
    
## Getting started

:large_blue_diamond: Login to your account on the Storrs HPC cluster and start an interactive slurm session:

    ssh hpc
    srun -p general -q general --mem=5G --pty bash
        
**Important** The `--mem=5G` part is important for this lab, as RevBayes uses more than the default amount (128 MB) of memory sometimes.

You may wish to update your `gensrun` alias by opening the _.bashrc_ file in your home directory:

    nano ~/.bashrc
    
and replacing the gensrun alias with the following:

    alias gensrun='srun -p general -q general --mem=5G --pty bash'
    
Save the _.bashrc_ file so that the next time you need an interactive node you can simply type:

    gensrun
        
## Create a directory

:large_blue_diamond: Use the unix `mkdir` command to create a directory to play in today:

    cd
    mkdir rblab2

## Copy the RevBayes executable to your _bin_ directory

You copied the _rb132_ executable into your bin directory in the [previous lab](/revbayes1/), but, as it turns out, **you need to do it again**:

:large_blue_diamond: copy _rb132_ to your _bin_ directory (overwriting the version you copied last time):

    cd 
    cp /scratch/pol02003/pol02003/rb132 ~/bin
    
The reason for this is obscure, but let's just say it will save a lot of headaches if you use this new build of RevBayes, which plays nicely with the runtime libraries used by R.
    
## Load module needed

:large_blue_diamond: The RevBayes executable file needs some runtime libraries that can be loaded using the module system. Since we will also be using R on the cluster, and since loading the R module also loads the runtime library needed by rb132, we can just go ahead and load the R module:

    module load r/4.3.2

:large_blue_diamond: You should now be able to type **rb132** to start the program:

    RevBayes version (1.3.2)
    Build from tags/v1.3.2 (rapture-4486-g3d84ac) on Sat Feb 28 11:57:57 EST 2026
    
    Visit the website www.RevBayes.com for more information about RevBayes.
    
    RevBayes is free software released under the GPL license, version 3. Type 'license()' for details.
    
    To quit RevBayes type 'quit()' or 'q()'.
    
## Copy the data file and Rev script

:large_blue_diamond: Copy the data file and Rev script from last week's lab to your new folder as follows:

    cd ~/rblab2
    cp ../rblab/algae.nex .
    cp ../rblab/jc.Rev .
    
The dot (`.`) on the end of that last line is important, as is the space before it. That lines says to copy the _algae.nex_ file from the _rblab_ directory (the `..` means to back up one level in the directory hierarchy) to the current directory (`.`).

If you've wiped out your folder from the likelihood lab, never fear! I have put copies in the scratch directory:

    cd ~/rblab2
    cp /scratch/pol02003/pol02003/algae.nex .
    cp /scratch/pol02003/pol02003/jc.Rev .
    
## Creating a RevBayes script

Let's begin with the **RevBayes script** you ended with in the [first RevBayes lab](/revbayes1/). 

:large_blue_diamond: Open your _jc.Rev_ file in nano and ensure that the `mymcmc.burnin` and `mymcmc.run` commands are not commented out:

    nano jc.Rev
    
:large_blue_diamond: Now run this script in RevBayes as follows:

    rb132 jc.Rev
        
### Test for convergence

To test for convergence, we will use the "convenience" R package. There is a tutorial covering the use of this package on the [RevBayes web site](https://revbayes.github.io/tutorials/convergence/), but you need not refer to that tutorial because I will show you how to use it below.

Ordinarily, you would need to install the convenience package in R, but (as I discovered writing this lab), this takes a very long time because all the R packages that convenience depends upon must also be installed. 

To save time, I have installed the convenience package and saved the resulting R library as a compressed "tape archive" (lovingly known as a "tarball") in the scratch directory; you need only copy it to your home directory, uncompress it, and then tell R how to find it.

:large_blue_diamond: Copy the tarball to your home directory (the `cd ~` command just ensures you are in your home directory):

    cd ~
    cp /scratch/pol02003/pol02003/rlib.tar.gz .
    
:large_blue_diamond: Uncompress the tarball:

    tar zxvf rlib.tar.gz
    
This will create a directory named _rlib_ in your home directory.

:large_blue_diamond: Tell R how to find the libraries (**Important!** replace `/home/pol02003` with your home directory):

    export R_LIBS="/home/pol02003/rlib"

The `R_LIBS` above is known as an "environmental variable". R will see if this variable is defined when it starts up and will use the directory provided when looking for packages that you wish to load.

:large_blue_diamond: Navigate back to your _rblab2_ directory:

    cd ~/rblab2

:large_blue_diamond: You should now be able to start R:

    R

:large_blue_diamond: Type the following at the R prompt (`>`) to load the library:

    > library(convenience)
    
:large_blue_diamond: Type the following command at the R prompt to run the convergence check:

    > checkConvergence("output/")
    
> :thinking: Did your JC run converge or fail to converge?
    
:large_blue_diamond: Type the following command at the R prompt to run the convergence check again:

    > checkConvergence("output/", control=makeControl(namesToExclude="Iteration|Likelihood|Posterior|Prior|edge_length"))
    
This time it should have concluded that the run converged. The only thing we did differently this time was to specify that the checkConvergence function was to ignore the "edge_length" columns in the output log file when determining convergence. We actually told it to ignore several additional columns ("Iteration", "Likelihood", "Posterior", and "Prior") but it ignores these by default.
    
Why must we ignore edge lengths? This seems like cheating, but there is a good reason why at least some edge lengths will not appear to have converged. During the MCMC run, the tree topology frequently changes. While the _number_ of edge length parameters remains the same, the _meaning_ of some edge length parameters changes when the topology changes. The edge lengths are arbitrarily numbered, and so edge length 23 is sometimes referring to the the edge corresponding to one split and at other times it refers to the edge corresponding to a completely different split! The low effective sample sizes (ESSs) for some edge lengths simply means that these are the edges that are changing their definitions when the topology changes. We thus need to exclude edge lengths from consideration of convergence unless we have fixed the topology during the run. If the topology were fixed, the meanings of edge lengths would remain the same throughout the run.

:large_blue_diamond: You can now exit R by typing

    q()
    
### Steppingstone marginal likelihood estimation

Let's estimate the log marginal likelihood for the model we've been using to get a baseline for comparison. In a few minutes, we will add rate heterogeneity to our model, and we will estimate the log marginal likelihood again to see we have improved the fit of the model by adding rate heterogeneity. 

There is a tutorial covering marginal likelihood estimating on the [RevBayes web site](https://revbayes.github.io/tutorials/model_selection_bayes_factors/bf_intro.html), but you need not refer to that tutorial now because I will walk you through it in this lab exercise.
    
:large_blue_diamond: Load your _jc.Rev_ file into nano for editing:

    nano jc.Rev
    
:large_blue_diamond: Add the following **after** you set up the monitors but **before** creating the `mymcmc` variable:

    # Estimate the log marginal likelihood
    pow_p = powerPosterior(mymodel, moves, monitors, "output/jcmodel.out", cats=30) 
    pow_p.burnin(generations=10000,tuningInterval=1000)
    pow_p.run(generations=1000)  
    ss = steppingStoneSampler(file="output/jcmodel.out", powerColumnName="power", likelihoodColumnName="likelihood")
    ss.marginal() 
    ps = pathSampler(file="output/jcmodel.out", powerColumnName="power", likelihoodColumnName="likelihood")
    ps.marginal() 
    quit()
    
(By adding the `quit()` command after this section, we will avoid also running the MCMC analysis over again.)

:large_blue_diamond: Run the file to estimate the marginal likelihood using the steppingstone method as well as the path sampling method:

    rb132 jc.Rev
    
> :thinking: What is the log marginal likelihood for the JC model estimated by steppingstone sampling?

{% comment %}
I got -3399.753 using 20 ratios
I got -3399.548 using 30 ratios
I got -3398.916 using 50 ratios
{% endcomment %}

> :thinking: What is the log marginal likelihood estimated for the JC model by path sampling?

{% comment %}
I got -3398.737 using 20 ratios
I got -3399.819 using 30 ratios
I got -3398.627 using 50 ratios
{% endcomment %}

If these two numbers are close (e.g. within one log unit of each other), then it means we have used enough ratios in the calculation.

## Adding rate heterogeneity

:large_blue_diamond: Begin by making a copy of your Rev script and naming the copy _jcg.Rev_:

    cp jc.Rev jcig.Rev

We found in the likelihood lab that accommodating rate heterogeneity in the model was important for getting the tree correct. Let's switch to the JC+G model now to see if that helps. 

:large_blue_diamond: Add these lines **just before the PhyloCTMC section** in your _jcig.Rev_ script.

    #############################
    # Among-site rate variation #
    #############################
    
    # Define the shape parameter of a Gamma distribution
    gammashape ~ dnExponential(0.1)
    
    # Create a deterministic node to model discrete gamma rate heterogeneity
    site_relrates := fnDiscretizeGamma( gammashape, gammashape, 4, false )
    
    # Add a move so that alpha will be estimated
    moves.append( mvScale(gammashape, weight=2.0) )
    
    # Create a variable representing the proportion of invariable sites
    pinvar ~ dnBeta(1,1)
    
    # Add a move so that p_inv will be estimated
    moves.append( mvBetaProbability(pinvar, weight=2.0) )

:large_blue_diamond: Modify this line in the PhyloCTMC section to inform the likelihood model of `pinvar` and `site_relrates`:

    likelihood ~ dnPhyloCTMC(tree=psi, siteRates=site_relrates, pInv=pinvar, Q=Qmatrix, type="RNA")

:large_blue_diamond: To avoid confusion, rename your _output_ directory _jcoutput_:

    mv output jcoutput
    
## Estimating the marginal likelihood for the JC+I+G model

:large_blue_diamond: Run the _jcig.Rev_ script in RevBayes to estimate the log marginal likelihood of the JC+I+G model using both steppingstone and path sampling:

    rb132 jcig.Rev

> :thinking: What is the log marginal likelihood estimated for the JC+I+G model by steppingstone sampling?

{% comment %}
I got -3315.634 using 30 ratios
{% endcomment %}

> :thinking: What is the log marginal likelihood estimated for the JC+I+G model by path sampling?

{% comment %}
I got -3315.691 using 30 ratios
{% endcomment %}

> :thinking: Does the JC+I+G model fit the data better on average than the JC model? Why did you conclude this?

{% comment %}
Yes, because the log marginal likelihood for JC+I+G is about 84 log units higher than that for JC
{% endcomment %}

## Obtaining a sample from the posterior under the JC+I+G model

:large_blue_diamond: Edit your _jcig.Rev_ file in nano, commenting out the power posterior (`pow_p`), steppingstone (`ss`), and path sampling (`pp`) lines, as well as the `quit()` command after those lines. 

:large_blue_diamond: Run the file again to sample from the posterior using MCMC.

    rb132 jcig.Rev
    
> :thinking: What is the posterior probability of the chlorophyll b clade now that we've accommodated rate heterogeneity?

{% comment %}
0.1521181
{% endcomment %}    

## Sampling under the GTR+I+G model

Let's see if estimating base frequencies and exchangeabilities (i.e. the GTR+I+G model) further increases the posterior probability of the chlorophyll b clade.

:large_blue_diamond: Copy your _jcig.Rev_ file, calling the copy _gtrig.Rev__:

    cp jcig.Rev gtrig.Rev
    
:large_blue_diamond: To avoid confusion, rename your _output_ directory _jcigoutput_:

    mv output jcigoutput
    
:large_blue_diamond: Edit _gtrig.Rev_, replacing your _Substitution model_ section with this one:

    ######################
    # Substitution Model #
    ######################
    
    # Create a stochastic node representing nucleotide frequencies
    freqs ~ dnDirichlet( v(1,1,1,1) )
    moves.append( mvBetaSimplex(freqs, weight=2.0) )
    moves.append( mvDirichletSimplex(freqs, weight=1.0) )
    
    # Create a stochastic node representing GTR exchangeabilities
    xchg ~ dnDirichlet( v(1,1,1,1,1,1) )
    moves.append( mvBetaSimplex(xchg, weight=3.0) )
    moves.append( mvDirichletSimplex(xchg, weight=1.5) )
    
    # Create a deterministic node for the GTR rate matrix
    Qmatrix := fnGTR(xchg,freqs) 
    
    # Create a constant variable for the rate matrix
    # Qmatrix <- fnJC(4)
    
    print("Q matrix: ", Qmatrix)

Both **nucleotide relative frequencies** (`freqs`) and **GTR exchangeabilities** (`xchg`) are multivariate parameters that are constrained to add to 1, so both are given **flat Dirichlet priors**. The Dirichlet distribution can have different numbers of parameters (4 for freqs and 6 for xchg), so RevBayes uses a single vector to provide the parameters (which also determines the dimension of the variable). A **vector** in RevBayes is created using the `v()` notation.

The moves provided for freq and xchg are appropriate for multivariate parameters that add to 1.0. The term [simplex](https://en.wikipedia.org/wiki/Simplex) implies this sum-to-1 constraint.

> :thinking: Why do we need to make Qmatrix a deterministic node in the GTR model rather whereas we used a constant node in the JC model?

{% comment %}
In the GTR model, the Q matrix is a function of model parameters, namely frequencies and exchangeabilties. I nthe JC model, there were no parameters making up the Q matrix.
{% endcomment %}
    
:large_blue_diamond: Now run RevBayes again, this time providing the _gtrig.Rev_ script

    rb132 gtrig.Rev
    
There is a very high probability that RevBayes will report an error at this point. If you get

    Missing Variable:	Variable moves does not exist
    Error:	Problem processing line 20 in file "gtr.Rev"
    
type `q()` to get out of the program, then open your _gtrig.Rev_ script in nano and go to line 20 (or whatever line is indicated) by typing Ctrl-<hyphen> and typing in the line number. See if you can figure out what is bothering RevBayes. Hint: the solution will involve relocating the line that says "moves = VectorMoves()" (this is line 45 in my version).

> :thinking: What is the posterior probability of the chlorophyll b clade under the GTR+I+G model?

{% comment %}
0.9021431
{% endcomment %}

## Estimating the marginal likelihood for the GTR+I+G model

:large_blue_diamond: Edit your _gtrig.Rev_ script, uncommenting the lines that estimate the marginal likelihood, and run the script again.

> :thinking: What is the log marginal likelihood of the GTR+I+G model using steppingstone and path sampling?

{% comment %}
-3212.326 steppingstone
-3212.932 path sampling
{% endcomment %}

> :thinking: Does the GTR+I+G model fit better or worse than the JC+I+G model?

{% comment %}
It fits better: -3212 for GTR+I+G vs. -3315 for JC+I+G (103 log units better)
{% endcomment %}

> :thinking: How many additional parameters does the GTR+I+G model have compared to the JC+I+G model? (Please list the added parameters, don't just provide the number)

{% comment %}
3 nucleotide frequency parameters and 5 exchangeability parameters
{% endcomment %}

## What to turn in

Please turn in your :thinking: thinking questions.

{% comment %}
## Using a better edge length prior

We've been applying an Exponential(10) prior to each edge length. As we've discussed in lecture, this sometimes induces an unreasonable tree length prior. How would you change your script so that the **tree length** has an Exponential(1.0) prior and the **edge proportions** have a flat Dirichlet prior?

# Edge length prior
#for (i in 1:nedges) {
#    edge_length[i] ~ dnExponential(10.0)
#    moves.append( mvScale(edge_length[i]) )
#}
#TL := sum(edge_length)

TL ~ dnExponential(1.0)
moves.append( mvScale(TL) )

edge_proportions ~ dnDirichlet( v(1,1,1,1,1,1,1,1,1,1,1,1,1) ) # can also use rep(1,nedges)
moves.append( mvBetaSimplex(edge_proportions, weight=nedges) )
moves.append( mvDirichletSimplex(edge_proportions, weight=nedges/10) )
edge_length := edge_proportions * TL
{% endcomment %}






