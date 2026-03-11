var activePage = "skills";

function hide(id) {
  document.getElementById(id).style.display = "none";
}

function show(id) {
  document.getElementById(id).style.display = "block";
}

function showPage(id) {
  // hide previous
  hide(activePage);
  var prevLink = document.querySelector(
    `#top-menu-bar a[data-page="${activePage}"]`,
  );
  if (prevLink) prevLink.classList.remove("active");

  // show new
  show(id);
  var link = document.querySelector(`#top-menu-bar a[data-page="${id}"]`);
  if (link) link.classList.add("active");

  // manage snake game lifecycle: start when entering snake page, stop otherwise
  if (id === "snake") {
    // initialize and start the game when opening the snake page
    if (typeof SnakeGame !== "undefined") {
      SnakeGame.reset();
      SnakeGame.start();
    }
  } else {
    // if we leave the snake page, stop the game
    if (typeof SnakeGame !== "undefined") {
      SnakeGame.stop();
    }
  }

  activePage = id;
}

showPage(activePage);

document.querySelector("#top-menu-bar").addEventListener("click", function (e) {
  var id = e.target.dataset.page;
  console.info("click on menu-bar", id);
  if (id) {
    showPage(id);
  }
});

fetch("skills.json")
  .then(function (response) {
    console.info("done?");
    return response.json();
  })
  .then(function (skills) {
    printSkills(skills);
  });

function printSkills(skills) {
  skills = sortSkillsByEndorcements(skills);
  var skillsMapResult = skills.map(function (skill) {
    var cls = skill.favorite ? "favorite" : "";
    console.info("inside map %o", cls, skill);
    return `<li class ="${cls}">${skill.name} <span>- ${skill.endorcements}</span></li>`;
  });
  $("#skills ul").innerHTML = skillsMapResult.join("");
}

function sortSkillsByEndorcements(skills) {
  return skills.sort(function (a, b) {
    console.log(a, b);
    return b.endorcements - a.endorcements;
  });
}

function sortSkillsByName(skills) {
  return skills.sort(function (a, b) {
    console.log(a, b);
    return a.name.localeCompare(b.name);
  });
}

function $(selector) {
  return document.querySelector(selector);
}

