---
layout: page
title: Weekly Summaries
permalink: /jcsummary/
---

## Spring 2024

### Week 2

Instructions are [here](/jcweek2/).

Simulated datasets using SeqGen with different scaling factors and recorded whether PAUP exhaustive ML search returned true tree. The contents of the file _tree.txt_ was 

    (A:1.0,B:1.0,((C:1.0,D:1.0):1.0,(E:1.0,F:1.0):1.0):1.0) 

and the SeqGen command was:

    seq-gen -mHKY -l10000 -n1 -p1 -t2.0 -on -s1.0 < tree.txt > simdata.nex

Here is a possible result (failed to save actual results).

| scaler  | result | 
| :-----: | :----: |
| 1000.0  |   no   |
| 100.00  |   yes  |
| 10.000  |   yes  |
| 1.0000  |   yes  |
| 0.1000  |   yes  |
| 0.0100  |   yes  |
| 0.0010  |   yes  |
| 0.0001  |   no   |

### Week 3,4

Instructions are [here](/jcweek3/).

Simulated 4 datasets using SeqGen as follows:

    seq-gen -mHKY -l10000 -n1 -p1 -t0.5 -on -s0.00001 < tree.txt > slow.nex
    seq-gen -mHKY -l10000 -n1 -p1 -t0.5 -on -s0.01    < tree.txt > medium.nex
    seq-gen -mHKY -l10000 -n1 -p1 -t0.5 -on -s1.0     < tree.txt > fast.nex
    seq-gen -mHKY -l500   -n1 -p1 -t0.5 -on -s1.0     < tree.txt > fast500.nex

Ran RevBayes on all of these using the instructions at https://plewis.github.io/revbayes/

Medium should have given the highest marginal clade posteriors, with others being less confident because of lower information content. Again, didn't save the results.

### Week 5

Instructions are [here](/jcweek5/).

Used Galax to estimate information content in the simulated data sets. Paul provided both Galax and a Python program (_rb2nxs.py_) that converts RevBayes tree files to NEXUS format tree files so that they can be input to Galax. For example,

    python3 rb2nxs.py medium_run_1.trees medium1.tre
    python3 rb2nxs.py medium_run_2.trees medium2.tre
    python3 rb2nxs.py medium_run_3.trees medium3.tre
    python3 rb2nxs.py medium_run_4.trees medium4.tre

A listfile named _medium-treefiles.txt_ was created that just contained the four NEXUS tree files from one RevBayes run:

    medium1.tre
    medium2.tre
    medium3.tre
    medium4.tre

and galax was run as follows:

    galax --listfile medium-treefiles.txt --skip 1 --outfile medium-output

Here is a key to the columns of output generated by Galax:

| Header | Description                                 |
| :----- | :------------------------------------------ |
|   H    | prior entropy = log(N)                      |
|   H*   | posterior entropy (max = 0.0, min = H)      |
|   I    | information = H - H*                        |
|   Ipct | I as a percentage                           |
|   D    | dissonance (only reported if multiple runs) |
|   Dpct | dissonance as a percentage                  |

Medium should have the most information according to galax, but actual results not saved.

### Week 6

Instructions are [here](/jcweek6/).

Paul provided the Python program _bdtree.py_ that generates a random tree with 6 taxa (stored in _tree.txt_) and a SeqGen script (_sg.sh_). Simulations were performed with `s0.0001` so that there would be low information. Ran RevBayes for 10,000 generations saving every generation. The 4 runs together provide 40,000 samples, which is enough to visit each of the 105 possible tree topologies about 380 times.

Run _rb2nxs.py_ and _galax_ like this to combine independent RevBayes runs:

    python3 rb2nxs.py "test_run_*.trees" test.tre
    galax --treefile test.tre --outfile test-output
    
Running _rb2nxs.py_ like this saves only 50% of the trees:

    python3 rb2nxs.py "test_run_*.trees" test50.tre  50
    
Reduced posterior sample to 50%, 10%, 5%, and 1%. Seems to be an error at the end of the file (945 should be 105 because RevBayes explores unrooted trees).

### Week 7

Instructions are [here](/jcweek7/).

Apparently some issues cropped up in week 6 so this week was a repeat with improved instructions. 

Added variables to the RevBayes script: `datafname`, `treefname`, `logfname`, `mapfname`, and `ignore_data`.

RevBayes instructed to ignore data.

Reduced posterior sample to 50%, 10%, 5%, 1%, 0.05%, and 0.01%. The estimate of information content should start deteriorating (e.g. Ipct > 5) at the smallest of these percentages.

### Week 8

Instructions are [here](/jcweek8/).

This week watch Paul's Evolution meeting address from 2016.

## Week 9

Instructions are [here](/jcweek9/).

This week's goal was to learn how to do array jobs on the cluster. Performed zeroinfo (RevBayes samples from the prior) and hasinfo (specified 0.001 scaler to bdtree2.py to keep information content low). Kept array jobs to just 5 replicates. Once we know everything is working, we can increase to 100s of jobs.

