class DivergingBarChart {
    constructor(parentElement, data, _majorCategoryColors) {
        this.parentElement = parentElement;
        this.data = data;
        this.majorCategoryColors = _majorCategoryColors;
        this.displayData = this.data;

        this.initVis();


    }

    initVis(){

        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 60};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 3000 - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([250, vis.width])
            .domain([-51, 51]);

        vis.x_women = d3.scaleLinear()
            .range([0, (vis.width-250)/2])
            .domain([0, 50]);

        vis.x_men = d3.scaleLinear()
            .range([0, (vis.width-250)/2])
            .domain([0, -50]);

        // vis.x_men = d3.scaleLinear()
        //     .range([0, (vis.width-250)/2])
        //     .domain([-50, 0]);

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

     //   vis.displayData = vis.displayData.slice(0, 120);
     //   vis.majors = vis.majors.slice(0, 120);

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
         //   .attr("x", vis.x(0))
            .attr("x", function(d) { if (d.genderDiff > 0) { return (vis.x(0)) } else { return (vis.x(d.genderDiff)) } })
            .attr("height", 13) // good
            .attr("width", function(d) { if (d.genderDiff > 0) { return (vis.x_women(d.genderDiff)) } else { return (vis.x_men(d.genderDiff)) } })
            .attr("stroke", "none")
            .style("fill", d => vis.majorCategoryColors[d.Major_category]);


        //function(d) {
        //             if (d.close <= 400) {return "red"}
        //             else 	{ return "black" };})

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