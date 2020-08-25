# PurpleAir Historical Data

This repo is a prototype for scraping and processing the [PurpleAir]() air quality data for the Bay Area.

It's currently focused on trying to get hourly historical records for sensors in the Bay Area, and then aggregating them spatially with a hexbin. See this notebook for related development:
https://observablehq.com/@enjalot/air-quality-explorations

## snapshot.js
```
node snapshot.js
```

## scrape.js
This will download the detailed info for each station based on the snapshot of stations 
```
node scrape.js
```
This will output into a folder with the date and hour timestamp like `data-2020-08-25-12`

## scrape-history.js
This is the most annoying part, downloading the historical csv per station 100 at a time to avoid rate limiting. Could use help doing this more robustly.

```
node scrape-history.js data-2020-08-25-12
```

## combine-all.js
make a single csv file for all the stations

```
node combine-all.js data-2020-08-25-12
```

## hexbin.js
compute a hexbin thats based on a scale centered on the Bay Area to aggregate the station and save space.

```
node hexbin.js data-2020-08-25-12
```