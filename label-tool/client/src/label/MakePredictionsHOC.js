import React, { Component } from 'react';
import { genId } from './utils';
import { vectorizeSegmentation } from './tracing';
// import {predictImage} from '/'

export function withPredictions(Comp) {
  return class PredictionsLayer extends Component {
    constructor(props) {
      super(props);
      this.state = {
        models: [],
      };

      this.makePrediction = this.makePrediction.bind(this);
    }

    async makePrediction(model, options = {}) {
      const { imgB64, b64Scaling, height, width, fetch, imageUrl } = this.props;
      console.log(this.props);
      const { id } = model;

      const response = await fetch('/api/mlmodels/' + id, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              input_bytes: {
                b64: imgB64,
                imgurl: imageUrl,
              },
            },
          ],
        }),
      });
      const resp = await response.json();
      // const resp = await (await req).json();
      console.log('hey');
      console.log(resp);
      console.log(resp.constructor);
      const arr = [];
      resp.forEach(fun);
      function fun(item) {
        arr.push(item['bbox']);
      }
      console.log('Heyyyy');
      console.log(arr);
      if (model.type === 'object_detection') {
        const preds = [];
        arr.forEach(fun1);
        function fun1(item) {
          console.log(width);
          console.log(height);
          const x1 = item[0];
          const y1 = item[1];
          const x2 = item[2];
          const y2 = item[3];
          preds.push({
            type: 'bbox',
            color: 'gray',
            points: [
              { lng: x1 * width, lat: (1 - y1) * height },
              { lng: x2 * width, lat: (1 - y2) * height },
            ],

            id: genId(),
            modelId: model.id,
          });
        }
        console.log(preds);
        return preds;
      } else if (model.type === 'semantic_segmentation') {
        console.log(width);
        console.log(height);
        const imageData = resp[0].raw_image;
        const { smoothing } = options;
        const vectors = vectorizeSegmentation(imageData, {
          scaling: b64Scaling,
          smoothing,
        });
        return vectors.map(path => ({
          type: 'polygon',
          color: 'gray',
          points: path,
          id: genId(),
          modelId: model.id,
        }));
      }

      return resp.predictions;
    }

    async componentDidMount() {
      const { fetch } = this.props;
      const models = await (await fetch('/api/mlmodels')).json();
      this.setState({ models });
    }

    render() {
      const { props, state } = this;
      const { imgB64, ...passedProps } = props;
      const { models } = state;
      const newProps = {
        models,
        makePrediction: this.makePrediction,
      };

      return <Comp {...newProps} {...passedProps} />;
    }
  };
}
