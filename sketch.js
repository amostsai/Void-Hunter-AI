let player;
let bullets = [];
let enemies = [];
let powerUps = [];
let enemyBullets = [];
let lastEnemySpawn = 0;
let score = 0;
let level = 1;
let isGameOver = false;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('game-container');
  player = new Player();
  textFont('monospace');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  if (!isGameOver) {
    // update difficulty level based on score
    level = floor(score / 100) + 1;
    // spawn enemies faster as level increases
    let spawnInterval = max(200, 1000 - (level - 1) * 100);
    if (millis() - lastEnemySpawn > spawnInterval) {
      let x = random(30, width - 30);
      enemies.push(new Enemy(x, -30));
      lastEnemySpawn = millis();
    }

    player.update();
    player.show();

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update();
      bullets[i].show();
      if (bullets[i].offscreen()) {
        bullets.splice(i, 1);
      } else {
        for (let j = enemies.length - 1; j >= 0; j--) {
        if (bullets[i] && enemies[j] && bullets[i].hits(enemies[j])) {
            // destroy enemy and bullet
            let ex = enemies[j].pos.x;
            let ey = enemies[j].pos.y;
            enemies.splice(j, 1);
            bullets.splice(i, 1);
            score += 10;
            // chance to drop a power-up
            if (random() < 0.2) {
              powerUps.push(new PowerUp(ex, ey));
            }
            break;
          }
        }
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      let e = enemies[i];
      e.update();
      e.show();
      e.tryShoot();
      if (e.offscreen()) {
        enemies.splice(i, 1);
      } else if (e.hits(player)) {
        if (player.shield) {
          enemies.splice(i, 1);
        } else {
          isGameOver = true;
        }
      }
    }

    // update and draw enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      let b = enemyBullets[i];
      b.update();
      b.show();
      if (b.offscreen()) {
        enemyBullets.splice(i, 1);
      } else if (b.hits(player)) {
        if (!player.shield) {
          isGameOver = true;
        }
        enemyBullets.splice(i, 1);
      }
    }
    // update and draw power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
      powerUps[i].update();
      powerUps[i].show();
      if (powerUps[i].offscreen()) {
        powerUps.splice(i, 1);
      } else if (powerUps[i].hits(player)) {
        player.applyPower(powerUps[i].type);
        powerUps.splice(i, 1);
      }
    }
    drawScore();
  } else {
    textAlign(CENTER);
    fill(255);
    textSize(48);
    text('Game Over', width / 2, height / 2);
    textSize(24);
    text('Score: ' + score, width / 2, height / 2 + 50);
    textSize(16);
    text('按 R 鍵重新開始', width / 2, height / 2 + 90);
  }
}

function keyPressed() {
  if (!isGameOver && key === ' ') {
    player.shoot();
  }
  if (isGameOver && (key === 'r' || key === 'R')) {
    restartGame();
  }
}

function restartGame() {
  isGameOver = false;
  score = 0;
  bullets = [];
  enemies = [];
  player = new Player();
  lastEnemySpawn = millis();
}

function drawScore() {
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text('Score: ' + score + '  Level: ' + level, 10, 30);
}

class Player {
  constructor() {
    this.size = 40;
    this.pos = createVector(width / 2, height - this.size * 2);
    this.speed = 5;
    this.power = null;
    this.powerTimer = 0;
    this.shield = false;
  }

  update() {
    // handle power-up expiration
    if (this.power && millis() > this.powerTimer) {
      if (this.power === 'shield') this.shield = false;
      this.power = null;
      this.powerTimer = 0;
    }
    if (keyIsDown(LEFT_ARROW)) this.pos.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.pos.x += this.speed;
    if (keyIsDown(UP_ARROW)) this.pos.y -= this.speed;
    if (keyIsDown(DOWN_ARROW)) this.pos.y += this.speed;
    this.pos.x = constrain(this.pos.x, this.size / 2, width - this.size / 2);
    this.pos.y = constrain(this.pos.y, this.size / 2, height - this.size / 2);
  }

  show() {
    fill(0, 0, 255);
    noStroke();
    push();
    translate(this.pos.x, this.pos.y);
    // draw shield if active
    if (this.shield) {
      noFill();
      stroke(0, 255, 255, 150);
      strokeWeight(4);
      ellipse(0, 0, this.size * 2);
    }
    // draw player ship
    triangle(-this.size/2, this.size/2, this.size/2, this.size/2, 0, -this.size/2);
    pop();
  }

  shoot() {
    const speed = 10;
    if (this.power === 'spread') {
      // three-way shot
      const angles = [-PI/2 - PI/12, -PI/2, -PI/2 + PI/12];
      angles.forEach(a => {
        const vel = createVector(cos(a), sin(a)).mult(speed);
        bullets.push(new Bullet(this.pos.x, this.pos.y - this.size/2, vel, false));
      });
    } else if (this.power === 'homing') {
      const vel = createVector(0, -1).mult(speed);
      bullets.push(new Bullet(this.pos.x, this.pos.y - this.size/2, vel, true));
    } else {
      const vel = createVector(0, -1).mult(speed);
      bullets.push(new Bullet(this.pos.x, this.pos.y - this.size/2, vel, false));
    }
  }
  
