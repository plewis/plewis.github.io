---
layout: page
title: Likelihood Lab
permalink: /likelihood/
---
[Up to the Phylogenetics main page](/phylogenetics2024/)

## Goals

The goal of this lab exercise is to show you how to conduct maximum likelihood analyses in PAUP* using several models, and to decide among competing models using likelihood ratio tests.

## Getting started

Login to your account on the Health Center (Xanadu) cluster:

    ssh username@xanadu-submit-ext.cam.uchc.edu
    
Type the following:

    srun --partition=mcbstudent --qos=mcbstudent --pty bash

to start a session on a node that is not currently running jobs. Once you see the prompt, type

    module load paup/4.0a-166

to load the paup module.

## Create a text file in which to save answers

You will be submitting your answers to the questions posed in the boxes labeled with the :thinking: emoji, so create a text file on your local computer using either BBEdit (if you are a Mac user) or Notepad++ (if you are a Windows user) and **paste the text below into the new text file**. Please place your answer below the line containing the question, and separate your answer from the next question by a blank line to make it easier for us to review.

    Are chlorophyll-b taxa together in the F81 tree?
    answer:
    
    What are the empirical base frequencies for this data set? 
    answer:
    
    What is the log likelihood of this tree under this "empirical base frequencies" version of the F81 model?
    answer:
    
    What proportion of sites are constant? 
    answer:
    
    What are the maximum likelihood estimates (MLEs) of the base frequencies? 
    answer:
    
    What is the log likelihood of this tree under the "estimated base frequencies" version of the F81 model? 
    answer:
    
    What parameters are being estimated using the F81 model?
    answer:
    
    Does this model fit the data better than the "empirical base frequencies" version of the F81 model? 
    answer:
    
    What is the MLE of the transition/transversion ratio under the HKY85 model? 
    answer:
    
    What is the MLE of the transition/transversion _rate_ ratio under the HKY85 model? 
    answer:
    
    What is the log likelihood of this tree under the HKY85 model? 
    answer:
    
    What parameters are being estimated using the HKY85 model? 
    answer:
    
    Does the HKY model fit the data better than the F81 model? 
    answer:
    
    The transition/transversion rate ratio (kappa) is the ___ divided by the ___.
    answer:
    
    The transition/transversion ratio (tratio) is the ___ divided by the ___.
    answer:
    
    What is the MLE of pinvar under the HKY85+I model? 
    answer:
    
    Is the MLE of pinvar larger or smaller than the proportion of constant sites? 
    answer:
    
    Why are these two proportions different? That is, how can a site be constant but not invariable?
    answer:
    
    What is the log likelihood of this tree under the HKY85+I model? 
    answer:
    
    What parameters are being estimated using the HKY85+I model? 
    answer:
    
    What is the MLE of the gamma shape parameter under the HKY85+G model? 
    answer:
    
    What is the log likelihood of this tree under the HKY85+G model? 
    answer:
    
    What parameters are being estimated using the HKY85+G model? 
    answer:
    
    What is the MLE of the gamma shape parameter under the HKY85+I+G model? 
    answer:
    
    What is the MLE of the pinvar parameter under the HKY85+I+G model? 
    answer:
    
    Is the MLE of the shape parameter higher or lower under the HKY85+I+G model compared to the HKY85+G model? Explain why this is so. 
    answer:
    
    What is the log likelihood of this tree under the HKY85+I+G model? 
    answer:
    
    What parameters are being estimated using the HKY85+I+G model? 
    answer:
    
    How many degrees of freedom for this test? 
    answer:
    
    What is the significance (P-value) for this test? 
    answer:
    
    Does allowing for a transition/transversion bias make a significant difference? 
    answer:
    
    What is the likelihood ratio test statistic for a comparison of HKY+I to HKY?
    answer:
    
    What is the critical value for this likelihood ratio test (of HKY vs HKY+I)? That is, what is the smallest likelihood ratio test statistic that would be significant at the 0.05 level?
    answer:
    
    Does the HKY85+I model explain the data significantly better than an equal rates HKY85 model?
    answer:
    
    Does the HKY85+G model explain the data significantly better than an equal rates HKY85 model? 
    answer:
    
    Does the HKY85+G model explain the data better than HKY85+I? Why can't you use a likelihood ratio test to compare these two models?
    answer:
    
    Does the HKY85+I+G model explain the data significantly better than either HKY85+I or HKY85+G alone? 
    answer:
    
    Does the model you have selected place all the chlorophyll-b organisms together?
    answer:

