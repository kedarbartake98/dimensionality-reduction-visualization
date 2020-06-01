// code for axes, bar charts referred from https://www.tutorialsteacher.com/d3js/scales-in-d3

document.getElementById("task").onchange = function() {
	var dmenu = document.getElementById("data");
	var data = dmenu.options[dmenu.selectedIndex].value;

	if (data=='None')
	{
		window.alert('Please choose dataset for the task !!');
	}

	else
	{
		call_process(this.value, data);
	}
}

document.getElementById("data").onchange = function(){
	var tmenu = document.getElementById("task");
	var task = tmenu.options[tmenu.selectedIndex].value;

	if (task=='None')
	{
		window.alert('Please choose the task for the dataset !!');
	}
	else
	{
		call_process(task, this.value);
	}
}

function call_process(task, data)
{

	var task_dict = {'PCA':scree,
					 'PCA_project':pca_project,
					 'MDS_project_1':mds_1,
					 'MDS_project_2':mds_2,
					 'Scatterplot':scatter_matrix};

	$.ajax({

		type:"POST",
		url: "/process_data",
		dataType:'json',
		data: {dataset:data, task: task},
		success: function(data){
			task_dict[task](data);
		}
	})
}

function scree(data)
{
	// console.log(data);
	var svg = d3.select("svg");
	svg.selectAll("*").remove();

	var svg = d3.select("#graph")
	  .attr("width", 1200)
	  .attr("height", 600);

	document.getElementById('sig_attr').innerHTML ="";

	var datapoints = data['datapoints'];
	var cumulative = data['cumulative'];

	var svg = d3.select("#graph"),
		margin = 200,
		width  = svg.attr("width")-margin,
		height = svg.attr("height")-margin-50;

	var xScale = d3.scaleBand().range([0, width]).padding(0.4),
		yScale = d3.scaleLinear().range([height,0]);

	var g = svg.append("g")
			   .attr("transform","translate("+100+","+100+")");

	var intrinsic_dim = data['intrinsic_dim']
	
	var inflectx
	var inflecty

	svg.append("text")
       .attr("transform", "translate(500,0)")
       .attr("x", 50)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text("Scree Plot Visualization");

	xScale.domain(datapoints.map(function(d){return d.scree_x;}));
	yScale.domain([0, 100]);

	g.append("g")
	 .attr("transform","translate(0,"+height+")")
	 .call(d3.axisBottom(xScale))
	 .append("text")
	 .attr("y", height-250)
	 .attr("x", width-500)
	 .attr("text-anchor", "end")
	 .attr("stroke", "black")
	 .text("Principal Component Number");

	g.append("g")
	 .call(d3.axisLeft(yScale).tickFormat(function(d){
	 	return d+"%";
	 }).ticks(10))
	   .append("text")
	   .attr("transform","rotate(-90) translate(-100,0)")
	   .attr("y",6)
	   .attr("dy", "-5.1em")
	   .attr("text-anchor", "end")
	   .attr("stroke", "black")
	   .text("Percentage of Variance explained");

  	g.selectAll(".bar")
     .data(datapoints)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", function(d) { return xScale(d.scree_x); })
     .attr("y", function(d) { return yScale(d.scree); })
     .attr("width", xScale.bandwidth())
     .attr("height", function(d) { return height - yScale(d.scree); });

    svg.append("path")
      .datum(cumulative)
      .attr("class", "line")
      .attr("d", d3.line()
      .x(function(d,i) { if (i==intrinsic_dim-1){inflectx =100+xScale(i+1)+xScale.bandwidth()/2;
      										   inflecty=100+yScale(d);}
      					 return 100+xScale(i+1)+xScale.bandwidth()/2;})
      .y(function(d) { return 100+yScale(d);})
      )
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5);

    
    svg.append("circle")
       .attr("cx", inflectx)
       .attr("cy", inflecty)
       .attr("r", 5)
       .attr("fill", "orange");


    document.getElementById('sig_attr').innerHTML = "The top 3 attributes with highest PCA loadings are: "+data['top3_feat'].join(", ")+
    "<br>"+"Intrinsic Dimensionality of the data is : "+data['intrinsic_dim'];

}

