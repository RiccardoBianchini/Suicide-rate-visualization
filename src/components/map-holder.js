
const width = document.getElementById('map-holder').offsetWidth;
const height = document.getElementById('map-holder').offsetHeight;

var svg = d3.select("#map-holder")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin slice")
      .attr("viewBox", "0 0 "+width+" "+height)
      .classed("svg-content", true);

var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(80)
    .center([0,15])
    .translate([width/2, (height / 2)+10]);


// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000]) //, 500000000])
  .range(d3.schemeReds[5]);

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
//.defer(d3.csv, '../../data/data.csv', function(d){
  //data.set(d.country, +d.suicides_pop)
//})
  .await(ready);


function ready(error, topo) {
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
    }