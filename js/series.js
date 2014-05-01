// Plug in the JSON from wtid.json here
//
var wtid;
var wtid_series_cached;

var computed_source = {};

function to_object(series) {
  var ret = {};
  for (var i = 0; i < series.length; i++) {
    ret[series[i][0]] = series[i][1];
  }
  return ret;
}

function fetch_computed_data(country, category) {
  var ret = [];
  if (category.match(/\/ bottom 90% income/)) {
    var source = to_object(fetch_data(country, computed_source[category]));
    var bot90 = to_object(fetch_data(country, 'Bottom 90% average income'));

    var years = Object.keys(source).sort();
    for (var i = 0; i < years.length; i++) {
      var year = years[i];
      if (year in bot90) {
        ret.push([year, source[year] / bot90[year]]);
      }
    }
  }
  return ret;
}

/**
 * Returns a boolean for whether the given country has data for the given category.
 *
 * @param country - the country name
 * @param category - the category name
 * @returns {boolean}
 */
function hasData(country, category) {
  return fetch_data(country, category).length > 0;
}

//
// fetch_data
// Example:
// fetch_data('United States', 'Top 1% income share')
//
function fetch_data(country, category) {
  var combined = {}, variants, i;
  for (i = 0; i < wtid_series().length; i++) {
    var series = wtid_series()[i];
    if (series.category == category) {
      variants = series.variants;
      break;
    }
  }
  if (!variants) {
    return fetch_computed_data(country, category);
  }

  for (i = 0; i < variants.length; i++) {
    var series = wtid.countries[country][variants[i]];
    if (series) {
      for (j = 0; j < series.length; j++) {
        var year = series[j][0], value = series[j][1];
        if (!(year in combined)) {
          combined[year] = value;
        }
      }
    }
  }
  var ret = [];
  var years = Object.keys(combined).sort();
  for (i = 0; i < years.length; i++) {
    ret.push([years[i], combined[years[i]]]);
  }
  return ret;
}

function wtid_series() {
  if (!wtid_series_cached) {
    wtid_series_cached = [];
    for (var i = 0; i < wtid.series.length; i++) {
      var s = wtid.series[i];
      wtid_series_cached.push(s);
      if (s.category.match(/ average income/)) {
        var computed_category = s.category.replace(' average income', ' / bottom 90% income');
        computed_source[computed_category] = s.category;
        wtid_series_cached.push({category : computed_category});
      }
    }
  }
  return wtid_series_cached;
}

var chart;

// Example:
//
//  draw_chart([{country:'United States', category:'Top 1% income share', color:'green'},
//              {country:'United States', category:'Top 10% income share', color:'blue'}]);
//
// Assumes chart lives in div ID 'chart'

function draw_chart(series) {
  var table = [['year']];
  var years = {};
  var colors = [];
  var col = 0;
  //console.log('draw chart new');
  //console.log(series);

  for (var i = 0; i < series.length; i++) {
    var country = series[i].country;
    var category = series[i].category;
    if (series[i].color) {
      colors.push(series[i].color);
    }
    var data = fetch_data(country, category);

    // skip this country if it has no data for the given category
    if (data.length > 0) {
      table[0][col + 1] = country + ': ' + category;
      for (var k = 0; k < data.length; k++) {
        var year = data[k][0], value = data[k][1];
        if (!(year in years)) {
          years[year] = {};
        }
        years[year][col] = value;
      }
      col += 1;
    }
  }

  var yearnos = Object.keys(years).sort();
  for (var i = 0; i < yearnos.length; i++) {
    var year = yearnos[i];
    var row = [year];
    for (var j = 0; j < col; j++) {
      row.push(years[year][j]);
    }
    table.push(row);
  }

  //console.log('col is ' + col);

  if (col) {
    $('#chart').show();

    if (!chart) {
      chart = new google.visualization.LineChart(document.getElementById('chart'));
    }
    chart.draw(google.visualization.arrayToDataTable(table), colors.length ? {colors : colors} : null);
  } else {
    $('#chart').hide();
  }
}
