var programOptions = require('commander');
var packageJson = require('./package.json');

var data = require('./wtid-2014-04-25-filtered-with-bottom-90');

var DATASETS = [
  "Top 1% income share",
  "Top 10% income share",
  "Bottom 90% average income"
];

programOptions
    .version(packageJson.version)
    .option('--data <DATASET_INDEX>', "0 for 'Top 1% income share', 1 for 'Top 10% income share', 2 for 'Bottom 90% average income'")
    .parse(process.argv);

if (programOptions['data']) {
  var datasetIndex = parseInt(programOptions['data']);
  if (isNaN(datasetIndex) || datasetIndex < 0 || datasetIndex >= DATASETS.length) {
    console.log("ERROR: invalid data set index '" + programOptions['data'] + "'.  Must be an integer between 0 and " + (DATASETS.length - 1));
  } else {
    var datasetName = DATASETS[datasetIndex];

    // iterate over the countries in sorted order
    var yearsFound = {};
    var countryToDataMap = {};
    Object.keys(data).sort().forEach(function(countryName) {
      if (datasetName in data[countryName] &&
          data[countryName][datasetName] &&
          data[countryName][datasetName].data) {
        var yearToValueMap = {};
        var dataForCountry = data[countryName][datasetName].data;
        dataForCountry.forEach(function(yearValuePair) {
          var year = yearValuePair[0];
          var value = yearValuePair[1];
          yearToValueMap[year] = value;

          // remember that we saw this year
          yearsFound[year] = true;
        });
        countryToDataMap[countryName] = yearToValueMap;
      }
    });

    // now write the CSV...
    var yearsFoundSorted = Object.keys(yearsFound).sort();
    var header = ["country_name"].concat(yearsFoundSorted).join(',');
    console.log(header);
    Object.keys(countryToDataMap).sort().forEach(function(countryName) {
      var recordData = countryToDataMap[countryName];
      var record = ([countryName].concat(yearsFoundSorted.map(function(year){
        if (year in recordData) {
          return recordData[year];
        }
        return '';
      }))).join(',');
      console.log(record);
    });
  }
} else {
  console.log("No data set index defined.  See usage.");
}

