if (typeof fetch !== 'function') {
  global.fetch = require('node-fetch');
}
let fs = require("fs")
let d3 = require("d3");
let d3h = require("d3-hexbin");

let tf = d3.timeFormat("%Y-%m-%d-%H")
let datadir = process.argv[2] || "data-" + tf(new Date())
let id = "ids-all-" + datadir.slice(5)
console.log("id", id)

dir = "output"
try {
  fs.mkdirSync(dir)
} catch(e) {}

// let id = "ids-full"
// let ids = JSON.parse(fs.readFileSync("ids.json").toString())
let sensors = JSON.parse(fs.readFileSync("input/air.json").toString())
    .filter(d => d.Type == 0) // Outside

let historical = d3.csvParse(fs.readFileSync(dir + "/" + id + "-out.csv").toString())
// let grouped = d3.group(historical, d => d.id, d => d.created_at, d => d.type)
// let byday = d3.group(historical, d => d.created_at, d => d.id, d => d.type)
let byidbyhour = d3.group(historical, d => +d.id, d => +d.created_at, d => d.type)
let fullsensors = Array.from(byidbyhour).filter(d => d[1].size > 260).map(d => d[0])

// console.log("WHAT?", byidbyhour.get(28667).get(1597366800))

dayExtent = d3.extent(historical, d => new Date(d.created_at*1000))
let days = d3.timeHour
    .range(new Date(dayExtent[0]), new Date(dayExtent[1]))
    .map(d => +d/1000)


console.log(`${historical.length} records`)
console.log("number of full sensors", fullsensors.length)

let width = 955
let height = 500
// from the notebook, fit to the counties we zoomed on
let projection = d3.geoAlbersUsa()
    .scale(25355.18980109889)
    .translate([9243.947905741905, 1134.7022259542728])

let hexbin = d3h.hexbin().extent([[0, 0], [width, height]]).radius(10)

const data = sensors.map(d => {
  const p = projection([d.Lon, d.Lat]);
  if(p) {
    p.pm_1 = d.pm_1
    p.ID = d.ID
    p.Label = d.Label
    // if(p[0] < 0 || p[0] > width) return
    // if(p[1] < 0 || p[1] > height) return
    return p
  }
}).filter(d => !!d);

let hexdata = Object.assign(
    hexbin(data)
    // .map(d => (d.pm_1 = d3.median(d, d => d.pm_1), d))
    .map(arr => {
      let ids = arr.map(d => {
        return d.ID
      }).filter(id => {
        return byidbyhour.get(id) && byidbyhour.get(id).size > 0
      })

      // get the median value for each field for the ids in this bin
      // for each day
      let values = days.map(day => {
        let pm1 = ids.map(id => {
          let d = byidbyhour.get(id).get(day)
          if(d&&d.get("pm1")) return d.get("pm1")[0].value
        }).filter(d => !!d)
        let p03 = ids.map(id => {
          let d = byidbyhour.get(id).get(day)
          if(d&&d.get("p03")) return d.get("p03")[0].value
        }).filter(d => !!d)

        return {t: day, pm1: d3.median(pm1), p03: d3.median(p03)}

      }).filter(d => d.pm1 && d.p03)

      let inv = projection.invert([arr.x, arr.y])
      return {
        // x: arr.x,
        // y: arr.y,
        lng: inv[0],
        lat: inv[1], 
        ids,
        days: values
      }
    })
    .sort((a, b) => b.length - a.length),
    {title: "foo"}
);

let outfile = dir + "/" + id +"-hexbins.json"
fs.writeFileSync(outfile, JSON.stringify(hexdata))
console.log("done", outfile)