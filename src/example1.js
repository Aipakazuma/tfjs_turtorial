// JavaScript

import * as tf from '@tensorflow/tfjs';
import {Webcam} from './webcam';

let mobilenet;
let isPredicting = false;

function label_to_text(classId) {
  const labels = ['高坂桐乃', '高坂京介', '黒猫', '新垣あやせ', '田村麻奈実', '来栖加奈子', '沙織・バジーナ'];
  return labels[classId];
}

function _reshape(img) {
  const img2 = tf.image.resizeBilinear(img, [28,28]);
  return img2.reshape([1, 1, 28, 28]);
}

document.addEventListener("DOMContentLoaded", function() {
  const webcam = new Webcam(document.getElementById('webcam'));
  const display = document.getElementById('display');

  document.getElementById('predict').addEventListener('click', () => {
    console.log('click!');
    isPredicting = true;
    predict();
  });

  async function loadModel() {
    tf.loadModel('https://s3.us-east-2.amazonaws.com/tfjs-demo/mobilenet/model.json')
      .then(model => {
      const m = tf.model({inputs: model.inputs, outputs: model.outputs});
      const img = webcam.capture();
      const img2 = _reshape(img);

      // test
      const predicts = m.predict(img2);
      console.log(predicts.dataSync());
      console.log(predicts.argMax().dataSync()[0]);

      // よくわからんが、returnで帰ってこないので
      // こうする
      mobilenet = m;
      return m;
    });
  }

  async function predict() {
    if (isPredicting) {
      isPredicting = false;
      const predictedClass = tf.tidy(() => {
        // Capture the frame from the webcam.
        const img = webcam.capture();
        const img2 = _reshape(img);

        const predictions = mobilenet.predict(img2);

        const classId = predictions.argMax().dataSync();
        return predictions.argMax();
      });

      const classId = (await predictedClass.data());
      const label = label_to_text(classId[0])
      document.getElementById('display').innerText = label;
      return classId;
    }

  }

  async function init() {
    await webcam.setup();
    mobilenet = await loadModel();
  }

  init();
});
