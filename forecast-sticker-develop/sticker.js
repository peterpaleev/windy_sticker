
console.log('teest');
const stickerElement = document.querySelector('#sticker');

// const spotName = document.querySelector('.sticker__spotname');

// const newSpotName = new URLSearchParams(window.location.search).get('spotname');

//if spotname is provided in the url, change spotName textContent to the provided spotname
  // spotName.innerHTML = '0';
const colorStopsTemp = [
  {
    "color": "#0000FF", // Strong Blue
    "value": 200, // Equivalent to -73.15°C
    "alpha": 1
  },
  {
    "color": "#66CCFF", // Light Blue
    "value": 273.15, // Equivalent to 0°C
    "alpha": 1
  },
  {
    "color": "#FFFF66", // Light Yellow
    "value": 300, // Equivalent to 26.85°C
    "alpha": 1
  },
  {
    "color": "#FF0000", // Strong Red
    "value": 313.15, // Equivalent to 40°C
    "alpha": 1
  },
];

const colorStopsWindy = [
  {
    color: "#F0F4F5",
    value: 0,
    alpha: 0.2,
  },
  {
    color: "#C6E3F5",
    value: 2,
    alpha: 0.2,
  },
  {
    color: "#2fdac9",
    value: 5,
    alpha: 0.7,
  },
  {
    color: "#20cf17",
    value: 6,
    alpha: 0.7,
  },
  {
    color: "#EFE31B",
    value: 10,
    alpha: 0.7,
  },
  {
    color: "#D48E28",
    value: 12,
    alpha: 0.7,
  },
  {
    color: "#FA411E",
    value: 15,
    alpha: 0.7,
  },
  {
    color: "#B9235A",
    value: 17,
    alpha: 0.9,
  },
  {
    color: "#841B8B",
    value: 19,
    alpha: 0.9,
  },
  {
    color: "#61238F",
    value: 22,
    alpha: 0.9,
  },
  {
    color: "#311248",
    value: 25,
    alpha: 0.9,
  },
  {
    color: "#190924",
    value: 30,
    alpha: 0.9,
  },
  {
    color: "#000000",
    value: 40,
  },
];
class WindySticker {
  constructor (stickerData, stickerElement, colorStopsWind, colorStopsTemp) {
    this.forecastData = stickerData.response.forecast;
    this.solunarData = stickerData.response.solunarData;
    this.sticker = stickerElement;
    this.barTime = this.sticker.querySelector('#barTime');
    this.barConditions = this.sticker.querySelector('#barConditions');
    this.barTemp = this.sticker.querySelector('#barTemp');
    this.barWind = this.sticker.querySelector('#barWind');
    this.barGusts = this.sticker.querySelector('#barGusts');
    this.barClouds = this.sticker.querySelector('#barClouds');
    this.barPrecipitation = this.sticker.querySelector('#barPrecipitation');
    this.colorStopsWind = colorStopsWind;
    this.colorStopsTemp = colorStopsTemp;
  }

