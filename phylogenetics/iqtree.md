---
layout: page
title: IQ-TREE Lab
permalink: /iqtree/
---
## Goals

Today you will continue learning about maximum likelihood inference and will learn to use a program known for its speed and ability to handle large-scale phylogenetic analyses. 

## Getting started

Login to your account on the Health Center (Xanadu) cluster

    srun --qos=mcbstudent --partition=mcbstudent --pty bash
    
to start a session on a node that is not currently running jobs. Once you see the prompt, type

    module load iqtree/1.6.10
 
to load the iqtree module. (How did I know to type "iqtree/1.6.10"? Use the command "module avail" to see a list of all modules.)

## Download the beta version too

The tutorial we will be using today requires a later version of IQ-TREE than any version currently installed on the Xanadu cluster. The proper thing to do under most circumstances is to use the software request form from the _Contact Us_ section of the [Computational Biology Core](https://bioinformatics.uconn.edu/) site to request that it be installed for everyone to use (it would become a new module that anyone could load). However, sometimes you need to just get an analysis done and would prefer to have access to the software immediately (perhaps to just see if it is useful). For this reason, it is good to know how to install and run software in your own home directory, accessible only by you.

Download version 2.0-rc1 of IQ-TREE as follows from your home directory on Xanadu:

    curl -LO https://github.com/Cibiv/IQ-TREE/releases/download/v2.0.6/iqtree-2.0.6-Linux.tar.gz

{% comment %}
curl -LO https://github.com/Cibiv/IQ-TREE/releases/download/v2.0-rc1/iqtree-2.0-rc1-Linux.tar.gz
{% endcomment %}

The curl ("copy url") command is a convenient way to download files from a web site into your current directory on the cluster. The **L** switch may not be necessary, but sometimes helps if the URL is an indirect reference to the file. The **O** (capital letter o, not zero) switch tells curl to save the file using the original file name (i.e. the name at the end of the URL, in this case _iqtree-2.0.6-Linux.tar.gz_).

Unpack the downloaded "tape" archive file using the tar command:

    tar zxvf iqtree-2.0.6-Linux.tar.gz
 
TAR files are single files containing the contents of an entire directory (or hierarchy of directories). Files in the original directory are simply concatenate into one big file (along with the information about what directory/subdirectory the file was in). The **z** tells tar to uncompress the file first (necessary because it has been compressed, as indicated by the _gz_ file ending). The **x** tells tar to extract the file (**c** means create, but we are not creating a tar file, we are instead **x** tracting one). The **v** tells tar to be verbose and tell us the name of each file as it is extracted. Finally, **f** says that the name of the tar file is the next thing to expect on the command line.

The executable file is now in the

    ~/iqtree-2.0.6-Linux/bin
    
directory, where **~** means "home directory" and is a synonym of <tt>$HOME</tt>, which is itself a synonym of the actual path of your home directory (something like _/home/CAM/plewis_). To make the new version of iqtree easy to access, and to give it a name consistent with the name used in the tutorial, execute this command:

    alias iqtreebeta="$HOME/iqtree-2.0.6-Linux/bin/iqtree2"
 
This will create an alias named _iqtreebeta_ so that when you type <tt>iqtreebeta</TT> on the command line it will be replaced by _~/iqtree-2.0.6-Linux/bin/iqtree2_. This alias will only be available to you while you are logged in; it will be lost when you logout. If you want it to be permanent, edit (using nano) the file _~/.bash_profile_ and place the alias command anywhere in the file (but on a line by itself. Now the alias will be automatically recreated every time you login.

## Start the tutorial 

We will be using the IQ-TREE tutorial written by Bui Minh (one of the main developers of IQ-TREE) for the 2019 Woods Hole Workshop in Molecular Evolution. The tutorial begins by having you download a couple of files (_turtle.fa_ and _turtle.nex_). Can you figure out how to do this using curl?

Here is the link to the tutorial:

[http://www.iqtree.org/workshop/molevol2019](http://www.iqtree.org/workshop/molevol2019)

