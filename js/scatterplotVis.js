class ScatterplotVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = this.data;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 60};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('Gender and Salary Scatter Plot')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // vis.colorScale = d3.scaleQuantize()
        //     .range(["rgb(237,248,233)", "rgb(186,228,179)",
        //         "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"])

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);


        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis");

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        vis.displayData.forEach(function(d){

            if (d.ShareWomen) {

                d.ShareWomen = +d.ShareWomen
                return d.ShareWomen
            }
        })

        console.log(vis.displayData)


        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        // x domain

        // y domain


        vis.circles = vis.svg.selectAll("circle")
            .data(this.displayData);

        vis.circles.enter()
            .append("circle")
            .attr("x", function(d){
                return vis.x(parseInt(d.ShareWomen))
            })
            .attr("class", "plot")
            .merge(vis.circles)
            .attr("y",function(d){
                return vis.y(0)
            })
            .attr("width", vis.x.bandwidth())
            .attr("height", function(d){
                return vis.height - vis.y(d[selected])
            }).on('mouseover', function(event, d){
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
            <h3>${d.state}<h3>
            <h4>Population : ${d.population}<h4>
            <h4>Cases(absolute) :${d.absCases}</h4> 
            <h4>Deaths: ${d.absDeaths}</h4>         
            <h4>Cases(relative) :${d.relCases.toFixed(2)}%</h4>            
            <h4>Deaths(relative) :${d.relDeaths.toFixed(2)}%</h4>                       
         </div>`);

        })
            .on('mouseout', function(){
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        vis.rect.exit().remove();

        vis.xAxisGroup = vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.yAxisGroup = vis.svg.select(".y-axis")
            .call(vis.yAxis);
    }
}