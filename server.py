from flask import Flask, render_template, url_for, jsonify, request
from data_handling.sample_data import *
from data_handling.pca import *
from data_handling.mds import *
from data_handling.scatter_plot_matrix import *
import pandas as pd
import os
import random, json

app = Flask(__name__)

@app.route('/')

def entrypoint():
	data = pd.read_csv('static\\data\\train.csv')
	preprocessed = preprocess_data(data)
	stratified_sample = stratified_sampling(preprocessed)
	randomly_sampled = random_sample(preprocessed)
	stratified_sample.to_csv('static\\data\\stratified_sample.csv', index=False)
	randomly_sampled.to_csv('static\\data\\random_sample.csv', index=False)

	return render_template('index.html')

@app.route('/process_data', methods=['POST'])

def process_data():

	dataset_type = request.form['dataset']
	task = request.form['task']

	df = pd.read_csv('static\\data\\train.csv')
	df = preprocess_data(df)

	if dataset_type=='rand':
		df = random_sample(df)

	elif dataset_type=='strat':
		df = stratified_sampling(df)

	task_dict = {'PCA':apply_pca,
		     'PCA_project':pca_project,
		     'MDS_project_1':mds_1,
		     'MDS_project_2':mds_2,
		     'Scatterplot':scatter_matrix};

	return jsonify(task_dict[task](df))


if __name__=='__main__':
	app.run(debug=True)
