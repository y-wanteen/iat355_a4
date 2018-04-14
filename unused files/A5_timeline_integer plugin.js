//Data
var bugData = "http://www.sfu.ca/~wanteeny/iat355/a5/data/acnl-bugs.csv";
var fishData = "http://www.sfu.ca/~wanteeny/iat355/a5/data/acnl-fish.csv";
var divingData = "http://www.sfu.ca/~wanteeny/iat355/a5/data/acnl-diving.csv";

//Key/value Arrays commonly used
var fillColour = {"bugs":"#69D1C5", "fish":"tomato", "diving":"#2A1E5C"};

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var hours = ['1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM','8AM', '9AM', '10AM', '11AM', 'NOON','1PM','2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '9PM', '10PM', '11PM','MIDNIGHT'];

var monthStringToNum = {"Jan":1, "Feb":2, "Mar":3, "Apr":4, "May":5, "Jun":6, "Jul":7, "Aug":8, "Sep":9, "Oct":10, "Nov":11, "Dec":12};
var hoursStringToNum = {"1AM":1 ,"2AM":2, "3AM":3, "4AM":4, "5AM":5, "6AM":6, "7AM":7, "8AM":8, "9AM":9, "10AM":10, "11AM":11, "NOON":12, "1PM":13, "2PM":14};

var speciesRarity = {1:"common", 2:"fairly common", 3:"uncommon", 4:"scarce", 5:"rare"};

// SVG + Graph Setup //////////////////////////////////////////////

var margin = {top: 70, right:0, bottom: 20, left: 40};

//adjust width and height based on margin size

var winHeight = window.innerHeight;
var winWidth = window.innerWidth;

var width = winWidth - margin.left - margin.right;
var height = winHeight - margin.top - margin.bottom;

var graphWidth =  winWidth + margin.left + margin.right;
var graphHeight = winHeight + margin.top + margin.bottom;

// var timeline = d3.layout.timeline()
//   .size([1000,300])
//   .bandStart(function (d) {return d.s})
//   .bandEnd(function (d) {return d.e})
//   .dateFormat(function (d) {return parseInt(d)})

var timeline = d3.layout.timeline()
  .size([graphWidth,graphHeight])
  .bandStart(function (d) {return d['Start Time']})
  .bandEnd(function (d) {return d['End Time']})
  .dateFormat(function (d) {return parseInt(d)})
  .extent(["0", "24"])
  .padding(3) //padding between rectangles

//was trying to get the example graph to show up
// 	d3.csv("int_bands.csv", function (csv) {
//   timelineBands = timeline(csv);

//   console.log(timelineBands);

//   d3.select("svg").selectAll("rect")
//   .data(timelineBands)
//   .enter()
//   .append("rect")
//   .attr("x", function (d) {return d.start})
//   .attr("y", function (d) {return d.y})
//   .attr("height", function (d) {return d.dy})
//   .attr("width", function (d) {return d.end - d.start})
//   .style("fill", "#687a97")
//   .style("stroke", "black")
// })

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

var svg2 = d3.select("#timeline")

		.append("div")
		.classed("svg-container", true) //container class to make it responsive
		.append("svg")
		//responsive SVG needs these 2 attributes and no width and height attr
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 "+ graphWidth +" "+ graphHeight)

		//class to make svg responsive
		.classed("svg-content-responsive", true)
		// .classed("hidden", true)
		.append("g")
		.attr("transform", "translate( 50," + margin.top + ")");
		// .style("opacity",0);

//Global variables //////////
var totalPriceRange = [];
var dailySpecies = [];
var dailyTimeline = [];

// BUG DATA //////////////////////////////
d3.csv(bugData, function(datasetBug)
{

	// Get Range of Sell Prices ///////////////////////
	function getPriceRange(data)
	{
		var range = d3.extent(data, function(d){ return +d['Price']});
		// console.log("min price: " + range[0] + " max price: " + range[1]);
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

			// console.log("highest sell price: " + maxPrice);

			//create x and y axis ///////////////////////
			var xScale,xScale2;
			var yScale;

			xScale = d3.scaleLinear()
					.domain([0, 1, 12, 13]) //0 as blank start point, 1-12 for jan-dec, 13 for extra space at the end of graph
					.range([0, 60, width-60, width]);

			xScale2 = d3.scaleLinear()
							.domain([0,1,25]) //0 as blank start point, 1-12 for jan-dec, 13 for extra space at the end of graph
							.range([0, 60, width-60, width]);

			yScale = d3.scaleLinear()
					.domain([maxPrice+1000, 2000, 0])
					.range([0,height-height/5, height]);

			//Create array of text labels for the x-axis to use
			var monthsAxis = [""];
			monthsAxis = monthsAxis.concat(months, "");

			var hoursAxis=[""];
			hoursAxis=hoursAxis.concat(hours,"");

			//add x and y axis to svg
			var xAxis = d3.axisBottom()
						.scale(xScale)
						.tickFormat(function(d,i){return monthsAxis[i]}); //change number labels into months

						var xAxis2 = d3.axisBottom()
									.scale(xScale2)
									.tickFormat(function(d,i){return hoursAxis[i]}); //change number labels into months

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0, " + height +")")
				.call(xAxis);

			svg2.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0, " + height +")")
				.call(xAxis2);

			// text label for the x axis
			svg.append("text")
					.attr("transform",
						   "translate(" + (width/2) + " ," +
									 	  (height + margin.top) + ")")
					.style("text-anchor", "middle")
					.text("Month of Appearance");

					svg2.append("text")
							.attr("transform",
						"translate(" + (width/2) + " ," +
										(height + margin.top) + ")")
							.style("text-anchor", "middle")
							.text("Time of Appearance");


			var yAxis = d3.axisLeft()
						.scale(yScale);
			svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(0,0)")
				.call(yAxis);

				svg2.append("g")
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

				 svg2.append("text")
					.attr("y", 0 - 70)
					.attr("x",0 + margin.left )
					.attr("dy", "3em")
					.style("text-anchor", "middle")
					.text("Selling Price (in Bells)");

				var brush=d3.brush()
	            .extent([[0, 0], [width, height]])
	            .on("brush", brushed)
	            .on("end", brushended);

			// PLOT DATA /////////////////////////////

			var transparency = false;

			var monthlyWildlife = []; //array to store all montly available wildlife

			// Get Monthly Availability ///////////////////////
			function getAvailability(setClass, data, month)
			{

				// searchClass = setClass + "." + month;

				var sumCounter = 0; //debug value to count how many points are plotted for each month/wildlife set

				//first, check what exactly is available in that month
				data.forEach(function(d)
				{
					if (d[month] > 0)
					{
						sumCounter++;
						//Create new array using only the necessary data from the datasets:
						 //Type of wildlife, available month, species name, and price
			            monthlyWildlife.push({"Category":setClass, 
			                      "Month":month, 
			                      "Name":d['Name'], 
			                      "Price":+d['Price'], 
			                      "Rarity":d[month],
			                      "Start Time":+d['Start Time'],
			                      "End Time":+d['End Time']
			                    });
					}
				});

				// console.log(setClass+"/"+month+" Sum: "+sumCounter);

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

			// creating hidden tooltip //////////////////////////
			var tooltip = d3.select("body")
			.append("div")
			.style("position", "absolute")
			.style("background-color", "#ffffffcc")
			.style("padding", "0.2rem")
			.style("font-weight", "bold")
			.style("z-index", "10")
			.style("box-shadow","4px 2px 8px #c7c5c5")
			.style("visibility", "hidden");

			var nodePadding = 2.5; //padding around each node

			var radius = 5; //average radius of nodes

			// console.log(monthlyWildlife);

			// FORCE LAYOUT COLLISION ////////////////////////////////////

			var simulation = d3.forceSimulation(monthlyWildlife)
			  .force('charge', d3.forceManyBody().strength(-0.1)) //repel points away from each other
			  .force('x', d3.forceX().x(function(d) //center points to month on axis
			  {
			  		return xScale(monthStringToNum[d['Month']]);
			  }))
			  .force('y', d3.forceY().y(function(d){ return yScale(+d['Price']); })) //set y position to pricing
			  .force('collision', d3.forceCollide().radius(function(d)
				{
					    return +d.Rarity+nodePadding;
				}))
			  .on('tick', ticked);
			  // simulation.alphaTarget(0.3).restart();

			function ticked() //draw the nodes
			{
			    var u = d3.select('svg g')
			    .selectAll('circle')
			    .data(monthlyWildlife);

				u.enter()
				.append("circle")
				.attr("class", function(d) 	//add classes to circles here
				{
					// return d['Category'] + " " + d['Name'] + " " + d['Month'];
					return d['Category'] + " " + d['Name'].replace(" ", "-");
					//replace spaces in name with - so that it doesn't get split into two classes
				})

				// node appearance
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
		    		return fillColour[d['Category']];
			    })
			    .attr('opacity', 0.8)
			    .attr("stroke-width", "1")
				.attr("stroke", "lightgrey")

				// mouse over tool tip
				.on("mouseover", function(d){
					tooltip.style("visibility", "visible");

					var rarity = speciesRarity[d['Rarity']];
					tooltip.html(d['Name']+", $" + d['Price']+ ", " +rarity);
					tooltip.style("color", fillColour[d['Category']]);
				})

				.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
				.on("mouseout", function(){return tooltip.style("visibility", "hidden");})

				.on("click", function (d) {
					console.log(d);
						var highlightkey=d.key;

						// remove previous selecitons ...
						d3.selectAll("circle")
						.style('opacity',0.2)
						.attr('fill', function(d) //set fill colour based on data category/wildlife type
						 {
							 return fillColour[d['Category']];

						 })

						//get the classes of the circle selected
						var selectorClass = this.className['baseVal'];

						//print classes to console
						// console.log(selectorClass.replace(" ", "."));

						//select all circles of the same classes/species
						d3.selectAll("circle."+selectorClass.replace(" ", "."))
						  .style('opacity',1);

						 //  d3.select(this)
							// .style('opacity', 1);


							// .attr("fill", "orange");

						d3.selectAll(".hidden")
						.style('opacity',1);

						//i have no idea what this part do???
						d3.selectAll("circle").classed("dim", function (dd){
								if  (dd.key==highlightkey)
										return false;
								else
										return true;
						})

				})

			    .merge(u)
			    .attr('cx', function(d) //constrain the x position of each column of points according to month
			    {
			    	var columnPadding = xScale(1)*0.75;

			    	function leftConstraint(scaleVal) 	//create the left/min constraint for the x value
			    	{
			    		return xScale(scaleVal)-columnPadding;
			    	}

			    	function rightConstraint(scaleVal)	//create the right/max constraint for the x value
			    	{
			    		return xScale(scaleVal)+columnPadding;
			    	}

			    	//return d.x value based on month
			    	return d.x = Math.max(leftConstraint(monthStringToNum[d['Month']]),
			    					Math.min(rightConstraint(monthStringToNum[d['Month']]), d.x));

			    })

			    .attr('cy', function(d)
			    {
			      // return d.y;
			      return d.y = Math.max(radius, Math.min(height - radius, d.y));
			    })


				///////////// filter section

							//linking id of buttons in HTML
							var bFilter = document.getElementById('bug-filter');
							var fFilter = document.getElementById('fish-filter');
							var dFilter = document.getElementById('diving-filter');
							var clear = document.getElementById('clear');

							//seting up event listener
							bFilter.addEventListener('click', function(){
								filter('bugs')}	);
							fFilter.addEventListener('click', function(){
								filter('fish')}	);
							dFilter.addEventListener('click', function(){
								filter('diving')}	);
							clear.addEventListener('click', function(){
									filter('clear')}	);

							//passing through data and category variable
							function filter(category){
								render(monthlyWildlife, category);
							}

							function render(monthlyWildlife, category){
								if(category!="clear"){
									d3.selectAll("circle")
									.style("opacity", "0.8") //clear previous opacity setting
									//filters category of species
									.filter(function(d){return d['Category']!=category})
									.style("opacity", "0.1"); //lowers opacity of other
								}else{
									d3.selectAll("circle")
									.style("opacity", "0.8") //revert back to orig opacity
								}
							}
							///end filter section

			  u.exit().remove();


			} // end of ticked()


			//call brushing function
			svg.append("g")
            .call(brush);

            //brush circles
			 function brushed()
			 {
		        var s = d3.event.selection,
		            x0 = s[0][0],
		            y0 = s[0][1],
		            dx = s[1][0] - x0,
		            dy = s[1][1] - y0;
		         // console.log(s);

		         dailySpecies = []; //clear the array first

		        svg.selectAll('circle')
		            .style("opacity", function (d) 		//change opacity on selection
		            {
		                if (xScale(monthStringToNum[d['Month']]) >= x0 &&
		                	xScale(monthStringToNum[d['Month']]) <= x0 + dx &&
		                	yScale(+d['Price']) >= y0 && yScale(+d['Price']) <= y0 + dy)
		                {
		                	//print selected data to console
		                    // console.log(d);

		                     //push these into another array of data
		                     //that will get used in the second chart
		                     dailySpecies.push(d);

		                    // return "#ec7014";
		                    return 1;
		                }
		                else
		                {
		                  //  console.log("keep the same ");
		                    // return fillColour[d['Category']];
		                    return 0.8;
		                }
		             })
		           	.style("stroke", function(d)			//change stroke colour on selection
		           	{
		           		 if (xScale(monthStringToNum[d['Month']]) >= x0 &&
		                	xScale(monthStringToNum[d['Month']]) <= x0 + dx &&
		                	yScale(+d['Price']) >= y0 && yScale(+d['Price']) <= y0 + dy)
		                {
		                    return "white";
		                }
		                else
		                {
		                    return "lightgrey";
		                }
		            });

		         console.log("selected:");
		         console.log(dailySpecies);

		         //update the timeline 
		         // dailyTimeline = timeline(dailySpecies);
		         // console.log("timeline formatted:");
		         // console.log(dailyTimeline);

		         updateTimeline(dailySpecies);
                 


		    } //end of brush function

		    function brushended() //default styling
		    {
		        if (!d3.event.selection)
		        {
		            svg.selectAll('circle')
		                .transition()
		                .duration(150)
		                .ease(d3.easeLinear)
		                .style("fill", function(d){ 
		                	return fillColour[d['Category']]
		                })
		                .style("opacity", 0.8)
		                .style("stroke", "lightgrey");
		        }
		    }

		    function isBrushed(brush_coords, cx, cy) //brush coordinates
		    {

		        var x0 = brush_coords[0][0],
		            x1 = brush_coords[1][0],
		            y0 = brush_coords[0][1],
		            y1 = brush_coords[1][1];

		        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
		    }

		        // updateTimeline();

		    function updateTimeline(selection)
		    {

		    	fishTimeline = timeline(datasetFish);
		    	bugTimeline = timeline(datasetBug);
		    	divingTimeline = timeline(datasetDiving);

		    	// dailyTimeline = timeline(dailySpecies);
		    	dailyTimeline = timeline(selection);
		    	console.log("daily");
		    	console.log(dailyTimeline);

		    	everythingTimeline = timeline(monthlyWildlife);

		    	console.log("unique");

		    	console.log(d3.map(everythingTimeline, function(d){return d['Name']}).keys());

		    	// d3.select("#timelime").select("svg2").remove();

		    	// var svg2 = d3.select("#timeline")
		    	// 			.append("svg")
				svg2.selectAll("rect")
					.data(dailyTimeline)
					.enter()
					.append("rect")
					.attr("class", function(d) 	//add classes to circles here
					{
						// return d['Name'].replace(" ","-");
						return "timebox " + d['Category'] + " " + d['Name'].replace(" ", "-");
						//replace spaces in name with - so that it doesn't get split into two classes
					})
					.attr("x", function (d) {return d.start})
					.attr("y", function (d) {return d.y})
					.attr("height", function (d) {return 5})
					.attr("width", function (d) {return d.end - d.start})
					.style("fill", function(d) { return fillColour[d['Category']]})
					// .style("fill", function(d){return "#687a97"})
					.style("stroke", "lightgrey")
					.style("opacity", 0.5);

				console.log("updated");
			
		    }


		}); //end of diving data csv

	}); //end of fish data csv

}); //end of bug data csv
