function variablesExample() {
  console.log(true);
  console.info("page loaded");
  console.debug(5 - 2);
  console.warn(10 / 2);
  console.error("hello " + "there");

  var employed = true;
  var age = 31;
  var name = "Deepbip";
  console.info(employed);
  console.info(typeof employed);
  console.warn("age", age, typeof age, typeof name);

  console.info("My Name is", name, typeof name);

  var skills = ["HTML", "CSS", `JS`];
  console.debug(skills, typeof skills);

  var person = {
    employed: true,
    age: 29,
  };
  console.info(person, typeof person);
}

function updateTitle(title) {
  var jobTitle = document.getElementById("job-title");
  console.warn(jobTitle, typeof jobTitle);

  console.info(jobTitle.innerHTML);
  jobTitle.innerHTML = title;
  console.info(jobTitle.innerHTML);
}

function jsonWithFunctions() {
  console.log(typeof variablesExample);
  console.log(typeof document);
  console.log(typeof document.getElementById);

  var person = {
    age: 29,
    name: "Squeak",
    learn: function () {
      console.info("I'm Gaming and I love it!");
    },
    play: function () {
      console.info("I'm gaming. My name is ", this.name);
    },
  };
  person.learn();
  person.play();
  var action = "play"; // learn
  person[action]();
}

// variablesExample();

updateTitle("Gaming");

//jsonWithFunctions();
