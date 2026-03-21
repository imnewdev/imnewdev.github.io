var activePage = "home";

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
