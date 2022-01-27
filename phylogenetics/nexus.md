---
layout: page
title: The NEXUS file format
permalink: /nexus/
---
[Up to the Phylogenetics main page](/phylogenetics2022/)

###  NEXUS blocks 

PAUP* uses a data file format known as NEXUS. This file format is now shared among several programs. NEXUS data files always begin with the characters `#NEXUS` but are otherwise organized into major units known as _'blocks_'. Some blocks are recognized by most of the programs using the NEXUS file format, whereas other blocks are private blocks (recognized by only one program). A NEXUS block has the following basic structure:

    #NEXUS
    ...
    begin characters;
    ...
    end;

Note that the elipsis (`...`) is never used in a NEXUS data file; it is used here simply to indicate that some text has been omitted. The name of the NEXUS block used as an example above is `characters`. Because NEXUS data files are organized in named blocks, PAUP* and other programs are able to read blocks whose names they recognize and ignore blocks that are not recognized. This allows many different programs to use the same overall format without crashing when they encounter data they cannot interpret.

###  NEXUS commands 

Blocks are in turn organized into semicolon-terminated _commands_. It is very important that you remember to _terminate all commands with a semicolon_. This is especially hard to remember for very long commands. PAUP* is pretty good about pointing out forgotten semicolons, but sometimes it doesn't realize you've left something out until some distance downstream, which can make the problem point difficult to find. Some common commands will be provided below in the description of the common blocks.

###  NEXUS comments 

_Comments_ can be placed in a NEXUS file using square brackets. Comments can be placed anywhere, and they are used for many purposes. For example, you can effectively remove some of your data by commenting it out. You can also annotate your sequences using comments. For example, a comment like that below is useful for locating specific sites in your alignment:

    [            ----+--10|----+--20|----+--30|----+--40|----+--50|----]
    Ephedra      TTAAGCCATGCATGTCTAAGTATGAACTAATT-CAAACGGTGAAACTGCGGATG
    Gnetum       TTAAGCCATGCATGTCTATGTACGAACTAATC-AGAACGGTGAAACTGCGGATG
    Welwitschia  TTAAGCCATGCACGTGTAAGTATGAACTAGTC-GAAACGGTGAAACTGCGGATG

If you would like your comment printed out in the output when PAUP* executes the data file, just insert an exclamation point (!) as the first character inside the opening left square bracket:

    [is the data file used for my dissertation](!This)

###  Commonly-used NEXUS blocks 

Here is a list of common NEXUS blocks and the most-common commands within these blocks. For a complete description of the NEXUS file format, take a look at this paper:

