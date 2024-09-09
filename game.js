import config from './config.js';

class MathBirdGame {
  constructor(scene) {
    this.scene = scene;
    this.bird = null;
    this.mathProblems = null;
    this.score = 0;
    this.scoreText = null;
    this.gameOverText = null;
    this.currentProblem = null;
    this.state = 'READY'; // READY, PLAYING, GAMEOVER
    this.problemGenerationEvent = null;
  }

  create() {
    this.createBackground();
    this.createBird();
    this.createMathProblems();
    this.createTexts();
    this.setupCollisions();
    this.setupInputs();
    this.setState('READY');
  }

  createBackground() {
    this.scene.add.tileSprite(0, 0, this.scene.sys.game.config.width * 2, this.scene.sys.game.config.height, 'background')
      .setOrigin(0, 0)
      .setScrollFactor(0);
  }

  createBird() {
    this.bird = this.scene.physics.add.sprite(100, 300, 'bird_straight');
    this.bird.setCollideWorldBounds(true);
    this.bird.body.onWorldBounds = true;
  }

  createMathProblems() {
    this.mathProblems = this.scene.physics.add.group();
  }

  createTexts() {
    this.scoreText = this.scene.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    this.gameOverText = this.scene.add.text(400, 300, 'Game Over\nClick to restart', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(1).setVisible(false);
    this.problemText = this.scene.add.text(400, 100, '', {
      fontSize: '48px',
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5).setDepth(1);
  }

  setupCollisions() {
    this.scene.physics.add.overlap(this.bird, this.mathProblems, this.handleAnswerCollision, null, this);
    this.scene.physics.world.on('worldbounds', () => this.setState('GAMEOVER'), this);
  }

  handleAnswerCollision(bird, answer) {
    if (answer.isCorrect) {
      this.incrementScore();
      this.mathProblems.clear(true, true);
      this.generateMathProblem();
    } else {
      this.setState('GAMEOVER');
    }
  }

  setupInputs() {
    this.scene.input.on('pointerdown', () => this.handleInput(), this);
    this.scene.input.keyboard.on('keydown-SPACE', () => this.handleInput(), this);
  }

  handleInput() {
    switch (this.state) {
      case 'READY':
        this.setState('PLAYING');
        break;
      case 'PLAYING':
        this.flapBird();
        break;
      case 'GAMEOVER':
        this.scene.scene.restart();
        break;
    }
  }

  setState(newState) {
    this.state = newState;
    switch (newState) {
      case 'READY':
        this.reset();
        break;
      case 'PLAYING':
        this.startGame();
        break;
      case 'GAMEOVER':
        this.endGame();
        break;
    }
  }

  reset() {
    this.score = 0;
    this.scoreText.setText('Score: 0');
    this.bird.setPosition(100, 300);
    this.bird.setVelocity(0, 0);
    this.bird.clearTint();
    this.mathProblems.clear(true, true);
    this.gameOverText.setVisible(false);
    this.scene.physics.resume();
    if (this.problemGenerationEvent) {
      this.problemGenerationEvent.remove();
    }
  }

  startGame() {
    this.problemGenerationEvent = this.scene.time.addEvent({
      delay: 1500,
      callback: () => this.generateMathProblem(),
      callbackScope: this,
      loop: true
    });
  }

  endGame() {
    this.scene.physics.pause();
    this.bird.setTint(0xff0000);
    this.gameOverText.setVisible(true);
    if (this.problemGenerationEvent) {
      this.problemGenerationEvent.remove();
    }
  }

  update() {
    if (this.state !== 'PLAYING') return;

    this.updateBirdTexture();
    this.removeMathProblems();
  }

  updateBirdTexture() {
    if (this.bird.body.velocity.y < 0) {
      this.bird.setTexture('bird_up');
    } else if (this.bird.body.velocity.y > 0) {
      this.bird.setTexture('bird_down');
    } else {
      this.bird.setTexture('bird_straight');
    }
  }

  removeMathProblems() {
    this.mathProblems.getChildren().forEach((problem) => {
      if (problem.x < -100) {
        this.mathProblems.remove(problem, true, true);
      } 
    });
  }

  flapBird() {
    this.bird.setVelocityY(-250);
  }

  generateMathProblem() {
    const num1 = Phaser.Math.Between(1, 10);
    const num2 = Phaser.Math.Between(1, 10);
    const operation = Math.random() < 0.5 ? '+' : '-';
    const correctAnswer = operation === '+' ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
    
    this.currentProblem = `${Math.max(num1, num2)} ${operation} ${Math.min(num1, num2)} = ?`;
    this.problemText.setText(this.currentProblem);

    const answers = [correctAnswer];
    while (answers.length < 3) {
      const wrongAnswer = Phaser.Math.Between(Math.max(1, correctAnswer - 5), correctAnswer + 5);
      if (!answers.includes(wrongAnswer)) answers.push(wrongAnswer);
    }
    Phaser.Utils.Array.Shuffle(answers);

    answers.forEach((answer, index) => {
      const y = 150 + index * 100;
      const answerText = this.mathProblems.create(800, y, 'answer');
      answerText.body.allowGravity = false;
      answerText.setVelocityX(-200);
      answerText.setDisplaySize(100, 50);
      answerText.isCorrect = answer === correctAnswer;

      const text = this.scene.add.text(answerText.x, answerText.y, answer.toString(), {
        fontSize: '24px',
        color: '#000000'
      }).setOrigin(0.5);
      answerText.text = text;

      answerText.update = function() {
        this.text.x = this.x;
        this.text.y = this.y;
      }
    });
  }

  incrementScore() {
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('background', config.assets.background);
    this.load.image('bird_up', config.assets.bird.up);
    this.load.image('bird_straight', config.assets.bird.straight);
    this.load.image('bird_down', config.assets.bird.down);
    this.load.image('answer', 'assets/answer_box.png');  // You'll need to create this asset
  }

  create() {
    this.game = new MathBirdGame(this);
    this.game.create();
  }

  update() {
    this.game.update();
  }
}

const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 512,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(gameConfig);