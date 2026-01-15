---
layout: page
title: Phylogenetics (EEB 5349)
permalink: /phylogenetics2026/
---
{% comment %}
[Scroll straight to today in the schedule](#today)
{% endcomment %}

This is a graduate-level course in phylogenetics, emphasizing primarily maximum likelihood and Bayesian approaches to estimating phylogenies, which are genealogies at or above the species level. A primary goal is to provide an accessible introduction to the theory so that by the end of the course students should be able to understand much of the primary literature on modern phylogenetic methods and know how to intelligently apply these methods to their own problems. The laboratory provides hands-on experience with several important phylogenetic software packages (PAUP*, IQ-TREE, RevBayes, BayesTraits, and others) and introduces students to the use of remote high performance computing resources to perform phylogenetic analyses.

**Semester:** Spring 2026 <br/>
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
Tuesday Jan. 20    | **Introduction**                                                | **Homework 1** Splits 
Thursday Jan. 22   | **Optimality criteria, search strategies, consensus trees**     | **Lab 1** Using the Xanadu cluster(/xanadu/), Introduction to PAUP*(/paup/), and NEXUS file format(/nexus/)
Tuesday Jan. 27    | **The parsimony criterion**                                     | **Homework 2** Parsimony 
Thursday Jan 29    | **Distance methods**                                            | **Lab 2** Searching(/searching/)
Tuesday Feb. 3     | **Substitution models**                                         | **Homework 3** Distances Python primer 
Thursday Feb. 5    | **Substitution models (cont.)**                                 | **Lab 3** Estimating parameters using likelihood(/likelihood/)
Tuesday Feb. 10    | **Maximum likelihood criterion**                                | **Homework 4** Transitions and transversions 
Thursday Feb. 12   | **Rate heterogeneity**                                          | **Lab 4** Simulating sequence data(/simulation/)
Tuesday Feb. 17	   | ** **                                                           | **Homework 5** Site likelihood 
Thursday Feb. 19   | **Bootstrapping, Simulation**                                   | **Lab 5 Maximum likelihood analyses with IQ-TREE(/iqtree/)**
Tuesday Feb. 24    | **Bayes' Rule and Bayesian statistics**                         | **Homework 6** Rate heterogeneity(/hwratehet/) 
Thursday Feb. 26   | **Markov chain Monte Carlo (MCMC)**                             | **Lab 6** Using R to explore probability distributions(/rprobdist/) (Through Exponential, questions 1-19)
Tuesday Mar. 3     | **MCMC (cont.)**                                                | **Homework 7** MCMC(/hwmcmc/) 
Thursday Mar. 5    | **Model selection**                                             | **Lab 7** Using R to explore probability distributions(/rprobdist/) (start with Lognormal, questions 20-29)
Tuesday Mar. 10    | **Priors**                                                      | **Homework 8** Bloodroot(/hwbloodroot/) 
Thursday Mar. 12   | **Coalescence**                                                 | **Lab 8** MrBayes(/mrbayes/)
Tuesday Mar. 17    | **SPRING BREAK**                                                |
Thursday Mar. 19   | **SPRING BREAK**                                                |
Tuesday Mar. 24    | **Species trees**                                               | **Homework 9** Taking a step in treespace(/hwlocalmove/)
Thursday Mar. 26   | **Discrete morphological models**                               | **Lab 9** RevBayes(/revbayes/)
Tuesday Mar. 31    | **rjMCMC and Polytomies**; **Evolutionary Correlation**         | **Homework 10** Conditioning on variability(/hwcondvar/)
Thursday Apr. 2    | **Stochastic character mapping**]                               | **Lab 10** Discrete Morphology in RevBayes(/morph/)
Tuesday Apr. 7     | **Independent Contrasts**; **PGLS regression**                  | **Homework 11** Simulating a character using the Brownian motion model(/hwbmsim/)
Thursday Apr. 9    | **PGLS (cont.)**; **Phylogenetic signal **                      | **Lab 11** BayesTraits(/bayes-traits/)
Tuesday Apr. 14    | **Dirichlet Process Priors**                                    | **Homework 12** Maddison and Fitzjohn (2015)(/hwmandf/)
Thursday Apr. 16   | **Codon and amino acid models**;                                | **Lab 12** Comparative methods and diversification in R(/ape/)
Tuesday Apr. 21    | **Relaxed clocks**;                                             | **Homework 13** Dirichlet process prior(/hwdpp/)
Thursday Apr. 23   | **Heterotachy, and Covarion models**;                           | **Lab 13** Divergence Time Estimation with RevBayes(/revdiv/)
Tuesday Apr. 28    | **Diversification**                                             | no homework assignment
Thursday Apr. 30   | **Species delimitation and information**                        | **Lab 14** Divergence Time Estimation with RevBayes(/revdiv/) (finish); Plotting trees in R with ggtree(/ggtree/) (optional)

## Index to major topics

[Index for 2026](/index2026/)

## Literature cited

[Literature cited in 2026](/papers2026/)

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

