---
layout: page
title: Setting up an ssh alias 
permalink: /ssh-alias/
---
[Up to the Phylogenetics main page](/phylogenetics2024/)

It is possible to create an alias that will allow you to avoid a kot of typing when connecting to the Xanadu cluster. These instructions work for Mac computers, but have not been tested on Windows. If you have a Windows machine, let us know and we will work with you to create an ssh alias.

### Step 1

Check whether you have a directory named `~/.ssh`. The `~` part is a stand-in for your home directory. The `.ssh` directory, if it exists, will be hidden and not easily visible using the `ls` command (this is true for all files and directories that begin with a period). To see it, you will need to use the long format of the `ls` command:

    ls -la ~

Alternatively, you can also just try to `cd` into the directory:

    cd ~/.ssh
    
If it doesn't exist, you will get an error message:

    -bash: cd: /home/FCAM/eeb5349/usr1/.ssh: No such file or directory

### Step 2

If you do **not** have a directory `~/.ssh`, then create it using this command:

    mkdir ~/.ssh
    chmod 700 ~/.ssh
    
The `chmod` command sets permissions on the directory to those required by SSH. SSH will refuse to work if this directory is able to be seen by a wider audience than just you. If you issue the command `ls -la` in your home directory, the line corresponding to your new `.ssh` directory should look like this (except that you will not see the `plewis` part of course):

    drwx------    2 plewis domain users      4608 May 26  2020 .ssh

The first part of this line  says that this directory has read, write, and execute permissions only for the owner:

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

The `chmod` command creates even more restrictive permissions for the config file than for the directory. The number 600 restricts permissions to only read/write (no execute permission) for owner. 

### Step 4

Finally, edit the `config` file and add the following lines (`host` should be flush left, the `HostName` and `User` lines should be indented using a tab):

    host xanadu
        HostName xanadu-submit-ext.cam.uchc.edu
        User eeb5349usr13
    host xfer
        HostName transfer.cam.uchc.edu
        User eeb5349usr13

The first 3 lines will create an alias named `xanadu` that allows you to login to user account `eeb3249usr13` on the Xanadu cluster using `ssh`:

    ssh xanadu
    
The second set of 3 lines defines an alias named `xfer` that will allow you to transfer files to and from the Xanadu cluster using `scp`:

    scp xfer:remote_file.txt .
    scp local_file.txt xfer:
    scp local_file.txt xfer:pauprun
    
The first `scp` command transfers a file named `remote_file.txt` on the cluster to your local laptop. 

The second `scp` command transfers a file named `local_file.txt` from your local laptop to the Xanadu cluster.

The third `scp` command is the same as the second except that the file will end up in the directory `~/pauprun`, not the home directory.

