var canvas = document.querySelector('canvas');
var statusText = document.querySelector('#statusText');

statusText.addEventListener('click', function() {
  statusText.textContent = 'Get Ready...';
  readings = [];
  readSensor.connect()
  .then(() => readSensor.startNotificationsSensorMeasurement().then(handleSensorMeasurement))
  .catch(error => {
    statusText.textContent = error;
  });
});

function handleSensorMeasurement(sensorMeasurement) {
  sensorMeasurement.addEventListener('characteristicvaluechanged', event => {
    var sensorMeasurement = readSensor.parseSensor(event.target.value);
    statusText.innerHTML = sensorMeasurement.sensor + ' &#x027F7';
    readings.push(sensorMeasurement.sensor);
    drawWaves();
  });
}

var readings = [];
var mode = 'bar';

canvas.addEventListener('click', event => {
  mode = mode === 'bar' ? 'line' : 'bar';
  drawWaves();
});

function drawWaves() {
  requestAnimationFrame(() => {
    canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
    canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;

    var low_val = 1000;
    var spread = 150
    var context = canvas.getContext('2d');
    var margin = 2;
    var max = Math.max(0, Math.round(canvas.width / 11));
    var offset = Math.max(0, readings.length - max);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#00796B';
    if (mode === 'bar') {
      for (var i = 0; i < Math.max(readings.length, max); i++) {
        // console.log(canvas.height, readings[i + offset]);
        var barHeight = Math.round(((readings[i + offset ] - low_val) / spread) * canvas.height);
        context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }
    } else if (mode === 'line') {
      context.beginPath();
      context.lineWidth = 6;
      context.lineJoin = 'round';
      context.shadowBlur = '1';
      context.shadowColor = '#333';
      context.shadowOffsetY = '1';
      for (var i = 0; i < Math.max(readings.length, max); i++) {
        var lineHeight = Math.round(((readings[i + offset ] - low_val) / spread) * canvas.height);
        if (i === 0) {
          context.moveTo(11 * i, canvas.height - lineHeight);
        } else {
          context.lineTo(11 * i, canvas.height - lineHeight);
        }
        context.stroke();
      }
    }
  });
}

window.onresize = drawWaves;

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    drawWaves();
  }
});