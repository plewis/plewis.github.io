---
layout: page
title: RevBayes Lab
permalink: /revbayes/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

## Goals

This lab exercise will introduce you [RevBayes](https://revbayes.github.io), one of a triad of state-of-the-art Bayesian phylogenetic software packages (the other two being BEAST2 and BPP). We will be using RevBayes v1.3.2 on the cluster in this lab. 

RevBayes does not have the gentlest learning curve, but we will take it slowly. You will need to specify every detail explicitly in your RevBayes script, including the model, the moves (i.e. algorithms used to choose new parameter values), and the monitors (output saved to the screen or file). This level of detail is a bit tedious, but the flexibility that it provides is one of RevBayes strengths. RevBayes is not limited to canned analyses; it is possible for you do to analyses in RevBayes using models that no one has used before! In fact, the first thing we will do is use RevBayes to extend your MCMC homework assignment!

## Template

Here is the template to use for recording your answers to the :thinking: thinking questions.

    1. Looking at the output from the print statement that shows the Q matrix, how can you tell this is a JC69 rate matrix (instead of, say, an HKY85 rate matrix)?
    answer: 

    2. What do you think would be the effect of forgetting to specify any moves for a parameter?
    answer: 

    3. Why did we not specify any moves or a prior for Qmatrix?
    answer: 

    4. How many parameters are currently in your model, and how many of each type of parameter are there?
    answer: 

    5. How many deterministic nodes are currently in your model? What are their names?
    answer: 

    6. Explain the downward spikes you see in the posterior trace? (Note: there are actually four such spikes, but the first is difficult to see because it is right at the left edge of the plot.)
    answer: 

    7. What would you specify for the mcmc combine option if you wanted the samples from all four runs to be blended together rather than concatenated sequentially?
    answer: 

    8. Are the chlorophyll b taxa together in the map tree?
    answer: 

    9. What is the posterior clade probability of the chlorophyll b clade?
    answer: 

## Getting started

:large_blue_diamond: Login to your account on the Storrs HPC cluster and start an interactive slurm session:

    ssh hpc
    srun -p general -q general --mem=5G --pty bash
        
**Important** The `--mem=5G` part is important for this lab, as RevBayes uses more than the default amount (128 MB) of memory sometimes.

You may wish to update your `gensrun` alias by opening the _.bashrc_ file in your home directory:

    nano ~/.bashrc
    
and replacing the gensrun alias with the following:

    alias gensrun='srun -p general -q general --mem=5G --pty bash'
    
Save the _.bashrc_ file so that the next time you need an interactive node you can simply type:

    gensrun
        
## Create a directory

:large_blue_diamond: Use the unix `mkdir` command to create a directory to play in today:

    cd
    mkdir rblab

## Copy the RevBayes executable to your _bin_ directory

Normally I would have you download the RevBayes executable file from the RevBayes web site, but, unfortunately, the version that is there was compiled for a different Linux operating system and is not compatible with the operating system running on our cluster. I have thus compiled the most recent release of RevBayes (v1.3.2) for you and have placed it in the scratch directory, so all you need to do is 

:large_blue_diamond: copy it to your own _bin_ directory:

    cd 
    cp /scratch/pol02003/pol02003/rb132 ~/bin
    
## Load module needed

:large_blue_diamond: The RevBayes executable file needs some runtime libraries that can be loaded using the module system

    module load gcc/15.1.0

:large_blue_diamond: You should now be able to type **rb132** to start the program:

    RevBayes version (1.3.2)
    Build from tags/v1.3.2 (rapture-4486-g3d84ac) on Sat Feb 28 11:57:57 EST 2026
    
    Visit the website www.RevBayes.com for more information about RevBayes.
    
    RevBayes is free software released under the GPL license, version 3. Type 'license()' for details.
    
    To quit RevBayes type 'quit()' or 'q()'.
    
## Download and save the data file

:large_blue_diamond: If you still have your _likelab_ folder from before, you can just copy the data file over as follows:

    cd ~/rblab
    cp ../likelab/algae.nex .
    
The dot (`.`) on the end of that last line is important, as is the space before it. That lines says to copy the _algae.nex_ file from the _likelab_ directory (the `..` means to back up one level in the directory hierarchy) to the current directory (`.`).

If you've wiped out your folder from the likelihood lab, you can easily get the data file from the server again. Start by using `cd` to go into the _rblab_ folder, then use the `curl` command ("Copy URL") to download the file:

    cd ~/rblab
    curl -Ok https://gnetum.eeb.uconn.edu/courses/phylogenetics/lab/algae.nex
    
(If the curl approach fails, you will need to download the file to your laptop and move it to the cluster using scp or Cyberduck.)    
    
## Creating a RevBayes script

In this section you will create a plain text file that will hold your RevBayes commands. This type of file is called a **RevBayes script**.

RevBayes scripts use a computer language (similar to R) for conducting phylogenetic analyses. **Important!** While RevBayes commands are designed to have the look and feel of R, RevBayes is not an R program. Thus, you cannot load R libraries into RevBayes, nor will most R core commands work.

:large_blue_diamond: Use nano to create a file (I'm assuming you are currently in the _~/rblab_ folder where your data file is located.

    nano jc.Rev
    
The _.Rev_ file name extension is conventional, but not required. 

### Read the data file

:large_blue_diamond: Enter the following text into _jc.Rev_ and then save the file:

    # Read in sequence data for both genes
    data = readDiscreteCharacterData("algae.nex")
    
    # Get some useful variables from the data. We need these later on.
    ntaxa <- data.ntaxa()
    nedges <- 2 * ntaxa - 3
    taxa <- data.taxa()
    
    # Print to check if things are working
    print("ntaxa  = ", ntaxa)
    print("nedges = ", nedges)
    print("taxa:", taxa)
    
    quit()
    
:large_blue_diamond: Now run this script in RevBayes as follows:

    rb132 jc.Rev
        
Lines that begin with a **hash (`#`) character** are comments. RevBayes will completely ignore anything on a line after a hash, so use comments to make notes. You will thank yourself later.

Note how we've used the **print function** to show what is contained in a particular variable. Good for sanity checks to make sure everything is going according to plan.

### Create a substitution model

:large_blue_diamond: Append the following to your script (above the line containing `quit()`, obviously) to specify a substitution model:

    ######################
    # Substitution Model #
    ######################
    
    # Create a constant variable for the rate matrix
    Qmatrix <- fnJC(4)
    
    print("Q matrix: ", Qmatrix)
    
This tells RevBayes to create a Jukes-Cantor instantaneous rate matrix with 4 states and store it in the variable `Qmatrix`. Note that you can use any variable name you want; I've used Qmatrix here because the letter Q is commonly used for instantaneous rate matrices.

:large_blue_diamond: Run your revised script in RevBayes now.

> :thinking: Looking at the output from the print statement that shows the Q matrix, how can you tell this is a JC69 rate matrix (instead of, say, an HKY85 rate matrix)?

{% comment %}
All the off-diagonal elements are the same, whereas, in an HKY rate matrix, there would be differences if the nucleotide frequencies were unequal and/or the kappa parameter was not equal to 1. 
{% endcomment %}

### Add a tree model

The tree model specifies a prior for tree topology as well as a prior for edge lengths. We will also use this section to specify proposals (called _moves_ in RevBayes) for modifying both tree topology and edge lengths.

:large_blue_diamond: Add the following to your _jc.Rev_ script just above the `quit()` line and re-run it in RevBayes:

    ##############
    # Tree model #
    ##############
    
    out_group = clade("Anacystis_nidulans")
    
    # Prior distribution on the tree topology
    topology ~ dnUniformTopology(taxa, outgroup=out_group)
    
    moves = VectorMoves()
    moves.append( mvNNI(topology, weight=ntaxa) )
    moves.append( mvSPR(topology, weight=ntaxa*2.0) )
    
    # Edge length prior
    for (i in 1:nedges) {
        edge_length[i] ~ dnExponential(10.0)
        moves.append( mvScale(edge_length[i]) )
    }
    
    TL := sum(edge_length)
    psi := treeAssembly(topology, edge_length)
    
    print("TL = ",TL)
    print("edge_length: ",edge_length)
    print("psi: ",psi)
        
The code above specifies a **discrete uniform prior** on tree topology (every possible tree topology has equal prior probability). 

We've **added two moves** that affect tree topology. First, we **created an empty vector** called, simply, `moves` to hold all the moves we specify. Second, we **added an NNI move** that is similar to the Larget-Simon move disussed in lecture. Third, we **added an SPR move** that can take potentially larger steps in tree space than an NNI move. Note that NNI moves will be attempted in proportion to the number of taxa and SPR moves will be attempted twice as often, on average, as NNI moves.

We've placed an **Exponential(10) prior on each edge length**. Note that, in this section, we're making use of the variables `ntaxa` and `nedges` that we created right after reading in the data. We've also **added a Scale move** for each edge length parameter. 

The variable that we've named **TL** holds the tree length (sum of edge lengths) and the variable that we've named **psi** combines the topology and edge lengths to create a complete tree.

> :thinking: What do you think would be the effect of forgetting to specify any moves for a parameter?

{% comment %}
The parameter would be given an arbitrary initial value and would then be fixed at that value for the entire analysis.
{% endcomment %}

> :thinking: Why did we not specify any moves or a prior for Qmatrix?

{% comment %}
The Jukes-Cantor model's only parameters are edge lengths, so nothing in the Q matrix needs to be changed during the run.
{% endcomment %}

### RevBayes assignment operators

You may have noticed that different symbols are used when making different kinds of assignments. 

The tilde (`~`) is used to **assign a probability distribution** to a variable. Thus, `edge_length[i] ~ dnExponential(10.0)` says to assign the probability distribution Exponential(10) to the ith edge length parameter. This type of assignment creates a **stochastic node** in the model graph, which I will describe soon.

A **deterministic node** in the model graph (model graphs are explained below) is created using the operator `:=`. For example, we defined `TL := sum(edge_length)`, which says that the variable `TL` is **not itself a model parameter** but is instead a **function of model parameters** (in this case, a function of all edge length parmeters). Note that the value of `TL` will change automatically whenever any edge length changes. Variables created using `:=` should never be assigned moves or priors because they themselves are not model parameters, only functions of model parameters.

An arrow symbol (`<-`) is used for assignments that create a **constant node**. We used this assignment operator when we created the instantaneous rate matrix variable `Qmatrix`. `Qmatrix` is not a stochastic node because it is not a parameter (its elements never change). It is not a deterministic node because it does not represent a function of any model parameters. It is instead a constant part of the infrastructure of the model, much like the constant 10 used in defining the Exponential prior for edge lengths.

An equal sign (`=`) is used for assignments that do not fall into any of the categories above. For example, we created an empty vector to hold moves using `moves = VectorMoves()` and specified an outgroup taxon for purposes of displaying trees using `out_group = clade("Anacystis_nidulans")`.

### The PhyloCTMC node puts everything together

:large_blue_diamond: Add the following to your _jc.Rev_ script. I'll stop saying "just above the `quit()` line" now, but remember that `quit()` should be the last line of your file unless you want RevBayes to stop executing the file early.

    #############
    # PhyloCTMC #
    #############
    
    # Specify the probability distribution of the data given the model
    likelihood ~ dnPhyloCTMC(tree=psi, Q=Qmatrix, type="RNA")
    
    # Attach the data
    likelihood.clamp(data)

`dnPhyloCTMC` is a probability distribution (hence the tilde used in the assignment). It represents the  probability of the data conditional on the model (i.e. the likelihood). The `clamp` function assigns data to each leaf in the tree. Remember that the variable `data` was created in the first non-comment line of our script from the contents of the _algae.nex_ file.

### The model graph (DAG)

A directed, acyclic graph (DAG) can be used to portray a statistical model. 

:large_blue_diamond: Add these lines to your RevBayes script and run it again.

    # Create model 
    mymodel = model(psi)
    
    # Create DAG in the form of a dot file
    mymodel.graph("mymodel.dot", TRUE, "white")

:large_blue_diamond: When RevBayes has finished running, use `cat` to view the _mymodel.dot_ file:

    cat mymodel.dot
    
:large_blue_diamond: Copy the entire contents of the file _mymodel.dot_ to your clipboard, open the [GraphvizFiddle web page](https://stamm-wilbrandt.de/GraphvizFiddle/), and **paste** what you have on your clipboard into the DOT input box (be sure to completely replace the text already present in the box). Now **press the Draw button** and scroll down.

GraphvizFiddle should now show a graphical depiction of your model as it currently exists. Note that stochastic nodes (i.e. model parameters) are displayed as **solid ovals**, constant nodes are shown with **solid boxes**, and deterministic nodes are shown in **dashed ovals**.

> :thinking: How many parameters are currently in your model, and how many of each type of parameter are there?

{% comment %}
There are 13 edge length parameters and 1 topology parameter.
{% endcomment %}

> :thinking: How many deterministic nodes are currently in your model? What are their names?

{% comment %}
There are 3 deterministic nodes in the graph.
1. edge_length is a vector of edge length parameters.
2. psi is a function of both the topology and all edge length parameters.
3. TL is a function of all edge length parameters.
{% endcomment %}

**Important** Make sure that the `mymodel = model(psi)` and the `mymodel.graph(...)` lines come last (right before `quit()`), otherwise `mymodel` will not include the likelihood and your MCMC analysis will just explore the prior. In other words, add the `PhyloCTMC` section before the `create and plot model` section in your _jc.Rev_ script.

### Ready for MCMC

We've now completely specified the model, so all that's left is to create some monitors so that results are saved and set up the mcmc command. 

:large_blue_diamond: Add these lines just above the `quit()` line. We're done setting up the model, so it is OK to add these lines below the mymodel assignment statement.

    #################
    # MCMC Analysis #
    #################
    
    # Add monitors
    monitors = VectorMonitors()
    monitors.append( mnScreen(TL, printgen=100) )
    monitors.append( mnFile(psi, filename="output/algae.trees", printgen=1) )
    monitors.append( mnModel(filename="output/algae.log", printgen=1) )
    
    # Start the MCMC analsis
    mymcmc = mcmc(mymodel, monitors, moves, nruns=4, combine="sequential")
    mymcmc.run(generations=10000)
    
**Three monitors** were created and added to an initially-empty vector. The first is a **Screen monitor**: this just shows progress on the screen every 100 iterations. The second monitor is a **File monitor** that stores trees sampled during the run (every one of the 10000 steps will be saved because we specified `printgen=1`). Finally, we added a **Model monitor** that saves the parameter values at each of the 10000 generations.

We next created an **mcmc variable** named `mymcmc`. We provided it the model (`mymodel`), a vector of moves (`moves`), a vector of monitors (`monitors`), the number of independent MCMC analyses to perform (`nruns=4`), and instructions about how to combine the output from the 4 independent runs into a single file (`combine="sequential"`).

Finally, we **called the `run` function** of our `mymcmc` object. This is what starts the ball rolling, so to speak. We told it to run 
for 10000 iterations to generate the posterior sample.

:large_blue_diamond: Run your file in RevBayes now. It will stop after it finishes the 10000th iteration. Note that it saved the output in a directory named _output_, which it generated because you included `output/` in each of the output file paths.

:large_blue_diamond: Download and install the program [Tracer](https://beast.community/tracer) on your local laptop.

:large_blue_diamond: Open the file _algae.log_ in Tracer and **look at the trace for the Posterior**. (Note that you will need to get the file from the cluster back to your laptop in order to open it in Tracer.) This file contains the combined output from the four separate files _algae_run_1.log_, _algae_run_2.log_, _algae_run_3.log_, and _algae_run_4.log_.

> :thinking: Explain the downward **spikes** you see in the posterior trace? (Note: there are actually four such spikes, but the first is difficult to see because it is right at the left edge of the plot.)

{% comment %}
This trace combines the four separate runs, each of which began with a random tree topology and edge lengths. Thus, each run starts from a really low point on the posterior surface but quickly climb up to the same place. Those spikes thus represent the points at which each run begins.
{% endcomment %}

> :thinking: What would you specify for the mcmc combine option if you wanted the samples from all four runs to be **blended together** rather than **concatenated sequentially**? (Hint: go to the [RevBayes documentation](https://revbayes.github.io/documentation/), scroll down (or search) to find the **mcmc** documentation in the Workspace Objects section.)

{% comment %}
combine=mixed
{% endcomment %}

You can eliminate those spikes by inserting a burn-in period before beginning your sampling. 

:large_blue_diamond: Modify the section entitled "Start the MCMC analsis" by adding a call to the function `burnin`:

    # Start the MCMC analsis
    mymcmc = mcmc(mymodel, monitors, moves, nruns=4, combine="sequential")
    mymcmc.burnin(generations=10000, tuningInterval=100)
    mymcmc.run(generations=10000)

:large_blue_diamond: Rename your `output` directory to `no-burnin-output` as follows:

    mv output no-burnin-output
    
:large_blue_diamond: Now re-run the analysis, the spikes in your _algae.log_ file will be much less aparent because RevBayes will run initially for 10000 iterations to burn-in the chain, tuning its moves every 100 steps. After that, the "robot" will have reached the main "hill" in the posterior and thus the results of the combined parameter sample will be much more homogeneous, which you can verify by downloading _algae.log_ to your laptop and opening it in Tracer. 

### Calculating the MAP (Maximum A-Posteriori) tree

:large_blue_diamond: Add these lines just before the `quit()` line. 

    ###################
    # Post processing #
    ###################
    
    # Read in the tree trace
    treetrace = readTreeTrace("output/algae.trees", treetype="non-clock")
    
    # Calculate the MAP tree
    map_tree = mapTree(treetrace,"output/algae-map.tree")
    
**Important** Unless you want to waste some time and rerun the MCMC analysis, **comment out** the lines containing the calls to the **mymcmc.run** and **mymcmc.burnin** functions. To comment out a line, simply place a hash character (`#`) at the beginning of the line to convert the line to a comment.

    # mymcmc.run(generations=10000, tuningInterval=100)

:large_blue_diamond: Run RevBayes again now to summarize the sampled trees. 

After running RevBayes, you should find the file _algae-map.tree_ in your output directory. 

:large_blue_diamond: Bring the _algae-map.tree_ file back to your laptop and open it in FigTree. 

### Expected tree

Remember from the [Likelihood lab](/likelihood/) that **the accepted phylogeny** (based on much evidence besides these data) **places all the chlorophyll-b-containing plastids together** (Lockhart, Steel, Hendy, and Penny, 1994). 

Thus, there **should be an edge** in the tree separating the **two taxa that do not have chlorophyll b**, namely the cyanobacterium **_Anacystis_** (which has chlorophyll a and phycobilin accessory pigments) and the chromophyte **_Olithodiscus_** (which has chlorophylls a and c) from the 6 other taxa (which all have chlorophylls a and b).

> :thinking: Are the chlorophyll b taxa together in the map tree?

{% comment %}
No, Euglena is more closely related to Olithodiscus than is Anacystis
{% endcomment %}

### Clade posteriors

We do not need to view the tree in FigTree to check whether _Anacystis_ and _Anacystis_ are together. We need only define a clade and ask what its posterior probability is. If it is higher than 0.5, then that clade would make it into a majority rule consensus tree. 

:large_blue_diamond: Add these lines to your script:

    # Calculate the	posterior probability of the chlorophyll-b clade
    chlorophyllb <- clade("Anacystis_nidulans", "Olithodiscus")
    treetrace.cladeProbability( chlorophyllb )
    
:large_blue_diamond: Run the file in RevBayes. 
    
> :thinking: What is the posterior clade probability of the chlorophyll b clade?

{% comment %}
Close to zero: 0.00043329
{% endcomment %}
    
## What to turn in

In addition to the :thinking: thinking questions, please use FigTree to view your _algae-map.tree_, label the branches with marginal posterior clade probabilities, and save the tree thus annotated as a PDF file.
