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
**Lecture:** Tuesday/Thursday 11:00-12:15 ([Paul O. Lewis](mailto:paul.lewis@uconn.edu), office hours Tu 1-2 or by appointment in Gant W421) <br/>
**Lab:** Thursday 1:25-3:20 ([Analisa Milkey](mailto:analisa.milkey@uconn.edu), office hours: Mo 3-4, Fr 1-2 in Gant W420) <br/>
**Room:** Torrey Life Science (TLS) 181, Storrs Campus <br/>
**Text:** Lewis, P. O. 2024. _Getting Rooted in Bayesian Phylogenetics_ (unfinished, but some chapters are ready)

## Schedule

Warning: This schedule will most likely change quite a few times during the semester.
{% comment %}
<a name="today"/>
{% endcomment %}

Date               |  Lecture topic                                                  |  Lab/homework
:----------------: | :-------------------------------------------------------------- | :------------------------
Tuesday Jan. 20    | **[Trees and optimality criteria](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-01-20-trees-optimality.pdf)**          | **[Homework 1](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-01-20-hw1.pdf)**  
Thursday Jan. 22   | **[Search strategies, consensus trees](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-01-22-optimality-searching.pdf)** | **Lab 1** [Using the HPC cluster](/storrshpc/)
Tuesday Jan. 27    | **Snow Day: no class**                                          | **[Python Primer](/python/),[Homework 2](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-01-27-hw2-distance.pdf)**  
Thursday Jan 29    | **[Agreement subtree](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-01-29-agreement-subtree.pdf), [Mono-,para-,polyphyly,parsimony](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-01-29-mono-para-poly.pdf), and [NJ, Split Decomposition](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-01-29-nj-split-decomp.pdf)** | **Lab 2** [Searching](/searching/)
Tuesday Feb. 3     | **[Substitution models](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-02-03-model.pdf)** | **[Homework 3](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-02-03-hw3-edge-length.pdf)** 
Thursday Feb. 5    | **[Maximum likelihood criterion](https://gnetum.eeb.uconn.edu/courses/phylogenetics/2026-02-05-likelihood.pdf)** | **Lab 3** [Estimating parameters using likelihood](/likelihood/)
Tuesday Feb. 10    | **Rate heterogeneity**                                          | **Individual Meetings**  
Thursday Feb. 12   | **Bootstrapping**                                               | **Lab 4** Simulating sequence data
Tuesday Feb. 17	   | **Simulation**                                                  | **Homework 4**  
Thursday Feb. 19   | **Bayes' Rule and Bayesian statistics**                         | **Lab 5** Maximum likelihood analyses with IQ-TREE
Tuesday Feb. 24    | **Markov chain Monte Carlo (MCMC)**                             | **Homework 5** 
Thursday Feb. 26   | **MCMC (cont.)**                                                | **Lab 6** Using R to explore probability distributions
Tuesday Mar. 3     | **Model selection**                                             | **Homework 6** 
Thursday Mar. 5    | *Priors**                                                       | **Lab 7** TBA
Tuesday Mar. 10    | **Coalescence**                                                 | **Individual Meetings** 
Thursday Mar. 12   | **Species trees**                                               | **Lab 8** TBA
Tuesday Mar. 17    | **SPRING BREAK**                                                | **SPRING BREAK**  
Thursday Mar. 19   | **SPRING BREAK**                                                | **SPRING BREAK**  
Tuesday Mar. 24    | **Codon and amino acid models**                                 | **Homework 7** 
Thursday Mar. 26   | **Discrete morphological models**                               | **Lab 9** RevBayes
Tuesday Mar. 31    | **rjMCMC and Polytomies**; **Evolutionary Correlation**         | **Homework 8** 
Thursday Apr. 2    | **Inferring introgression/hybridization**]                      | **Lab 10** Discrete Morphology in RevBayes
Tuesday Apr. 7     | **Independent Contrasts**; **PGLS regression**                  | **Homework 9** 
Thursday Apr. 9    | **PGLS (cont.)**; **Phylogenetic signal **                      | **Lab 11** BayesTraits
Tuesday Apr. 14    | **Dirichlet Process Priors**                                    | **Individual Meetings** 
Thursday Apr. 16   | **Visit by Dr. Rosana Zenil-Ferguson**;                         | **Lab 12** Comparative methods and diversification in R
Tuesday Apr. 21    | **Relaxed clocks**;                                             | **Homework 10** 
Thursday Apr. 23   | **Heterotachy, and Covarion models**;                           | **Lab 13** Divergence Time Estimation with RevBayes
Tuesday Apr. 28    | **Diversification**                                             | no homework assignment
Thursday Apr. 30   | **Species delimitation and information**                        | **Lab 14** Plotting trees in R with ggtree

## Index to major topics

