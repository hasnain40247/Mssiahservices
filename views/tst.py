#19BAI1072 Hasnain Sikora FATLAB 4/6/2021

mainArray = [#Define array with 0 as space and 1 as obsracle
    [0,1,0,0,0],
    [0,0,0,1,0],
    [0,1,1,0,0],
    [1,1,0,0,1],
    [0,1,1,0,0]
]
begin = [0,0]
end = [4,4]

def move(k):
  for i in range(len(m)):
    for j in range(len(m[i])):
      if m[i][j] == k:
        if i>0 and m[i-1][j] == 0 and a[i-1][j] == 0:
          m[i-1][j] = k + 1
        if j>0 and m[i][j-1] == 0 and a[i][j-1] == 0:
          m[i][j-1] = k + 1
        if i<len(m)-1 and m[i+1][j] == 0 and a[i+1][j] == 0:
          m[i+1][j] = k + 1
        if j<len(m[i])-1 and m[i][j+1] == 0 and a[i][j+1] == 0:
           m[i][j+1] = k + 1

m = []
for i in range(len(mainArray)):
    m.append([])
    for j in range(len(a[i])):
        m[-1].append(0)
i,j = begin
m[i][j] = 1


k = 0
while m[end[0]][end[1]] == 0:
    k += 1
    move(k)


i, j = end
k = m[i][j]
path = [(i,j)]
while k > 1:
  if i > 0 and m[i - 1][j] == k-1:
    i, j = i-1, j
    path.append((i, j))
    k-=1
  elif j > 0 and m[i][j - 1] == k-1:
    i, j = i, j-1
    path.append((i, j))
    k-=1
  elif i < len(m) - 1 and m[i + 1][j] == k-1:
    i, j = i+1, j
    path.append((i, j))
    k-=1
  elif j < len(m[i]) - 1 and m[i][j + 1] == k-1:
    i, j = i, j+1
    path.append((i, j))
    k -= 1
  

print("Optimal Path for the given maze is:")
path.reverse()
print(path)
