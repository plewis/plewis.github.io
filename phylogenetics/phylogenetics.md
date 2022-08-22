---
layout: page
title: Phylogenetics (EEB 5349)
permalink: /phylogenetics2022/
---
{% comment %}
[Scroll straight to today in the schedule](#today)
{% endcomment %}

This is a graduate-level course in phylogenetics, emphasizing primarily maximum likelihood and Bayesian approaches to estimating phylogenies, which are genealogies at or above the species level. A primary goal is to provide an accessible introduction to the theory so that by the end of the course students should be able to understand much of the primary literature on modern phylogenetic methods and know how to intelligently apply these methods to their own problems. The laboratory provides hands-on experience with several important phylogenetic software packages (PAUP*, IQ-TREE, RevBayes, BayesTraits, and others) and introduces students to the use of remote high performance computing resources to perform phylogenetic analyses.

**Semester:** Spring 2022 <br/>
**Lecture:** Tuesday/Thursday 11:00-12:15 (Paul O. Lewis) <br/>
**Lab:** Thursday 1:25-3:20 (Zach Muscavitch) <br/>
**Room:** Torrey Life Science (TLS) 181, Storrs Campus (but first two weeks are online) <br/>
**Text:** Lewis, P. O. 2022. _Getting Rooted in Bayesian Phylogenetics_ (unfinished, but some chapters are ready)

## Schedule

Date        |  Lecture topic  |  Lab/homework
:---------: | :-------------  | :------------
Tuesday Jan. 18         | **Introduction**<br/>The jargon of phylogenetics (edges, vertices, leaves, degree, split, polytomy, taxon, clade); types of genealogies; rooted vs. unrooted trees; newick descriptions; monophyletic, paraphyletic, and polyphyletic groups [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/1_Intro.pdf)] | **Homework 1**: [Trees From Splits](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2022/hw1_TreeFromSplits.pdf)
Thursday Jan. 20        | **Optimality criteria, search strategies, consensus trees**<br/>Exhaustive enumeration, branch-and-bound search, algorithmic methods (star decomposition, stepwise addition, NJ), heuristic search strategies (NNI, SPR, TBR), evolutionary algorithms; consensus trees [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/SearchingConsensus.pdf)] | **Lab 1**: [Using the Xanadu cluster](/xanadu/), [Introduction to PAUP*](/paup/), and [NEXUS file format](/nexus/)
Tuesday Jan. 25         | **The parsimony criterion**<br/>Strict, semi-strict, and majority-rule consensus trees; maximum agreement subtrees; Camin-Sokal, Wagner, Fitch, Dollo, and transversion parsimony; step matrices and generalized parsimony [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Parsimony.pdf)] [[study questions](/study_questions.md#lecture-3---25-jan-2022)] | **Homework 2**: [Parsimony](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2022/hw2-parsimony.pdf)
Thursday Jan 27         | **Distance methods**<br/>Distance methods: least squares criterion, minimum evolution criterion, neighbor-joining [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Distances.pdf)]  [[study questions](/study_questions.md#lecture-4---27-jan-2022)]| **Lab 2**: [Searching](/searching/)
Tuesday Feb. 1          | **Substitution models**<br/>Instantaneous rates, expected number of substitutions, equilibrium frequencies, JC69 model. Textbook: Ch. 2 (pp. 19-30); Ch. 3 (pp. 35-38). [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Models.pdf)]  [[study questions](/study_questions.md#lecture-5---01-feb-2022)]| **Homework 3**: [Least squares distances](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2022/hw3.pdf) (working through the [Python Primer](/python) first will make this homework much easier)
Thursday Feb. 3         | **Maximum likelihood criterion**<br/>JC distance formula; common substitution models: K2P, F81, F84, HKY85, and GTR; likelihood: the probability of data given a model, likelihood of a “tree” with just one vertex and no edges, why likelihoods are always on the log scale, likelihood ratio tests. \[[Transition Probability Applet](/applets/jc-transition-probabilities/)\] Textbook: Ch. 5 (pp. 57-75) [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Models2.pdf)] [[study questions](/study_questions.md#lecture-6---03-feb-2022)]| **Lab 3**: [Likelihood](/likelihood/) [[slide](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Likelihood-lab-notes.pdf)]
Tuesday Feb. 8         | **Maximum likelihood (cont.)**<br/> Likelihood of a tree with 2 vertices connected by one edge, transition probabilities, maximum likelihood estimates (MLEs) of model parameters, likelihood of a tree. [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Likelihood.pdf)] Textbook: Ch. 4: pp. 47-53 | **Homework 4**: [Site likelihoods](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2022/hw4-likelihood.pdf)
Thursday Feb. 10        | **Bootstrapping, rate heterogeneity**<br/>Non-parametric bootstrapping [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Bootstrapping.pdf)]<br/>**Rate heterogeneity**<br/>Invariable sites model, Discrete gamma model, site-specific rates (partitioned) models, mixture models. Textbook: Ch. 6: pp. 81-92. [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/RateHet.pdf)] | **Lab 4**: [IQ-TREE tutorial](/iqtree/)
Tuesday Feb. 15	        | **Simulation**<br/>How to simulate nucleotide sequence data, and why it’s done [[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Simulation.pdf)] Textbook: Ch. 6: pp. 93-96. | **Homework 5**: [Rate heterogeneity (python program to modify)](/hw5/)
Thursday Feb. 17        | **Long branch attraction, topology tests**<br/>Statistical consistency, long branch attraction, testing the molecular clock, nonparametric bootstrap topology tests (KH/SH/AU), and parametric bootstrapping tests (SOWH). [[LBA slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/LBA.pdf)]  [[Topology test slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/TopologyTests.pdf)] | **Lab 5**: [Simulating sequences](/simulation/)
Tuesday Feb. 22         | **Codon, secondary structure, and amino acid models**<br/>Nonsynonymous vs. synonymous rates, codon models, RNA stem/loop structure, compensatory substitutions, stem models, empirical amino acid rate matrices (PAM, JTT, WAG, LE) \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/AminoAcidRNACodonModels.pdf)\] \[[Diagonalization applet](https://plewis.github.io/applets/diagonalization/)\] | **Homework 6**: [Simulation](/hw6/)
Thursday Feb. 24        | **Bayes' Rule**<br/> Joint, conditional, and marginal probabilities, and how they interact to create Bayes’ Rule; Probability vs. probability density. \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/BayesianIntro.pdf)\] Textbook: Ch. 7 (Bayes' Rule; pp. 101-116) | **Lab 6**: [Using R to explore probability distributions and plot trees](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_R_Primer)
Tuesday Mar. 1          | **Bayesian statistics, MCMC**<br/> Metropolis-Hastings algorithm; mixing, burn-in, trace plots, heated chains, topology proposals, Updating parameters during MCMC. \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/MCMC.pdf)\] \[[MCMC robot applet](/applets/mcmc-robot/)\] | **Homework 7**: [MCMC](/hw7/)
Thursday Mar. 3         | **Prior distributions used in phylogenetics**<br/>  Discrete Uniform (topology), Gamma or Lognormal (kappa, omega), Beta (pinvar), Dirichlet (base frequencies, GTR exchangeabilities); Tree length prior. \[[Dirichlet applet](/applets/dirichlet-prior/)\] \[[Density rain applet](/applets/density-rain/)\] \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/PriorDistributions.pdf)\] Textbook: Ch. 8 (MCMC; pp. 121-146) | **Lab 7**: [To concatenate or not to concatenate, that is the question](/mlchallenge/)
Tuesday Mar. 8         | **Prior distributions (cont.) and CIs**<br/> Running on empty, prior fences, induced priors, hierarchical models, empirical Bayes; Frequentist confidence intervals vs. Bayesian credible intervals \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/ConfidenceCredibleIntervals.pdf)\] \[[CI applet](/applets/ci/)\]| **Homework 8**: [Larget-Simon Local Move](/hw8/)
Thursday Mar. 10        | **Dirichlet Process Prior**<br/> Bayesian non-parametric clustering: examples include BUCKy (genes clustered by topology); PhyloBayes (amino-acid sites clustered by frequency spectra) \[[Stick-breaking applet](/applets/stickbreaking/)\] \[[DPP applet](/applets/dpp/)\] \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/DirichletProcessPriors.pdf)\] | **Lab 8**: [MrBayes](/mrbayes/)
Tuesday Mar. 15         | **SPRING BREAK** |
Thursday Mar. 17        | **SPRING BREAK** |
Tuesday Mar.  22        | **Bayes factors and Bayesian model selection**<br/> Bayes factors, steppingstone estimation of marginal likelihood, BIC vs. AIC \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/BayesianModelSelection.pdf)\] | **Homework 9**: [Dirichlet Process Priors](/hw9/)
Thursday Mar. 24        | **Discrete morphological models**<br/>Introduction to discrete morphological models; Mk model; conditioning on variability. \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/MorphModels.pdf)\] | **Lab 9**: [Introduction to RevBayes](/revbayes/)
Tuesday Mar. 29         | **Polytomies; Pagel's test**<br/> Polytomies and the star tree paradox; reversiblep-jump MCMC; Pagel’s (1994) test for correlated evolution. \[[polytomy slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Polytomies.pdf)\] \[[Pagel slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Pagel.pdf)\]| **Homework 10**: [Mk model and conditioning on variability](/hw10/)
Thursday Mar. 31         | **Stochastic character mapping**<br/> An alternative to Pagel’s (1994) test for assessing whether correlation among characters goes beyond what is expected from inheritance alone. \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/StochasticMapping.pdf)\] \[[additional slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/StochasticMapping2.pdf)\] | **Lab 10**: [RevBayes (discrete morphology analyses)](/morph/)
Tuesday Apr. 5          | **Evolutionary Correlation: Continuous Traits**<br/> Independent Contrasts \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/IndependentContrasts.pdf)\] \[[Brownian Motion applet](/applets/ou/)\] and Phylogenetic Generalized Least Squares (PGLS). \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/PGLS1.pdf)\] | **Homework 11**: [Maddison and Fitzjohn 2015](/hw11/)
Thursday Apr. 7         | **PGLS (cont.)**<br/> Estimating ancestral states in PGLS. Ornstein-Uhlenbeck model vs. Brownian motion. \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/PGLS2.pdf)\] \[[OU applet](/applets/ou/)\] | **Lab 11**: [BayesTraits](/bayes-traits/)
Tuesday Apr. 12         | **Phylogenetic signal in continuous traits**<br/> Measuring the amount of phylogenetic information in continuous traits (Pagel’s lambda, Blomberg’s K). \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/traitsignal.pdf)\] \[[Pagel transformation applet](/applets/pagel/)\] <br/>**[Introduction to the coalescent**<br/>Introduction to coalescent theory \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/coalescent1.pdf)\] | **Homework 12**: [Brownian motion model](/hw12/)
Thursday Apr. 14        | **Multispecies coalescent and species tree estimation**<br/>The multispecies coalescent used to estimate species trees given possibly conflicting gene trees due to deep coalescence, incomplete lineage sorting, and the anomaly zone. \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/MSCoalescent.pdf)\] | **Lab 12**: [Continuous trait analyses in R](/ape/)
Tuesday Apr. 19 |  **Fast species tree methods**<br/> The SVDQuartets and ASTRAL species tree methods. \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Astral-SVDQuartets.pdf)\]<br/> **Divergence time estimation**<br/> Strict vs. relaxed clocks, correlated vs. uncorrelated relaxed clocks, calibrating the clock using fossils. \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/RelaxedClocks1.pdf)\] | **Homework 13**: [Heterotachy](/hw13/)
Thursday Apr. 21        | **Diversification rate evolution**<br/> State-dependent diversification models (BiSSE and its descendants) \[[relaxed clocks part 2 slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/RelaxedClocks2.pdf)\] \[[diversification slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Diversification.pdf)\] | **Lab 13**: [Divergence time estimation](/revdiv/)
<a name="today"/>Tuesday Apr. 26         | **Diversification (cont.), Heterotachy, and Covarion models**<br/> BAMM: estimating the number of shifts in diversification regime and where these occur on the tree; what is heterotachy and how can it be accommodated; the covarion hypothesis and model \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/BAMM-heterotachy-covarion.pdf)\]  | no homework assignment
Thursday Apr. 28        | **Species delimitation and information**<br/> Bayesian species delimitation (BPP), Bayesian information content estimation \[[slides](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/BPPInfo.pdf)\] | **Lab 14**: [BAMM](/bamm/)

