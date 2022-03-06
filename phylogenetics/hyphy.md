---
layout: page
title: HyPhy Lab
permalink: /hyphy/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

## Goals

The goal of this lab exercise is to show you how to use the [HyPhy](http://www.hyphy.org/) program for data exploration and hypothesis testing within a maximum likelihood framework. Although much can be done with PAUP* and IQ-TREE, HyPhy lets you to do some interesting and useful things that these programs cannot, such as allowing the model of evolution to change across a tree.

The lab is divided into two parts, both of which recreate analyses done in past papers.

The **first part** is designed to show you **how easy it is to use HyPhy** when what you want to do is available as a canned routine. In this example, we recreate part of the paper by [Wickett et al. 2008](http://dx.doi.org/10.1007/s00239-008-9133-1) in which the goal was to demonstrate that selection is relaxed in a gene no longer being used. [Norm Wickett](http://www.chicagobotanic.org/research/staff/wickett) obtained his Ph.D. in 2007 in Bernard Goffinet's lab in the EEB department at UConn.

The **second part** shows that HyPhy allows you to test hypotheses that are nearly impossible to do with any other software, although going outside HyPhy's collection of canned analyses means you will have to deal with some nitty-gritty details. In this case we recreate an analysis done by [Vandenbussche et al. (1998)](https://doi.org/10.1006/mpev.1998.0531) that required software to be written de novo just for that paper. 

## Getting started

Login to your account on the Health Center (Xanadu) cluster, then issue

    srun --qos=mcbstudent --partition=mcbstudent --pty bash
    
to start a session on a node that is not currently running jobs. Once you see the prompt, type

    module load hyphy/2.5.4
    module load paup/4.0a-166
 
to load the necessary modules. (Remember: the command <tt>module avail</tt> shows a list of all modules.)

## Part 1

Start by creating a new directory called _norm_. Download the dataset (_wickett.nex_) and tree (_wickett.newick_) we will use for this analysis using curl:

    cd ~/norm
    curl -LO http://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/wickett.nex
    curl -LO http://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/wickett.tre

This dataset contains several sequences of bryophytes, including two from a parasitic bryophyte (the liverwort _Aneura mirabilis_) that is not green and does not photosynthesize. The sequences are of a gene important for photosynthesis. The question is, can we detect shifts in the evolution of these sequences at the point where these organisms became non-photosynthetic (thus presumably no longer needing genes like this)?

### PhyloTree

The question we are asking is commonly asked, and is thus available as a canned analysis (RELAX) in HyPhy.

Before running HyPhy, take a look at the _wickett.tre_ file:

    cat wickett.tre
    
Note that the newick tree description has been modified in that 3 edges in the tree have been decorated with the text string <tt>{Foreground}</tt>. This tells HyPhy which edges of the tree are suspected of being under relaxed selection. HyPhy has an online tool that makes it easy to decorate your tree accurately. 

Try downloading the [wickett.tre](http://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/wickett.tre) file to your local computer and then uploading it to the [PhyloTree web app](http://phylotree.hyphy.org/). 

Use the _Input text_ option from the _Newick_ dropdown menu to choose the _wickett.tre_ file you downloaded. Note how 3 edges are labeled with the Foreground tag. Try selecting a different set of edges and selecting Export from the Newick dropdown (don't worry, this will not affect the original file). Note how PhyloTree provides you with the correctly decorated tree description that you can simply copy and paste into your tree file. You need not use the tag <tt>Foreground</tt>; you can use whatever name you like as long as you supply that name for the <tt>--test</tt> option when invoking HyPhy.

### RELAX

Run HyPhy as follows on the cluster:

    hyphy relax --alignment wickett.nex --tree wickett.tre --models Minimal --test Foreground

To save time, we will just do the Minimal analysis. Note that <tt>Foreground</tt> is the tag supplied via the <tt>--test</tt> option. If you had used a different name to tag the interesting edges, you should supply that name here rather than <tt>Foreground</tt>.

What does the HyPhy RELAX analysis conclude? Look for the section of output near the bottom that begins

    ## Test for relaxation (or intensification) of selection [RELAX]
    
While the RELAX analysis is not the same test Norm et al. carried out, the conclusion is the same. This gene formerly important for photosynthesis is experiencing much less stabilizing selection along the edges leading to or within the parasite clade compared to the reference edges in the remainder of the tree.

## Part 2

In this part, we will recreate the very interesting parametric bootstrapping analysis performed in the paper by [Vandenbussche et al. (1998)](https://doi.org/10.1006/mpev.1998.0531) that I [discussed in lecture](https://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/lectures/2022/Simulation.pdf). In short, this paper demonstrated that the "Flying DNA" hypothesis proposed earlier by Pettigrew (1994) was not viable. The Flying DNA hypothesis proposed that microbats and megabats are actually unrelated, but appear as a monophyletic group in phylogenetic trees due to the fact that both have high AT bias in the genes used to reconstruct phylogeny. The idea is that this strong nucleotide composition bias makes convergence much more probable, as there are effectively only two states (A and T) rather than four (A, C, G, T), and phylogenetic methods that are not wise to the change in AT bias mistake such convergence as historical relatedness.

The Vandenbussche et al. paper simulated data under the null hypothesis (micro- and mega-bats are unrelated) but added various amounts of AT bias when simulating the bat lineages. If Pettigrew was correct, trees reconstructed from such data should show bats monophyletic, even though they were not together in the true tree used for the simulation.

This type of simulation required ad hoc software in 1998 because most software that can carry out simulations on phylogenetic trees assumes that the nucleotide frequencies do not change across the tree. Fortunately, these days we have HyPhy, which offers a way to simulate (and analyze) under pretty much any model you can imagine.

{% include figure.html description="Figure 4b from Van Den Bussche et al. (1998)" url="/assets/img/vandenbussche1998fig4b.png" css="image-right noborder" width="300px" %}

Vandenbussche et al. used the K80 (kappa=4) model across most of the tree, but the lineage leading to _Pteropus_ (the lone megabat in the analysis) and the lineages within the microbat clade (_Tonatia bidens_, _Tonatia silvicola_, and their stem lineage) used HKY85 with kappa=4 but nucleotide frequencies that are AT-biased (e.g. piA=0.4, piC=0.1, piG=0.1, piT=0.4). The question is: how much AT-bias does one need to put into the simulation in order to see the convergence that Pettigrew claimed was happening. Our goal will be to recreate the parsimony part of figure 4b from the Vandenbussche paper. We will use HyPhy to simulate the data, and PAUP* to do the parsimony analyses.

### Creating the HyPhy batch file

HyPhy has its own scripting language known as the HyPhy Batch Language (HBL). HyPhy can be run from the command line to carry out phylogenetic analyses that are scripted in HBL, much like running Python to interpret a Python script. 

Start by creating a new file named _bats.bf_ in a directory called _bats_ (you can of course use any name you like, but these are the names I will be using). Also create a directory _simdata_ inside your _bats_ directory.

Download the data we will use for this analysis using curl:

    cd ~/bats
    curl -LO http://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/labs/irbp.nex

This is what your directory structure should look like at this point:

    bats/
        simdata/
        bats.bf
        irbp.nex

Open _bats.bf_ in your favorite text editor (e.g. nano) and enter the following text:

    AUTOMATICALLY_CONVERT_BRANCH_LENGTHS = 1;  
    ACCEPT_ROOTED_TREES = TRUE;  
    ASSUME_REVERSIBLE_MODELS = -1;

    /*****************************************************************************************
    | Read in the data and store the result in the variable nucleotideSequences.
    */
    DataSet nucleotideSequences = ReadDataFile("irbp.nex");

    /*****************************************************************************************
    | Filter the data, specifying which sites are to be used. The first 1 means treat each 
    | site separately (3 would cause the data to be interpreted as codons). The quoted 
    | string (last argument) specifies which sites (where first site = 0) to use (we are 
    | excluding sites with a lot of missing data and or alignment issues). This leaves us with
    | 978 sites rather than the 935 used by Vandenbussche, but it is impossible to determine
    | exactly which sites were excluded in the original study.
    */
    DataSetFilter filteredData = CreateFilter(nucleotideSequences,1,"106-183,190-1089");

    /*****************************************************************************************
    | Store empirical nucleotide frequencies in the variable observedFreqs. The 1,1,1 means
    | unit=1, atom=1, position-specific=1. These settings create one global set of 
    | frequencies (setting, for example, unit=3, atom=3, would tally 64 codon frequencies, 
    | which is not what we need because we will not be using a codon model).
    */
    HarvestFrequencies(observedFreqs, filteredData, 1, 1, 1);
    fprintf(stdout, observedFreqs);
    
### Run bats.bf    

Run your _bats.bf_ file as follows:

    hyphy bats.bf

You should see the empirical nucleotide frequencies displayed as follows:

    {
    {0.1936054742803209}
    {0.3104845052697813}
    {0.3106418121755545}
    {0.1852682082743432}
    }

I have provided copious comments in the batch file to explain what each command is doing. Comments in HyPhy batch files follow the C programming convention: either surround the comment with slash-asterisk delimiters (<tt>/* comment */</tt>) or begin the line with two slashes (<tt>// comment</tt>). The three lines at the beginning will be explained when each becomes relevant.

The <tt>fprintf</tt> command also mimics the C programming language. It allows you to print objects to stdout (standard output). This is a useful tool for performing sanity checks, such as checking to ensure that the frequencies were indeed harvested and stored in the variable <tt>observedFreqs</tt>.

### Define the HKY85 rate matrix

Add the following to the bottom of your bats.bf file:

    /*****************************************************************************************
    | Define the HKY85 model, by combining the substitution matrix with the vector of 
    | empirical frequencies. 
    */
    Model hky1 = (HKY85RateMatrix, observedFreqs);

Now we have a model variable (hky1) that can be applied to each edge of a tree.

### Create a tree representing the null hypothesis

{% include figure.html description="Figure 2a from Van Den Bussche et al. (1998)" url="/assets/img/vandenbussche1998fig2a.png" css="image-center noborder" width="300px" %}

The next step is to create the model tree that we will use for the simulations. The tree topology is from Figure 2a in the Vandenbussche et al. paper. I have estimated the edge lengths and transition/transversion rate ratio (kappa) using PAUP*.

    /*****************************************************************************************
    | Define the tree variable, using the tree description read from the data file.
    | By default, the last defined model (hky1) is assigned to all edges of the tree. 
    */
    Tree constrainedTree = "((((((Homo:0.077544,(Tarsius:0.084863,Galago:0.075292):0.009462):0.026367,((Cynocephalus:0.067955,Tupaia:0.093035):0.016468,(Oryctolagus:0.093866,Mus:0.143079):0.013506):0.017052,Pteropus:0.102675):0.008768,Bos:0.099273):0.007976,(Tonatia_bidens:0.008137,Tonatia_silvicola:0)microbats:0.096022):0.013987,Felis:0.044428):0.043248,Didelphis:0.247617)";

### Creating the second model

Hopefully everything we've done so far in HyPhy makes sense. Now comes the tricky part! We need to create a second HKY85 model that has elevated A and T frequencies, and that model needs to be applied to only certain edges in the tree. Right now, the <tt>hky1</tt> model has been applied to every node in the tree. You can verify this using the following HBL code:

    GetInformation(modelMap, constrainedTree);
    fprintf(stdout, modelMap);

Add the two lines above to the bottom of your _bats.bf_ file and run it. You should see this near the bottom of your output:

    {
     "Bos":"hky1",
     "Cynocephalus":"hky1",
     "Didelphis":"hky1",
     "Felis":"hky1",
     "Galago":"hky1",
     "Homo":"hky1",
     "Mus":"hky1",
     "Node1":"hky1",
     "Node10":"hky1",
     "Node11":"hky1",
     "Node14":"hky1",
     "Node19":"hky1",
     "Node2":"hky1",
     "Node3":"hky1",
     "Node4":"hky1",
     "Node5":"hky1",
     "Node7":"hky1",
     "Oryctolagus":"hky1",
     "Pteropus":"hky1",
     "Tarsius":"hky1",
     "Tonatia_bidens":"hky1",
     "Tonatia_silvicola":"hky1",
     "Tupaia":"hky1"
    }

Create a second model named <tt>hky2</tt> and apply it to four specific edges in the tree:

    /*****************************************************************************************
    | Define a second AT-rich HKY85 model named hky2 and apply it to selected edges. 
    */
    highATfreqs = { {.45}{.05}{.05}{.45} };
    Model hky2 = (HKY85RateMatrix, highATfreqs);
    SetParameter(constrainedTree.microbats, MODEL, hky2);
    SetParameter(constrainedTree.Tonatia_bidens, MODEL, hky2);
    SetParameter(constrainedTree.Tonatia_silvicola, MODEL, hky2);
    SetParameter(constrainedTree.Pteropus, MODEL, hky2);

If you move your <tt>GetInformation</tt> call and its accompanying <tt>fprintf</tt> after these 6 lines, then you should see this in the output:

    {
     "Bos":"hky1",
     "Cynocephalus":"hky1",
     "Didelphis":"hky1",
     "Felis":"hky1",
     "Galago":"hky1",
     "Homo":"hky1",
     "Mus":"hky1",
     "Node1":"hky1",
     "Node10":"hky1",
     "Node11":"hky1",
     "Node14":"hky1",
     "Node2":"hky1",
     "Node3":"hky1",
     "Node4":"hky1",
     "Node5":"hky1",
     "Node7":"hky1",
     "Oryctolagus":"hky1",
     "Pteropus":"hky2",
     "Tarsius":"hky1",
     "Tonatia_bidens":"hky2",
     "Tonatia_silvicola":"hky2",
     "Tupaia":"hky1",
     "microbats":"hky2"
    }
    
### Don't get too comfortable just yet    

It is great to sit back and admire your work thus far, but there is a small problem looming just below the surface. Let's print out all the edge lengths in the tree:

    fprintf(stdout, "\n\nCurrent edge lengths:\n");
    edgeNames 	= BranchName(constrainedTree,-1); 
    edgeLengths	= BranchLength(constrainedTree,-1);
    for (k = 0; k < Columns(edgeNames) - 1; k = k + 1) {
	    fprintf(stdout, Format(edgeLengths[k],10,5), "  ", edgeNames[k], "\n");
    }

The first line simply skips a couple of lines (<tt>\n\n</tt>) and prints a header announcing that current edge lengths will follow.

The second and third lines ask HyPhy for the names of all branches and the lengths of all branches. The -1 in these functions means "give me all of them". (If you used 5 rather than -1, it would give you the name of the edge having index 5.)

The last 3 lines create a loop in which the variable <tt>k</tt> ranges from 0 to the number of edges minus 1. For each value of <tt>k</tt>, the <tt>fprintf</tt> statement prints out the length of edge <tt>k</tt> (the <tt>Format</tt> command causes it to use exactly 10 spaces and 5 decimal places) followed by a couple of spaces and then the name of edge <tt>k</tt>. The newline character (<tt>"\n"</tt>) at the end of the <tt>fprintf</tt> statement causes a carriage return so that the edge lengths and names do not all end up on the same line of output.

After running _bats.bf_, what possibly important detail do you notice about the lengths of the edges to which we attached the <tt>hky2</tt> model?  

### Fixing up edge lengths

The problem is that applying a new model to the 4 edge lengths caused the edge length information to be erased! We need to now set the <tt>betat</tt> parameter for each of those edges to be compatible with the edge lengths that were originally there. 

This process is a bit more tedious than I would like, so you'll have to bear with me through this next section. The <tt>AUTOMATICALLY_CONVERT_BRANCH_LENGTHS = 1</tt> that we placed at the top of the file saves us from having to go through this procedure for all the <tt>hky1</tt> edges, but now that we've erased the models from 4 edges, we need to do a bit of work to get the edge lengths back.

Recall that, under the JC69 model, the edge length equals $$v = 3 \beta t$$. The <tt>betat</tt> parameter that appears in our <tt>HKY85RateMatrix</tt> is the $$\beta t$$ part, so to set the <tt>betat</tt> parameter we need to divide the desired edge length by 3: that is, $$\beta t = v/3$$. The scaling factor 3 becomes more complex for the HKY85 model, but the principle is the same. Our first goal is thus to compute the scaling factor we need to convert edge lengths to $$\beta t$$ values.

    betat = 1.0;
    scalingFactor = 0.0;
    for (n1 = 0; n1 < 4; n1 = n1+1) {
        for (n2 = 0; n2 < 4; n2 = n2+1) {
            if (n2!=n1) {
                scalingFactor = scalingFactor + highATfreqs[n1]*highATfreqs[n2]*HKY85RateMatrix[n1][n2];
            }
        }
    }

The two nested loops visit every off-diagonal element of the <tt>HKY85RateMatrix</tt>, multiply that element by the base frequency of its row and the base frequency of its column. This product of 3 terms is then added to the growing sum <tt>scalingFactor</tt>. Note that it is important to set <tt>betat = 1.0</tt> before the loop in order to ensure that the scaling factor works correctly.

Now we can set the <tt>betat</tt> values for the four edges of interest:

    constrainedTree.microbats.betat           := 0.097851/scalingFactor;
    constrainedTree.Tonatia_bidens.betat      := 0.008252/scalingFactor;
    constrainedTree.Tonatia_silvicola.betat   := 0.000000/scalingFactor;
    constrainedTree.Pteropus.betat            := 0.104663/scalingFactor;

Move the loop that shows edge lengths after these 4 lines in order to check and make sure the edge lengths have been set correctly.

### Constructing the likelihood function

    /*****************************************************************************************
    | Build the likelihood function and print it out, which causes HyPhy to actually compute
    | the log-likelihood for the tree.
    */
    LikelihoodFunction likelihood = (filteredData, constrainedTree);
    fprintf(stdout, likelihood);

If you add these lines to the end of your growing _bats.bf_ file and run it, you should see that the log-likelihood is (to 6 decimal places) equal to -6472.478318.

The <tt>ASSUME_REVERSIBLE_MODELS = -1</tt> that we placed at the beginning of the batch file is needed to prevent HyPhy from assuming it can reroot the tree at any node it wants (which leads to trouble because the nucleotide composition changes across the tree and thus the rooting matters). The <tt>ACCEPT_ROOTED_TREES = TRUE</tt> at the top of the file prevents HyPhy from automatically converting our tree description (which specifies a rooted tree) into an unrooted tree.

### Ready to simulate!

We are now (finally!) ready to perform the simulations. As soon as you create a <tt>LikelihoodFunction</tt> object in HyPhy that is capable of computing the log-likelihood, that object can be used to simulate data because it has a tree with branches that have an assigned model of evolution and all parameters of the substitution models have been either specified (as we did here) or estimated.

Here is the simulation loop:

    /*****************************************************************************************
    | Perform the simulations. 
    */
    for (simCounter = 0; simCounter < 10; simCounter = simCounter+1) {
        // Simulate a data set of the same size as the original set
        DataSet simulatedData = SimulateDataSet(likelihood);

        // The filter is necessary, but trivial in this case because alls sites are used 
        DataSetFilter filteredSimData = CreateFilter(simulatedData,1);

        // Save simulated data to a file
        outFile = "simdata/sim"+simCounter+".nex";
        fprintf(outFile, filteredSimData);
    }
 
I have used both styles of comments here: the main comment before the loop is done using the <tt>/* ... */</tt> style, and the double-slash style is used for comments within the loop. The <tt>LikelihoodFunction</tt> object likelihood is passed to the <tt>SimulateDataSet</tt> function to generate the data. It is always necessary to create a <tt>DataSetFilter</tt> in HyPhy, even if no filtering occurs. If one prints <tt>filteredSimData</tt> using <tt>fprintf</tt> to stdout, then the entire data file would be spewed to the screen. That's not very helpful. Here we are giving <tt>fprintf</tt> a file name rather than stdout, which causes the simulated data to be saved to that file. The file name is constructed using <tt>simCounter</tt> so that every simulated file has a name that is different. Note that all simulated data will be saved in the _simdata_ directory that you created early on in this tutorial.

### Using PAUP* to estimate parsimony trees for each simulated data set

HyPhy is great for estimating parameters on a tree using quite complex models; however, PAUP* excels at searching for the best tree, so we will leave HyPhy now and turn to PAUP* to finish our work.

Create the following file in the same directory as _bats.bf_. Call the new file _parsimony.nex_.

    #nexus

    begin paup;
        log file=simdata/pauplog.txt start replace;
        set criterion=parsimony warnreset=no warntsave=no;
    end;

    begin python;
        for i in range(10):
            paup.cmd("exe simdata/sim%d.nex;" % i)
            paup.cmd("hsearch;")
            paup.cmd("contree all;")
            paup.cmd("constraints flyingdna (monophyly) = ((PTEROPUS, 'TONATIA_BIDENS', 'TONATIA_SILVICOLA'));")
            paup.cmd("filter constraints=flyingdna;")
    end;

    begin paup;
        log stop;
        quit;
    end;

This file contains 2 paup blocks with a python block sandwiched in between. That's right: PAUP* can execute python commands, and this comes in handy when you want to do the same thing over and over again, such as process a bunch of simulated data files in the exact same way.

The first paup block starts a log file (which will be created in the _simdata_ directory) and sets the optimality criterion to parsimony. It also tells PAUP* to not warn us when data files are reset or when we try to quit when there are still trees that haven't been saved.

The final paup bock just closes the log file and then quits.

The python block is where all the interesting things happen. As with python in general, be sure you have the indentation of lines correct inside the python block, otherwise you will get an error message from Python. You can see that the block is one big loop over simulation replicates. Commands that you want PAUP* to execute have to be created as strings (inside double quotes) and then passed to PAUP* via a <tt>paup.cmd</tt> function call.

The first <tt>paup.cmd</tt> executes a file named <tt>sim%d.nex</tt> inside the _simdata_ directory, where <tt>%d</tt> is replaced by the value of <tt>i</tt>. Thus, the loop will, in turn, execute the files _simdata/sim0.nex_, _simdata/sim1.nex_, ..., _simdata/sim10.nex_.

The second <tt>paup.cmd</tt> performs a heuristic search with all default settings. You could make this more explicit/elaborate if you wished, but the default settings work well in this case.

The third <tt>paup.cmd</tt> creates (and shows) a strict consensus tree of all most parsimonious trees found during the search. There are often several best trees found during a parsimony search, and this shows us what is common to all these trees.

We could leave it at that, but the last two lines make it easier to tally how many simulation replicates resulted in a parsimony tree in which all bats form a monophyletic group. We first create a monophyly constraint named <tt>flyingdna</tt> and then filter the trees resulting from the parsimony search using the <tt>flyingdna</tt> constraint. Trees that satisfy the constraint are kept while all trees in which bats are not monophyletic are discarded. If any trees remain after filtering, we will count 1; if no trees remain after filtering, we will count 0. The total count divided by the number of simulation replicates will give us the y-value for the plot that recreates Figure 4 from the Vandenbussche et al. paper.

Run this file in PAUP* to generate the _pauplog.txt_ file, then look through that file to see how many replicates yielded bat monophyly.

### Finishing up

Once you confirm that your scripts are working, run your _bats.bf_ using HyPhy followed by running _parsimony.nex_ in PAUP* a total of 6 times, each with a different value of <tt>highATfreqs</tt> that reflects one of these AT percentages: 50, 60, 70, 80, 90, 100. You may also wish to bump up the number of simulation replicates to at least 20 or 50 in both _bats.bf_ and _parsimony.nex_ so that you get more accurate y-axis values.

Note that you can use a command like that below to pull out only the lines that report the number of trees retained from the file _pauplog.txt_:

    cat simdata/pauplog.txt | grep "Number of trees retained by filter"

The <tt>cat</tt> command simply dumps a file to the screen. Instead of sending the output to the console, the (<tt>|</tt>) causes the output to instead be piped into the <tt>grep</tt> command, which filters out everything except lines that contain the supplied string. This makes it easy to peform your counts.

How does your plot compare to the one published in Vandenbussche et al. (1998)?
