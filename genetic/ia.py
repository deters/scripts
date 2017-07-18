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
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 1, 1, 1, 0,
        0, 0, 0, 0, 0, 0, 0
   ]



output_pattern = [ 
	0, 0, 1, 1, 1, 0, 0, 0
   ]


def getf(layer):
  verdadeiros = 0.0
  falsos = 0.0
  for x in range(len(layer)):
    layer[x].processar()
    resposta = layer[x].value
    if output_pattern[x] == 1:
      if resposta >=  0.5:
        verdadeiros += 100
      else:
        verdadeiros += resposta;
    else:
      if resposta < 0.5:
        falsos += 100
      else:
        falsos += resposta * -1
  return int((verdadeiros + falsos))


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


def random_connect_layer(layerA, layerB, sinapse_count):
  #for a in range(len(layerA)):
  #  for b in range(2):
  #    layerB[ random.randint(0,len(layerB)-1)  ].addInput( layerA[a], dna.genoma(0.5) )
  for b in range(len(layerB)):
    for a in range(4):
      layerB[ b ].addInput( layerA[random.randint(0,len(layerA)-1) ], dna.genoma(0.5) )





layer1 = []

for i in range(16):
  n = Neuronio(dna, 'Layer 1 Neuronio '+str(i))
  layer1.append(n)


layer2 = []

for i in range(16):
  n = Neuronio(dna, 'Layer 2 Neuronio '+str(i))
  layer2.append(n)


layerOutput = []

for i in range(len(output_pattern)):
  n = Neuronio(dna, 'Layer Out Neuronio '+str(i))
  layerOutput.append(n)


layers = [layer0,layer1,layer2,layerOutput]

random_connect_layer(layer0,layer1,4)
random_connect_layer(layer1,layer2,4)
random_connect_layer(layer2,layerOutput,4)




print 'DNA contain ',len(dna.dna),' genomas.'




def debug():
	for l in range(len(layers)):
	  print 'layer ',l
	  layer = layers[l]
	  for i in range(len(layer)):
	    neuronio = layer[i]
	    print 'input: ',neuronio.identifier,' valor = ',neuronio.processar()
	    #for j in range(len(neuronio.inputs)):
	    #  print '     ',neuronio.inputs[j].identifier,' valor: ',neuronio.inputs[j].processar(),'     peso: ',neuronio.dna.get(neuronio.genomas[j])
	  print ' '





class Nature:

	species = []

	def __init__(self):
            self.species = []


	def best(self, a,b):
	    dna.dna = a
	    fa = fitness(layerOutput)
	    dna.dna = b
	    fb = fitness(layerOutput)
	    return fb - fa

	def selectBest(self, limit):
	    self.species.sort(cmp=self.best)
	    del self.species[limit:]


	def newAlleatory(self):
	    size = len(dna.dna)
	    newdna = []
	    for i in range(size):
		newdna.append(random.uniform(0,1))
	    return newdna


	def crossover(self, a,b):
	    resultado = list(a)
	    for x in range(min(len(a),len(b))):
		if random.randint(0,1) == 0:
		    resultado[x] = a[x]
		else:
		    resultado[x] = b[x]
	    return resultado

	def mutation(self, a):
	    resultado = list(a)
	    mutacoes = 5
	    for j in range(mutacoes):
		pos = random.randint(0,len(a)-1)
		resultado[pos] = random.uniform(0,1)
	    return resultado

	def run(self, max_generations):
		MAX_ALEATORY_PER_GENERATION = 10
		MAX_CROSSOVERS_PER_GENERATION = 10
		MAX_MUTATIONS_PER_GENERATION = 10
		for generation in range(max_generations): # 20 generations
		    # a) create new alleatory species
		    for p in range(MAX_ALEATORY_PER_GENERATION):
			self.species.append( self.newAlleatory() )


		    # b) do a crossover between the first 10 species and all others
		    for a in range(min(len(self.species),MAX_CROSSOVERS_PER_GENERATION)):
			for b in range(min(len(self.species),40)):
			    self.species.append( self.crossover(self.species[a], self.species[b]) )

		    # c) and try to mutate the first 10 species (the best ones)
		    for specie in self.species[0:MAX_MUTATIONS_PER_GENERATION]:
		      self.species.append( self.mutation(specie) )

		    # FINALLY keep only the 20 best ones from this generation.
		    self.selectBest(20)
		    # get the first species
		    dna.dna = self.species[0]
		    f = fitness(layerOutput)
		    print 'Best from Generation ',generation, ' reached fitness ',f
		    if (f >= len(output_pattern)*100):
			debug()
		    	exit()


nature = Nature()
nature.run(20)


