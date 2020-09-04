if (typeof fetch !== 'function') {
  global.fetch = require('node-fetch');
}
let fs = require("fs")
let d3 = require("d3")
let asynch = require("async")

let tf = d3.timeFormat("%Y-%m-%d-%H")
let ts = process.argv[2] || tf(new Date())
let dir = "data-" + ts
console.log("dir", dir)

let airfile = JSON.parse(fs.readFileSync(`input/air-${ts}.json`).toString())
  .filter(d => d.Type == 0)

console.log(`${airfile.length} sensors`)

try {
  fs.mkdirSync(dir)
} catch(e) {}

let i = 0
asynch.eachLimit(airfile, 100, (sensor, cb) => {
  let fn = dir + "/" + sensor.ID + ".json"
  try {
    fs.readFileSync(fn)
    console.log("had", fn)
    cb()
  } catch(e) {

    d3.json(`https://www.purpleair.com/json?show=${sensor.ID}`).then(station => {
      let thing = station.results[0]

      fs.writeFileSync(fn, JSON.stringify(thing))
      console.log("wrote", fn)
      cb()
    })
  }
}, () => {
  console.log("run the next command:", "node scrape-history.js " + ts)
})

