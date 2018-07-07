// JavaScript

import * as tf from '@tensorflow/tfjs';
// import {Webcam} from './webcam';

let mobilenet;
let isPredicting = false;
const labels = ['高坂桐乃',
  '高坂京介',
  '黒猫',
  '新垣あやせ',
  '田村麻奈実',
  '来栖加奈子',
  '沙織・バジーナ'];

function label_to_text(classId) {
  return labels[classId];
}

function _reshape(img) {
  console.log(img);
  const img2 = tf.image.resizeBilinear(img, [28,28]);
  return tf.cast(img2.reshape([1, 1, 28, 28]), 'float32');
}

function createBarGraph(dataSet) {
  var width = 300;
  var height = 200;
  var elementName = '#bar';

  //グラフの各値をいい感じのwidthにするための変換関数
  var x = d3.scaleLinear() //配列の中身が数字 かつ 線形なグラフのとき
    .domain([0, 1]) //グラフがとりうる値の範囲
    .rangeRound([80, width + 50])
  //実際の長さとしての範囲をいくつからいくつにするか。マージンをどの程度取りたいかの指定として使える。

  //グラフのラベル数にもとづいて、項目間の幅をいい感じにするための変換関数
  var y = d3
    .scaleBand() //配列の中身がラベルのとき
    .domain(labels) //配列をそのまま渡す
    .rangeRound([20, height]); //実際の長さとしての範囲をいくつからいくつにするか

  //xとyは軸の描画でも使う

  //グラフ用のsvg要素に棒グラフの「棒（rect）」を追加する
  d3
    .select(elementName) // svg要素を指定
    .selectAll('rect') // その中のrect要素を抽出（なければ空オブジェクトが返ってくる）
    .data(dataSet) // 描画元のデータを指定
    .enter() // selectAllで足りない分の要素を確保する
    .append('rect'); //確保した要素にrectとして追加する

  //棒グラフの「棒」の部分の描画
  d3.select(elementName).selectAll('rect')
    .attr("class", "bar") //棒グラフであることを明示（必須ではない）
    .attr("x", function(d){
      return x(0);
    })
    //各値のx座標を指定。左端にしたいので0にする。
    //ここで、x関数をかませることで、マージンを考慮した「左端」が指定できる
    .attr("y", function(d, i){
      return y(labels[i]);
    })
    //各要素のy座標をy関数を使って指定。y関数はlabels内の要素に紐付いているので、y(labels)の形式になる。
    //iはdataSetの何番目の要素を参照しているかが入る
    .attr("height", 15)
    //各棒の縦の長さ（今回は棒の幅）
    // .attr("width", function(d){
    //   return x(d);
    // })
    // .attr("width", 0) //this is the initial value
    .transition()
    .duration(500) //time in ms
    .attr("width", function(d){
        return x(d);
    })//now, the final value
    //各棒の横の長さ（今回は棒の長さ）
    //dはdataSetの値そのものが入る。x関数を噛ませて長さを指定。
    .attr("fill", "#6fbadd");
    //棒の色

  //棒グラフのx軸の描画
  d3.select(elementName) //グラフ用のsvg要素を持ってくる
  .append("g") //軸描画用の要素を追加（gという名前じゃないと動かない）
  .attr("class", "axis axis--x") //x軸用の要素を追加
  .attr("transform", "translate(0, 20)") //(0,20)の位置を起点として描画
  .call(d3.axisTop(x)); //上に軸が出るように設定

　//棒グラフのy軸の描画
  d3.select(elementName) //グラフ用のsvg要素を持ってくる
  .append("g") //軸描画用の要素を追加（gという名前じゃないと動かない）
  .attr("class", "axis axis--y") //y軸用の要素を追加
  .attr("transform", "translate(80, 0)") //(80,0)の位置を起点として描画
  .call(d3.axisLeft(y)); //左に軸が出るように設定
}

function post() {
  var url = document.getElementById('image-url').value;
  if (url == '') return;

  var requestJson = JSON.stringify({'url': url});
  var xhr = new XMLHttpRequest();
  var url = 'https://localhost:8000/get_image';
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);

          var img = json['img'];
          var imgElement = document.getElementById('get-image');
          imgElement.setAttribute('src', 'data:image/png;base64,' + img);
      }
  };
  xhr.send(requestJson);
}

function base64ToImage(base64img) {
  var img = new Image();
  img.onload = function() {
    return img;
  };
  img.src = base64img;
  return img;
}

function createImageData(img) {
  var cv = document.createElement('canvas');
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight;

  var ct = cv.getContext('2d');
  ct.drawImage(img, 0, 0);

  var data = ct.getImageData(0, 0, cv.width, cv.height);
  return data;
}

function grayScale(img) {
  var cv = document.createElement('canvas');
  var ct = cv.getContext('2d');
  var dst = ct.createImageData(img.width, img.height);
  for (var i = 0; i < img.data.length; i=i+4) {
    var pixel = (img.data[i] + img.data[i+1] + img.data[i+2]) / 3;
    dst.data[i] = dst.data[i+1] = dst.data[i+2] = pixel;
    dst.data[i+3] = img.data[i+3];
  }

  return dst;
}

document.addEventListener("DOMContentLoaded", function() {
  // const webcam = new Webcam(document.getElementById('webcam'));
  const display = document.getElementById('display');

  document.getElementById('submit-button').addEventListener('click', () => {
    console.log('submit');
    post();
  });

  document.getElementById('get-image').addEventListener('chnage', () => {
    console.log('img change!');
    isPredicting = true;
    predict();
  });

  document.getElementById('predict').addEventListener('click', () => {
    console.log('click!');
    isPredicting = true;
    predict();
  });

  async function loadModel() {
    tf.loadModel('https://localhost:8000/mobilenet/model.json')
      .then(model => {
      const m = tf.model({inputs: model.inputs, outputs: model.outputs});
      // // const img = webcam.capture();
      // const img2 = _reshape(img);

      // // test
      // const predicts = m.predict(img2);
      // console.log(predicts.dataSync());
      // console.log(predicts.argMax().dataSync()[0]);

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
        // const img = webcam.capture();
        var imgElement = document.getElementById('get-image');
        // base64 -> img
        var ___img = base64ToImage(imgElement.src);
        // img -> canvas
        var __img = createImageData(___img);
        // canvas -> grayscale
        // canvas -> tensor
        var img = tf.fromPixels(__img, 1);
        const img2 = _reshape(img);

        const predictions = mobilenet.predict(img2);

        const classId = predictions.argMax().dataSync();
        createBarGraph(predictions.dataSync());
        return predictions.argMax();
      });

      const classId = (await predictedClass.data());
      const label = label_to_text(classId[0])
      document.getElementById('display').innerText = label;
      return classId;
    }

  }

  async function init() {
    // await webcam.setup();
    mobilenet = await loadModel();
  }

  init();
});
