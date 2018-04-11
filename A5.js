//Data
var bugData = "http://www.sfu.ca/~wanteeny/iat355/a5/data/acnl-bugs3.csv";
var fishData = "http://www.sfu.ca/~wanteeny/iat355/a5/data/acnl-fish3.csv";
var divingData = "http://www.sfu.ca/~wanteeny/iat355/a5/data/acnl-diving3.csv";

//Key/value Arrays commonly used
var fillColour = {
  "bugs": "#69D1C5",
  "fish": "tomato",
  "diving": "#2A1E5C"
};

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var hours = ['1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', 'NOON', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '9PM', '10PM', '11PM', 'MIDNIGHT'];

var monthStringToNum = {
  "Jan": 1,
  "Feb": 2,
  "Mar": 3,
  "Apr": 4,
  "May": 5,
  "Jun": 6,
  "Jul": 7,
  "Aug": 8,
  "Sep": 9,
  "Oct": 10,
  "Nov": 11,
  "Dec": 12
};
var hoursStringToNum = {
  "1AM": 1,
  "2AM": 2,
  "3AM": 3,
  "4AM": 4,
  "5AM": 5,
  "6AM": 6,
  "7AM": 7,
  "8AM": 8,
  "9AM": 9,
  "10AM": 10,
  "11AM": 11,
  "NOON": 12,
  "1PM": 13,
  "2PM": 14
};

var speciesRarity = {
  1: "common",
  2: "fairly common",
  3: "uncommon",
  4: "scarce",
  5: "rare"
};

// SVG + Graph Setup //////////////////////////////////////////////

var margin = {
  top: 70,
  right: 0,
  bottom: 20,
  left: 40
};

//adjust width and height based on margin size

var winHeight = window.innerHeight;
var winWidth = window.innerWidth;

var width = winWidth - margin.left - margin.right;
var height = winHeight - margin.top - margin.bottom;

var graphWidth = winWidth + margin.left + margin.right;
var graphHeight = winHeight + margin.top + margin.bottom;


var scrubHeight = 300;
var scrubWindowHeight = winHeight - margin.top - margin.bottom;

var t = d3.transition()
  .duration(750)
  .ease(d3.easeLinear);

//create svg
var svg = d3.select("#graph")

  .append("div")
  .classed("svg-container", true) //container class to make it responsive
  .append("svg")
  //responsive SVG needs these 2 attributes and no width and height attr
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 " + graphWidth + " " + graphHeight)

  //class to make svg responsive
  .classed("svg-content-responsive", true)
  .append("g")
  .attr("transform", "translate( 50," + margin.top + ")");

var svg2 = d3.select("#priceRange")

  .append("div")
  .classed("svg-container", true) //container class to make it responsive
  .append("svg")
  //responsive SVG needs these 2 attributes and no width and height attr
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 " + graphWidth + " " + scrubHeight)

  //class to make svg responsive
  .classed("svg-content-responsive", true)
  // .classed("hidden", true)
  .append("g")
  .attr("transform", "translate( 50," + margin.top + ")");
// .style("opacity",0);

// start working with d3 and data			

//Global variables //////////
var totalPriceRange = [];
var selectedSpecies = [];

