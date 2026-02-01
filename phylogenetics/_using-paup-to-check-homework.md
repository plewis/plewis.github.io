---
layout: page
title: Using PAUP* to check homework 3
permalink: /paup-hw3/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

## Using PAUP* to check your answers for homework #3

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

