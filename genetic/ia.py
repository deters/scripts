#!/usr/bin/python

import random 


class DNA:
  def __init__(self):
    self.dna = []

  def genoma(self, value):
    self.dna.append(value)
    return len(self.dna)-1

  def get(self, i):
    return self.dna[i]


class Neuronio:

  value = None

  def __init__(self, dna, identifier):
    self.inputs = []
    self.genomas = []
    self.dna = dna
    self.identifier = identifier

  def setValue(self, value):
    self.value = value

  def processar(self):
    self.value = 0
    for i in range(len(self.inputs)):
      self.value = self.value + ( self.inputs[i].processar() * self.dna.get(self.genomas[i]) )
    self.value = self.value / 2
    if self.value >= 0.5:
      return 1
    else:
      return 0

  def addInput(self, input, genoma):
    self.inputs.append(input)
    self.genomas.append(genoma)
    self.value = None

class Entrada(Neuronio):
  def processar(self):
    return self.value




dna = DNA()

input_pattern = [ 
	0, 0, 1, 1, 1, 0, 0,
        0, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 0, 1, 1, 0,
        0, 1, 1, 0, 1, 1, 0
   ]

input_pattern2 = [ 
	0, 0, 0, 0, 0, 0, 0,
        0, 1, 1, 1, 1, 1, 0,
        0, 1, 1, 0, 1, 1, 0,
        0, 1, 1, 1, 1, 1, 1
   ]



output_pattern = [ 
	0, 0, 1, 1, 1, 0, 0, 0
   ]


def getf(layer):
  verdadeiros = 0.0
  falsos = 0.0
  for x in range(len(layer)):
    resposta = layer[x].processar()
    if output_pattern[x] == 1:
      if resposta >=  0.5:
        verdadeiros += 1.01
    else:
      if resposta < 0.5:
        falsos += 1
  return int((verdadeiros + falsos)*100)


def fitness(layer):
  setInput(input_pattern)
  f1 = getf(layer)
  setInput(input_pattern2)
  f2 = getf(layer)
  return (f1 + f2) / 2

layer0 = []

for i in range(len(input_pattern)):
  input1 = Entrada(dna, 'Layer 0 Neuronio '+str(i))
#  input1.setValue(input_pattern[i])
  layer0.append(input1)

def setInput(input_pattern):
    for i in range(len(input_pattern)):
      layer0[i].setValue(input_pattern[i])

layer1 = []

for i in range(8):
  n = Neuronio(dna, 'Layer 1 Neuronio '+str(i))
  for qt in range(4):
      n.addInput( layer0[random.randint(0,len(layer0)-1)], dna.genoma(0.5) )
  layer1.append(n)


layer2 = []

for i in range(8):
  n = Neuronio(dna, 'Layer 2 Neuronio '+str(i))
  for qt in range(4):
      n.addInput( layer1[random.randint(0,len(layer1)-1)], dna.genoma(0.5) )
  layer2.append(n)


layer3 = []

for i in range(len(output_pattern)):
  n = Neuronio(dna, 'Layer 3 Neuronio '+str(i))
  for qt in range(4):
      n.addInput( layer2[random.randint(0,len(layer2)-1)], dna.genoma(0.5) )
  layer3.append(n)



layers = [layer0,layer1,layer2,layer3]



print len(dna.dna)




def best(a,b):
    dna.dna = a
    fa = fitness(layer3)
    dna.dna = b
    fb = fitness(layer3)
    return fb - fa


def selecionar(especies):
    especies.sort(cmp=best)
    #print especies
    del especies[20:]
    return especies 

def misturar(a,b):
    resultado = list(a)
    for x in range(min(len(a),len(b))):
        if random.randint(0,1) == 0:
            resultado[x] = a[x]
        else:
            resultado[x] = b[x]
    return resultado




def mutar(a):
    resultado = list(a)
    mutacoes = 5
    for j in range(mutacoes):
        pos = random.randint(0,len(a)-1)
        resultado[pos] = random.uniform(0,1)
    return resultado


populacao = []



def new():
    size = len(dna.dna)
    newdna = []
    for i in range(size):
        newdna.append(random.uniform(0,1))
    return newdna


def debug():
	for l in range(len(layers)):
	  print 'layer ',l
	  layer = layers[l]
	  for i in range(len(layer)):
	    neuronio = layer[i]
	    print neuronio.identifier,' valor = ',neuronio.processar()
	    for j in range(len(neuronio.inputs)):
	      print '     ',neuronio.inputs[j].identifier,' valor: ',neuronio.inputs[j].processar(),'     peso: ',neuronio.dna.get(neuronio.genomas[j])
	  print ' '



for i in range(1000):
    for p in range(40 - len(populacao)):
        populacao.append( new() )
    for a in range(len(populacao)):
        for b in range(min(len(populacao),10)):
            populacao.append( misturar(populacao[a], populacao[b]) )
    for a in range(10):
      populacao.append( mutar(populacao[10]) )
    populacao = selecionar(populacao)
    dna.dna = populacao[0]
    f = fitness(layer3)
    debug()
    print i, f#, populacao[0:100], fitness(populacao[-1])
    if (f >= len(output_pattern)*100):
      exit()
