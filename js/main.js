console.log("let's get started!")

let scatterplot;

d3.csv("data/recent-grads.csv").then(function (data) {
    initMainPage(data)
})
    .catch(function (err) {
        console.log(err)
    });


// initMainPage
function initMainPage(dataArray) {

    console.log('check out the data', dataArray);

    // init scatterplot
    scatterplot = new ScatterplotVis('gender_salary_bars', dataArray);
}