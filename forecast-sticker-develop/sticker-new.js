const stickerElement = document.querySelector('#sticker');
class WindySticker {
    constructor (stickerData, locationData, stickerElement, { timeZoom = '6 days', theme = 'black' }) {
      this.forecastData = stickerData.response.forecast;
      this.locationData = locationData.response;
      this.solunarData = stickerData.response.solunarData;
      this.sticker = stickerElement;
      this.timeZoom = timeZoom;
      this.theme = theme;
    }
    _createSVGGraph(numbers, colorHash, height, additionalSelector) {
        let minValue = numbers[0];
        let maxValue = numbers[0];
        numbers.forEach((number) => {
        if (number < minValue) minValue = number;
        if (number > maxValue) maxValue = number;
        });
        const gradientId = `graphGradient-${colorHash}`;
        const totalWidth = window.innerWidth - 40;
        const spacing = totalWidth / (numbers.length); // Calculate the spacing based on totalWidth and the number of points

        const svg = `<svg class="sticker__graph ${additionalSelector}" width="${totalWidth}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        const gradient = `
        <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${colorHash}" stop-opacity="0.7" />
            <stop offset="100%" stop-color="${colorHash}" stop-opacity="0" />
            </linearGradient>
        </defs>
        `;

        let path = `M0 ${height} `;

        const firstY = height - (Math.min(maxValue, Math.max(minValue, numbers[0])) - minValue) / (maxValue - minValue) * height;
        let linePath = `M${spacing/2} ${firstY} `;  // Start the linePath at the y-coordinate of the first number

        numbers.forEach((number, i) => {
        const clampedNumber = Math.min(maxValue, Math.max(minValue, number));
        const normalizedNumber = (clampedNumber - minValue) / (maxValue - minValue);
        const x = i * spacing + spacing/2; // Adjust x based on the new spacing
        const y = height - normalizedNumber * height;
        path += `L${x} ${y} `;
        linePath += `L${x} ${y} `;
        });

        path += `L${totalWidth} ${height}Z`;
        const graphLine = `<path d="${path}" fill="url(#${gradientId})" />`;
        const graphBorderLine = `<path d="${linePath}" stroke="${colorHash}" stroke-opacity="0.7" stroke-width="4" fill="none" />`;
        const closingSvgTag = `</svg>`;
        const svgGraph = svg + gradient + graphLine + graphBorderLine + closingSvgTag;

        return svgGraph;
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
        const prate = PRATE;
        const temp = TMP;
        const cloudHigh = TCDC_HIGH;
        const cloudMed = TCDC_MED;
        const snowPrate = SNOW_PRATE;
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
    const getPrecipitationRate = (prate, temp, snowPrate) => {// надо понять в каких юнитах приходят и должны передаваться в эту функцию PRATE & SNOW_PRATE, сейчас входящие значения слишком маленькие для этой функции
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
        prate: this.forecastData.map((item => getPrecipitationRate(item.PRATE, item.TMP, item.SNOW_PRATE))),
        temp: this.forecastData.map((item => calcKelvinToCelsius(item.TMP))),
        timestamp: this.forecastData.map((item => item.timestamp)),
        conditoins: this.forecastData.map((item => calcCoditionType(item))),
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
        for (let i = 0; i < convertedData.conditoins.length; i += 8) {
          const subArrayConditions = convertedData.conditoins.slice(i, i + 8);
          const conditions = getMostPopularCategoryStrings(subArrayConditions);
          const subArrayTemp = convertedData.temp.slice(i, i + 8);
          maxTemp.push(findMax(subArrayTemp));
          minTemp.push(findMin(subArrayTemp));
          mostRecentConditions.push(conditions);
          daysOfWeek.push(getDayOfWeek(convertedData.timestamp[i], this.locationData.offsetSec));
        }
        convertedData.conditoins = mostRecentConditions;
        convertedData.timeline = daysOfWeek;
        convertedData.maxTemp = maxTemp;
        convertedData.minTemp = minTemp;
      }
      console.log(convertedData);
      return convertedData;
    }
    _renderContent(timeValues, numberValues, svgGraph) {
        const mainContent = this.sticker.querySelector('#stickerContent');
        const cell = document.createElement('div');
        const timeSpan = document.createElement('span');
        const valueSpan = document.createElement('span');
        cell.classList.add('sticker__content-cell');
        timeSpan.classList.add('sticker__time-span');
        valueSpan.classList.add('sticker__value-span');
        timeValues.forEach((time, i) => {
            const cellClone = cell.cloneNode(true);
            const timeSpanClone = timeSpan.cloneNode(true);
            const valueSpanClone = valueSpan.cloneNode(true);
            timeSpanClone.textContent = time;
            valueSpanClone.textContent = numberValues[i];
            cellClone.append(timeSpanClone, valueSpanClone);
            mainContent.append(cellClone);
        });
        mainContent.insertAdjacentHTML('beforeend', svgGraph);
    }
    renderData() {
        const convertedData = this._convertData();
        const timeValues = convertedData.convertedValues.map((item) => item.time);
        const windValues = convertedData.convertedValues.map((item) => Math.round(item.wind * 10) /10);

        const windGraph = this._createSVGGraph(convertedData.convertedValues.map((item) => item.wind), '#FF8009', 50, 'sticker__graph_wind');
        // this._renderMiddle(convertedData.conditions[0], convertedData.convertedValues[0].temp, convertedData.convertedValues[0].windDir, convertedData.convertedValues[0].wind);
        this._renderContent(timeValues, windValues, windGraph);

    }
  
  }


const lat = 47.6335;
const lon = -122.335;
// const lat = new URLSearchParams(window.location.search).get('lat');
// const lon = new URLSearchParams(window.location.search).get('lon');

const apiV9 = 'http://localhost:3000/fetchWindyData';
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

Promise.all(requests)
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then((data) => {
    console.log(data);
    const testSticker = new WindySticker(data[0], data[1], stickerElement, testOpts);
    testSticker.renderData();
    console.log(data[1]);
  })
  .catch((err) => console.error(err));
