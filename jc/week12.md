---
layout: page
title: Week 12 (April 15-19, 2024)
permalink: /jcweek12/
---

This week we'll analyze some real data.

### 1. As usual, login and create a working directory

As usual, login to the Xanadu cluster...

    ssh eeb5349usr13@xanadu-submit-ext.cam.uchc.edu
    
Create a `week12` directory:

    mkdir week12
    cd week12
    
### 2. Create a clean script

Create a file named _clean.sh_ and copy the following into it:

    #!/bin/bash
    cd .
    rm -rf *.out
    rm -rf *.err
    rm -rf gene??

Now make it executable:

    chmod +x clean.sh
    
Use it like this to clean out the directory of old files before starting an array job:

    ./clean.sh
    
This file is a little different than last week's _clean.sh_ because we want to make sure to just delete the diretories and not the data files. For example, if the last line had been

    rm -rf gene*
    
then this would delete _gene21.nex_ as well as the directory _gene21_, which would force you to download the _gene21.nex_ file again.

### 3. Create a slurm script
    
Now create a file _info.slurm_ using nano and copy the following into it:

    #!/bin/bash
    
    #SBATCH --job-name=info
    #SBATCH -n 1
    #SBATCH -N 1
    #SBATCH -c 1
    #SBATCH --mem=5G
    #SBATCH --partition=mcbstudent
    #SBATCH --qos=mcbstudent
    #SBATCH --array=[1-6]%6
    #SBATCH --mail-type=ALL
    #SBATCH --mail-user=jessica.chen@uconn.edu
    #SBATCH -o %x_%A_%a.out
    #SBATCH -e %x_%A_%a.err
    
    # Load required modules
    module load gcc/10.2.0
    module load RevBayes/1.1.1
    
    # Create an array of gene names
    genes=(gene21 gene26 gene28 gene30 gene32 gene34)
    
    # Create a directory for the current task and navigate into it
    # The first element of the genes array is 0, but SLURM_ARRAY_TASK_ID
    # starts at 1, so we need to subtract 1 from SLURM_ARRAY_TASK_ID
    # In bash, you use the construct $((...)) to do integer arithmetic
    # and ${genes[$i]} returns the element of the genes array indexed by $i
    # so if $i is 3, $(genes[$i]} returns 'gene30'
    i=$(($SLURM_ARRAY_TASK_ID - 1))
    taskdir=${genes[$i]}
    echo "Creating directory $taskdir"
    mkdir $taskdir
    cd $taskdir
    
    # Make a copy of the data set for this task, calling it data.nex
    cp ../$taskdir.nex data.nex
        
    # Run RevBayes
    cp ../info.Rev .
    rb info.Rev
    
    # Convert RevBayes-style treefiles into nexus-formatted treefiles that Galax can read
    python3 $HOME/bin/rb2nxs.py "output/info_run_1.trees" info1.tre
    python3 $HOME/bin/rb2nxs.py "output/info_run_2.trees" info2.tre
    python3 $HOME/bin/rb2nxs.py "output/info_run_3.trees" info3.tre
    python3 $HOME/bin/rb2nxs.py "output/info_run_4.trees" info4.tre
    python3 $HOME/bin/rb2nxs.py "output/info_run_*.trees" info.tre
    
    # Run Galax on combined runs
    $HOME/bin/galax --treefile info.tre --outfile galax-combined
    
    # Run Galax on separate runs
    echo "info1.tre" > listfile.txt
    echo "info2.tre" >> listfile.txt
    echo "info3.tre" >> listfile.txt
    echo "info4.tre" >> listfile.txt
    $HOME/bin/galax --listfile listfile.txt --outfile galax-separate
    
### 4. Copy your RevBayes script

You will also need to copy the _lowinfo.Rev RevBayes script you used last week into the _week12_ directory and call it _info.Rev_:

    cp ~/week12
    cp ../week11/lowinfo.Rev info.Rev
    
You will also need to edit the _info.Rev_ file, changing the first 4 lines to this:

    datafname <- "data.nex"
    treefname <- "output/info.trees"
    logfname  <- "output/info.log"
    mapfname  <- "output/info-map.tree"    
    
Note that in the _info.slurm_ file the following line...

    cp ../$taskdir.nex data.nex
    
copies the correct data file for the current task into our task director and renames it _data.nex_, so _data.nex_ is what we will tell RevBayes to look out for.

Also, be sure that `ignore_data` is set to `FALSE` because we do not want to ignore the data in these runs.

Finally, change this line

    out_group = clade("t1")

to 

    out_group = clade("sl16835")

