---
layout: page
title: BAMM Lab
permalink: /bamm/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

## Goals

The goal of this lab exercise is to learn the basics of using BAMM (Bayesian Analysis of Macroevolutionary Mixtures). BAMM uses reversible-jump MCMC to estimate the number and placement of diversification rate changes on the tree.

Although I provide some documentation of BAMM in this lab exercise, The BAMM web site provides excellent and much more thorough documentation. The [Quick-start guide to BAMM](http://bamm-project.org/quickstart.html) is the best place to begin if you need to use BAMM for your own work.

## Getting started

### Create R Markdown notebook on your local laptop

Open RStudio on your local laptop and use _File > New File > R Markdown..._ from the main menu to create a new R markdown file with title _BAMM Lab_. Use the default HTML output format. Once the document has been generated, use _File > Save As_ to save the file as _BAMM.Rmd_ on your local hard drive in a new directory devoted to this lab. 

Begin by erasing all the generated text from <tt>## R Markdown</tt> to the end.

Append the following to the end of what remains:

    ``` {r}
    library(ape)
    library(TreeSim)
    library(BAMMtools)
    library(coda)
    ```

Note that you can also use the Insert button at the top of the window to insert an R snippet template.

Choose _Run All_ from the Run dropdown at the top of the window. You will probably find that you **need to install** the **TreeSim**, **BAMMtools**, and **coda** packages. To do this, use the _Install_ button under the _Packages_ tab in the window on the lower right or, if you can't find that tab, use _Tools > Install Packages..._ main menu item. Type <tt>TreeSim</tt> into the Packages field and hit the _Install_ button.

Be sure to re-run the snippet above after you install these packages so that the packages are loaded and ready to be used.

We will add to this notebook throughout the lab today.

### Login to Xanadu

Login to your account on the Health Center (Xanadu) cluster, then issue

    srun --qos=mcbstudent --partition=mcbstudent --mem=1G --pty bash
    
to start a session on a node that is not currently running jobs. 

{% comment %}
**Important** The <tt>--mem=5G</tt> part is important for this lab, as RevBayes uses more than the default amount (128 MB) of memory sometimes.
{% endcomment %}

Use the unix <tt>mkdir</tt> command to create a directory to play in today:

    cd
    mkdir bammlab

## A test using a simulated Yule tree

The BAMM web site documentation walks you through an analysis of a real data set on a whale phylogeny, which you are welcome to explore on your own if you are interested, but today in lab we will explore the simplest possible case: a simulated pure-birth tree. We will give BAMM the benefit of our prior knowledge on the simulation conditions by forcing the extinction rate to be fixed at zero. Can BAMM nail the diversification regime for this simplest case? You will find that BAMM does quite well by some measures, but it is not a slam dunk in every respect.

### Simulate a tree in RStudio on your local laptop

Let's test BAMM by running it on a simulated 100-taxon Yule tree. Add this bit of code to your R Markdown file in RStudio:

    ## Simulate a Yule tree

    ``` {r}
    set.seed(1)
    nleaves <- 100
    lambda  <- 1.0
    mu      <- 0.0
    nsim    <- 1
    t <- sim.bd.taxa(nleaves, nsim, lambda, mu)
    yuletree <- as.phylo(t[[1]])
    plot(yuletree, show.tip.label=FALSE, direction="d")
    write.tree(yuletree)
    ```

In this bit of code we've simulated (using the function **sim.bd.taxa** from the **TreeSim** package) a single Yule (pure-birth) tree with **speciation rate** 1, **extinction rate** 0, and having **100 tips** (leaves). We used the APE plot command to plot the tree facing downward and excluding the tip labels (which are arbitrary anyway).

> :thinking: How many diversification rate shifts should BAMM identify in this tree? Please explain your answer briefly. 

{% comment %}
This is a Yule tree simulated using just one speciation rate parameter, so there are, in reality, zero rate shifts.
{% endcomment %}

### Please answer all thinking questions today in your R Markdown file

Create a section entitled **Questions** at the bottom of your R Markdown file as follows:

    # Questions
    
Keep this section last so that it is easy for Zach to find when looking over these later.

Add both the question and your answer to your R Markdown file. Set off each question as a block quote by starting the sentence with a greater than symbol, then separate your answer from the question with a blank line, as shown below:

    > How many diversification rate shifts should BAMM identify in this tree? Please explain your answer briefly. 
    
    Your answer goes here.

### Conduct an MCMC analysis using BAMM on the cluster

Moving to the cluster now, begin by **pasting the newick version** of the simulated Yule tree from the R Console output in RStudio into a new file name **_yule.txt_** in your _bammlab_ directory on the cluster. 

Now create a BAMM control file named _control.txt_ as follows:

    curl -O https://plewis.github.io/assets/data/template_diversification.txt
    cp template_diversification.txt control.txt
    
This is the same [_template_diversification.txt_](http://bamm-project.org/_downloads/template_diversification.txt) file provided in the Speciation-extinction analyses section of the BAMM [Quick-start guide](http://bamm-project.org/quickstart.html).

Note that I've had you make a copy of the template, naming the copy _control.txt_. You should leave the _template_diversification.txt_ file in its original state and **work only with _control.txt_ from now on**.

There are 5 entries in _control.txt_ that are intentionally set to a bogus value (<tt>%%%%</tt>) so that BAMM will not run until you set them. Here are the values to use for these 5 lines:

    treefile               = yule.txt
    numberOfGenerations    = 1000000
    mcmcWriteFreq          = 1000
    eventDataWriteFreq     = 1000
    printFreq              = 1000
       
There are a couple of other entries we need to change in order to fix the extinction rate at 0.0:

    updateRateMu0 = 0.0
    muInit0       = 0.0 
    
Finally, there are 4 entries related to priors that need to be changed. To find the best settings for these, return to your R Markdown file in RStudio and enter this code block:

    ## BAMM prior calculation
    ```{r}
    setBAMMpriors(yuletree)
    ```

The above block of code is from the [Quick-start guide to BAMM](http://bamm-project.org/quickstart.html) and uses the <tt>setBAMMpriors</tt> function from the R package BAMMtools to determine appropriate settings for some prior settings in the control file. The settings should have been saved to a file named _myPriors.txt_ in the directory in which your _BAMM.Rmd_ file is located. Copy the 4 relevant lines from this file (located on your local laptop) into the _control.txt_ file on the cluster, **replacing the variables of the same name in _control.txt_**. Here is the replacement I did (some of your values will be different):

    expectedNumberOfShifts = 1.0
    lambdaInitPrior = 0.21517112221563
    lambdaShiftPrior = 0.273545959144988
    muInitPrior = 0.21517112221563

## Run BAMM

I've compiled BAMM for the cluster and placed the executable in the directory that is the parent of your home directory. Thus, to run BAMM, you need to specify that it is located one level above your home directory, like this:

    ~/../bamm -c control.txt
    
The tilde <tt>~</tt> means home directory, so this should work even if you are not inside your home directory. Run BAMM now. BAMM will generate several files, including *mcmc_out.txt* and *event_data.txt*.

> :thinking: How many lines were written to the file mcmc_out.txt file? Explain the number of lines given the values you provided in the control file for numberOfGenerations and mcmcWriteFreq.

{% comment %}
There are 1001 lines in the file: numberOfGenerations/mcmcWriteFreq = 1000000/1000 = 1000 plus 1 header line
{% endcomment %}

## BAMMtools

Most of this section of the lab exercise today comes from the web page [Analyzing BAMM output with BAMMtools](http://bamm-project.org/postprocess.html). You should look at that web page to get more detailed explanations if you plan to use BAMM for your work.
    
### Loading the sampled event data

Transfer the following files from the *bammlab* directory on the cluster to your local laptop: *mcmc_out.txt*, *event_data.txt*, and _yule.txt_ 

You should now have these files in your current working directory on your local computer:

    BAMM.Rmd
    mcmc_out.txt
    event_data.txt
    yule.txt
    
### Trace plot

Start by creating a trace plot of the log likelihood (y-axis) versus the number of MCMC generations (x-axis):

    ## Trace plot (all samples)
    ``` {r}
    mcmcout <- read.csv("mcmc_out.txt", header=T)
    plot(mcmcout$logLik ~ mcmcout$generation, type="l")
    ```
    
To create a sample that excludes the first 11 rows of mcmcout to eliminate the short burn-in period evident in the trace plot, add this:

    ## Trace plot (burn-in removed)
    ``` {r}
    postburn <- mcmcout[11:nrow(mcmcout), ]
    plot(postburn$logLik ~ postburn$generation, type="l")
    ```
    
If you still see some evidence of burn-in, repeat these two lines with a larger value (e.g. 21) until you get rid of the starting climb.
    
### Effective sample size for the number of rate shifts

Use the effectiveSize function in the coda package to estimate the effective sample size for the number of rate shifts:

    ## Effective sample size (number of shifts)
    ``` {r}
    effectiveSize(postburn$N_shifts)
    ```
    
> :thinking: What is the effective sample size of the number of rate shifts?

{% comment %}
I got 719.0246
{% endcomment %}

The BAMM documentation suggests that the effective size should be at least 200.

### Marginal posterior distribution of rate shifts

To summarize the marginal posterior distribution of the number of rate shifts on the tree, type this:

    ## Marginal posterior distribution of the number of rate shifts
    ``` {r}
    yuletree <- read.tree("yule.txt")
    edata <- getEventData(yuletree, eventdata = "event_data.txt", burnin=0.01)
    summary(edata)
    ```
    
It is not really necessary to read in _yule.txt_ file because it should be the same tree you simulated (and already stored as yuletree), so this line primarily just illustrates how to read a tree into BAMMtools.

> :thinking: Copy the Shift posterior distribution below this question. The first question above asked "How many diversification rate shifts should BAMM identify in this tree?". Is the value you specified in answering that question the most probable according to the marginal posterior distribution?

{% comment %}
 0      0.900 <- value I predicted is indeed most probable
 1      0.085
 2      0.012
 3      0.001
 4      0.001
{% endcomment %}

### Bayes factor test of zero rate shift model

BAMMtools makes it easy to calculate Bayes Factors. In particular, we may be interested in whether there is evidence of _any_ rate shifts. We can answer this question by computing the Bayes Factor comparing the **zero rate shift model** against the next most probable model, which is, I'm guessing (but you should check the table of marginal probabilities that you provided in answering that last question), the model requiring one rate shift. 

    ## Matrix of Bayes Factors
    ``` {r}
    computeBayesFactors(postburn, expectedNumberOfShifts=1, burnin=0.0)
    ```
    
(Note that I specified burnin=0.0 because our postburn object already accounts for the burnin.)

The command above produced a matrix of all pairwise Bayes Factors. An entry in this matrix is the Bayes Factor **for** the row value and **against** the column value. In our case, we want the value in row 1 and column 0.

> :thinking: What is the Bayes Factor for 1 rate shift and against 0 rate shifts?

{% comment %}
I got 0.18834081 
{% endcomment %}

> :thinking: Does the Bayes Factor you computed constitute evidence for at least one rate shift?

{% comment %}
No, we would only conclude that there is at least one rate shift if the likelihood for 1 shift was greater than the likelihood for 0 rate shifts, but here the likelihood for 0 shifts is more than 5 times higher than the likelihood for 1 shift.
{% endcomment %}

You can plot a comparison of the marginal posterior distribution with the marginal prior distribution of rate shifts using this BAMMtools command:

    ## Plot of marginal prior and marginal posterior for number of rate shifts
    ``` {r}
    p <- plotPrior(postburn, expectedNumberOfShifts=1)
    p
    ```

> :thinking: Does this plot provide evidence that there is information in the data about the number of rate shifts? Explain briefly.

{% comment %}
The marginal posterior distribution differs from the marginal prior distribution, which suggests that there is information in the data. The posterior mean is closer to 0 than is the prior mean, which is good since the true number of rate shifts is 0.
{% endcomment %}

### Calculate the credible set of shift configurations

The **credibleShiftSet** function allows you to enumerate those shift configurations that are most important. The definition of most important is provided by the **threshold** parameter, which says (in this case) to only include edges in which the marginal _posterior_ probability of seeing a rate shift on an edge is at least threshold times higher than the marginal _prior_ probability of seeing a rate shift on that edge. The edges in which this threshold is surpassed are called **core shifts**.

    ## Find the 95% credible set of rate shift configurations
    ``` {r}
    css <- credibleShiftSet(edata, expectedNumberOfShifts=1, threshold=5)
    summary(css)
    ```

> :thinking: How many core shifts were identified? Does this make sense? Explain why or why not.

{% comment %}
0 core shifts were identified, and this makes sense because there should not be any shifts on a Yule tree with constant speciation rate.
{% endcomment %}

In my data, there was only one shift configuration listed and every post-burnin sample belongs to that configuration as indicated by the probability (1.0). Your results may vary.  Plot a summary of the mean speciation rate across the tree as follows:

    ## Plot the 95% credible set
    ``` {r}
    plot.credibleshiftset(css)
    ```

The <tt>f = </tt> at the top of your trees indicates the frequency of a given rate regime among all of your posterior samples (post burnin). You will likely note some apparent hot spots near the present day, which may or may not have circles on the edges. Circles on edges are considered core shifts.

### Best configuration

The plot above is a heat map that represents a mean across all of your post-burnin samples. Which of the 991 post burnin samples is best, and what does that configuration look like if converted to a heat map?

    ## Plot the single best configuration
    ``` {r}
    best <- getBestShiftConfiguration(edata, expectedNumberOfShifts=1, threshold=5)
    plot.bammdata(best, lwd=1.25)
    addBAMMshifts(best, cex=2)
    ```
    
This single best (according to posterior probability) shift scenario shows a gradual cooling in speciation rate from root to tip, but (as you can tell from commenting out the addBAMMshifts command and seeing no change) there are no core shifts in this configuation. 

## What to turn in

Choose _Knit to HTML_ from the _Knit_ dropdown at the top of your BAMM.Rmd window. This will generate a BAMM.html file in your directory. Please send that file to Zach for your lab participation points for today.
