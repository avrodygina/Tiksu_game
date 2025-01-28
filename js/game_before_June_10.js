console.log('game.js is loaded');

const config = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
    width: 480,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity for the bird
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let score = 0; // Initialize score variable to track the points
let scoreText; // Variable to hold the score text display
let startButton; // Variable to hold the start button
let gameOverScreen; // Variable to hold the game over screen
let gameOverText; // Variable to hold the game over text
let gameStarted = false; // Flag to check if the game has started
let gameOver = false; // Flag to check if the game is over

function preload() {
    console.log('Preload function is called');
    this.load.image('background', 'images/background_4.png'); // Load the background image
    this.load.image('bird', 'images/Tisku_no_bg.png');      // Load the bird image
    this.load.image('seed', 'images/almond.png');           // Load the seed image
    this.load.image('startButton', 'images/start_button.png'); // Load the start button image
    // No need to load the gameOverScreen image anymore
}

function create() {
    console.log('Create function is called');
    
    // Add the background image and set it to cover the game area
    this.add.image(240, 400, 'background').setDisplaySize(480, 800);

    // Add the bird sprite and set its properties
    bird = this.physics.add.sprite(240, 750, 'bird').setInteractive();
    bird.setScale(0.3);  // Resize the bird sprite to 30% of its original size
    bird.setCollideWorldBounds(true); // Prevent the bird from moving out of the game world

    // Create seeds
    seed = this.physics.add.group({
        key: 'seed',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 },
        velocityY: 0 // Set initial velocity to 0
    });

    seed.children.iterate(function (child) {
        child.setVelocityY(0); // Initially, seeds do not move
        child.setScale(0.1);
    });

    this.physics.add.collider(bird, seed, catchSeed, null, this);

    // Add gray boundary
    let graphics = this.add.graphics();
    graphics.lineStyle(4, 0x808080, 1); // Change the color to gray (0x808080)
    graphics.strokeRect(0, 0, 480, 800);

    // Create score text display in the top-right corner with custom font
    scoreText = this.add.text(300, 20, 'Score: 0', { fontFamily: 'Roboto', fontSize: '30px', fill: '#000' });

    // Create start button and add a click event
    startButton = this.add.image(240, 400, 'startButton').setInteractive();
    startButton.on('pointerdown', startGame, this);
}

function update() {
    if (!gameStarted || gameOver) return; // Do nothing if the game has not started or is over

    let pointer = this.input.activePointer;

    if (pointer.isDown) {
        let newX = Phaser.Math.Clamp(pointer.x, bird.width * bird.scaleX / 2, 480 - bird.width * bird.scaleX / 2);
        bird.x = newX;
    }

    // Check if any seed has fallen to the bottom
    seed.children.iterate(function (child) {
        if (child.y > 800 && child.active) {
            child.setActive(false).setVisible(false); // Disable the fallen seed
        }
    });

    // End game if all seeds have been caught or fallen
    if (checkAllSeedsInactive() && !gameOver) {
        endGame.call(this); // Call endGame with the correct context
    }
}

function catchSeed(bird, seed) {
    seed.disableBody(true, true);
    score += 10; // Increment score by 10 points
    scoreText.setText('Score: ' + score); // Update the score display
    
    // Create "+10" text effect near the bird
    let plusText = this.add.text(bird.x, bird.y - 30, '+10', { fontFamily: 'Roboto', fontSize: '20px', fill: '#000' });
    
    // Add a tween to fade out and remove the text
    this.tweens.add({
        targets: plusText,
        alpha: 0,
        duration: 1000,
        ease: 'Power1',
        onComplete: function() {
            plusText.destroy();
        }
    });

    // Check if all seeds have been caught or fallen
    if (checkAllSeedsInactive() && !gameOver) {
        endGame.call(this); // Call endGame with the correct context
    }
}

function checkAllSeedsInactive() {
    let allInactive = true;
    seed.children.iterate(function (child) {
        if (child.active) {
            allInactive = false;
        }
    });
    return allInactive;
}

function startGame() {
    gameStarted = true; // Set the game started flag to true
    startButton.destroy(); // Remove the start button

    // Set the seeds in motion
    seed.children.iterate(function (child) {
        child.setVelocityY(Phaser.Math.FloatBetween(50, 100));
    });
}

function endGame() {
    gameOver = true; // Set the game over flag to true

    // Create animated score display starting from 0
    let animatedScore = { value: 0 };
    gameOverText = this.add.text(240, 400, 'Score: 0', { fontFamily: 'Roboto', fontSize: '40px', fill: '#000' }).setOrigin(0.5);
    
    this.tweens.add({
        targets: animatedScore,
        value: score,
        duration: 2000, // Duration of the animation in milliseconds
        ease: 'Cubic.easeOut',
        onUpdate: function () {
            gameOverText.setText('Score: ' + Math.floor(animatedScore.value));
        }
    });

    // Embed the GIF using a DOM element
    let gifContainer = document.createElement('div');
    gifContainer.innerHTML = `<div class="tenor-gif-embed" data-postid="14678282" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="https://tenor.com/view/congratulations-congrats-tonton-friends-tonton-tontongif-gif-14678282">Congratulations Congrats Sticker</a>from <a href="https://tenor.com/search/congratulations-stickers">Congratulations Stickers</a></div>`;
    gifContainer.style.position = 'absolute';
    gifContainer.style.top = '50%';
    gifContainer.style.left = '50%';
    gifContainer.style.transform = 'translate(-50%, -50%)';
    gifContainer.style.width = '480px';
    gifContainer.style.height = '480px';
    document.body.appendChild(gifContainer);

    // Load the Tenor embed script
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://tenor.com/embed.js';
    document.body.appendChild(script);

    // Stop all seed movement
    seed.children.iterate(function (child) {
        child.setVelocityY(0);
    });
}
