---
layout: page
title: Phylogenetics (EEB 5349)
permalink: /phylogenetics2024/
---
{% comment %}
[Scroll straight to today in the schedule](#today)
{% endcomment %}

This is a graduate-level course in phylogenetics, emphasizing primarily maximum likelihood and Bayesian approaches to estimating phylogenies, which are genealogies at or above the species level. A primary goal is to provide an accessible introduction to the theory so that by the end of the course students should be able to understand much of the primary literature on modern phylogenetic methods and know how to intelligently apply these methods to their own problems. The laboratory provides hands-on experience with several important phylogenetic software packages (PAUP*, IQ-TREE, RevBayes, BayesTraits, and others) and introduces students to the use of remote high performance computing resources to perform phylogenetic analyses.

**Semester:** Spring 2024 <br/>
**Lecture:** Tuesday/Thursday 11:00-12:15 ([Paul O. Lewis](mailto:paul.lewis@uconn.edu), office hours Tu 1-2 or by appointment in Gant w421) <br/>
**Lab:** Thursday 1:25-3:20 ([Analisa Milkey](mailto:analisa.milkey@uconn.edu), office hours: Mo 1:30-2:30, Fr 12-1 in Gant W420) <br/>
**Room:** Torrey Life Science (TLS) 181, Storrs Campus <br/>
**Text:** Lewis, P. O. 2024. _Getting Rooted in Bayesian Phylogenetics_ (unfinished, but some chapters are ready)

## Schedule

Warning: This schedule will most likely change quite a few times during the semester.
{% comment %}
<a name="today"/>
{% endcomment %}

Date               |  Lecture topic                                                                                                                               |  Lab/homework
:----------------: | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------
Tuesday Jan. 16    | **[Introduction](https://gnetum.eeb.uconn.edu/courses/phylogenetics/01-intro-annotated.pdf)**                                                | **Homework 1** [Splits](https://gnetum.eeb.uconn.edu/courses/phylogenetics/hw1-TreeFromSplits.pdf) due 2024-01-23
Thursday Jan. 18   | **[Optimality criteria, search strategies, consensus trees](https://gnetum.eeb.uconn.edu/courses/phylogenetics/02-searching-annotated.pdf)** | **Lab 1** [Using the Xanadu cluster](/xanadu/), [Introduction to PAUP*](/paup/), and [NEXUS file format](/nexus/)
Tuesday Jan. 23    | **[The parsimony criterion](https://gnetum.eeb.uconn.edu/courses/phylogenetics/03-parsimony-annotated.pdf)**                                 | **Homework 2** [Parsimony](https://gnetum.eeb.uconn.edu/courses/phylogenetics/hw2-parsimony.pdf) due 2024-01-30
Thursday Jan 25    | **[Distance methods](https://gnetum.eeb.uconn.edu/courses/phylogenetics/04-distances-annotated.pdf)**                                        | **Lab 2** [Searching](/searching/)
Tuesday Jan. 30    | **[Substitution models](https://gnetum.eeb.uconn.edu/courses/phylogenetics/05-models-annotated.pdf)**                                        | **Homework 3** [Distances](https://gnetum.eeb.uconn.edu/courses/phylogenetics/hw3-distance.pdf) [Python primer](https://plewis.github.io/python/) due 2024-02-06
Thursday Feb. 1    | **Substitution models (cont.)**                                                                                                              | **Lab 3** [Estimating parameters using likelihood](/likelihood/)
Tuesday Feb. 6     | **[Maximum likelihood criterion](https://gnetum.eeb.uconn.edu/courses/phylogenetics/06-likelihood-annotated.pdf)**                           | **Homework 4** [Transitions and transversions](https://gnetum.eeb.uconn.edu/courses/phylogenetics/04-hw4-k80beta.pdf) due 2024-02-15
Thursday Feb. 8    | **[Rate heterogeneity](https://gnetum.eeb.uconn.edu/courses/phylogenetics/07-ratehet-annotated.pdf)**                                        | **Lab 4** [Simulating sequence data](/simulation/)
Tuesday Feb. 13	   | **SNOW DAY (no class)**                                                                                                                      | **Homework 5** [Site likelihood](https://gnetum.eeb.uconn.edu/courses/phylogenetics/hw5-likelihood.pdf) due 2024-02-20
Thursday Feb. 15   | **[Rate het. (finish up)](https://gnetum.eeb.uconn.edu/courses/phylogenetics/07-ratehet2-annotated.pdf), [Bootstrapping](https://gnetum.eeb.uconn.edu/courses/phylogenetics/08-bootstrapping-annotated.pdf), [bootstrap demo in R](https://gnetum.eeb.uconn.edu/courses/phylogenetics/bootstrap.Rmd), [Simulation](https://gnetum.eeb.uconn.edu/courses/phylogenetics/08-simulation-annotated.pdf)** | **Lab 5 [Maximum likelihood analyses with IQ-TREE](/iqtree/)**
Tuesday Feb. 20    | **[Bayes' Rule and Bayesian statistics](https://gnetum.eeb.uconn.edu/courses/phylogenetics/09-bayesrule-annotated.pdf)**                     | **Homework 6** [Rate heterogeneity](/hwratehet/) due 2024-02-27
Thursday Feb. 22   | **[Markov chain Monte Carlo (MCMC)](https://gnetum.eeb.uconn.edu/courses/phylogenetics/10-mcmc-annotated.pdf)**                              | **Lab 6** [Using R to explore probability distributions](/rprobdist/) (Through Exponential, questions 1-19)
Tuesday Feb. 27    | **[MCMC (cont.)](https://gnetum.eeb.uconn.edu/courses/phylogenetics/11-mcmc2-annotated.pdf)**                                                | **Homework 7** [MCMC](/hwmcmc/) due 2024-03-05
Thursday Feb. 29   | **[Model selection](https://gnetum.eeb.uconn.edu/courses/phylogenetics/12-model-selection.pdf)**                                             | **Lab 7** [Using R to explore probability distributions](/rprobdist/) (start with Lognormal, questions 20-29)
Tuesday Mar. 5     | **[Priors](https://gnetum.eeb.uconn.edu/courses/phylogenetics/13-priors-annotated.pdf)**                                                     | **Homework 8** [Bloodroot](/hwbloodroot/) due 2024-03-19
Thursday Mar. 7    | **[Coalescence](https://gnetum.eeb.uconn.edu/courses/phylogenetics/14-coalescence-annotated.pdf)**                                           | **Lab 8** [MrBayes](/mrbayes/)
Tuesday Mar. 12    | **SPRING BREAK**                                                                                                                             |
Thursday Mar. 14   | **SPRING BREAK**                                                                                                                             |
Tuesday Mar.  19   | **[Species trees](https://gnetum.eeb.uconn.edu/courses/phylogenetics/15-species-trees-annotated.pdf)**                                       | **Homework 9** [Taking a step in treespace](/hwlocalmove/)
Thursday Mar. 21   | **[Discrete morphological models](https://gnetum.eeb.uconn.edu/courses/phylogenetics/16-discrete-morph-annotated.pdf)**                      | **Lab 9** [RevBayes](/revbayes/)
Tuesday Mar. 26    | **[rjMCMC and Polytomies](https://gnetum.eeb.uconn.edu/courses/phylogenetics/17a-rjmcmc-polytomy-annotated.pdf)**; **[Evolutionary Correlation](https://gnetum.eeb.uconn.edu/courses/phylogenetics/17b-evol-correlation-annotated.pdf)** | **Homework 10** [Conditioning on variability](/hwcondvar/)
Thursday Mar. 28   | **[Stochastic character mapping](https://gnetum.eeb.uconn.edu/courses/phylogenetics/18a-stochastic-mapping.pdf)**]                           | **Lab 10** [Discrete Morphology in RevBayes](/morph/)
Tuesday Apr. 2     | **[Bloodroot revisited](https://gnetum.eeb.uconn.edu/courses/phylogenetics/sanguinaria-annotated.pdf)**; **[Independent Contrasts](https://gnetum.eeb.uconn.edu/courses/phylogenetics/19a-indep-contrasts-annotated.pdf)**; **[PGLS regression](https://gnetum.eeb.uconn.edu/courses/phylogenetics/19b-pgls-regression-annotated.pdf)** | **Homework 11** [Simulating a character using the Brownian motion model](/hwbmsim/)
Thursday Apr. 4    | **PGLS (cont.)**; **[Phylogenetic signal in continuous traits](https://gnetum.eeb.uconn.edu/courses/phylogenetics/20-signal.pdf)**           | **Lab 11** [BayesTraits](/bayes-traits/)
Tuesday Apr. 9     | **Codon, secondary structure, and amino acid models**                                                                                        | **Homework 12**
Thursday Apr. 11   | **Divergence time estimation**                                                                                                               | **Lab 12**
Tuesday Apr. 16    | **Fossilized birth-death model**                                                                                                             | **Homework 13**
Thursday Apr. 18   | **Diversification rate evolution**                                                                                                           | **Lab 13**
Tuesday Apr. 23    | **Diversification (cont.), Heterotachy, and Covarion models**                                                                                | no homework assignment
Thursday Apr. 25   | **Species delimitation and information**                                                                                                     | **Lab 14**

{% comment %}
Long branch attraction, topology tests
{% endcomment %}

## Index to major topics

[Index for 2024](/index2024/)

## Literature cited

[Literature cited in 2024](/papers2024/)

## Grading

[Grading info](/grading/)

## Books (and book chapters) on phylogenetics

This is a list of books that you should know about, but none are required texts for this course. Listed in reverse chronological order.

LJ Revell and LJ Harmon. 2022. Phylogenetic comparative methods in R. Princeton University Press. [ISBN:978-0-691-21903-5](https://press.princeton.edu/books/paperback/9780691219035/phylogenetic-comparative-methods-in-r)

L Harmon. 2019. **[Phylogenetic comparative methods.](https://lukejharmon.github.io/pcm/)** (Version 1.4, released 15 March 2019). Published online by the author.

AJ Drummond and RR Bouckaert. 2015. Bayesian evolutionary analysis with BEAST, Cambridge University Press. [ISBN:978-1-139-09511-2](https://doi.org/10.1017/CBO9781139095112)

Z Yang. 2014. Molecular evolution: a statistical approach. Oxford University Press. [ISBN:978-0-199-60261-0](https://doi.org/10.1093/sysbio/syv002)

LZ Garamszegi. 2014. Modern phylogenetic comparative methods and their application in evolutionary biology: concepts and practice. Springer-Verlag, Berlin. [ISBN:978-3-662-43549-6](https://doi.org/10.1007/978-3-662-43550-2) (Well-written chapters by current leaders in phylogenetic comparative methods.)

DA Baum and SD Smith. 2013. Tree thinking: an introduction to phylogenetic biology. Roberts and Company Publishers, Greenwood Village, Colorado. [ISBN:978-1-936-22116-5](https://www.amazon.com/Tree-Thinking-Introduction-Phylogenetic-Biology/dp/1936221160) (This book is a useful companion volume for this course, introducing the methods in a very accessible way but also providing lots of practice interpreting phylogenies correctly.)

BG Hall. 2011. Phylogenetic trees made easy: a how-to manual (4th edition). Sinauer Associates, Sunderland. [ISBN:978-0-878-93606-9](https://www.amazon.com/Phylogenetic-Trees-Made-Easy-How/dp/0878936068) (A guide to running some of the most important phylogenetic software packages.)

P Lemey, M Salemi, and AM Vandamme. 2009. The phylogenetic handbook: a practical approach to phylogenetic analysis and hypothesis testing (2nd edition). [ISBN:978-0-511-81904-9](https://www.cambridge.org/core/books/phylogenetic-handbook/A9D63A454E76A5EBCCF1119B3C56D766) Cambridge University Press, Cambridge, UK (Chapters on theory are paired with practical chapters on software related to the theory.)

J Felsenstein. 2004. Inferring phylogenies. Sinauer Associates, Sunderland. [ISBN:978-0-878-93177-4](https://www.amazon.com/Inferring-Phylogenies-Joseph-Felsenstein/dp/0878931775) (Comprehensive overview of both history and methods of phylogenetics.)

R Page and E Holmes. 1998. Molecular evolution: a phylogenetic approach. Blackwell Science. [ISBN:978-0-865-42889-8](https://www.amazon.com/Molecular-Evolution-Roderick-D-M-Page/dp/0865428891) (Very accessible pre-Bayesian-era introduction to the field.)

D Hillis, C Moritz, and B Mable. 1996. Molecular systematics (2nd ed.). Sinauer Associates, Sunderland. [ISBN:978-0-878-93282-5](https://www.amazon.com/Molecular-Systematics-Second-David-Hillis/dp/0878932828) (Still a very valuable compendium of pre-Bayesian-era phylogenetic methods.)

DL Swofford, GJ Olsen, PJ Waddell, and DM Hillis. 1996. Chapter 11: Phylogenetic inference. Pages 407-514 in Molecular Systematics (D. M. Hillis, C. Moritz, and B. K. Mable, eds.). Sinauer Associates, Sunderland, Massachusetts. [ISBN:978-0-878-93282-5](https://www.amazon.com/Molecular-Systematics-Second-David-Hillis/dp/0878932828) (Excellent reference for pre-Bayesian phylogenetics; original description of the SOWH topology test)

