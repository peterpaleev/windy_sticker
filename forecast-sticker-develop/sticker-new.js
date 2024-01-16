const testcolors = [
  { value: 0, color: '#E5E5E5' },
  { value: 25, color: '#FF0000' },
  { value: 50, color: '#00FF00' },
  { value: 75, color: '#0000FF' },
  { value: 100, color: '#FFFFFF' }
];
const colorsECMWF = [
  {
    value: 54,
    color: '#E5E5E5'
  },
  {
    value: 50,
    color: '#E1CDE3'
  },
  {
    value: 46,
    color: '#F5C3FB'
  },
  {
    value: 42,
    color: '#EF89F8'
  },
  {
    value: 38,
    color: '#EA3CF7'
  },
  {
    value: 34,
    color: '#BD496E'
  },
  {
    value: 30,
    color: '#74152D'
  },
  {
    value: 26,
    color: '#BB261A'
  },
  {
    value: 22,
    color: '#EB3323'
  },
  {
    value: 18,
    color: '#EE7A30'
  },
  {
    value: 14,
    color: '#F4B23E'
  },
  {
    value: 10,
    color: '#F9D949'
  },
  {
    value: 6,
    color: '#FFFE54'
  },
  {
    value: 2,
    color: '#FFFE91'
  },
  {
    value: -2,
    color: '#C7E352'
  },
  {
    value: -6,
    color: '#7CBC44'
  },
  {
    value: -10,
    color: '#6DE19F'
  },
  {
    value: -14,
    color: '#73FBFD'
  },
  {
    value: -18,
    color: '#5ACAFA'
  },
  {
    value: -22,
    color: '#3280F6'
  },
  {
    value: -26,
    color: '#7327F5'
  },
  {
    value: -30,
    color: '#51127A'
  },
  {
    value: -34,
    color: '#2D0962'
  },
  {
    value: -38,
    color: '#443446'
  },
  {
    value: -42,
    color: '#776779'
  },
  {
    value: -46,
    color: '#AA9AAC'
  },
  {
    value: -50,
    color: '#B2B2B2'
  },
  {
    value: -56,
    color: '#CCCCCC'
  },
  {
    value: -65,
    color: '#E5E5E5'
  },
  {
    value: -75,
    color: '#FFFFFF'
  }
]
class WindySticker {
    constructor (stickerData, locationData, stickerElement, { timeZoom = '6 days', theme = 'black' }, tempColors) {
      this.forecastData = stickerData.response.forecast;
      this.locationData = locationData.response;
      this.solunarData = stickerData.response.solunarData;
      this.sticker = stickerElement;
      this.timeZoom = timeZoom;
      this.theme = theme;
      this.tempColors = tempColors;
    }
    _cutColors(colorsArray, minValue, maxValue) {
      const sortedColors = colorsArray.slice().sort((a, b) => a.value - b.value);
    
      let minColorIndex = 0;
      let maxColorIndex = sortedColors.length - 1;
    
      for (let i = 0; i < sortedColors.length; i++) {
        if (sortedColors[i].value >= minValue) {
          minColorIndex = i === 0 ? 0 : i - 1;
          break;
        }
      }
    
      for (let i = sortedColors.length - 1; i >= 0; i--) {
        if (sortedColors[i].value <= maxValue) {
          maxColorIndex = i === sortedColors.length - 1 ? i : i + 1; 
          break;
        }
      }
    
      const cutColorsArray = sortedColors.slice(minColorIndex, maxColorIndex + 1);
    
      return cutColorsArray;
    }
    
    _generateStopElements(colorsArray) {
      const sortedColors = colorsArray.sort((a, b) => a.value - b.value);
    
      const step = 100 / (sortedColors.length - 1);
    
      const stopElements = sortedColors.map((color, index) => {
        const offset = index * step;
        return `<stop offset="${offset}%" style="stop-color: ${color.color};"></stop>`;
      });
    
      return stopElements.join('\n');
    }

    _findLargest(numbers) {
      const largestNumber = Math.max(...numbers);
      return largestNumber;
    }

