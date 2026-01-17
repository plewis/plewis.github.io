---
layout: page
title: Setting up an ssh alias 
permalink: /ssh-alias/
---
[Up to the Phylogenetics main page](/phylogenetics2026/)

It is possible to create an alias that will allow you to avoid a lot of typing when connecting to the HPC cluster. These instructions work for Mac computers, but have not been tested on Windows. If you have a Windows machine, try these instructions using the Git for Windows bash console and let us know if it does or doesn't work. If it doesn't work, we will work with you to create an ssh alias.

#### Important:
* **local laptop** means the computer you will have with you in lab used to communicate with the cluster
* **remote cluster** means the Storrs HPC computing cluster (which you will never see)
* Be sure to replace `xxxxx` in the instructions below with your own username (**local laptop**)
* Be sure to replace `xxx00000` in the instructions below with your NetID, which is also your cluster username (**remote cluster**)
* Steps 1-5 below take place on your **local laptop**
* Step 6 involves both your **local laptop** and the **remote cluster**

### Step 1

Check whether you have a directory named _~/.ssh_ on your **local laptop**. The _~_ part is a stand-in for your home directory. The _.ssh_ directory, if it exists, will be hidden and not easily visible using the `ls` command (this is true for all files and directories whose names begin with a period). To see it, you will need to use the long format of the `ls` command:

    ls -la ~

Alternatively, you can also just try to `cd` into the directory:

    cd ~/.ssh
    
If it doesn't exist, you will get an error message similar to this:

    ls: /Users/xxxxx/.ssh: No such file or directory
    
