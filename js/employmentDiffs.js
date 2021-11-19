class EmploymentDiff {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.display_data = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 30, left: 40};

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

        // Console for sanity
        // console.log(vis.majorCategories)

        // Get the individual data
        let counterUnemployed = 0
        let counterPartTime = 0
        let counterFullTime = 0
        let counterTotal = 0
        vis.unemployedCategories = [];
        vis.partTimeCategories = []
        vis.fullTimeCategories = []
        vis.totalCategories = []


        vis.majorCategories.forEach(function(element) {
            vis.data.forEach(function (row) {
                if(row.Major_category === element) {
                    counterUnemployed += row.Unemployed
                    counterPartTime += row.Part_time
                    counterFullTime += row.Full_time
                    counterTotal += row.Total
                }
            })

            vis.unemployedCategories.push({
                counterUnemployed
            })
            vis.partTimeCategories .push({
                counterPartTime
            })
            vis.fullTimeCategories.push({
                counterFullTime
            })
            vis.totalCategories.push({
                counterTotal
            })
            counterUnemployed = 0
            counterPartTime = 0
            counterFullTime = 0
            counterTotal = 0
        })

        // Makes sure that the objects pushed into the arrays previously are just numbers
        vis.unemployedCategories = vis.unemployedCategories.map(function(d)
        {
            return Object.values(d)[0]
        })
        vis.partTimeCategories = vis.partTimeCategories.map(function(d)
        {
            return Object.values(d)[0]
        })
        vis.fullTimeCategories = vis.fullTimeCategories.map(function(d)
        {
            return Object.values(d)[0]
        })
        vis.totalCategories = vis.totalCategories.map(function(d)
        {
            return Object.values(d)[0]
        })

        // Console for sanity
        // console.log(vis.unemployedCategories)
        // console.log(vis.partTimeCategories)
        // console.log(vis.fullTimeCategories)
        // console.log(vis.totalCategories)

        // Loads all of this data into the final dataset needed for grouped bar charts
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

        let ctx = document.getElementById("employment_diffs");

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
    }

}