    _createSVGGraph(numbers) {
      // Calculate minimum and maximum values from the numbers array
      let minValue = Math.min(...numbers);
      let maxValue = Math.max(...numbers);
    
      // Generate color stops for the SVG gradient based on the temperature colors and data range
      const colorStops = this._generateStopElements(this._cutColors(this.tempColors, minValue, maxValue));
    
      // Define the SVG namespace and set dimensions for the SVG element
      const svgNS = "http://www.w3.org/2000/svg";
      const svgWidth = this.sticker.querySelector('#stickerContent').clientWidth;
      const svgHeight = this.sticker.querySelector('#stickerContent').clientHeight / 3;
      const stepSize = svgWidth / (numbers.length - 1);
    
      // Create the SVG element
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("xmlns", svgNS);
      svg.setAttribute("width", svgWidth);
      svg.setAttribute("height", svgHeight);
      svg.classList.add("sticker__graph");
    
      // Create the linear gradient element for the SVG
      const gradient = document.createElementNS(svgNS, "linearGradient");
      gradient.setAttribute("id", "colorGradient");
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");
      gradient.setAttribute("x1", "0%");
      gradient.setAttribute("y1", "100%");
      gradient.setAttribute("x2", "0%");
      gradient.setAttribute("y2", "0%");
    
      // Parse the color stops and add them to the gradient element
      const stopColors = colorStops.split("\n").filter(Boolean);
      stopColors.forEach((stopColor) => {
        const stopElement = new DOMParser().parseFromString(stopColor, "text/html").body.firstChild;
        gradient.appendChild(stopElement);
      });
    
      // Append the gradient to the SVG element
      svg.appendChild(gradient);
    
      // Create the path element for the graph line
      const path = document.createElementNS(svgNS, "path");
      let pathData = `M0 ${svgHeight}`;
    
      // Generate the path data based on the numbers array
      numbers.forEach((number, index) => {
        const x = index * stepSize;
        const y = svgHeight - ((number - minValue) / (maxValue - minValue)) * svgHeight;
        pathData += `L${x} ${y} `;
      });
    
      // Set attributes for the path element
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "url(#colorGradient)");
      path.setAttribute("stroke-width", "6");
    
      // Append the path to the SVG element
      svg.appendChild(path);
    