## Index to major topics

[Index for 2022](/index2022/)

## Literature cited

[Literature cited in 2022](/papers2022/)

## Grading

[Grading info](/grading/)

## Books (and book chapters) on phylogenetics

This is a list of books that you should know about, but none are required texts for this course. Listed in reverse chronological order.

Harmon, L. 2019. **[Phylogenetic comparative methods.](https://lukejharmon.github.io/pcm/)** (Version 1.4, released 15 March 2019). Published online by the author.

Yang, Z. 2014. **[Molecular evolution: a statistical approach.](https://doi.org/10.1093/sysbio/syv002)** Oxford University Press.

Baum, D. A., and S. D. Smith. 2013. **Tree thinking: an introduction to phylogenetic biology.** Roberts and Company Publishers, Greenwood Village, Colorado. (This book is probably the most useful companion volume for this course, introducing the methods in a very accessible way but also providing lots of practice interpreting phylogenies correctly.)

Garamszegi, L. Z. 2014. **[Modern phylogenetic comparative methods and their application in evolutionary biology: concepts and practice.](https://doi.org/10.1007/978-3-662-43550-2)** Springer-Verlag, Berlin. (Well-written chapters by current leaders in phylogenetic comparative methods.)

Hall, B. G. 2011. **Phylogenetic trees made easy: a how-to manual (4th edition).** Sinauer Associates, Sunderland. (A guide to running some of the most important phylogenetic software packages.)

Lemey, P., Salemi, M., and Vandamme, A.-M. 2009. **The phylogenetic handbook: a practical approach to phylogenetic analysis and hypothesis testing (2nd edition).** Cambridge University Press, Cambridge, UK (Chapters on theory are paired with practical chapters on software related to the theory.)

Felsenstein, J. 2004. **Inferring phylogenies.** Sinauer Associates, Sunderland. (Comprehensive overview of both history and methods of phylogenetics.)

Page, R., and Holmes, E. 1998. **Molecular evolution: a phylogenetic approach.** Blackwell Science (Very nice and accessible pre-Bayesian-era introduction to the field.)

Hillis, D., Moritz, C., and Mable, B. 1996. **Molecular systematics** (2nd ed.). Sinauer Associates, Sunderland. Chapter 12: Applications of molecular systematics. (Still a very valuable compendium of pre-Bayesian-era phylogenetic methods.)

Swofford, D. L., G. J. Olsen, P. J. Waddell, and D. M. Hillis. 1996. Chapter 11: Phylogenetic inference. Pages 407-514 in **Molecular Systematics** (D. M. Hillis, C. Moritz, and B. K. Mable, eds.). Sinauer Associates, Sunderland, Massachusetts. (SOWH topology test)