{% comment %}
## Part A: Using PAUP* to check your answers for homework #3

## Create a data file

Create a new file in nano and enter the following text:

    #nexus

    begin paup;
        set storebrlens;
    end; 

    begin data;
        dimensions ntax=4 nchar=2;
        format datatype=dna;
        matrix
            taxon1 AA
            taxon2 AC
            taxon3 CG
            taxon4 TT
        ;
    end;

    begin trees;
        utree hw3 = (taxon1:0.3, taxon2:0.3, (taxon3:0.3, taxon4:0.3):0.3);
    end;

    begin paup;
        lset nst=1 basefreq=equal;
        lscores 1 / userbrlen sitelike;
    end;

## Understanding the data file

The NEXUS file you just created has four blocks. 

### First paup block

The first block is a paup block that sets the `storebrlens` flag. This tells PAUP* to save branch lengths found in any trees. By default, PAUP* immediately throws away any branch lengths that it finds, then estimates them anew according to whatever model is in effect. In this case, we are trying to get PAUP* to compute likelihoods for a tree in which all five branch lengths are set to the specific value 0.3, so it is important to keep PAUP* from discarding the branch lengths.

### Data block

The second block is the data block. Data for two sites are provided, the first site being the one you used for homework #3. The second site is necessary because PAUP* will refuse to calculate the likelihood of a tree with data from only one site. We will simply ignore results for the second (dummy) site.

## Trees block

The third block is a trees block that defines the tree and branch lengths. 
* _'Can you find where in the tree description the length of the central branch is defined?_
The keyword `utree` can be used in PAUP* (but not necessarily other programs) to explicitly define an _unrooted_ tree. The `hw3` part is just an arbitrary name for this tree: you could use any name here.

## Final paup block

The fourth (paup) block comprises an `lset` command that specifies the likelihood settings. The `nst` option specifies the number of substitution parameters, which is 1 for the JC model, and `basefreq=equal` specifies that base frequencies are assumed to be equal. Together, `nst=1` and `basefreq=equal` specify the JC model because the only other model with one substitution parameter is the F81 model (which has unequal base frequencies).

