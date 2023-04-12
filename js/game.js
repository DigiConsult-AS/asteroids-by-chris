const canvas = document.querySelector(".overlay");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const spaceship = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    width: 6,
    height: 20,
    angle: Math.random() * Math.PI * 2,
    speed: 1,
};

let shots = [];
const objects = [];
const pointsAnimations = [];
let points = parseInt(getCookie('points')) || 0;

let hits = parseInt(getCookie('hits')) || 0;

const shotProperties = {
    width: 2,
    height: 10,
    speed: 6,
};

const objectProperties = {
    minSize: 10,
    maxSize: 30,
    minSpeed: 0.5,
    maxSpeed: 2,
};

const keysPressed = {};
let isBlinking = false;

// Points calculation
function calculateSpeedFactor(speed) {
    // faster objects give more points
    return (speed - objectProperties.minSpeed) / (objectProperties.maxSpeed - objectProperties.minSpeed);
}

function calculateSizeFactor(size) {
    // smaller object give more points
    return 1 - ((size - objectProperties.minSize) / (objectProperties.maxSize - objectProperties.minSize));
}

function calculateDistanceFactor(ship, object) {
    // Calculate the distance between the object and the spaceship
    const dx = ship.x - object.x;
    const dy = ship.y - object.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize the distance between 0 and 1 - distant objects give more points
    const maxDistance = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));
    return distance / maxDistance;
}

function calculatePoints(object) {
    const k = 10; // Adjust this value to scale the overall points
    const speedFactor = calculateSpeedFactor(object.speed);
    const sizeFactor = calculateSizeFactor(object.size);
    const distanceFactor = calculateDistanceFactor(spaceship, object);

    return Math.round(k * (2 * speedFactor + sizeFactor + 3 * distanceFactor));
}

// Shooting
function createShot() {
    const shot = {
        x: spaceship.x,
        y: spaceship.y,
        angle: spaceship.angle,
    };

    shots.push(shot);
}

function updateShots() {
    for (const shot of shots) {
        shot.x += Math.cos(shot.angle) * shotProperties.speed;
        shot.y += Math.sin(shot.angle) * shotProperties.speed;

        // Check for collisions
        for (let i = objects.length - 1; i >= 0; i--) {
            const object = objects[i];
            if (checkCollision(object, shot)) {
                shots.splice(shots.indexOf(shot), 1); // Remove shot
                let pts = calculatePoints(object);
                points += pts; // Increment points
                createPointsAnimation(shot.x, shot.y - 20, '+' + pts);
                setCookie('points', points, 365); // Store the updated points in a cookie

                // Split the object into smaller objects
                if (object.size > objectProperties.minSize) {
                    for (let j = 0; j < 3 + Math.floor(Math.random() * 2); j++) {
                        const newSize = object.size / 2;
                        const newSpeed = objectProperties.minSpeed + Math.random() * (objectProperties.maxSpeed - objectProperties.minSpeed);
                        const newAngle = Math.random() * Math.PI * 2;

                        const sides = [6, 7, 8][Math.floor(Math.random() * 3)];
                        const polygon = generatePolygon(sides, newSize);

                        const newObject = {
                            x: object.x,
                            y: object.y,
                            size: newSize,
                            speed: newSpeed,
                            angle: newAngle,
                            polygon,
                        };

                        objects.push(newObject);
                    }
                }

                // Remove object
                objects.splice(i, 1);
                break;
            }
        }
    }

    // Remove shots that are off the canvas
    shots = shots.filter((shot) => {
        return (
            shot.x >= 0 &&
            shot.x <= canvas.width &&
            shot.y >= 0 &&
            shot.y <= canvas.height
        );
    });
}

function drawShots() {
    ctx.save();
    ctx.strokeStyle = "#000";

    for (const shot of shots) {
        ctx.beginPath();
        ctx.moveTo(shot.x, shot.y);
        ctx.lineTo(
            shot.x + Math.cos(shot.angle) * shotProperties.height,
            shot.y + Math.sin(shot.angle) * shotProperties.height
        );
        ctx.stroke();
    }

    ctx.restore();
}

