/*
  based on: https://observablehq.com/@rreusser/instanced-webgl-circles
*/
let video;
let poseNet; 
let poses = [];


let rh_X=200;
let rh_Y=200;

let lh_X=200;
let lh_Y=200;


let prh_X;
let prh_Y;

let plh_X;
let plh_Y;

let max_count = 3000;
let min_count = 100;
let max_vertex = 35;
let min_vertex = 3;


let circle_count;
let vertex_count;

function setup() {
  createCanvas(700, 700);
  video = createCapture(VIDEO);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);

  poseNet.on('pose', function(results) {
    poses = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {

  background(0);
  translate(width / 2, height / 2);

  update_circles();


  for (let ci = 0; ci < circle_count; ci++) {
    let time = float(frameCount) / 20;

    let theta_c = map(ci, 0, circle_count, 0, TWO_PI);
    
    if (lh_Y>400){
        lh_Y=200;
    }
    
    let scale=map(lh_Y, 0, 400, 200, 400);


    let circle_center = get_center(theta_c, time, scale);
    let circle_size = get_size(theta_c, time, scale);
    let c = get_color(theta_c, time);


    stroke(c);
    noFill();
    beginShape();
    for (let vi = 0; vi < vertex_count; vi++) {
      
      if (lh_X>400){
        lh_X=200;
      }
      
      let angle=map(lh_X, 0, 400, 0, TWO_PI);
      let theta_v = map(vi, 0, vertex_count, 0, angle);
      let x = circle_center.x + cos(theta_v) * circle_size;
      let y = circle_center.y + sin(theta_v) * circle_size;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
  update_poses();
}

function update_circles() {
  if (rh_X>400){
    rh_X=200;
  }
  if (rh_Y>400){
    rh_Y=200;
  }
  let pos_x=map(rh_X, 0, 400, 0, width);
  let pos_y=map(rh_Y, 0, 400, 0, width);
  let xoffset = abs(pos_x - width / 2);
  console.log(xoffset);
  let yoffset = abs(pos_y - height / 2);
  console.log(yoffset);
  circle_count = int(map(xoffset, 0, width / 2, max_count, min_count));
  vertex_count = int(map(yoffset, 0, height / 2, max_vertex, min_vertex));
}

function get_center(theta, time, scale) {
  let direction = new p5.Vector(cos(theta), sin(theta));
  let distance = 0.6 + 0.2 * cos(theta * 6.0 + cos(theta * 8.0 + time));
  let circle_center =direction.mult(distance * scale);
  return circle_center;
}

function get_size(theta, time, scale) {
  let offset = 0.2 + 0.12 * cos(theta * 9.0 - time * 2.0);
  let circle_size = scale * offset;
  return circle_size;
}

function get_color(theta, time) {
  let _r=map(rh_X, 0, 400, 2.0, 8.0);
  let _g=map(lh_X, 0, 400, 0.2, 3.0);
  let _b=map(rh_Y, 0, 400, 0.2, 1.2);
  let th = _r * theta + time * 2.0;
  let r = 0.6 + 0.4 * cos(th);
  let g = 0.6 + _g * cos(th - PI / 3);
  let b = 0.6 + _b* cos(th - PI * 2.0 / 3.0);
  alpha = map(circle_count, min_count, max_count, 150, 50);
  return color(r * 255, g * 255, b * 255, alpha);
}

function update_poses() {
  console.log('inside');
  // Loop through all the poses detected
  for (let i = 0; i < min(poses.length, 1); i++) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = poses[i].pose.keypoints[j];
      // console.log(keypoint);
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        if (keypoint.part == 'leftWrist') {
          lh_X = keypoint.position.x;
          lh_Y = keypoint.position.y;
          plh_X = lh_X;
          plh_Y = lh_Y;
        }
        if (keypoint.part == 'rightWrist') {
          rh_X = keypoint.position.x;
          rh_Y = keypoint.position.y;
          prh_X = rh_X;
          prh_Y = rh_Y;
        }
        if (keypoint.part == 'leftShoulder') {
          rl_X = keypoint.position.x;
          rl_Y = keypoint.position.y;
          prl_X = rl_X;
          prl_Y = rl_Y;
        }
        if (keypoint.part == 'rightShoulder') {
          ll_X = keypoint.position.x;
          ll_Y = keypoint.position.y;
          pll_X = ll_X;
          pll_Y = ll_Y;
        }
      }
    }
  }
}

function gotPoses(results) {
  poses = results;
}


function modelReady() {
  console.log('model ready');
}