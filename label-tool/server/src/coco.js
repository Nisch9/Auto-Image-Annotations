// Note: Require the cpu and webgl backend and add them to package.json as peer dependencies.
// import fs from 'fs'
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const sizeOf = require('buffer-image-size');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const tfnode = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const readImage = path => {
  const imageBuffer = fs.readFileSync(path);
  var dimensions = sizeOf(imageBuffer);
  // console.log("image dimenstions", dimensions.width, dimensions.height);
  const tfimage = tfnode.node.decodeImage(imageBuffer);
  console.log(tfimage.data);
  return { image: tfimage, width: dimensions.width, height: dimensions.height };
};
const takeImage = async img => {
  const dict = readImage(img);
  console.log('width');
  console.log(dict['width']);
  console.log('height');
  console.log(dict['height']);
  console.log(dict['image']);
  const predictions = await predictImage(dict['image'], img);
  console.log(predictions);
  console.log(predictions.constructor);
  return predictions;
};
const loadCocoSsdModal = async () => {
  try {
    const model = cocoSsd.load({
      base: 'mobilenet_v2',
    });
    return model;
  } catch {
    return null;
  }
};
function detect_objs(image, model) {
  return new Promise((resolve, reject) => {
    model.detect(image).then(preds => resolve(preds));
  });
}
const predictImage = async (img, img1) => {
  const dict = readImage(img1);
  const model = await loadCocoSsdModal();
  console.log('p');
  const predictions = await detect_objs(img, model);
  console.log('Predictions: ');
  predictions.forEach(element => {
    element['bbox'][0] = element['bbox'][0] / dict['width'];
    element['bbox'][1] = element['bbox'][1] / dict['height'];
    element['bbox'][2] =
      element['bbox'][2] / dict['width'] + element['bbox'][0];
    element['bbox'][3] =
      element['bbox'][3] / dict['height'] + element['bbox'][1];
  });
  return predictions;
};

module.exports = { predictImage, takeImage };