/* --- Snake game implementation --- */
var SnakeGame = (function () {
  var canvas, ctx;
  var grid = 20; // 20x20 grid
  var cellSize = 20;
  var snake = [];
  var dir = { x: 1, y: 0 };
  var nextDir = { x: 1, y: 0 };
  var apple = null;
  var score = 0;
  var intervalId = null;
  var speed = 120; // ms per tick
  var running = false;

  function init() {
    canvas = document.getElementById("snake-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    cellSize = Math.floor(canvas.width / grid);
    // wire buttons
    var startBtn = document.getElementById("start-snake-btn");
    var stopBtn = document.getElementById("stop-snake-btn");
    if (startBtn)
      startBtn.addEventListener("click", function () {
        reset();
        start();
      });
    if (stopBtn)
      stopBtn.addEventListener("click", function () {
        stop();
      });
    // wire mobile directional buttons (if present)
    var mobileBtns = document.querySelectorAll(
      "#snake-mobile-controls .mobile-dir",
    );
    if (mobileBtns && mobileBtns.length) {
      mobileBtns.forEach(function (btn) {
        btn.addEventListener(
          "touchstart",
          function (ev) {
            ev.preventDefault();
            handleMobileDir(btn.dataset.dir);
          },
          { passive: false },
        );
        btn.addEventListener("mousedown", function (ev) {
          ev.preventDefault();
          handleMobileDir(btn.dataset.dir);
        });
      });
    }

    // touch / swipe support on canvas
    var touchStart = null;
    canvas.addEventListener(
      "touchstart",
      function (ev) {
        if (!ev.touches || ev.touches.length === 0) return;
        var t = ev.touches[0];
        touchStart = { x: t.clientX, y: t.clientY, t: Date.now() };
      },
      { passive: true },
    );
    canvas.addEventListener(
      "touchmove",
      function (ev) {
        // prevent page scroll while interacting with game
        if (ev.cancelable) ev.preventDefault();
      },
      { passive: false },
    );
    canvas.addEventListener(
      "touchend",
      function (ev) {
        if (!touchStart) return;
        var t = (ev.changedTouches && ev.changedTouches[0]) || null;
        if (!t) {
          touchStart = null;
          return;
        }
        var dx = t.clientX - touchStart.x;
        var dy = t.clientY - touchStart.y;
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);
        var threshold = Math.max(16, Math.min(40, Math.floor(cellSize * 0.15)));
        if (Math.max(adx, ady) > threshold) {
          if (adx > ady) {
            // horizontal
            if (dx > 0) handleMobileDir("right");
            else handleMobileDir("left");
          } else {
            if (dy > 0) handleMobileDir("down");
            else handleMobileDir("up");
          }
        }
        touchStart = null;
      },
      { passive: true },
    );
    // initial state
    reset();
  }

  function reset() {
    // start centered
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    placeApple();
    updateScore();
    draw();
  }

  function placeApple() {
    if (!canvas) return;
    var ok = false;
    var tries = 0;
    while (!ok && tries < 1000) {
      var x = Math.floor(Math.random() * grid);
      var y = Math.floor(Math.random() * grid);
      ok = !snake.some(function (s) {
        return s.x === x && s.y === y;
      });
      if (ok) {
        apple = { x: x, y: y };
        return;
      }
      tries++;
    }
    // fallback
    apple = { x: 0, y: 0 };
  }

  function step() {
    if (!canvas) return;
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    // wrap-around
    head.x = (head.x + grid) % grid;
    head.y = (head.y + grid) % grid;

    // collision with self
    if (
      snake.some(function (s) {
        return s.x === head.x && s.y === head.y;
      })
    ) {
      stop(true);
      return;
    }

    snake.unshift(head);

    // eat apple
    if (apple && head.x === apple.x && head.y === apple.y) {
      score++;
      placeApple();
      updateScore();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    if (!canvas) return;

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // helper: rounded rect fill
    function roundRectFill(x, y, w, h, r) {
      var r0 = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r0, y);
      ctx.arcTo(x + w, y, x + w, y + h, r0);
      ctx.arcTo(x + w, y + h, x, y + h, r0);
      ctx.arcTo(x, y + h, x, y, r0);
      ctx.arcTo(x, y, x + w, y, r0);
      ctx.closePath();
      ctx.fill();
    }

    // draw grid lines
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (var gx = 1; gx < grid; gx++) {
      var px = gx * cellSize + 0.5; // 0.5 for crisp subpixel lines
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvas.height);
      ctx.stroke();
    }
    for (var gy = 1; gy < grid; gy++) {
      var py = gy * cellSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(canvas.width, py);
      ctx.stroke();
    }
    ctx.restore();

    // draw apple as a rounded circle with a tiny highlight
    if (apple) {
      var cx = apple.x * cellSize + cellSize / 2;
      var cy = apple.y * cellSize + cellSize / 2;
      var radius = Math.max(2, cellSize * 0.38);
      ctx.save();
      ctx.fillStyle = "#ff3b3b";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      // highlight
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(
        cx - radius * 0.35,
        cy - radius * 0.45,
        radius * 0.28,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }

    // draw snake as rounded blocks
    for (var i = 0; i < snake.length; i++) {
      var s = snake[i];
      var x = s.x * cellSize;
      var y = s.y * cellSize;
      var pad = Math.max(1, Math.floor(cellSize * 0.06));
      var w = cellSize - pad * 2;
      var h = cellSize - pad * 2;
      var radius = Math.max(2, Math.floor(cellSize * 0.28));
      ctx.fillStyle = i === 0 ? "#b8ffb8" : "#39d13b";
      roundRectFill(x + pad, y + pad, w, h, radius);
      // small inner shine for head
      if (i === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        roundRectFill(
          x + pad + 1,
          y + pad + 1,
          w - 2,
          h - 2,
          Math.max(1, radius - 1),
        );
        // draw eyes on head based on current direction
        try {
          var eyeRadius = Math.max(1, Math.floor(cellSize * 0.09));
          var ex = x + cellSize / 2;
          var ey = y + cellSize / 2;
          var offset = Math.max(2, Math.floor(cellSize * 0.18));
          var leftEye = { x: ex - 6, y: ey - 6 };
          var rightEye = { x: ex - 6, y: ey + 6 };
          // adjust positions by dir
          if (dir.x === 1) {
            // facing right
            leftEye = { x: ex + offset * 0.5, y: ey - offset * 0.4 };
            rightEye = { x: ex + offset * 0.5, y: ey + offset * 0.4 };
          } else if (dir.x === -1) {
            leftEye = { x: ex - offset * 0.5, y: ey - offset * 0.4 };
            rightEye = { x: ex - offset * 0.5, y: ey + offset * 0.4 };
          } else if (dir.y === -1) {
            leftEye = { x: ex - offset * 0.45, y: ey - offset * 0.5 };
            rightEye = { x: ex + offset * 0.45, y: ey - offset * 0.5 };
          } else if (dir.y === 1) {
            leftEye = { x: ex - offset * 0.45, y: ey + offset * 0.5 };
            rightEye = { x: ex + offset * 0.45, y: ey + offset * 0.5 };
          }
          // white eye + pupil
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(leftEye.x, leftEye.y, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(rightEye.x, rightEye.y, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
          // pupils
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(
            leftEye.x + (dir.x * 0.12 || 0),
            leftEye.y + (dir.y * 0.12 || 0),
            Math.max(1, Math.floor(eyeRadius * 0.5)),
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            rightEye.x + (dir.x * 0.12 || 0),
            rightEye.y + (dir.y * 0.12 || 0),
            Math.max(1, Math.floor(eyeRadius * 0.5)),
            0,
            Math.PI * 2,
          );
          ctx.fill();
        } catch (e) {
          /* ignore drawing errors */
        }
      }
    }
  }

  function start() {
    if (!canvas) init();
    if (running) return;
    running = true;
    document.addEventListener("keydown", keyHandler);
    intervalId = setInterval(step, speed);
  }

  function stop(gameOver) {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    document.removeEventListener("keydown", keyHandler);
    if (gameOver) {
      // small delay so the final frame renders
      setTimeout(function () {
        alert("Game over! Score: " + score);
      }, 50);
    }
  }

  function updateScore() {
    var el = document.getElementById("snake-score");
    if (el) el.textContent = "Score: " + score;
  }

  function keyHandler(e) {
    var key = e.key;
    var mapping = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0],
    };
    var mv = mapping[key] || mapping[key.toLowerCase()];
    if (mv) {
      var nd = { x: mv[0], y: mv[1] };
      // ignore reverse direction
      if (nd.x === -dir.x && nd.y === -dir.y) return;
      nextDir = nd;
      e.preventDefault();
    }
  }

  // handle mobile directional input (string 'up','down','left','right')
  function handleMobileDir(dirStr) {
    var map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    var mv = map[dirStr];
    if (!mv) return;
    var nd = { x: mv[0], y: mv[1] };
    if (nd.x === -dir.x && nd.y === -dir.y) return; // ignore reverse
    nextDir = nd;
  }

  // expose API
  return {
    init: init,
    start: start,
    stop: stop,
    reset: reset,
    isRunning: function () {
      return running;
    },
  };
})();

// wire controls if present on load
// Ensure SnakeGame.init() runs whether the script loads before or after DOMContentLoaded.
function _initSnakeIfPresent() {
  try {
    if (document.getElementById("snake-canvas")) {
      console.info("Initializing SnakeGame");
      SnakeGame.init();
    }
  } catch (e) {
    console.warn("Snake init failed", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _initSnakeIfPresent);
} else {
  // DOM already ready
  _initSnakeIfPresent();
}
