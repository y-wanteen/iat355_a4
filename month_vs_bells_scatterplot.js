var bugData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-bugs.csv";
var fishData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-fish.csv";
var divingData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-diving.csv";

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// SVG + Graph Setup //////////////////////////////////////////////

var margin = {top: 70, right:0, bottom: 20, left: 40};

//adjust width and height based on margin size

var winHeight = window.innerHeight;
var winWidth = window.innerWidth;

var width = winWidth - margin.left - margin.right;
var height = winHeight - margin.top - margin.bottom;

var graphWidth =  winWidth + margin.left + margin.right;
var graphHeight = winHeight + margin.top + margin.bottom;


//create svg
var svg = d3.select("#graph")

		.append("div")
		.classed("svg-container", true) //container class to make it responsive
		.append("svg")
		//responsive SVG needs these 2 attributes and no width and height attr
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 "+ graphWidth +" "+ graphHeight)

		//class to make svg responsive
		.classed("svg-content-responsive", true)
		.append("g")
		.attr("transform", "translate( 50," + margin.top + ")");

// start working with d3 and data

//Global variables //////////
var totalPriceRange = [];

// BUG DATA //////////////////////////////
d3.csv(bugData, function(datasetBug)
{

	// Get Range of Sell Prices ///////////////////////
	function getPriceRange(data)
	{
		var range = d3.extent(data, function(d){ return +d['Price']});
		console.log("min price: " + range[0] + " max price: " + range[1]);
		return range;
	}

	//Get bug sell price range
	var bugPriceRange = getPriceRange(datasetBug);

	// FISH DATA //////////////////////////////

	d3.csv(fishData, function(datasetFish){

		//Get fish sell price range
		var fishPriceRange = getPriceRange(datasetFish);

		// DEEP SEA CREATURE DATA //////////////////////////////
		d3.csv(divingData, function(datasetDiving){

			//Get deep sea creature sell price range
			var divingPriceRange = getPriceRange(datasetDiving);

			//Add highest sell price for each dataset to array ///////////////////////
			//calculate the highest sell price value           ///////////////////////
			totalPriceRange.push(bugPriceRange[1], fishPriceRange[1], divingPriceRange[1]);
			var maxPrice = Math.max(...totalPriceRange);

			console.log("highest sell price: " + maxPrice);

			//create x and y axis ///////////////////////
			var xScale;
			var yScale;

			xScale = d3.scaleLinear()
					.domain([0, 1, 12, 13]) //0 as blank start point, 1-12 for jan-dec, 13 for extra space at the end of graph
					.range([0, 60, width-60, width]);

			yScale = d3.scaleLinear()
					.domain([maxPrice+1000, 2000, 0])
					.range([0,height-height/5, height]);

			//Create array of text labels for the x-axis to use
			var monthsAxis = [""];
			monthsAxis = monthsAxis.concat(months, "");

			//add x and y axis to svg
			var xAxis = d3.axisBottom()
						.scale(xScale)
						.tickFormat(function(d,i){return monthsAxis[i]}); //change number labels into months

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0, " + height +")")
				.call(xAxis);

			// text label for the x axis
			svg.append("text")
					.attr("transform",
				"translate(" + (width/2) + " ," +
											 (height + margin.top) + ")")
					.style("text-anchor", "middle")
					.text("Month of Appearance");


			var yAxis = d3.axisLeft()
						.scale(yScale);
			svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(0,0)")
				.call(yAxis);

				// text label for y-axis
				svg.append("text")
				 .attr("y", 0 - 70)
				 .attr("x",0 + margin.left )
				 .attr("dy", "3em")
				 .style("text-anchor", "middle")
				 .text("Selling Price (in Bells)");

			// PLOT DATA /////////////////////////////

			var transparency = false;

			var monthlyWildlife = []; //array to store all montly available wildlife

			// Get Monthly Availability ///////////////////////
			function getAvailability(setClass, data, month)
			{

				searchClass = setClass + "." + month;

				var sumCounter = 0; //debug value to count how many points are plotted for each month/wildlife set

				//first, check what exactly is available in that month
				data.forEach(function(d)
				{
					if (d[month] > 0)
					{
						sumCounter++;
						//Create new array using only the necessary data from the datasets:
						//Type of wildlife, available month, species name, and price
						monthlyWildlife.push({"Category":setClass, "Month":month, "Name":d['Name'], "Price":+d['Price'], "Rarity":d[month]});
					}
				});

				console.log(setClass+"/"+month+" Sum: "+sumCounter)

			} //end of plot points function

			function plotByMonth(category, dataset)
			{
				for(var i=0; i<months.length; i++)
				{
					getAvailability(category, dataset, months[i]);
					// console.log("month: " + months[i])
				}
			}

			plotByMonth("bugs",datasetBug);
			plotByMonth("fish",datasetFish);
			plotByMonth("diving",datasetDiving);

			// creating hidden tooltip
			var tooltip = d3.select("body")
			.append("div")
			.style("position", "absolute")
			.style("background-color", "#ffffffcc")
			.style("padding", "0.2rem")
			.style("font-weight", "bold")
			.style("z-index", "10")
			.style("box-shadow","4px 2px 8px #c7c5c5")
			.style("visibility", "hidden");

			var nodePadding = 3.5; //padding around each node

			var radius = 6; //average radius of nodes
			// var minRadius = 3;

			console.log(monthlyWildlife);

			// FORCE LAYOUT COLLISION ////////////////////////////////////

			var simulation = d3.forceSimulation(monthlyWildlife)
			  .force('charge', d3.forceManyBody().strength(-0.1)) //repel points away from each other
			  .force('x', d3.forceX().x(function(d) //center points to month on axis
			  {
			  		if (d['Month'] == "Jan")
			  		{
			  			return xScale(1);
			  		}
			  		else if (d['Month'] == "Feb")
			  		{
			  			return xScale(2);
			  		}
			  		else if (d['Month'] == "Mar")
			  		{
			  			return xScale(3);
			  		}
			  		else if (d['Month'] == "Apr")
			  		{
			  			return xScale(4);
			  		}
			  		else if (d['Month'] == "May")
			  		{
			  			return xScale(5);
			  		}
			  		else if (d['Month'] == "Jun")
			  		{
			  			return xScale(6);
			  		}
			  		else if (d['Month'] == "Jul")
			  		{
			  			return xScale(7);
			  		}
			  		else if (d['Month'] == "Aug")
			  		{
			  			return xScale(8);
			  		}
			  		else if (d['Month'] == "Sep")
			  		{
			  			return xScale(9);
			  		}
			  		else if (d['Month'] == "Oct")
			  		{
			  			return xScale(10);
			  		}
			  		else if (d['Month'] == "Nov")
			  		{
			  			return xScale(11);
			  		}
			  		else
			  		{
			  			return xScale(12);
			  		}
			  }))
			  .force('y', d3.forceY().y(function(d){ return yScale(+d['Price']); })) //set y position to pricing
			  // .force('collision', d3.forceCollide(radius + nodePadding)) //collision based on node radius + padding
			  .force('collision', d3.forceCollide().radius(function(d)
				{
					    return +d.Rarity+nodePadding;
				}))
			  .on('tick', ticked);

			function ticked() //draw the nodes
			{
			    var u = d3.select('svg g')
			    .selectAll('circle')
			    .data(monthlyWildlife);

				u.enter()
				.append("circle")
				// .attr("class", setClass + " " + month)

				// node appearance
			    //.attr('r', radius-0.5)
			    .attr('r', function(d) //different node size based on rarity
			    {
			    	var rarity = +d['Rarity'];
			    	var nodeRadius;
			    	if (rarity == 1)
			    	{
			    		nodeRadius = 3;
			    	}
			    	else if (rarity == 2)
			    	{
			    		nodeRadius = 4.5;
			    	}
			    	else if (rarity == 3)
			    	{
			    		nodeRadius = 5.5;
			    	}
			    	else if (rarity == 4)
			    	{
			    		nodeRadius = 8;
			    	}
			    	else if (rarity == 5)
			    	{
			    		nodeRadius = 11;
			    	}

			    	return nodeRadius-0.5;

			    })
			    .attr('fill', function(d) //set fill colour based on data category/wildlife type
			    	{
			    		if (d['Category'] == "bugs")
			    		{
			    			return "green";
			    		}
		    			else if (d['Category'] == "fish")
		    			{
		    				return "darkorange";
		    			}
		    			else
		    			{
		    				return "blue";
		    			}
			    })
			    .attr('opacity', 0.8)
			    .attr("stroke-width", "1")
				.attr("stroke", "lightgrey")

				// mouse over tool tip
				.on("mouseover", function(d){
					tooltip.style("visibility", "visible");

					if (d['Rarity'] == "1") var rarity="common";
					if (d['Rarity'] == "2") var rarity="fairly common";
					if (d['Rarity'] == "3") var rarity="uncommon";
					if (d['Rarity'] == "4") var rarity="scarce";
					if (d['Rarity'] == "5") var rarity="rare";

					tooltip.html(d['Name']+", $" + d['Price']+ ", " +rarity);

					if(d['Category'] == "bugs")
					{
						tooltip.style("color", "green");
					}
					else if (d['Category'] == "fish")
					{
						tooltip.style("color", "darkorange");
					}
					else
					{
						tooltip.style("color", "blue");
					}
				})
				.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
				.on("mouseout", function(){return tooltip.style("visibility", "hidden");})

			    .merge(u)
			    .attr('cx', function(d) {
			      return d.x;
			    })
			    .attr('cy', function(d) {
			      // return d.y;
			      return d.y = Math.max(radius, Math.min(height - radius, d.y));
			    })

			  u.exit().remove();
			}

		}); //end of diving data csv

	}); //end of fish data csv

}); //end of bug data csv
