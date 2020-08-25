if (typeof fetch !== 'function') {
  global.fetch = require('node-fetch');
}
let fs = require("fs")
let d3 = require("d3");

let tf = d3.timeFormat("%Y-%m-%d-%H")
let ts = tf(new Date())

d3
.json(
  "https://www.purpleair.com/data.json?opt=1/mAQI/a10/cC0&fetch=true&nwlat=43.167493434353474&selat=32.25997597364069&nwlng=-127.87343156694496&selng=-114.15416006614362&fields=pm_1"
)
.then(d => {
  Object.assign(
    d.data.map(b => Object.fromEntries(d.fields.map((f, i) => [f, b[i]]))),
    { columns: d.fields }
  )
//   console.log("d", d)
  fs.writeFileSync("input/air-" + ts + ".json", JSON.stringify(d))
})