The specified outgroup taxon must be a taxon in the data file, otherwise RevBayes will abort, so I just picked this taxon at random. Our trees will be unrooted so it doesn't really matter where the root is chosen, because the outgroup is only used for display purposes. We'll choose a better outgroup once we are ready to do the final analyses for the paper.

### 5. Download the data files

The data files for this week are in a password-protected directory on a web server. I will tell you separately what username and password to use. Now that we are using real (as-yet-unpublished) data, we need to ensure that the data are not able to be obtained by just anyone in the world, hence the need for a password.

You tell `curl` that the site is password-protected using the `-u` command line option, which stands for "username". Replace `<username>` in the `curl` command below with the one I sent you and `curl` will prompt you for the password I sent you (note that the password will not be shown as you type it, so you'll just have to trust your typing skills!):

    cd ~/week12
    curl -u <username> -O https://gnetum.eeb.uconn.edu/projects/phyloinfo/week12/gene21.nex
    
Now do the same for the other 5 genes: _gene26.nex_, _gene28.nex_, _gene30.nex_, _gene32.nex_, and _gene34.nex_.

When you've finished, run the following command as a sanity check:

    head -n 1 gene??.nex
    
This just prints out the first line `-n 1` of all the downloaded files. They should all have `#nexus` on the first line. If any of them don't, then it probably means you mistyped the password and the file contains an error message rather than data. Just redo that `curl` command, being careful to type the password correctly.

### 6. Start your array job

To start the run, be sure your email is the one that will be used by the _zeroinfo.slurm_ script, then type

    sbatch info.slurm
    
You should see 6 directories created: _gene21_, _gene26_, _gene28_, _gene30_, _gene32_m and _gene32_.

You can check whether your run has finished using the `squeue` command:

    squeue -u eeb5349usr13
    
### 7. Create a new summarize.py script

Be sure you are in the `~/week12` directory, then use nano to create a file named `summarize.py` with this content:

    import math,re,glob,os,sys
    
    samplesize = 40000
    
    dirnames = glob.glob('gene*')
    print('%20s %12s %12s %12s %12s %12s %12s %12s %12s %12s' % ('dir', 'coverage', 'H', 'H*', 'I', 'Ipct', 'covH', 'covIpct', 'rawIpct', 'Dpct'))
    for d in dirnames:
        if re.match('gene..[.]nex', d):
            continue
        
        stuff = open(os.path.join(d, 'galax-combined.txt'), 'r').read()
    
        m = re.search('(?P<raw>[.0-9]+) percent information given sample size', stuff, re.M | re.S)
        assert m is not None
        rawIpct = float(m.group('raw'))
        
        m = re.search('treefile\s+unique\s+coverage\s+H\s+H[*]\s+I\s+Ipct\s+D\s+Dpct\s+\S+\s+(?P<unique>\d+)\s+(?P<coverage>[.0-9]+)\s+(?P<H>[.0-9]+)\s+(?P<Hstar>[.0-9]+)\s+(?P<I>[.0-9]+)\s+(?P<Ipct>[.0-9]+)', stuff, re.M | re.S)
        assert m is not None
        unique   = int(m.group('unique'))
        coverage = float(m.group('coverage'))
        H        = float(m.group('H'))
        Hstar    = float(m.group('Hstar'))
        I        = float(m.group('I'))
        Ipct     = float(m.group('Ipct'))
        covH     = math.log(samplesize/coverage)
        covIpct  = 100.0*(covH - Hstar)/covH
        
        # The galax-separate.txt file should have a merged line that looks like this
        # treefile  unique  coverage         H        H*         I      Ipct        D      Dpct
        # merged     40000   0.00020  46.84760  20.78265  26.06496  55.63776  4.86519  23.40989        
        stuff = open(os.path.join(d, 'galax-separate.txt'), 'r').read()
        m2 = re.search('merged\s+\d+\s+[.0-9]+\s+[.0-9]+\s+[.0-9]+\s+[.0-9]+\s+[.0-9]+\s+[.0-9]+\s+(?P<Dpct>[.0-9]+)', stuff, re.M | re.S)
        assert m2 is not None
        Dpct = float(m2.group('Dpct'))
        
        print('%20s %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f %12.5f' % (d, coverage, H, Hstar, I, Ipct, covH, covIpct, rawIpct, Dpct))

Run `summarize.py` like this:

    python3 summarize.py
    
This should give you a summary of the results in the two Galax output files _galax-combined.txt_ and _galax-separate.txt_ that have been created by Galax in each replicate directory.

The last column is new: it records the percent dissonance measured by comparing the results from the four replicate runs.

### 8. Summarize the results and we'll take a look at them when we meet on Friday, April 19.




