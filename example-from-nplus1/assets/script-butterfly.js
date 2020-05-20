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

    let particlesStep = pointsCount / particlesCount;

    for (let i = 0; i < pointsCount; ++i) {
      this.update();
      points.push(new p5.Vector(this.x, this.y, this.z));

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

    for (let i = 0; i < this.particles.length; ++i) {
      let p = this.particles[i];
      p.update(this.getDxDt(p.x, p.y, p.z) * this.dt,
          this.getDyDt(p.x, p.y, p.z) * this.dt,
          this.getDzDt(p.x, p.y, p.z) * this.dt);
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

  p.pointsCount = 7000;
  p.particlesCount = 50;
  p.sliderPointsCount = 0;

  let sliderSigma = null;
  let sliderRho = null;
  let sliderBeta = null;
  let sliderPointsCount = null;

  p.model = null;

  p.easycam = null;
  p.center = null;
  p.points = [];

  p.canvas = null;

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

  p.setup = function () {
    //p.canvas = p.createCanvas(p.min(p.windowWidth, 700), 500, p.WEBGL);
    p.canvas = p.createCanvas(p.min(p.windowWidth, 1400), 1000, p.WEBGL);
    p.colorMode(p.RGB);

    sliderSigma = p.createSlider(1, 50, p.sigma, 0.1);
    sliderRho = p.createSlider(0.1, 45, p.rho, 0.1);
    sliderBeta = p.createSlider(0.1, 20, p.beta, 0.1);
    sliderPointsCount = p.createSlider(5000, 10000, p.pointsCount, 100);

    sliderSigma.position(5, 5);
    sliderRho.position(5, 25);
    sliderBeta.position(5, 45);
    sliderPointsCount.position(5, 65);

    sliderSigma.input(changeSigmaBySlider);
    sliderRho.input(changeRhoBySlider);
    sliderBeta.input(changeBetaBySlider);
    sliderPointsCount.input(changePointsCountBySlider);

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

    p.stroke(61, 129, 211, 200);
    p.beginShape();
    for (let i = 0; i < p.pointsCount; ++i) {
      p.vertex(p.points[i].x, p.points[i].y, p.points[i].z);
    }
    p.endShape();

    p.stroke(255, 102, 1, 200);
    for (let v of p.model.drawParticles()) {
      p.push();
      let coordinates = v.getCoordinates();
      p.translate(coordinates[0], coordinates[1], coordinates[2]);
      p.sphere(0.3);
      p.pop();
    }
    p.pop();
  }
};


let fourthP5 = new p5(mainSketch);
