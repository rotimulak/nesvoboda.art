let pauseFlag = false;
let startGColor = 100;
//let clickedIndex;
let clickedIndexes=[];


class LorenzAttractor {
  constructor(x, y, z, dt, sigma, rho, beta) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.dt = dt;

    this.sigma = sigma;
    this.rho = rho;
    this.beta = beta;

    this.centerX = x;
    this.centerY = y;
    this.centerZ = z;

    this.totalMass = 1;

    this.minVelocity = 10000000;
    this.maxVelocity = 0;

    this.particles = [];
  }

  getCoordinates() {
    return [this.x, this.y, this.z];
  }

  getCenterOfMass() {
    return [this.centerX, this.centerY, this.centerZ];
  }

  getParticles() {
    return this.particles;
  }

  getDxDt(x, y, z) {
    return this.sigma * (y - x);
  }

  getDyDt(x, y, z) {
    return x * (this.rho - z) - y;
  }

  getDzDt(x, y, z) {
    return x * y - this.beta * z;
  }

  getVelocity(x, y, z) {
    let dx = this.getDxDt(x, y, z) * this.dt;
    let dy = this.getDyDt(x, y, z) * this.dt;
    let dz = this.getDzDt(x, y, z) * this.dt;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  getRangeVelocity() {
    return this.maxVelocity - this.minVelocity;
  }

  update() {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    this.x += this.getDxDt(x, y, z) * this.dt;
    this.y += this.getDyDt(x, y, z) * this.dt;
    this.z += this.getDzDt(x, y, z) * this.dt;
    this.centerX += this.x;
    this.centerY += this.y;
    this.centerZ += this.z;
  }

  resetCoordinates(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  drawPoints(pointsCount, particlesCount) {
    this.totalMass = pointsCount;

    let points = [];
    this.particles.length = 0;

    let particlesStep = Math.round(pointsCount / particlesCount);

    for (let i = 0; i < pointsCount; ++i) {
      this.update();
      points.push(new p5.Vector(this.x, this.y, this.z));

      // velocity is not used in movement
      let velocity = this.getVelocity(this.x, this.y, this.z);
      this.minVelocity = Math.min(this.minVelocity, velocity);
      this.maxVelocity = Math.max(this.maxVelocity, velocity);

      if (i % particlesStep === 0) {
        this.particles.push(new Particle(this.x, this.y, this.z));
      }
    }

    this.centerX /= this.totalMass;
    this.centerY /= this.totalMass;
    this.centerZ /= this.totalMass;

    return points;
  }

  drawParticles() {
    let result = [];
    let length = this.particles.length;

    for (let i = 0; i < length; ++i) {
      let p = this.particles[i];
      if (!pauseFlag) {
        p.update(this.getDxDt(p.x, p.y, p.z) * this.dt,
            this.getDyDt(p.x, p.y, p.z) * this.dt,
            this.getDzDt(p.x, p.y, p.z) * this.dt);
      }
      result.push(p);
    }


    return result;
  }
}


class Particle {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  update(dx, dy, dz) {
    this.x += dx;
    this.y += dy;
    this.z += dz;
  }

  getCoordinates() {
    return [this.x, this.y, this.z];
  }
}

let mainSketch = function (p) {
  let x = 0.01;
  let y = 0;
  let z = 1;

  let dt = 0.01;

  p.sigma = 10;
  p.rho = 28;
  p.beta = 8 / 3;

  // lines count
  p.pointsCount = 7000;
  // points count
  p.particlesCount = 50;


  let sliderSigma = null;
  let sliderRho = null;
  let sliderBeta = null;
  let sliderPointsCount = null;
  let sliderParticlesCount = null;

  p.model = null;

  p.easycam = null;
  p.center = null;
  p.points = [];

  p.canvas = null;

  document.addEventListener("DOMContentLoaded", function(event) {
    let buttonPause = document.getElementById("button-pause");

    buttonPause.onclick = function(event) {
      pauseFlag=!pauseFlag;
      if (pauseFlag) {
        p.easycam.removeMouseListeners();
      }
      else {
        p.easycam.attachMouseListeners();
      }

      // methods for get camera positions are here: https://diwi.github.io/p5.EasyCam/
      //console.log(p.easycam.getRotation());

    };

  });


  function redrawModel() {
    p.model.resetCoordinates(x, y, z);
    p.points = p.model.drawPoints(p.pointsCount, p.particlesCount);
    p.center = p.model.getCenterOfMass();
    p.easycam.setCenter(p.center, 0);
  }

  function changeSigmaBySlider() {
    p.model.sigma = sliderSigma.value();
    redrawModel();
  }

  function changeRhoBySlider() {
    p.model.rho = sliderRho.value();
    redrawModel();
  }

  function changeBetaBySlider() {
    p.model.beta = sliderBeta.value();
    redrawModel();
  }

  function changePointsCountBySlider() {
    p.pointsCount = sliderPointsCount.value();
    redrawModel();
  }

  function changeParticlesCountBySlider() {
    p.particlesCount = sliderParticlesCount.value();
    redrawModel();
  }


  p.setup = function () {
    p.canvascanvas = p.createCanvas(p.min(p.windowWidth, 1400), p.min(p.windowHeight, 1000), p.WEBGL);
    p.colorMode(p.RGB);

    sliderSigma = p.createSlider(1, 50, p.sigma, 0.1);
    sliderRho = p.createSlider(0.1, 45, p.rho, 0.1);
    sliderBeta = p.createSlider(0.1, 20, p.beta, 0.1);
    sliderPointsCount = p.createSlider(5000, 10000, p.pointsCount, 100);
    sliderParticlesCount = p.createSlider(0, 200, p.particlesCount, 5);

    sliderSigma.position(5, 5);
    sliderRho.position(5, 25);
    sliderBeta.position(5, 45);
    sliderPointsCount.position(5, 65);
    sliderParticlesCount.position(5, 85);

    sliderSigma.input(changeSigmaBySlider);
    sliderRho.input(changeRhoBySlider);
    sliderBeta.input(changeBetaBySlider);
    sliderPointsCount.input(changePointsCountBySlider);
    sliderParticlesCount.input(changeParticlesCountBySlider);

    p.model = new LorenzAttractor(x, y, z, dt, p.sigma, p.rho, p.beta);
    p.points = p.model.drawPoints(p.pointsCount, p.particlesCount);

    p.easycam = p.createEasyCam(p.RendererGL);

    Dw.EasyCam.prototype.apply = function (n) {
      let o = this.cam;
      n = n || o.renderer,
      n && (this.camEYE = this.getPosition(this.camEYE), this.camLAT = this.getCenter(this.camLAT), this.camRUP = this.getUpVector(this.camRUP), n._curCamera.camera(this.camEYE[0], this.camEYE[1], this.camEYE[2], this.camLAT[0], this.camLAT[1], this.camLAT[2], this.camRUP[0], this.camRUP[1], this.camRUP[2]))
    };

    p.center = p.model.getCenterOfMass();
    p.easycam.setCenter(p.center, 0);
    let distance = 350;
    let rotation = [-0.2480524065198549, -0.1886425467149905, 0.7171889384935938, -0.6233169496259671];
    p.easycam.setDistance(distance, 0);
    p.easycam.setRotation(rotation, 0);

  };


  p.draw = function () {
    p.background(255, 255, 255);

    p.scale(6);
    p.noFill();

    p.push();
    p.translate(-p.model.centerX, -p.model.centerY, -p.model.centerZ);

    // color of line
    p.stroke(61, 129, 211, 200);
    p.beginShape();
    for (let i = 0; i < p.pointsCount; ++i) {
      p.vertex(p.points[i].x, p.points[i].y, p.points[i].z);
    }
    p.endShape();

    // color of point
    p.stroke(255, 102, 1, 200);

    //console.log(p.model.drawParticles().length);

    let index = 0;

    for (let v of p.model.drawParticles()) {

      p.push();
      let coordinates = v.getCoordinates();
      p.translate(coordinates[0], coordinates[1], coordinates[2]);
      if (clickedIndexes.includes(index)) {
        //p.stroke(0, 0, 0, 200);
      }
      else {
        p.stroke(255, (startGColor + index), 1, 200);
        p.sphere(0.3);
      }

      //p.sphere(0.3);
      // change form of points
      //p.torus(5, 2);
      p.pop();

      index = index + 1;
    }
    p.pop();
  }

  p.mousePressed = function () {
    if (pauseFlag) {
      p.loadPixels();
      let d = p.pixelDensity();
      if (p.height > p.mouseY) {
        // (p.height - p.mouseY) is used in formula because picture in pixels array is vertically mirrored
        let r_i = 4 * d *((Math.round(p.height - p.mouseY)) * d * p.width + (Math.round(p.mouseX)));
        let g_i = r_i + 1;
        let b_i = r_i + 2;
        let a_i = r_i + 3;
        console.log("rgb of clicked point = " + p.pixels[r_i] + "  " + p.pixels[g_i] + "  " + p.pixels[b_i]);
        //color of bg - 255, 255, 255
        //color of line - 61, 129, 211
        // color of point - 255, [100 + index], 1
        if (p.pixels[r_i] == 255 && p.pixels[b_i] == 1){
          let clickedIndex = p.pixels[g_i] - startGColor;
          console.log("clicked index = " + clickedIndex);
          clickedIndexes.push(clickedIndex);
          console.log("array of clicked indexes = " + clickedIndexes);
        }
      }
    }
  };

};





let fourthP5 = new p5(mainSketch);