The command `lscores 1` tells PAUP* to compute likelihood scores for the first tree in memory (which is the one we entered in this file). The keyword `userbrlen` tells PAUP* to use the branch lengths in the tree description (i.e. don't estimate branch lengths), and the `sitelike` keyword tells PAUP* to output the individual site likelihoods (the default behavior is to just output the overall likelihood).

Ok, go ahead and execute the file in PAUP*. 

If you haven't yet started on this homework assignment, that's Ok. You will now know the overall site likelihood, but note that you will still have to do the calculation in order to get the component of the likelihood associated with each of the 16 combinations of ancestral states (I don't think there is any way to get PAUP* to give you these numbers).

## Part B:

## Return PAUP* to its factory default settings

In part A, we told PAUP* to use user-defined branch lengths and output site likelihoods whenever the `lscores` command was issued. PAUP* remembers these settings, and sometimes this causes unexpected results. You can cause PAUP* to forget these changes to default settings in one of two ways: 
* restart PAUP*
* use the `factory` command

Because we have to exit PAUP* anyways in order to proceed with the rest of the lab, exit PAUP* instead of issuing the `factory` command.
{% endcomment %}

## Download the data file algae.nex

Download the data file [algae.nex](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/algae.nex) using the following curl command on the cluster:

    curl -Ok https://gnetum.eeb.uconn.edu/courses/phylogenetics/algae.nex
    
If you remember from lecture, adding more parameters to a model to account for different aspects of nucleotide and sequence evolution can -- but does not necessarily -- improve the explanatory ability of a model, or its ability to produce a correct phylogeny. Our goal for this lab will be to see if we can tease apart which aspects of sequence evolution are most important for getting the tree correct. **The accepted phylogeny** (based on much evidence besides these data) **places all the chlorophyll-b-containing plastids together** (Lockhart, Steel, Hendy, and Penny, 1994). 

Thus, there **should be a branch** in the tree separating all taxa from the **two that do not have chlorophyll b**, namely the cyanobacterium **_Anacystis_** (which has chlorophyll a and phycobilin accessory pigments) and the chromophyte **_Olithodiscus_** (which has chlorophylls a and c).

## Obtain the maximum likelihood tree under the F81 model

The first goal is to learn how to obtain maximum likelihood estimates of the parameters in several different substitution models. Use PAUP* to answer the following questions. Start by obtaining the maximum likelihood tree under the F81 model. Create a _run.nex_ file and save it with the following contents:

    #nexus

    begin paup;
        execute algae.nex;
        set criterion=likelihood;
        lset nst=1 basefreq=empirical;
        hsearch;
    end;

The `nst=1` tells PAUP* that we want a model having just one substitution rate parameter (the JC69 and F81 models both fall in this category). The `basefreq=empirical` tells PAUP* that we want to use simple estimates of the base frequencies. The empirical frequency of the base G, for example, is the value you would get if you simply counted up all the Gs in your entire data matrix and divided by the total number of nucleotides. The empirical frequencies are not usually the same as the maximum likelihood estimates (MLEs) of the base frequencies, but they are quick to calculate and often very close to the corresponding MLEs.

Execute _run.nex_ in PAUP* and issue the following command to show the tree:

    showtrees;

One problem is that the tree is drawn in such a way that it appears to be rooted within the flowering plants (tobacco and rice). Specifying the cyanobacterium _Anacystis_ as the outgroup makes more sense biologically:

    outgroup Anacystis_nidulans;
    showtrees;
    
You could also have used this command:

    outgroup 7;
    showtrees;

because _Anacystis_ is the 7th (of 8) taxa in the data matrix.

The edge lengths are not drawn proportional to the expected number of substitutions when using the `showtrees` command. To fix this, use the `describetrees` command rather than the simpler `showtrees` command:

    descr 1 / plot=phylogram;
 
As with all PAUP* commands, it is usually not necessary to type the entire command name, only enough letters that PAUP* can determine unambiguously which command you want. Here, you typed `descr` instead of `describetrees`, and it worked just fine. 

> :thinking: Are chlorophyll-b taxa together in the F81 tree?

{% comment %}
No, Euglena comes out between Anacystis and Olithodiscus instead of with the other chl-b organisms
{% endcomment %}

You will be working with this tree for quite awhile. Resist the temptation to do heuristic searches with each model, as it will be important to compare the performance of all of the models on the _same tree topology_! To be safe, save this tree to a file named `f81.tre` using the `savetrees` command:

    savetrees file=f81.tre brlens;

If you ever need to read this tree back in, use the `gettrees` command:

    gettrees file=f81.tre;

Now get PAUP* to show you the maximum likelihood estimates for the parameters of the F81 model used in this analysis (the 1 here refers to tree 1 in memory):

    lscores 1;

> :thinking: What are the empirical base frequencies for this data set? 

{% comment %}
 A=0.270285 C=0.21751 G=0.31106 U=0.201146
{% endcomment %}

> :thinking: What is the log likelihood of this tree under this "empirical base frequencies" version of the F81 model? (be sure to report the log likelihood, not the negative of the log likelihood.)

{% comment %}
-3351.789 
{% endcomment %}

> :thinking: What proportion of sites are constant? (The `cstatus` command will give you this information) 

{% comment %}
0.716304
{% endcomment %}

## Build paup block as you go

I would like to recommend that, instead of typing commands at the `paup>` prompt, you instead (from now on) edit _run.nex_ and add the new commands to your paup block. Here is a revised _run.nex_ file with a paup block updated to include what we've already done:

    #nexus

    begin paup;
        execute algae.nex;
        set criterion=likelihood;
        lset nst=1 basefreq=empirical;
        [
            hsearch;
            outgroup Anacystis_nidulans;
            showtrees;
            descr 1 / plot=phylogram;
            savetrees file=f81.tre brlens;
        ]
        gettrees file=f81.tre;
        lscores 1;
        [add new commands here]
        quit;
    end;

You'll notice that I've commented out [using square brackets] everything from the `hsearch` command through saving the tree file. We need not do the search over again every time we run this file because the tree and branch lengths resulting from this search are already saved in the file _f81.tre_.

You will also notice that I added a quit command at the end. This causes PAUP* to quit after executing all the commands in the paup block, saving you the trouble of typing `quit` in order to edit the _run.nex_ file in preparation for the next step.

This method (building up a paup block) has the advantage that you always have a document that provides a record of everything you've done. It is very easy to perform an analysis and not be able to repeat it later because you've forgotten some setting you changed along the way.

## Estimate base frequencies

Now estimate the base frequencies on this tree with maximum likelihood by adding the following 3 lines to your paup block just above the quit command (you can replace the [add new commands here] comment). Note how the `lscores` command is used to force PAUP* to recompute the likelihood (under the revised model) and spit out the parameter estimates. 

    [F81 model with estimated base frequencies]
    lset basefreq=estimate;
    lscores 1;

> :thinking: What are the maximum likelihood estimates (MLEs) of the base frequencies? 

{% comment %}
Base frequencies:
  A       0.274515
  C       0.208924
  G       0.289152
  T       0.227409
{% endcomment %}

> :thinking: What is the log likelihood of this tree under the "estimated base frequencies" version of the F81 model? 

{% comment %}
-3348.341
{% endcomment %}

> :thinking: What parameters are being estimated using the F81 model? (Don't forget to include edge length parameters!)

{% comment %}
16: 3 base frequencies plus 13 branch lengths
{% endcomment %}

> :thinking: Does this model fit the data better than the "empirical base frequencies" version of the F81 model? 

{% comment %}
yes, -3348.341 > -3351.789
{% endcomment %}

## Estimate transition/transversion bias

Switch to the HKY85 model now and estimate the transition/transversion ratio along with the base frequencies. The way you specify the HKY model in PAUP* is to tell it you want a model with 2 substitution rate parameters (`nst=2`), and that you want to estimate the base frequencies (`basefreq=estimate`) and the transition/transversion ratio (`tratio=estimated`). Note that these specifications also apply to the F84 model, so if you wanted PAUP* to use the F84 model, you would need to add `variant=f84` to the `lset` command.

    [HKY85 model]
    lset nst=2 basefreq=estimate tratio=estimate;
    lscores 1;
 
> :thinking: What is the MLE of the transition/transversion ratio under the HKY85 model? 

{% comment %}
1.888760
{% endcomment %}

> :thinking: What is the MLE of the transition/transversion _rate_ ratio under the HKY85 model? 

{% comment %}
3.715023
{% endcomment %}

> :thinking: What is the log likelihood of this tree under the HKY85 model? 

{% comment %}
-3268.856
{% endcomment %}

> :thinking: What parameters are being estimated using the HKY85 model? 

{% comment %}
17: 3 base frequencies, 1 rate ratio and 13 branch lengths
{% endcomment %}

> :thinking: Does the HKY model fit the data better than the F81 model? 

{% comment %}
yes, -3268.856 > -3348.341
{% endcomment %}

> :thinking: The transition/transversion rate ratio (kappa) is the `_______` divided by the `_______`.

{% comment %}
The transition/transversion rate ratio (kappa) is the (transition rate) divided by the (transversion rate).
{% endcomment %}

> :thinking: The transition/transversion ratio (tratio) is the `_______` divided by the `_______`.

{% comment %}
The transition/transversion ratio (tratio) is the (expected number of transitions) divided by the (expected number of transversions).
{% endcomment %}

## Estimate the proportion of invariable sites

Now ask PAUP* to estimate pinvar, the proportion of invariable sites, using the command `lset pinvar=estimate`. The HKY85 model with among-site rate heterogeneity modeled using the two-category invariable sites approach is called the HKY85+I model.

> :thinking: What is the MLE of pinvar under the HKY85+I model? 

{% comment %}
0.633067
{% endcomment %}

> :thinking: Is the MLE of pinvar larger or smaller than the proportion of constant sites? 

{% comment %}
0.633067 < 0.716304
{% endcomment %}

> :thinking: Why are these two proportions different? That is, how can a site be constant but not invariable?

{% comment %}
It is possible for a site to show no change if the substitution rate is small but non-zero.
{% endcomment %}

> :thinking: What is the log likelihood of this tree under the HKY85+I model? 

{% comment %}
-3174.729
{% endcomment %}

> :thinking: What parameters are being estimated using the HKY85+I model? 

{% comment %}
18: 3 base frequencies, 1 rate ratio, 1 proportion of invariable sites, and 13 edge lengths
{% endcomment %}

## Estimate the heterogeneity in rates among sites

Now set `pinvar=0` and tell PAUP* to use the discrete gamma distribution with 5 rate categories. Here are the commands for doing this all in one step:

    lset pinvar=0 rates=gamma ncat=5 shape=estimate;
    lscores 1;

The HKY85 model with among-site rate heterogeneity modeled using the discrete gamma approach is called the HKY85+G model.

> :thinking: What is the MLE of the gamma shape parameter under the HKY85+G model? 

{% comment %}
0.260812
{% endcomment %}

> :thinking: What is the log likelihood of this tree under the HKY85+G model? 

{% comment %}
-3171.551
{% endcomment %}

> :thinking: What parameters are being estimated using the HKY85+G model? 

{% comment %}
18: 3 base frequencies, 1 rate ratio, 1 gamma shape, and 13 edge lengths
{% endcomment %}

## Estimate both pinvar and the gamma shape parameter

Now ask PAUP* to estimate both pinvar and the gamma shape parameter simultaneously (the HKY85+I+G model). 

> :thinking: What is the MLE of the gamma shape parameter under the HKY85+I+G model? 

{% comment %}
0.526763
{% endcomment %}

> :thinking: What is the MLE of the pinvar parameter under the HKY85+I+G model? 

{% comment %}
0.313098
{% endcomment %}

> :thinking: Is the MLE of the shape parameter higher or lower under the HKY85+I+G model compared to the HKY85+G model? Explain why this is so. 

{% comment %}
higher: 0.526763 > 0.260812
The discrete gamma rate heterogeneity now needs to account only for the heterogeneity among variable sites, not all sites.
{% endcomment %}
 
> :thinking: What is the log likelihood of this tree under the HKY85+I+G model? 

{% comment %}
-3171.495
{% endcomment %}

> :thinking: What parameters are being estimated using the HKY85+I+G model? 

{% comment %}
19: 3 base frequencies, 1 rate ratio, 1 proportion of invariable sites, 1 gamma shape, and 13 edge lengths
{% endcomment %}

## Likelihood ratio tests

In this section, you will perform some simple likelihood ratio tests to decide which of the models used in the previous section does the best job of explaining the data while keeping the number of parameters used to a minimum.

### Determining significance

A model having k parameters can always attain a higher likelihood than any model having fewer than k parameters that is nested within it (you should be able to explain why this is true), so the question we will be asking is whether more complex (i.e. more parameter-rich) models fit _significantly_ better than simpler nested models. To do this we will assume that the likelihood ratio test statistic LR (equal to twice the difference in log-likelihoods) has the same distribution as a chi-squared random variable with degrees of freedom (d.f.) equal to the difference in the number of estimated parameters in the two models. (A parameter whose value is fixed or which can be determined from the values of other parameters doesn't count as an estimated parameter.)

{% include figure.html description="Chi-squared plot (df=3) showing 5% tail region" url="/assets/img/chisq.png" css="image-right noborder" width="400px" %}

To be specific, we would like to know whether LR falls inside the 5% right tail of the chi-squared distribution (see figure to the right for an example). If it does, then it should be considered an unusually large value of LR; i.e. not a LR value that would normally arise (i.e. falls within the interval that accounts for 95% of the probability distribution) if the models were equivalent explanations of the data. 

We can use R to do the calculation for us. As with PAUP*, the default version of R is old, so load a recent version and start it (`module avail` will show you all available versions of all available software if you are curious):

    module load R/3.6.1
    R

Suppose LR = 6.91 (the difference in log likelihood between the models is 3.455) and d.f. = 1 (one parameter differs between the models). To ask R to tell us what fraction of the 1 d.f. chi-square distribution is to the left of 6.91, use the `pchisq` (chi-squared cumulative probability) command:

    pchisq(6.91, df=1)
    
You should get this response

    [1] 0.9914285
    
which tells us that 99.14285% of the distribution is to the left of 6.91 and thus less than 1% is to the right, which means 6.91 is significantly large (because the probability of seeing a value that large or larger is less than 5%). 

To find the critical value, you can use the `qchisq` (chi-squared quantile) command:

    qchisq(0.95, df=1)
    
This tells us the specific value that we have to exceed in order to be significant. In this case (when d.f.=1), it is 3.841459.

### What parameters make the fit of the model significantly better?

The model with which we will begin is the F81 model with estimated base frequencies. Compare this F81 model to the HKY85 model, which differs from the F81 model only in the fact that it allows transitions and transversions to occur at different rates.

**To calculate the likelihood ratio test statistic LR, subtract the log-likelihood of the less complex model from that of the more complex model and multiply by 2**. This will give you a positive number. If you ever get a negative LR statistic, it means you have the models in the wrong order.

You should have all the numbers you need to perform these likelihood ratio tests. If, however, you have not written some of them down, and thus need to redo some of these analyses, you might need to know how to turn off rate heterogeneity using the following command:

    lset rates=equal pinvar=0;
    
> :thinking: What is the likelihood ratio test statistic for F81 vs. HKY85? 

{% comment %}  
                     F81         HKY       HKY+I       HKY+G     HKY+I+G
 ----------- ----------- ----------- ----------- ----------- -----------
         lnL   -3348.341   -3268.856   -3174.729   -3171.551   -3171.495
      params          16          17          18          18          19
 ----------- ----------- ----------- ----------- ----------- -----------
158.97 = 2*((-3268.856)-(-3348.341))
{% endcomment %}

> :thinking: How many degrees of freedom for this test? 

{% comment %}
1
{% endcomment %}

> :thinking: What is the significance (P-value) for this test? 

{% comment %}
0.0
{% endcomment %}

> :thinking: Does allowing for a transition/transversion bias make a significant difference? 

{% comment %}
yes!
{% endcomment %}

> :thinking: What is the likelihood ratio test statistic for a comparison of HKY+I to HKY?

{% comment %}
188.254 = 2.*((-3174.729)-(-3268.856))
{% endcomment %}

> :thinking: What is the critical value for this likelihood ratio test (of HKY vs HKY+I)? That is, what is the smallest likelihood ratio test statistic that would be significant at the 0.05 level?

{% comment %}
3.841459 = qchisq(0.95, df=1) 
{% endcomment %}

> :thinking: Does the HKY85+I model explain the data significantly better than an equal rates HKY85 model?

{% comment %}
yes! 
{% endcomment %}

> :thinking: Does the HKY85+G model explain the data significantly better than an equal rates HKY85 model? 

{% comment %}
yes! 194.61 = 2.*((-3171.551)-(-3268.856))
{% endcomment %}

> :thinking: Does the HKY85+G model explain the data better than HKY85+I? Why can't you use a likelihood ratio test to compare these two models?

{% comment %}
a. yes: -3171.551 (HKY+G) > -3174.729 (HKY+I)
b. the two models are not nested
{% endcomment %}

> :thinking: Does the HKY85+I+G model explain the data significantly better than either HKY85+I or HKY85+G alone? 

{% comment %}
I+G signif. better than I alone but not better than G alone
HKY+I+G vs. HKY+I: 6.468 = 2.*((-3171.495)-(-3174.729))  
HKY+I+G vs. HKY+G: 0.112 = 2.*((-3171.495)-(-3171.551))
{% endcomment %}

## Repeat search under a better model

Earlier in the lab, you found that the F81 model with empirical base frequencies did not produce the expected tree separating chlorophyll-b organisms from the two (_Anacystis_ and _Olithodiscus_) that lack chlorophyll-b. Would a new search under a better model have the same result?

Using the simplest model that you can defend (of the five we have examined: F81, HKY85, HKY85+I, HKY85+G, HKY85+I+G), perform a heuristic search under the maximum likelihood criterion. To make the analysis go faster, we will ask PAUP* to **not** re-estimate all the model parameters for every tree it examines during the search. To do this, first use the `lset` command to set up the model you are planning to use (be sure to specify `estimate` for all relevant parameters: base frequencies, shape, tratio, etc.). Use the `lscores` command to force PAUP* to re-estimate all of the parameters of your selected model on some tree (the tree just needs to be something reasonable, such as a NJ tree or the F81 tree you have been using). 

Now, re-issue the `lset` command but, for every parameter that you estimated, change the word `estimate` to `previous`. After executing this new `lset` command, start a search using just `hsearch`. PAUP* will fix the parameters at the previous values (i.e. the estimates you just forced it to calculate) and use these same values for every tree examined during the search.

> :thinking: Does the model you have selected place all the chlorophyll-b organisms together?

{% comment %}
yes!
{% endcomment %}

This lab is already a bit long, so we will not take time to do it now, but I hope you realize that you could figure out exactly what parameter(s) are needed in the model to get this tree right. JC69 doesn't do it, nor does F81 (as you may have noticed), but it actually doesn't take much beyond JC69 to do the trick.

{% comment %}
## A challenge
I have simulated a data set under one of the following models: JC69, F81, K80, or HKY85. The data file can be downloaded using the following link: [http://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/simdata.nex simdata.nex].

All of the sites either evolved at the same rate, or rate heterogeneity was added in the form of gamma distributed relative rates with or without some invariable sites. Can you identify which of the four basic models was used, and in addition tell me how much rate heterogeneity was added? 

Hint: start by getting a NJ tree (use paup's `nj` command for this) and estimating all parameters of the most complex model (HKY85+I+G) on that tree. You should be able to tell by examining the parameter estimates which model was used. If it is not clear, you can perform some likelihood ratio tests to see how much significance should be attached to the value of the parameters in question.
{% endcomment %}

## Literature Cited

Lockhart, P. J., Steel, M. A., Hendy, M. D., & Penny, D. 1994. [Recovering evolutionary trees under a more realistic model of sequence evolution.](https://doi.org/10.1093/oxfordjournals.molbev.a040136) Molecular Biology and Evolution 11(4):605–612.
