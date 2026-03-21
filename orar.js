// Orar.js - Logic for rendering and rotating the schedule

document.addEventListener("DOMContentLoaded", function () {
  const options = CircleSlices.render({
    renderTo: "#orar",
    groupSize: 400,
    slicesSize: 330,
    centerSize: 120,
    text: `
# Luni
Op. Romana
Op. Engleza
Fizica
Latina
Engleza
Sport

# Marți
Chimie
Desen
Franceza
Mate
Romana
Engleza

# Miercuri
Dirigenție
Istorie
Romana
Tehno
Mate
Sociala
Sport

#  Joi
Mate
Biologie
Chimie
Fizica
Romana
Franceza

#  Vineri
Biologie
Romana
T.I.C
Religie
Mate
Geografie
Muzica
`,
    centerText: `# 🚀 7C`,
  });

  console.info("options", options);

  const azi = new Date();
  let zi = azi.toLocaleDateString("ro-RO", { weekday: "long" });

  // Capitalize the first letter
  zi = zi.charAt(0).toUpperCase() + zi.slice(1);

  // If it's past 3 PM, move to the next day
  if (azi.getHours() >= 15) {
    const zile = [
      "Luni",
      "Marți",
      "Miercuri",
      "Joi",
      "Vineri",
      "Sâmbătă",
      "Duminică",
    ];
    const currentIndex = zile.indexOf(zi);
    zi = zile[(currentIndex + 1) % zile.length];
  }

  // Find the div corresponding to the current day
  const orarDiv = document.querySelector("#orar");
  if (orarDiv) {
    let slice = Array.from(
      orarDiv.querySelectorAll(".slice-text .phrase-inner"),
    ).find((el) => el.textContent.trim() === zi);

    // If the day is not found (e.g., weekend), find the next available day
    const zileOrar = Array.from(
      orarDiv.querySelectorAll(".slice-text .phrase-inner"),
    );
    while (!slice && zileOrar.length) {
      const nextDay = zileOrar.shift();
      slice = nextDay;
    }

    // Simulate a click on the found div
    if (slice) {
      slice.click();
    }
  }
});
