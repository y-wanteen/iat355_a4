var bugData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-bugs.csv";
var fishData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-fish.csv";
var divingData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-diving.csv";

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

// SVG + Graph Setup //////////////////////////////////////////////

var margin = {top: 30, right: 30, bottom: 40, left: 50};

//adjust width and height based on margin size
var width = 1300 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

//create svg
var svg = d3.select("body")
			.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.bottom + margin.top)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
					.domain([0, 13]) //0 as blank start point, 1-12 for jan-dec, 13 for extra space at the end of graph
					.range([0,width]);

			yScale = d3.scaleLinear()
					.domain([maxPrice+1000, 0])
					.range([0,height]);

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

			var yAxis = d3.axisLeft().scale(yScale);
			svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(0,0)")
				.call(yAxis);

			// PLOT DATA /////////////////////////////

			var transparency = false;

			//create function for plotting data by month
			function plotByMonth(month, scaleAxisVal)
			{
				plotPoints("bugs", datasetBug, month, xScale(scaleAxisVal), "mediumaquamarine");
				plotPoints("fish", datasetFish, month, xScale(scaleAxisVal), "lightskyblue");
				plotPoints("diving", datasetDiving, month, xScale(scaleAxisVal), "mediumpurple");
			}

			plotByMonth('Jan', 1);
			plotByMonth('Feb', 2);
			plotByMonth('Mar', 3);
			plotByMonth('Apr', 4);
			plotByMonth('May', 5);
			plotByMonth('Jun', 6);
			plotByMonth('Jul', 7);
			plotByMonth('Aug', 8);
			plotByMonth('Sep', 9);
			plotByMonth('Oct', 10);
			plotByMonth('Nov', 11);
			plotByMonth('Dec', 12);

			// Plot points ///////////////////////
			function plotPoints(setClass, data, month, xVal, fillColour)
			{

				searchClass = setClass + "." + month;
				// console.log(searchClass)

				var sumCounter = 0; //debug value to count how many points are plotted for each month/wildlife set

				var circle = svg.selectAll(searchClass)
				.data(data)
				.enter()
				.append("circle")

				//add the setClass and month as seperate classes for filtering later
				.attr("class", setClass + " " + month)
				.attr("cx", function(d)
				{
					//cx based on month availability
					if (d[month] > 0) //0 in the dataset means the wildlife doesn't spawn in that month
					{
						sumCounter++; //count occurences for debugging
						return xVal;
					}
				})
				.attr("cy", function(d)
				{
					return (yScale(+d['Price'])); //return sell price
				})

				//point appearance
				.attr("r", 6)
				.attr("stroke-width", "1")
				.attr("stroke", "lightgrey")
				.attr("fill", fillColour)
				.attr("opacity", function(d)
				{
					if (d[month] > 0)
					{
						return 0.8;
					}
					else
					{
						return 0;	//make point transparent if it doesn't spawn in that month
					}
				});

				console.log(setClass+"/"+month+" Sum: "+sumCounter);
			}

		}); //end of diving data csv

	}); //end of fish data csv

}); //end of bug data csv

