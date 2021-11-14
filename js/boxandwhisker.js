
/*
 * Box and Whisker - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class BoxandWhiskerVis {

    constructor(_parentElement, _data, _majorCategoryColors) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.majorCategoryColors = _majorCategoryColors;

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */
    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleBand()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Axis title
        vis.svg.append("text")
            .attr("x", -50)
            .attr("y", -8)
            .text("Income");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */
    wrangleData() {
        let vis = this;

        vis.displayData = vis.data;
        vis.majors = [];

        // sort data by largest median income (descending)
        vis.displayData.sort((a, b) => b.Median - a.Median);

        // TODO: make sure values for min and max make sense
        vis.displayData.forEach(element => {
            element.interQuantileRange = element["P75th"] - element["P25th"];
            element.minIncome = element["P25th"] - 1.5 * element.interQuantileRange;
            element.minIncome  = element.minIncome > 0 ? element.minIncome : 0;
            element.maxIncome = element["P75th"] + 1.5 * element.interQuantileRange;
            vis.majors.push(element.Major_code); // TODO: change to major name after rotating ticks so they fit
        });

        vis.displayData = vis.displayData.slice(0, 20);
        vis.majors = vis.majors.slice(0, 20)

        console.log(vis.displayData);
        console.log(vis.majors);

        // Update the visualization
        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis() {
        let vis = this;

        vis.x.domain(vis.majors.slice(0, 20)); // TODO: figure out how to make this scrollable so we can fit all majors
        vis.y.domain([0, d3.max(vis.displayData, d => d.maxIncome) + 10000])

        let boxWidth = vis.width / 20 - 5;

        // vertical lines of each box
        vis.verticalLines = vis.svg.selectAll('.vertical-line')
            .data(vis.displayData, d => d.Rank);

        vis.verticalLines.exit().remove();

        vis.verticalLines.enter()
            .append('line').attr('class', 'vertical-line')
            .attr("x1", d => vis.x(d.Major_code) + vis.width/20/2)
            .attr("x2", d => vis.x(d.Major_code) + vis.width/20/2)
            .attr("y1", d => vis.y(d.minIncome))
            .attr("y2", d => vis.y(d.maxIncome))
            .attr("stroke", "black")

        // boxes
        vis.boxes = vis.svg.selectAll('.box')
            .data(vis.displayData, d => d.Rank);

        vis.boxes.exit().remove();

        vis.boxes.enter()
            .append('rect').attr('class', 'box')
            .attr("x", d => (vis.x(d.Major_code) - boxWidth/2) + vis.width/20/2)
            .attr("y", d => vis.y(d["P75th"]))
            .attr("height", d => vis.y(d["P25th"]) - vis.y(d["P75th"]))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", d => vis.majorCategoryColors[d.Major_category]) // TODO: create a legend for the category colors

        // median lines of each box
        vis.medianLines = vis.svg.selectAll('.median-line')
            .data(vis.displayData, d => d.Rank);

        vis.medianLines.exit().remove();

        vis.medianLines.enter()
            .append('line').attr('class', 'median-line')
            .attr("x1", d => vis.x(d.Major_code) + vis.width/20/2 - boxWidth/2)
            .attr("x2", d => vis.x(d.Major_code) + vis.width/20/2 + boxWidth/2)
            .attr("y1", d => vis.y(d.Median))
            .attr("y2", d => vis.y(d.Median))
            .attr("stroke", "black")

        // minIncome lines of each box
        vis.minLines = vis.svg.selectAll('.min-line')
            .data(vis.displayData, d => d.Rank);

        vis.minLines.exit().remove();

        vis.minLines.enter()
            .append('line').attr('class', 'min-line')
            .attr("x1", d => vis.x(d.Major_code) + vis.width/20/2 - boxWidth/2)
            .attr("x2", d => vis.x(d.Major_code) + vis.width/20/2 + boxWidth/2)
            .attr("y1", d => vis.y(d.minIncome))
            .attr("y2", d => vis.y(d.minIncome))
            .attr("stroke", "black")

        // maxIncome lines of each box
        vis.maxLines = vis.svg.selectAll('.mx-line')
            .data(vis.displayData, d => d.Rank);

        vis.maxLines.exit().remove();

        vis.maxLines.enter()
            .append('line').attr('class', 'mx-line')
            .attr("x1", d => vis.x(d.Major_code) + vis.width/20/2 - boxWidth/2)
            .attr("x2", d => vis.x(d.Major_code) + vis.width/20/2 + boxWidth/2)
            .attr("y1", d => vis.y(d.maxIncome))
            .attr("y2", d => vis.y(d.maxIncome))
            .attr("stroke", "black")

        // Call axis functions with the new domain
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);
    }
}