      // Serialize the SVG element to a string and return it
      return new XMLSerializer().serializeToString(svg);
    }
    
      
    _convertData() {
      const calcPrecipitationInMM = (prate, snowPrate) => {
        const metersPerSecondToMMPerHour = 1000 * 3600; 
        const precipitationMM = (prate + snowPrate) * metersPerSecondToMMPerHour;
        return precipitationMM;
      }
      const calcKelvinToCelsius = (kelvin) => {
        const celsius = kelvin - 273.15 > 0 ? `+${kelvin - 273.15}` : `${kelvin - 273.15}`;
        return Math.floor(celsius);
      }
      const calcMsToKmh = (ms) => {
        return ms * 3.6;
      }
      const calcWindSpeed = (ugrd, vgrd) => {
        const windSpeed = Math.sqrt(ugrd ** 2 + vgrd ** 2);
        return windSpeed;
      }
      const cutTimeFromDate = (dateString) => {
        const parts = dateString.split(' ');
  
        return parts.length === 2 ? parts[1] : '';
      }
      const generateLinearGradientOfClouds = (opacityArray) => {
        const cellWidth = 100 / 5; // Calculate the width of each cell
      
        const stops = opacityArray.map((opacity, index) => {
          const position = index * cellWidth + cellWidth / 2; // Position the color stop in the middle of the cell
          const rgbaColor = `rgba(255, 255, 255, ${opacity / 100}) ${position}%`;
          return rgbaColor;
        });
      
        const linearGradient = `linear-gradient(to right, ${stops.join(', ')})`;
      
        return linearGradient;
      }
      const isDay = (timestamp) => {
        const sunriseTimes = [];
        const sunsetTimes = [];
        this.solunarData.sunData.forEach((item) => {
          sunriseTimes.push(item.rise);
          sunsetTimes.push(item.set);
        });
        for (let i = 0; i < sunriseTimes.length; i++) {
            if (timestamp >= sunriseTimes[i] && timestamp < sunsetTimes[i]) {
                return true;
            } else if (timestamp >= sunsetTimes[i] && timestamp < sunriseTimes[i + 1]) {
                return false;
            }
        }
    }
    const calcWindDirection = (ugrd, vgrd) => {
        const windDirectionRadians = Math.atan2(-ugrd, -vgrd); 
        let windDirectionDegrees = (windDirectionRadians * 180) / Math.PI;
      
        if (windDirectionDegrees < 0) {
          windDirectionDegrees += 360;
        }
      
        return windDirectionDegrees;
      }
      const calcCoditionType = (weatherData) => {
        const {
            timestamp,
            PRATE,
            TMP,
            TCDC_HIGH,
            TCDC_MED,
            SNOW_PRATE,
            UGRD,
            VGRD,
        } = weatherData;
        const prate = PRATE * 3600;
        const temp = TMP;
        const cloudHigh = TCDC_HIGH;
        const cloudMed = TCDC_MED;
        const snowPrate = SNOW_PRATE * 3600;
        const ugrd = UGRD;
        const vgrd = VGRD;
        let conditionType = "Undefined";
    
        if (prate > 0.05) {
            if (temp >= 273.15) {
                if (prate <= 0.16) {
                    if (snowPrate > 0) {
                        conditionType = "RainSnow1";
                    } else {
                        conditionType = "Rain1";
                    }
                } else if (prate <= 1.16) {
                    if (snowPrate > 0) {
                        conditionType = "RainSnow2";
                    } else {
                        conditionType = "Rain2";
                    }
                } else {
                    if (snowPrate > 0) {
                        conditionType = "RainSnow3";
                    } else {
                        conditionType = "Rain3";
                    }
                }
            } else {
                if (prate <= 0.5) {
                    conditionType = "Snow1";
                } else if (prate <= 1.583) {
                    conditionType = "Snow2";
                } else {
                    conditionType = "Snow3";
                }
            }
        } else {
            if (cloudHigh > 70 || cloudMed > 60) {
                conditionType = "Cloudy3";
            } else if (cloudHigh > 40 || cloudMed > 40) {
                conditionType = isDay(timestamp) ? "CloudyDay2" : "CloudyNight1";
            } else if (cloudHigh > 10 || cloudMed > 10) {
                conditionType = isDay() ? "CloudyDay1" : "CloudyNight1";
            } else {
                conditionType = isDay() ? "ClearSkyDay" : "ClearSkyNight";
            }
        }
    
        return conditionType;
    }
    const getPrecipitationRate = (prate, temp, snowPrate) => {
      if (prate > 0.05) {
        if (temp >= 273.15) {
          if (prate <= 0.16) {
            return snowPrate > 0 ? "RainSnow1" : "Rain1";
          } else if (prate <= 1.16) {
            return snowPrate > 0 ? "RainSnow2" : "Rain2";
          } else if (prate <= 1.45) {
            return snowPrate > 0 ? "RainSnow3" : "Rain3";
          } else {
            return snowPrate > 0 ? "RainSnow4" : "Rain4";
          }
        } else {
          if (prate <= 0.5) {
            return "Snow1";
          } else if (prate <= 1.583) {
            return "Snow2";
          } else if (prate <= 2.0) {
            return "Snow3";
          } else {
            return "Snow4";
          }
        }
      }
    
      return false;
    }
    const getMostPopularCategoryStrings = (inputArray) => {
      const categories = {
        rainSnow: [],
        cloud: [],
        clear: []
      };
    
      inputArray.forEach((str) => {
        if (str.startsWith("Rain") || str.startsWith("Snow")) {
          categories.rainSnow.push(str);
        } else if (str.startsWith("Cloud")) {
          categories.cloud.push(str);
        } else if (str.startsWith("Clear")) {
          categories.clear.push(str);
        }
      });
    
      const mostPopularCategory = Object.keys(categories).reduce((a, b) => categories[a].length > categories[b].length ? a : b);
    
      let mostPopularString = categories[mostPopularCategory].reduce((a, b) => {
        const countA = inputArray.filter((str) => str === a).length;
        const countB = inputArray.filter((str) => str === b).length;
        return countA > countB ? a : b;
      });
     
      if (mostPopularString === "CloudyNight1") {
        mostPopularString = "CloudyDay1";
      } else if (mostPopularString === "ClearSkyNight") {
        mostPopularString = "ClearSkyDay";
      }
    
      return mostPopularString;
    }
    const getDayOfWeek = (timestamp, offsetSeconds) => {
      const utcTimestamp = timestamp + offsetSeconds;
      const date = new Date(utcTimestamp * 1000);
    
      const options = { weekday: 'short' };
      const dayOfWeek = date.toLocaleDateString('en-US', options).toUpperCase().slice(0, 2);
    
      return dayOfWeek;
    }
    function findMax(arr) {
      return Math.max(...arr);
    }
    
    function findMin(arr) {
      return Math.min(...arr);
    }

      let convertedData = {
        convertedValues: this.forecastData.map((item) => ({
          wind: calcWindSpeed(item.UGRD, item.VGRD),
          windDir: calcWindDirection(item.UGRD, item.VGRD),
          gust: item.GUST,
          precipitation: calcPrecipitationInMM(item.PRATE, item.SNOW_PRATE),
        })),
        prateType: this.forecastData.map((item => getPrecipitationRate(item.PRATE * 3600, item.TMP, item.SNOW_PRATE * 3600))),
        temp: this.forecastData.map((item => calcKelvinToCelsius(item.TMP))),
        timestamp: this.forecastData.map((item => item.timestamp)),
        conditoins: this.forecastData.map((item => calcCoditionType(item))),
        windSpeed: this.forecastData.map((item => calcWindSpeed(item.UGRD, item.VGRD))),
        windGust: this.forecastData.map((item => item.GUST)),

        gradients: {
          cloud: {
            high: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_HIGH)),
            medium: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_MED)),
            low: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_LOW)),
          },
        },
      };

      if (this.timeZoom == '6 days') {
        const mostRecentConditions = [];
        const daysOfWeek = [];
        const maxTemp = [];
        const minTemp = [];
        const maxWindSpeed = [];
        for (let i = 0; i < convertedData.conditoins.length; i += 8) {
          const subArrayConditions = convertedData.conditoins.slice(i, i + 8);
          const conditions = getMostPopularCategoryStrings(subArrayConditions);
          const subArrayTemp = convertedData.temp.slice(i, i + 8);
          const subArrayWindSpeed = convertedData.windSpeed.slice(i, i + 8);
          const maxWindSpeedItem = this._findLargest(subArrayWindSpeed);
          maxTemp.push(findMax(subArrayTemp));
          minTemp.push(findMin(subArrayTemp));
          mostRecentConditions.push(conditions);
          maxWindSpeed.push(Math.round(maxWindSpeedItem * 10) / 10);
          daysOfWeek.push(getDayOfWeek(convertedData.timestamp[i], this.locationData.offsetSec));
        }
        convertedData.conditoinsCut = mostRecentConditions;
        convertedData.timelineCut = daysOfWeek;
        convertedData.maxTempCut = maxTemp;
        convertedData.minTempCut = minTemp;
        convertedData.windSpeedCut = maxWindSpeed;
      }
      console.log(convertedData);
      return convertedData;
    }
    _renderContent() {
      const convertedData = this._convertData();
      const tempGraph = this._createSVGGraph(convertedData.temp);
      const stickerContent = this.sticker.querySelector('#stickerContent');
      const stickerHeader = this.sticker.querySelector('#stickerHeader');
      const locationParts = this.locationData.name.split('/');
      console.log(locationParts);
      const locationWord = "test";
      if (locationWord) {
        const stickerLocation = document.createElement('span');
        const locationIcon = document.createElement('img');
        locationIcon.src = './images/location.fill.svg';
        locationIcon.classList.add('sticker__location-icon');
        stickerLocation.classList.add('sticker__location');
        stickerLocation.textContent = locationWord;
        stickerLocation.append(locationIcon); 
        stickerHeader.prepend(stickerLocation);
      }

      for (let i = 0; i < 6; i++) { // 6 - number of cells
        const stickerCell = document.createElement('div');
        const spanWrapper = document.createElement('div');
        const timelineSpan = document.createElement('span');
        const conditionsImg = document.createElement('img');
        const textSpan = document.createElement('span');
        const lightTextSpan = document.createElement('span');
        const rainBox = document.createElement('div');

        stickerCell.classList.add('sticker__content-cell');
        spanWrapper.classList.add('sticker__span-wrapper');
        timelineSpan.classList.add('sticker__time-span');
        conditionsImg.classList.add('sticker__conditions-img');
        textSpan.classList.add('sticker__value-span');
        lightTextSpan.classList.add('sticker__value-span_light');
        rainBox.classList.add('sticker__rain-box');

        const tempSpanWrapper = spanWrapper.cloneNode(true);
        const maxTempSpan = textSpan.cloneNode(true);
        const minTempSpan = lightTextSpan.cloneNode(true);

        const windSpanWrapper = spanWrapper.cloneNode(true);
        const windSpeedSpan = textSpan.cloneNode(true);
        const windUnitsSpan = lightTextSpan.cloneNode(true);

        for (let n = 0; n < 8; n++) {
          const raindropWrapper = document.createElement('div');
          raindropWrapper.classList.add('sticker__raindrop-wrapper');
          const currentRainData = convertedData.prateType[i * 8 + n];
          if (currentRainData) {
            const raindrop = document.createElement('span');
            raindrop.classList.add('sticker__raindrop');
            const raindropAmount = currentRainData[currentRainData.length - 1];
            if (currentRainData.slice(0, -1) == 'RainSnow') {
              raindrop.classList.add('sticker__raindrop_rainsnow');
            } else if (currentRainData.slice(0, -1) == 'Snow') {
              raindrop.classList.add('sticker__raindrop_snow');
            }
            for (let y = 0; y < parseInt(raindropAmount, 10); y++) {
              const cloneRaindrop = raindrop.cloneNode(true);
              raindropWrapper.append(cloneRaindrop);
            }
          }
          rainBox.append(raindropWrapper);
        }

        timelineSpan.textContent = convertedData.timelineCut[i];
        conditionsImg.src = `./images/${convertedData.conditoinsCut[i]}.svg`;
        maxTempSpan.textContent = convertedData.maxTempCut[i];
        minTempSpan.textContent = convertedData.minTempCut[i];
        windSpeedSpan.textContent = convertedData.windSpeedCut[i];
        windUnitsSpan.textContent = 'm/s';


        tempSpanWrapper.append(maxTempSpan, minTempSpan);
        windSpanWrapper.append(windSpeedSpan, windUnitsSpan);

        stickerCell.append(timelineSpan, conditionsImg, tempSpanWrapper, rainBox, windSpanWrapper);
        stickerContent.append(stickerCell);
      }
      
        // mainContent.insertAdjacentHTML('beforeend', svgGraph);
    }
  
  }