  _createSVGGraph(numbers, colorHash, height, additionalSelector) {
    console.log(numbers);
    let minValue = numbers[0];
    let maxValue = numbers[0];
    numbers.forEach((number) => {
      if (number < minValue) minValue = number;
      if (number > maxValue) maxValue = number;
    });
    if (minValue === maxValue) {
      minValue = 0; 
      maxValue = 10; 
    }
    const gradientId = `graphGradient-${colorHash}`;
    const totalWidth = (window.innerWidth - 26) / 5 * 4;
    const svg = `<svg class="sticker__bar-svg ${additionalSelector}" width="${totalWidth}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    const gradient = `
    <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${colorHash}" stop-opacity="1" />
        <stop offset="100%" stop-color="${colorHash}" stop-opacity="0" />
        </linearGradient>
    </defs>
    `;

    let path = `M0 ${height} `; 

    for(let i = 0; i < numbers.length; i++) {
      const clampedNumber = Math.min(maxValue, Math.max(minValue, numbers[i]));
      const normalizedNumber = (clampedNumber - minValue) / (maxValue - minValue);
      const x = i * 72 + 36; 
      const y = height - normalizedNumber * height;

      if (i === 0) {
          path += `L${x} ${y} `;
      } else {
          const prevX = (i - 1) * 72 + 36;
          const prevY = height - (Math.min(maxValue, Math.max(minValue, numbers[i - 1])) - minValue) / (maxValue - minValue) * height;
          const cp1x = (prevX + x) / 2;
          const cp1y = prevY;
          const cp2x = cp1x;
          const cp2y = y;
          path += `C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y} `;
      }
    }

    path += `L${totalWidth} ${height}Z`;
    const graphLine = `<path d="${path}" fill="url(#${gradientId})" />`;
    const closingSvgTag = `</svg>`;
    const svgGraph = svg + gradient + graphLine + closingSvgTag;

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
    const hexToRGBA = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`;
    }
    const createGradientWind = (values, colorStops) => {
      // Sort the color stops by value in ascending order
      colorStops.sort((a, b) => a.value - b.value);
    
      const stopInterval = 100 / (values.length);
      const gradientStops = values.map((value, index) => {
        for (let i = 0; i < colorStops.length; i++) {
          const stop = colorStops[i];
          if (value <= stop.value) {
            const rgbaColor = hexToRGBA(stop.color, stop.alpha);
            const position = (index * stopInterval) + stopInterval / 2;
            return `${rgbaColor} ${position}%`;
          }
        }
      });
    
      return `linear-gradient(to right, ${gradientStops.join(', ')})`;
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
    const convertedData = {
      convertedValues: this.forecastData.map((item) => ({
        time: cutTimeFromDate(item.date),
        temp: calcKelvinToCelsius(item.TMP),
        wind: calcWindSpeed(item.UGRD, item.VGRD),
        gust: item.GUST,
        precipitation: calcPrecipitationInMM(item.PRATE, item.SNOW_PRATE),
      })),
      gradients: {
        cloud: {
          high: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_HIGH)),
          medium: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_MED)),
          low: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_LOW)),
        },
        wind: createGradientWind(this.forecastData.map((item) => calcWindSpeed(item.UGRD, item.VGRD)), this.colorStopsWind),
        gust: createGradientWind(this.forecastData.map((item) => item.GUST), this.colorStopsWind),
        temp: createGradientWind(this.forecastData.map((item) => item.TMP), this.colorStopsTemp),
      },
      conditions: this.forecastData.map((item) => calcCoditionType(item)),
    };
    console.log(convertedData);
    return convertedData;
  }
  renderData() {
    const convertedData = this._convertData();
    const bars = {
      time: this.barTime.querySelectorAll('.sticker__bar-item'),
      temp: this.barTemp.querySelectorAll('.sticker__bar-item'),
      wind: this.barWind.querySelectorAll('.sticker__bar-item'),
      gust: this.barGusts.querySelectorAll('.sticker__bar-item'),
      precipitation: this.barPrecipitation.querySelectorAll('.sticker__bar-item'),
      conditions: this.barConditions.querySelectorAll('.sticker__bar-item'),
    };
    const dataTypeToProperty = {
      time: 'time',
      temp: 'temp',
      wind: 'wind',
      gust: 'gust',
      precipitation: 'precipitation',
    };
    bars.conditions.forEach((item, index) => {
      item.src = './images/' + convertedData.conditions[index] + '.svg';
    });
    function renderBarChilds(bar, dataType) {
      const barChilds = bars[dataType];
      const dataValues = convertedData.convertedValues.map((item) => {
        switch (dataType) {
          case 'time':
            return item.time;
          case 'temp':
            return item.temp;
          case 'wind':
            return Math.floor(item.wind);
          case 'gust':
            return Math.floor(item.gust);
          case 'precipitation':
            return Math.floor(item.precipitation);
          default:
            return '';
        }
      });
    
      barChilds.forEach((child, index) => {
        child.textContent = dataValues[index];
      });
    }
    
    Object.keys(bars).forEach((dataType) => {
      renderBarChilds(this[dataType], dataType);
    });
    const precipitationNumbers = convertedData.convertedValues.map((item) => item.precipitation);
    const precipitationGraph = this._createSVGGraph(precipitationNumbers, '#44CFCB', 29.5, 'sticker__bar-svg_precipitation');
    this.barPrecipitation.querySelector('#svgWrapperPrecipitation').innerHTML = precipitationGraph;

    this.barClouds.querySelector('#gradientCloudsHigh').style.background = convertedData.gradients.cloud.high;
    this.barClouds.querySelector('#gradientCloudsMedium').style.background = convertedData.gradients.cloud.medium;
    this.barClouds.querySelector('#gradientCloudsLow').style.background = convertedData.gradients.cloud.low;
    this.barWind.style.background = convertedData.gradients.wind;
    this.barGusts.style.background = convertedData.gradients.gust;
    this.barTemp.style.background = convertedData.gradients.temp;
    this.sticker.querySelector('#spotName').textContent = window.innerWidth + ' x ' + window.innerHeight;
  }

}

const stickerData = [];

//get lat lon from url query params
const lat = 41.736751;
const lon = 44.768053;
// const lat = new URLSearchParams(window.location.search).get('lat');
// const lon = new URLSearchParams(window.location.search).get('lon');

fetch('http://localhost:3000/fetchWindyData?forecast_fields=solunar&from_ts=' + Math.floor(Date.now() / 1000) + '&lat=' + lat + '&lon=' + lon + '&method=getForecastForLatLonTypeNew&type=GFS27&to_ts=' + Math.floor(Date.now() / 1000 + 54000))
  .then((res) => {
    console.log(res);
    return res.json();
  })
  .then((data) => {
    console.log(data);
    const testSticker = new WindySticker(data, stickerElement, colorStopsWindy, colorStopsTemp);
    testSticker.renderData();
  })
  .catch((err) => console.error(err));




