// width and weight of the whole container
const widthMap = document.getElementById('map-holder').offsetWidth;
const heightMap = document.getElementById('map-holder').offsetHeight;

// create SVG
const map = d3.select( '#map-holder' )
  .append( "svg" )
  .attr( "width", '100%' )
  .attr( "height", '100%' )
  .attr('viewBox', ("0 0 "+ widthMap + " " + heightMap));

// create path and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
  //.scale(100, 30)
  //.center([0, 10])
  .scale(125 , 70)
  .center([0, 25])
  .translate([widthMap/2, heightMap/2]);


function makeMap(colorScale) {
  // setting parameters
  const dataYearLoaded = controller.dataAll;
  const dataFilteredLoaded = controller.dataFiltered;

  const dataYear = aggregateDataByCountry(dataYearLoaded);
  const dataFiltered = aggregateDataByCountry(dataFilteredLoaded);
  const colorLabel = 'Suicide ratio';
  
  const countryNames = d => d.key;
  const suicidesValue = d => d.value.suicides_pop;

  const max_val_year_x = d3.max(dataYear, suicidesValue); 
  const max_val_filtered_x = d3.max(dataFiltered, suicidesValue); 

  
  // mapping (country, #suicides) in data
  const data = d3.map();
  for (var i = 0; i<dataFiltered.length; i++){
    data.set(dataFiltered[i].key, +dataFiltered[i].value.suicides_pop);
  }
        

  // legend
  /*const g = map.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20, 100)");
  const legend = d3.legendColor().scale(colorScale)
    .labelFormat(d3.format(".0f"))
    .title(colorLabel);
  map.select(".legendThreshold")
    .call(legend)
      .attr("class","axis-text");*/

  const tooltip = d3.select("#map-holder")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip-scatter");
  
  // zoom and pan
  let zoom = d3.zoom()
   .scaleExtent([1, 2.5])
   .translateExtent([[-widthMap/10, -heightMap/10], [widthMap + widthMap/10, heightMap + heightMap/10]])
   .on('zoom', () => {
       map.attr('transform', d3.event.transform)
   });
   d3.select('#map-holder').call(zoom);

  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(json) {

    // Draw the map
    map.append("g")
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        if(typeof(data.get(d.properties.name)) === "undefined"){
          d.total = 'Missing data';
          return '#DCDCDC'; 
        }
        else{
          d.total = data.get(d.properties.name);
          return colorScale(d.total);
        }        
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      // adding event on mouseover
      .on("mouseover", function (d) {
        d3.select(this)
          .style("fill", '#80ced6')
          .style("cursor", "pointer");
        
        tooltip
          .style("opacity", 1)
          .html(
            '<b>Country:</b> ' + d.properties.name + 
            '<br><b>Suicide ratio:</b> ' + d.total)
          .style("left", (d3.mouse(this)[0]) + "px")   
          .style("top", (d3.mouse(this)[1]) + "px");
      })
      // adding event on mousemove
      .on("mousemove", function (d) {
        tooltip
          .style("opacity", 1)
          .html(
            '<b>Country:</b> ' + d.properties.name + 
            '<br><b>Suicide ratio:</b> ' + d.total)
          .style("left", (d3.mouse(this)[0]) + "px")   
          .style("top", (d3.mouse(this)[1]) + "px");
      })
      // adding event on mouseout
      .on("mouseout", function(d){
        d3.select(this)
          .style("fill", (d)=>{
            if(d.total === "Missing data") 
              return '#DCDCDC';
            else{
              return colorScale(d.total);
            }
          });	
        tooltip
          .transition()
          .style("opacity", 0);
      })
  });
}
