var data = require('./wtid-2014-04-25');

var desiredSeriesToVariantsMap = {
   "Top 1% income share" : [],
   "Top 10% income share" : []
};

// Some countries have a variant of the desired series.  So, first we need to find out what all the variants are
data['series'].forEach(function(seriesObj) {
   var seriesName = seriesObj['category'];
   if (seriesName in desiredSeriesToVariantsMap) {
      desiredSeriesToVariantsMap[seriesName] = seriesObj['variants'];
   }
});
//console.log(JSON.stringify(desiredSeriesToVariantsMap, null, 3));

// Now that we know all the possible variants, iterate over each country and try to find the best series variant for
// each of the series we want.  Here, "best" is defined as "has the most data points"

var findBestSeries = function(country, seriesVariants) {
   var best = {
      "name" : null,
      "data" : []
   };

   seriesVariants.forEach(function(variantName) {
      var variantData = country[variantName];
      if (variantData && variantData.length > best['data'].length) {
         best['name'] = variantName;
         best['data'] = variantData;
      }
   });
   return (best['name'] != null) ? best : null;
};

var countryData = {};
for (var countryName in data['countries']) {
   countryData[countryName] = {};
   var country = data['countries'][countryName];
   for (var desiredSeriesName in desiredSeriesToVariantsMap) {
      countryData[countryName][desiredSeriesName] = findBestSeries(country, desiredSeriesToVariantsMap[desiredSeriesName]);
   }
}
console.log(JSON.stringify(countryData));