If it does already exist, you can skip the next step (Step 2) and go directly to [Step 3](#step-3)

### Step 2

If you do **not** have a directory _~/.ssh_, then create it using the `mkdir` command:

    mkdir ~/.ssh
    chmod 700 ~/.ssh
    
The `chmod` command sets permissions on the directory to those required by SSH. SSH will refuse to work if this directory is able to be seen by a wider audience than just you. If you issue the command `ls -la` in your home directory, the line corresponding to your new _.ssh_ directory should look like this (except that you will see your own username, not `xxxxx`, of course):

    drwx------    2 xxxxx domain users      4608 May 26  2020 .ssh

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

Now that the directory _~/.ssh_ exists and has the right permissions, you need to create (or edit) a file named _config_ inside that directory. First check to see if _config_ also exists using `ls -la` (after first changing directory (`cd`) into the _~/.ssh_ directory):

    cd ~/.ssh
    ls -la
    
If you don't see a file named _config_ in the output of the `ls` command, type  

    touch config
    chmod 600 config

The `chmod` command creates even more restrictive permissions for the config file than for the directory. The number 600 restricts permissions to only read/write (no execute permission) for owner. Here's what `ls -la config` says about my config file permissions:

    -rw-------@ 1 xxxxx  staff  2624 May 25  2025 config
    
If you are wondering about the `@` character, that is a Mac-specific thing that says that there are some Mac-specific permissions applied to this directory that cannot be shown using the standard `ls` output. You can see these extra permissions using `ls -l@ config` (but only if you are using a Mac of course).

### Step 5

In this step we will establish a public-private key pair so that you need not type a password to log in. The way it works is that you will generate two files. One is called the **public key file**, the other is the **private key file**. You transfer the _public key file_ to the remote computer you wish to login to. The _private key file should never leave your computer_!

To create a key pair, be sure you are in the `.ssh` directory:

    cd ~/.ssh
    
Type

    ssh-keygen
    
The program will ask you a couple of questions. First, it will ask you:

    Generating public/private ed25519 key pair.
    Enter file in which to save the key (/Users/xxxxx/.ssh/id_ed25519):
  
Note that there are several different types of keys and your system may choose a different type than the _ed25519_ type shown above. For example, you may see _rsa_, _dsa_, _ecdsa_, _ecdsa-sk_, _ed25519_, or _ed25519-sk_. Just press return to choose the default file name suggested (_/Users/xxxxx/.ssh/id_ed25519_ in the example above). **Make a note of this filename**: you will need to paste it into another file soon. 

Next, it will ask you for a passphrase:

    Enter passphrase (empty for no passphrase):
    Enter same passphrase again: 
    
It will not show what you type (there could always be someone looking over your shoulder!), so you will have to concentrate so that you type the same thing twice. While it is possible to just press return to create an empty passphrase, I encourage you to type in an actual passphrase. The passphrase can be a sentence (even including spaces). It is not subject to the same restrictions you often see for passwords. Just type in a short phrase that you can easily remember and which is easy to type.
     
When it is finished, you should see something like this

    Your identification has been saved in /Users/xxxxx/.ssh/id_ed25519
    Your public key has been saved in /Users/xxxxx/.ssh/id_ed25519.pub
    The key fingerprint is:
    SHA256:r0Vilm1hq1AOd+CXFWsZGNVdahhWsyu97g6XbiGzykI xxxxx@xxxxx.local
    The key's randomart image is:
    +--[ED25519 256]--+
    |        . .+B+o.o|
    |       . ..+ *.+.|
    |      . + * = +  |
    |       = * + o . |
    |      . S = . o  |
    |       +E*  o..o |
    |       .. o .++. |
    |        .+  .=.  |
    |        ..o. +=  |
    +----[SHA256]-----+
    
    
### Step 5

Finally, you will need to edit the `config` file. You must use a _text editor_ (not a word processor such as Microsoft Word or Mac Pages) to do this editing. Mac and Linux have a built-in editor named nano that can be used, or you can use [BBEdit](https://www.barebones.com/products/bbedit/) (Mac) or [Notepad++](https://notepad-plus-plus.org) (Windows). To use nano, be sure you are still in the `.ssh` directory by typing `pwd` (which stands for _present working directory_):

    pwd

You should see this output (except with your home directory and not mine):

    /Users/xxxxx/.ssh      
    
Now type

    nano config
    
and start typing (for what to type, see below). When you are finished, press Ctrl-X to exit. It will ask if you want to save: type `Y`. Then it will ask for the file name to write and will suggest `config`: just hit the Enter/Return key to accept.

Edit the `config` file and add the following lines (`host` should be flush left, the `HostName` and `User` lines should be indented using a tab):

    Host hpc
        HostName hpc2.storrs.hpc.uconn.edu
        User xxx00000
        IdentityFile /Users/xxxxx/.ssh/id_ed25519
{% comment %}
    host xanadu
        HostName xanadu-submit-ext.cam.uchc.edu
        User eeb5349usr13
    host xfer
        HostName transfer.cam.uchc.edu
        User eeb5349usr13
{% endcomment %}

Be sure to use your own NetID, not `xxx00000` (which is a fake NetID).

Note that IdentityFile should specify the private key file name that you save earlier when you ued `ssh-keygen`.

These 4 lines in the _config_ file will create an alias named `hpc` that allows you to login to user account on the HPC cluster using `ssh`:

    ssh hpc
    
{% comment %}
The second set of 3 lines defines an alias named `xfer` that will allow you to transfer files to and from the Xanadu cluster using `scp`:

    scp xfer:remote_file.txt .
    scp local_file.txt xfer:
    scp local_file.txt xfer:pauprun
    
The first `scp` command transfers a file named `remote_file.txt` on the cluster to your **local laptop**. 

The second `scp` command transfers a file named `local_file.txt` from your local laptop to the **remote cluster**.

The third `scp` command is the same as the second except that the file will end up in the directory `~/pauprun`, not the home directory.
{% endcomment %}

### Step 6

Even though the config file entry saves a little bit of time, you still need to type your password when logging in. If typing your password repeatedly annoys you, we can fix this with just a little more work.

On your **local laptop** on which you just created a public/private key pair, type

    cat ~/.ssh/id_ed25519.pub
    
(be sure to use the file name that `ssh-keygen` generated; it may not be named _id_ed25519.pub_ on your system). Also be sure that the file you `cat` ends in _.pub_ (i.e. the _public_ key file). This will spit out the contents of your **public key** to the screen. Here is what mine looks like:

    ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKh6TEdeul5a+Q239SNR1gSQVq/WjsxDARMmTQIUTOmf plewis@cormoran.local

Copy that text to your clipboard and log into the **remote cluster** using `ssh hpc`. 

If you are using a Mac, you should be able to select the text and press Cmd-C to copy it. If you are using Windows, you may need to select the text and choose _Edit > Copy_ from the menu.

On the **remote cluster**, you will now create an _authorized_keys_ file in your `.ssh` directory. First, check to see if you have the directory `.ssh` in your home directory on the remote cluster:

    cd ~/.ssh
    
If this gives you a `No such file or directory` error, then create the directory using `mkdir`.

    mkdir ~/.ssh
    chmod 700 ~/.ssh
    
Now navigate into that directory:

    cd ~/.ssh
    
and type the following:

    touch authorized_keys
    chmod 600 authorized_keys
    
You can now edit the _authorized_keys_ file using nano:

    nano authorized_keys
    
and paste in your public key, pressing return so that there is a line feed at the end. Your public key should be the only line in the file. Press Ctrl-X to save and exit nano.

That's it. You should now be able to logout (using Ctrl-d or by typing `exit`) of the **remote cluster** and log back in again using `ssh hpc`. You should not need a password when you log back in, but you will need to enter your passphrase.

You are now asking: "What good is it to eliminate having to type a password if I still have to type a passphrase?" The benefit is that you can allow an ssh _agent_ to fill in the passphrase for you. You need only give the agent your passphrase after your local laptop boots up and it will enter it automatically thereafter. To start an agent and add your passphrase, type

    ssh-agent
    ssh-add
    
It will prompt you for your passphrase and, thereafter, you will not need to type either your password or your passphrase again (at least until you logout or reboot your local laptop). I have gone one step further and created an alias for this combination of commands:

    alias agent="ssh-agent;ssh-add"
    
Now I just type `agent` and it starts the ssh agent and asks for my passphrase. To make this alias permanent, you can use nano to edit your `.bash_profile` file and add the line above to that file. The `.bash_profile` file is run each time you open a terminal session, so that makes the alias always present when you need it.



