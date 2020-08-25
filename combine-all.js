if (typeof fetch !== 'function') {
  global.fetch = require('node-fetch');
}
let fs = require("fs")
let d3 = require("d3");

let tf = d3.timeFormat("%Y-%m-%d-%H")
let dir = process.argv[2] || "data-" + tf(new Date())
console.log("dir", dir)
let ts = dir.slice(5)
// let ids = JSON.parse(fs.readFileSync("ids.json").toString())

let id = "ids-all"
let ids = JSON.parse(fs.readFileSync("input/air.json").toString())
    .filter(d => d.Type == 0) // Outside
    .map(d => d.ID)

// let id = "ids-full"
// let historical = d3.csvParse(fs.readFileSync("output/ids-all-out.csv").toString())
// let byidbyhour = d3.group(historical, d => d.id, d => d.created_at, d => d.type)
// let ids = Array.from(byidbyhour).filter(d => d[1].size > 260).map(d => d[0])

console.log(`${ids.length} sensors`)

let combined = []
ids.forEach(sensor => {
//   let sfn = dir + "/" + sensor + ".json"
  let fn = dir + "/" + sensor + ".csv"
  let csv
  try {
  csv = d3.csvParse(fs.readFileSync(fn).toString())
  } catch(e) { return }
  if(!csv || !csv.length) return
  // We need to make up for the fact that i forgot to include the field type when writing the original csvs
  let start = csv.length / 2

  console.log(sensor, start)
  csv.forEach((d,i) => {
    delete d.thingId
    if(i < start) {
      d.type = "p03"
    } else {
      d.type = "pm1"
    }
  })
  // pm1
  combined = combined.concat(csv)
})
let outfile = "output/" + id + "-" + ts + "-out.csv"
// fs.writeFileSync(id+"-out.csv", d3.csvFormat(combined))
fs.writeFileSync(outfile, d3.csvFormat(combined))
console.log("done", outfile)