  // apply a power-up effect
  applyPower(type) {
    this.power = type;
    this.powerTimer = millis() + 10000;
    if (type === 'shield') {
      this.shield = true;
    }
  }
}

class Bullet {
  constructor(x, y, vel, homing = false) {
    this.pos = createVector(x, y);
    this.vel = vel.copy();
    this.r = 8;
    this.homing = homing;
    this.speed = this.vel.mag();
  }

  update() {
    if (this.homing && enemies.length > 0) {
      let nearest = null;
      let minDist = Infinity;
      for (let e of enemies) {
        let d = dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
        if (d < minDist) {
          minDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        let desired = p5.Vector.sub(nearest.pos, this.pos).setMag(this.speed);
        this.vel.lerp(desired, 0.1);
        this.vel.setMag(this.speed);
      }
    }
    this.pos.add(this.vel);
  }

  show() {
    fill(255, 255, 0);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r);
  }

  offscreen() {
    return (this.pos.y < -this.r || this.pos.x < -this.r || this.pos.x > width + this.r);
  }

  hits(enemy) {
    let d = dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
    return d < (this.r + enemy.r) / 2;
  }
}

class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 30;
    // determine enemy type based on level: no yellow/homing on level 1, yellow at level>=2, homing at level>=3
    let pYellow = level >= 2 ? 0.2 : 0;
    let pHoming = level >= 3 ? 0.3 : 0;
    let r = random();
    if (r < pYellow) {
      this.type = 'yellow';
    } else if (r < pYellow + pHoming) {
      this.type = 'homing';
    } else {
      this.type = 'normal';
    }
    // set appearance
    if (this.type === 'homing') {
      this.c = color(255, 0, 0);
    } else if (this.type === 'yellow') {
      this.c = color(255, 255, 0);
    } else {
      this.c = color(200);
    }
    // base speed (increases slightly with level)
    this.speed = 2 + (level - 1) * 0.2;
    // shooting interval (decreases with level)
    if (this.type === 'homing') {
      this.shootInterval = max(300, 1200 - (level - 1) * 100);
    } else {
      this.shootInterval = max(500, 2000 - (level - 1) * 100);
    }
    this.lastShot = millis();
  }

  update() {
    if (this.type === 'yellow') {
      // track the player position
      let desired = p5.Vector.sub(player.pos, this.pos).setMag(this.speed);
      this.pos.add(desired);
    } else {
      // default: move straight down
      this.pos.y += this.speed;
    }
  }

  show() {
    fill(this.c);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r);
  }

  tryShoot() {
    if (millis() - this.lastShot > this.shootInterval) {
      let vel = createVector(0, 1).mult(5);
      let homing = this.type === 'homing';
      enemyBullets.push(new EnemyBullet(this.pos.x, this.pos.y + this.r / 2, vel, homing));
      this.lastShot = millis();
    }
  }

  offscreen() {
    return this.pos.y > height + this.r;
  }

  hits(player) {
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
    return d < (this.r + player.size) / 2;
  }
}
// power-up class
class PowerUp {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 20;
    this.speed = 2;
    this.type = random(['spread', 'homing', 'shield']);
  }

  update() {
    this.pos.y += this.speed;
  }

  show() {
    switch (this.type) {
      case 'spread': fill(255, 165, 0); break;
      case 'homing': fill(0, 255, 0); break;
      case 'shield': fill(0, 255, 255); break;
    }
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(this.type.charAt(0).toUpperCase(), this.pos.x, this.pos.y);
  }

  offscreen() {
    return this.pos.y > height + this.r;
  }

  hits(player) {
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
    return d < (this.r + player.size) / 2;
  }
}

// Enemy bullets class
class EnemyBullet {
  constructor(x, y, vel, homing = false) {
    this.pos = createVector(x, y);
    this.vel = vel.copy();
    this.homing = homing;
    this.speed = this.vel.mag();
    this.r = 12;
    // limit homing duration (ms)
    this.spawnTime = millis();
    this.homingDuration = 1000;
  }

  update() {
    // homing effect only active for a limited duration
    if (this.homing && millis() - this.spawnTime < this.homingDuration) {
      let desired = p5.Vector.sub(player.pos, this.pos).setMag(this.speed);
      this.vel.lerp(desired, 0.05);
      this.vel.setMag(this.speed);
    }
    this.pos.add(this.vel);
  }

  show() {
    fill(this.homing ? color(255, 0, 0) : color(255, 150, 0));
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r);
  }

  offscreen() {
    return (
      this.pos.y > height + this.r || this.pos.y < -this.r ||
      this.pos.x < -this.r || this.pos.x > width + this.r
    );
  }

  hits(player) {
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
    return d < (this.r + player.size) / 2;
  }
}