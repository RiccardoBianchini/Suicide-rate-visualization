// Width and Height of the box
const initial_width_sexChart = document.getElementById('sexChart').offsetWidth;
const initial_height_sexChart = document.getElementById('sexChart').offsetHeight;

// set the dimensions and margins of the graph
const margin_sexChart = {top: 25, right: 30, bottom: 50, left: 70},
    width_sexChart = initial_width_sexChart - margin_sexChart.left - margin_sexChart.right,
    height_sexChart = initial_height_sexChart - margin_sexChart.top - margin_sexChart.bottom;

// append the svg object to the body of the page
const svgSex = d3.select("#sexChart")
    .append("svg")
      .attr("width", initial_width_sexChart)
      .attr("height", initial_height_sexChart)
    .append("g")
      .attr("transform", "translate(" + margin_sexChart.left + "," + margin_sexChart.top + ")");  //padding

// label names
const sex_xLabel = 'Sex';;
const sex_yLabel = 'Suicide ratio';
      
// add label left
const sex_left_label_x = ((margin_sexChart.left/5) * 3);
const sex_left_label_y = (height_sexChart/2);
svgSex.append('text')
  .attr('class', 'axis-label')
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${-sex_left_label_x}, ${sex_left_label_y}), rotate(-90)`) 
  .text(sex_yLabel)
  
// add label bottom
const sex_bottom_label_x = width_sexChart/2;
const sex_bottom_label_y = height_sexChart + ((margin_sexChart.bottom/6)*5) ;
svgSex.append('text')
  .attr('class', 'axis-label')
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${sex_bottom_label_x},${sex_bottom_label_y})`) //to put on bottom
  .text(sex_xLabel)
    

