---
layout: page
title: Python primer
permalink: /python/
---
[Back to the Phylogenetics main page](/phylogenetics2022/)

## What is Python?

[Python](http://www.python.org/) is one of two programming languages that we will use this semester (the other being R). One might make the case that programs like PAUP* and RevBayes that have their own unique command language also represent programming languages; however, Python and R are different in being general purpose (i.e. not written specifically for phylogenetics).

Python is one of a number of different high-level computing languages in common use. All of the software we use is written in one of these languages. PAUP* is written entirely in the C language, BEAST is written in Java, and RevBayes is written in C++. Knowing a little bit of computer programming can save you immense amounts of time by allowing you to automate things. You will begin realizing these savings doing homework for this class. While it is possible to do all the homework assignments by hand using a calculator, you will find that using Python will save you time and is more accurate because, once you have it programmed, you can do the same calculation with many different input values without making a mistake. 

Python is a good language to learn first because it is relatively simple (not many words or punctuation rules to learn) and is much more forgiving than other languages. It is in a class of languages known as **scripting languages** because the program is interpreted as it is read by the computer program known as the python interpreter. Languages such as C require two additional steps (compiling and linking) before they can be run.

Note that while you can use Python on the cluster, the instructions for installing Python below are written as if you plan to use Python on your own local laptop/desktop computer. You will not need to install Python if you choose to use it on the cluster. Just use the appropriate `module` command on the cluster: e.g. 

    module load 

## Installing Python

### Mac

{% include icon.html url="/assets/img/Mac_logo.png" description="MacIntosh logo" css="image-left" height="87px" %}

If you have a Mac, then Python is already installed on your computer because it is used in many parts of the Mac OS X operating system. To verify this, and to see what version of Python you have, start your Terminal program (in the _Applications/Utilities_ folder), then type the following at the unix prompt (<tt>$</tt>):

    python -V
    
The <tt>-V</tt> option does not leave you in the python environment, so go ahead and type just `python` at the unix prompt to start python in interactive mode:

    python
    
You should see something like the following. The important thing is that the last line should be three greater-than symbols in a row (this is the Python prompt):

    Python 2.7.5 (default, Aug 25 2013, 00:04:04)
    [GCC 4.2.1 Compatible Apple LLVM 5.0 (clang-500.0.68)] on darwin
    Type "help", "copyright", "credits" or "license" for more information.
    >>>

### Windows

{% include icon.html url="/assets/img/Win_logo.png" description="Windows logo" css="image-left" height="87px" %}

If you have Windows, the easiest thing to do is login to the cluster, type 

    srun --partition=mcbstudent --qos=mcbstudent --pty bash 
    
to become interactive on a free compute node, and then simply type `python` to start python. Alternatively, you can download and install Python on your Windows computer from the [Python web site](http://www.python.org/download/). Note that there are two current versions of Python. I recommend you install the latest version of Python 3 that is available.

Once you have Python installed, you can invoke it in Windows using _Start > All Programs > Python 3.x > Python (command line)_. The console window that opens should show the version at the top, and you should see the python prompt, which consists of three greater-than symbols in a row: >>>. You can also choose Start > All Programs > Python 3.x > IDLE (Python GUI) if you prefer the look and feel of the IDLE python interpreter over the windows console.

## Installing Python documentation

It is possible to [download the documentation](http://docs.python.org/download.html) so that it can be accessed quickly. I find the HTML form best: I unpacked the zip file and bookmarked it in my browser as follows:

    file:///Users/plewis/Documents/Manuals/python-html/index.html

## Python basics

This is the briefest of introductions, designed to get you just to the point where you can do the majority of your homework assignments using Python. If you get stuck trying to write a Python program, I have found the Tutorial and Global Index to be the most useful parts of the Python documentation.

### Kinds of information you can store in Python variables

Try typing in the Python code presented in the example sessions below. The `>>>` represents the **Python** **prompt** (you will see this when you start Python), so don't type that! The output is shown below each Python statement that generates output (don't type that either!). Finally, everything after a <tt>#</tt> character represents a comment (while you can type these in, it would be a waste of time unless you just want practice typing).

#### Integers, floats and strings

**Strings** are series of characters. Assign the string <tt>'Have a nice day'</tt> to the variable <tt>s</tt>:

    >>> s = 'Have a nice day'
    
You can see what is stored in a variable by simply typing the variable and hitting return:

    >>> s
    'Have a nice day'

**Integers** are whole positive or negative numbers. Assign the integer <tt>9</tt> to the variable <tt>i</tt>:

    >>> i = 9

**Floats** are numbers with an implicit or explicit decimal point. Assign the float <tt>9.5</tt> to the variable <tt>f</tt>:

    >>> f = 9.5
    
A little warning is in order about types of numbers. I would use float for all calculations. You can get yourself into trouble using integers. For example, type the following, which divides the integer 2 by the integer 4:

    >>> 2/4
    0
    
Not what you expected? Now do the same thing, except use floats instead of integers:

    >>> 2./4.
    0.5
    
The problem is that 2/4 gives you the number of times 4 can cleanly divide into 2; because 4 is already bigger than 2, the result is 0. The lesson here is that if you want a float result, you should use floats as input, and most of the time you do want a float result. You can also explicitly specify that an integer should be converted to a float before it is used in the calculation:

    >>> n = 2
    >>> float(n)/4.0
    0.5
    
Later on you will learn how to read data from a file. When numbers are read from a file, they start out as strings. If you want these strings to be used as numbers, you will need to convert them to integers or floats. Here is how to convert a string (<tt>'5'</tt>) to an integer:

    >>> x = int('5')
    >>> x
    5
    
Here is another attempt to convert a string to an integer. This one fails because the string <tt>'5.5'</tt> is not able to be converted to an integer:    
    
    >>> x = int('5.5')
    Traceback (most recent call last):
    ...
    ValueError: invalid literal for int() with base 10: '5.5' 
    
Here is how to convert a string to a float:    
    
    >>> y = float('5.5')
    >>> y
    5.5    
    
#### Lists and tuples

**Lists** are collections of integers, floats, strings, etc. Tuples are like lists, except that you cannot change elements of a tuple. Here is a list consisting of the integer, the float and the string we just defined:

    >>> L = [i, f, s]
    >>> L
    [9, 9.5, 'Have a nice day']

Change the first (0th) value in the list to 5. Note that in Python the first element of a list or tuple is 0, not 1.

    >>> L[0] = 5
    >>> L
    [5, 9.5, 'Have a nice day']

Change the second value in the list to 13 (note that this will also change the second element from a float to an integer):

    >>> L[1] = 13
    >>> L
    [5, 13, 'Have a nice day']

Change the last value in the list to the string 'OK':

    >>> L[2] = 'OK'
    >>> L
    [5, 13, 'OK']

Change the last value in the list to "G'day":

    >>> L[-1] = "G'day"
    >>> L
    [5, 13, "G'day"]

This last example illustrates two things. First, the elements can be accessed by counting backward from the number of elements. Hence, <tt>L[-1]</tt> refers to the same element as <tt>L[3-1] = L[2]</tt> (i.e., the last element). Second, you can embed an apostrophe inside a string by using double quotes to surround the string, and you could embed double quotes inside a string by using single quotes to surround it.

    >>> print 'This is a "useful" string'
    This is a "useful" string

You can find out how many elements are in the list using the <tt>len()</tt> function:

    >>> len(L)
    3

Here is a **tuple** consisting of the integer, the float and the string we just defined:

    >>> t = (i, f, s)
    >>> t
    (9, 9.5, 'Have a nice day')

Note that we used square brackets to define a list but parentheses to define a tuple. Try changing the first element of the tuple (this will generate an ugly error message because tuples cannot be modified):

    >>> t[0] = 5
    Traceback (most recent call last):
    ...
    TypeError: 'tuple' object does not support item assignment

To eliminate possible ambiguities, every tuple must have at least one comma, even if it only has just one element!

    >>> t = (1.2,)
    
If <tt>t =(1,2,3,4)</tt>, you can assign the 4 elements of the tuple <tt>t</tt> to the 4 variables <tt>a</tt>, <tt>b</tt>, <tt>c</tt>, and <tt>d</tt> like this:

    >>> t =(1,2,3,4)
    >>> a,b,c,d = t
    >>> a
    1
    >>> b
    2
    >>> c
    3
    >>> d
    4

### Arithmetic

#### Addition

Add 1 plus 2:

    >>> x = 1 + 2
    >>> x
    3

#### Multiplication

Multiply 2 and 3:

    >>> x = 2*3
    >>> x
    6

#### Exponentiation

Raise 2 to the power 3:

    >>> x = 2**3 
    >>> x
    8

#### Division

Divide the integer 6 by the integer 2:

    >>> x = 6/2
    >>> x
    3

Divide the float 6.0 by the float 2.0:

    >>> x = 6.0/2.0
    >>> x
    3.0

#### Order of operations

In the following expression, the multiplication is done before the division because operations with equal precedence are evaluated from left to right:

    >>> x = 6*7/3
    >>> x
    14

If you want the division to be done first, use parentheses:

    >>> x = 6*(7/3)
    >>> x
    12

Why does the order matter? It wouldn't in this case if you had used floats, but (once again), note that 7/3 yields 2, not 2.33333 because an integer divided by another integer yields an integer, and integers cannot have a fractional component (the value is truncated, not rounded). If this is not what you wanted, you need to use floats, which you can do by inserting a decimal point after each whole number:

    >>> x = 6.*(7./3.)
    >>> x
    14.0

#### Precedence

Some operations are evaluated before others due to their higher precedence. For example, exponentiation has higher precedence than multiplication or division, so the <tt>**</tt> is done before the multiplcation here:

    >>> x = 2*2**3
    >>> x
    16

I strongly encourage you to use parentheses, however, to make the order of calculation explicit:

    >>> x = 2*(2**3)
    >>> x
    16

Multiplication and division, in turn, have higher precedence than addition or subtraction. For the full operator precedence table, scroll to the bottom of the [expressions documentation](http://docs.python.org/reference/expressions.html)

#### Sum, min, and max

The sum function makes it easy to sum the elements of a list:

    >>> x = sum([1,2,3,4])
    >>> x
    10

The min and max functions make it easy to find the extreme values in a list:

    >>> z = [1,2,3,4]
    >>> max(z)
    4
    >>> min(z)
    1

#### Creative ways of creating lists

The <tt>range(x,y,z)</tt> function generates a list of integers starting with <tt>x</tt>, ending just before <tt>y</tt> (<tt>y</tt> itself will not be included in the list), and skipping <tt>z</tt> integers between each one included:

    >>> odd_numbers = range(1,10,2)
    >>> odd_numbers
    [1, 3, 5, 7, 9]

Something called a _list comprehension_ allows you to manipulate the values of one list while creating new list from the manipulated values. In the example below, I create a new list that contains every value in oldlist multiplied by 2:

    >>> oldlist = [1,2,3,4,5]
    >>> newlist = [x*2 for x in oldlist]
    >>> newlist
    [2, 4, 6, 8, 10]

## Using what you know

You already know enough Python to start using it to do phylogenetics!

### Computing p-distances from numbers of differences

The first step in an upcoming homework assignment is to compute p-distances (the fraction of sites that are different) from the supplied numbers of differences. Here is one way to do this in Python:

    >>> n = 3424   # store sequence length in variable n
    >>> x = 293    # store number of differences between taxon1 and taxon2 in x
    >>> p = x/n    # do the division
    >>> p
    0

Ok, you know that's not the right answer, so what went wrong? We divided one integer by another integer to produce a third integer, but instead of storing the number 0.085572429906542055 in p, it stored 0 because that is the whole number part of 0.085572429906542055. Sorry to beat this point into the ground, but it is **hard to stess too much that you should be using floats when doing calculations!** Here is how to be sure you are working with floats:

    >>> p = float(x)/float(n)
    >>> p
    0.085572429906542055

Note that the trick of including the decimal point doesn't work on variables, only on actual numbers:

    >>> p = x./n.
    File "<stdin>", line 1
     p = x./n.
           ^
    SyntaxError: invalid syntax

You can, however make the variables involved into floats when you first assign values to them. The following solution uses decimal points to save some typing and will prevent you from being surprised by later calculations involving n and/or x:

    >>> n = 3424.   # the period at the end makes n a float instead of an integer
    >>> x = 293.
    >>> p = x/n
    >>> p
    0.085572429906542055

This time <tt>p</tt> is a float because you divided one float by another.

### Computing a JC distance from a p-distance

The next step is to convert your p-distance to a JC distance. The JC distance provides an estimate of the number of substitutions that have occurred per site. This is greater than the p-distance because some substitutions can mask the effects of other substitutions (for example, an A can change to a T and then back to an A again, appearing as 0 substitutions when in fact there were 2). 

To compute the JC distance, we need some capabilities (e.g. the ability to take the logarithm of a number) that are not present by default when Python starts up. To solve this deficiency, use the **import** statement to bring in the needed functionality:

    >>> import math
    >>> jc = -0.75*math.log(1.0 - 4.0*p/3.0)
    >>> jc
    0.090860500068600705

In the <tt>import math</tt> statement, the <tt>math</tt> part is known as a Python **module**. To see a list of all modules (and documentation for them), check out the [Global Module List](http://docs.python.org/2/py-modindex.html) in the Python documentation.

Note that using <tt>import math</tt> requires us to use the prefix <tt>math.</tt> in front of every function imported. You can save some typing by being explicit about what functions you want to import from the math module:

    >>> from math import log,exp
    >>> jc = -0.75*log(1.0 - 4.0*p/3.0)
    >>> jc
    0.090860500068600705

I've imported both the <tt>log</tt> (logarithm) function as well as the <tt>exp</tt> (exponental function) even though I ended up using just <tt>log</tt>. Note that this time I did not need to specify <tt>math.log</tt>; I was able to just use <tt>log</tt> by itself.  

How do you know what there is to import from a module? One way is to visit the module's documentation, but you can also get python to provide a list of everything in the module (but note that you have to import the module before you can list its contents):

    >>> import math
    >>> dir(math)
    ['__doc__', '__file__', '__name__', '__package__', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 
    'ceil', 'copysign', 'cos', 'cosh', 'degrees', 'e', 'erf', 'erfc', 'exp', 'expm1', 'fabs', 'factorial', 'floor', 'fmod', 
    'frexp', 'fsum', 'gamma', 'hypot', 'isinf', 'isnan', 'ldexp', 'lgamma', 'log', 'log10', 'log1p', 'modf', 'pi', 
    'pow', 'radians', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc']

## Loops

An important component of any programming language is the ability to do the same sort of thing many times. In the session that follows, you will create a list containing all six pairwise differences among sequences, then use a <tt>for</tt> loop to compute the JC distance for all six. **Important: use a tab to indent**. Python is very sensitive about indenting. If the indented lines are not indented by exactly the same amount, Python will spit out an error message.

    >>> from math import log
    >>> n = 3424.
    >>> x = [293.0, 277.0, 328.0, 268.0, 353.0, 353.0]
    >>> jc = []       # start with an empty list
    >>> for i in range(6):
    ...     p = x[i]/n                           # compute p-distance using the ith value in the x list
    ...     d = -0.75*log(1.0 - 4.0*p/3.0)  # compute the JC distance and store in variable d
    ...     jc.append(d)                         # lengthen the list jc by appending the new value d
    ...                                          # just hit return here to exit the loop body
    >>> jc
    [0.090860500068600705, 0.085604236767267153, 0.1024886399705747, 0.082663697169458011, 0.11090623674796182, 0.11090623674796182]

You may be curious about <tt>range(6)</tt>. We saw the range function earlier, but there I told you it required three values: start, stop, and step. It turns out that if you only supply one value, python interprets that value as the stop value, assuming start = 0 and step = 1. The <tt>range(n)</tt> function thus produces a list of integers starting with 0 and ending with n-1. Try typing the range function by itself to verify this:

    >>> range(10)
    [0,1,2,3,4,5,6,7,8,9]

Your <tt>for i in range(6):</tt> loop could therefore have been written like this and the result would be exactly the same:

    for i in [0,1,2,3,4,5]:

Now, what does the line above mean? The <tt>for</tt> loop lets <tt>i</tt> take on each value in the list, in turn. Thus, the indented portion of the loop is executed 6 times, once for each value in the list.

## Python script files

Now that your Python constructs are getting a little longer, it is a good time to learn about creating files for your Python programs. A file containing Python statements is called a Python <tt>script</tt>. It is a good idea to have a good text editor before starting to create scripts, so your next goal will be to download one if you do not already have one installed. 

**Note: Microsoft Word is _not_ a good text editor!** It is an excellent word processor, but text editors and word processors are different beasts. Text editors always save files as plain text, while Word saves the file in its proprietary file format that Python cannot read. It is possible to save Word files as plain text, but usually this is more trouble than it is worth.

### Install a text editor

Fortunately, there are free (and really good) text editors for both Windows and Macs.

---

{% include icon.html url="/assets/img/Mac_logo.png" description="MacIntosh logo" css="image-left" height="87px" %}

If you have a Mac, download [BBEdit](http://www.barebones.com/products/bbedit/download.html). Once you get BBEdit installed, start it up and create a file with the contents shown below (after the instructions for Windows users). Save the file using the name <tt>first.py</tt> in a convenient location (e.g. _Documents/scripts_), then navigate to that folder in your Terminal window using the command

    cd $HOME/Documents/scripts
    
If you don't want to download BBEdit, you can use the TextEdit app that came with your Mac. If you do end up using TextEdit, I **strongly recommend** that you change the default format from _Rich text_ to _Plain text_ in the TextEdit Preferences.

---

{% include icon.html url="/assets/img/Win_logo.png" description="Windows logo" css="image-left" height="87px" %}

If you have Windows, but you are using Python on the cluster, you should just use the `nano` editor to create and modify your python script files. If, however, you installed Python on your Windows machine, download [Notepad++](http://notepad-plus.sourceforge.net/uk/site.htm). Once you get Notepad++ installed, start it up and create a file with the contents shown below. Save the file using the name _first.py_ in a convenient location (e.g. _C:\scripts_), then navigate to that folder in your command console using the command 

    cd C:\scripts

### Your first Python script

Here is what you should type into your new <tt>first.py</tt> file:

    from math import log
    n = 3424.
    x = [293.0, 277.0, 328.0, 268.0, 353.0, 353.0]
    jc = []
    for i in range(6):
     p = x[i]/n
     d = -0.75*log(1.0 - 4.0*p/3.0)
     jc.append(d)
    print(jc)

Note that I have used the <tt>print</tt> function on the last line. This is because our little trick of getting Python to tell us the value of a variable by placing the variable's name on a line by itself only works when you are using Python _interactively_. We are now switching to programming mode, where an entire script is given to the Python interpreter, and a print statement must be used in this context. The result should be the same.

#### If you are using Windows (and not running python on the cluster)

Try running your script by typing the following at your operating system prompt (i.e. get out of Python if you are already in it by typing Ctrl-z):

    first.py
    
When Python was installed, it should have associated the <tt>.py</tt> file name extension with python scripts, and thus it should know to use python to process such files. As a result, you need only type the name of the file and hit return to run it. 

#### If you are using a Mac (or are running python on the cluster)

Try running your script by typing the following at your operating system prompt (i.e. get out of Python if you are already in it by typing Ctrl-d):

    python first.py

## Fancier print statements

The program _first.py_ spits out six JC distance values, but it is usually good to format the output so that it is clearer than this. Copy the following into a new text file named _second.py_ and try running it:

    from math import log
    n = 3424.
    x = [293.0, 277.0, 328.0, 268.0, 353.0, 353.0]
    for i in range(6):
        p = x[i]/n
        d = -0.75*log(1.0 - 4.0*p/3.0)
        print('%12d %12.5f %12.8f' % (i, p, d))

You will note a couple of differences between _first.py_ and _second.py_. First, there is no <tt>jc</tt> list anymore, we just print out values as they are computed. Second, the <tt>print</tt> statement is much more complicated now! The complexity might be daunting at first, but you will quickly become adjusted to it I think. 

Here is how the print statement used in _second.py_ works. There are two parts separated by a percent symbol (%). The first part is a string:

    '%12d %12.5f %12.8f'
    
while the second part is a tuple:

    (i, p, d)
    
The string serves as a format specification. Here is a breakdown:
* <tt>%12d</tt> says print an integer (<tt>d</tt> is code for integer here) using 12 spaces
* <tt>%12.5f</tt> says print a float (<tt>f</tt> is code for float here) using 12 spaces total, with 5 of the 12 being devoted to the part after the decimal point
* <tt>%12.8f</tt> says print another float using 12 spaces, this time with 8 of the 12 being after the decimal point

The tuple provides the values to insert: the integer stored in the variable <tt>i</tt> will go in the first spot, while the floats stored in <tt>p</tt> and <tt>d</tt> will go in the second and third spots. Be sure to use <tt>d</tt> for integers and <tt>f</tt> for floats in your format string, otherwise Python will complain.

Run _second.py_ and see if Python spaced everything as you expected. Note that the second float will actually take up 13 spaces because there is a single space in the format string just before the <tt>%12.5f</tt> specification. Spaces in the format string are inserted as is into the print output.

## Computing the sum-of-squares

The next step in your homework assignment involves computing the sum-of-squares for each of the two trees provided. The sum-of-squares formula given in lecture (for the case of power=2) is:

{% include icon.html url="/assets/img/ss.png" description="Sum of squares formula" css="image-center-noborder" height="80px" %}

Let's create a Python script that will spit out the numbers we need for the table labeled "SS for Tree 1" in the homework assignment. Here is the script. Save it as _ss1.py_:

    from math import log
    n = 3424.
    rowname = ['1 vs. 2', '1 vs. 3', '1 vs. 4', '2 vs. 3', '2 vs. 4', '3 vs. 4']
    path = [0.3, 0.3, 0.2, 0.2, 0.3, 0.3]
    x = [293.0, 277.0, 328.0, 268.0, 353.0, 353.0]
    totalSS = 0.0
    for i in range(6):
        pdist = x[i]/n
        dij = -0.75*log(1.0 - 4.0*pdist/3.0)
        pij = path[i]
        numerator = (dij - pij)**2.0
        denominator = dij**2.0
        SS = numerator/denominator
        totalSS += SS
        print('%12s %12.5f %12.5f %12.5f' % (rowname[i], pij, dij, SS))
        print('total SS = %.5f' % totalSS)

Here are the new additions:
* A <tt>rowname</tt> variable has been added to which is assigned a list of strings. Each element of rowname will serve as the label for a row in the table that is output
* A <tt>path</tt> variable has been added to which has been assigned a list of path lengths through Tree 1. Each element of <tt>path</tt> is the path length for the corresponding comparison named in <tt>rowname</tt>
* A variable named <tt>totalSS</tt> was added to keep track of the sum of the individual pairwise SS values as they are calculated. Note that we have to initialize the value of <tt>totalSS</tt> to zero before the loop begins
* I've introduced a <tt>pij</tt> variable to hold the current path length
* The numerator and denominator variables hold the top and bottom parts of the SS calculation. The double-asterisk means "raised to the power of"
* The SS variable holds the sum-of-squares value for pairwise comparison i
* The <tt>totalSS += SS</tt> tells Python that we want to add the current value of SS to the running sum being stored in the variable <tt>totalSS</tt>
* The last line prints the value of <tt>totalSS</tt>. Note that if there is only one value to be substituted in a format string, you needn't make it into a tuple (i.e. no parentheses are needed around <tt>totalSS</tt>)

Try running this script and let us know if you don't understand how it works.

## Files

One of the most fundamental tasks in programming is to read information stored in an input file and write the program's output to an output file. Here are the absolute basics of doing this in Python.

### Reading data from a file

Suppose you wanted to read in the six values that we've been storing in the variable <tt>x</tt> from a file. To experiment with this, we'll need a file. Create a file named _ss1.txt_ using your text editor that contains the six numbers, one per line. It should look like this:

    293.0
    277.0
    328.0
    268.0
    353.0
    353.0

To read these values, add these five lines to your _ss1.py_ file and comment out the line that currently defines <tt>x</tt> (place a pound sign #<tt>#</tt> in front of the <tt>x</tt>):

    lines = open('ss1.txt','r').readlines()
    x = []
    for line in lines:
        f = float(line)
        x.append(f)
    # x = [293.0, 277.0, 328.0, 268.0, 353.0, 353.0] 

The first line above opens a file named _ss1.txt_ for reading (this is what the <tt>r</tt> means). The <tt>readlines()</tt> part causes the entire contents of the file to be read, creating a list in which each element is a separate line from the file. This list is stored in the variable <tt>lines</tt>.

The <tt>for</tt> loop visits each element in <tt>lines</tt> one at a time. This represents a different (more convenient) style of <tt>for</tt> loop that doesn't require us to know how long the lines list is (that is, this style avoids having to use <tt>range(n)</tt>, which would require us to know <tt>n</tt>). Inside the <tt>for</tt> loop, the string read from one particular line in the file is stored in the variable <tt>line</tt>. The string in <tt>line</tt> is converted to a float named <tt>f</tt>, which is then appended to the growing list <tt>x</tt>. After all is said and done, the variable <tt>x</tt> will be exactly the same (a list of six float values) that it was before when we defined it directly.

Note that we had to explicitly convert each line into a float value. This is because each line of information read from the file is stored as a string, not a float. If you failed to explicitly convert each value, you would later run into trouble when you tried to do arithmetic with the values stored in <tt>x</tt>.

### Writing output to a file

Writing to a file involves creating a Python variable that represents the file, then calling that variable's <tt>write</tt> function to spit out something to the file. Create a file for writing (note the <tt>'w'</tt> for writing rather than <tt>'r'</tt> for reading) as follows:

    outfile = open('output.txt', 'w')

You can now write something to it like this:

    outfile.write('Hello\n')

One big difference between writing to a file versus printing to the terminal is that the write function does not terminate the line. The end-of-line character is designated using the two-character combination <tt>\n</tt>. Thus, if you wanted two blank lines between the words "Hello" and "Goodbye" you would do this:

    outfile.write('Hello\n\nGoodbye')

When you are finished writing to the file (say, as the last line of your script), be sure to close the file:

    outfile.close()

### A revised script

    from math import log
    n = 3424.
    rowname = ['1 vs. 2', '1 vs. 3', '1 vs. 4', '2 vs. 3', '2 vs. 4', '3 vs. 4']
    path = [0.3, 0.3, 0.2, 0.2, 0.3, 0.3]

    # Here is where we read in the x values from a file
    lines = open('ss1.txt','r').readlines()
    x = []
    for line in lines:
        f = float(line)
        x.append(f)

    # Here we create an output file
    outf = open('output.txt', 'w')

    totalSS = 0.0
    for i in range(6):
        pdist = x[i]/n
        dij = -0.75*log(1.0 - 4.0*pdist/3.0)
        pij = path[i]
        numerator = (dij - pij)**2.0
        denominator = dij**2.0
        SS = numerator/denominator
        totalSS += SS
        outf.write('%12s %12.5f %12.5f %12.5f\n' % (rowname[i], pij, dij, SS))
    outf.write('total SS = %.5f\n' % totalSS)
    outf.close()
