---
layout: page
title: Phylogenetics (EEB 5349)
permalink: /phylogenetics2020/
---
This is a graduate-level course in phylogenetics, emphasizing primarily maximum likelihood and Bayesian approaches to estimating phylogenies, which are genealogies at or above the species level. A primary goal is to provide an accessible introduction to the theory so that by the end of the course students should be able to understand much of the primary literature on modern phylogenetic methods and know how to intelligently apply these methods to their own problems. The laboratory provides hands-on experience with several important phylogenetic software packages (PAUP*, IQ-TREE, RAxML, MrBayes, RevBayes, and others) and introduces students to the use of remote high performance computing resources to perform phylogenetic analyses.

**Semester:** Spring 2020 (next taught Spring 2022) <br/>
**Lecture:** Tuesday/Thursday 11:00-12:15 (Paul O. Lewis) <br/>
**Lab:** Friday 1:25-3:20 (Katie Taylor) <br/>
**Room:** Torrey Life Science (TLS) 181, Storrs Campus <br/>
**Text:** none required, registered students will receive PDF copies of a textbook I am currently writing (see list of optional texts below)

## Schedule

Date        |  Lecture topic  |  Lab/homework
:---------: | :-------------  | :------------
Tuesday Jan. 21         | **[Introduction]((https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/1_Intro.pdf))**<br/>The jargon of phylogenetics (edges, vertices, leaves, degree, split, polytomy, taxon, clade); types of genealogies; rooted vs. unrooted trees; newick descriptions; monophyletic, paraphyletic, and polyphyletic groups | Homework 1: [Trees From Splits](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw1_TreeFromSplits.pdf) (due in lecture Jan 28)
Thursday Jan. 23        | **[Optimality criteria, search strategies, consensus trees](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/SearchingConsensus.pdf)**<br/>Exhaustive enumeration, branch-and-bound search, algorithmic methods (star decomposition, stepwise addition, NJ), heuristic search strategies (NNI, SPR, TBR), evolutionary algorithms; consensus trees | Friday Jan. 24 Lab: [Using the Xanadu cluster](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Xanadu_Cluster), [Introduction to PAUP](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Introduction_to_PAUP*), and [NEXUS format](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_NEXUS_Format)
Tuesday Jan. 28         | **[The parsimony criterion](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/Parsimony.pdf)**<br/>Strict, semi-strict, and majority-rule consensus trees; maximum agreement subtrees; Camin-Sokal, Wagner, Fitch, Dollo, and transversion parsimony; step matrices and generalized parsimony | Homework 2: [Parsimony](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw2_Parsimony.pdf)
Thursday Jan 30         | **[Distance methods](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/Distances.pdf)**<br/>Distance methods: least squares criterion, minimum evolution criterion, neighbor-joining | Friday Jan. 31 Lab: [Searching](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Searching_Lab)
Tuesday Feb. 4          | **[Substitution models](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/Models1.pdf)**<br/>Instantaneous rates, expected number of substitutions, equilibrium frequencies, JC69 model. | Homework 3: [Least squares distances](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw3.pdf) (working through the [Python Primer](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Python_Primer) first will make this homework much easier)
Thursday Feb. 6         | **[Maximum likelihood criterion](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/Likelihood1.pdf)**<br/>JC distance formula; common substitution models: K2P, F81, F84, HKY85, and GTR; likelihood: the probability of data given a model, likelihood of a “tree” with just one vertex and no edges, why likelihoods are always on the log scale, likelihood ratio tests. \[[Transition Probability Applet](https://molevolworkshop.github.io/applets/jc-transition-probabilities/)\] | Friday Feb. 7 Lab: [Likelihood](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Likelihood_Lab)
Tuesday Feb. 11         | **[Maximum likelihood (cont.)](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/Likelihood2.pdf)**<br/> Likelihood of a tree with 2 vertices connected by one edge, transition probabilities, maximum likelihood estimates (MLEs) of model parameters, likelihood of a tree. | Homework 4: [Site likelihoods](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw4.pdf)
Thursday Feb. 13        | **[Bootstrapping, rate heterogeneity](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/Bootstrapping.pdf)**<br/>Non-parametric bootstrapping, ultrafast bootstrapping<br/>**[Rate heterogeneity](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/RateHet.pdf)**<br/>Invariable sites model, Discrete gamma model, site-specific rates, mixture models. | Friday, Feb. 14 Lab: [IQ-TREE tutorial](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Using_IQ-TREE_for_multilocus_likelihood_analyses)
Tuesday Feb. 18	        | **[Simulation](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/SimulationLBA.pdf)**<br/>How to simulate nucleotide sequence data, and why it’s done | Homework 5: [Rate heterogeneity](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw5.pdf) ([python program](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw5-template.py) to modify)
Thursday Feb. 20        | **[Long branch attraction, topology tests](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/TopologyTests.pdf)**<br/>Statistical consistency, long branch attraction, KH test, SH test, and AU test. | Friday, Feb. 21 Lab: [Simulating sequence data using PAUP*](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Simulating_sequence_data)
Tuesday Feb. 25         | **[Codon, secondary structure, and amino acid models](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/AminoAcidRNACodonModels.pdf)**<br/>Nonsynonymous vs. synonymous rates, codon models, RNA stem/loop structure, compensatory substitutions, stem models, empirical amino acid rate matrices (PAM, JTT, WAG, LE) | Homework 6: [Simulation](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw6.pdf)
Thursday Feb. 27        | **[Bayes' Rule](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/ExpectedSubstBayesIntro.pdf)**<br/> Joint, conditional, and marginal probabilities, and how they interact to create Bayes’ Rule; calculating the expected number of substitutions per site; rate matrices to transition probability matrices \[[Eigenvector/eigenvalue applet](https://phylogeny.uconn.edu/diagonalization/)\] | Friday, Feb. 28 Lab: [Using HyPhy to test hypotheses](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_HyPhy_Lab)
Tuesday Mar. 3          | **[Bayesian statistics, MCMC](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/BayesianIntro.pdf)**<br/> Probability vs. probability density, Metropolis-Hastings algorithm, mixing, burn-in, trace plots.\[[Archery priors applet](https://phylogeny.uconn.edu/archery-priors/)\] \[[MCMC robot applet](https://phylogeny.uconn.edu/mcmc-robot/)\] | Homework 7: [MCMC](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw7.pdf)
Thursday Mar. 5         | **[Heated chains, topology proposals](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/BayesianPhylogenetics.pdf)**<br/> Metropolis-coupled MCMC (i.e. “heated chains”), algorithms (a.k.a. updaters, moves, operators, proposals) for updating parameters and trees during MCMC. | Friday, Mar. 6 Lab: [Using R to explore probability distributions and plot trees](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_R_Primer)
Tuesday Mar. 10         | **[Prior distributions used in phylogenetics](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/PriorDistributions.pdf)**<br/> Discrete Uniform (topology), Gamma (kappa, omega), Beta (pinvar), Dirichlet (base frequencies, GTR exchangeabilities); Tree length prior; induced split prior. | No homework assigned this week
Thursday Mar. 12        | **Quiz 1**<br/> 20 point quiz on first half of course. Expect some general brief-essay questions about what we’ve covered, and you will be given some choice in which topics to answer. | Friday, Mar. 13 Lab: [MRBAYES](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_MrBayes_Lab)
Tuesday Mar. 17         | **SPRING BREAK** |
Thursday Mar. 19        | **SPRING BREAK** |
Tuesday Mar.  24        | **[Bayesian phylogenetics (continued)](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/DirichletProcessPriors.pdf)**<br/> Dirichlet process priors, credible vs. confidence intervals. \[[CI applet](https://molevolworkshop.github.io/applets/ci/)\] \[[Stick-breaking applet](https://molevolworkshop.github.io/applets/stickbreaking/)\] | Homework: no homework this week
Thursday Mar. 26        | **[Bayes factors and Bayesian model selection](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/MarginalLikelihood-clean.pdf)**<br/> Bayes factors, steppingstone estimation of marginal likelihood. | Friday, Mar. 27 Lab: [Morphology and partitioning in MrBayes](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_Morphology_and_Partitioning_in_MrBayes)
Tuesday Mar. 31         | **[Discrete morphological models](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/MorphModels-markedup.pdf)**<br/> Dirichlet process prior models revisited; introduction to discrete morphological models; Mk model; conditioning on variability. | Homework 8: read and summarize the main points in the [Maddison & Fitzjohn (2015) paper](http://doi.org/10.1093/sysbio/syu070) (please see the [assignment linked here](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/homeworks/2020/hw8.pdf) before starting)
Thursday Apr. 2         | **[Testing for evolutionary dependence](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/BICPagel.pdf)**<br/> BIC; Pagel’s (1994) test for correlated evolution among discrete traits; reversible-jump MCMC. | Friday, Apr. 3 Lab: [BayesTraits](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_BayesTraits_Lab)
Tuesday Apr. 7          | **[Stochastic character mapping](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/StochasticMapping-1pp-scribbles.pdf)**<br/> An alternative to Pagel’s (1994) test for assessing whether correlation among characters goes beyond what is expected from inheritance alone. | Homework 9: Summarize what you plan to do for your course project. What data will you use? Why are these data of interest? What is at least one question you plan to address using these data?
Thursday Apr. 9         | **[Evolutionary Correlation: Continuous Traits](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/IndependentContrasts-1pp-scribbles.pdf)**<br/> Independent Contrasts and Phylogenetic Generalized Least Squares (PGLS). | Friday, Apr. 10 Lab: [Using sMap to perform stochastic mapping analyses](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_SMap_lab)
Tuesday Apr. 14         | **[PGLS (cont.)](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/PGLS2-OU.pdf)**<br/> Estimating ancestral states in PGLS. Ornstein-Uhlenbeck model vs. Brownian motion. \[[OU applet](/applets/ou/)\] | Homework: no homework this week
Thursday Apr. 16        | **[Phylogenetic signal in comparative data](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/signal-1pp-squiggles.pdf)**<br/> Measuring the amount of phylogenetic information in continuous traits (Pagel’s lambda, Blomberg’s K). \[[Pagel transformation applet](/applets/pagel/)\]<br/>**[Introduction to the coalescent](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/Coalescent-1pp-scribbles.pdf)**<br/>Just enough coalescent theory to understand the multispecies coalescent used to estimate species trees given possibly conflicting gene trees. | Friday, Apr. 17 Lab: [APE](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_APE_Lab)
Tuesday Apr. 21         | **[Species Tree Estimation (cont.)](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/speciestrees-1pp-scribbles.pdf)**<br/> Deep coalescence, incomplete lineage sorting, gene tree discordance due to ILS, estimating species trees using the multispecies coalescent. The SVDQuartets and ASTRAL species tree methods. | Homework 10: TBA
Thursday Apr. 23        | **[Divergence time estimation](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/RelaxedClocks-1pp-scribbles.pdf)**<br/> Strict vs. relaxed clocks, correlated vs. uncorrelated relaxed clocks, calibrating the clock using fossils. | Friday, Apr. 24 Lab: [Divergence time estimation with RevBayes](http://hydrodictyon.eeb.uconn.edu/eebedia/index.php/Phylogenetics:_RevBayes_Lab)
Tuesday Apr. 28         | **[Diversification rate evolution](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2020/Diversification-1pp-scribbles.pdf)**<br/> State-dependent diversification models (BiSSE and its descendants); BAMM: estimating the number of shifts in diversification regime and where these occur on the tree. | No homework (work on projects)
Thursday Apr. 30        | **Quiz 2**<br/> Open book, due 8pm Wednesday of finals week (i.e. the end time of our scheduled final exam). | Friday, May 1: Project presentations: please time your presentation to last no longer than 15 minutes, leaving 5 minutes for questions/comments.
Finals week             | Quiz 2 due Wednesday by 8pm |

## Literature cited in lecture

Akaike, H. 1973. Information theory as an extension of the maximum likelihood principle. Pages 267-281 in B. N. Petrov and F. Csaki (eds.), Second International Symposium on Information Theory. Akademiai Kiado, Budapest. (AIC model selection criterion)

Bandelt, H.-J., and A. W. M. Dress. 1992. Split decomposition: a new and useful approach to phylogenetic analysis of distance data. Molecular Phylogenetics and Evolution 1: 242-252.

Brown, J. M., Hedtke, S. M., Lemmon, A. R., and Lemmon, E. M. (2010). When trees grow too long: investigating the causes of highly inaccurate bayesian branch-length estimates. Systematic Biology, 59(2), 145–161.

Buneman, M. 1971. The recovery of trees from measurements of dissimilarity. Pp. 387-395 in Mathematics in the Archeological and Historical Sciences (Hodson, F. R. , Kendall, D. G., and Tautu, P., eds.), Edinburgh Univ. Press, Edinburgh.

Camin, J. H., and R. R. Sokal. 1965. A method for deducing branching sequences in phylogeny. Evolution 19:311-326. (irreversible parsimony)

Cavalli-Sforza, L. L., and A. W. F. Edwards. 1967. Evolution 32:550-570.

Darwin, C. R. 1859. Origin of species by means of natural selection (or the preservation of favoured races in the struggle for life). Originally published by John Murray. This figure from pp. 160-161 in Penguin Classics edition published 1985 by Penguin Books, London.

Dayhoff, M.O., Schwartz, R.M., Orcutt, B.C. 1978. A model for evolutionary change in proteins. Atlas of Protein Sequence and Structure, 5, 345–352. (PAM amino acid model)

Degnan, J. H., and N. A. Rosenberg. 2006. Discordance of species trees with their most likely gene trees. PLoS Genetics 2:e68. (The anomaly zone)

Drummond, A. J., S. Y. W. Ho, M. J. Phillips, A. Rambaut. 2006. Relaxed phylogenetics and dating with confidence. PLoS Biology 4(5): e88 (Uncorrelated relaxed clocks)

Drummond A.J., Suchard M.A. 2010. Bayesian random local clocks, or one rate to rule them all. BMC Biol. 8:114. (Random local clocks)

Eck, R. V., and M. O. Dayhoff. 1966. Atlas of protein sequence and structure. National Biomedical Research Foundation. Silver Spring, Maryland.

Edwards, A. W. F., and L. L. Cavalli-Sforza. 1964. Reconstruction of evolutionary trees. pp. 67-76 in Phenetic and phylogenetic classification, ed. V. H. Heywood and J. McNeill. Systematics Association Publ. No. 6, London.

Fan, Y., Wu, R., Chen, M.-H., Kuo, L., and Lewis, P. O. 2011. Molecular Biology and Evolution 28(1):523-532. (Generalized stepping-stone marginal likelihood estimation)

Farris, J. S. 1974. Formal definitions of paraphyly and polyphyly. Systematic Zoology 23: 548-554.

Farris, J. S. 1989. The retention index and the rescaled consistency index. Cladistics 5: 417-419.

Felsenstein, J. 1981. Evolutionary trees from DNA sequences: a maximum likelihood approach. Journal of Molecular Evolution 17:368-376. (F81 model, pruning algorithm, origin of likelihood-based phylogenetics)

Felsenstein, J. 1983. Statistical inference of phylogenies. Journal of the Royal Statistical Society A 146:246-272. (LRT of molecular clock)

Felsenstein, J. 1985a. Confidence intervals on phylogenies: an approach using the bootstrap. Evolution 39:783-791. (nonparametric bootstrapping)

Felsenstein, J. 1985b. Phylogenies and the comparative method. American Naturalist 125:1-15. (independent contrasts)

Felsenstein, J. 1992. Phylogenies from restriction sites: a maximum-likelihood approach. Evolution 46:159-173. (conditioning on variability in discrete trait likelihood calculations)

Fitch, W. M., and E. Margoliash. 1967. Science 155:279-284.

Fitch, W. 1971. Toward Defining the Course of Evolution: Minimum Change for a Specific Tree Topology. Systematic Zoology 20:406-416.

Goldman, N., and Z. Yang. 1994. A codon-based model of nucleotide substitution for protein-coding DNA sequences. Molecular Biology and Evolution, 11, 725-736. (Goldman-Yang codon model)

Geyer, C. J. 1991. Markov chain Monte Carlo maximum likelihood for dependent data. Pages 156-163 in Computing Science and Statistics (E. Keramidas, ed.). (Metropolis-coupled MCMC a.k.a. heated chains)

Grafen, A. 1989. The phylogenetic regression. Philosophical Transactions of the Royal Society of London. Series B, Biological Sciences 326:119-157. (first phylogenetic regression model)

Hasegawa, M., H. Kishino, and T. Yano. 1985. Dating of the human-ape splitting by a molecular clock of mitochondrial DNA. Journal of Molecular Evolution 21:160-174. (HKY85 model)

Hastings, W. K. 1970. Monte Carlo sampling methods using Markov chains and their applications. Biometrika 57:97-109. (Hastings ratio)

Heath, T. A., Huelsenbeck, J. P., & Stadler, T. 2014. The fossilized birth–death process for coherent calibration of divergence-time estimates. PNAS 111(29):E2957–E2966. (Fossilized birth-death process dating method)

Heled, J., and Drummond, A. J. 2010. Bayesian inference of species trees from multilocus data. Molecular Biology and Evolution 27:570-580. (Bayesian species tree estimation)

Hennig, W. 1966. Phylogenetic systematics. University of Illinois Press, Urbana.

Holder, M. T., Lewis, P. O., Swofford, D. L., and Larget, B. (2005). Hastings ratio of the LOCAL proposal used in Bayesian phylogenetics. Systematic Biology, 54(6), 961–965.

Huelsenbeck, J. P., Jain, S., Frost, S., and Pond, S. 2006. A Dirichlet process model for detecting positive selection in protein-coding DNA sequences. Proceedings of the National Academy USA 103:6263–6268. (DP mixture model for omega)

Huelsenbeck, J. P., and Suchard, M. A. 2007. A nonparametric method for accommodating and testing across-site rate variation. Systematic Biology 56:975–987. (DP model for among site rate heterogeneity)

Jones, D. T., Taylor, W. R., and Thornton, J. M. 1992. The rapid generation of mutation data matrices from protein sequences. Comput Applic Biosci, 8, 275–282. (JTT amino acid model)

Jukes, T. H., and C. R. Cantor. 1969. Evolution of protein molecules. Pages 21-132 in H. N. Munro (ed.), Mammalian Protein Metabolism. Academic Press, New York. (JC69 model)

Kidd, K. K., and Sgaramella-Zonta, L. A. 1971. Phylogenetic analysis: concepts and methods. American Journal of Human Genetics 23: 235-252.

Kimura, M. 1980. A simple method for estimating evolutionary rate of base substitutions through comparative studies of nucleotide sequences. Journal of Molecular Evolution 16:111-120. (K80/K2P model)

Kishino, H., and M. Hasegawa. 1989. Evaluation of the maximum likelihood estimate of the evolutionary tree topologies from DNA sequence data, and the branching order in hominoidea. Journal of Molecular Evolution 29: 170-179. (F84 model, KH test)

Kluge, A. G., and J. S. Farris. 1969. Quantitative phyletics and the evolution of anurans. Systematic Zoology 18:1-32.

Kolaczkowski, B., and J. W. Thornton. 2008. A mixed branch length model of heterotachy improves phylogenetic accuracy. Molecular Biology and Evolution 25:1054–1066. (mixture of edge length sets heterotachy model)

Lanave, C., G. Preparata, C. Saccone, and G. Serio. 1984. A new method for calculating evolutionary substitution rates. Journal of Molecular Evolution 20:86-93. (GTR model)

Larget, B., and D. L. Simon. 1999. Markov chain monte carlo algorithms for the Bayesian analysis of phylogenetic trees. Molecular Biology and Evolution 16: 750-759. (see also Holder et al. 2005)

Lartillot, N., and Philippe, H. 2004. A Bayesian mixture model for across-site heterogeneities in the amino-acid replacement process. Molecular Biology and Evolution, 21:1095–1109. (DP mixture model for amino acid spectra)

Lartillot, N., and H. Philippe. 2006. Computing bayes factors using thermodynamic integration. Systematic Biology 55(2): 195-207. (Thermodynamic integration (a.k.a. path sampling) marginal likelihood estimation)

Le, S. Q., and Gascuel, O. 2008. An improved general amino acid replacement matrix. Molecular Biology and Evolution, 25(7), 1307-1320. (LG amino acid model)

Lewis, P. O. 2001. A likelihood approach to estimating phylogeny from discrete morphological character data. Systematic Biology 50:913-925.

Maddison, W. P. 1997. Gene trees in species trees. Systematic Biology 46: 523–536.

Maddison, D. R., Swofford, D. L., and Maddison, W. P. 1997. NEXUS: An extensible file format for systematic information. Systematic Biology 46:590–617. (NEXUS file format)

Maddison, W. P., and FitzJohn, R. G. 2015. The unsolved challenge to phylogenetic correlation tests for categorical characters. Systematic Biology 64:127–136. (need for true replication in comparative studies)

Martins, E. P., and T. F. Hansen. 1997. Phylogenies and the comparative method: a general approach to incorporating phylogenetic information into the analysis of interspecific data. The American Naturalist 149:646-667. (PGLS)

Metropolis, N., A. W. Rosenbluth, M. N. Rosenbluth, A. H. Teller, and E. Teller. 1953. Equation of state calculations by fast computing machines. J. Chem. Phys. 21:1087-1092. (The Metropolis algorithm used in MCMC)

Michener, C. D., and R. R. Sokal. 1957. A Quantitative Approach to a Problem in Classification. Evolution 11:130-162

Minin, V., Z. Abdo, P. Joyce, and J. Sullivan. 2003. Performance-based selection of likelihood models for phylogeny estimation. Systematic Biology 52:674–683. (DTmodsel model selection criterion)

Muse, S. 1995. evolutionary analyses of DNA sequences subject to constraints on secondary structure. Genetics, 139(3), 1429–1439. (secondary structure model)

Muse, S. V., and B. S. Gaut. 1994. A likelihood approach for comparing synonymous and nonsynonymous substitution rates, with application to the chloroplast genome. Molecular Biology and Evolution, 11, 715-724.

Ota, R., P. J. Waddell, M. Hasegawa, H. Shimodaira, and H. Kishino. 2000. Appropriate likelihood ratio tests and marginal distributions for evolutionary tree models with constraints on parameters. Molecular Biology and Evolution 17:798-803. (LRT border case correction)

Pagel, M. 1994. Detecting correlated evolution on phylogenies: a general method for the comparative analysis of discrete characters. Proceedings of the Royal Society of London B 255:37-45. (assessing evolutionary correlation between two discrete traits)

Pagel, M. 1997. Inferring evolutionary processes from phylogenies. Zoologica Scripta 26:331–348. (introduced kappa scaling factor used in comparative analyses)

Pagel, M. 1999. Inferring the historical patterns of biological evolution. Nature 401:877–884. (introduced the delta and lambda scaling factors used in comparative analyses)

Pagel, M., and A. Meade. 2004. A phylogenetic mixture model for detecting pattern-heterogeneity in gene sequence or character-state data. Systematic Biology 53:571-581. (mixture of Q-matrices model)

Pagel, M., and A. Meade. 2006. Bayesian anaysis of correlated evolution of discrete characters by reversible-jump Markov chain Monte Carlo. American Naturalist 167:808-825. (rjMCMC for discrete character correlation)

Pagel, M., and A. Meade. 2008. Modelling heterotachy in phylogenetic inference by reversible-jump Markov chain Monte Carlo. Phil. Trans. R. Soc. B 363:3955-3964. (rjMCMC heterotachy model)

Pettigrew, J. D. 1991. Wings or Brain? Convergent Evolution in the Origins of Bats. Systematic Zoology, 40(2), 199-216.

Strimmer K., and Rambaut A. 2002. Inferring confidence sets of possibly misspecified gene trees. Proc. Biol. Sci. 269:137–142.

Rannala B., Zhu T., Yang Z. 2012. Tail paradox, partial identifiability, and influential priors in Bayesian branch length inference. Molecular Biology and Evolution. 29:325–335. (Gamma-Dirichlet multivariate edge length prior)

Reeves, J. H. 1992. Heterogeneity in the substitution process of amino acid sites of proteins coded for by mitochondrial DNA. Journal of Molecular Evolution 35:17-31. (+I among-site rate heterogeneity model)

Ronquist, F., Klopfstein, S., Vilhelmsen, L., Schulmeister, S., Murray, D. L., & Rasnitsyn, A. P. 2012. A total-evidence approach to dating with fossils, applied to the early radiation of the hymenoptera. Systematic Biology 61(6):973–999. (Tip dating)

Rzhetsky, A., and Nei, M. 1992. Statistical properties of the ordinary least-squares, generalized least-squares, and minimum-evolution methods of phylogenetic inference. Journal of Molecular Evolution 35: 367-375.

Saitou, N., and M. Nei. 1987. The neighbor-joining method: a new method for reconstructing phylogenetic trees. Molecular Biology and Evolution 4: 406-425. (Neighbor joining method)

Sankoff, D. 1975. Minimal Mutation Trees of Sequences. SIAM Journal on Applied Mathematics 28:35-42. (generalized parsimony, step matrices)

Schwarz, G. E. 1978. Estimating the dimension of a model. Ann Stat. 6:461–464. (BIC model selection criterion)

Shimodaira, H., and M. Hasegawa. 1999. Multiple comparisons of log-likelihoods with applications to phylogenetic inference. Molecular Biology and Evolution 16: 1114-1116. (SH topology test)

Shimodaira H. 2002. An approximately unbiased test of phylogenetic tree selection. Systematic Biology. 51:492–508. (AU topology test)

Stamatakis, A. 2006. Phylogenetic models of rate heterogeneity: a high performance computing perspective. Proceedings 20th. IEEE International Parallel and Distributed Processing Symposium.

Studier, J. A., and K. J. Keppler. 1988. A note on the neighbor-joining algorithm of Saitou and Nei. Molecular Biology and Evolution 5: 729-731. (Neighbor joining speedup)

Swofford, D. L., G. J. Olsen, P. J. Waddell, and D. M. Hillis. 1996. Phylogenetic inference. Pages 407-514 in Molecular Systematics (D. M. Hillis, C. Moritz, and B. K. Mable, eds.). Sinauer Associates, Sunderland, Massachusetts. (SOWH topology test)

Swofford, D. L., Waddell, P. J., Huelsenbeck, J. P., Foster, P. G., Lewis, P. O., and Rogers, J. S. 2001. Bias in Phylogenetic Estimation and Its Relevance to the Choice between Parsimony and Likelihood Methods. Systematic Biology, 50(4), 525–539.

Thorne, J. L., H. Kishino, and I. S. Painter. 1998. Estimating the rate of evolution of the rate of molecular evolution. Molecular Biology and Evolution 15: 1647-1657. (Correlated relaxed clocks)

Tuffley C, Steel M. 1998. Modeling the covarion hypothesis of nucleotide substitution. Math Biosci. 147:63–91. (covarion model)

Van Den Bussche, R., Baker, R., Huelsenbeck, J. P., and Hillis, D. M. 1998. Base compositional bias and phylogenetic analyses: A test of the “flying DNA” hypothesis. Molecular Phylogenetics and Evolution, 10(3), 408–416.

Whelan, S., and N. Goldman. 2001. A general empirical model of protein evolution derived from multiple protein families using a maximum likelihood approach. Molecular Biology and Evolution, 18, 691-699. (WAG amino acid model)

Wiley, E. O. 1981. Phylogenetics: the theory and practice of phylogenetic systematics. John Wiley and Sons, New York.

Xie, W.G., P.O. Lewis, Y. Fan, L. Kuo and M.-H. Chen. 2011. Improving Marginal Likelihood Estimation for Bayesian Phylogenetic Model Selection. Systematic Biology 60(2):150-160. (Stepping-stone marginal likelihood estimation)

Yang, Z. 1993. Maximum-likelihood estimation of phylogeny from DNA sequences when substitution rates differ over sites. Molecular Biology and Evolution 10:1396-1401.

Yang, Z. 1994. Maximum likelihood phylogenetic estimation from DNA sequences with variable rates over sites: approximate methods. Journal of Molecular Evolution 39:306-314. (+G among-site rate heterogeneity model)

Yang, Z., Nielsen, R., and Hasegawa, M. 1998. Models of amino acid substitution and applications to mitochondrial protein evolution. Molecular Biology and Evolution, 15, 1600-1611.

## Books on phylogenetics

This is a list of books that you should know about, but none are required texts for this course. Listed in reverse chronological order.

Harmon, L. 2019. **[Phylogenetic comparative methods.](https://lukejharmon.github.io/pcm/)** (Version 1.4, released 15 March 2019). Published online by the author.

Yang, Z. 2014. **[Molecular evolution: a statistical approach.](https://doi.org/10.1093/sysbio/syv002)** Oxford University Press.

Baum, D. A., and S. D. Smith. 2013. **Tree thinking: an introduction to phylogenetic biology.** Roberts and Company Publishers, Greenwood Village, Colorado. (This book is probably the most useful companion volume for this course, introducing the methods in a very accessible way but also providing lots of practice interpreting phylogenies correctly.)

Garamszegi, L. Z. 2014. **[Modern phylogenetic comparative methods and their application in evolutionary biology: concepts and practice.](https://doi.org/10.1007/978-3-662-43550-2)** Springer-Verlag, Berlin. (Well-written chapters by current leaders in phylogenetic comparative methods.)

Hall, B. G. 2011. **Phylogenetic trees made easy: a how-to manual (4th edition).** Sinauer Associates, Sunderland. (A guide to running some of the most important phylogenetic software packages.)

Lemey, P., Salemi, M., and Vandamme, A.-M. 2009. **The phylogenetic handbook: a practical approach to phylogenetic analysis and hypothesis testing (2nd edition).** Cambridge University Press, Cambridge, UK (Chapters on theory are paired with practical chapters on software related to the theory.)

Felsenstein, J. 2004. **Inferring phylogenies.** Sinauer Associates, Sunderland. (Comprehensive overview of both history and methods of phylogenetics.)

Page, R., and Holmes, E. 1998. **Molecular evolution: a phylogenetic approach.** Blackwell Science (Very nice and accessible pre-Bayesian-era introduction to the field.)

Hillis, D., Moritz, C., and Mable, B. 1996. Molecular systematics (2nd ed.). Sinauer Associates, Sunderland. Chapters 11 (**Phylogenetic inference**) and 12 (**Applications of molecular systematics**). (Still a very valuable compendium of pre-Bayesian-era phylogenetic methods.)