function makeSexChart() {
  const dataYearLoaded = controller.getDataYear();
  const dataFilteredLoaded = controller.getDataFiltered();

  const dataYear = aggregateDataBySex(dataYearLoaded);
  const dataFiltered = aggregateDataBySex(dataFilteredLoaded);
  const colorData = aggregateDataByCountry(dataFilteredLoaded);

  // sort classes
  dataYear.sort((a, b) => d3.descending(a.key, b.key));
  dataFiltered.sort((a, b) => d3.descending(a.key, b.key));

  // set params
  const xValue = d => d.key;
  const yValue = d => d.value.suicides_pop;
  const xPadding = 0.6;
  const behindOpacity = 0.3;
  const backOffset = 5;
  const colorArray = controller.suicideColorScale;


  // add some padding on top yAxis (1/10 more than max between dataYear and dataFiltered)
  const max_val_year = d3.max(dataYear, yValue) 
  const max_val_filtered = d3.max(dataFiltered, yValue) 
  const max_val = (max_val_year >  max_val_filtered) ? max_val_year : max_val_filtered;
  const domain_max = parseInt(max_val) + parseInt(max_val/10) 

  // set scales
  const xScale = d3.scaleBand()
    .domain(dataYear.map(xValue))
    .range([ 0, width_sexChart ])
    .padding(xPadding);

  const yScale = d3.scaleLinear()
    .domain([0, domain_max ])
    .range([ height_sexChart, 0])
    .nice();

  const colorScale = d3.scaleQuantize()
    .domain([0, d3.max(colorData,yValue)])
    .range(colorArray);

  // axis setup
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(AxisTickFormat);


  // add X axis
  svgSex.append("g")
    .attr("transform", "translate(0," + height_sexChart + ")") //to put on bottom
    .call(xAxis)
    .selectAll("text")  //text color
      .attr("class","axis-text");

  // add Y axis
  svgSex.append("g")
   .call(yAxis)
   .selectAll("text")
       .attr("class","axis-text");


  // add Grid 
  svgSex.append('g')
    .attr('class', 'grid-barchart')
    .call(d3.axisLeft()
      .scale(yScale)
      .tickSize(-width_sexChart, 0, 0)
      .tickFormat(''))


  // if filters are applied show also dataYear behind with low opacity
  if (controller.isDataFiltered == true) {
    svgSex.selectAll()
      .data(dataYear)
      .enter()
      .append('g')
      .append('rect')
      .attr('class', 'sexBars-back')
      .attr('x', (d) => xScale(xValue(d)) + backOffset)
      .attr('y', (d) => yScale(yValue(d)))
      .attr('height', (d) => height_sexChart - yScale(yValue(d)))
      .attr('width', xScale.bandwidth() + backOffset)
      .style("fill",  (d) => colorScale(yValue(d)))
      .style("stroke", "black") 
      .attr('opacity', behindOpacity)
  } 


  // add filtered bars
  const barGroups =  svgSex.selectAll()
    .data(dataFiltered)
    .enter()
    .append('g')
    
  barGroups
    .append('rect')
    .attr('class', 'sexBars-filtered')
    .attr('x', (d) => xScale(xValue(d)))
    .attr('y', (d) => yScale(yValue(d)))
    .attr('height', (d) => height_sexChart - yScale(yValue(d)))
    .attr('width', xScale.bandwidth())
    .style("fill",  (d) => colorScale(yValue(d)))
    .on('mouseenter', function (actual, i) {
      // all original values on bars transparent
      d3.selectAll('.bar-value-sex')  
        .attr('opacity', 0)

      // enlarge bar
      d3.select(this)
        .transition()
        .duration(300)
        .attr('x', (d) => xScale(xValue(d)) - 5)
        .attr('width', xScale.bandwidth() + 10)
        .style("cursor", "pointer");

      // show value on bar
      barGroups.append('text')
        .attr('class', 'divergence-sex')  //needed to remove on mouseleave
        .attr('x', (d) => xScale(xValue(d)) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(yValue(d)) + 30)
        .attr('text-anchor', 'middle')
        .text((d, idx) => {
          const divergence = (yValue(d) - actual.value.suicides_pop).toFixed(1)
          
          let text = ''
          if (divergence > 0) text += '+'
          text += `${divergence}`

          return idx !== i ? text : '';
        })

    })
    .on('mouseleave', function () {
      d3.selectAll('.bar-value-sex')
        .attr('opacity', 1)

      // bar to normal size
      d3.select(this)
        .transition()
        .duration(300)
        .attr('x', (d) => xScale(xValue(d)))
        .attr('width', xScale.bandwidth())

      // remove divergence value
      svgSex.selectAll('.divergence-sex').remove()
    })

  // add values on bars
  barGroups 
    .append('text')
    .attr('class', 'bar-value-sex')
    .attr('x', (d) => xScale(xValue(d)) + xScale.bandwidth() / 2)
    .attr('y', (d) => yScale(yValue(d)) + 30)
    .attr('text-anchor', 'middle')
    .text((d) => `${yValue(d)}`)

  // add avg line
  const avg_value = Math.round((d3.sum(dataFiltered, (d) => yValue(d))) / dataFiltered.length);
  const avg_value_scaled = yScale(avg_value)
  svgSex.append("line")
    .attr('class', 'avg-line')
    .attr("x1", 0)
    .attr("x2", width_sexChart+2)
    .attr("y1", avg_value_scaled)
    .attr("y2", avg_value_scaled)
  
  // avg value print
  svgSex.append("text")
    .attr('class', 'avg-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${width_sexChart-15}, ${avg_value_scaled-10})`) 
    .text(avg_value)

}

// A function that update the chart
function sexChartUpateYear() {
  svgSex.selectAll('.axis-text').remove()
  svgSex.selectAll('.tick').remove()
  svgSex.selectAll('.grid-barchart').remove()
  svgSex.selectAll('.sexBars-back').remove()
  svgSex.selectAll('.sexBars-filtered').remove()
  svgSex.selectAll('.bar-value-sex').remove()
  svgSex.selectAll('.avg-line').remove()
  svgSex.selectAll('.avg-label').remove()
  makeSexChart()
}


// draw graph on dataloaded
controller.addListener('yearChanged', function (e) {
  sexChartUpateYear();
});

// draw graph on dataloaded
controller.addListener('dataLoaded', function (e) {
  makeSexChart();
});
