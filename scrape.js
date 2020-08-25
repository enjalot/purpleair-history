if (typeof fetch !== 'function') {
  global.fetch = require('node-fetch');
}
let fs = require("fs")
let d3 = require("d3")
let airfile = JSON.parse(fs.readFileSync("input/air.json").toString())
  .filter(d => d.Type == 0)

// air = d3
// .json(
//   "https://www.purpleair.com/data.json?opt=1/mAQI/a10/cC0&fetch=true&nwlat=43.167493434353474&selat=32.25997597364069&nwlng=-127.87343156694496&selng=-114.15416006614362&fields=pm_1"
// )
// .then(d =>
//   Object.assign(
//     d.data.map(b => Object.fromEntries(d.fields.map((f, i) => [f, b[i]]))),
//     { columns: d.fields }
//   )
// )

console.log(`${airfile.length} sensors`)
let tf = d3.timeFormat("%Y-%m-%d-%H")
let dir = "data-" + tf(new Date())

try {
  fs.mkdirSync(dir)
} catch(e) {}

let i = 0
airfile.forEach(async sensor => {
  let fn = dir + "/" + sensor.ID + ".json"
  try {
    fs.readFileSync(fn)
    console.log("had", fn)
  } catch(e) {
    setTimeout(async () => {

    let station = await d3.json(`https://www.purpleair.com/json?show=${sensor.ID}`)
  // station.then(result => {
    let thing = station.results[0]

    fs.writeFileSync(fn, JSON.stringify(thing))
    console.log("wrote", fn)
    }, i*20)
    i++
  }
})

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
