// chart static params
const initial_width_ageChart = document.getElementById('ageChart').offsetWidth;
const initial_height_ageChart = document.getElementById('ageChart').offsetHeight;
const age_xLabel = 'Age';;
const age_yLabel = 'Suicides/100k pop';
const age_xPadding = 0.5;
const age_behindOpacity = 0.3;
const age_backOffset = 5;

// set the dimensions and margins of the graph
const margin_ageChart = {top: 25, right: 30, bottom: 50, left: 70},
    width_ageChart = initial_width_ageChart - margin_ageChart.left - margin_ageChart.right,
    height_ageChart = initial_height_ageChart - margin_ageChart.top - margin_ageChart.bottom;



// append the svg object to the body of the page
const svgAge = d3.select("#ageChart")
    .append("svg")
      .attr("width", initial_width_ageChart)
      .attr("height", initial_height_ageChart)
    .append("g")
      .attr("transform", "translate(" + margin_ageChart.left + "," + margin_ageChart.top + ")");  //padding
    
// add label left
const age_left_label_x = ((margin_ageChart.left/5) * 3);
const age_left_label_y = (height_ageChart/2);
svgAge.append('text')
  .attr('class', 'axis-label')
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${-age_left_label_x}, ${age_left_label_y}), rotate(-90)`) 
  .text(age_yLabel)
  
// add label bottom
const age_bottom_label_x = width_ageChart/2;
const age_bottom_label_y = height_ageChart + ((margin_ageChart.bottom/6)*5);
svgAge.append('text')
  .attr('class', 'axis-label')
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${age_bottom_label_x},${age_bottom_label_y})`) //to put on bottom
  .text(age_xLabel)



