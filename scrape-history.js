/*
This downloads csv files 100 at a time to avoid rate limiting.
It will check if a csv file already exists and skip if so.
*/
if (typeof fetch !== 'function') {
  global.fetch = require('node-fetch');
}
let fs = require("fs")
let d3 = require("d3");
let asynch = require("async")
const { exec } = require('child_process');

// how many we will attempt at once
let limit = 200

let airfile = JSON.parse(fs.readFileSync("input/air.json").toString())
  .filter(d => d.Type == 0)
  // .filter(d => d.ID == 21629)

// console.log("AIRFILE", airfile)

let tf = d3.timeFormat("%Y-%m-%d-%H")
let ts = process.argv[2] || tf(new Date())
let dir = "data-" + ts
console.log("dir", dir)


// TODO
// programatically determine start date as previous 10 days 
// start=2020-08-10%2023:12:35
let tenDaysAgo = d3.timeDay.floor(d3.timeDay.offset(new Date(), -10))
let start = d3.timeFormat("%Y-%m-%d %H:%M:%S")(tenDaysAgo)



console.log(`${airfile.length} sensors`)

// let tf = d3.timeFormat("%Y-%m-%d-%H")
// let dir = "data-" + tf(new Date())
try {
  fs.mkdirSync(dir)
} catch(e) {}

let got = 0
asynch.eachLimit(airfile, 100, (sensor, cb) => {
  let i = airfile.indexOf(sensor)
  // try to avoid rate limiting

  let sfn = dir + "/" + sensor.ID + ".json"
  let thing
  try{
    thing = JSON.parse(fs.readFileSync(sfn).toString())
  } catch(e) {
    console.log("NO THING", sensor)
    return;
  }
  // console.log("thing?", thing)

  let fn = dir + "/" + sensor.ID + ".csv"
  try {
    fs.readFileSync(fn)
    console.log("had", fn)
    return cb()
  } catch(e) {
      console.log("fetching", i)

      // let thingId = thing.THINGSPEAK_PRIMARY_ID
      // let thingAPI = thing.THINGSPEAK_PRIMARY_ID_READ_KEY

      // It seems the Web UI uses the secondary id to get the data...
      let thingId = thing.THINGSPEAK_SECONDARY_ID
      let thingAPI = thing.THINGSPEAK_SECONDARY_ID_READ_KEY

      let p03url = `https://api.thingspeak.com/channels/${thingId}/fields/1.json?start=${start}&offset=0&round=2&average=60&api_key=${thingAPI}`
      let pm1url = `https://api.thingspeak.com/channels/${thingId}/fields/8.json?start=${start}&offset=0&round=2&average=60&api_key=${thingAPI}`
      console.log("p03", p03url)
      console.log("pm1", pm1url)
    //   let results = await Promise.all([
    //     //p_0_3
    //     d3.json(p03url),
    //     //pm_1
    //     d3.json(pm1url)
    //   ])
      d3.json(p03url).then(response0 => {
        
        d3.json(pm1url).then(response1 => {
            let results = [response0, response1]
            console.log("response", response0)


      function mapper(d, field) {
        return {
          id: thing.ID, 
          // thingId: thing.THINGSPEAK_PRIMARY_ID, 
          thingId: thing.THINGSPEAK_PRIMARY_ID, 
          created_at: +new Date(d.created_at)/1000, 
          field: field,
          value: d[field]
        }
      }
      p03 = results[0].feeds.map(d => {
        return mapper(d, "field1") 
      })
      pm1 = results[1].feeds.map(d => {
        return mapper(d, "field8") 
      })
      let csv = d3.csvFormat(p03.concat(pm1))

      fs.writeFileSync(fn, csv)
      console.log("wrote", fn, got)
      got++
        
      
      cb()

        })
      })

  }
}, (err) => {
 console.log("DONE", err) 
 let csvcountcmd = `ls -lah ${dir}/*.csv | wc -l`
  exec(csvcountcmd, (error, stdout, stderr) => {
    console.log(csvcountcmd, stdout)
  })
  let jsoncountcmd = `ls -lah ${dir}/*.json | wc -l`
  exec(jsoncountcmd, (error, stdout, stderr) => {
    console.log(jsoncountcmd, stdout)
  })
})



