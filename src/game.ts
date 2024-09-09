class FlappyBirdGame extends Phaser.Scene {
  constructor() {
    super('FlappyBirdGame');
    this.bird = null;
    this.pipes = null;
    this.score = 0;
    this.scoreText = null;
    this.gameOver = false;
    this.gameOverText = null;
    this.PIPE_VERTICAL_DISTANCE_RANGE = [150, 250];
    this.PIPE_HORIZONTAL_DISTANCE_RANGE = [300, 500];
  }

  // ... existing preload method ...

  create() {
    // ... existing create method code ...

    this.gameOverText = this.add.text(400, 300, 'Game Over\nClick to restart', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(1).setVisible(false);

    // Add collision with the world bounds
    this.physics.world.on('worldbounds', this.gameOverHandler, this);
    this.bird.setCollideWorldBounds(true);
    this.bird.body.onWorldBounds = true;

    // ... rest of the create method ...
  }

  update() {
    if (this.gameOver) return;

    // ... existing bird texture update code ...

    // Remove pipes that are off-screen
    this.pipes.getChildren().forEach(pipe => {
      if (pipe.x < -pipe.width) {
        this.pipes.remove(pipe, true, true);
      }
    });

    if (this.pipes.getChildren()[this.pipes.getChildren().length - 1].x < 800 - Phaser.Math.Between(...this.PIPE_HORIZONTAL_DISTANCE_RANGE)) {
      this.createPipe();
    }
  }

  private createPipe(): void {
    const pipeVerticalDistance = Phaser.Math.Between(...this.PIPE_VERTICAL_DISTANCE_RANGE);
    const pipeHorizontalDistance = Phaser.Math.Between(...this.PIPE_HORIZONTAL_DISTANCE_RANGE);
    const pipeVerticalPosition = Phaser.Math.Between(20, 480 - 20 - pipeVerticalDistance);

    // ... rest of the method ...
  }

  // ... existing flapBird method ...

  addPipes() {
    if (this.gameOver) return;

    const holeStart = Phaser.Math.Between(100, 400);
    
    // Top pipe
    const topPipe = this.pipes.create(800, holeStart - this.PIPE_VERTICAL_DISTANCE / 2 - 320, 'pipe');
    topPipe.body.allowGravity = false;
    topPipe.setVelocityX(-200);
    topPipe.setFlipY(true);
    topPipe.scored = false;

    // Bottom pipe
    const bottomPipe = this.pipes.create(800, holeStart + this.PIPE_VERTICAL_DISTANCE / 2, 'pipe');
    bottomPipe.body.allowGravity = false;
    bottomPipe.setVelocityX(-200);
    bottomPipe.scored = false;
  }

  gameOverHandler() {
    this.gameOver = true;
    this.physics.pause();
    this.bird.setTint(0xff0000);
    this.gameOverText.setVisible(true);

    this.input.on('pointerdown', this.restartGame, this);
    this.input.keyboard.on('keydown', this.restartGame, this);
  }

  restartGame() {
    this.scene.restart();
  }

  incrementScore() {
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);
  }

  update() {
    if (this.gameOver) return;

    // ... existing bird texture update code ...

    this.pipes.getChildren().forEach(pipe => {
      if (pipe.x < -pipe.width) {
        this.pipes.remove(pipe, true, true);
      } else if (!pipe.scored && pipe.x < this.bird.x) {
        pipe.scored = true;
        this.incrementScore();
      }
    });

    if (this.pipes.getChildren().length === 0 || 
        this.pipes.getChildren()[this.pipes.getChildren().length - 1].x < 800 - this.PIPE_HORIZONTAL_DISTANCE) {
      this.addPipes();
    }
  }
}

// ... rest of the file remains the same ...