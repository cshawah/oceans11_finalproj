
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

        vis.width = 350 - vis.margin.top - vis.margin.bottom;
     //   vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 350 - vis.margin.top - vis.margin.bottom;

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

        vis.dotsTotal = [];
        vis.dotsMen = [];
        vis.dotsWomen = [];
        vis.dotsRandom = [];
        let counterTotal = 0;
        let counterMen = 0;
        let counterWomen = 0;
        let counterRandom = 0;

        vis.displayData.forEach(cat => {
            for (let i = 0; i < cat.IntTotal; i++) {
               vis.dotsTotal.push({
                   Index: counterTotal,
                   MajorCat: cat.Category,
                   Gender: (i < Math.round(cat.Men/overallTotal * 100) ? "M":"F"),
                   Random: Math.random(),
                   Int: cat.IntTotal
               });
                counterTotal += 1;
            }
            for (let i = 0; i < cat.IntTotal; i++) {
                vis.dotsRandom.push({
                    Index: counterTotal,
                    MajorCat: cat.Category,
                    Random: Math.random(),
                    Gender: (i <= cat.Men/overallTotal * 100 ? "M":"F"),
                    Int: cat.IntTotal
                });
                counterRandom += 1;
            }
            for (let i = 0; i < cat.IntWomen; i++) {
                vis.dotsWomen.push({
                    Index: counterWomen,
                    MajorCat: cat.Category,
                    Gender: "F",
                    Int: cat.IntWomen
                });
                counterWomen += 1;
            }
            for (let i = 0; i < cat.IntMen; i++) {
                vis.dotsMen.push({
                    Index: counterMen,
                    MajorCat: cat.Category,
                    Gender: "M",
                    Int: cat.IntMen
                });
                counterMen += 1;
            }
        });

        vis.allData = [];

        vis.allData[0] = vis.dotsTotal.sort((a, b) => a.Index - b.Index);
        vis.allData[1] = vis.dotsMen;
        vis.allData[2] = vis.dotsWomen;
        vis.allData[3] = vis.dotsRandom.sort((a, b) => a.Random - b.Random);


        // Update the visualization
        vis.updateVis();


    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis() {

        let vis = this;

        // selected category in dropdown
        vis.selection = document.getElementById("selectSort").value;

        // filter by selected major category
        if (vis.n === 1 || vis.n === 2) {
            vis.n = vis.n;
        }
        else {
            vis.n = vis.selection;
        }

        var symbol = d3.symbol().type(function(d) {
            if(d.Gender === 'M') {
                return d3.symbolSquare;
            } else {
                return d3.symbolCircle;
            }
        }).size(500);

        // I'm doing this wrong, please help!!!!

        vis.svg.selectAll('path.total')
            .transition(500)
            .style("opacity", 0)
            .remove();

        vis.symbols = vis.svg.selectAll()
            .data(vis.allData[vis.n], d => d.Index);

        vis.symbols.exit().remove();

        vis.symbols.enter()
            .append('path')
            .attr('d', symbol)
            .attr('class', 'total')
            .attr("transform", function (d, i) { return "translate("+ ((i % 10)*30) + ", " + ((Math.floor(i/10)+1) * 30)+")" })
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
                             <div style="border: thin solid grey; border-radius: 5px; background: black; padding: 8px">
                                 <h5 style="font-weight: bold; color: white">${d.MajorCat}</h5>
                                 <h5 style="color: white">${d.Int}% of students</h5>
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
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1)

    }

}



