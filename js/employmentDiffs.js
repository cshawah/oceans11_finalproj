class EmploymentDiff {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.colors1 = ["rgba(173,255,47, 0.3)", "rgba(0,100,0,0.3)", "rgba(0,0,255,0.3)",
            "rgba(220, 20, 60, 0.3)", "rgba(138,43,226, 0.3)", "rgba(255,255,0, 0.3)",
            "rgba(72,61,139, 0.3)", "rgba(139,0,0,0.3)", "rgba(0, 139, 139, 0.3)",
            "rgba(0,0,139,0.3)", "rgba(0, 255, 127, 0.3)", "rgba(218,112,214,0.3)",
            "rgba(255,165,0,0.3)", "rgba(255,69,0,0.3)", "rgba(75,0,130,0.3)", "rgba(135, 206, 250, 0.3)" , "rgba(139, 0, 139, 0.3)"];
        this.colors2 = ["rgba(173,255,47, 0.6)", "rgba(0,100,0,0.6)", "rgba(0,0,255,0.6)",
            "rgba(220, 20, 60, 0.6)", "rgba(138,43,226, 0.6)", "rgba(255,255,0, 0.6)",
            "rgba(72,61,139, 0.6)", "rgba(139,0,0,0.6)", "rgba(0, 139, 139, 0.6)",
            "rgba(0,0,139,0.6)", "rgba(0, 255, 127, 0.6)", "rgba(218,112,214,0.6)",
            "rgba(255,165,0,0.6)", "rgba(255,69,0,0.6)", "rgba(75,0,130,0.6)", "rgba(135, 206, 250, 0.6)", "rgba(139, 0, 139, 0.6)"];
        this.colors3 = ["greenyellow", "green", "blue",
                        "crimson", "blueviolet", "yellow",
                        "darkslateblue", "darkred", "darkcyan",
                        "darkblue", "springgreen",  "orchid",
                        "orange",  "orangered","indigo","lightskyblue"]
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

        let counterUnemployed = 0
        let counterPartTime = 0
        let counterFullTime = 0
        let counterTotal = 0
        vis.unemployedCategories = []
        vis.partTimeCategories = []
        vis.fullTimeCategories = []


        vis.majorCategories.forEach(function(element) {
            vis.data.forEach(function (row) {
                if(row.Major_category === element) {
                    counterUnemployed += row.Unemployed
                    counterPartTime += row.Part_time
                    counterFullTime += row.Full_time
                }
            })

            counterTotal = counterUnemployed + counterFullTime + counterPartTime

            counterUnemployed = (counterUnemployed / counterTotal) * 100
            counterPartTime =  (counterPartTime/counterTotal) * 100
            counterFullTime =  (counterFullTime/counterTotal) * 100

            vis.unemployedCategories.push({
                counterUnemployed
            })
            vis.partTimeCategories .push({
                counterPartTime
            })
            vis.fullTimeCategories.push({
                counterFullTime
            })

            counterUnemployed = 0
            counterPartTime = 0
            counterFullTime = 0
            counterTotal = 0
        })

        // Makes sure that the objects pushed into the arrays previously are just numbers
        vis.unemployedCategories = vis.unemployedCategories.map(function(d)
        {
            return Object.values(d)[0].toFixed(2)
        })
        vis.partTimeCategories = vis.partTimeCategories.map(function(d)
        {
            return Object.values(d)[0].toFixed(2)
        })
        vis.fullTimeCategories = vis.fullTimeCategories.map(function(d)
        {
            return Object.values(d)[0].toFixed(2)
        })

        // Console for sanity
        // console.log(vis.unemployedCategories)
        // console.log(vis.partTimeCategories)
        // console.log(vis.fullTimeCategories)

        // Loads all of this data into the final dataset needed for grouped bar charts
        vis.display_data = {
            labels: vis.majorCategories,
            datasets: [
                {
                    label: "Unemployed",
                    backgroundColor: vis.colors1,
                    borderWidth: 1,
                    data: vis.unemployedCategories
                },
                {
                    label: "Part Time",
                    backgroundColor: vis.colors2,
                    borderWidth: 2,
                    data: vis.partTimeCategories
                },
                {
                    label: "Full Time",
                    backgroundColor: vis.colors3,
                    borderWidth: 3,
                    data: vis.fullTimeCategories
                }
            ]
        }
        // console.log(vis.display_data)
        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        /*
            Code taken from:
            https://stackoverflow.com/questions/44352402/how-to-change-the-color-of-legend-in-chartjs-and-be-able-to-add-one-more-legend
         */
        Chart.plugins.register({
            beforeDraw: function(c) {
                var legends = c.legend.legendItems;
                legends[0].fillStyle = '#D3D3D3';
                legends[1].fillStyle = '#A9A9A9';
                legends[2].fillStyle = '#808080';
            }
        });

        let ctx = document.getElementById("employment_diffs");

        new Chart(ctx, {
            type: 'bar',
            data: vis.display_data,
            options: {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display:false
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function (value) {
                                return (value + '%'); // convert it to percentage
                            }
                        },
                        gridLines: {
                            display:false
                        }
                    }]
                }
            }
        });
    }

}