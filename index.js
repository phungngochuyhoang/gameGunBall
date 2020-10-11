const canvas = document.querySelector('canvas');
const cnt = canvas.getContext('2d');
// Thiết lập chiều dài và rộng cho canvas 
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const score = document.querySelector('#score');
const startGame = document.querySelector('#start-game');
const boxStart = document.querySelector('#box-start');
const backGame = document.querySelector('#back-game');
const boxEnd = document.querySelector('#end');
const myPoint = document.querySelector('#my-point');


let boxScore = 0;


// Tạo đối tượng player 
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    // Vẽ 
    draw() {
        cnt.beginPath();
        cnt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        cnt.fillStyle = this.color;
        cnt.fill();
    }
}

// Tạo đạn dược
class Projectitle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
     // Vẽ 
     draw() {
        cnt.beginPath();
        cnt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        cnt.fillStyle = this.color;
        cnt.fill();
    }
    // Thay đổi
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// Tạo kẻ địch 
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
     // Vẽ 
     draw() {
        cnt.beginPath();
        cnt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        cnt.fillStyle = this.color;
        cnt.fill();
    }
    // Thay đổi
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

let particles = [];
let friction = 0.99;
// Hạt vụn
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
     // Vẽ 
     draw() {
        cnt.save();
        cnt.globalAlpha = this.alpha;
        cnt.beginPath();
        cnt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        cnt.fillStyle = this.color;
        cnt.fill();
        cnt.restore();
    }
    // Thay đổi
    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x * 8;
        this.y = this.y + this.velocity.y * 8;
        this.alpha -= 0.01;
    }
}

// canh giữa cho player 
const x = canvas.width / 2;
const y = canvas.height / 2;
// đối tượng player
const player = new Player(x, y, 30, 'white'); console.log(player);

//kho đạn 
const projectiles = [];
// 
const enemies = [];

// chức năng sinh ra kẻ thù
function spawnEnemies() {
    setInterval(() => {
        let radius = Math.floor(Math.random() * 30) + 10; 
        let x;
        let y;
        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else {
            x = Math.random() < canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        let color= `rgb(${Math.random() * 255 + 1}, ${Math.random() * 255 + 1}, ${Math.random() * 255 + 1})`;
        const angle = Math.atan2(canvas.height / 2 - y,canvas.width / 2 - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        setTimeout(() => {
            enemies.push(new Enemy(x, y, radius, color, velocity))
        }, 0)
    }, 1500)
}
 // âm thanh khi va chạm
 function loadSound() {
    createjs.Sound.registerSound("./explosion1.mp3", 'Thunder');
  }

  function playSound() {
    createjs.Sound.play('Thunder');
  }

function endGame(properties, point) {
    boxEnd.style.visibility = properties;
    myPoint.innerHTML = point;
    backGame.addEventListener('click', () => {
        location.reload();
    })
}




let animationId;


// chức năng chuyển động hoạt hình
function animationProjectitle() {
    animationId = requestAnimationFrame(animationProjectitle);
    cnt.fillStyle = 'rgba(0,0,0,0.1)';
    cnt.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0) {
            particles.splice(index, 1);
        }else {
            particle.update();
        }
    })
    projectiles.forEach((projectitle, index) => {
        projectitle.update();
        if(projectitle.x + projectitle.radius < 0 || projectitle.x - projectitle.radius > canvas.width || projectitle.y + projectitle.radius < 0 || projectitle.y - projectitle.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy, index) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        
        if(dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            endGame('visible', boxScore);
        }
        projectiles.forEach((projectitle, projectitleIndex) => {
            const dist = Math.hypot(projectitle.x - enemy.x, projectitle.y - enemy.y);
            // Xử lý va chạm 
            if(dist - enemy.radius - projectitle.radius < 1) {
                // tạo vụ nổ 
                playSound();
                setTimeout(() => {
                    for(let i = 0; i < enemy.radius * 2; i++) {
                        particles.push(new Particle(projectitle.x, projectitle.y, Math.random() * 2, enemy.color, {x: Math.random() - 0.5, y: Math.random() - 0.5}))
                    }
                }, 0)
                
                      
                if(enemy.radius > 10) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    boxScore += 10;
                    score.innerHTML = boxScore;
                    // âm thanh khi va chạm

                    setTimeout(() => {
                        projectiles.splice(projectitleIndex, 1)
                    }, 0)
                }else {
                    boxScore += 100;
                    score.innerHTML = boxScore;
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectitleIndex, 1)
                    }, 0)
                }
            }
        }) 
    })
}

// Bắt sự kiện click vào màn hình 

addEventListener('click', (event) => {
    // góc 
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    // đối tượng viên đạn thêm vào kho đạn
    projectiles.push(new Projectitle(x, y, 5, 'white', velocity));
})


startGame.addEventListener('click', () => {
    boxStart.style.display = 'none';
    animationProjectitle();
    spawnEnemies();
})


document.body.onload = function () {
    loadSound();
}