> [Maddison, David R., Swofford, David L. and Maddison, Wayne P. 1997. NEXUS: an extensible file format for systematic information. Systematic Biology 46: 590-621](http://www.jstor.org/stable/2413497)

### Taxa block 

The purpose of a taxa block is to provide names for your taxa (i.e., sequences). You may not use a taxa block very often, since you can also supply names for your taxa directly in the data block (see below). Here is an example of a taxa block.

    #NEXUS
    ...
    begin taxa;
    dimensions ntax=5;
    taxlabels 
     Giardia
     Thermus
     Deinococcus
     Sulfolobus
     Haobacterium
    ;
    end;

Note that there are four commands in this example of a taxa block. Can you find the terminating semicolon for each of them?
* the `begin` command giving the block's name
* the `dimensions` command giving the number of taxa
* the `taxlabels` command providing the actual taxon labels
* the `end` command, telling PAUP* that there are no more commands to process for this block

### Data block

The data block is the workhorse of NEXUS blocks. This is where you place the actual sequence data, and, as mentioned above, this can also be where you define the names of your sequences. Here is an example of a data block:

    #NEXUS
    ...
    begin data;
    dimensions ntax=5 nchar=54;
    format datatype=dna missing=? gap=-;
    matrix
     Ephedra       TTAAGCCATGCATGTCTAAGTATGAACTAATTCCAAACGGTGAAACTGCGGATG
     Gnetum        TTAAGCCATGCATGTCTATGTACGAACTAATC-AGAACGGTGAAACTGCGGATG
     Welwitschia   TTAAGCCATGCACGTGTAAGTATGAACTAGTC-GAAACGGTGAAACTGCGGATG
     Ginkgo        TTAAGCCATGCATGTGTAAGTATGAACTCTTTACAGACTGTGAAACTGCGAATG
     Pinus         TTAAGCCATGCATGTCTAAGTATGAACTAATTGCAGACTGTGAAACTGCGGATG
                  [----+--10|----+--20|----+--30|----+--40|----+--50|----]
    ;
    end;

Some things to note in this example are:
* The `dimensions` command comes first in a data block, and specifies the number of sequences (taxa; ntax) and number of sites (characters; nchar).
* The `format` command tells PAUP* what kind of data follow (dna, rna, protein, or standard), and provides the symbols used for missing data (?) and gaps (-).
* The `matrix` command dominates the data block, providing the sequences themselves (as well as the taxon names). Note the semicolon terminating the matrix command!!!
* You can use upper or lower case symbols for nucleotides
* You can place whitespace anywhere except inside a taxon name or keyword (e.g., `data type = dna` would cause problems because `datatype` should not have embedded whitespace).
* If you simply must have a space in one of your taxon names, either use an underscore character in place of the space (e.g., `Ginkgo_biloba`) or surround the taxon name in single quotes (e.g., `'Ginkgo biloba'`). In either case, PAUP* will output the space in its output.
* One item missing from the format command in the example above but which is quite useful is something known as an equate list. The following format statement will cause all occurrences of T to be changed to C and all occurrences of G to be changed to A as the data are being read into PAUP*:
 format datatype=dna missing=? gap=- equate="T=C G=A";
This is like telling PAUP* to do a search-and-replace operation on the sequences before reading them in, except that your original file remains intact. Be careful when using equate, because the replacement is case sensitive (i.e., `equate="t=c g=a"` would have had no effect if all the nucleotides are represented by upper case letters!).
* PAUP* recognizes all the standard ambiguity codes (e.g., R for purine, Y for pyrimidine, N for undetermined, etc.).

### Trees block

A trees block has the following structure:

    #NEXUS
    ...
    begin trees;
    translate
     1 Ephedra,
     2 Gnetum,
     3 Welwitschia,
     4 Ginkgo,
     5 Pinus
    ;
    tree one = [&U] (1,2,(3,(4,5));
    tree two = [&U] (1,3,(5,(2,4));
    end;

Some things to note in this example are:
* The `translate` command provides short alternatives to the taxon names, making the tree descriptions shorter (takes up fewer bytes of disk space).
* the translate command is not necessary however; it is ok to use the taxon names directly in the tree descriptions
* the `tree` command denotes the start of a tree description, which consists of a tree name (e.g., `one` and `two` are used here), followed by an equals sign and then the tree topology in the standard, parenthetical notation (often referred to as the Newick or New Hampshire format).
* The special comments consisting of an ampersand symbol followed by the letter U tell PAUP* to interpret the tree as being an unrooted tree.
* Files containing only the `#NEXUS` plus a trees block are called tree files

### Sets block

The only commands you need to know at this point from a sets block are the `charset` and the `taxset` commands.

    #NEXUS
    ...
    begin sets;
    charset trnL_intron = 562-4226;
    taxset gnetales = Ephedra Gnetum Welwitschia;
    end;

This sets block defines both a set of characters (in this case the sites composing the trnL intron) and a set of taxa (consisting of the three genera in the seed plant order Gnetales: Ephedra, Gnetum and Welwitschia). We could have used the taxon numbers for the taxset definition (e.g., `taxset gnetales = 1-3;`) but using the actual names is clearer and less prone to error (just think of what might happen if you decided to reorder your sequences!). These definitions may be used in other blocks. A common use is in commands placed inside a `paup` block (see below) or typed directly at the PAUP* command prompt.

### Assumptions block

There is only one command I will introduce from the assumptions block (although there are a number of others that exist). The `exset` command (the word exset stands for "exclusion set") is useful for creating a set of characters that are automatically excluded whenever the data file is executed. Given the following block:

    #NEXUS
    ...
    begin assumptions;
    exset* badsites = 1 5 47-.;
    end;

PAUP* would automatically exclude characters (i.e., sites) 1, 5, and 47 through the end of the sequence. It is the asterisk after the newterm exset that denotes this as the default exclusion set. If you left out the asterisk, PAUP* would define the exclusion set but would not automatically exclude these sites as the data file was being executed.

### Paup block

Paup blocks provide a way to give PAUP* commands from within a data file itself. Any command you can type at the command prompt or perform using menu commands you can place in the data file. This allows you to specify an entire analysis right in the data file. For any serious analysis, I always run PAUP* using a paup block. That way I know exactly what I did for a given analysis several days or weeks in the future. Paup blocks are also a handy way to perform certain commands every time the data file is executed. For example, you can set up your favorite likelihood substitution model, delete certain taxa or exclude certain sites from a paup block located just after your data block. Here is an example of a typical paup block:

    #NEXUS
    ...
    begin paup;
    log file=myoutput.txt start stop;
    outgroup Ephedra;
    set criterion=likelihood;
    lset nst=2 basefreq=empir rates=equal tratio=estim variant=hky;
    hsearch swap=tbr addseq=random nreps=100 start=stepwise; 
    describe 1 / plot=phylogram;
    savetrees file=mytrees.tre brlens;
    log stop;
    quit;  
    end;
    
Here is what each line does:
* The `log` command starts a log file (the file will be called myoutput.txt and will be overwritten if it already exists)
* The `outgroup` command specifies that the resulting trees should be rooted between Ephedra and everything else (this just affects the appearance of the tree when drawn)
* The `set` command changes the optimality criterion from the default (parsimony) to maximum likelihood
* The `lset` command sets up PAUP* so that the HKY85 model will be used (number of substitution rates is 2, empirical base frequencies, rates are homogeneous across sites, estimate the transition/transversion ratio, and use the HKY model rather than the other, similar F84 model)
* The `hsearch` command causes PAUP* to conduct 100 heuristic searches (each beginning from a different, random starting tree); each search will start with a stepwise addition tree using random addition of taxa, and this starting tree will be rearranged using the tree bisection/reconnection branch swapping method
* The `describe` command produces a depiction of the tree (rooted at the specified outgroup) on the output (and in the log file, since we opened a log file earlier); the tree will be shown as a phylogram, which means branch lengths will appear proportional to the average number of nucleotide substitutions per site that were inferred for that branch.
* The `savetrees` command saves the best tree found during the search (this is quite important and easy to forget to do!). The `brlens` keyword tells PAUP to save branch length information along with the tree topology.
* The `log` command stops the logging of output to the file myoutput.txt
* The `quit` command causes PAUP* to quit running; if you left out this command, PAUP* would remain running at this point, allowing you to issue other commands

Note that because PAUP* ignores blocks whose names it does not recognize, you can easily "comment out" a paup block by simply adding a character to its name. For example, adding an underscore

    #NEXUS
    ...
    begin _paup;
    .
    .
    .
    end;

is enough to cause PAUP* to completely ignore this paup block. This is handy because it allows you to create multiple paup blocks for different purposes and turn them off and on whenever you need them.

You can also "comment out" a portion of a paup block using the leave command. For example, in this paup block, PAUP* will be set up for doing a likelihood analysis but will not actually conduct the search; the leave command causes PAUP* to exit the block early:

    #NEXUS
    ...
    begin paup;
    log file=myoutput.txt start stop;
    outgroup Ephedra;
    set criterion=likelihood;
    lset nst=2 basefreq=empir rates=equal tratio=estim variant=hky; 
    leave;
    hsearch swap=tbr addseq=random nreps=100 start=stepwise; 
    describe 1 / plot=phylogram;
    savetrees file=mytrees.tre brlens;
    log stop;
    quit;  
    end;

