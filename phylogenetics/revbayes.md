---
layout: page
title: RevBayes Lab
permalink: /revbayes/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

## Goals

This lab exercise will introduce you [RevBayes](https://revbayes.github.io), the successor to MrBayes. We will be using RevBayes v1.0.13 on the cluster in this lab. 

This lab will parallel the [MrBayes lab](/mrbayes/) you explored just before Spring Break. You will find that, compared to MrBayes, RevBayes is quite different in terms of setting up analyses. You will need to specify every detail explicitly in your RevBayes script, including the model, the moves (i.e. algorithms used to choose new parameter values), and the monitors (output saved to the screen or file). This level of detail is, albeit, a bit tedious, but the flexibility that it provides is one of RevBayes strengths. RevBayes is not limited to canned analyses; it is possible for you do to analyses using RevBayes that no one has done before!

## Getting started

Login to your account on the Health Center (Xanadu) cluster, then issue

    srun --qos=mcbstudent --partition=mcbstudent --pty bash
    
to start a session on a node that is not currently running jobs. 

{% comment %}
Once you see the prompt, type

    module load RevBayes/1.0.13
 
to load the necessary modules. (Remember: the command <tt>module avail</tt> shows a list of all available modules.)
{% endcomment %}
    
## Create a directory

Use the unix <tt>mkdir</tt> command to create a directory to play in today:

    cd
    mkdir rblab


## Load singularity

Ordinarily, we'd load a RevBayes module at this point, but the only version of RevBayes that is installed on the cluster is too old and buggy for our purposes. We will instead download a version that can be run in a Singularity container. You will first need to load the singularity module:

    module load singularity/3.9.2
    
## Download RevBayes
    
Now download the RevBayes singularity image (I'm assuming you are inside your home directory):

    curl -LO https://github.com/revbayes/revbayes/releases/download/1.1.1/RevBayes_Singularity_1.1.1.simg
    
I'm assuming the _RevBayes_Singularity_1.1.1.simg_ file is now in your home directory (if not, you'll need to alter the path to point to where the singularity image is). 

To avoid having to type so much to start up RevBayes, let's make an alias:

    alias rb="singularity run --app rb RevBayes_Singularity_1.1.1.simg"
    
## Making your alias permanent

If you want to avoid having to load the singularity module and create this alias each time you login (and, yes, we will be using RevBayes in future labs), add these commands to your _~/.bashrc_ and _~/.bash_profile_ files:

    nano ~/.bashrc
    
Add these two lines and save:

    module load singularity/3.9.2
    alias rb="singularity run --app rb ~/RevBayes_Singularity_1.1.1.simg"
    
Now add the same two lines to _~/.bash_profile_. The _~/.bash_profile_ file is executed when you first login and _~/.bashrc_ is executed when you create a new shell (e.g. using _srun_).
    
Hereafter, every time you login or use <tt>srun</tt> these two lines will be executed automatically!
    
If <tt>singularity/3.9.2</tt> is listed after running the command below, you know it worked.

    module list

## Download and save the data file

If you still have your _mblab_ folder from last time, you can just copy the data file over as follows:

    cd ~/rblab
    cp ../mblab/algaemb.nex .
    
The dot on the end of that last line is important, as is the space before it. That lines says to copy the _algaemb.nex_ file from the _mblab_ directory (the <tt>..</tt> means to back up one level in the directory hierarchy) to the current directory (<tt>.</tt>).

If you've wiped out your folder from lab time, you can easily get the data file from the server again. Start by using <tt>cd</tt> to go into the _rblab_ folder, then use the <tt>curl</tt> command ("Copy URL") to download the file:

    cd ~/rblab
    curl -O http://hydrodictyon.eeb.uconn.edu/people/plewis/courses/phylogenetics/data/algaemb.nex
    
## Creating a RevBayes script

RevBayes (unlike MrBayes) does not define its own block type for use inside #NEXUS data files. You will need to instead create a plain text file containing RevBayes commands called a RevBayes script. RevBayes scripts use a computer language (similar to R) for conducting phylogenetic analyses.

Let's create a RevBayes script to carry out an MCMC analysis. 

Use nano to create a file (I'm assuming you are currently in the _~/rblab_ folder where your data file is located.

    nano jc.Rev
    
The _.Rev_ file name extension is conventional, but not required. 

### Read the data file

Enter the following text and then save the file:

    # Read in sequence data for both genes
    data = readDiscreteCharacterData("algaemb.nex")

    # Get some useful variables from the data. We need these later on.
    ntaxa <- data.ntaxa()
    nedges <- 2 * ntaxa - 3
    taxa <- data.taxa()

    # Print to check if things are working
    print("ntaxa  = ", ntaxa)
    print("nedges = ", nedges)
    print("taxa:", taxa)
    
    quit()
    
Now run this script in RevBayes as follows:

    rb jc.Rev
    
Note that the **rb** above is being substituted by **singularity run --app rb ~/RevBayes_Singularity_1.1.1.simg** as a result of your alias. Saves a lot of typing!
    
You can place comments inside your RevScript by starting the line with a hash character (<tt>#</tt>) character. RevBayes will completely ignore anything on a line after a hash, so use comments to make notes. You will thank yourself later.

You can use the print function to show what is contained in a particular variable. Good for sanity checks to make sure everything is going how you thought.

### Create a substitution model

Append the following to your script (above the line containing <tt>quit()</tt>, obviously) to specify a substitution model:

    ######################
    # Substitution Model #
    ######################

    # Create a constant variable for the rate matrix
    Qmatrix <- fnJC(4)

    print("Q matrix: ", Qmatrix)
    
This tells RevBayes to create a Jukes-Cantor instantaneous rate matrix with 4 states and store it in the variable <tt>Qmatrix</tt>. Note that you can use any variable name you want, but the symbol Q is commonly used for instantaneous rate matrices.

Run your revised script in RevBayes now.

> :thinking: Looking at the output from the print statement that shows the Q matrix, how can you tell this is a JC69 rate matrix (instead of, say, an HKY85 rate matrix)?

{% comment %}
All the off-diagonal elements are the same, whereas, in an HKY rate matrix, there would be differences if the nucleotide frequencies were unequal and/or the kappa parameter was not equal to 1. 
{% endcomment %}

### Add a tree model

The tree model specifies a prior for tree topology as well as a prior for edge lengths. We will also use this section to specify proposals (called _moves_ in RevBayes) for modifying both tree topology and edge lengths.

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
    
Add this to your _jc.Rev_ script just above the <tt>quit()</tt> line and re-run it in RevBayes.
    
The code above specifies a **discrete uniform prior** on tree topology (every possible tree topology has equal prior probability). 

We've **added two moves** that affect tree topology. First, we **created an empty vector** called, simply, <tt>moves</tt> to hold all the moves we specify. Second, we **added an NNI move** that is similar to the Larget-Simon move you explored using a recent homework assignment. Third, we **added an SPR move** that can take potentially larger steps in tree space than an NNI move. Note that NNI moves will be attempted in proportion to the number of taxa and SPR moves will be attempted twice as often, on average, as NNI moves.

We've placed an **Exponential(10) prior on each edge length**. Note that, in this section, we're making use of the variables <tt>ntaxa</tt> and <tt>nedges</tt> that we created right after reading in the data. We've also **added a Scale move** for each edge length parameter. 

The variable that we've named **TL** holds the tree length (sum of edge lengths) and the variable that we've named **psi** combines the topology and edge lengths to create a complete tree.

> :thinking: What do you think would be the effect of forgetting to specify any moves for a parameter?

{% comment %}
The parameter would be given an arbitrary initial value and would then be fixed at that value for the entire analysis.
{% endcomment %}

> :thinking: Why did we not specify any moves or a prior for Qmatrix?

{% comment %}
The Jukes-Cantor has no parameters other than edge lengths, so nothing in the Q matrix needs to be changed during the run.
{% endcomment %}

### RevBayes assignment operators

You may have noticed that different symbols are used when making different kinds of assignments. 

The tilde (<tt>~</tt>) is used to **assign a probability distribution** to a variable. Thus, <tt>edge_length[i] ~ dnExponential(10.0)</tt> says to assign the probability distribution Exponential(10) to the ith edge length parameter. This type of assignment creates a **stochastic node** in the model graph, which I will describe next.

A **deterministic node** in the model graph (model graphs are explained below) is created using the operator <tt>:=</tt>. For example, we defined <tt>TL := sum(edge_length)</tt>, which says that the variable <tt>TL</tt> is **not itself a model parameter** but is instead a **function of model parameters** (in this case, a function of all edge length parmeters). Note that the value of <tt>TL</tt> will change automatically whenever any edge length changes. Variables created using <tt>:=</tt> should never be assigned moves or priors because they themselves are not model parameters, only functions of model parameters.

An arrow symbol (<tt><-</tt>) is used for assignments that create a **constant node**. We used this assignment operator when we created the instantaneous rate matrix variable <tt>Qmatrix</tt>. <tt>Qmatrix</tt> is not a stochastic node because it is not a parameter (its elements never change). It is not a deterministic node because it does not represent a function of any model parameters. It is instead a constant part of the infrastructure of the model, much like the constant 10 used in defining the Exponential prior for edge lengths.

An equal sign (<tt>=</tt>) is used for assignments that do not fall into any of the categories above. For example, we created an empty vector to hold moves using <tt>moves = VectorMoves()</tt> and specified an outgroup taxon for purposes of displaying trees using <tt>out_group = clade("Anacystis_nidulans")</tt>.

### The model graph (DAG)

A directed, acyclic graph (DAG) can be used to portray a statistical model. Add these lines to your RevBayes script (again, just above <tt>quit()</tt>) and run it again.

    # Create model 
    mymodel = model(psi)
    
    # Create DAG in the form of a dot file
    mymodel.graph("mymodel.dot", TRUE, "white")

When RevBayes has finished running, use <tt>cat</tt> to view the _mymodel.dot_ file:

    cat mymodel.dot
    
Copy the entire contents of the file _mymodel.dot_ to your clipboard, open the [GraphvizFiddle web page](https://stamm-wilbrandt.de/GraphvizFiddle/), and **paste** what you have on your clipboard into the DOT input box. Now **press the Draw button** and scroll down.

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

### The PhyloCTMC node puts everything together

    #############
    # PhyloCTMC #
    #############

    # Specify the probability distribution of the data given the model
    likelihood ~ dnPhyloCTMC(tree=psi, Q=Qmatrix, type="RNA")

    # Attach the data
    likelihood.clamp(data)

<tt>dnPhyloCTMC</tt> is a probability distribution (hence the tilde used in the assignment) for the data conditional on the model. The <tt>clamp</tt> function assigns data to each leaf in the tree. Remember that the variable <tt>data</tt> was created in the first non-comment line of our script from the contents of the _algaemb.nex_ file.

**Important** Make sure that the <tt>mymodel = model(psi)</tt> and the <tt>mymodel.graph(...)</tt> lines come last (right before <tt>quit()</tt>), otherwise <tt>mymodel</tt> will not include the likelihood and your MCMC analysis will just explore the prior. 

Run RevBayes again to create an updated _mymodel.dot_ file.

### Ready for MCMC

We've now completely specified the model, so all that's left is to create some monitors so that results are saved and set up the mcmc command. Add these lines just above the <tt>quit()</tt> line. We're done setting up the model, so it is OK to add these lines below the mymodel assignment statement.

    #################
    # MCMC Analysis #
    #################

    # Add monitors
    monitors = VectorMonitors()
    monitors.append( mnScreen(TL, printgen=100) )
    monitors.append( mnFile(psi, filename="output/algae.trees", printgen=1) )
    monitors.append( mnModel(filename="output/algae.log", printgen=1) )

    # Start the MCMC analsis
    mymcmc = mcmc(mymodel, moves, monitors, nruns=2, combine="sequential")
    mymcmc.run(generations=10000, tuningInterval=100)
    
**Three monitors** were created and added to an initially-empty vector. The first is a **Screen monitor**: this just shows progress on the screen every 100 iterations. The second monitor is a **File monitor** that stores trees sampled during the run (every one of the 10000 steps will be saved because we specified <tt>printgen=1</tt>). Finally, we added a **Model monitor** that saves the parameter values at each of the 10000 generations.

We next created an **mcmc variable** named <tt>mymcmc</tt>. We provided it the model (<tt>mymodel</tt>), a vector of moves (<tt>moves</tt>), a vector of monitors (<tt>monitors</tt>), the number of independent MCMC analyses to perform (<tt>nruns=4</tt>), and instructions about how to combine the output from the 4 independent runs into a single file (<tt>combine="sequential"</tt>).

Finally, we **called the <tt>run</tt> function** of our <tt>mymcmc</tt> object. This is what starts the ball rolling, so to speak. We told it to run for 10000 iterations (=steps=generations) and tune its moves every 100.

Run your file in RevBayes now. It will stop after it finishes the 10000th iteration. Note that it saved the output in a directory named _output_, which it generated because you included <tt>output/</tt> in each of the output file paths.

Open the file _algae.log_ in Tracer and **look at the trace for the Posterior**. (Note that you will need to get the file from the cluster back to your laptop in order to open it in tracer.) This file contains the combined output from the four separate files _algae_run_1.log_, _algae_run_2.log_, _algae_run_3.log_, and _algae_run_4.log_.

> :thinking: Explain the downward spike you see in the middle of the posterior trace? (Note: there are actually two such spikes, but the first is difficult to see because it is right at the left edge of the plot.)

{% comment %}
This trace combines the two separate runs, each of which began with a random tree topology and edge lengths. Thus, both runs start from a really low point on the posterior surface but quickly climb up to the same place. Those spikes thus represent the points at which each run begins.
{% endcomment %}

### Calculating the MAP (Maximum A-Posteriori) tree

Add these lines just before the <tt>quit()</tt> line. 

    ###################
    # Post processing #
    ###################
    
    # Read in the tree trace
    treetrace = readTreeTrace("output/algae.trees", treetype="non-clock")
    
    # Calculate the MAP tree
    map_tree = mapTree(treetrace,"output/algae-map.tree")
    
**Important** we don't want to rerun the MCMC analysis, so, before running it, **comment out** the line containing the call to the **mymcmc.run** function. To comment out a line, simply place a hash character (<tt>#</tt>) at the beginning of the line.

    # mymcmc.run(generations=10000, tuningInterval=100)

Run RevBayes again now to summarize the sampled trees. 

**If RevBayes gets stuck partway through**, use Ctrl-C to kill it and try analyzing the samples from just one run rather than the combined samples. That is, change this line:

    treetrace = readTreeTrace("output/algae.trees", treetype="non-clock")

to this:

    treetrace = readTreeTrace("output/algae_run_1.trees", treetype="non-clock")
    
**If not even that works,** use Ctrl-C to kill it and then Ctrl-D to exit the shell. This will take you back to the head node. Navigate into the _rblab_ directory and try running it one more time using the head node. It is not nice to run analyses on the head node, but very short analyses (such as this one) will not get you in hot water with other users. Once RevBayes has finished, type the following to move off the head node:

    srun --qos=mcbstudent --partition=mcbstudent --pty bash

After running RevBayes, you should find the file _algae-map.tree_ in your output directory. Bring that file back to your laptop and open it in FigTree. 

### Expected tree

Remember from the [Likelihood lab](/likelihood/) that **the accepted phylogeny** (based on much evidence besides these data) **places all the chlorophyll-b-containing plastids together** (Lockhart, Steel, Hendy, and Penny, 1994). 

Thus, there **should be an edge** in the tree separating the **two taxa that do not have chlorophyll b**, namely the cyanobacterium **_Anacystis_** (which has chlorophyll a and phycobilin accessory pigments) and the chromophyte **_Anacystis_** (which has chlorophylls a and c) from the 6 other taxa (which all have chlorophylls a and b).

> :thinking: Are the chlorophyll b taxa together in the map tree?

{% comment %}
No, Euglena is more closely related to Olithodiscus than is Anacystis
{% endcomment %}

### Clade posteriors

We do not need to view the tree in FigTree to check whether _Anacystis_ and _Anacystis_ are together. We need only define a clade and ask what its posterior probability is. If it is higher than 0.5, then that clade would make it into a majority rule consensus tree. Add these lines just above <tt>quit()</tt>:

    # Calculate the	posterior probability of the chlorophyll-b clade
    chlorophyllb <- clade("Anacystis_nidulans", "Olithodiscus")
    treetrace.cladeProbability( chlorophyllb )
    
Run the file in RevBayes. 
    
> :thinking: What is the posterior clade probability of the chlorophyll b clade?
{% comment %}
Close to zero: 0.00043329
{% endcomment %}
    
## Adding rate heterogeneity

We found in the likelihood lab that accommodating rate heterogeneity in the model was important for getting the tree correct. Let's switch to the JC+G model now to see if that helps. Add these lines any where **above the PhyloCTMC section** in your script.

    #############################
    # Among-site rate variation #
    #############################

    # Define the shape parameter of a Gamma distribution
    alpha ~ dnUniform( 0, 10 )

    # Create a deterministic node to model discrete gamma rate heterogeneity
    site_relrates := fnDiscretizeGamma( alpha, alpha, 4, false )

    # Add a move so that alpha will be estimated
    moves.append( mvScale(alpha, weight=2.0) )

    # Create a variable representing the proportion of invariable sites
    p_inv ~ dnBeta(1,1)
    
    # Add a move so that p_inv will be estimated
    moves.append( mvBetaProbability(p_inv, weight=2.0) )

Now we need to modify this line in the PhyloCTMC section to inform the likelihood model of <tt>p_inv</tt> and <tt>site_relrates</tt>:

    likelihood ~ dnPhyloCTMC(tree=psi, siteRates=site_relrates, pInv=p_inv, Q=Qmatrix, type="RNA")

Now run RevBayes again (being sure to **uncomment the mcmc.run line first!**).

> :thinking: What is the posterior probability of the chlorophyll b clade now that we've accommodated rate heterogeneity?

{% comment %}
0.1539795
{% endcomment %}

## GTR+I+G model

Let's see if estimating base frequencies and exchangeabilities (i.e. the GTR+I+G model) further increases the posterior probability of the chlorophyll b clade.

Copy your _jc.Rev_ file, calling the copy _gtr.Rev__:

    cp jc.Rev gtr.Rev
    
Edit _gtr.Rev_, replacing your _Substitution model_ section with this one:

    ######################
    # Substitution Model #
    ######################

    # Create a stochastic node representing nucleotide frequencies
    freqs ~ dnDirichlet( v(1,1,1,1) )
    moves.append( mvBetaSimplex(freqs, weight=2.0) )
    moves.append( mvDirichletSimplex(freqs, weight=1.0) )

    # Create a stochastic node representing GTR exchangeabilities
    xchg ~ dnDirichlet( v(1,1,1,1,1,1) )
    moves.append( mvBetaSimplex(xchg, weight=3.0) )
    moves.append( mvDirichletSimplex(xchg, weight=1.5) )

    # Create a deterministic node for the GTR rate matrix
    Qmatrix := fnGTR(xchg,freqs) 

    # Create a constant variable for the rate matrix
    # Qmatrix <- fnJC(4)

    print("Q matrix: ", Qmatrix)

Both **nucleotide relative frequencies** (<tt>freqs</tt>) and **GTR exchangeabilities** (<tt>xchg</tt>) are multivariate parameters that are constrained to add to 1, so both are given **flat Dirichlet priors**. The Dirichlet distribution can have different numbers of parameters (4 for freqs and 6 for xchg), so RevBayes uses a single vector to provide the parameters (which also determines the dimension of the variable). A **vector** in RevBayes is created using the <tt>v()</tt> notation.

The moves provided for freq and xchg are appropriate for multivariate parameters that add to 1.0. The term [simplex](https://en.wikipedia.org/wiki/Simplex) implies this sum-to-1 constraint.

> :thinking: Why do we need to create a deterministic node this time rather than a constant node (note that the JC Qmatrix was a constant node)?

{% comment %}
In the GTR model, the Q matrix is a function of model parameters, namely frequencies and exchangeabilties. I nthe JC model, there were no parameters making up the Q matrix.
{% endcomment %}

Rename your _output_ directory so that it will not be overwritten by the GTR MCMC analysis:

    mv output jc-output
    
Now run RevBayes again, this time providing the _gtr.Rev_ script

    rb gtr.Rev
    
Note that you may need to comment out your mcmc.run command and back out to the head node in order to get the last part to work.

> :thinking: What is the posterior probability of the chlorophyll b clade under the GTR+I+G model?

{% comment %}
0.9054793
{% endcomment %}

## What to turn in

In addition to the :thinking: thinking questions, please use FigTree to view your final _algae-map.tree_ (from the GTR+I+G model), label the branches with posterior clade probabilities, and save the tree thus annotated as a PDF file.







