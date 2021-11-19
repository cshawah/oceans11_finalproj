// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

let boxandwhisker, scatterplot, groupedbarchart, divergingbarchart;

// (1) Load data with promises
let promises = [
    d3.csv("data/recent-grads.csv", row => {
        row.Rank = +row.Rank;
        row.Men = +row.Men;
        row.Women = +row.Women;
        row.ShareWomen = +row.ShareWomen;
        row.Total = +row.Total;
        row.Sample_size = +row.Sample_size;
        row.Median = +row.Median;
        row.P25th = +row.P25th;
        row.P75th = +row.P75th;
        row.College_jobs = +row.College_jobs;
        row.Employed = +row.Employed;
        row.Unemployed = +row.Unemployed;
        row.Unemployment_rate = +row.Unemployment_rate;
        row.Full_time = +row.Full_time;
        row.Full_time_year_round = +row.Full_time_year_round;
        row.Part_time = +row.Part_time;
        row.Low_wage_jobs = +row.Low_wage_jobs;
        row.Non_college_jobs = +row.Non_college_jobs;
        return row
    }),
];

Promise.all(promises)
    .then(function (data) {
        createVis(data[0])
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    console.log(data);
    let majorCategoryColors = [];
    let colors = ["darkred", "crimson", "orangered", "orange", "yellow",
        "greenyellow", "green", "darkgreen", "darkcyan",
        "blue", "darkslateblue", "darkblue", "navy",
        "indigo", "blueviolet", "darkorchid", "darkmagenta"]; // defined 16 colors (ROYGBIV)
    let index = 0;
    data.forEach(element => {
        if (!Object.keys(majorCategoryColors).includes(element["Major_category"]) && majorCategoryColors.length < 16) {
            majorCategoryColors[element["Major_category"]] = colors[index];
            index+=1;
        }
    });

    console.log(majorCategoryColors);

    boxandwhisker = new BoxandWhiskerVis("salary_diffs", data, majorCategoryColors);
    scatterplot = new ScatterplotVis('gender_salary_bars', data);
    groupedbarchart = new GroupedBarChart('employment_diffs', data);
  //  divergingbarchart = new DivergingBarChart('gender_diffs_bars', data);
}

function updateVisualization() {
    boxandwhisker.wrangleData();
}