// BUG DATA //////////////////////////////
d3.csv(bugData, function(datasetBug) {

  // Get Range of Sell Prices ///////////////////////
  function getPriceRange(data) {
    var range = d3.extent(data, function(d) {
      return +d['Price']
    });
    // console.log("min price: " + range[0] + " max price: " + range[1]);
    return range;
  }

  //Get bug sell price range
  var bugPriceRange = getPriceRange(datasetBug);

  // FISH DATA //////////////////////////////

  d3.csv(fishData, function(datasetFish) {

    //Get fish sell price range
    var fishPriceRange = getPriceRange(datasetFish);

    // DEEP SEA CREATURE DATA //////////////////////////////
    d3.csv(divingData, function(datasetDiving) {

      //Get deep sea creature sell price range
      var divingPriceRange = getPriceRange(datasetDiving);

      //Add highest sell price for each dataset to array ///////////////////////
      //calculate the highest sell price value           ///////////////////////
      totalPriceRange.push(bugPriceRange[1], fishPriceRange[1], divingPriceRange[1]);
      var maxPrice = Math.max(...totalPriceRange);

      // console.log("highest sell price: " + maxPrice);

      //create x and y axis ///////////////////////
      var xScale, xScale2;
      var yScale, yScale2;

      xScale = d3.scaleLinear()
        .domain([0, 1, 12, 13]) //0 as blank start point, 1-12 for jan-dec, 13 for extra space at the end of graph
        .range([0, 60, width - 60, width]);

      xScale2 = d3.scaleLinear()
        .domain([0, 2000, maxPrice + 1000]) //0 as blank start point, 1-12 for jan-dec, 13 for extra space at the end of graph
        .range([0, width / 5, width]);

      xScrubScale = d3.scaleLinear().range([0, width]);

      yScale = d3.scaleLinear()
        .domain([maxPrice + 1000, 2000, 0])
        .range([0, height - height / 5, height]);

      yScale2 = d3.scaleLinear()
        .domain([1, 0])
        .range([0, 150]);

      //Create array of text labels for the x-axis to use
      var monthsAxis = [""];
      monthsAxis = monthsAxis.concat(months, "");

      var hoursAxis = [""];
      hoursAxis = hoursAxis.concat(hours, "");

      //add x and y axis to svg////////////////////////

      // SVG 1 (Price vs Month Availability) ///////////////////////
      var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(function(d, i) {
          return monthsAxis[i]
        }); //change number labels into months

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

      // text label for the x axis
      svg.append("text")
        .attr("transform",
          "translate(" + (width / 2) + " ," +
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
        .attr("x", 0 + margin.left)
        .attr("dy", "3em")
        .style("text-anchor", "middle")
        .text("Selling Price (in Bells)");


      // SVG 2 (Price Distribution) ////////////////////////

      var xAxis2 = d3.axisBottom()
        .scale(xScale2);

      svg2.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + 150 + ")")
        .call(xAxis2);

      // text label for the x axis
      svg2.append("text")
        .attr("transform",
          "translate(" + (width / 2) + " ," +
          (scrubHeight - margin.top - 30) + ")")
        .style("text-anchor", "middle")
        .text("Selling Price (in Bells)");


      svg2.append("text")
        .attr("y", 0 - 70)
        .attr("x", 0 + (margin.left * 3))
        .attr("dy", "3em")
        .style("text-anchor", "middle")
        .text("Species Sell Price- drag to brush");

      //x-axis brush
      var brushX = d3.brushX()
        .extent([
          [0, 0],
          [width, scrubHeight / 2 - 5]
        ])
        .on("brush", brushedX)
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
        data.forEach(function(d) {
          if (d[month] > 0) 
          {

            sumCounter++;

          	//get time of day that the species appears in
          	var startTime = new Date(d['Start Time']);
			startTime = startTime.getTime();

			var endTime = new Date(d['End Time']);
			endTime = endTime.getTime();

			var startTime2, endTime2;
			//check if there's a second time frame in the day that the species shows up in
			if (d['Start Time 2'] != 0 && d['End Time 2'] != 0)
			{
				startTime2 = new Date(d['Start Time 2']);
				startTime2 = startTime2.getTime();

				endTime2 = new Date(d['End Time 2']);
				endTime2 = endTime2.getTime();
			
			}
			else
			{
				//if there is only one time frame the species appears in
				//set the 2nd set to 0
	            startTime2 = 0;
	            endTime2 = 0;
	        }

		        //Then create new array using only necessary data from the datasets:
	            //Type of wildlife, available month, species name, and price
	            //Also include the image URL, location, and times of day they appear
				monthlyWildlife.push(
	            {
	              "Category": setClass,
	              "Month": month,
	              "Name": d['Name'],
	              "Price": +d['Price'],
	              "Rarity": d[month],
	              "Image URL": d['Image URL'],
	              "Location": d['Location'],
	              "Start Time":startTime,
	              "End Time":endTime,
	              "Start Time 2":startTime2,
	              "End Time 2":endTime2
	            });
          }
        });

        // console.log(setClass+"/"+month+" Sum: "+sumCounter);

      } //end of plot points function

      function plotByMonth(category, dataset) {
        for (var i = 0; i < months.length; i++) {
          getAvailability(category, dataset, months[i]);
          // console.log("month: " + months[i])
        }
      }

      plotByMonth("bugs", datasetBug);
      plotByMonth("fish", datasetFish);
      plotByMonth("diving", datasetDiving);

      // creating hidden tooltip //////////////////////////
      var tooltip = d3.select("body")
        .append("div")
        .classed('tooltip', true)
        .style("visibility", "hidden");

      var nodePadding = 2.5; //padding around each node

      var radius = 5; //average radius of nodes

      // console.log(monthlyWildlife);

      // FORCE LAYOUT COLLISION ////////////////////////////////////

      //PRICE VS MONTH  //////////////////
      var simulation = d3.forceSimulation(monthlyWildlife)
        .force('charge', d3.forceManyBody().strength(-0.1)) //repel points away from each other
        .force('x', d3.forceX().x(function(d) //center points to month on axis
          {
            return xScale(monthStringToNum[d['Month']]);
          }))
        .force('y', d3.forceY().y(function(d) {
          return yScale(+d['Price']);
        })) //set y position to pricing
        .force('collision', d3.forceCollide().radius(function(d) {
          return +d.Rarity + nodePadding;
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
          .attr("class", function(d) //add classes to circles here
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
              if (rarity == 1) {
                nodeRadius = 3;
              } else if (rarity == 2) {
                nodeRadius = 4.5;
              } else if (rarity == 3) {
                nodeRadius = 5.5;
              } else if (rarity == 4) {
                nodeRadius = 8;
              } else if (rarity == 5) {
                nodeRadius = 11;
              }

              return nodeRadius - 0.5;

            })
          .attr('fill', function(d) //set fill colour based on data category/wildlife type
            {
              return fillColour[d['Category']];
            })
          .attr('opacity', 0.8)
          .attr("stroke-width", "1")
          .attr("stroke", "lightgrey")

          // mouse over tool tip
          .on("mouseover", function(d) {
            var rarity = speciesRarity[d['Rarity']];
            var imagePath = d['Image URL'];
            var urlString = "<img class='icon' src=" + imagePath + "/>";

            tooltip.style("visibility", "visible")
              .style("color", fillColour[d['Category']])
              .html(urlString)
              .append("HTML").attr("dy", "0em")
              .text(d['Name'])
              .append("HTML").attr("dy", "1em")
              .text(" $" + d['Price'] + ", " + rarity)
              .classed('tooltip-text', true)
              .append("HTML").attr("dy", "1em")
              .text("Location: " + d['Location'])
              .classed('tooltip-text', true);

          })

          .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
          })
          .on("mouseout", function() {
            return tooltip.style("visibility", "hidden")
              .html("");
          })

          .on("click", function(d) {
            console.log(d);
            var highlightkey = d.key;

            // remove previous selecitons ...
            d3.selectAll("circle")
              .classed("enlarge", false)
              .style('opacity', 0.2)
              .attr('fill', function(d) //set fill colour based on data category/wildlife type
                {
                  return fillColour[d['Category']];

                })
              .style('stroke', 'lightgrey');

            //get the classes of the circle selected
            var selectorClass = this.className['baseVal'];

            //print classes to console
            // console.log(selectorClass.replace(" ", "."));

            //select all circles of the same classes/species
            d3.selectAll("circle." + selectorClass.replace(" ", "."))
              .style('opacity', 1)
              .style('stroke', 'white')
              .classed("enlarge", true);

            d3.selectAll(".hidden")
              .style('opacity', 1)
              .style('stroke', 'white')
              .classed("enlarge", true);

          })

          .merge(u)
          .attr('cx', function(d) //constrain the x position of each column of points according to month
            {
              var columnPadding = xScale(1) * 0.75;

              function leftConstraint(scaleVal) //create the left/min constraint for the x value
              {
                return xScale(scaleVal) - columnPadding;
              }

              function rightConstraint(scaleVal) //create the right/max constraint for the x value
              {
                return xScale(scaleVal) + columnPadding;
              }

              //return d.x value based on month
              return d.x = Math.max(leftConstraint(monthStringToNum[d['Month']]),
                Math.min(rightConstraint(monthStringToNum[d['Month']]), d.x));

            })

          .attr('cy', function(d) {
            // return d.y;
            return d.y = Math.max(radius, Math.min(height - radius, d.y));
          })

        u.exit().remove();


      } // end of ticked()


      // PRICE DISTRIBUTION OVERVIEW ///////////////////////////////////////

      var speciesOverview = [];

      function getOverview(setClass, data)
      {
        data.forEach(function(d) 
        {

        	//get time of day that the species appears in
          	var startTime = new Date(d['Start Time']);
			startTime = startTime.getTime();

			var endTime = new Date(d['End Time']);
			endTime = endTime.getTime();

			var startTime2, endTime2;
			//check if there's a second time frame in the day that the species shows up in
			if (d['Start Time 2'] != 0 && d['End Time 2'] != 0)
			{
				startTime2 = new Date(d['Start Time 2']);
				startTime2 = startTime2.getTime();

				endTime2 = new Date(d['End Time 2']);
				endTime2 = endTime2.getTime();
			
			}
			else
			{
				//if there is only one time frame the species appears in
				//set the 2nd set to 0
	            startTime2 = 0;
	            endTime2 = 0;
	        }

          speciesOverview.push(
          {
            "Category": setClass,
            "Name": d['Name'],
            "Price": +d['Price'],
            "Location": d['Location'],
            "Image URL": d['Image URL'],
            "Start Time": startTime,
            "End Time": endTime,
            "Start Time 2": startTime2,
            "End Time 2": endTime2
          })
        })
      }

      getOverview("bugs", datasetBug);
      getOverview("fish", datasetFish);
      getOverview("diving", datasetDiving);

      // console.log(speciesOverview);

      var simulation2 = d3.forceSimulation(speciesOverview)
        .force('charge', d3.forceManyBody().strength(-0.1)) //repel points away from each other
        .force('x', d3.forceX().x(function(d) //plot x according to price
          {
            return xScale2(+d['Price']);
          }))
        .force('y', d3.forceY().y(function(d) {
          return 75;
        })) //around middle of graph
        .force('collision', d3.forceCollide().radius(function(d) {
          return 5;
        }))
        .on('tick', tickedOverview);

      function tickedOverview() {
        var pointRadius = 5;

        var u = svg2.selectAll('circle')
          .data(speciesOverview);

        u.enter()
          .append("circle")
          .attr("class", function(d) //add classes to circles here
            {
              // return d['Category'] + " " + d['Name'] + " " + d['Month'];
              return "overview " + d['Category'] + " " + d['Name'].replace(" ", "-");
              //replace spaces in name with - so that it doesn't get split into two classes
            })

          // node appearance
          .attr('r', function(d) //different node size based on rarity
            {
              return pointRadius - 0.5;

            })
          .attr('fill', function(d) //set fill colour based on data category/wildlife type
            {
              return fillColour[d['Category']];
            })
          .attr('opacity', 0.8)
          .attr("stroke-width", "1")
          .attr("stroke", "lightgrey")

          // mouse over tool tip
          .on("mouseover", function(d) {
            tooltip.style("visibility", "visible");

            tooltip.html(d['Name'] + ", $" + d['Price']);
            tooltip.style("color", fillColour[d['Category']]);
          })

          .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
          })
          .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
          })

          .on("click", function(d) {
            console.log(d);
            var highlightkey = d.key;

            // remove previous selecitons ...
            d3.selectAll("circle")
              .classed("enlarge", false)
              .style('opacity', 0.2)
              .attr('fill', function(d) //set fill colour based on data category/wildlife type
                {
                  return fillColour[d['Category']];

                })

            //get the classes of the circle selected
            var selectorClass = this.className['baseVal'];

            //print classes to console
            // console.log(selectorClass.replace(" ", "."));

            //select all circles of the same classes/species
            d3.selectAll("circle." + selectorClass.replace(" ", "."))
              .classed("enlarge", true)
              .style('opacity', 1);

            d3.selectAll(".hidden")
              .classed("enlarge", false)
              .style('opacity', 1);

            //i have no idea what this part do???
            // d3.selectAll("circle").classed("dim", function (dd){
            // 		if  (dd.key==highlightkey)
            // 				return false;
            // 		else
            // 				return true;
            // })

          })

          .merge(u)
          .attr('cx', function(d) //constrain the x position of each column of points according to month
            {
              return d.x = xScale2(d['Price']);

            })

          .attr('cy', function(d) {
            return d.y;
            // return d.y = Math.max(radius, Math.min(height - radius, d.y));
          })

        u.exit().remove();

      } //end of ticked overview



      //dropdown+search function

      //sort speciesOverview alphabetically
      speciesOverview.sort(function(a,b)
      {
      	if(a.Name < b.Name)
  		{
  			return -1;
  		}

      	if(a.Name > b.Name)
      	{
      		return 1;
      	}

      	return 0;
      });

      d3.select("#speciesList")
     .selectAll("option")
     .data(speciesOverview)
     .enter()
     .append("option")
     .attr("value", function(option) { return option.Name; });

      d3.select("#search").on("change", function() {
        var searchValue = document.getElementById("search").value;
        search(monthlyWildlife, searchValue);
      });

      function search(monthlyWildlife, searchValue) {
        if (searchValue != "") {
          d3.selectAll("circle")
            .classed("enlarge", false)
            .transition(t)
            //clear previous opacity setting
            .style("opacity", "0.8")
            //filters categories of species based on datatype selected
            .filter(function(d) {
              return d['Name'] != searchValue
            })
            .style("opacity", "0.1"); //lowers opacity of other

        } else {
          //clear filters when clear button pressed or any error occurs
          d3.selectAll("circle")
            .classed("enlarge", false)
            .transition(t)
            .style("opacity", "0.8") //revert back to orig opacity
        }
        // console.log(searchValue);
      };


      ///////////// filter section

      //linking id of buttons in HTML
      var bFilter = document.getElementById('bug-filter'); //species category bttons
      var fFilter = document.getElementById('fish-filter');
      var dFilter = document.getElementById('diving-filter');
      var clear = document.getElementById('clear');
      var common = document.getElementById('common'); //rarity buttons
      var fairlyCommon = document.getElementById('fairlyCommon');
      var uncommon = document.getElementById('uncommon');
      var scarce = document.getElementById('scarce');
      var rare = document.getElementById('rare');


      //seting up event listener
      bFilter.addEventListener('click', function() {
        filter('category', monthlyWildlife, 'bugs')
      });
      fFilter.addEventListener('click', function() {
        filter('category', monthlyWildlife, 'fish')
      });
      dFilter.addEventListener('click', function() {
        filter('category', monthlyWildlife, 'diving')
      });
      clear.addEventListener('click', function() {
        filter('category', monthlyWildlife, 'clear')
      });

      common.addEventListener('click', function() {
        filter('rarity', monthlyWildlife, '1')
      });
      fairlyCommon.addEventListener('click', function() {
        filter('rarity', monthlyWildlife, '2')
      });
      uncommon.addEventListener('click', function() {
        filter('rarity', monthlyWildlife, '3')
      });
      scarce.addEventListener('click', function() {
        filter('rarity', monthlyWildlife, '4')
      });
      rare.addEventListener('click', function() {
        filter('rarity', monthlyWildlife, '5')
      });

      function filter(filterType, monthlyWildlife, filterValue) {
        if (filterValue != "clear" && filterType == "category") {
          d3.selectAll("circle")
            .classed("enlarge", false)
            .transition(t)
            //clear previous opacity setting
            .style("opacity", "0.8")
            //filters categories of species based on datatype selected
            .filter(function(d) {
              return d['Category'] != filterValue
            })
            .style("opacity", "0.1"); //lowers opacity of other

        } else if (filterValue != "clear" && filterType == "rarity") {
          d3.selectAll("circle")
            .classed("enlarge", false)
            .transition(t)
            .style("opacity", "0.8")
            .filter(function(d) {
              return d['Rarity'] != filterValue
            })
            .style("opacity", "0.1"); //lowers opacity of other
        } else {
          //clear filters when clear button pressed or any error occurs
          d3.selectAll("circle")
            .classed("enlarge", false)
            .transition(t)
            .style("opacity", "0.8") //revert back to orig opacity
        }
      }
      ///end filter section

      // TIMELINE //////////////////////////////////////////////////////////////////////


	 	var timelineTicks = ['12AM', '2AM', '4AM', '6AM', '8AM',
	 						  '10AM', '12PM', '2PM', '4PM','6PM', 
	 						  '8PM', '10PM', '12AM']

        console.log(timelineTicks)

	 function timelineStackedHover(dataArray)
	 {


        var chart = d3.timelines()
          // .relativeTime()
          // .tickFormat({
            // format: function(d) { return d3.timeFormat("%I %p")(d) },
            // tickTime: d3.timeHour,
            // tickInterval: 50,
            // tickSize: 15,
          // })
          .stack()
          .margin({left:175, right:30, top:50, bottom:50})
          .showTimeAxis()
          .showTimeAxisTick()
          // .hover(function (d, i, datum) {
          // // d is the current rendering object
          // // i is the index during d3 rendering
          // // datum is the id object
          //   var div = $('#hoverRes');
          //   var colors = chart.colors();
          //   div.find('.coloredDiv').css('background-color', colors(i))
          //   div.find('#name').text(datum.label);
          // })
          // .click(function (d, i, datum) {
          //   console.log("timeStackedHover", datum.label);
          // });

		d3.select("#timeline").select("svg").remove();



		var timelineScale = d3.scaleLinear()
						    .domain([0, 12])
						    .range([175, graphWidth-130]);


		var timelineAxis = d3.axisTop()
	        .scale(timelineScale)
	        .tickFormat(function(d, i) {
	          console.log(timelineTicks[i]);
	          return timelineTicks[i]
	        }); //change number labels into months

        var svg3 = d3.select("#timeline").append("svg")
					.attr("width", graphWidth-100)
					.attr("height", graphHeight)
      				.datum(dataArray).call(chart);

      	svg3.append("g")
	        .attr("class", "x custom axis")
	        .attr("transform", "translate(0, " + 30 + ")")
	        .call(timelineAxis);
      }


      //BRUSHING /////////////////////////////////////////////////////

      var timelineSpecies = [];

      //add brush to the second vis
      svg2.append("g")
        .call(brushX)
        .call(brushX.move, [0, 1]); //initial brush size

      function brushedX() 
      {
        var s = d3.event.selection || xScale2.range();
        var e = d3.event.selection.map(xScale2.invert, xScale2);

        selectedSpecies = []; //clear the array first
        timelineSpecies = [];

        d3.selectAll('circle').classed('enlarge', false); //remove enlarged highlighting

        //change highlight + opacity of selected circles that are brushed over
        d3.selectAll('circle')
          .style('opacity', function(d) {
            //make opacity darker if selected
            if (e[0] <= d['Price'] && d['Price'] <= e[1]) 
            {
              //add them to the array of selected species
              selectedSpecies.push(d);
              console.log("selected: ");
              console.log(selectedSpecies);

              return 1;
            } else //else lower opacity
            {
              return 0.2;
            }

          })
          .style('stroke', function(d) //change stroke colour on selection
            {
              //make stroke white if selected
              if (e[0] <= d['Price'] && d['Price'] <= e[1]) {
                return "white";
              } else //else keep grey
              {
                return "lightgrey";
              }
            });



		 d3.selectAll('circle.overview')
          .style('opacity', function(d) {
            //make opacity darker if selected
            if (e[0] <= d['Price'] && d['Price'] <= e[1]) 
            {

	             if (d['Start Time 2'] != 0 && d['End Time 2'] != 0)
				{
					//push both time frames the species shows up in into the times value
					timelineSpecies.push(
		            {
		            	label:d['Name'],
		            	times:[{"color": fillColour[d['Category']],
		            			"starting_time": d['Start Time'], "ending_time":d['End Time']
		            			},
		            			{ "color": fillColour[d['Category']],
		            			  "starting_time":d['Start Time 2'], "ending_time":d['End Time 2']
		            			}]
		            });
				
				}
				else
				{
					//if there is only one time frame the species appears in
					//only push that one time frame
					timelineSpecies.push(
		            {
		            	label:d['Name'],
		            	times:[{"color": fillColour[d['Category']],
		            			"starting_time":d['Start Time'], "ending_time":d['End Time']
		            			}]
		            });
	        	}

              console.log("timeline:");
              console.log(timelineSpecies)

              return 1;
            } else //else lower opacity
            {
              return 0.2;
            }

          })
          .style('stroke', function(d) //change stroke colour on selection
            {
              //make stroke white if selected
              if (e[0] <= d['Price'] && d['Price'] <= e[1]) {
                return "white";
              } else //else keep grey
              {
                return "lightgrey";
              }
            });


           timelineStackedHover(timelineSpecies);

      }

      function brushended() //return to default styling
      {
        if (!d3.event.selection) {
          d3.selectAll('circle')
            .classed("enlarge", false);

          d3.selectAll('circle')
            .transition()
            .duration(150)
            .ease(d3.easeLinear)
            .style("fill", function(d) {
              return fillColour[d['Category']]
            })
            .style("opacity", 0.8)
            .style("stroke", "lightgrey");
        }
      }


    }); //end of diving data csv

  }); //end of fish data csv

}); //end of bug data csv
