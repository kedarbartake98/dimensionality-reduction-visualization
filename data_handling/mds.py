import pandas as pd 
import numpy as np 
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances

def mds_1(df):
	# Euclidean Distance
	mds = MDS(dissimilarity='euclidean')
	X = mds.fit_transform(df)

	res_dict ={
	'datapoints': [{'x':X[i,0], 'y':X[i,1]}
					for i in range(X.shape[0])]
	}

	return res_dict

def mds_2(df):
	# Correlation Distance
	corr_matrix = pairwise_distances(df, metric='correlation')
	mds = MDS(2, dissimilarity='precomputed')
	X = mds.fit_transform(corr_matrix)

	res_dict ={
	'datapoints': [{'x':X[i,0], 'y':X[i,1]}
					for i in range(X.shape[0])]
	}

	return res_dict
	