var activePage = "skills";

function hide(id) {
  document.getElementById(id).style.display = "none";
}

function show(id) {
  document.getElementById(id).style.display = "block";
}

function showPage(id) {
  hide(activePage);
  document
    .querySelector(`#top-menu-bar a[data-page="${activePage}"]`)
    .classList.remove("active");
  show(id);
  $('#top-menu-bar a[data-page="' + id + '"]').classList.add("active");

  document
    .querySelector(`#top-menu-bar a[data-page="${id}"]`)
    .classList.add("active");
  show(id);
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
  var skillsMapResult = skills.map(function (skill) {
    var cls = skill.favorite ? "favorite" : "";
    console.info("inside map %o", cls, skill);
    return `<li class ="${cls}">${skill.name} <span>- ${skill.endorcements}</span></li>`;
  });
  $("#skills ul").innerHTML = skillsMapResult.join("");
}

function $(selector) {
  return document.querySelector(selector);
}