[Index for 2026](/index2026/)

## Literature cited

[Literature cited in 2026](/papers2026/)

## Grading

[Grading info](/phylogenetics-grading/)

## Books (and book chapters) on phylogenetics

This is a list of books that you should know about (most recent listed first), but none are required texts for this course. I will distribute chapters from a book I am writing that will serve as the textbook for this course.

LJ Revell and LJ Harmon. 2022. **[Phylogenetic comparative methods in R.](https://press.princeton.edu/books/paperback/9780691219035/phylogenetic-comparative-methods-in-r)** Princeton University Press. ISBN:978-0-691-21903-5

C Scornavacca, F Delsuc, and N Galtier. 2020. **[Phylogenetics in the Genomic Era.](https://inria.hal.science/PGE/page/table-of-contents)** No commercial publisher (open access book) ISBN:978-2-9575069-0-3, hal-02535070v3

L Harmon. 2019. **[Phylogenetic comparative methods.](https://lukejharmon.github.io/pcm/)** (Version 1.4, released 15 March 2019). Published online by the author.

AR Ives 2018. **[Mixed and phylogenetic models: a conceptual introduction to correlated data.](https://ives.labs.wisc.edu/pdf/correlateddata.pdf)** [Leanpub](https://leanpub.com/correlateddata)

AJ Drummond and RR Bouckaert. 2015. **[Bayesian evolutionary analysis with BEAST.](https://doi.org/10.1017/CBO9781139095112)** Cambridge University Press. ISBN:978-1-139-09511-2

Z Yang. 2014. **[Molecular evolution: a statistical approach.](https://doi.org/10.1093/sysbio/syv002)** Oxford University Press. ISBN:978-0-199-60261-0

LZ Garamszegi. 2014. **[Modern phylogenetic comparative methods and their application in evolutionary biology: concepts and practice.](https://doi.org/10.1007/978-3-662-43550-2)** Springer-Verlag, Berlin. ISBN:978-3-662-43549-6 (Well-written chapters by current leaders in phylogenetic comparative methods.)

DA Baum and SD Smith. 2013. **[Tree thinking: an introduction to phylogenetic biology.](https://www.amazon.com/Tree-Thinking-Introduction-Phylogenetic-Biology/dp/1936221160)** Roberts and Company Publishers, Greenwood Village, Colorado. ISBN:978-1-936-22116-5 (This book is a useful companion volume for this course, introducing the methods in a very accessible way but also providing lots of practice interpreting phylogenies correctly.)

BG Hall. 2011. **[Phylogenetic trees made easy: a how-to manual.](https://www.amazon.com/Phylogenetic-Trees-Made-Easy-How/dp/0878936068)** (4th edition). Sinauer Associates, Sunderland. ISBN:978-0-878-93606-9 (A guide to running some of the most important phylogenetic software packages.)

P Lemey, M Salemi, and AM Vandamme. 2009. **[The phylogenetic handbook: a practical approach to phylogenetic analysis and hypothesis testing.](https://www.cambridge.org/core/books/phylogenetic-handbook/A9D63A454E76A5EBCCF1119B3C56D766)** (2nd edition). Cambridge University Press, Cambridge, UK. ISBN:978-0-511-81904-9] (Chapters on theory are paired with practical chapters on software related to the theory.)

J Felsenstein. 2004. **[Inferring phylogenies.](https://www.amazon.com/Inferring-Phylogenies-Joseph-Felsenstein/dp/0878931775)** Sinauer Associates, Sunderland. ISBN:978-0-878-93177-4 (Comprehensive overview of both history and methods of phylogenetics.)

R Page and E Holmes. 1998. **[Molecular evolution: a phylogenetic approach.](https://www.amazon.com/Molecular-Evolution-Roderick-D-M-Page/dp/0865428891)** Blackwell Science. ISBN:978-0-865-42889-8 (Very accessible pre-Bayesian-era introduction to the field.)

D Hillis, C Moritz, and B Mable. 1996. **[Molecular systematics.](https://www.amazon.com/Molecular-Systematics-Second-David-Hillis/dp/0878932828)** (2nd ed.). Sinauer Associates, Sunderland. ISBN:978-0-878-93282-5 (Still a very valuable compendium of pre-Bayesian-era phylogenetic methods.)

DL Swofford, GJ Olsen, PJ Waddell, and DM Hillis. 1996. **[Chapter 11: Phylogenetic inference.](https://www.amazon.com/Molecular-Systematics-Second-David-Hillis/dp/0878932828)** Pages 407-514 in Molecular Systematics (D. M. Hillis, C. Moritz, and B. K. Mable, eds.). Sinauer Associates, Sunderland, Massachusetts. ISBN:978-0-878-93282-5 (Excellent reference for pre-Bayesian phylogenetics; original description of the SOWH topology test)
