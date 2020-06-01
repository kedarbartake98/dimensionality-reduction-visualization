import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, OneHotEncoder

def random_sample(df, ratio=0.25):
    
    return df.sample(frac=ratio)

def get_elbow_plot(df, max_clusters=15):
    
    metric_values = []
    
    for k in range(2,max_clusters):
        
        cluster = KMeans(k)
        cluster.fit(df)
        
        metric_values.append(cluster.inertia_)
    
    plt.plot(range(2,max_clusters), metric_values, linewidth=5)
    plt.xticks(range(2,max_clusters))
    plt.xlabel('Number of Clusters k')
    plt.ylabel('Squared error for cluster (Inertia)')
    
def stratified_sampling(df, k=8, ratio=0.25):
    
    # value of k chosen from the elbow plot (refer to report)
    
    clus = KMeans(k)
    clus.fit(df)
    
    sampled_data = pd.DataFrame()
    
    df['cluster_labels'] = clus.predict(df)
    cluster_labels = list(df['cluster_labels'].unique())
    
    print('Distribution of cluster labels before sampling:\n{}\n\n'.format(df['cluster_labels'].value_counts(normalize=True)))
    
    for label in cluster_labels:
        
        addendum = df[df['cluster_labels']==label].sample(frac=ratio)
        
        if len(addendum)==0:
            addendum = df[df['cluster_labels']==label].sample(n=1)
        
        sampled_data = sampled_data.append(addendum)
    
    sampled_data = sampled_data.sample(frac=1)

    print('Distribution of cluster labels after sampling:\n{}\n\n'.format(sampled_data['cluster_labels'].value_counts(normalize=True)))
    
    cols = list(sampled_data.columns)
    cols.remove('cluster_labels')
    
    return sampled_data[cols]
   
def preprocess_data(df):
    
    feature_dict ={
        'Numerical':['LotFrontage', 'LotArea', 'YearBuilt', 'SalePrice', 'OverallQual', 'BedroomAbvGr'],
        'Categorical': ['LotShape', 'LandSlope', 'BldgType', 'RoofStyle', 'Foundation']
    }
    
    columnlist = [feature_dict[key] for key in list(feature_dict.keys())]
    columns = []
    
    [columns.extend(list_) for list_ in columnlist]
    
    df = df[columns]#.sample(n=600)

    # Dropping rows with NaN values
    df = df.dropna()
    
    # Replacing Numerical values with Normalized values (0 mean unit variance)
    for feature in feature_dict['Numerical']:

        preprocessor = StandardScaler()
        df[feature] = preprocessor.fit_transform(df[[feature]])
        
    # Categorical values with one-hot encoded vectors
    for feature in feature_dict['Categorical']:

        preprocessor = OneHotEncoder(sparse=False)
        preprocessor.fit(df[[feature]])
        classes = preprocessor.categories_
        encoded = preprocessor.transform(df[[feature]])

        for i, classname in enumerate(list(classes[0])):

            df[classname] = encoded[:,i]

        del df[feature]
    
    return df

