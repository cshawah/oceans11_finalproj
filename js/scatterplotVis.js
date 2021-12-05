class ScatterplotVis {
    constructor(parentElement, data, colors) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = this.data;
        this.majorCategoryColors = colors
        this.majorCategory = ''

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 50, left: 60};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'circleTooltip')

        // D3 color scale.
        vis.categories = new Set()

        for (let i = 0; i< vis.displayData.length; i++) {
            vis.categories.add(vis.displayData[i].Major_category)
        };

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);


        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        // x-Axis title
        vis.svg.append("text")
            .attr("transform", "translate(" + (vis.width / 2) + " ," + (vis.height + 45) + ")")
            .text("Percentage of Women");

        // y-Axis title
        vis.svg.append("text")
            .attr("x", -50)
            .attr("y", -9)
            .text("Median Income");

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis");

        // Append tooltip
        vis.tooltip = d3.select('body').append('div').attr('class', 'tooltip')

        vis.allData = vis.data

        vis.allData.forEach(function(d){

            if (d.ShareWomen) {

                d.ShareWomen = d.ShareWomen * 100

                return d
            }
        })

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        if (vis.majorCategory){
            vis.displayData = vis.allData.filter(a => a["Major_category"] === vis.majorCategory);
        }else{
            vis.displayData = vis.allData;
        }

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        // x domain
        vis.x.domain([d3.min(vis.allData.map(d=> d.ShareWomen)) - 1, d3.max(vis.allData.map(d=> d.ShareWomen)) + 4]);

        // y domain
        vis.y.domain([d3.min(vis.allData.map(d=> d.Median)) - 3000, d3.max(vis.allData.map(d=> d.Median))]);


        vis.circles = vis.svg.selectAll("circle")
            .data(vis.displayData);

        vis.circles.enter()
            .append("circle")
            .attr("cx", function(d){
                return vis.x(d.ShareWomen)
            })
            .attr("class", "circle")
            .merge(vis.circles)
            .attr("cy",function(d){
                return vis.y(d.Median)
            })
            .attr("r", function(d){
                return 8
            })
            .style('fill', function(d, i){
                return vis.majorCategoryColors[d.Major_category];
            })
            .style('stroke', "#000")
            .style('opacity', 0.8)
            .on('mouseover', function(event, d) {
                vis.majorCategory = d.Major_category
                vis.wrangleData()
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                             <div style="border: thin solid grey; border-radius: 5px; background: black; padding: 8px">
                                <h5 style="font-weight: bold">${d.Major}<h5>
                                <h5>Category: ${d.Major_category}<h5>
                                <h5>Median Income: $${d.Median.toLocaleString("en-US")}</h5> 
                                <h5>Percentage of Women: ${Math.floor(d.ShareWomen)}%</h5>                  
                             </div>`);
                }
            ).on('mouseout', function(){
            vis.majorCategory = ''
            vis.wrangleData()
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        vis.circles.exit().remove();

        vis.xAxisGroup = vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.yAxisGroup = vis.svg.select(".y-axis")
            .call(vis.yAxis);
    }
}