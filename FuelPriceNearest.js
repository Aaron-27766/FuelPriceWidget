// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: gas-pump;
// Version 1.0.5
// Check www.scriptables.net for more widgets
// Use www.scriptdu.de to keep the widget up-to-date


// original script: https://github.com/Necriso/ScriptableWidgets/blob/main/tankstellenpreise.js
let callDataAmount = 40

let fm = FileManager.iCloud();
let p = await args.widgetParameter
let widgetSize = config.widgetFamily

if(p == 'local'){
  fm = FileManager.local();
}

let dir = fm.documentsDirectory()

let historyFolderPath = fm.joinPath(dir, "FuelPriceNearestHistory")
let list = fm.listContents(historyFolderPath)
log("length: " + list.length)
let historyFilePath = fm.joinPath(historyFolderPath, "FuelPriceNearest" + (list.length - 1) + ".json")
let path = fm.joinPath(historyFolderPath, "FuelPriceNearest" + (list.length) + ".json")

let ic = true

let apiKey = '' // get API-Key from https://creativecommons.tankerkoenig.de/
let fixedLocation = false // set to true if you want a fixed location
let radius = 12 // radius in km, set it higher if the script throws an error, it's possible that there is no gas station near your location


const apiURL = (location, radius, apiKey) => `https://creativecommons.tankerkoenig.de/json/list.php?lat=${location.latitude.toFixed(3)}&lng=${location.longitude.toFixed(3)}&rad=${radius}&sort=dist&type=all&apikey=${apiKey}`

let station = await loadStation(apiKey, radius, fixedLocation)
log(dir)
let widget = await createWidget(station)
Script.setWidget(widget)
Script.complete()

function map(lat, lng, name) {
  name = name.replace(" ", "%20")
  name = name.replace(" ", "%20")
  name = name.replace(" ", "%20")
  name = name.replace(" ", "%20")
  name = name.replace(" ", "%20")
  var mapURL = "https://maps.apple.com/?t=h&z=12&ll=" + lat + "," + lng + "&q=" + name  
  return mapURL
}

function lineSep(){
  //generate line separator
  const context =new DrawContext()
  let width = 93,h=0.00000000001
  context.size=new Size(width, h)
  context.opaque=false
  context.respectScreenScale=true
  const path = new Path()
  path.move(new Point(18,h))
  path.addLine(new Point(width,h))
  context.addPath(path)
  context.setStrokeColor(Color.blue())
  context.strokePath()
  return context.getImage()
}

async function getFromApi(){
      let location
    
      if (fixedLocation) {
        location = myLocation
      } else {
        location = await Location.current()    
      }
      const data = await new Request(apiURL(location, radius, apiKey)).loadJSON()

      return data
}

function getFromFile(){
  if (fm.fileExists(historyFilePath)){
    data = JSON.parse(fm.readString(historyFilePath));
    return data;
  }
}
  
async function loadStation(apiKey, radius, fixedLocation) {
    try{
      data = await getFromApi();
    }catch {
      data = await getFromFile();
      ic = false
    }
    log(ic)
    log(data)
    return data
}

function formatValue(value) {
    let lastDigit = '⁹'
    let price = value.toString().slice(0, -1)
    return price + lastDigit
}

