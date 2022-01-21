import React, { Component } from "react";
import { Button, Card, List, ListInput, Icon, Row, Col } from "framework7-react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import $ from "jquery";

import * as utils from "../js/utils";

let webcam;
let ctx;
let canvas;

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = { showRecord: false };
  }

  componentDidMount() {}

  startWebcam = async () => {
    if ($(`#card-${this.props.id} #webcam-container canvas`).length) {
      return;
    }
    this.props.setActiveClassId(this.props.id);
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(224, 224, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(this.loop);
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    this.setState({ showRecord: true });
  };

  captureWebcam = async () => {
    $(`#card-${this.props.id} #capture-container`).prepend(utils.cloneCanvas(webcam.canvas));
  };

  loop = async () => {
    webcam.update(); // update the webcam frame
    window.requestAnimationFrame(this.loop);
  };

  onFileChange = (e) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();
      reader.onload = (event) => {
        var img = new Image();
        img.onload = () => {
          $(`#card-${this.props.id} #capture-container`).prepend(utils.cloneCanvas(utils.cropTo(img)));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(files[i]);
    }
  };

  render() {
    return (
      <Card
        id={`card-${this.props.id}`}
        outline
        title={
          <div style={{ width: "100%" }} className="display-flex justify-content-space-between align-items-center">
            <List inset>
              <ListInput type="text" placeholder="Class name" className="class-name" />
            </List>

            {/* <Button>
              <Icon ios="f7:clear" md="material:clear"></Icon>
            </Button> */}
          </div>
        }
        videocam
        content={
          <div>
            <div>Add Image Samples:</div>
            <Row>
              <Col width="100" medium="30">
                <Button iconIos="f7:videocam" iconMd="material:videocam" onClick={this.startWebcam}></Button>

                <p>
                  <input multiple type="file" onChange={this.onFileChange} />
                </p>
                
                {this.props.active && this.props.step === "SAMPLE" && <div id="webcam-container"></div>}

                {this.state.showRecord && this.props.active && this.props.step === "SAMPLE" && <Button onClick={this.captureWebcam}>Record</Button>}
              </Col>
              <Col width="100" medium="70">
                <div id="capture-container"></div>
              </Col>
            </Row>
          </div>
        }
      ></Card>
    );
  }
}