// Objects - asteroids
function generatePolygon(sides, size) {
    const polygon = [];
    const angleStep = (Math.PI * 2) / sides;

    for (let i = 0; i < sides; i++) {
        const angle = angleStep * i;
        const radius = size * (0.5 + Math.random() * 0.5);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        polygon.push({ x, y });
    }

    return polygon;
}

function createObject() {
    const size = objectProperties.minSize + Math.random() * (objectProperties.maxSize - objectProperties.minSize);
    const speed = objectProperties.minSpeed + Math.random() * (objectProperties.maxSpeed - objectProperties.minSpeed);
    const angle = Math.random() * Math.PI * 2;

    const sides = [6, 7, 8][Math.floor(Math.random() * 3)];
    const polygon = generatePolygon(sides, size);

    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
        case 0: // Top
            x = Math.random() * canvas.width;
            y = -size;
            break;
        case 1: // Right
            x = canvas.width + size;
            y = Math.random() * canvas.height;
            break;
        case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + size;
            break;
        case 3: // Left
            x = -size;
            y = Math.random() * canvas.height;
            break;
    }

    const object = {
        x: x,
        y: y,
        size,
        speed,
        angle,
        polygon,
    };

    objects.push(object);
}

function updateObjects() {
    for (const object of objects) {
        object.x += Math.cos(object.angle) * object.speed;
        object.y += Math.sin(object.angle) * object.speed;

        if (checkCollisionWithSpaceship(object)) {
            // Restart the game
            objects.length = 0;
            hits++;
            setCookie('hits', hits, 365); // Store the updated hits in a cookie

            // Blink red
            blinkRed();

            break;
        }
    }
}

function drawObjects() {
    ctx.save();
    ctx.strokeStyle = "#000";

    for (const object of objects) {
        ctx.beginPath();
        ctx.moveTo(object.x + object.polygon[0].x, object.y + object.polygon[0].y);

        for (const point of object.polygon) {
            ctx.lineTo(object.x + point.x, object.y + point.y);
        }

        ctx.closePath();
        ctx.stroke();
    }

    ctx.restore();
}

// Collision detection
function checkCollision(object, shot) {
    const dx = object.x - shot.x;
    const dy = object.y - shot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < object.size;
}

function blinkRed() {
    isBlinking = true;
    setTimeout(() => {
        isBlinking = false;
    }, 50);
}

