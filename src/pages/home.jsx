import React, { Component } from "react";
import { Page, Navbar, Button, Block, f7, List, ListInput, Icon, Row, Col } from "framework7-react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import $ from "jquery";

import ImageClass from "../components/ImageClass";
import * as utils from "../js/utils";

let model, webcam, labelContainer, maxPredictions;

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { activeClassId: "", step: "SAMPLE" }; // TRAINING, PREVIEW
  }

  componentDidMount() {
    //this.init();
  }

  training = async () => {
    this.setState({ step: "TRAINING" });

    const className1 = $("#card-class-1 .class-name input").val();
    const className2 = $("#card-class-2 .class-name input").val();

    const samples1 = document.querySelectorAll("#card-class-1 #capture-container canvas");
    const samples2 = document.querySelectorAll("#card-class-2 #capture-container canvas");

    if (!className1.length || !className2.length) {
      f7.dialog.alert("Please fill Class Names");
      return;
    }


    if (!samples1.length || !samples2.length) {
      f7.dialog.alert("Please add Samples");
      return;
    }


    f7.dialog.preloader("Processing...");

    const LABELS = [className1, className2];

    const MODEL_METADATA = {
      tfjsVersion: tf.version.tfjs,
      tmVersion: "2.4.4",
      packageVersion: tmImage.version,
      packageName: "@teachablemachine/image",
      timeStamp: new Date().toISOString(),
      userMetadata: {},
      modelName: "classify-two-objects",
      labels: LABELS,
      imageSize: tmImage.IMAGE_SIZE,
    };

    const MODEL_OPTIONS = {
      version: 2,
      alpha: 0.35,
      trainingLayer: 16,
    };

    const MODEL_PARAMETERS = {
      denseUnits: 100,
      epochs: 50,
      learningRate: 0.001,
      batchSize: 16,
    };

    model = await tmImage.createTeachable(MODEL_METADATA, MODEL_OPTIONS);
    model.setLabels(MODEL_METADATA.labels);

    console.log(tmImage.IMAGE_SIZE);

    samples1.forEach(async (canvas) => {
      await model.addExample(0, canvas);
    });

    samples2.forEach(async (canvas) => {
      await model.addExample(1, canvas);
    });

    // Train model
    await model.train(MODEL_PARAMETERS, {
      onEpochBegin: async (epoch, logs) => {
        console.log("onEpochBegin -> Epoch: " + epoch + " " + JSON.stringify(logs));
      },
      onEpochEnd: async (epoch, logs) => {
        console.log("onEpochEnd -> Epoch: " + epoch + " " + JSON.stringify(logs));
      },
    });

    // Update max classes
    maxPredictions = model.getTotalClasses();

    f7.dialog.close();

    this.setState({ step: "PREVIEW" });

    // // Save model
    // await model.save(PATH);
  };

  setActiveClassId = (id) => {
    this.setState({ activeClassId: id, step: "SAMPLE" });
  };

  preview = async () => {
    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();

    window.requestAnimationFrame(this.loop);

    // append elements to the DOM
    document.getElementById("preview-webcam-container").appendChild(webcam.canvas);
    utils.scrollToElSelector("#label-container");
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
    const { activeClassId, step } = this.state;
    return (
      <Page name="home">
        <Navbar title="Teachable Machine Image Model"></Navbar>
        <Block>
          <ImageClass
            id="class-1"
            active={activeClassId === "class-1"}
            setActiveClassId={this.setActiveClassId}
            step={step}
          />
          <ImageClass
            id="class-2"
            active={activeClassId === "class-2"}
            setActiveClassId={this.setActiveClassId}
            step={step}
          />
          <Button fill onClick={this.training}>
            Training
          </Button>
          <br />
          {step === "PREVIEW" && (
            <>
              <Button fill onClick={this.preview}>
                Preview
              </Button>

              <div id="preview-webcam-container"></div>
              <div id="label-container"></div>
            </>
          )}
        </Block>
      </Page>
    );
  }
}
