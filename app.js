// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select the plot section, append SVG area to it, and set the dimensions
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.

var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Append a div to the body to create tooltips, assign it a class
d3.select("#chart").append("div").attr("class", "tooltip").style("opacity", 0);

// Load data from data.csv
d3.csv("data.csv").then(function (riskData) {

    // Print the Data
    console.log(riskData);

    // Assign Data Values
    riskData.forEach(function (data) {
        data.health = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // Create scales
    var yLinearScale = d3.scaleLinear().range([chartHeight, 0]);
    var xLinearScale = d3.scaleLinear().range([0, chartWidth]);

    // Create axis'
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Scale the chart
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    xMin = d3.min(riskData, function (data) {
        return +data.poverty * 0.90;
    });

    xMax = d3.max(riskData, function (data) {
        return +data.poverty * 1.10;
    });

    yMin = d3.min(riskData, function (data) {
        return +data.health * 0.50;
    });

    yMax = d3.max(riskData, function (data) {
        return +data.health * 1.10;
    });

    xLinearScale.domain([xMin, xMax]);
    yLinearScale.domain([yMin, yMax]);


    // Initialize tooltip data
    var toolTip = d3
        .tip()
        .attr("class", "tooltip")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .attr("class", "aText")
        .attr("class", "active")
        .offset([70, -90])
        .html(function (data) {
            var stateTip = data.state;
            var povTip = +data.poverty;
            var healthTip = +data.health;
            return (
                stateTip + '<br> Poverty: ' + povTip + '% <br> Healthcare: ' + healthTip + '%'
            );
        });

    // Create tooltip to add to chart
    chartGroup.call(toolTip);

    chartGroup.selectAll("circle")
        .data(riskData)
        .enter()
        .append("circle")
        .attr("cx", function (data, index) {
            return xLinearScale(data.poverty)
        })
        .attr("cy", function (data, index) {
            return yLinearScale(data.health)
        })
        .attr("r", "16")
        .attr("fill", "#e377c2")
        // display info on hover
        .on("mouseenter", function (data) {
            toolTip.show(data, this);
        })
        // hide info after unhover
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    // Append labels to each tooltip
    chartGroup.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .selectAll("tspan")
        .data(riskData)
        .enter()
        .append("tspan")
        .attr("class", "stateText")
        .attr("dy", "4")
        .attr("x", function (data) {
            return xLinearScale(data.poverty);
        })
        .attr("y", function (data) {
            return yLinearScale(data.health);
        })
        .text(function (data) {
            return data.abbr
        });

    // Append SVG group and display x-axis 
    chartGroup
        .append("g")
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // Append SVG group and display y-axis
    chartGroup.append("g").call(leftAxis);

    // Append the label for the y-axis
    chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left + 40)
        .attr("x", 0 - chartHeight / 2)
        .attr("dy", "1em")
        .attr("class", "axis-text")
        .text("Healthcare (%)")

    // Append the label for the x-axis
    chartGroup
        .append("text")
        .attr(
            "transform",
            "translate(" + chartWidth / 2 + " ," + (chartHeight + chartMargin.top + 20) + ")"
        )
        .attr("class", "axis-text")
        .text("Poverty (%)");

});