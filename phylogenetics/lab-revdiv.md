---
layout: page
title: RevBayes Divergence Dating Lab
permalink: /revdiv/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

## Goals

The goal of this lab exercise is to introduce you to Bayesian divergence time estimation. There are other programs that are popular for divergence time analyses (notably [BEAST2](https://www.beast2.org)), but we will use [RevBayes](https://revbayes.github.io) because you already have some experience with this program (namely the [RevBayes lab](/revbayes/)).

## Getting started

### Login to Xanadu

Login to your account on the Health Center (Xanadu) cluster, then issue

    srun --qos=mcbstudent --partition=mcbstudent --mem=5G --pty bash
    
to start a session on a node that is not currently running jobs. 

**Important** The <tt>--mem=5G</tt> part is important for this lab, as RevBayes uses more than the default amount (128 MB) of memory sometimes.

### Create a directory

Use the unix <tt>mkdir</tt> command to create a directory to play in today:

    cd
    mkdir rbdiv

### Load the RevBayes module 

You will need to load the RevBayes/1.1.1 module in order to use RevBayes:

    module load RevBayes/1.1.1

### Load the PAML module 

You will need to load the paml/4.9 module in order to use PAML, which we will use to simulate data:

    module load paml/4.9
 
## Simulating and analyzing under the strict clock model

Divergence time analyses are the trickiest type of analysis we will do in this course. That's because the sequences do not contain information about **substitution rates** or **divergence times** per se; they contain information about the **number of substitutions** that have occurred, and the number of substitutions  is the _product_ of rate and time. Thus, maximum likelihood methods cannot separate rates from times; doing so requires a Bayesian approach and considered use of priors, which constrain the range of rate and time scenarios considered plausible.

We will thus start slowly, and we will simulate data so that we know the truth. This will help guide your expectations when conducting divergence time analyses on real data.

### PAML evolver

Let's use the **evolver** program, which is part of [Ziheng Yang's PAML package](http://abacus.gene.ucl.ac.uk/software/paml.html), to simulate data for 10000 sites on a 20-taxon pure birth (Yule) tree using a strict clock. This will allow us to know everything: the **birth rate** of the tree generating process, the **clock rate** (i.e. the substitution rate that applies to the entire tree), as well as the model used for simulation.

We will each use a different random number seed, so we should all get slightly different answers.

#### Simulate a tree

First simulate a pure birth tree using evolver. Start evolver by simply typing evolver at the bash prompt, then enter the information provided below at the prompts (for questions that ask for multiple quantities, just separate the values by a space):

* specify that you want to generate a rooted tree by typing 2
* specify 20 species
* specify 1 tree and a random number seed of _your_ choosing
* specify 1 to answer yes to the question about wanting branch lengths
* specify 2.6 for the birth rate, 0.0 for the death rate, 1.0 for the sampling fraction, and 1.0 for the tree height
* press 0 to quit

One thing to note before we continue. PAML's evolver program scales the tree to have height equal to the specified mutation rate (1.0, the last number we specified above). Normally pure birth trees would have different heights because of stochastic variation, but apparently this is only possible in evolver by editing the source code and making your own _ad hoc_ version. I've done the next best thing, which is set the birth rate to the value (2.6) that yields a tree having _expected_ height 1.0. 

You should now find a tree description in the file _evolver.out_. **Rename this file** _tree.txt_ (this will prevent your tree description from being overwritten when you run evolver again, and we will use the _tree.txt_ file as input to RevBayes):

    mv evolver.out tree.txt

#### Simulate sequences

The PAML evolver program requires a control file specifying everything it needs to know to perform your simulation. Create a file named _control.dat_ with the following contents (**note: 2 lines require modification**: seed and tree description):

    2
    seed goes here
    20 10000 1
    -1
    tree description goes here
    4 
    5
    0 0 
    0.1 0.2 0.3 0.4

Here's what each of those lines does (consult the evolver section of the [PAML manual](http://abacus.gene.ucl.ac.uk/software/pamlDOC.pdf) for more info about each option):

* line 1: 2 specifies that we want the output as a nexus file
* line 2: you should enter your own random number seed on the second line (can be the same as the one you used for the tree)
* line 3: 20 taxa, 10000 sites, 1 data set
* line 4: -1 says to use the branch lengths in the tree description
* line 5: tree description: paste in the tree description you generated from the first evolve run here
* line 6: 4 specifies the HKY model
* line 7: set kappa equal to 5
* line 8: set the gamma shape parameter to 0 and the number of rate categories to 0 (i.e. no rate heterogeneity)
* line 9: set state frequencies to: T=0.1, C=0.2, A=0.3, and G=0.4 (note, not in alphabetical order!)

When saving simulated data in nexus format, PAML's evolver command looks for three files (_paupstart_, _paupend_, and _paupblock_) specifying what text should go at the beginning, end, and following each data matrix generated, respectively. The only one of these files that needs to have anything in it is _paupstart_. 

Here's the quick way to create these files:

    echo "#nexus" > paupstart
    touch paupblock
    touch paupend

The **echo** command parrots what you put in quotes and the <tt>> paupstart</tt> at the end creates the file _paupstart_ and saves the echoed contents there (you could use <tt>>> paupstart</tt> if you wanted to append other lines to the file). 

The **touch** command is intended to update the time stamp on a file, but will create an empty text file if the file specified does not exist.

Run evolver now using this control file, and selecting option (5) from the menu, which is "Simulate nucleotide data sets".

    evolver 5 control.dat

If you get _Error: err tree..._ it means that you did not follow the directions above ;)

You should now find a file named _mc.nex_ containing the sequence data.

## Use RevBayes to estimate the birth rate and clock rate

In our first RevBayes analysis, we will see how well we can estimate what we already know to be true about the evolution of both the tree and the sequences. You will cheat and fix some things to their known true values, such as the tree topology and edge lengths. The idea is to take small steps so that we know what we are doing all along.

RevBayes uses an R-like language called the Rev Language to specify the model and the analysis. Rev is not R, but it is so similar to R that you will often forget that you are not using R and will try things that work in R but do not work in Rev - just a heads-up!

### Set up the tree submodel

Create a new file named _strict.Rev_ and add the following to it: I'll provide some explanation below the code block.

    # Load data and tree

    D <- readDiscreteCharacterData(file="mc.nex")
    n_sites <- D.nchar()

    T <- readTrees("tree.txt")[1]
    n_taxa  <- T.ntips()
    taxa  <- T.taxa()

    # Initialize move (nmoves) and monitor (nmonitors) counters

    nmoves = 1
    nmonitors = 1

    # Birth-death tree model

    death_rate <- 0.0
    birth_rate ~ dnExponential(0.01)
    birth_rate.setValue(1.0)
    diversification := birth_rate - death_rate
    moves[nmoves++] = mvSlide(birth_rate, delta=1.0, tune=true, tuneTarget=0.4, weight=1.0)
    sampling_fraction <- 1.0
    root_time <- T.rootAge()
    timetree ~ dnBDP(lambda = birth_rate, 
        mu = death_rate, 
        rho = sampling_fraction, 
        rootAge = root_time, 
        samplingStrategy = "uniform", 
        condition = "nTaxa", 
        taxa = taxa)
    timetree.setValue(T)

Note that we are assigning only the first tree in _trees.txt_ to the variable <tt>T</tt> (there is only 1 tree in that file, but RevBayes stores the trees it reads in a vector, so you have to add the <tt>[1]</tt> to select the first anyway).

The functions beginning with <tt>dn</tt> (e.g. **<tt>dnExponential</tt>** and **<tt>dnBDP</tt>**) are probability distributions. Thus, **<tt>birth_rate</tt>** is a parameter that is assigned an Exponential prior distribution having rate 0.01, and **<tt>timetree</tt>** is a compound parameter representing the tree and its branching times that is assigned a Birth Death Process (BDP) prior distribution. The BDP is a submodel, like the +I or +G rate heterogeneity submodels: it has its own parameters (**lambda**, **mu**, **rho**, and **rootAge**) all of which are fixed except for **<tt>birth_rate</tt>**.

The **<tt>setValue</tt>** function sets the starting value of a parameter that is allowed to vary. 

Each parameter in the model requires a mechanism to propose changes to its value. These are called _moves_. A vector of moves has been created for you, so you need only add to it. The variable **<tt>nmoves</tt>** keeps track of how many moves we've defined. Each time a move is added to the moves vector, we increment the variable **<tt>nmoves</tt>** so that new moves will not overwrite previously defined moves. This increment is performed by the <tt>++</tt> in <tt>nmoves++</tt>. 

Monitors in RevBayes handle output. We are just initializing the monitor counters now; we will add monitors toward the end of our RevBayes script.

The model comprises a DAG (Directed Acyclic Graph). The nodes of this graph are of several types and represent model inputs and outputs:
* **Stochastic nodes** are exemplified by <tt>birth_rate</tt> and <tt>timetree</tt>; they can be identified by the tilde (<tt>~</tt>) symbol used to assign a prior distribution.
* **Constant nodes** are exemplified by <tt>death_rate</tt>,  <tt>sampling_fraction</tt>, and <tt>root_time</tt>; they can be identified by the assignment operator <tt><-</tt> that fixes their value to a constant.
* **Deterministic nodes** are exemplified by <tt>diversification</tt>; they can be identified by the assignment operator <tt>:=</tt>. These nodes represent functions of other nodes used to output quantities in a more understandable way. For example, diversification will show up as a column in the output even though it is not a parameter of the model itself. (The diversification node was only added here to illustrate deterministic nodes; it's value will always equal birth_rate because death_rate is a constant 0.0).

### Set up the strict clock submodel

Add the following 3 lines to your growing revscript:

    # Strict clock

    clock_rate ~ dnExponential(0.01)
    clock_rate.setValue(1.0) 
    moves[nmoves++] = mvSlide(clock_rate, delta=1.0, tune=true, tuneTarget=0.4, weight=1.0)

This adds a parameter **<tt>clock_rate</tt> **with a vague Exponential prior (rate 0.01) and starting value 1.0. The move we're using to propose new values for this parameter as well as the <tt>birth_rate</tt> parameter is a _sliding window move_, which you are familiar with from your MCMC homework. The value **<tt>delta</tt>** is the width of the window centered over the current value, and we've told RevBayes to tune this proposal during the burnin period so that it achieves (if possible) an acceptance rate of 40%. The weight determines the probability that this move will be tried. At the start of the MCMC analysis, RevBayes sums the weights of all moves you've defined and uses the weight divided by the sum of all weights as the probability of selecting that particular move next.

### Set up the substitution submodel

Now let's set up a GTR substitution model:

    # GTR model

    state_freqs ~ dnDirichlet(v(1,1,1,1))
    exchangeabilities ~ dnDirichlet(v(1,1,1,1,1,1))
    Q := fnGTR(exchangeabilities, state_freqs)
    moves[nmoves++] = mvDirichletSimplex(exchangeabilities, alpha=10.0, tune=true, weight=1.0)
    moves[nmoves++] = mvDirichletSimplex(state_freqs, alpha=10.0, tune=true, weight=1.0)

The Q matrix for the GTR model involves state frequencies and exchangeabilities. I've made both **<tt>state_freqs</tt>** and **<tt>exchangeabilities</tt>** stochastic nodes in our DAG and assigned both of them flat Dirichlet prior distributions (the <tt>v(1,1,...,1)</tt> part is the vector of parameters for the Dirichlet prior distribution (all 1s means a flat prior).

I've assigned mvDirichletSimplex moves to both of these parameters. A simplex is a set of coordinates that are constrained to sum to 1, and this proposal mechanism modifies all of the state frequencies (or exchangeabilities) simultaneously while preserving this constraint. A list of all available moves can be found in the [Documentation section of the RevBayes web site](https://revbayes.github.io/documentation/) if you want to know more.

### Finalize the PhyloCTMC

It is time to collect the various submodels (<tt>timetree</tt>, <tt>Q</tt>, and <tt>clock_rate</tt>) into one big Phylogenetic Continuous Time Markov Chain (dnPhyloCTMC) distribution object and attach (_clamp_) the data matrix <tt>D</tt> to it.

    # PhyloCTMC

    phySeq ~ dnPhyloCTMC(tree=timetree, Q=Q, branchRates=clock_rate, nSites=n_sites, type="DNA")
    phySeq.clamp(D)
    mymodel = model(exchangeabilities)

The last line above is a little obscure. RevBayes needs to have an entry point (a root node, if you will) into the DAG, and any stochastic node will suffice. Here I've supplied <tt>exchangeabilities</tt> when constructing mymodel, but I could have provided <state_freqs>, <birth_rate>, <clock_rate>, etc., instead.

Add one more line to this section of your file:

    mymodel.graph("strict.dot", TRUE, "white")

This line creates a file named _strict.dot_ that contains code (in the [dot language](https://en.wikipedia.org/wiki/DOT_(graph_description_language))) for creating a plot of your DAG. The second argument (TRUE) tells the graph command to be verbose, and the last argument ("white") specifies the background color for the plot.

### Set up monitors

Let's create 2 monitors to keep track of sampled parameter values, sampled trees, and screen output:

    # Monitors

    monitors[nmonitors++] = mnModel(filename  = "output/strict.log",  printgen = 10, separator = TAB) 
    monitors[nmonitors++] = mnFile(filename  = "output/strict.trees", printgen = 10, timetree)
    monitors[nmonitors++] = mnScreen(printgen=100)

The first monitor will save model parameter values to a file named _strict.log_ in the _output_ directory (which will be created if necessary). The second monitor will save trees to a file named _strict.trees_ in the _output_ directory. Note that we have to give it <tt>timetree</tt> as an argument. This is kind of silly because we've fixed the tree topology and edge lengths, so all the lines in the _strict.trees_ will be identical, but this saves me having to explain this later. Finally, the third monitor produces output to the console so that you can monitor progress.

Note that we are sampling only every 10th iteration for the first 2 monitors and every 100th iteration for the screen monitor.

### Set up MCMC

Finally, we're ready to add the final section to our revscript. Here we create an **<tt>mcmc</tt>** object that combines the model, monitors, and moves and says to do just 1 MCMC analysis. We will devote the first 1000 iterations to burnin, stoping to tune the moves every 100 iterations (RevBayes collects data for 100 iterations to compute the acceptance probabilities for each move, then uses that to decide whether to make the move bolder or more conservative.) Then we run for real for 10000 iterations and ask RevBayes to output an operator summary, which will tell us how often each of our moves was attempted and succeeded.

    # MCMC

    mymcmc = mcmc(mymodel, monitors, moves, nruns=1)
    mymcmc.burnin(generations=1000, tuningInterval=100)
    mymcmc.run(generations=10000)
    mymcmc.operatorSummary()

    quit()

## Run RevBayes

To run RevBayes, enter the following at the command prompt with the name of your revscript file last:

    rb strict.Rev

If this were a long analysis, we would create a slurm script and submit the job using sbatch, but this one should be short enough that you can easily wait for it to finish while logged in.

## Reviewing the strict clock results

First, copy the contents of the file _strict.dot_ and paste them into one of the online [Graphviz](https://www.graphviz.org) viewers such as [GraphvizFiddle](https://stamm-wilbrandt.de/GraphvizFiddle/), [GraphvizOnline](https://dreampuf.github.io/GraphvizOnline), or [WebGraphviz](http://www.webgraphviz.com). The resulting plot shows your entire model as a graph, with constant nodes in square boxes, stochastic nodes in solid-line ovals, and deterministic nodes in dotted-line ovals.

Now download the file _strict.log_ stored in the _output_ directory to your laptop and open it in [Tracer](https://www.beast2.org/tracer-2/).

> :thinking: What is the 95% HPD (highest posterior density) credible interval for clock_rate (use the Estimates tab in Tracer to find this information)? Does this include the true value? 

{% comment %}
I got (0.9986, 1.0216), and yes, it includes the true value 1.0
{% endcomment %}

> :thinking: What is the 95% HPD (highest posterior density) credible interval for birth_rate? Does this include the true value?

{% comment %}
I got (0.6306,4.1727); yes, the true rate was 2.6, which is close to the middle of the credible interval
{% endcomment %}

> :thinking: Using the Marginal Density tab in Tracer, and select all 6 exchangeabilities. What do these values represent, and what about these densities makes sense given what you know about the true model used to simulate the data? 

{% comment %}
yes, the 2 transition relative rates are about 0.358, which is 5.04 times higher than the other 4, which average 0.071
{% endcomment %}

> :thinking: Using the Marginal Density tab in Tracer, and selecting all 4 state_freqs, what about these densities make sense given what you know about the true model used to simulate the data?

{% comment %}
yes, they are centered over 0.1, 0.2, 0.3, and 0.4, which are the values we specified when simulating the data using evolver
{% endcomment %}

> :thinking: Which parameter is hardest to estimate precisely (i.e. has the broadest HPD credible interval)? 

{% comment %}
birth_rate
{% endcomment %}

> :thinking: For the parameter you identified in the previous question, would it help to simulate 20000 sites rather than 10000? 

{% comment %}
no, not even an infinite amount of data would narrow down the estimate of birth_rate (do you understand why?)
{% endcomment %}

> :thinking: What would help in reducing the HPD interval for birth_rate? 

{% comment %}
larger trees: the data needed to estimate birth_rate lies in the lengths of the intervals between speciation events, so more speciation events mean more data for estimating birth_rate
{% endcomment %}

You may have noticed that our effective sample sizes for the <tt>exchangeabilities</tt> and <tt>state_freqs</tt> parameters are pretty low. You no doubt also noticed that these are being estimated quite precisely and accurately. What gives? The fact that there is so much information in the data about these parameters is the problem here. The densities for these parameters are very _sharp_ (low variance), and proposals that move the values for these parameters away from the optimum by very much fail. Looking at the operator summary table generated after the MCMC analysis finished, you will notice that RevBayes maxed out its tuning parameter for both <tt>exchangeabilities</tt> and <tt>state_freqs</tt> at 100. Making this tuning parameter larger results in smaller proposed changes, so if we could set the tuning parameter alpha to, say, 1000 or even 10000, we could achieve better acceptance rates and higher ESSs.

## Relaxed clocks

It is safe to assume that a strict molecular clock almost never applies to real data. So, it would be good to allow some flexibility in rates. One common approach is to assume that the rates for each edge are drawn from a lognormal distribution. This is often called an **UnCorrelated Lognormal  (UCLN) relaxed clock model** because the rate for each edge is independent of the rate for all other edges (that's the uncorrelated part) and all rates are lognormally distributed. This is to distinguish this approach from correlated relaxed clock models, which assume that rates are to some extent inherited from ancestors, and thus there is autocorrelation across the tree.

Copy your _strict.Rev_ script to a file named _relaxed.Rev_:

    cp strict.Rev relaxed.Rev

Edit _relaxed.Rev_, replacing the section entitled "Strict clock" with this relaxed clock version:

    # Uncorrelated Lognormal relaxed clock

    # Add hyperparameters mu and sigma
    ucln_mu ~ dnNormal(0.0, 100)
    ucln_sigma ~ dnExponential(.01)
    moves[nmoves++] = mvSlide(ucln_mu,    delta=0.5, tune=true, tuneTarget=0.4, weight=1.0)
    moves[nmoves++] = mvSlide(ucln_sigma, delta=0.5, tune=true, tuneTarget=0.4, weight=1.0)

    # Create a vector of stochastic nodes representing branch rate parameters
    n_branches <- 2*n_taxa - 2
    for(i in 1:n_branches) {
        branch_rates[i] ~ dnLognormal(ucln_mu, ucln_sigma)
        branch_rates[i].setValue(1.0)
        moves[nmoves++] = mvSlide(branch_rates[i], delta=0.5, tune=true, weight=1.0)
    }
 
You'll also need to substitute **<tt>branch_rates</tt>** for **<tt>clock_rate</tt>** in your dnPhyloCTMC call:

    phySeq ~ dnPhyloCTMC(tree=timetree, Q=Q, branchRates=branch_rates, nSites=n_sites, type="DNA")

The model has suddenly gotten a lot more complicated, hasn't it? We now have a rate parameter for every edge in the tree, so we've added $$(2)(20) - 2 = 38$$ more parameters to the model. Each of these edge rate parameters has a lognormal prior, and the 2 parameters of that distribution represent hyperparameters in what is now a hierarchical model, so we've increased the model from 10 parameters (1 **<tt>clock_rate</tt>**, 1 **<tt>birth_rate</tt>**, 3 **<tt>state_freqs</tt>**, 5 **<tt>exchangeabilities</tt>**) to 50 parameters (the original 10 plus 38 edge rates and 2 hyperparameters **<tt>ucln_mu</tt>** and **<tt>ucln_sigma</tt>**).

{% include figure.html description="Lognormal Distribution" url="/assets/img/lognormal.png" css="image-right noborder" width="400px" %}

To the right is a slide (from the March 3, 2022, lecture) that shows the relationship between the lognormal distribution (left) and the normal distribution (right). The lognormal distribution is tricky in that its two parameters (mu and sigma) are _not_ the mean and standard deviation of the lognormally-distributed variable, as you might be led to assume if you are used to mu and sigma used with normal distributions. In a Lognormal distribution, mu and sigma are, instead, the mean and standard deviation of the _log_ of the lognormally-distributed variable! 

Note this line:

    branch_rates[i].setValue(1.0)
 
This sets the starting value of all branch rate parameters to 1. 

This seems to be kind of important. If you let RevBayes choose starting values for branch rates, it will start by drawing values for hyperparameters ucln_mu and ucln_sigma (which, due to the high variances we've given to their hyperpriors, can result in some pretty crazy values) and then will draw values from Lognormal(<tt>ucln_mu</tt>, <tt>ucln_sigma</tt>) to serve as starting values for the branch rates. This procedure could start us far away from a reasonable constellation of parameter values and the MCMC analysis may never find its way to a reasonable configuration, at least with the length of run we are able to manage in a lab period. 

It is **always a good idea to start an MCMC analysis with all parameters set to their MLEs**, or at least reasonable values. This does not violate Bayesian principles in any way, and it saves on the amount of burnin that needs to be done. This is especially true for complex models where the amount of information for estimating parameters is low. Here I'm cheating a bit and setting the branch rates to what I know is the true value (1.0), but if we used our estimated <tt>clock_rate</tt> from the previous analysis things would work out just as well. 

{% comment %}
Note that I'm not using setValue for any other parameters; the analysis seems to behave without starting those off at reasonable values, indicating either that there's a enough information about those parameters (e.g. birth_rate, state_freqs, exchangeabilities) or the parameters have less influence due to the fact that they are hyperparameters one level removed from the likelihood (e.g. ucln_mu, ucln_sigma).
{% endcomment %}

You should also edit the monitors section so that the output file names reflect the fact that we're using a relaxed clock now:

    # Monitors

    monitors[nmonitors++] = mnModel(filename  = "output/relaxed.log",  printgen = 10, separator = TAB) 
    monitors[nmonitors++] = mnFile(filename  = "output/relaxed.trees", printgen = 10, timetree)
    monitors[nmonitors++] = mnScreen(printgen=100)

And don't forget to change the name of the dot file:

    mymodel.graph("relaxed.dot", TRUE, "white")

Now run the new model:

    rb relaxed.Rev

## Review results of the relaxed clock analysis

If you create a plot of your _relaxed.dot_ file using one of the online Graphviz viewers, the increase in model complexity will be very apparent!

Open the _relaxed.log_ file in Tracer and answer the following questions:

> :thinking: What is the true rate for any given edge in the tree?

{% comment %}
1.0 (remember, we are still using the data set simulated under a strict clock with rate 1.0)
{% endcomment %}

> :thinking: Looking across the 38 branch rate parameters, do any of them get very far from 1.0? 

{% comment %}
No, they are all very close to 1.0
{% endcomment %}

> :thinking: What are the mean values of ucln_mu and ucln_sigma, our two hyperparameters that govern the assumed lognormal prior applied to each branch rate? 

{% comment %}
I got 0.0116 for ucln_mu and 0.01828 for ucln_sigma
{% endcomment %}

> :thinking: What do these values translate to on the linear scale (consult the figure)?

{% comment %}
Mean equals 1.0118, standard deviation equals 0.01850
{% endcomment %}

> :thinking: Do the values on the linear scale make sense?

{% comment %}
Yes, the mean is near 1, which was the clock rate simulated, and the standard deviation is near 0, which means there is essentially no variation among branches in substitution rate (i.e., a strict clock), which is also what we simulated
{% endcomment %}

## Divergence times

So far we've not estimated divergence times; we've assumed the true tree topology and true divergence times for all of our analyses. In reality, our main interest probably lies in estimating divergence times. We don't really care about substitution rates or how much variation there is in those rates across edges. The rates are just nuisance parameters that must be handled reasonably in order to get at what we really want, the divergence times.

In this lab, we will not be using fossil information to calibrate divergence times. We will assume that the root has age 1.0 and focus on estimating _relative_ divergence times. There are several good tutorials on the [RevBayes Tutorials web page](https://revbayes.github.io/tutorials/) that show you how to handle fossil calibration in RevBayes. This tutorial is intended to make you aware of all the issues surrounding divergence time estimation so that you have sufficient background to fully appreciate the tutorials on the RevBayes site.

Let's continue our example by adding some moves that will modify the tree topology and branching times. Start by making a copy of your _relaxed.Rev_ script, calling the copy _divtime.Rev_:

    cp relaxed.Rev divtime.Rev

Now add the following section just before the section entitled "# Uncorrelated Lognormal relaxed clock":

    # Tree moves

    # Add moves that modify all node times except the root node
    moves[nmoves++] = mvNodeTimeSlideUniform(timetree, weight=10.0)

    # Add several moves that modify the tree topology
    moves[nmoves++] = mvNNI(timetree, weight=5.0)
    moves[nmoves++] = mvNarrow(timetree, weight=5.0)
    moves[nmoves++] = mvFNPR(timetree, weight=5.0) 

Note that we are giving extra weight to these moves, so each tree topology move will be attempted 5 times more often, and the node time slider move will be attempted 10 times more often, than the other moves we've defined.

Note also that we're still starting the MCMC off with the true tree topology and node times (see the line <tt>timetree.setValue(T)</tt>). This is cheating, of course, but the result would be the same if you started with a maximum likelihood estimate obtained under a strict clock.

Add the following to the very end of the _divtime.Rev_ file. This will read all the sampled trees (each will be different this time because we added moves to modify tree topology and node times) and create a consensus tree showing 95% credible intervals around each divergence time:

    # Summarize divergence times

    tt = readTreeTrace("output/divtime.trees", "clock")
    tt.summarize()
    mapTree(tt, "output/divtimeMAP.tre")

Be sure to change your output files to have the prefix **divtime** rather than **relaxed** so that you don't overwrite the previous results, then run the new model:

    rb divtime.Rev

Be prepared to wait for a little longer this time; we've added a lot of extra work to the analysis.

## Review results of the divergence time analysis

Open the _divtime.log_ file in Tracer. 

Also open the _divtimeMAP.tre_ file in FigTree, check the Node Bars checkbox, then specify age_95%_HPD for Display after expanding the Node Bars section. You may also wish to use **File > New...** from the FigTree main menu to open up a new window, then paste the tree description from _trees.txt_ into the new window for comparison. It also helps to expand the **Trees** section of FigTree and check the **Order nodes** checkbox so that both trees are _ladderized_ the same direction.

> :thinking: We've added moves, but no parameters or priors for the node times. Why not?

{% comment %}
The prior for node times is provided by dnBDP, the birth-death process distribution, which has one hyperparameter birth_rate, so the parameters and priors for node times have been there all along!
{% endcomment %}

> :thinking: Does the MAP tree have the same topology as the true tree

{% comment %}
Yes, it did in my case anyway
{% endcomment %}

> :thinking: Are we more confident about recent nodes or ancient nodes in the tree?

{% comment %}
The credible intervals for recent nodes are smaller, so we are more confident in those
{% endcomment %}

> :thinking: What would you conclude if these credible intervals were exactly the same size if we had performed the MCMC analysis on the prior only, with no data?

{% comment %}
We must conclude that there is no information in the data about divergence times; we would hope that the credible intervals would be smaller when the data is used
{% endcomment %}

## Obtaining credible intervals under the prior

To finish up the lab, let's see what the credible interval sizes are under the prior. While we could explore the actual prior, the results would be a little disappointing. For example, under the pure birth model we are using, sampling from the prior would yield many thousands of very different tree topologies, and the consensus of all these disparate trees would be a star tree, which would not be very interesting. Similarly, allowing the birth_rate to be sampled from its prior (which has mean 100 and variance 10000!) would produce trees that, on average, look so different from the tree we used to simulate our data that comparison of divergence time credible intervals would be difficult. So, we will fix the tree topology and birth_rate prior to their true values but keep the ucln_mu, ucln_sigma, and the branch_rates priors at their original values. This means that we will only be looking at the prior on rates, not node times.

Copy your _divtime.Rev_ file to create a new file named _divprior.Rev_ and make the following changes in the new file:

Change output file names to have prefix _divprior_ rather than _divtime_ so that you will not overwrite previous files (don't forget to do this in the <tt>readTreeTrace</tt> and <tt>mapTree</tt> commands);

Comment out the 3 lines setting up moves (<tt>mvNNI</tt>, <tt>mvNarrow</tt>, <tt>mvFNPR</tt>) that change tree topology;

Comment out the existing lines setting up the prior and slide move for <tt>birth_rate</tt> and replace with a single line making the <tt>birth_rate</tt> a constant node:

    #birth_rate ~ dnExponential(0.01)
    #birth_rate.setValue(1.0)
    #moves[nmoves++] = mvSlide(birth_rate, delta=1.0, tune=true, tuneTarget=0.4, weight=1.0)
    birth_rate <- 2.6

Change the setup for the <tt>mnScreen</tt> monitor to have <tt>printgen=10000</tt> rather than <tt>printgen=100</tt>; and

Change the MCMC burnin and run commands to include <tt>underPrior=TRUE</tt>, and change the number of generations in the run command to 1 million (don't worry, it goes fast if you don't ever calculate a likelihood!):

    mymcmc.burnin(generations=1000, tuningInterval=100, underPrior=TRUE)
    mymcmc.run(generations=1000000, underPrior=TRUE)

Now run the file as usual:

    rb divprior.Rev

Open both _divpriorMAP.tre_ and _divtimeMAP.tre_ and make the node bars equal the 95% HPD intervals in each.

> :thinking: Does the data contain information about substitution rates?

{% comment %}
Yes, the credible intervals are much smaller when the data is used, so the data has greatly reduced the number of rate combinations that are plausible, which is the definition of information
{% endcomment %}

## Where to continue

If you need to estimate divergence times, and especially if you have fossils that can help you calibrate the molecular clock (so that you don't have to pin the root time at 1.0 like we did here), you should continue with the tutorial [Relaxed Clocks and Time Trees](https://revbayes.github.io/tutorials/clocks/) on the RevBayes web site.

## What to turn in

Use FigTree to create a PDF figure of your _divtimeMAP.tre_ with credible intervals indicated by bars and turn that in along with your thinking questions to get credit.

