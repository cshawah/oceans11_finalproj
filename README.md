# CS171 Ocean's 11 Final Project: Major Differences
Team Members: Makayla Nyambura, Chloe Shawah, Marika Thompson, and Tito Yak

Project Website: https://cshawah.github.io/oceans11_finalproj/

Screencast Walkthrough: **url**

## Overview

This repository contains our final project, "Major Differences", an interactive visualization data story about recent US college graduate demographics.

## Repository Structure

All of the html is contained in the index.html file. 

### Directories

#### Data
Contains the csv file of the dataset we worked with. The file was downloaded from this page on Kaggle: [FiveThirtyEight College Majors Dataset](https://www.kaggle.com/fivethirtyeight/fivethirtyeight-college-majors-dataset?select=recent-grads.csv). 
Note that the dataset's individual entries are majors, not individual students, and therefore, the entries themselves are aggregates. To read more about the dataset, please visit the above link on Kaggle. 

#### JS
Contains all of the javascript files for the visualizations. 
- main.js: data is loaded in and all visualizations are initialized 
- innovativeVis.js: innovative visualization (Distribution of Major Categories Among Recent Graduates) class is defined
- divergingbarchart.js: diverging bar chart visualization (Gender Differences by Major Category) class is defined
- employmentDiffs.js: grouped bar chart visualization (Employment Differences by Major Category) class is defined
- boxandwhisker.js: box and whisker without the whiskers visualization (Recent Graduate Income Ranges) class is defined
- scatterplotVis.js: scatter plot visualization (Gender Distribution Versus Median Income) class is defined

#### CSS
Contains the css file that styles the page.

#### Fonts, Img
Contains the fonts and image asset files.

