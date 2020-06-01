import pandas as pd 
import numpy as np 
from sklearn.decomposition import PCA
from data_handling.sample_data import *

def apply_pca(df):

	# Getting names of features
	features = list(df.columns)

	# Applying dim reduction
	dmred = PCA()
	dmred.fit(df)

	# Calculating % variance explained by each principal component
	scree = list(dmred.explained_variance_ratio_*100)
	scree_x = [i+1 for i in range(len(scree))]

	# Calculating cumulative % variance explained 
	cumulative = [sum(scree[0:i+1]) for i in range(0,len(scree))]

	# Intrinsic dimensionality is number of components cumulatively explaining 75% variance
	intrinsic_dim = [cumulative.index(i)+1 for i in cumulative if i>=75][0]

	# Contribution of each feature in components representing intrinsic dimensionality (loadings)
	loadings = np.sum(np.square(dmred.components_)[0:intrinsic_dim,:], axis = 0)

	# Getting names of top three features ranked by PCA loadings
	top3_feat = [list(df.columns)[index] for index in list(loadings.argsort()[-3:][::-1])]

	res_dict = {
	'datapoints': [{'scree_x':scree_x[i], 'scree':scree[i]}
				  for i in range(len(scree))],
	'cumulative':cumulative,
	'intrinsic_dim':intrinsic_dim,
	'top3_feat':top3_feat
	}

	return res_dict

def pca_project(df, dimensions=2):

	# Initialize PCA
	dmred = PCA(dimensions)
	X = dmred.fit_transform(df)

	res_dict ={
	'datapoints': [{'x':X[i,0], 'y':X[i,1]}
					for i in range(X.shape[0])]
	}

	return res_dict