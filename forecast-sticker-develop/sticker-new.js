const stickerElement = document.querySelector('#sticker');

class WindySticker {
    constructor (stickerData, stickerElement) {
      this.forecastData = stickerData.response.forecast;
      this.solunarData = stickerData.response.solunarData;
      this.sticker = stickerElement;
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
    //   const hexToRGBA = (hex, alpha) => {
    //     const r = parseInt(hex.slice(1, 3), 16);
    //     const g = parseInt(hex.slice(3, 5), 16);
    //     const b = parseInt(hex.slice(5, 7), 16);
    //     return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`;
    //   }
    //   const createGradientWind = (values, colorStops) => {
    //     colorStops.sort((a, b) => a.value - b.value);
      
    //     const stopInterval = 100 / (values.length);
    //     const gradientStops = values.map((value, index) => {
    //       for (let i = 0; i < colorStops.length; i++) {
    //         const stop = colorStops[i];
    //         if (value <= stop.value) {
    //           const rgbaColor = hexToRGBA(stop.color, stop.alpha);
    //           const position = (index * stopInterval) + stopInterval / 2;
    //           return `${rgbaColor} ${position}%`;
    //         }
    //       }
    //     });
      
    //     return `linear-gradient(to right, ${gradientStops.join(', ')})`;
    //   }
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
      const convertedData = {
        convertedValues: this.forecastData.map((item) => ({
          time: cutTimeFromDate(item.date),
          temp: calcKelvinToCelsius(item.TMP),
          wind: calcWindSpeed(item.UGRD, item.VGRD),
          windDir: calcWindDirection(item.UGRD, item.VGRD),
          gust: item.GUST,
          precipitation: calcPrecipitationInMM(item.PRATE, item.SNOW_PRATE),
        })),
        gradients: {
          cloud: {
            high: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_HIGH)),
            medium: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_MED)),
            low: generateLinearGradientOfClouds(this.forecastData.map((item) => item.TCDC_LOW)),
          },
        //   wind: createGradientWind(this.forecastData.map((item) => calcWindSpeed(item.UGRD, item.VGRD)), this.colorStopsWind),
        //   gust: createGradientWind(this.forecastData.map((item) => item.GUST), this.colorStopsWind),
        //   temp: createGradientWind(this.forecastData.map((item) => item.TMP), this.colorStopsTemp),
        },
        conditions: this.forecastData.map((item) => calcCoditionType(item)),
      };
      console.log(convertedData);
      return convertedData;
    }
    _renderMiddle(conditions, temp, windDir, windSpeed) {
        const stickerMiddle = this.sticker.querySelector('#stickerMiddle');
        const conditionsImg = document.createElement('img');
        const tempSpan = document.createElement('span');
        const windDirImg = document.createElement('img');
        const windSpeedSpan = document.createElement('span');
        conditionsImg.src = './images/' + conditions + '.svg';
        conditionsImg.alt = conditions;
        conditionsImg.classList.add('sticker__conditions-img');
        tempSpan.textContent = temp + '°';
        tempSpan.classList.add('sticker__span_big');
        windDirImg.src = './images/wind-arrow.svg';
        windDirImg.style.transform = 'rotate(' + windDir + 90 + 'deg)';
        windDirImg.classList.add('sticker__wind-dir-img');
        windSpeedSpan.textContent = Math.round(windSpeed * 10) / 10;
        windSpeedSpan.classList.add('sticker__span_big');
        stickerMiddle.append(conditionsImg, tempSpan, windDirImg, windSpeedSpan);
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
        const mainContentHeight = this.sticker.querySelector('#stickerContent').clientHeight;
        const timeValues = convertedData.convertedValues.map((item) => item.time);
        const windValues = convertedData.convertedValues.map((item) => Math.round(item.wind * 10) /10);

        const windGraph = this._createSVGGraph(convertedData.convertedValues.map((item) => item.wind), '#FF8009', mainContentHeight - 80, 'sticker__graph_wind');
        this._renderMiddle(convertedData.conditions[0], convertedData.convertedValues[0].temp, convertedData.convertedValues[0].windDir, convertedData.convertedValues[0].wind);
        this._renderContent(timeValues, windValues, windGraph);

    }
  
  }

  //get lat lon from url query params
// const lat = 36.46768069827348;
// const lon = -4.757080078125001;
const lat = new URLSearchParams(window.location.search).get('lat');
const lon = new URLSearchParams(window.location.search).get('lon');

const hours = new URLSearchParams(window.location.search).get('hours');
fetch('http://localhost:3000/fetchWindyData?forecast_fields=solunar&from_ts=' + Math.floor(Date.now() / 1000) + '&lat=' + lat + '&lon=' + lon + '&method=getForecastForLatLonTypeNew&type=GFS27&to_ts=' + Math.floor(Date.now() / 1000 + 3600 * 18))
  .then((res) => {
    console.log(res);
    return res.json();
  })
  .then((data) => {
    console.log(data);
    const testSticker = new WindySticker(data, stickerElement);
    testSticker.renderData();
  })
  .catch((err) => console.error(err));