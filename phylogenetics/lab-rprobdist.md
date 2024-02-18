---
layout: page
title: Using R to explore probability distributions
permalink: /rprobdist/
---
[Up to the Phylogenetics main page](/phylogenetics2024/)

## Goals

This lab represents an introduction to the [R computing language](http://www.r-project.org/), which will be useful not only for today's lab, which explores the most common probability distributions used in Bayesian phylogenetics, but also for Phylogenetics software written as R extensions (i.e. APE). This lab also now includes a lab originally written by Kevin Keegan on using ggtree to create publication-quality tree plots.

## Objectives

After completing this lab, you will be able to...

## Copy the template

Copy the text below into a text file to record you answers to questions posed in this lab.

    1. What is the value of beta if alpha is known and the mean must be 1.0? 
    answer: 

    2. Why is the scale parameter beta never estimated when using the Gamma distribution to model among-site rate heterogeneity? 
    answer: 

    3. What is the value of the scale parameter beta if mean = 2 and variance = 4?
    answer: 

    4. What is the value of the shape parameter alpha if mean = 2 and variance = 4 (hint: use the value of beta you just calculated)? 
    answer: 

    5. 
    answer: 

    6. 
    answer: 

    7. 
    answer: 

    8. 
    answer: 

    9. 
    answer: 

    10. 
    answer: 

## Installing R and RStudio on your laptop

[R computing language](http://www.r-project.org/) is one of two general-purpose programming languages that we will use this semester (the other being [Python](https://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Python_Primer)). While R and Python share many similarities, R excels in tasks that involve statistics and creating plots. While a spreadsheet program like Excel can create charts, it is often easier to create the plot you need in R. The purpose of this lab is to introduce you to R by showing you how to make various plots related to probability distributions. This will also enable you to learn about several important probability distributions that serve as prior distributions in Bayesian phylogenetics. This introduction to R will serve us well later in the course when we make use of phylogenetic packages that are written in the R language.

### Installing R

Install R (if you haven't already) by going to the [R project website](http://www.r-project.org/) and following the download instructions for your platform. You will be doing this lab on your own laptop, not the cluster, because much of this lab involves plots, which are most easily generated and displayed on your own laptop. I have installed the latest version of R (which, at this moment, is version 4.3.2, nicknamed "Eye Holes"), but these instructions should work with slightly older versions of R.

### Installing RStudio

We will use R via [RStudio](https://rstudio.com/), which will allows you to manipulate R source code and see the results within the same application window. RStudio is a separate app that you can download from [the RStudio downloads page](https://rstudio.com/products/rstudio/download/).

## Creating plots using R

**Prompt:** To use R, type commands into the console window at the R prompt (`>`). Try the following commands for starters. Note that I've started each line with the `>` character. That `>` character is the R command prompt: you should **type in only what follows the > character**. 

**Comments:** Also, you need not type in the `#` character or any characters that follow `#` on the same line. These represent comments in R, and will be ignored completely by the R interpreter.

    > help()
    
You can get help on a particular topic like this: 

    > help(plot)
    
To search for all help topics that mention the word "gamma":

    > help.search("gamma")
    
That last one will generate a confusing list of topics, some of which do not appear to have anything to do with the word "gamma"! Nevertheless, this search feature is good to know about if you are desperate for information about some topic for which the basic help command turns up nothing. (Google is also an excellent help search tool: start your Google search with a capital letter R followed by a keyword.)

## Creating a histogram

Drawing 1000 standard normal deviates and creating a histogram is as easy as:

    > y <- rnorm(1000, 0, 1)
    
In this case, y will be a list of 1000 random normal (mean 0, std. dev. 1) deviates (a **deviate** is just one draw from the distribution). Note that `<-` means "assign to". You can also use an equal sign here, but the `<-` is preferred, saving `=` for specifying values for arguments in function calls (you will see examples of this below). 

To view the values in the variable `y`, just type the name of the variable:

    > y
    
To create a histogram of the values stored in `y`:

    > hist(y)
    
Important time-saving hint: you can save a lot of typing by using your up-arrow to recall previously-issued commands. You can then modify the previously-issued command and hit the Enter key to submit the modified version.

## Creating a plot

Let's begin by making a simple scatterplot using these data:

    x	y
    1	1
    2	1
    1	3
    4	5
    2	4
    3	5
    4	7
    5	8

In the R console window, enter the data and plot it as follows (remember that you should **not** enter the initial `>` on each line; that's the R prompt):

    > x <- c(1,2,1,4,2,3,4,5)
    > y <- c(1,1,3,5,4,5,7,8)
    > plot(x,y)
    
The `c` in `c(...)` means "combine", so the `c` function's purpose is to combine its arguments. Thus, both `x` and `y` are not single values, but instead each is a collection of 8 numbers. Collections of numbers like this are known as **vectors** in mathematics, or **arrays** or **lists** in many computer programming languages.

## Modifying a plot

R does a fairly nice job of selecting defaults for plots, but I find myself wanting to tweak things. This section explains how to modify various aspects of plots.

### Changing the plotting symbol

Use the `pch` parameter to change the symbol R uses to plot points:

    > plot(x, y, pch=19)
    
Common values for `pch` include 19 (solid dot), 20 (bullet), 21 (circle), 22 (square), 23 (diamond), 24 (up-pointing triangle), and 25 (down-pointing triangle). The stroke and fill color for symbols 21-25 can be changed using the `col` and `bg` parameters. For example, to use red squares with yellow fill, try this:

    > plot(x, y, pch=22, col="red", bg="yellow")
    
See the help topic on `points` for more info:

    > help(points)

### Plot type

The default plot type is `p` for points, but other plot types can be used (use the command `help(plot)` for details). Let's use `"l"` (that's a lower-case L) type to connect our points with lines:

    > plot(x, y, type="l")

Clearly, this is not something that you would want to do with these data, but we will use `type="l"` extensively later in this tutorial. To use both points and lines, set the type to both (`b`):

    > plot(x, y, type="b")

### Line width

To make the line connecting the points thicker, use the `lwd` option (`lwd=1` is the default line width):

    > plot(x,y,type="l",lwd=3)

### Plot and axis labels

The `xlab`, `ylab`, and `main` parameters can be used to change the x-axis label, the y-axis label and the main plot title, respectively:

    > plot(x, y, type="l", xlab="width", ylab="height", main="Leaf width vs. height")

### Losing the box

The `bty` parameter can be set to `"n"` to remove the box around the plot:

    > plot(x, y, type="l", bty="n")

### Losing an axis

The `xaxt` and `yaxt` parameters can be set to `"n"` to remove the x- and y-axis, respectively, from the plot. Here for example is a plot with no y-axis (note that I've also set the y-axis label to an empty string with `ylab=""` and removed the box around the plot with `bty`):

    > plot(x, y, type="l", yaxt="n",ylab="",bty="n")

### Changing axis labeling

It is often desirable to change the values used on the x- or y-axis. You can use the `ylim` parameter to make the y-axis extend from 0 to 10 (instead of the default, which is 1 to 8 in this case because that is the observed range of y values):

    > plot(x, y, type="l", ylim=c(0,10))

Note that there is a little overhang at both ends on the y-axis (the 0 tick mark is slightly above the bottom of the plot and the tick mark for 10 is slightly below the top of the plot). This is because, by default, the y-axis style parameter `yaxs` is set to `"r"`, which causes R to extend the range you defined (using `ylim`) by 4% at each end. You can set `yaxs="i"` to make R strictly honor the limits you set:

    > plot(x, y, type="l", ylim=c(0,10), yaxs="i")
    
You can change the x-axis in the same way using `xlim` and `xaxs` instead of `ylim` and `yaxs`.

## Data frames

The `c(...)` notation used above is fine for small examples, but if you have a lot of data, you will prefer to read in the data from a file. R uses the concept of a data frame to store a collection of data. For example, save the following data in a text file on your hard drive named _myfile.txt_. Be sure to use a plain text editor such as [BBEdit](https://www.barebones.com/products/bbedit/) (Mac) or [Notepad++](https://notepad-plus-plus.org) (Windows), **not** Word (which will add a lot of formatting information that R will not understand):

        one two three four
    A    0   1    2     3
    B    4   5    6     7
    C    8   9   10    11
    D   12  13   14    15

Note that the first row has only 4 elements whereas all others have 5. If the first row contains one fewer elements than the other rows, then R assumes that the first row contains column names.

Use this command to read these data into a data frame:

    > d <- read.table("myfile.txt")
    
If you get an error, it is probably because the current working directory used by R is not the directory in which you stored your file. You can ask R to tell you the current working directory:

    > getwd()

and you can set the current working directory as described below. Assuming that you are using Windows and _myfile.txt_ is stored in _C:\phylogenetics\rlab_:

    > setwd("C:\\phylogenetics\\rlab")  # Windows version

Note that (for rather esoteric reasons) the single backslash characters in the actual path must be replaced by double backslashes in R commands.

If instead you were using a Mac and _myfile.txt_ was stored on your desktop, then you would do this:

    > setwd("~/Desktop")  # Mac version

To ensure that your data were read correctly, simply type `d` to see the contents of the variable you created to hold the data:

    > d
      one two three four
    A   0   1     2    3
    B   4   5     6    7
    C   8   9    10   11
    D  12  13    14   15
    
To extract one column of your stored data frame, use a `$` followed by the column name:

    > col1 <- d$one
    > col1
    [1]  0  4  8 12
    
The `[1]` that starts this line tells you that this is the first line of output; it should not be confused with the actual output, which comprises the numbers 0, 4, 8, and 12.

You can also extract single values, although this is not commonly needed:

    > x <- d[2,3]
    > x
    [1] 6

**Important!** Note that, in R, indices begin with 1. This differs from Python and almost every other programming language, which start counting at 0.

Finally, if you have not named your columns, you can still get, for example, the third column as follows:

    > d[,3]
    [1]  2  6 10 14
    
Note that I've left the row part of the specification empty to tell R that I want to retrieve data from all rows for column 3.

To get the data for the third row, just leave the column specification empty:

    > d[3,]
      one two three four
    C   8   9    10   11

{% comment %}    
This has the undesirable side-effect that the row vector inherits the row and column labels from the data frame. If you want to extract a row from the data frame without the row and column names, it seems you must do it this way:

    > unname(unlist(d[3,]))
    [1]  8  9 10 11
{% endcomment %}    

## Exploring probability distributions using R

R's plotting abilities and its built-in knowledge of many probability distributions used in statistics make it useful for exploring these distributions. The distributions described here are used extensively as prior distributions for parameters in Bayesian phylogenetic analyses, so it is worthwhile to familiarize yourself with their basic properties. With R we can examine them graphically.

### Gamma distribution

The Gamma distribution has two parameters that govern its shape (parameter $\alpha$) and scale (parameter $\beta$). Gamma distributions range from 0.0 to $\infty$, so they provide excellent prior distributions for parameters such as relative rates (e.g. kappa, GTR relative rates, omega) and branch lengths that can be arbitrarily large but not negative.

Here are some basic facts about Gamma distributions:

| ---------------: | :------------------ | 
| Shape parameter  | $\alpha$            |
| Scale parameter  | $\beta$             |
| Mean             | $\alpha \; \beta$   |
| Variance         | $\alpha \; \beta^2$ |
| Density function | $p(x) = \frac{x^{\alpha - 1} e^{-x/\beta}}{\beta^{\alpha} \Gamma(\alpha)}$ |

Note that $\Gamma(\alpha)$ in the density function refers to the gamma _function_ (which is distinct from the Gamma _distribution_). The gamma function is easy to calculate when its argument is a positive integer:

$\Gamma(x) = (x-1)!$

For example, 

$\Gamma(10) = 9! = (9)(8)(7)(6)(5)(4)(3)(2)(1) = 362880$

(you will use this fact a few minutes from now). When, however, the argument is an arbitrary positive real number (which is the usual situation for $\alpha$), then computing it gets more complicated. Fortunately, R handles details like this for us!

> :thinking: What is the value of $\beta$ if $\alpha$ is known and the mean must be 1.0? 

{% comment %}
1/alpha
{% endcomment %}

> :thinking: Why is the scale parameter $\beta$ never estimated when using the Gamma distribution to model among-site rate heterogeneity? 

{% comment %}
The mean relative rate must equal 1. Knowing that the mean of the Gamma distribution used for relative rates must equal 1, the scale parameter beta must equal 1/alpha.
{% endcomment %}

> :thinking: What is the value of the scale parameter $\beta$ if mean = 2 and variance = 4?

{% comment %}
variance = alpha * beta^2 = mean * beta, so beta = variance/mean = 4/2 = 2.
{% endcomment %}

> :thinking: What is the value of the shape parameter $\alpha$ if mean = 2 and variance = 4 (hint: use the value of $\beta$ you just calculated)? 

{% comment %}
variance = alpha * beta^2 = alpha * 4, so alpha = 4/4 = 1.
{% endcomment %}
