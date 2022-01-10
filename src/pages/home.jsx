import React, { Component } from "react";
import { Page, Navbar, NavTitle, NavTitleLarge, Link, Toolbar, Block } from "framework7-react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";

const URL = "https://teachablemachine.withgoogle.com/models/yYDzXuF7w/";

let model, webcam, labelContainer, maxPredictions;

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(this.loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      // and class labels
      labelContainer.appendChild(document.createElement("div"));
    }
  };

  loop = async () => {
    webcam.update(); // update the webcam frame
    await this.predict();
    window.requestAnimationFrame(this.loop);
  };

  // run the webcam image through the image model
  predict = async () => {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
      let classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      if (prediction[i].probability > 0.5) {
        classPrediction = `<b>${classPrediction}</b>`;
      }
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }
  };

  render() {
    return (
      <Page name="home">
        <Block>
          <div>Teachable Machine Image Model</div>
          <div id="webcam-container"></div>
          <div id="label-container"></div>
        </Block>
      </Page>
    );
  }
}
