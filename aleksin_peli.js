const questions = [
    { text: "Sammutat valot, kun poistut huoneesta", correct: "good" },
    { text: "Heität roskat luontoon", correct: "bad" },
    { text: "Käytät kangaskassia kaupassa", correct: "good" },
    { text: "Pidät hanan auki turhaan", correct: "bad" },
    { text: "Lajittelet roskat oikein", correct: "good" },
    { text: "Jätät puhelimen laturiin koko yön ajaksi", correct: "bad" },
    { text: "Kävelet tai pyöräilet lyhyen matkan", correct: "good" },
    { text: "Otat todella pitkän kuuman suihkun", correct: "bad" },
    { text: "Sammut television kun et katso sitä", correct: "good" },
    { text: "Ostat uuden tavaran vaikka vanhan voisi korjata", correct: "bad" }
];

let currentQuestion = 0;
let score = 0;

function showQuestion() {
    document.getElementById("question").textContent =
        questions[currentQuestion].text;

    document.getElementById("questionNumber").textContent =
        "Kysymys " + (currentQuestion + 1) + " / " + questions.length;
}

function answer(choice) {
    const correct = questions[currentQuestion].correct;
    const feedback = document.getElementById("feedback");

    if (choice === correct) {
        feedback.textContent = "Oikein! ✅";
        score++;
    } else {
        feedback.textContent = "Väärin ❌";
    }

    document.getElementById("score").textContent = score;

    // Näytetään seuraava nappi
    document.getElementById("nextBtn").style.display = "inline-block";
}

function nextQuestion() {
    currentQuestion++;

    document.getElementById("feedback").textContent = "";
    document.getElementById("nextBtn").style.display = "none";

    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        document.getElementById("question").textContent =
            "Peli ohi! Sait " + score + " / 10 pistettä 🎉";

        document.getElementById("questionNumber").textContent = "Valmis!";

        document.getElementById("restartBtn").style.display = "inline-block";

        document.querySelector(".btn-success").style.display = "none";
        document.querySelector(".btn-danger").style.display = "none";
    }
}

function restartGame() {
    currentQuestion = 0;
    score = 0;

    document.getElementById("score").textContent = score;
    document.getElementById("feedback").textContent = "";

    document.getElementById("restartBtn").style.display = "none";
    document.getElementById("nextBtn").style.display = "none";

    document.querySelector(".btn-success").style.display = "inline-block";
    document.querySelector(".btn-danger").style.display = "inline-block";
    showQuestion();
}

// Käynnistää pelin
showQuestion();