## Week 10

Instructions are [here](/jcweek10/).

Repeated array jobs with new, improved galax (but unclear now what modifications were made to galax). Also created a _summarize.py_ script to summarize results from all the simulation directories.

## Week 11 (April 8-12, 2024)

Instructions are [here](/jcweek11/).

Added dissonance estimation to the array job and read the original paper: [10.1093/sysbio/syw042](https://doi.org/10.1093/sysbio/syw042).

Expect dissonance to be pretty high when information is low and the sample size is much smaller than the number of possible trees.

## Week 12 (April 15-19, 2024)

Instructions are [here](/jcweek12/).

Started analyzing real data provided by ZM.

10000 iterations, sampled every iteration

|    dir  |  coverage  |        H |      H* |        I |     Ipct |    covH |  covIpct |  rawIpct |    Dpct |
| gene30  |   0.99183  | 46.84760 | 6.21007 | 40.63753 | 86.74410 |10.60484 | 41.44116 | 41.69115 | 0.05811 |
| gene26  |   0.91726  | 46.84760 | 7.35336 | 39.49424 | 84.30366 |10.68300 | 31.16764 | 32.67481 | 0.09793 |
| gene28  |   0.92953  | 46.84760 | 9.42355 | 37.42405 | 79.88466 |10.66971 | 11.67943 | 13.45773 | 0.09834 |
| gene34  |   0.99613  | 46.84760 | 5.91821 | 40.92939 | 87.36709 |10.60051 | 44.17053 | 44.26278 | 0.05799 |
| gene21  |   0.92512  | 46.84760 | 8.65577 | 38.19183 | 81.52356 |10.67447 | 18.91145 | 20.79908 | 0.15035 |
| gene32  |   0.98973  | 46.84760 | 5.66063 | 41.18697 | 87.91693 |10.60696 | 46.63286 | 46.85202 | 0.10671 |

## Week 13 (April 22-26, 2024)

Instructions are [here](/jcweek13/).

Same data, but longer runs and more thinning to see if dissonance between runs could be reduced.

100000 iterations, sampled every 10 iterations
 
|    dir | coverage |        H |      H* |        I |     Ipct |     covH  |  covIpct |  rawIpct  |    Dpct |
| gene30 |  0.99161 | 46.84760 | 6.21626 | 40.63134 | 86.73089 | 10.60506  | 41.38402 | 41.62684  | 0.05423 |
| gene26 |  0.91891 | 46.84760 | 7.33674 | 39.51086 | 84.33914 | 10.68120  | 31.31166 | 32.80386  | 0.07742 |
| gene28 |  0.93236 | 46.84760 | 9.41105 | 37.43655 | 79.91135 | 10.66667  | 11.77144 | 13.48282  | 0.07730 |
| gene34 |  0.99637 | 46.84760 | 5.93412 | 40.91348 | 87.33314 | 10.60027  | 44.01917 | 44.11821  | 0.03837 |
| gene21 |  0.92457 | 46.84760 | 8.67267 | 38.17493 | 81.48749 | 10.67506  | 18.75766 | 20.69148  | 0.09840 |
| gene32 |  0.99027 | 46.84760 | 5.63668 | 41.21092 | 87.96805 | 10.60641  | 46.85592 | 47.05958  | 0.07064 |

H  = prior entropy = log(no. unrooted trees for 20 taxa)
H* = posterior entropy

For `gene30`:
* covH    = 10.60506013 = ln(40000/.99161)
* raw prior entropy     = ln(40000) = 10.59663473
* raw posterior entropy = 6.18559
* rawIpct = 41.62684517 = 100.0*(ln(40000) - 6.18559)/ln(40000) 


## Fall 2024

## Week 14 (September 16-20, 2024)

Instructions are [here](/jcweek14/).

This week we began generating data that will be used in the paper. The first table we will need shows how information content estimation fails if the number of samples from the posterior does not greatly exceed the expected number of plausible tree topologies. Perform array jobs in which each of 20 tasks asks RevBayes to sample from the prior (zero info) for problems in which the number of taxa is 9 (`1*3*5*7*9*11*13 = 135,135` unrooted topologies). Each array job examines a different posterior sample size (10k, 100k, 1000k, 10000k) and we expect information to be accurately estimated (i.e. 0.0 information) only for the 1000k and 10000k cases.

Jessica had problems with the last case (10000k), which took 10 hours to run and ended up crashing before finishing. The problem was with the python script rb2nxs.py, which could not handle a file with 10 million lines. It turns out that galax can read revbayes tree files directly, so there was no need for rb2nxs.py anyway.

## Week 15 (September 30 to October 4, 2024)

We skipped a week because Analisa and I were at the ICERM workshop at Brown University on Thursday, Sept. 19.

Instructions are [here](/jcweek15/).

This week we will try the simulations for 10000k samples again using an updated version of galax that reads RevBayes tree files directly without requiring conversion to nexus format. It turns out that there was a bug in a regex specification in galax that was causing tree descriptions containing an `e` in a branch length specification (e.g. `:1.12345e-04`) to be skipped. That has been fixed, and the output for raw entropy now includes two different estimates, one in which the prior entropy is based on the number of samples and the other in which the prior entropy is based on the number of tree topologies.

## Week 16 (October 7-11, 2024)

This week the goal was to finish the prior simulations up to a sample size of 10 million. We adjusted the printfreq variable in the RevBayes script so that only 10 "progress report" lines were generated per run, greatly reducing the amount of disk space required to store the output files. This may have been why some runs were stopped (ran out of allotted disk space).

We started the final 10M run during our meeting on Friday but it failed due to an "out of memory error", revealed using the command 

    sacct --jobs 8414234 --format=jobid%30,state%30
    
Jessica started it again with 20G rather than 10G memory and it worked.

Here is a summary of the "zero info" simulations. Each value shown is a mean over 20 replicate simulations. "I (cc)" is the conditional-clade-based information measure described in the Lewis et al. (2016) paper. "I (simple)" is a version that uses the log uncorrected posterior entropy minus the log sample size (or log number of topologies, if that is smaller than the sample size). All simulations involved unrooted trees of 9 taxa, so there are 135,135 possible tree topologies.

| sample size | I (cc)    | I (simple) |
| :---------: | :-------: | :--------: |
|      1,000  | 11.39635  |  0.07325   |
|     10,000  |  1.257569 |  0.55403   |
|    100,000  |  0.119667 |  6.16813   |
|  1,000,000  |  0.013501 |  0.58872   |
| 10,000,000  |  0.002932 |  0.05908   |

Jessica will redo all but the last of these runs next week because the "I (simple)" column is probably not as precise as the 5 digits above suggest because the values were not calculated by the (older) _summarize.py_ script and instead were computed based on numbers that were reported (which were all rounded to 5 decimal places)

## Week 17 (October 14-18, 2024)

Jessica reran the 1K, 10K, 100K, and 1M sample cases again using the new summarize.py script that reports rawIpct2 and saved the output from each of these runs as files on her local laptop so that we can copy/paste the numbers later for purposes of plotting and calculating means and standard deviations.

Running _summarize.py_ as follows (for e.g. the 1000 sample size case)

    python3 summarize.py > summary1000.txt

allows the output to be saved as a file `summary1000.txt`.

|  sample size |   I (old) |    I (new) |    smaller |
| :----------: | :-------: | :--------: | :--------: |
|      1,000   |  11.38495 |    0.07417 |    0.07417 |
|     10,000   |   1.25584 |    0.55544 |    0.55544 |
|    100,000   |   0.11959 |    3.86551 |    0.11959 |
|   1,000,000  |   0.01350 |   14.99063 |    0.01350 |
|  10,000,000  |   0.00293 |   26.74662 |    0.00293 |

In the table above, "I (old" is the approach using conditional clade probabilities described in the paper and "I (new)" is the new approach using the raw posterior entropy and with prior entropy determined by sample size.

## Week 18 (October 21-25, 2024)

Instructions are [here](/jcweek18/).

Completed the table shown in the Week 17 summary by adding a run that has sample size exactly the same as the number of possible tree topologies, i.e. 135,135.

Also created a table in which data for 1000 and 10,000 sites is used in the RevBayes analysis. In these simulations, we're interested in whether both methods work well when there is a larger amount of information.

## Week 19 (Oct 28 - Nov 1, 2024)

## Week 20 (Nov 4 - Nov 8, 2024)

## Week 21 (Nov 11 - Nov 15, 2024)

This week we spent time going through the presentation I prepared for Systematics Seminar on the Koch paper:

N. Koch. 2021. Phylogenomic subsampling and the search for phylogenetically reliable loci. Molecular Biology and Evolution 38(9):4025-4038. DOI:[10.1093/molbev/msab151](https://doi.org/10.1093/molbev/msab151)

## Week 22 (Nov 18 - Nov 22, 2024)

The goal for this week is to simulate a single replicate phylogenomic data set with 200 loci, estimate individual gene trees for all loci using IQTREE, and sort the loci from "most useful" to "least useful" using Koch's genesortR program.

The simulated data varies from locus to locus in the following attributes:

* sequence length (discrete uniform 50 to 1000)
* edge rate variance (lognormal with mean 1 and variance between 0 and 0.25)
* relative rates among loci (gamma with mean 1 and shape 2, scale 0.5)
* among site rate heterogeneity (gamma with mean 1, shape between 0.1 and 10, and scale=1/shape)
* occupancy fixed to 1.0 due to SMC limitation
* compositional heterogeneity (dirichlet with shape 5 to 500)

Koch's PCA uses the following variables

* proportion variable sites
* average pairwise patristic distances
* clocklikeness
* saturation
* RCFV (relative composition frequency variability)
* average bootstrap support
* RF similarity to the species tree

Instructions are [here](/jcweek22/).



