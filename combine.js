if (typeof fetch !== 'function') {
  global.fetch = require('node-fetch');
}
let fs = require("fs")
let d3 = require("d3");

let id = "ids3"
// let ids = JSON.parse(fs.readFileSync("ids.json").toString())
let ids = JSON.parse(fs.readFileSync(id + ".json").toString())

console.log(`${ids.length} sensors`)
let dir = "data"
try {
  fs.mkdirSync(dir)
} catch(e) {}

let combined = []
ids.forEach(sensor => {
//   let sfn = dir + "/" + sensor + ".json"
  let fn = dir + "/" + sensor + ".csv"
  let csv = d3.csvParse(fs.readFileSync(fn).toString())
  if(!csv || !csv.length) return
  // We need to make up for the fact that i forgot to include the field type when writing the original csvs
  let start = csv.length / 2

  console.log(sensor, start)
  csv.forEach((d,i) => {
    if(i < start) {
      d.type = "p03"
    } else {
      d.type = "pm1"
    }
  })
  // pm1
  combined = combined.concat(csv)
})
fs.writeFileSync(id+"-out.csv", d3.csvFormat(combined))
console.log("done", id+"-out.csv")
