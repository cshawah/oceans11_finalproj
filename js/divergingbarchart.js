class DivergingBarChart {
    constructor(parentElement, data, _majorCategoryColors) {
        this.parentElement = parentElement;
        this.data = data;
        this.majorCategoryColors = _majorCategoryColors;
        this.displayData = [];

        this.initVis();

    }

    initVis(){

        let vis = this;

        vis.margin = {top: 0, right: 20, bottom: 20, left: 50};
        vis.padding = {top: 0, right: 0, bottom: 0, left: 125};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([vis.padding.left, vis.width])
            .domain([-50, 50]);

        vis.x_women = d3.scaleLinear()
            .range([0, (vis.width-vis.padding.left)/2])
            .domain([0, 50]);

        vis.x_men = d3.scaleLinear()
            .range([0, (vis.width-vis.padding.left)/2])
            .domain([0, -50]);

        vis.y = d3.scaleBand()
            .range([vis.height, 70]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(" + 0 + "," + (vis.height-50) + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(" + vis.padding.left + "," + -50 + ")"); //!!!!

        // Axis title
        vis.svg.append("text")
            .attr("x", vis.width - vis.width/1.8)
            .attr("y", vis.height+10)
            .text("% over or under gender parity");

        vis.svg.append("text")
            .attr("class", "div-bar-lab")
            .attr("x", vis.width*0.13)
            .attr("y", vis.height)
            .text("More Men");

        vis.svg.append("text")
            .attr("class", "div-bar-lab")
            .attr("x", vis.width*.9)
            .attr("y", vis.height)
            .text("More Women");

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip');


        this.wrangleData();
    }

    wrangleData(){

        let vis = this;


        // Get the major Categories in an array
        let majorCategoriesHelper = []

        vis.data.forEach(function (element) {
            majorCategoriesHelper.push(element.Major_category)
        })

        let uniqueSet = new Set(majorCategoriesHelper);
        vis.majorCategories = Array.from(uniqueSet);

        vis.majorCategories.sort((a, b) => a.localeCompare(b))

        // Get the individual data
        let totalMajors = 0
        let totalWomen = 0
        let totalPeople = 0
        vis.majorCounts = [];
        vis.totalWomen = [];
        vis.totalPeople = [];
        vis.shareWomen = [];

        vis.majorCategories.forEach(function(element) {
            vis.data.forEach(function (row) {
                if(row.Major_category === element) {
                    totalMajors += 1
                    totalWomen += row.Women
                    totalPeople += row.Total
                }
            })

            vis.majorCounts.push({
                totalMajors
            })
            vis.totalWomen.push({
                totalWomen
            })
            vis.totalPeople.push({
                totalPeople
            })

            totalMajors = 0
            totalWomen = 0
            totalPeople = 0
        })


      //  vis.displayData2 = [];

        for (let i = 0; i < vis.majorCategories.length; i++) {
            vis.displayData.push(
                {
                    index: i,
                    majorCat: vis.majorCategories[i],
                    totalWomen: vis.totalWomen[i],
                    totalPeople: vis.totalPeople[i],
                    shareWomen: (vis.totalWomen[i].totalWomen/vis.totalPeople[i].totalPeople) * 100,
                    genderDiff: (vis.totalWomen[i].totalWomen/vis.totalPeople[i].totalPeople - 0.5) * 100
                })
        }

        vis.catList = [];

        vis.displayData.sort((a, b) => a.genderDiff - b.genderDiff);

        vis.displayData.forEach(element => {
            vis.catList.push(element.majorCat);
        });

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        vis.y.domain(vis.catList);

        vis.bars = vis.svg.selectAll('.box')
            .data(vis.displayData, d => d.index);

        vis.bars.exit().remove();

        vis.bars.enter()
            .append('rect').attr('class', 'box')
            .attr("y", d => (vis.y(d.majorCat)) - 50) // good
            .attr("x", function(d) { if (d.genderDiff > 0) { return (vis.x(0)) } else { return (vis.x(d.genderDiff)) } })
            .attr("height", 20) // good
            .attr("width", function(d) { if (d.genderDiff > 0) { return (vis.x_women(d.genderDiff)) } else { return (vis.x_men(d.genderDiff)) } })
            .attr("stroke", "black")
            .style("fill", d => vis.majorCategoryColors[d.majorCat])
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                             <div style="border: thin solid grey; border-radius: 5px; background: black; padding: 8px">
                                 <h5 style="font-weight: bold; color: white">${d.majorCat}</h5>
                                 <h5 style="color: white">Percent Women: ${Math.round(d.shareWomen*100)/100}%</h5>
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

        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-40)");

        vis.svg.select(".y-axis").call(vis.yAxis);

    }

}