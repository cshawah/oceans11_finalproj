class DivergingBarChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = this.data;

        this.initVis();


    }

    initVis(){

        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 60};
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
            .range([250, vis.width])
            .domain([-50, 50]);

        vis.x_women = d3.scaleLinear()
            .range([0, (vis.width-250)/2])
            .domain([0, 50]);

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
            .attr("transform", "translate(" + 250 + "," + -50 + ")"); //!!!!

        // Axis title
        vis.svg.append("text")
            .attr("x", vis.width/2)
            .attr("y", vis.height+10)
            .text("Percent Diff");


        this.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.displayData = vis.data;
        vis.majors = [];

        vis.displayData.sort((a, b) => b.ShareWomen - a.ShareWomen);

        vis.displayData.forEach(element => {
            element.Major = element.Major.includes("ENGINEERING") ? element.Major.replace("ENGINEERING", "ENG.") : element.Major;
            element.genderDiff = (element.ShareWomen - 0.50) * 100;
            vis.majors.push(element.Major);
        });

        vis.displayData = vis.displayData.slice(0, 20);
        vis.majors = vis.majors.slice(0, 20);

        console.log(vis.displayData);

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        vis.y.domain(vis.majors);


        vis.bars = vis.svg.selectAll('.box')
            .data(vis.displayData, d => d.Rank);

        vis.bars.exit().remove();

        vis.bars.enter()
            .append('rect').attr('class', 'box')
            .attr("y", d => (vis.y(d.Major)) - 50) // good
            .attr("x", vis.x(0))
            .attr("height", 15) // good
            .attr("width", d => (vis.x_women(d.genderDiff)))
            .attr("stroke", "black");
           // .style("fill", d => vis.majorCategoryColors[d.Major_category])

// END

        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-40)");
        ;
        vis.svg.select(".y-axis").call(vis.yAxis);


    }

}