function scatterplot(data, title)
{
	console.log('scatterplot');
	var svg = d3.select("svg");
	svg.selectAll("*").remove();

	var svg = d3.select("#graph")
	  .attr("width", 1200)
	  .attr("height", 600);

	document.getElementById('sig_attr').innerHTML ="";

	datapoints = data["datapoints"];

	var svg = d3.select("#graph"),
		margin = 200,
		width  = svg.attr("width")-margin,
		height = svg.attr("height")-margin-50;

	svg.append("text")
       .attr("transform", "translate(500,0)")
       .attr("x", 50)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text(title);

	var xScale = d3.scaleLinear().range([0, width]),
		yScale = d3.scaleLinear().range([height,0]);	

	yScale.domain([d3.min(datapoints, function(d) {return d.y;}), d3.max(datapoints, function(d) { return d.y; })]);
	xScale.domain([d3.min(datapoints, function(d) {return d.x;}), d3.max(datapoints, function(d) { return d.x; })]);

	var g = svg.append("g")
			.attr("transform","translate("+100+","+100+")");
	
	g.append("g")
	 .attr("transform","translate(0,"+height+")")
	 .call(d3.axisBottom(xScale).tickFormat(function(d){
	 	return d;
	 }))
	 .append("text")
	 .attr("y", height-250)
	 .attr("x", width-500)
	 .attr("text-anchor", "middle")
	 .attr("stroke", "black")
	 .text("Component 1");

	g.append("g")
	 .call(d3.axisLeft(yScale).tickFormat(function(d){
	 	return d;
	 }).ticks(10))
	   .append("text")
	   .attr("transform","rotate(-90) translate(-100,0)")
	   .attr("y",6)
	   .attr("dy", "-5.1em")
	   .attr("text-anchor", "middle")
	   .attr("stroke", "black")
	   .text("Component 2");

	g.append('g')
    .selectAll("dot")
    .data(datapoints)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return xScale(d.x); } )
      .attr("cy", function (d) { return yScale(d.y); } )
      .attr("r", 3)
      .style("fill", "#69b3a2")


}

function pca_project(data)
{
	scatterplot(data, "PCA 2D Component projection");
}

function mds_1(data)
{
	scatterplot(data, "MDS 2D Euclidean distance");
}

function mds_2(data)
{
	scatterplot(data, "MDS 2D Correlation distance");
}

function scatter_matrix(data)
{
	var svg = d3.select("svg");
	svg.selectAll("*").remove();

	document.getElementById('sig_attr').innerHTML ="";

	var width = 600,
		size = 180,
		padding = 20;

		
	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var x = d3.scaleLinear()
	    .range([padding / 2, size - padding / 2]);

	var y = d3.scaleLinear()
	    .range([size - padding / 2, padding / 2]);

	var xAxis = d3.axisBottom()
	    .scale(x)
	    .ticks(6);

	var yAxis = d3.axisLeft()
	    .scale(y)
	    .ticks(6);

	var domainByTrait = {},
	  traits = d3.keys(data[0]).filter(function(d) { return d !== "species"; }),
	  n = traits.length;

	traits.forEach(function(trait) {
	domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
	});

	xAxis.tickSize(size * n);
	yAxis.tickSize(-size * n);

	var brush = d3.brush()
	  .on("start", brushstart)
	  .on("brush", brushmove)
	  .on("end", brushend)
	  .extent([[0,0],[size,size]]);

	var svg = d3.select("#graph")
	  .attr("width", size * n + padding)
	  .attr("height", size * n + padding)
	.append("g")
	  .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

	svg.selectAll(".x.axis")
	  .data(traits)
	.enter().append("g")
	  .attr("class", "x axis")
	  .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
	  .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

	svg.selectAll(".y.axis")
	  .data(traits)
	.enter().append("g")
	  .attr("class", "y axis")
	  .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
	  .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

	var cell = svg.selectAll(".cell")
	  .data(cross(traits, traits))
	.enter().append("g")
	  .attr("class", "cell")
	  .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
	  .each(plot);

	// Titles for the diagonal.
	cell.filter(function(d) { return d.i === d.j; }).append("text")
	  .attr("x", padding)
	  .attr("y", padding)
	  .attr("dy", ".71em")
	  .text(function(d) { return d.x; });

	cell.call(brush);

	function plot(p) {
	var cell = d3.select(this);

	x.domain(domainByTrait[p.x]);
	y.domain(domainByTrait[p.y]);

	cell.append("rect")
	    .attr("class", "frame")
	    .attr("x", padding / 2)
	    .attr("y", padding / 2)
	    .attr("width", size - padding)
	    .attr("height", size - padding);

	cell.selectAll("circle")
	    .data(data)
	  .enter().append("circle")
	    .attr("cx", function(d) { return x(d[p.x]); })
	    .attr("cy", function(d) { return y(d[p.y]); })
	    .attr("r", 4)
	    .style("fill", function(d) { return color(d.species); });
	}

	var brushCell;

	// Clear the previously-active brush, if any.
	function brushstart(p) {
	if (brushCell !== this) {
	  d3.select(brushCell).call(brush.move, null);
	  brushCell = this;
	x.domain(domainByTrait[p.x]);
	y.domain(domainByTrait[p.y]);
	}
	}

	// Highlight the selected circles.
	function brushmove(p) {
	var e = d3.brushSelection(this);
	svg.selectAll("circle").classed("hidden", function(d) {
	  return !e
	    ? false
	    : (
	      e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
	      || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
	    );
	});
	}	

	// If the brush is empty, select all circles.
	function brushend() {
	var e = d3.brushSelection(this);
	if (e === null) svg.selectAll(".hidden").classed("hidden", false);
	}
	}

	function cross(a, b) {
	var c = [], n = a.length, m = b.length, i, j;
	for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
	return c;
	}