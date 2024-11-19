---
layout: page
title: Week 22 (Nov 18-22, 2024)
permalink: /jcweek22/
---

Note: you do not need to type (or copy) comments, which are the parts of lines after the hash `#` symbol.

### 1. Login to Xanadu and create a working directory

Create a `koch200` directory and navigate into it:

    cd ~ # start in your home directory
    mkdir koch200
    cd koch200
        
### 2. Download and unpack the data

    curl -O https://gnetum.eeb.uconn.edu/projects/phyloinfo/week22/data.tar.gz
    tar zxvf data.tar.gz
    
The `curl` command will copy the file _data.tar.gz_ from the remote server to your _koch200_ directory, and the `tar` command will unpack it, creating the directory _data_ inside your _koch200_ directory.

The `-O` option for `curl` says to just give the copied file the same name as on the server.

The `zxvf` options for `tar` say to uncompress (`z`), extract (`x`), be verbose (`v`), the file (`f`) named _data.tar.gz_.
        
### 3. Create the SLURM script

These instructions were prepared using the tutorial on the [Computational Biology Core](https://bioinformatics.uconn.edu) web site. To get there, choose "Tutorials and Instruction" from the main menu, then "Documentation and Tutorials", then click on the link for "Using job arrays in SLURM".

Issue the following command from within your `kcoh200` directory:

    nano koch.slurm
    
and copy the following text to the file (then exit nano saving the file):

    #!/bin/bash
    
    #SBATCH --job-name=koch
    #SBATCH -n 1
    #SBATCH -N 1
    #SBATCH -c 1
    #SBATCH --mem=5G
    #SBATCH --partition=general
    #SBATCH --qos=general
    #SBATCH --array=[1-200]%20
    #SBATCH --mail-type=ALL
    #SBATCH --mail-user=jessica.chen@uconn.edu
    #SBATCH -o %x_%A_%a.out
    #SBATCH -e %x_%A_%a.err
    
    # Load required modules
    module load gcc/10.2.0
    module load iqtree/2.2.2
    
    # Run IQ-TREE on each locus
    iqtree2 -s data/locus$SLURM_ARRAY_TASK_ID.fa -b 100
    
You can start the run like this

    sbatch koch.slurm
        
### 4. Run IQ-TREE on the concatenated data set

Make a copy of your _koch.slurm_ file:

    cp koch.slurm kochconcat.slurm
    
and, in nano, replace the contents of _kochconcat.slurm_ with this text:

    #!/bin/bash
    
    #SBATCH --job-name=koch
    #SBATCH -n 1
    #SBATCH -N 1
    #SBATCH -c 1
    #SBATCH --mem=5G
    #SBATCH --partition=general
    #SBATCH --qos=general
    #SBATCH --mail-type=ALL
    #SBATCH --mail-user=jessica.chen@uconn.edu
    #SBATCH -o %x_%A_%a.out
    #SBATCH -e %x_%A_%a.err
    
    # Load required modules
    module load iqtree/2.2.2
    
    # Run IQ-TREE on concatenated data
    iqtree2 -s data/concat.fa -b 100

You can start the run like this

    sbatch kochconcat.slurm
        
### 5. Copy all the estimated gene trees to one file

Use the following bash commands to compile all the gene trees into one file, one per line:

    cd ~/koch200  # just making sure you are in the right place
    for i in $(seq 1 200); do cat data/locus$i.fa.treefile >> genetrees.txt; echo >> genetrees.txt; done
    
This loops through all 200 loci, concatenating (using the `cat` command each locus-specific tree file onto the end of the file _genetrees.txt_ (which should not exist beforehand because we are always appending to it using `>>`). The `echo` command is needed to add a line feed to the end of each tree description. Without that, the file ends up consisting of just one really long line.

Now, copy the _concat.fa.treefile_ and change its name to _speciestree.txt_:

    cp data/concat.fa.treefile speciestree.txt
    
You can stop here. We'll do the rest when we meet on Thursday.

