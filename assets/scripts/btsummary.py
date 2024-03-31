import re

#  Searches for and counts strings like this: '0 1 Z 0 0 1 1 0

# Read entire contents of file into variable named stuff
stuff = open('rjmcmc-dependent.txt', 'r').read()

# Use a regular expression search to pull out all model strings and store in model_list variable
# The re.M tells the re module that there may be newlines in stuff (M = multiline)
# The [Z0-9] items each say that the searched-for expression has either a Z or a 
# digit at that position ("0-9" means "0 to 9").
model_list = re.findall("'[Z0-9] [Z0-9] [Z0-9] [Z0-9] [Z0-9] [Z0-9] [Z0-9] [Z0-9]", stuff, re.M | re.S)

# Create a dictionary entry to keep track of the total count for each distinct model string
model = {}
for m in model_list:
    if m in model.keys():
        # this model string already has an entry, add 1 to count
        model[m] += 1
    else:
        # this model string is distinct, start count at 1
        model[m] = 1

# Create a list of tuples (v,k), where v is the value (count) and k is the key (model string),
# then sort from highest to lowest (count)
model_tuples = [(v,k) for (k,v) in model.items()]
model_tuples.sort()
model_tuples.reverse()

# Write out all counts and their associated model strings
total = 0
for v,k in model_tuples:
    print('%12d   %s' % (v, k))
    total += v
print('Total matches: %d' % total)
