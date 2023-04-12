# Asteroids by Chris

This is a computer game where the player controls a spaceship, shoots objects, and earns points based on object size, speed, and distance from the spaceship.

## Code Structure

The JavaScript code is organized into several functions and objects to handle different aspects of the game:

- **Spaceship**: Represents the player's spaceship, including its position, speed, angle, and drawing logic.
- **Object**: Represents an asteroid in the game, including its size, shape, position, speed, and drawing logic.
- **Shot**: Represents a shot fired by the spaceship, including its position, speed, angle, and drawing logic.
- **PointAnimation**: Represents the point animation displayed when an object is hit, including its position, size, duration, and drawing logic.

The main game loop is controlled by the update function, which calls various update and drawing functions for the spaceship, objects, shots, and point animations.

## Controls

The following keys control the spaceship and game interactions:

- **Arrow Left**: Rotate the spaceship left.
- **Arrow Right**: Rotate the spaceship right.
- **Arrow Up**: Increase the spaceship's speed.
- **Arrow Down**: Decrease the spaceship's speed.
- **Space**: Fire a shot from the spaceship.

## Scoring

Points are calculated for each object hit based on its size, speed, and distance from the spaceship. The formula for calculating the points is as follows:

`points = base_points * (1 + size_factor + speed_factor + distance_factor)`

- **base_points**: A constant value representing the base points for hitting an object.
- **size_factor**: A multiplier based on the object's size (smaller objects have a higher multiplier).
- **speed_factor**: A multiplier based on the object's speed (faster objects have a higher multiplier).
- **distance_factor**: A multiplier based on the distance between the object and the spaceship (objects further away have a higher multiplier).

## Software Architecture

The game is built using JavaScript and the HTML5 Canvas API. It follows a modular approach, with each game element (spaceship, object, shot, and point animation) encapsulated in its own object with its own properties and methods. The main game loop (update function) orchestrates the interactions between these elements and handles the game's state. The game also leverages event listeners to handle user input (keyboard events) and detect collisions between game elements. The use of event listeners allows for a responsive and interactive gameplay experience.
Getting Started

To play the game just open `index.html` in a web browser. Use the arrow keys to control the spaceship and the spacebar to fire shots at the objects. Earn points by hitting objects and see how high of a score you can achieve!