function drawBackground() {
    if (isBlinking) {
        ctx.fillStyle = "rgba(255, 0, 0, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function checkCollisionWithSpaceship(object) {
    const dx = object.x - spaceship.x;
    const dy = object.y - spaceship.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < object.size + spaceship.width;
}

// Showing points animations
function createPointsAnimation(x, y, points) {
    const minDistance = 20; // Minimum distance between animations
    const maxAdjustments = 10; // Maximum number of position adjustments
    const adjustmentDistance = 50; // Distance to move the animation in each adjustment

    let adjustedX = x;
    let adjustedY = y;

    // Check if the animation is too close to any existing animations
    for (let i = 0; i < maxAdjustments && isTooCloseToExistingAnimations(adjustedX, adjustedY, minDistance); i++) {
        // Move the animation slightly to the right or left
        adjustedX += (i % 2 === 0 ? 1 : -1) * adjustmentDistance * (i !== 0 ? i : 1);
        adjustedY += (i % 2 === 0 ? -1 : 1) * adjustmentDistance * (i !== 0 ? i : 1);
    }

    pointsAnimations.push({
        x: adjustedX,
        y: adjustedY,
        points,
        time: 0,
        duration: 2000,
    });
}

function isTooCloseToExistingAnimations(x, y, minDistance) {
    return pointsAnimations.some((animation) => {
        const distance = Math.sqrt(Math.pow(x - animation.x, 2) + Math.pow(y - animation.y, 2));
        return distance < minDistance;
    });
}

function updateAndDrawPointsAnimations() {
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';

    pointsAnimations.forEach((animation, index) => {
        // Update the animation time
        animation.time += 1000 / 60; // Assume 60 FPS

        // Calculate the progress of the animation (between 0 and 1)
        const progress = Math.min(animation.time / animation.duration, 1);

        // Set the text color and size based on the progress
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - progress})`;
        ctx.font = `bold ${30 + progress * 20}px Arial`;

        // Draw the points text
        ctx.fillText(animation.points, animation.x, animation.y - progress * 30);

        // Remove the animation if it's finished
        if (progress === 1) {
            pointsAnimations.splice(index, 1);
        }
    });
}

// Angle calculation
function normalizeAngle(angle) {
    while (angle > Math.PI) {
        angle -= 2 * Math.PI;
    }
    while (angle < -Math.PI) {
        angle += 2 * Math.PI;
    }
    return angle;
}

function drawSpaceship() {
    ctx.save();
    ctx.translate(spaceship.x, spaceship.y);
    ctx.rotate(spaceship.angle + Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(0, -spaceship.height / 2);
    ctx.lineTo(spaceship.width, spaceship.height / 2);
    ctx.lineTo(0, spaceship.height / 4);
    ctx.lineTo(-spaceship.width, spaceship.height / 2);
    ctx.closePath();
    ctx.strokeStyle = "#000";
    ctx.stroke();

    ctx.restore();
}

function moveSpaceship() {
    const delta = Math.cos(spaceship.angle) * spaceship.speed;
    const epsilon = Math.sin(spaceship.angle) * spaceship.speed;

    spaceship.x += delta;
    spaceship.y += epsilon;

    // Change angle randomly
    if (Math.random() < 0.01) {
        spaceship.angle += Math.random() * 0.4 - 0.2;
        spaceship.angle = normalizeAngle(spaceship.angle);
    }

    // Bounce of the screen boundaries
    if (spaceship.x < 0) {
        spaceship.angle = Math.PI - spaceship.angle;
        spaceship.x = 0;
    } else if (spaceship.x > canvas.width) {
        spaceship.angle = Math.PI - spaceship.angle;
        spaceship.x = canvas.width;
    }

    if (spaceship.y < 0) {
        spaceship.angle = -spaceship.angle;
        spaceship.y = 0;
    } else if (spaceship.y > canvas.height) {
        spaceship.angle = -spaceship.angle;
        spaceship.y = canvas.height;
    }

    // Make sure angle stays in correct range
    spaceship.angle = normalizeAngle(spaceship.angle);
}

function drawText() {
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.fillText(`Speed: ${spaceship.speed.toFixed(2)}`, canvas.width - 200, canvas.height - 40);
    ctx.fillText(`Angle: ${(spaceship.angle * 180 / Math.PI).toFixed(2)}°`, canvas.width - 200, canvas.height - 25);
    ctx.fillText(`Hits: ${hits}   Points: ${points}`, canvas.width - 200, canvas.height - 10);
}

function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle key states
    if (keysPressed["ArrowLeft"]) {
        spaceship.angle -= 0.05;
        spaceship.angle = normalizeAngle(spaceship.angle);
    }
    if (keysPressed["ArrowRight"]) {
        spaceship.angle += 0.05;
        spaceship.angle = normalizeAngle(spaceship.angle);
    }
    if (keysPressed["ArrowUp"]) {
        spaceship.speed = Math.min(5, spaceship.speed + 0.1);
    }
    if (keysPressed["ArrowDown"]) {
        spaceship.speed = Math.max(0, spaceship.speed - 0.1);
    }

    if (Math.random() < 0.01) {
        createObject();
    }

    drawBackground();
    moveSpaceship();
    drawSpaceship();
    updateShots();
    drawShots();
    updateObjects();
    drawObjects();
    drawText();
    updateAndDrawPointsAnimations();

    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;

    if (event.key === " " && !keysPressed.Space) {
        createShot();
        keysPressed.Space = true; // Prevents multiple shots while holding the Space key
    }
});

window.addEventListener("keyup", (event) => {
    delete keysPressed[event.code];
});

gameLoop();
