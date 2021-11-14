class GroupedBarChart{

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.display_data = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 30, left: 40};
        //vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        //vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        /* // Scales and axes
         vis.x = d3.scaleBand()
             .range([10, vis.width])
             .paddingInner(0.1);
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
             .attr("class", "y-axis axis")
             .attr("transform", "translate(5" + ",0)");
         vis.colors = d3.scaleLinear()
             .range(['#fcffff', '#274b4b'])*/

        this.wrangleData();
    }

    wrangleData() {
        let vis = this

        // Get the major Categories in an array
        let majorCategoriesHelper = []

        vis.data.forEach(function (element) {
            majorCategoriesHelper.push(element.Major_category)
        })

        let uniqueSet = new Set(majorCategoriesHelper);
        vis.majorCategories = Array.from(uniqueSet);

        vis.majorCategories.sort((a, b) => a.localeCompare(b))

        console.log(vis.majorCategories)

        // Get the individual data
        let counterUnemployed = 0
        let counterPartTime = 0
        let counterFullTime = 0
        let counterTotal = 0
        vis.unemployedCategories = []
        vis.partTimeCategories = []
        vis.fullTimeCategories = []
        vis.totalCategories = []
        vis.categoryData = []


        vis.majorCategories.forEach(function(element) {
            vis.data.forEach(function (row) {
                if(row.Major_category === element) {
                    counterUnemployed += row.Unemployed
                    counterPartTime += row.Part_time
                    counterFullTime += row.Full_time
                    counterTotal += row.Total
                }
            })
            vis.categoryData.push({
                //"Major": element,
                "Unemployed": counterUnemployed,
                "Part Time": counterPartTime,
                "Full Time": counterFullTime,
                "Total": counterTotal
            })

            vis.unemployedCategories.push({
                "Major": element,
                "Unemployed": counterUnemployed
            })
            vis.partTimeCategories .push({
                "Major": element,
                "Part Time": counterPartTime
            })
            vis.fullTimeCategories.push({
                "Major": element,
                "Full Time": counterFullTime
            })
            vis.totalCategories.push({
                "Major": element,
                "Total": counterTotal
            })
            counterUnemployed = 0
            counterPartTime = 0
            counterFullTime = 0
            counterTotal = 0
        })

        console.log(vis.categoryData)

        console.log(vis.unemployedCategories)
        console.log(vis.partTimeCategories )
        console.log(vis.fullTimeCategories)
        console.log(vis.totalCategories)

        vis.display_data = {
            labels: vis.majorCategories,
            datasets: [
                {
                    label: "Unemployed",
                    backgroundColor: "#ADD8E6",
                    data: vis.unemployedCategories
                },
                {
                    label: "Part-Time",
                    backgroundColor: "#4c97bd",
                    data: vis.partTimeCategories
                },
                {
                    label: "Full-Time",
                    backgroundColor: "#1d4b73",
                    data: vis.fullTimeCategories
                },
                {
                    label: "Total",
                    backgroundColor: "#01243b",
                    data: vis.totalCategories
                }
            ]
        }
        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        //vis.colors = ["#ADD8E6", "#4c97bd", "#1d4b73", "#01243b"];

        // update the axes
        //vis.x.domain(vis.majorCategories.map(d => d))

        let ctx = document.getElementById("employment_diffs");

        //let myBarChart = new Chart(ctx).Bar(vis.display_data, { barValueSpacing: 20 });

        new Chart(ctx, {
            type: 'bar',
            data: vis.display_data,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                        }
                    }]
                }
            }
        });
        /*
                vis.y.domain([0,
                    d3.max(vis.categoryData, d => d.Total)]
                )
                vis.svg.select(".x-axis")
                    .call(vis.xAxis)
                    .selectAll("text")
                    .attr("transform", "rotate(-10)");
                vis.svg.select(".y-axis")
                    .call(vis.yAxis.tickFormat(d3.format('.2s')))
                vis.rect = vis.svg.selectAll("rect")
                    .data(vis.categoryData);
                vis.rect
                    .enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) {
                        return vis.x(d.state);
                    })
                    .attr("y", function (d) {
                        return vis.y(d[selectedCategory]);
                    })
                    .attr("height", function (d) {
                        return (
                            vis.height - vis.y(d[selectedCategory])
                        );
                    })
                    .attr("width", vis.x.bandwidth())
                    .attr('stroke-width', '1px')
                    .attr('stroke', 'black')
                    .attr("fill", function (d) {
                        let state = d.state;
                        let color;
                        vis.corrected.forEach(d => {
                            if (d.state === state) {
                                color = vis.colors(d[selectedCategory])
                            }
                        })
                        return color
                    })
                    .merge(vis.rect)
                vis.rect.exit().remove();
         */
    }

}