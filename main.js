console.log('hello world!');

// set width and height
// let is resize if larger than 960 and 500
var width = Math.max(960, window.innerWidth), 
		height = Math.max(500, window.innerHeight);

// set pi and tau for calculations to use later
var pi = Math.PI,
		tau = 2 * pi;

// need to use web mercator projection typically for tiles
var projection = d3.geoMercator()
	.scale(1 / tau)
	.translate([0, 0]);

// create path generator, use the d3 geoMercator projection when drawing paths
var path = d3.geoPath()
	.projection(projection);

// create tile generator with size
var tile = d3.tile()
	.size([width, height]);

// create zoom and set zoom levels
var zoom = d3.zoom()
	.scaleExtent([
			1 << 11, // minimum zoom level
			1 << 24, // maximum zoom level
		])
	.on('zoom', zoomed);

// earthquake of largest magnitude will have radius of 10
// lowest will have radius of 0
var radius = d3.scaleSqrt().range([0, 10]);

// create svg element and set width and height
var svg = d3.select('body')
	.append('svg')
	.attr('width', width)
	.attr('height', height)

// create group element for raster
var raster = svg.append('g');

// render a single path
// var vector = svg.append('path');

// render multiple paths
var vector = svg.selectAll('path');

// load data from geojson file
d3.json('data/earthquakes_4326_cali.geojson', function(error, geojson) {

	// throw an error if loading doesn't work
	if (error) throw error;

	console.log(geojson);

	// set the domain of the radius scale
	radius.domain([0, d3.max(geojson.features, function(d) {return d.properties.mag;})]);

	// set the radius of the path
	path.pointRadius(function(d) {
		return radius(d.properties.mag);
	});

	// draw circles and mouseover utility
	vector = vector
		.data(geojson.features)
		.enter().append('path')
		.attr('d', path)
		.on('mouseover', function(d) { console.log(d); });

	var center = projection([-119.665, 37.414]);

	// call zoom to change width and height by half
	// and change the scale
	svg.call(zoom)
		.call(
			zoom.transform, 
			d3.zoomIdentity
				.translate(width / 2, height / 2)
				.scale(1 << 14)
				.translate(-center[0], -center[1])
		);

});

// function for zooming
function zoomed() {

	var transform = d3.event.transform;

	// setting up tiles computation
	var tiles = tile
		.scale(transform.k)
		.translate([transform.x, transform.y])
		();

	console.log(transform.x, transform.y, transform.k);

	// use calculations to rescale projection
	projection
		.scale(transform.k / tau)
		.translate([transform.x, transform.y])

	vector.attr('d', path);

  // going through general update pattern
  // create images from data
  var image = raster
    .attr('transform', stringify(tiles.scale, tiles.translate))
    .selectAll('image')
    .data(tiles, function(d) { return d; });

  // remove old images
	image.exit().remove();

	// add new images and set correct properties
	image.enter().append('image')
		.attr('xlink:href', function(d) {
			return 'http://' + 'abc'[d[1] % 3] + '.basemaps.cartocdn.com/rastertiles/voyager/' +
				d[2] + "/" + d[0] + "/" + d[1] + ".png"; 
		})
		.attr('x', function(d) {return d[0] * 256; }) // multiply by size of tile
		.attr('y', function(d) {return d[1] * 256; })
		.attr('width', 256)
		.attr('height', 256);
}

// this function with help us create a string for translate when we want to 
// pass in a scale and translate points
function stringify(scale, translate) {
	var k = scale / 256,
			r = scale % 1 ? Number : Math.round;
	return `translate(${r(translate[0] * scale)}, ${r(translate[1] * scale)}) scale(${k})`;
}

























