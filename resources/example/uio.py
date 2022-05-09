import os

path = '/home/jovyan/uio'
files = []
for (dirpath, dirnames, filenames) in os.walk(path):
    for i in filenames:
        files.append(os.path.join(dirpath, i))
    break
    
count = 0
for i in files:
    f = open(i, 'r')
    for line in f:
        count += line.count('lorem')

f = open('/home/jovyan/result.txt', 'a')
f.write('UiO: ' + str(count) + '\n')
f.close()