import pandas as pd 
import numpy as np 
from data_handling.pca import *

def scatter_matrix(df):
	pca_res = apply_pca(df)
	columns = pca_res['top3_feat']

	X = df[columns].to_numpy()

	res_dict = [{columns[0]:X[i,0],
				 columns[1]:X[i,1],
				 columns[2]:X[i,2]}
				 for i in range(X.shape[0])]

	return res_dict