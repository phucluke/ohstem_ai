import React, { Component } from "react";
import { Button, Card, List, ListInput, Icon, Row, Col } from "framework7-react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";

let webcam;
let ctx;
let canvas;

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    canvas = document.getElementById("imageCanvas");
    ctx = canvas.getContext("2d");
  }

  startWebcam = async () => {
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(this.loop);
    document.getElementById("webcam-container").appendChild(webcam.canvas);
  };

  captureWebcam = async () => {
    document.getElementById("capture-container").appendChild(this.cloneCanvas(webcam.canvas));
  };

  loop = async () => {
    webcam.update(); // update the webcam frame
    window.requestAnimationFrame(this.loop);
  };

  cloneCanvas = (oldCanvas) => {
    let newCanvas = document.createElement("canvas");
    const context = newCanvas.getContext("2d");

    newCanvas.width = oldCanvas.width > oldCanvas.height ? oldCanvas.height : oldCanvas.width;
    newCanvas.height = newCanvas.width;
    context.drawImage(oldCanvas, 0, 0);

    return newCanvas;
  };

  onFileChange = (e) => {
    var reader = new FileReader();
    reader.onload = (event) => {
      var img = new Image();
      img.onload = () => {
        document.getElementById("capture-container").appendChild(this.cloneCanvas(img));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  render() {
    return (
      <Card
        outline
        title={
          <div style={{ width: "100%" }} className="display-flex justify-content-space-between align-items-center">
            <List inset>
              <ListInput type="text" placeholder="Class name" />
            </List>
            <Button>
              <Icon ios="f7:clear" md="material:clear"></Icon>
            </Button>
          </div>
        }
        videocam
        content={
          <div>
            <div>Add Image Samples:</div>
            <Row>
              <Col>
                <Button onClick={this.startWebcam}>
                  <Icon ios="f7:videocam" md="material:videocam"></Icon>
                </Button>
                <input type="file" onChange={this.onFileChange} />
                <div id="webcam-container"></div>
                <Button onClick={this.captureWebcam}>Record</Button>
              </Col>
              <Col>
                <div id="capture-container"></div>
              </Col>
            </Row>
            <Row>
              <Col>
                <canvas id="imageCanvas"></canvas>
              </Col>
            </Row>
          </div>
        }
      ></Card>
    );
  }
}
