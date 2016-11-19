#!/usr/bin/python

import random

alfabeto = '"!@#$%*()_+=-1234567890abcdefghijklmnopqrstuvwxyz'
senha = 'nikitenko'


def fitness(teste):
    result = 0
    for i in range(min(len(teste),len(senha))):
        if teste[i] == senha[i]:
            result += 1 
    return result 

def new():
    size = len(senha)
    str = ''
    for i in range(size):
        str += random.choice(alfabeto)
    return str

geracao = 0

populacao = []

def best(a,b):
    return fitness(b) - fitness(a)

def selecionar(especies):
    especies.sort(cmp=best)
    print especies
    del especies[10:]
    return especies 


def misturar(a,b):
    resultado = list(a)
    for x in range(min(len(a),len(b))):
        if random.randint(0,1) == 0:
            resultado[x] = a[x]
        else:
            resultado[x] = b[x]
    return ''.join(resultado)



def mutar(a):
    resultado = list(a)
    mutacoes = 1
    for j in range(mutacoes):
        pos = random.randint(0,len(a)-1)
        resultado[pos] = random.choice(alfabeto)
    return ''.join(resultado)


for i in range(1000):
    for p in range(100 - len(populacao)):
        populacao.append( new() )
    for a in range(len(populacao)):
        for b in range(min(len(populacao),5)):
            populacao.append( misturar(populacao[a], populacao[b]) )
    populacao.append( mutar(populacao[random.randint(0,len(populacao)-1)]) )
    populacao = selecionar(populacao)
    print i, fitness(populacao[0]), populacao[0:100], fitness(populacao[-1])
    if senha == populacao[0]:
        exit()






