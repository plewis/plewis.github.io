---
layout: page
title: Setting up an ssh alias 
permalink: /ssh-alias/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

It is possible to create an alias that will allow you to avoid a lot of typing when connecting to the HPC cluster. These instructions work for Mac computers, but have not been tested on Windows. If you have a Windows machine, try these instructions using the Git for Windows bash console and let us know if it does or doesn't work. If it doesn't work, we will work with you to create an ssh alias.

Note: these instructions were written using my (Paul Lewis') computer, so be sure to replace any Paul-Lewis-specific text with your own!

### Step 1

Check whether you have a directory named `~/.ssh`. The `~` part is a stand-in for your home directory. The `.ssh` directory, if it exists, will be hidden and not easily visible using the `ls` command (this is true for all files and directories whose names begin with a period). To see it, you will need to use the long format of the `ls` command:

    ls -la ~

Alternatively, you can also just try to `cd` into the directory:

    cd ~/.ssh
    
If it doesn't exist, you will get an error message similar to this:

    ls: /Users/plewis/.ssh: No such file or directory

### Step 2

If you do **not** have a directory `~/.ssh`, then create it using the `mkdir` command:

    mkdir ~/.ssh
    chmod 700 ~/.ssh
    
The `chmod` command sets permissions on the directory to those required by SSH. SSH will refuse to work if this directory is able to be seen by a wider audience than just you. If you issue the command `ls -la` in your home directory, the line corresponding to your new `.ssh` directory should look like this (except that you will not see the `plewis` part of course):

    drwx------    2 plewis domain users      4608 May 26  2020 .ssh

The first part of this line  says that this directory has read, write, and execute permissions only for the owner (i.e. you!):

    d r w x - - - - - -
    | | | | | | | | | | 
    | | | | | | | | | +-> NO execute permissions for other     
    | | | | | | | | +-> NO write permissions for other
    | | | | | | | +-> NO read permissions for other
    | | | | | | +-> NO execute permissions for group
    | | | | | +-> NO write permissions for group
    | | | | +-> NO read permissions for group
    | | | +-> execute permissions for owner
    | | +-> write permissions for owner
    | +-> read permissions for owner
    +-> d means this is a directory and not a file
    
### Step 3

Now that the directory `~/.ssh` exists and has the right permissions, you need to create a file named `config` inside that directory.

    cd ~/.ssh
    touch config
    chmod 600 config

The `chmod` command creates even more restrictive permissions for the config file than for the directory. The number 600 restricts permissions to only read/write (no execute permission) for owner. Here's what `ls -la config` says about my config file permissions:

    -rw-------@ 1 plewis  staff  2624 May 25  2025 config
    
If you are wondering about the `@` character, that is a Mac-specific thing that says that there are some Mac-specific permissions applied to this directory that cannot be shown using the standard `ls` output. You can see these extra permissions using `ls -l@ config` (but only if you are using a Mac of course).

### Step 4

Finally, you will need to edit the `config` file. You must use a _text editor_ (not a word processor such as Microsoft Word or Mac Pages) to do this editing. Mac and Linux have a built-in editor named nano that can be used, or you can use [BBEdit](https://www.barebones.com/products/bbedit/) (Mac) or [Notepad++](https://notepad-plus-plus.org) (Windows). To use nano, be sure you are still in the `.ssh` directory by typing `pwd` (which stands for _present working directory_):

    pwd

You should see this output (except with your home directory and not mine):

    /Users/plewis/.ssh      
    
Now type

    nano config
    
and start typing (for what to type, see below). When you are finished, press Ctrl-X to exit. It will ask if you want to save: type `Y`. Then it will ask for the file name to write and will suggest `config`: just hit the Enter/Return key to accept.

Edit the `config` file and add the following lines (`host` should be flush left, the `HostName` and `User` lines should be indented using a tab):

    Host hpc
        HostName hpc2.storrs.hpc.uconn.edu
        User pol02003
        IdentityFile /Users/plewis/.ssh/id_rsa
{% comment %}
    host xanadu
        HostName xanadu-submit-ext.cam.uchc.edu
        User eeb5349usr13
    host xfer
        HostName transfer.cam.uchc.edu
        User eeb5349usr13
{% endcomment %}

Be sure to use your own NetID, not `pol02003` (which is my NetID) and your own home directory name, not `plewis`.

These 3 lines will create an alias named `hpc` that allows you to login to user account on the HPC cluster using `ssh`:

    ssh hpc
    
{% comment %}
The second set of 3 lines defines an alias named `xfer` that will allow you to transfer files to and from the Xanadu cluster using `scp`:

    scp xfer:remote_file.txt .
    scp local_file.txt xfer:
    scp local_file.txt xfer:pauprun
    
The first `scp` command transfers a file named `remote_file.txt` on the cluster to your local laptop. 

The second `scp` command transfers a file named `local_file.txt` from your local laptop to the Xanadu cluster.

The third `scp` command is the same as the second except that the file will end up in the directory `~/pauprun`, not the home directory.
{% endcomment %}

### Step 5

This step is optional, but saves a lot of time. In this step we will establish a public-private key pair so that you need not type a password to log in. The way it works is that you generate two files. One is called the public key file, the other is the private key file. You transfer the public key file to the remote computer you wish to login to. The private key file (as the name suggests) should  _never leave your computer_!

To create a key pair, be sure you are in the `.ssh` directory:

    cd ~/.ssh
    
Type

    ssh-keygen
    
When it is finished, 


