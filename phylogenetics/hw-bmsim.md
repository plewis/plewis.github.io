---
layout: page
title: Simulate a trait on a tree using the Brownian motion model
permalink: /hw12/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

Your challenge for this homework assignment is to simulate data for a single character under a Brownian motion model on the tree shown below.

![The model tree](/assets/img/bm-sim-tree.png)

## What to do

Assume that the **variance per unit time** ($$\sigma^2$$) equals **0.05** and that the **starting state** ($$s_0$$) equals **0.0**.

Use Python 3.x to draw the states at nodes above the root from a normal distribution. Here is a template:

    from random import seed,normalvariate
    from math import sqrt

    seed(xxx)
    rate = 0.05 # this is sigma squared in the BM model

    s0 = 0.0
    s1 = normalvariate(xxx, xxx)
    s2 = normalvariate(xxx, xxx)
    s3 = normalvariate(xxx, xxx)
    s4 = normalvariate(xxx, xxx)
    s5 = normalvariate(xxx, xxx)
    s6 = normalvariate(xxx, xxx)
    s7 = normalvariate(xxx, xxx)
    s8 = normalvariate(xxx, xxx)

    print("s0 = %12.5f" % s0)
    print("s1 = %12.5f" % s1)
    print("s2 = %12.5f" % s2)
    print("s3 = %12.5f" % s3)
    print("s4 = %12.5f" % s4)
    print("s5 = %12.5f" % s5)
    print("s6 = %12.5f" % s6)
    print("s7 = %12.5f" % s7)
    print("s8 = %12.5f" % s8)

Replace all the **<tt>xxx</tt>** placeholders with either numbers or variable names. The **normalvariate** function takes two arguments. The first argument is the **mean**, the second argument is the **standard deviation**. 

You will first need to choose a pseudorandom number seed. This should be a whole number greater than 0. You can use whatever number you like here.

Remember that, in the Brownian motion (BM) model, variance (i.e. uncertainty) accumulates at the rate $$\sigma^2$$ per unit time. The **trait value at the end of an edge** is normally distributed with **mean** equal to the trait value at the beginning of the edge and **variance** equal to the length of time represented by the edge multiplied by the rate $$\sigma^2$$. Note that I've imported the **sqrt** function so that you can use it to take the square root of the variance (and the square root of the variance is the standard deviation you need to supply to the normalvariate function).

## What to turn in

Please send me (via email or slack) your python3 file that you've modified from the template above.