async function createWidget(data) {
    var attr = data.stations[0]
    
    log(attr.e5)
    
    log("dataLength: " + data.stations.length)

    data.stations.forEach(cheapest)
    
    function cheapest(item, index) {
      if ((item.e5 != null) && (item.e5 < attr.e5)){
        attr = item
      }
    }
    log(attr.e5)
    
    log("address:\n" + attr.street + attr.houseNumber + attr.postCode + attr.place)
    

    const widget = new ListWidget()
    
    widget.url = await map(attr.lat, attr.lng, attr.name)
    log(widget.url)
    
    //   header:
  
  var header_stack = widget.addStack();
  var symbol = SFSymbol.named('car.fill').image;
  var symbol_image = header_stack.addImage(symbol);
    symbol_image.imageSize = new Size(15, 15);
  symbol_image.tintColor = Color.blue()
  header_stack.addSpacer(3);
  var title = header_stack.addText("FUEL PRICE");
  title.font = Font.boldRoundedSystemFont(13)
  title.textColor = Color.blue()
  console.log("title:\n" + title.text + "\n")
  
//   line:
  
  let lineImg = lineSep()
  let line = widget.addImage(lineImg)
    line.resizable=false
    line.imageOpacity=1

widget.addSpacer(3)




//   price:

var line2Stack = widget.addStack()
var line2 = line2Stack.addText(formatValue(attr.e5))
    line2.font = Font.boldRoundedSystemFont(40)
    var euroStack = line2Stack.addStack()
    euroStack.layoutVertically()
    euroStack.addSpacer(12)
    var euro = euroStack.addText("€")
    euro.font = Font.boldRoundedSystemFont(28)
    

  if (fm.fileExists(historyFilePath) == false) {
    fm.writeString(historyFilePath, JSON.stringify(data));
  }
  
  
  
  const dataPrev = JSON.parse(fm.readString(historyFilePath));
  let currentPrice = Number(attr.e5)
  var previousPriceAttr = dataPrev.stations[0]  
  
  dataPrev.stations.forEach(prevStation)
    function prevStation(item, index) {
      if ((item.e5 != null) && (String(item.lat + "_" + item.lng) == String(attr.lat + "_" + attr.lng))){
        previousPriceAttr = item
      }
    }
    let previousPrice = previousPriceAttr.e5
    log(previousPrice)
  
  var change = 0
 
  let priceList = new Array()
  var all = 0
  
  var c = 0
    
  list.forEach(myFunction)
  function myFunction(item, index){
    if (index < callDataAmount) {
      let itemPath = fm.joinPath(historyFolderPath, "FuelPriceNearest" + (list.length - index - 1) + ".json")
      const itemData = JSON.parse(fm.readString(itemPath))

      if(itemData != null) {
      
       itemData.stations.forEach(itemStation)
        function itemStation(i, index) {
           if ((i.e5 != null) && (String(i.lat + "_" + i.lng) == String(attr.lat + "_" + attr.lng))){
             priceList[c] = i.e5
             c = c + 1
           }
        }
      }
    }
  }
  
  priceList.forEach(allF)
  

  function allF(item, index) {
      all = all + Number(item)
  }
  
  log("all: " + all)
  
  change = all / (priceList.length)
  
  log("change: " + change)
  
  
  let avrg = String(Math.round((change + Number.EPSILON) * 100) / 100)
  let avrgC = avrg.replace(".","")
  if (avrgC.length < 3) {
    if (avrg.includes("1.")) {
      avrg = avrg + "0"
      if (avrgC.length == 1) {
        avrg = avrg + "0"
      }
    }else if (avrg.includes("0.")) {
      avrg = "0." + avrgC + "0"
    }
  }
  
  log("avrg: " + avrg)
  
  change = Number(avrg)
  
  if (change != 0) {
    if (change == currentPrice) {
      line2.textColor = Color.orange()
      euro.textColor = Color.orange()
    }else if (change > currentPrice) {
      line2.textColor = Color.green()
      euro.textColor = Color.green()
    }else if (change < currentPrice) {
      line2.textColor = Color.red()
      euro.textColor = Color.red()
    }
  }
  
  
  if (list.length > callDataAmount) {
    let amount = list.length - callDataAmount
    list.forEach(deleteFunc)
    function deleteFunc(item, index) {
      if (index < amount) {
        let itemPath = fm.joinPath(historyFolderPath, "FuelPriceNearest" + (amount - index - 1) + ".json")    
//         if (fm.fileExists(itemPath)) {
//           fm.remove(itemPath)
//         }
      }
    }
    log(list.length)
  }
  
  

  if (currentPrice != previousPrice) {
    fm.writeString(path, JSON.stringify(data))
  }
  
  var line3text = "Super E5"
  if (avrg > 0) {
    line3text = "Super E5 ⌀" + avrg
  }
  
var line3 = widget.addText(line3text)
line3.font = Font.boldRoundedSystemFont(14)
line3.textColor = Color.blue()
widget.addSpacer(0)


let stationStack = widget.addStack()
stationStack.layoutHorizontally()
stationStack.setPadding(0, -4, 0, 0)


let stationOpen = stationStack.addText("|")
stationOpen.font = Font.boldRoundedSystemFont(35)
stationOpen.textColor = Color.red()
if (attr.isOpen == true) {
  stationOpen.textColor = Color.green()
}


let nameStack = stationStack.addStack()
nameStack.layoutVertically()
nameStack.addSpacer(5)

log(attr.brand)

      let stationName = nameStack.addText(attr.brand + " → " + attr.dist + " km")
    stationName.font = Font.boldRoundedSystemFont(10)
      
      let place = nameStack.addText(attr.place)
      place.font = Font.boldRoundedSystemFont(10)
    
    let street = nameStack.addText(attr.street)
      street.font = Font.boldRoundedSystemFont(10)


    return widget
}