// const lat = 69.632337;
// const lon = 26.340668;
const lat = new URLSearchParams(window.location.search).get('lat');
const lon = new URLSearchParams(window.location.search).get('lon');

const apiV9 = 'https://windy.app/proxy/apiV9.php';
const testOpts = {
  timeZoom: '6 days', // can also be '18 hours' or '6 hours'
  theme: 'black'
}
const startTimestamp = Math.floor(Date.now() / 1000);
const endTimestamp = Math.floor(Date.now() / 1000 + 3600 * (testOpts.timeZoom == '6 days' ? 144 : testOpts.timeZoom == '18 hours' ? 18 : 6));
const requests = [
  fetch(apiV9 + '?forecast_fields=solunar&from_ts=' + startTimestamp + '&lat=' + lat + '&lon=' + lon + '&method=getForecastForLatLonTypeNew&type=GFS27&to_ts=' + endTimestamp),
  fetch(apiV9 + '?method=getTimezoneByCoords&lat=' + lat + '&lon=' + lon)
]

const hours = new URLSearchParams(window.location.search).get('hours');
const stickerElement = document.querySelector('#sticker');

Promise.all(requests)
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then((data) => {
    console.log(data);
    const testSticker = new WindySticker(data[0], data[1], stickerElement, testOpts, colorsECMWF);
    testSticker._renderContent();
    console.log(data[1]);
  })
  .catch((err) => console.error(err));
