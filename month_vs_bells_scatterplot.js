var bugData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-bugs.csv";
var fishData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-fish.csv";
var divingData = "http://www.sfu.ca/~wanteeny/iat355/a4/data/acnl-diving.csv";

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
var monthDomainNum  = [1,2,3,4,5,6,7,8,9,10,11,12]

console.log(months)

// SVG + Graph Setup //////////////////////////////////////////////

var margin = {top: 30, right: 30, bottom: 40, left: 50};

//adjust width and height based on margin size
var width = 1300 - margin.left - margin.right;
var height = 750 - margin.top - margin.bottom;

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
d3.csv(bugData, function(dataset) 
{

	//Get bug sell price range
	var bugPriceRange = getPriceRange(dataset);

	//Get bug monthly availability
	// dataset.forEach(function(d,i)
	// {

	// });
	// var janBugAvailability = getMonthAvailability(dataset, months[0]);
	// var febBugAvailability = getMonthAvailability(dataset, months[1]);
	// var marBugAvailability = getMonthAvailability(dataset, months[2]);
	// var aprBugAvailability = getMonthAvailability(dataset, months[3]);
	// var mayBugAvailability = getMonthAvailability(dataset, months[4]);
	// var junBugAvailability = getMonthAvailability(dataset, months[5]);
	// var julBugAvailability = getMonthAvailability(dataset, months[6]);
	// var augBugAvailability = getMonthAvailability(dataset, months[7]);
	// var sepBugAvailability = getMonthAvailability(dataset, months[8]);
	// var octBugAvailability = getMonthAvailability(dataset, months[9]);
	// var novBugAvailability = getMonthAvailability(dataset, months[10]);
	// var decBugAvailability = getMonthAvailability(dataset, months[11]);


	// FISH DATA ////////////////////////////// 

	d3.csv(fishData, function(dataset){

		//Get fish sell price range
		var fishPriceRange = getPriceRange(dataset);


		// DEEP SEA CREATURE DATA ////////////////////////////// 
		d3.csv(divingData, function(dataset){

			//Get deep sea creature sell price range
			var divingPriceRange = getPriceRange(dataset);

			//Add highest sell price for each dataset to array
			//calculate the highest sell price value
			totalPriceRange.push(bugPriceRange[1], fishPriceRange[1], divingPriceRange[1]);
			var maxPrice = Math.max(...totalPriceRange);

			console.log(maxPrice);

			//create x and y axis ///////////////////////
			var xScale;
			var yScale;

			xScale = d3.scaleLinear()
					.domain([0, 12])
					.range([0,width]);

			yScale = d3.scaleLinear()
					.domain([maxPrice+1000, 0])
					.range([0,height]);

			var monthsAxis = [""];
			monthsAxis = monthsAxis.concat(months);
			console.log(monthsAxis)

			//add x and y axis to svg
			var xAxis = d3.axisBottom()
						.scale(xScale)
						.tickFormat(function(d,i){return monthsAxis[i]});

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0, " + height +")")
				.call(xAxis);

			var yAxis = d3.axisLeft().scale(yScale);
			svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(0,0)")
				.call(yAxis);




		});

	});

});

// Get Range of Sell Prices ///////////////////////
function getPriceRange(data)
{
	var range = d3.extent(data, function(d){ return +d['Price']});
	console.log("min: " + range[0] + " max: " + range[1]);
	return range;
}

function getMonthAvailability(data, months)
{
	var monthAvailability = [];

	data.forEach(function(d,i)
	{
		if (d[month] > 0)
		{
			monthAvailability.push( +d[month] );
		}

		else
		{
			monthAvailability.push(0);
		}
	});
	console.log(monthAvailability);
	return monthAvailability;
}


