//Data
var bugData = "http://www.sfu.ca/~wanteeny/iat355/animal-crossing/data/acnl-bugs.csv";
var fishData = "http://www.sfu.ca/~wanteeny/iat355/animal-crossing/data/acnl-fish.csv";
var divingData = "http://www.sfu.ca/~wanteeny/iat355/animal-crossing/data/acnl-diving.csv";

// var bugData = "data/acnl-bugs3.csv";
// var fishData = "data/acnl-fish3.csv";
// var divingData = "data/acnl-diving3.csv";

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
  bottom: 30,
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

//main graph //////////////
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

//secondary brushing graph /////////////

var svg2 = d3.select("#priceRange")

  .append("div")
  .classed("svg-container", true) //container class to make it responsive
  .append("svg")
  //responsive SVG needs these 2 attributes and no width and height attr
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 " + graphWidth + " " + scrubHeight)

  //class to make svg responsive
  .classed("svg-content-responsive", true)
  .append("g")
  .attr("transform", "translate( 50," + margin.top + ")");

// start working with d3 and data

//Global variables //////////
var totalPriceRange = [];
var selectedSpecies = [];
var speciesOverview = [];
var timelineSpecies = [];


//labels for the timeline axis
var timelineTicks = ['12AM', '2AM', '4AM', '6AM', '8AM',
  '10AM', '12PM', '2PM', '4PM', '6PM',
  '8PM', '10PM', '12AM'
]

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
        .attr("id", "monthsAxis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

      //give individual ticks ids
      svg.select("#monthsAxis").selectAll("text")
        .attr("id", function(d, i) {
          return months[i - 1];
        })
        .append("input")
        .attr("type", "checkbox")
        .attr("value", function(d, i) {
          return months[i - 1];
        })

      // text label for the x axis
      svg.append("text")
        .attr("transform",
          "translate(" + (width / 2) + " ," +
          (height + margin.top ) + ")")
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
          (scrubHeight - margin.top - 15) + ")")
        .style("text-anchor", "middle")
        .text("Selling Price (in Bells)");


      svg2.append("text")
        .attr("y", 0 - 70)
        .attr("x", 0 + (margin.left * 3))
        .attr("dy", "3em")
        .style("text-anchor", "middle")
        .text("Species Sell Price- drag to brush");

      //timeline axis setup /////////

      var timelineScale = d3.scaleLinear()
        .domain([0, 12])
        .range([175, graphWidth - 130]);


      var timelineAxis = d3.axisTop()
        .scale(timelineScale)
        .tickFormat(function(d, i) {
          return timelineTicks[i]
        }); //change number labels into months

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
      function getAvailability(setClass, data, month) {

        // searchClass = setClass + "." + month;

        var sumCounter = 0; //debug value to count how many points are plotted for each month/wildlife set

        //first, check what exactly is available in that month
        data.forEach(function(d) {
          if (d[month] > 0) {

            sumCounter++;

            //create new array using the necessary data from the datasets:
            //Type of wildlife, available month, species name, and price
            //Also include the image URL, location
            monthlyWildlife.push({
              "Category": setClass,
              "Month": month,
              "Name": d['Name'],
              "Price": +d['Price'],
              "Rarity": d[month],
              "Image URL": d['Image URL'],
              "Location": d['Location']
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

      //cycle through the datasets and update the array
      plotByMonth("bugs", datasetBug);
      plotByMonth("fish", datasetFish);
      plotByMonth("diving", datasetDiving);

      // creating hidden tooltip //////////////////////////
      var tooltip = d3.select("body")
        .append("div")
        .classed('tooltip', true)
        .style("visibility", "hidden");

      //repositioning tooltip based on its position
      onmousemove = function(e) {
        var mousex = e.pageX + 20; //Get X coordinates
        var mousey = e.pageY + 10; //Get Y coordinates
        if ((mousey + 180) > $(window).height() &&
          (mousex + 200) < $(window).width()) {

          $('.tooltip')
            .css({
              top: mousey - 180,
              left: mousex
            })

        } else if ((mousex + 200) > $(window).width() &&
          (mousey + 180) < $(window).height()) {
          $('.tooltip')
            .css({
              top: mousey,
              left: mousex - 200
            })

        } else if ((mousex + 200) > $(window).width() &&
          (mousey + 180) > $(window).height()) {
          $('.tooltip')
            .css({
              top: mousey - 200,
              left: mousex - 250
            })
        } else {
          $('.tooltip')
            .css({
              top: mousey,
              left: mousex
            })
        }
      }

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

      function ticked() //draw the nodes
      {
        var u = d3.select('svg g')
          .selectAll('circle')
          .data(monthlyWildlife);

        u.enter()
          .append("circle")
          .attr("class", function(d) //add classes to circles here
            {
              return d['Category'] + " " + d['Name'].replace(/ /g, "-");
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

          //select objects of the same type in other graphs on click
          .on("click", function(d) {
            // console.log(d);
            var highlightkey = d.key;

            // remove previous selecitons ...
            d3.selectAll("circle,rect.timelineSeries_timelineRect")
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
            d3.selectAll("circle." + selectorClass.replace(/ /g, ".") +
                ",rect.timelineSeries_timelineRect." + selectorClass.replace(/ /g, "."))
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

      function getOverview(setClass, data) {
        data.forEach(function(d) {

          //get time of day that the species appears in
          var startTime = new Date(d['Start Time']);
          startTime = startTime.getTime();

          var endTime = new Date(d['End Time']);
          endTime = endTime.getTime();

          var startTime2, endTime2;
          //check if there's a second time frame in the day that the species shows up in
          if (d['Start Time 2'] != 0 && d['End Time 2'] != 0) {
            startTime2 = new Date(d['Start Time 2']);
            startTime2 = startTime2.getTime();

            endTime2 = new Date(d['End Time 2']);
            endTime2 = endTime2.getTime();

          } else {
            //if there is only one time frame the species appears in
            //set the 2nd set to 0
            startTime2 = 0;
            endTime2 = 0;
          }

          //get months that the species shows up in and add them into an array
          var monthsList = [];

          for (var i = 0; i < months.length; i++) {
            if (d[months[i]] > 0) {
              monthsList.push(months[i]);
            }
          }

          speciesOverview.push({
            "Category": setClass,
            "Name": d['Name'],
            "Price": +d['Price'],
            "Rarity": +d['Rarity'],
            "Location": d['Location'],
            "Image URL": d['Image URL'],
            "Start Time": startTime,
            "End Time": endTime,
            "Start Time 2": startTime2,
            "End Time 2": endTime2,
            "Month List": monthsList
          })
        })
      }

      //initialize overview /////////////////

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
          return +d.Rarity + nodePadding;
        }))
        .on('tick', tickedOverview);

      function tickedOverview() //draw nodes
      {
        var pointRadius = 5;

        var u = svg2.selectAll('circle')
          .data(speciesOverview);

        u.enter()
          .append("circle")
          .attr("id", "overview")
          .attr("class", function(d) //add classes to circles here
            {
              // return d['Category'] + " " + d['Name'] + " " + d['Month'];
              return d['Category'] + " " + d['Name'].replace(/ /g, "-");
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

          //select objects of same type on click
          .on("click", function(d) {
            // console.log(d);
            var highlightkey = d.key;

            // remove previous selecitons ...
            d3.selectAll("circle,rect.timelineSeries_timelineRect")
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

            //select all circles and rectangles of the same classes/species
            d3.selectAll("circle." + selectorClass.replace(/ /g, ".") +
                ",rect.timelineSeries_timelineRect." + selectorClass.replace(/ /g, "."))
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
              return d.x = xScale2(d['Price']);

            })

          .attr('cy', function(d) {
            return d.y;
            // return d.y = Math.max(radius, Math.min(height - radius, d.y));
          })

        u.exit().remove();

      } //end of ticked overview

      // TIMELINE //////////////////////////////////////////////////////////////////////

      function timelineStackedHover(dataArray) //draw the timeline
      {
        var chart = d3.timelines()
          .stack()
          .margin({
            left: 175,
            right: 30,
            top: 50,
            bottom: 50
          })
          .showTimeAxis()
          .showTimeAxisTick()
          .itemHeight(20)
          .mouseover(function(d, i, datum) //show tooltip when mouse is over rect
            {
              var rarity = speciesRarity[d.Rarity];
              var imagePath = d.imageURL;
              var urlString = "<img class='icon' src=" + imagePath + "/>";

              tooltip.style("visibility", "visible")
                .style("color", fillColour[d.Category])
                .html(urlString)
                .append("HTML").attr("dy", "0em")
                .text(d.speciesName)
                .append("HTML").attr("dy", "1em")
                .text(" $" + d.Price + ", " + rarity)
                .classed('tooltip-text', true)
                .append("HTML").attr("dy", "1em")
                .text("Location: " + d.location)
                .classed('tooltip-text', true);
            })
          .hover(function(d, i, datum) {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
          })
          .mouseout(function(d, i, datum) {
            return tooltip.style("visibility", "hidden")
              .html("");
          })
          .click(function(d, i, datum) //select objects of the same type on click
            {
              // console.log(d);
              var highlightkey = d.key;

              // remove previous selecitons ...
              d3.selectAll("circle,rect.timelineSeries_timelineRect")
                .classed("enlarge", false)
                .style('opacity', 0.2)
                .attr('fill', function(d) //set fill colour based on data category/wildlife type
                  {
                    return fillColour[d['Category']];
                  })
                .style('stroke', 'lightgrey');

              //get the classes of the circle selected
              var nameLabel = datum.label;
              var selectorClass = d.Category + " " + nameLabel.replace(/ /g, "-");

              //select all circles of the same classes/species
              d3.selectAll("circle." + selectorClass.replace(/ /g, ".") +
                  ",rect.timelineSeries_timelineRect." + selectorClass.replace(/ /g, "."))
                .style('opacity', 1)
                .style('stroke', 'white')
                .classed("enlarge", true);

              d3.selectAll(".hidden")
                .style('opacity', 1)
                .style('stroke', 'white')
                .classed("enlarge", true);
            })

        //remove old timeline
        d3.select("#timeline").select("svg").remove();

        //draw new timeline
        var svg3 = d3.select("#timeline").append("svg")
          .attr("width", graphWidth - 100)
          .attr("height", 4450)
          .datum(dataArray).call(chart);

        svg3.append("g")
          .attr("class", "x custom axis")
          .attr("transform", "translate(0, " + 30 + ")")
          .call(timelineAxis);
      }

      //update timeline array data
      function updateTimelineArray(name, category, startTime, endTime, startTime2, endTime2, price, imageURL, rarity, location, monthList) {
        var setClass = "timelineRect " + category + " " + name.replace(/ /g, "-");

        if (startTime2 != 0 && endTime2 != 0) {
          //push both time frames the species shows up in into the times value
          //as well as other data for filters and selections
          timelineSpecies.push({
            class: setClass,
            label: name,
            times: [{
                "Category": category,
                "speciesName": name,
                "Price": price,
                "imageURL": imageURL,
                "Rarity": rarity,
                "location": location,
                "Month List": monthList,
                "color": fillColour[category],
                "starting_time": startTime,
                "ending_time": endTime
              },
              {
                "Category": category,
                "speciesName": name,
                "Price": price,
                "imageURL": imageURL,
                "Rarity": rarity,
                "location": location,
                "Month List": monthList,
                "color": fillColour[category],
                "starting_time": startTime2,
                "ending_time": endTime2
              }
            ]
          });

        } else {
          //if there is only one time frame the species appears in
          //only push that one time frame
          timelineSpecies.push({
            class: setClass,
            label: name,
            times: [{
              "Category": category,
              "speciesName": name,
              "Price": price,
              "imageURL": imageURL,
              "Rarity": rarity,
              "location": location,
              "Month List": monthList,
              "color": fillColour[category],
              "starting_time": startTime,
              "ending_time": endTime
            }]
          });
        }

        // console.log("timeline update")
        // console.log(timelineSpecies);
      }


      //dropdown+search function //////////////////////////////////////////////////

      //sort speciesOverview alphabetically
      speciesOverview.sort(function(a, b) {
        if (a.Name < b.Name) {
          return -1;
        }

        if (a.Name > b.Name) {
          return 1;
        }

        return 0;
      });

      //populate the species list
      d3.select("#speciesList")
        .selectAll("option")
        .data(speciesOverview)
        .enter()
        .append("option")
        .attr("value", function(option) {
          return option.Name;
        });

      //search function for species search
      d3.select("#search").on("change", function() {
        var searchValue = document.getElementById("search").value;
        search(speciesOverview, searchValue);
      });

      //search function
      function search(monthlyWildlife, searchValue) {

        timelineSpecies = [];

        if (searchValue != "") {
          d3.selectAll("circle,rect.timelineSeries_timelineRect")
            .classed("enlarge", false)
            .transition(t)
            //clear previous opacity setting
            .style("opacity", "0.8")
            //filters categories of species based on datatype selected
            .filter(function(d)
            {

              if (d['Name'] == searchValue && d['Month'] == null)
              {
                updateTimelineArray(d['Name'], d['Category'], d['Start Time'],
                  d['End Time'], d['Start Time 2'], d['End Time 2'], +d['Price'], d['Image URL'], +d['Rarity'], d['Location'], d['Month List']);

              }

              return d['Name'] != searchValue
            })
            .style("opacity", "0.1"); //lowers opacity of other

        } else {
          //clear filters when clear button pressed or any error occurs
          d3.selectAll("circle,rect.timelineSeries_timelineRect")
            .classed("enlarge", false)
            .transition(t)
            .style("opacity", "0.8") //revert back to orig opacity
        }
        // console.log(searchValue);

        //update the timeline
        timelineStackedHover(timelineSpecies);

      };


      ///////////// filter section //////////////////////////////

      function addFilterListener(type, filterId, value) {
        filterId.addEventListener('click', function() {
          filter(type, monthlyWildlife, value)

        })
      }

      //linking id of filter in HTML filter icons
      var bFilter = document.getElementById('bug-filter'); //species category bttons
      var fFilter = document.getElementById('fish-filter');
      var dFilter = document.getElementById('diving-filter');
      var clear = document.getElementById('clear');
      var common = document.getElementById('common'); //rarity buttons
      var fairlyCommon = document.getElementById('fairlyCommon');
      var uncommon = document.getElementById('uncommon');
      var scarce = document.getElementById('scarce');
      var rare = document.getElementById('rare');

      //setting up event listener for categories
      addFilterListener('category', bFilter, 'bugs');
      addFilterListener('category', fFilter, 'fish');
      addFilterListener('category', dFilter, 'diving');
      addFilterListener('category', clear, 'clear');

      //setting up event listener for rarity
      addFilterListener('rarity', common, '1');
      addFilterListener('rarity', fairlyCommon, '2');
      addFilterListener('rarity', uncommon, '3');
      addFilterListener('rarity', scarce, '4');
      addFilterListener('rarity', rare, '5');

      ////////////// month filter via axis

      var janFilter = document.getElementById('Jan');
      var febFilter = document.getElementById('Feb');
      var marFilter = document.getElementById('Mar');
      var aprFilter = document.getElementById('Apr');
      var mayFilter = document.getElementById('May');
      var junFilter = document.getElementById('Jun');
      var julFilter = document.getElementById('Jul');
      var augFilter = document.getElementById('Aug');
      var sepFilter = document.getElementById('Sep');
      var octFilter = document.getElementById('Oct');
      var novFilter = document.getElementById('Nov');
      var decFilter = document.getElementById('Dec');

      //setting up event listener for months
      addFilterListener('month', janFilter, 'Jan');
      addFilterListener('month', febFilter, 'Feb');
      addFilterListener('month', marFilter, 'Mar');
      addFilterListener('month', aprFilter, 'Apr');
      addFilterListener('month', mayFilter, 'May');
      addFilterListener('month', junFilter, 'Jun');
      addFilterListener('month', julFilter, 'Jul');
      addFilterListener('month', augFilter, 'Aug');
      addFilterListener('month', sepFilter, 'Sep');
      addFilterListener('month', octFilter, 'Oct');
      addFilterListener('month', novFilter, 'Nov');
      addFilterListener('month', decFilter, 'Dec');

      //add eventlistener when dropdown filter is changed
      document.getElementById("month-select").addEventListener("change", monthSelect);
      document.getElementById("species-select").addEventListener("change", speciesSelect);
      document.getElementById("rarity-select").addEventListener("change", raritySelect);

      function monthSelect() {
        var val = document.getElementById("month-select").value;
        filter('month', monthlyWildlife, val);
      }

      function speciesSelect() {
        var val = document.getElementById("species-select").value;
        filter('category', monthlyWildlife, val);
      }

      function raritySelect() {
        var val = document.getElementById("rarity-select").value;
        filter('rarity', monthlyWildlife, val);
      }

      function filter(filterType, monthlyWildlife, filterValue) {
        if (filterValue != "clear" && filterType == "category") //filter by category
        {
          if (filterValue != "all") {

// filter index matches with filter selected
            if(filterValue=="bugs")index=1;
            if(filterValue=="fish")index=2;
            if(filterValue=="diving")index=3;
            document.getElementById("species-select").options.selectedIndex = index;


            d3.selectAll("circle,rect.timelineSeries_timelineRect")
              .classed("enlarge", false)
              .transition(t)
              //clear previous opacity setting
              .style("opacity", "0.8")
              //filters categories of species based on datatype selected
              .filter(function(d) {
                return d['Category'] != filterValue
              })
              .style("opacity", "0.1"); //lowers opacity of other
          } else {
            //if selection is all, then set everything to normal opacity
            d3.selectAll("circle,rect.timelineSeries_timelineRect")
              .style("opacity", "0.8");
          }
        } else if (filterValue != "clear" && filterType == "rarity") //filter by rarity
        {
          if (filterValue != "all") {

            //changing select option to match icon click filter
            var index= filterValue;
            document.getElementById("rarity-select").options.selectedIndex = index;

            d3.selectAll("circle,rect.timelineSeries_timelineRect")
              .classed("enlarge", false)
              .transition(t)
              .style("opacity", "0.8")
              .filter(function(d) {
                return d['Rarity'] != filterValue
              })
              .style("opacity", "0.1"); //lowers opacity of other
          } else {
            d3.selectAll("circle,rect.timelineSeries_timelineRect")
              .style("opacity", "0.8");
          }
        } else if (filterValue != "clear" && filterType == "month") //filter by month
        {
          if (filterValue != "all") {

            if(filterValue=="Jan")index=1;
            if(filterValue=="Feb")index=2;
            if(filterValue=="Mar")index=3;
            if(filterValue=="Apr")index=4;
            if(filterValue=="May")index=5;
            if(filterValue=="Jun")index=6;
            if(filterValue=="Jul")index=7;
            if(filterValue=="Aug")index=8;
            if(filterValue=="Sep")index=9;
            if(filterValue=="Oct")index=10;
            if(filterValue=="Nov")index=11;
            if(filterValue=="Dec")index=12;
            document.getElementById("month-select").options.selectedIndex = index;


            d3.selectAll("circle,rect.timelineSeries_timelineRect")
              .classed("enlarge", false)
              .transition(t)
              .style("opacity", 0.8)
              .filter(function(d) {
                if (d['Month'] != null) {
                  // console.log(d['Month'])
                  return d['Month'] != filterValue;
                }

                if (d['Month List'] != null) {
                  // console.log(d['Month List'])
                  return !d['Month List'].includes(filterValue);
                }

              })
              .style("opacity", "0.1"); //lowers opacity of other
          } else {
            d3.selectAll("circle,rect.timelineSeries_timelineRect")
              .style("opacity", "0.8");
          }

        } else {
          //clear all input filters when clear button pressed or any error occurs
          document.getElementById("month-select").options.selectedIndex = 0;
          document.getElementById("species-select").options.selectedIndex = 0;
          document.getElementById("rarity-select").options.selectedIndex = 0;
          document.getElementById('search').value = ''

          d3.selectAll("circle,rect.timelineSeries_timelineRect")
            .classed("enlarge", false)
            .transition(t)
            .style("opacity", "0.8") //revert back to orig opacity
        }
      }
      ///end filter section

      //BRUSHING /////////////////////////////////////////////////////

      //add brush to the second vis
      svg2.append("g")
        .call(brushX)
        .call(brushX.move, [0, 1]) //initial brush size

      function brushedX() {
        var s = d3.event.selection || xScale2.range();
        var e = d3.event.selection.map(xScale2.invert, xScale2);

        selectedSpecies = []; //clear the array first
        timelineSpecies = [];

        d3.selectAll('circle').classed('enlarge', false); //remove enlarged highlighting

        //select the circles in the main graph with months
        //change highlight + opacity of selected circles that are brushed over
        d3.selectAll('circle')
          .style('opacity', function(d) {
            //make opacity darker if selected
            if (e[0] <= d['Price'] && d['Price'] <= e[1]) {
              //add them to the array of selected species
              selectedSpecies.push(d);
              // console.log("selected: ");
              // console.log(selectedSpecies);

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

        //selection for circles in OVERVIEW graph only and subsequently the timeline
        //prevents duplicates from drawing in the timeline as well
        d3.selectAll('#overview')
          .style('opacity', function(d) {
            //make opacity darker if selected
            if (e[0] <= d['Price'] && d['Price'] <= e[1]) {
              //add them to the array of selected species
              selectedSpecies.push(d);
              // console.log("selected: ");
              // console.log(selectedSpecies);

              updateTimelineArray(d['Name'], d['Category'], d['Start Time'],
                d['End Time'], d['Start Time 2'], d['End Time 2'], +d['Price'], d['Image URL'], +d['Rarity'], d['Location'], d['Month List']);
              //
              // console.log("timeline:");
              // console.log(timelineSpecies)

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

        //update the timeline
        timelineStackedHover(timelineSpecies);
      }

      function brushended() //return to default styling
      {
        if (!d3.event.selection) {
          d3.selectAll('circle')
            .classed("enlarge", false);

          d3.selectAll('circle, rect.timelineSeries_timelineRect')
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
