
console.log('teest');
const stickerElement = document.querySelector('#sticker');

// const spotName = document.querySelector('.sticker__spotname');

// const newSpotName = new URLSearchParams(window.location.search).get('spotname');

//if spotname is provided in the url, change spotName textContent to the provided spotname
  // spotName.innerHTML = '0';

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
  constructor (stickerData, stickerElement) {
    this.data = stickerData;
    this.sticker = stickerElement;
    this.barTime = this.sticker.querySelector('#barTime');
    this.barConditions = this.sticker.querySelector('#barConditions');
    this.barTemp = this.sticker.querySelector('#barTemp');
    this.barWind = this.sticker.querySelector('#barWind');
    this.barGusts = this.sticker.querySelector('#barGusts');
    this.barClouds = this.sticker.querySelector('#barClouds');
    this.barPrecipitation = this.sticker.querySelector('#barPrecipitation');
  }
  convertData() {
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
    const generateLinearGradientOfClouds = (values) => {
      const stops = values.map((value) => {
        const opacity = 1 - (value / 100);
        const rgbaColor = `rgba(255, 255, 255, ${opacity})`;
    
        return rgbaColor;
      });
    
      const linearGradient = `linear-gradient(to bottom, ${stops.join(', ')})`;
    
      return linearGradient;
    }
    const convertedData = [];
    this.data.forEach((item) => {
      convertedData.push({
        time: cutTimeFromDate(item.date),
        temp: calcKelvinToCelsius(item.TMP),
        wind: calcMsToKmh(calcWindSpeed(item.UGRD, item.VGRD)),
        gust: calcMsToKmh(item.GUST),
        precipitation: calcPrecipitationInMM(item.PRATE, item.SNOW_PRATE)
      }) 
    });
    return convertedData;
  }
  renderData() {
    const convertedData = this.convertData();
    const renderBarChilds = (bar, dataType) => {
      const barChilds = bar.querySelectorAll('.sticker__bar-item');
      const childValues = [];
      switch (dataType) {
        case 'time':
          convertedData.forEach((item) => {childValues.push(item.time)});
          
          break;
        case 'temp':
          convertedData.forEach((item) => {childValues.push(item.temp)});
          break;
        case 'wind': 
          convertedData.forEach((item) => {childValues.push(Math.floor(item.wind))});
          break;
        case 'gust':
          convertedData.forEach((item) => {childValues.push(Math.floor(item.gust))});
          break;
        case 'precipitation':
          convertedData.forEach((item) => {childValues.push(item.precipitation)});
          break;
      }
      console.log(childValues);
      barChilds.forEach((child, index) => {
        child.textContent = childValues[index];
      });
    }
    renderBarChilds(this.barTime, 'time');
    renderBarChilds(this.barTemp, 'temp');
    renderBarChilds(this.barWind, 'wind');
    renderBarChilds(this.barGusts, 'gust');
    renderBarChilds(this.barPrecipitation, 'precipitation');
  }

}

const stickerData = [];
fetch('http://localhost:3000/fetchWindyData')
  .then((res) => {
    console.log(res);
    return res.json();
  })
  .then((data) => {
    console.log(data);
    data.response.forecast.forEach((item) => {
      if (item.timestamp >= Date.now() / 1000 && item.timestamp < Date.now() / 1000 + 54000) {
        const stickerItem = {};
        stickerItem.date = item.date;
        stickerItem.TMP = item.TMP;
        stickerItem.UGRD = item.UGRD_GFSPLUS;
        stickerItem.VGRD = item.VGRD_GFSPLUS;
        stickerItem.GUST = item.GUST;
        stickerItem.TCDC_TOTAL = item.TCDC_TOTAL;
        stickerItem.TCDC_LOW = item.TCDC_LOW;
        stickerItem.TCDC_MED = item.TCDC_MED;
        stickerItem.TCDC_HIGH = item.TCDC_HIGH;
        stickerItem.PRATE = item.PRATE;
        stickerItem.SNOW_PRATE = item.SNOW_PRATE;
        stickerData.push(stickerItem);
      }
      
    });
    const testSticker = new WindySticker(stickerData, stickerElement);
    testSticker.renderData();
  })
  .then((err) => console.error(err));
console.log(window.myData);




