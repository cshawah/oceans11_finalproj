
/*
 * Box and Whisker - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class BoxandWhiskerVis {

    constructor(_parentElement, _data, _majorCategoryColors, _isByCategory) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.majorCategoryColors = _majorCategoryColors;
        this.displayData = [];
        this.isByCategory = _isByCategory; // boolean to mark whether or not this should be by category or major

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */
    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 0, bottom: 200, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = 700 - vis.margin.top - vis.margin.bottom;

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

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'boxTooltip')

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

        // data for category box and whisker
        if (vis.isByCategory) {
            // list of categories for x-axis
            vis.categories = Object.keys(vis.majorCategoryColors);

            // temporary data object to calculate sums (dictionary)
            let tempData = [];
            vis.categories.forEach(cat => {
                tempData[cat] = {
                    sumMedian: 0,
                    sumTwentyFifth: 0,
                    sumSeventyFifth: 0,
                    entries: 0 // number of entries in this category
                }
            })
            vis.data.forEach(element => {
                tempData[element["Major_category"]].sumMedian += element.Median;
                tempData[element["Major_category"]].sumTwentyFifth += element["P25th"];
                tempData[element["Major_category"]].sumSeventyFifth += element["P75th"];
                tempData[element["Major_category"]].entries += 1;
            });
            // console.log(tempData);

            // calculate averages to build final data structure (list)
            vis.categories.forEach(category => {
                vis.displayData.push({
                    category: category,
                    averageMedian: Math.ceil(tempData[category].sumMedian / tempData[category].entries),
                    averageTwentyFifth: Math.ceil(tempData[category].sumTwentyFifth / tempData[category].entries),
                    averageSeventyFifth: Math.ceil(tempData[category].sumSeventyFifth / tempData[category].entries)
                })
            });

            vis.displayData.sort((a, b) => b.averageMedian - a.averageMedian);
            vis.categories = [];

            vis.displayData.forEach(element => {
                if (!vis.categories.includes(element.category)) {
                    vis.categories.push(element.category);
                }
            })

            console.log(vis.displayData);
            console.log(vis.categories);
        }
        // data for majors box and whisker
        else {
            // initialize list of majors for x-axis
            vis.majors = [];

            // selected category in dropdown
            let selectedCategory = document.getElementById("selectBox").value;

            // filter by selected major category
            if (selectedCategory === "Overall") {
                vis.displayData = vis.data;
            }
            else {
                vis.displayData = vis.data.filter(a => a["Major_category"] === selectedCategory);
            }

            // sort data by largest median income (descending)
            vis.displayData.sort((a, b) => b.Median - a.Median);

            // grab top 20 for overall
            if (selectedCategory === "Overall") {
                vis.displayData = vis.displayData.slice(0, 20);
            }

            vis.displayData.forEach(element => {
                element.fullMajor = element.Major;
                element.abbrevMajor = vis.abbrevMajor(element.Major); // abbreviates the major so it fits on the axis

                // not using the below metrics because I'm worried they're misleading since we only have 1 data point per major
                element.interQuantileRange = element["P75th"] - element["P25th"];
                element.minIncome = element["P25th"] - 1.5 * element.interQuantileRange;
                element.minIncome  = element.minIncome > 0 ? element.minIncome : 0;
                element.maxIncome = element["P75th"] + 1.5 * element.interQuantileRange;

                vis.majors.push(element.abbrevMajor);
            });
        }

        // Update the visualization
        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis() {
        let vis = this;

        if (vis.isByCategory) {
            vis.x.domain(vis.categories);
            vis.y.domain([0, d3.max(vis.displayData, d => d.averageSeventyFifth) + 10000]);

            let boxWidth = vis.width / vis.categories.length - 10;

            // vertical lines of each box
            vis.verticalLines = vis.svg.selectAll('.vertical-line')
                .data(vis.displayData);
            // boxes
            vis.boxes = vis.svg.selectAll('.box')
                .data(vis.displayData);
            // median lines of each box
            vis.medianLines = vis.svg.selectAll('.median-line')
                .data(vis.displayData);
            // minIncome lines of each box
            vis.minLines = vis.svg.selectAll('.min-line')
                .data(vis.displayData);
            // maxIncome lines of each box
            vis.maxLines = vis.svg.selectAll('.max-line')
                .data(vis.displayData);

            vis.verticalLines.exit().remove();
            vis.boxes.exit().remove();
            vis.medianLines.exit().remove();
            vis.minLines.exit().remove();
            vis.maxLines.exit().remove();

            // vis.verticalLines.data(vis.displayData, d => d.Major)
            //     .enter()
            //     .append('line').attr('class', 'vertical-line')
            //     .attr("x1", d => vis.x(d.Major) + vis.width/vis.majors.length/2)
            //     .attr("x2", d => vis.x(d.Major) + vis.width/vis.majors.length/2)
            //     .attr("y1", d => vis.y(d.minIncome))
            //     .attr("y2", d => vis.y(d.maxIncome))
            //     .attr("stroke", "black");

            vis.boxes.data(vis.displayData, d => d.category)
                .enter()
                .append('rect').attr('class', 'box')
                .attr("x", d => (vis.x(d.category) - boxWidth/2) + vis.width/vis.categories.length/2)
                .attr("y", d => vis.y(d.averageSeventyFifth))
                .attr("height", d => vis.y(d.averageTwentyFifth) - vis.y(d.averageSeventyFifth))
                .attr("width", boxWidth)
                .attr("stroke", "black")
                .style("fill", d => vis.majorCategoryColors[d.category])
                .on('mouseover', function(event, d) {
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                            <h5>${d.category.toUpperCase()}<h5>
                            <h5>Avg. Median Income: $${d.averageMedian.toLocaleString("en-US")}</h5> 
                            <h5>Avg. 25th Percentile: $${d.averageTwentyFifth.toLocaleString("en-US")}</h5> 
                            <h5>Avg. 75th Percentile: $${d.averageSeventyFifth.toLocaleString("en-US")}</h5>                       
                         </div>`);
                })
                .on('mouseout', function(){
                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                });

            vis.medianLines.data(vis.displayData, d => d.category)
                .enter()
                .append('line').attr('class', 'median-line')
                .attr("x1", d => vis.x(d.category) + vis.width/vis.categories.length/2 - boxWidth/2)
                .attr("x2", d => vis.x(d.category) + vis.width/vis.categories.length/2 + boxWidth/2)
                .attr("y1", d => vis.y(d.averageMedian))
                .attr("y2", d => vis.y(d.averageMedian))
                .attr("stroke", "black")
                .attr("stroke-width", 3);

            // vis.minLines.data(vis.displayData, d => d.Major)
            //     .enter()
            //     .append('line').attr('class', 'min-line')
            //     .attr("x1", d => vis.x(d.Major) + vis.width/vis.majors.length/2 - boxWidth/2)
            //     .attr("x2", d => vis.x(d.Major) + vis.width/vis.majors.length/2 + boxWidth/2)
            //     .attr("y1", d => vis.y(d.minIncome))
            //     .attr("y2", d => vis.y(d.minIncome))
            //     .attr("stroke", "black");
            //
            // vis.maxLines.data(vis.displayData, d => d.Major)
            //     .enter()
            //     .append('line').attr('class', 'max-line')
            //     .attr("x1", d => vis.x(d.Major) + vis.width/vis.majors.length/2 - boxWidth/2)
            //     .attr("x2", d => vis.x(d.Major) + vis.width/vis.majors.length/2 + boxWidth/2)
            //     .attr("y1", d => vis.y(d.maxIncome))
            //     .attr("y2", d => vis.y(d.maxIncome))
            //     .attr("stroke", "black");
        }
        else {
            vis.x.domain(vis.majors);
            vis.y.domain([0, d3.max(vis.displayData, d => d["P75th"]) + 10000])

            let boxWidth = vis.width / vis.majors.length - 8;

            // boxes
            vis.boxes = vis.svg.selectAll('.box')
                .data([]);
            // median lines of each box
            vis.medianLines = vis.svg.selectAll('.median-line')
                .data([]);

            vis.boxes.exit().remove();
            vis.medianLines.exit().remove();

            vis.boxes.data(vis.displayData, d => d.abbrevMajor)
                .enter()
                .append('rect').attr('class', 'box')
                .attr("x", d => (vis.x(d.abbrevMajor) - boxWidth/2) + vis.width/vis.majors.length/2)
                .attr("y", d => vis.y(d["P75th"]))
                .attr("height", d => vis.y(d["P25th"]) - vis.y(d["P75th"]))
                .attr("width", boxWidth)
                .attr("stroke", "black")
                .style("fill", d => vis.majorCategoryColors[d.Major_category])
                .on('mouseover', function(event, d) {
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                            <h5>${d.fullMajor}<h5> 
                            <h5>Category: ${d.Major_category}<h5>
                            <h5>Median Income: $${d.Median.toLocaleString("en-US")}</h5> 
                            <h5>25th Percentile: $${d["P25th"].toLocaleString("en-US")}</h5> 
                            <h5>75th Percentile: $${d["P75th"].toLocaleString("en-US")}</h5>                       
                         </div>`);
                })
                .on('mouseout', function(){
                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                });

            vis.medianLines.data(vis.displayData, d => d.abbrevMajor)
                .enter()
                .append('line').attr('class', 'median-line')
                .attr("x1", d => vis.x(d.abbrevMajor) + vis.width/vis.majors.length/2 - boxWidth/2)
                .attr("x2", d => vis.x(d.abbrevMajor) + vis.width/vis.majors.length/2 + boxWidth/2)
                .attr("y1", d => vis.y(d.Median))
                .attr("y2", d => vis.y(d.Median))
                .attr("stroke", "black")
                .attr("stroke-width", 3);
        }

        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        vis.svg.select(".y-axis").call(vis.yAxis);
    }

    // function to abbreviate major name so it fits on the axis
    abbrevMajor(major) {
        let abbreviated = major;
        abbreviated = abbreviated.includes("ENGINEERING") ? abbreviated.replace("ENGINEERING", "ENG.") : abbreviated;
        abbreviated = abbreviated.includes("MANAGEMENT") ? abbreviated.replace("MANAGEMENT", "MGMT.") : abbreviated;
        abbreviated = abbreviated.includes("MISCELLANEOUS") ? abbreviated.replace("MISCELLANEOUS", "MISC.") : abbreviated;
        abbreviated = abbreviated.includes("AND") ? abbreviated.replace("AND", "&") : abbreviated;
        return abbreviated;
    }
}



