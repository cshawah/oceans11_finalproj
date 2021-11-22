
/*
 * Box and Whisker - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class InnovativeVis {

    constructor(_parentElement, _data, _majorCategoryColors, _n) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.majorCategoryColors = _majorCategoryColors;
        this.n = _n;
        this.displayData = [];

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */
    initVis() {
        let vis = this;

        vis.margin = { top: 0, right: 0, bottom: 0, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // TODO: fix these so scales form a 10 x 10 matrix, and make sure these are ghost axes (don't actually show up)
        // Scales and axes
        vis.x = d3.scaleBand()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip');

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */
    wrangleData() {
        let vis = this;
        // TODO: make filter buttons on html and then get value of which filter button was selected (all, men, women)

        vis.categoryStats = {};
        let overallTotal = 0;
        let overallMen = 0;
        let overallWomen = 0;

        vis.data.forEach(major => {
            if (!(major.Major_category in vis.categoryStats)){ // checks if the category is a key in the object yet
                vis.categoryStats[major.Major_category] = {
                    Total: major.Total,
                    Women: major.Women,
                    Men: major.Men
                };
            }
            else {
                vis.categoryStats[major.Major_category].Total += major.Total;
                vis.categoryStats[major.Major_category].Women += major.Women;
                vis.categoryStats[major.Major_category].Men += major.Men;
            }
            overallTotal += major.Total;
            overallMen += major.Men;
            overallWomen += major.Women;
        });

        Object.keys(vis.categoryStats).forEach(category => {
            vis.displayData.push({
                Category: category,
                Total: vis.categoryStats[category].Total,
                Women: vis.categoryStats[category].Women,
                Men: vis.categoryStats[category].Men,
                IntTotal: Math.round((vis.categoryStats[category].Total/overallTotal) * 100),
                IntWomen: Math.round((vis.categoryStats[category].Women/overallWomen) * 100 + 0.182),
                IntMen: Math.round((vis.categoryStats[category].Men/overallMen) * 100 + 0.05)
            })
        });

        let test = 0;

        vis.dotsTotal = [];
        vis.dotsMen = [];
        vis.dotsWomen = [];
        let counterTotal = 0;
        let counterMen = 0;
        let counterWomen = 0;

        vis.displayData.forEach(cat => {
            for (let i = 0; i < cat.IntTotal; i++) {
               vis.dotsTotal.push({
                   Index: counterTotal,
                   MajorCat: cat.Category
               });
                counterTotal += 1;
            }
            for (let i = 0; i < cat.IntWomen; i++) {
                vis.dotsWomen.push({
                    Index: counterWomen,
                    MajorCat: cat.Category
                });
                counterWomen += 1;
            }
            for (let i = 0; i < cat.IntMen; i++) {
                vis.dotsMen.push({
                    Index: counterMen,
                    MajorCat: cat.Category
                });
                counterMen += 1;
            }
        });

        // console.log(vis.dotsTotal);
        // console.log(vis.dotsWomen);
        // console.log(vis.dotsMen);

        vis.allData = [];

        vis.allData[0] = vis.dotsTotal;
        vis.allData[1] = vis.dotsMen;
        vis.allData[2] = vis.dotsWomen;

        console.log(vis.allData);

        // Update the visualization
        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis() {
        let vis = this;

        //vis.dotsTotal, vis.dotsWomen, vis.dotsMen

        vis.circles = vis.svg.selectAll('circle.total')
            .data(vis.allData[vis.n], d => d.Index);

        vis.circles.exit().remove();

        vis.circles.enter()
            .append('circle').attr('class', 'total')
            .attr("cx", d => ((d.Index % 10)*30))
            .attr("cy", d => ((Math.floor(d.Index/10)+1) * 30))
            .attr("r", 13) // good
            .attr("stroke", "black")
            .style("fill", d => vis.majorCategoryColors[d.MajorCat])
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                             <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                                 <h5>${d.MajorCat}</h5>
                             </div>`)})
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        // TODO: calculate and draw number of circles per category, placing them in the correct spot using the scales
        // Math.floor(category.Total / overallTotal * 100); // code to calculate number of circles to draw for each category (when on the overall button)
    }

    // function to abbreviate major name so it fits on the axis
    // abbrevMajor(major) {
    //     let abbreviated = major;
    //     abbreviated = abbreviated.includes("ENGINEERING") ? abbreviated.replace("ENGINEERING", "ENG.") : abbreviated;
    //     abbreviated = abbreviated.includes("MANAGEMENT") ? abbreviated.replace("MANAGEMENT", "MGMT.") : abbreviated;
    //     abbreviated = abbreviated.includes("MISCELLANEOUS") ? abbreviated.replace("MISCELLANEOUS", "MISC.") : abbreviated;
    //     return abbreviated;
    // }
}



