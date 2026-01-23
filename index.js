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

showPage("home");

document.querySelector("#top-menu-bar").addEventListener("click", function (e) {
  var id = e.target.dataset.page;
  console.info("click on menu-bar", id);
  if (id) {
    showPage(id);
  }
});

function $(selector) {
  return document.querySelector(selector);
}

var skills = ["HTML - 2", "CSS - 2", "JavaScript - 2"];
var skillsMapResult = skills.map(function (skill) {
  console.info("inside map", skill);
  return "<li>" + skill + "</li>";
});
console.warn("result", skillsMapResult);
$("#skills ul").innerHTML = skillsMapResult.join("");
