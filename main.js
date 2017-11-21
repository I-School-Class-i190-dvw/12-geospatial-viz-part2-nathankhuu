console.log('hello world!');

var width = Math.max(960, window.innerWidth), 
		height = Math.max(500, window.innerHeight);

var pi = Math.pi
		tau = 2 * pi;

// need to use web mercator projection typically for tiles
var projection = d3.geoMercator()
	.scale(1 / tau)
	.translate([0, 0]);

// create path generator, use the d3 geoMercator projection when drawing paths
var path = d3.geoPath()
	.projection(projection);

var tile = d3.tile()
	.size([width, height]);

var zoom = d3.zoom()
	.scaleExtent([
			1 << 11, // minimum zoom level
			1 << 24, // maximum zoom level
		])
	.on('zoom', zoomed);

// earthquake of largest magnitude will have radius of 10
// lowest will have radius of 0
var radius = d3.scaleSqrt().range([0, 10]);

var svg = d3.select('body')
	.append('svg')
	.attr('width', width)
	.attr('height', height)

var raster = svg.append('g');

var vector = svg.append('path');

d3.json('data/earthquakes_4326_cali.geojson', function(error, geojson) {
	if (error) throw error;

	console.log(geojson);
});

function zoomed() {}

























