---
layout: page
title: Homework 10
permalink: /hw10/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

{% include figure.html description="Figure 1" url="/assets/img/condvar.png" css="image-center noborder" width="500px" %}

## Conditioning on variability in the Mk model

The python script below will be modified by you to compute the site likelihoods of a 4-taxon tree for 2 characters using the Mk 2-state model. The first of the two characters is constant and the second character is variable. You will use the site likelihood for the constant character to condition the site likelihood for the variable character on the fact that it is variable. You will check your results using PAUP\*.

Be sure to [ask for help](mailto:paul.lewis@uconn.edu) if you get stuck.

## What to do

Login to your student account on the cluster and create a file named _hw10.py_ using nano containing the code below. Edit the _hw10.py_ script in nano, replacing the xx placeholders with meaningful numbers and formulas. Assume the data for characters 1 and 2 are as shown in Figure 1.

    from math import exp, log

    # You do *not* need to modify this function
    # same_list holds the number of edges with the same state at both ends
    #   over all 4 possible combinations of ancestral states
    # v is the edge length (same for all 5 edges in the tree)
    def sitelike(same_list, v):
        probsame = 0.5 + 0.5*exp(-2.*v)
        probdiff = 0.5 - 0.5*exp(-2.*v)
        like = 0.0
        for n in same_list:
            nsame=float(n)
            ndiff=float(5-n)
            like += 0.5*(probsame**nsame)*(probdiff**ndiff)
        return like
    
    # Replace the xx in same1 and same2 with the number of edges having the 
    # same state for all four possible combinations of ancestral states
    same1 = [xx, xx, xx, xx] # 4 possible ancestral state combinations:
    same2 = [xx, xx, xx, xx] #   00, 01, 10, 11

    # Compute the site likelihood for each of the two characters
    # by calling the function sitelike (we'll assume v = 0.1 for
    # all edges.
    v = 0.1
    like1 = sitelike(same1, v)
    like2 = sitelike(same2, v)
    print('Mk model (edge lengths all %.1f):' % v)
    print('  likelihood (char. 1) = %.5f' % like1)
    print('  likelihood (char. 2) = %.5f' % like2)
    
    # TODO: calculate likelihood for character 2 conditioned on variability
    like2cv = xx
    
    print('Mk model (edge lengths all %.1f, conditioning on variability):' % v)
    print('  likelihood (char. 2) = %.5f' % like2cv)
    print('  log-likelihood (char. 2) = %.5f' % log(like2cv))
    
Ensure that you have access to both python3 and PAUP\* on the cluster by loading these modules:

    module load python/3.8.1

Run the _hw10.py_ script as follows:

    python3 hw10.py
    
### The sitelike function

Near the top of your hw10.py file is the definition of a function named <tt>sitelike</tt>. The function <tt>sitelike</tt> has 2 parameters. The first,
<tt>same_list</tt>, is a list of 4 numbers representing the number
of edges (of the 5 total) in which the **state is the same**
at both ends. There are 4 such values because there are 4
possible ancestral state combinations (00, 01, 10, 11) for 2 states (0 and 1). 

The second parameter is <tt>v</tt>, which is the **edge length** to be used for all 5
edges. 

### Checking your answer

Check your answer using PAUP\*. You can get the data for this homework into PAUP\* by creating a nexus file named _hw10.nex_. Your data file will be very similar to the one used for [homework assignment 5](https://plewis.github.io/hw5/) with the exception that the **datatype** specified in the **format statement** should be set to **standard** (not dna) and the states in the data matrix will be **0s and 1s** (not As, Cs, Gs, and Ts). Make a copy of your _hw5.nex_ file and simply change the data and paup block commands.

The paup block you should use is provided below:

    begin paup;
      set crit=like;
    [!
    ***************************************
    *** Not conditioning on variability ***
    ***************************************
    ]  
      lset nst=1 genfreq=equal condvar=no;
      lscores 1 / sitelike userbrlen;

    [!
    ***********************************
    *** Conditioning on variability ***
    ***********************************
    ]
      exclude 1;  
      lset nst=1 genfreq=equal condvar=yes;
      lscores 1 / sitelike userbrlen;
      quit;
    end;

The paup block above has two sections. The first section computes the likelihood for each character without conditioning on variability. (Note that PAUP\* requires you to use **genfreq** rather than **basefreq** if the datatype is standard.) The **exclude 1** statement in the second part is needed in order to exclude the first character (because constant characters are not allowed if condvar is set to yes).

It turns out that the most recent version of PAUP\* installed on the cluster (4a166) will not work for this homework assignment. I have downloaded the current version (4a168) and placed it in the parent directory of your home directory if you are logged into your student account. You can thus run PAUP\* this way from your home directory:

    ../paup168 hw10.nex
    
You can also [download version 4a168 of PAUP\*](http://phylosolutions.com/paup-test/) and run it on your laptop if that is more convenient.

### What if my answer differs from PAUP\*'s answer?

First, make sure you are getting the right site likelihoods without conditioning on variability. About the only thing that can go wrong here is to specify **incorrect numbers for same1 and same2**, so check those again carefully if you are not matching PAUP\*'s answer.

Second, if you are getting the right site likelihoods when not conditioning on variability but not matching when you do condition on variability, be sure you are correctly calculating the probability of the site being variable. This value is 1 minus the probability that a site is constant, and remember that there are **two ways that a site can be constant** (either all 0s or all 1s at the tips).

## What do I turn in?

Please email me ([paul.lewis@uconn.edu](mailto:paul.lewis@uconn.edu)) and attach your python program _hw10.py_ as well as your _hw10.nex_ file to the email. Alternatively, you can send these things to me in a Slack direct message.


