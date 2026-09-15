const gameCards = document.querySelectorAll(".game-card");
const startButton = document.querySelector(".start-button");
const selectionMessage = document.querySelector(".selection-message");
const homeShell = document.querySelector(".home-shell");
const builderShell = document.querySelector(".builder-shell");
const backButton = document.querySelector(".back-button");
const titleInput = document.querySelector("#game-title");
const categoryField = document.querySelector(".category-field");
const categoryInput = document.querySelector("#category-name");
const questionInput = document.querySelector("#survey-question");
const colorInput = document.querySelector("#board-color");
const colorValue = document.querySelector(".color-value");
const backgroundInput = document.querySelector("#board-background");
const backgroundColorValue = document.querySelector(".background-color-value");
const imageInput = document.querySelector("#board-image");
const previewImage = document.querySelector(".preview-image");
const answerList = document.querySelector(".answer-list");
const addAnswerButton = document.querySelector(".add-answer");
const builderEyebrow = document.querySelector("#builder-eyebrow");
const promptLabel = document.querySelector("#prompt-label");
const entriesHeading = document.querySelector("#entries-heading");
const entriesLabel = document.querySelector("#entries-label");
const previewKicker = document.querySelector("#preview-kicker");
const presentButton = document.querySelector("#present-button");
const downloadButton = document.querySelector("#download-button");
let selectedGame = "";
let displayWindow = null;
let uploadedImageData = "";

const builderModes = {
	"Family Feud": {
		eyebrow: "FAMILY FEUD / TEMPLATE",
		title: "My Family Feud",
		promptLabel: "Survey question",
		promptPlaceholder: "Name something people do on a road trip",
		entriesHeading: "03 / Survey answers",
		entriesLabel: "POINTS",
		answerPlaceholders: ["Top answer", "Second answer", "Third answer"],
		previewKicker: "FAMILY FEUD",
		previewPrompt: "Your survey question will appear here",
		previewDefaults: ["Top answer", "Second answer", "Third answer"]
	},
	Jeopardy: {
		eyebrow: "JEOPARDY / TEMPLATE",
		title: "My Jeopardy",
		promptLabel: "Board instructions",
		promptPlaceholder: "Choose a clue, then answer in the form of a question",
		entriesHeading: "03 / Clues and values",
		entriesLabel: "VALUES",
		answerPlaceholders: ["First clue", "Second clue", "Third clue"],
		previewKicker: "JEOPARDY",
		previewPrompt: "Your board instructions will appear here",
		previewDefaults: ["First clue", "Second clue", "Third clue"]
	}
};

const configureBuilder = (game) => {
	const mode = builderModes[game];
	builderEyebrow.innerHTML = `<span class="eyebrow-line"></span> ${mode.eyebrow}`;
	titleInput.placeholder = mode.title;
	promptLabel.textContent = mode.promptLabel;
	questionInput.placeholder = mode.promptPlaceholder;
	entriesHeading.textContent = mode.entriesHeading;
	entriesLabel.textContent = mode.entriesLabel;
	previewKicker.textContent = mode.previewKicker;
	categoryField.hidden = game !== "Jeopardy";
	questionInput.value = "";
	categoryInput.value = "";
	answerList.querySelectorAll(".answer-row").forEach((row, index) => {
		row.querySelector("input[type='text']").placeholder = mode.answerPlaceholders[index] || "Another clue";
	});
	document.querySelectorAll(".preview-answers strong").forEach((answer, index) => {
		answer.textContent = mode.previewDefaults[index];
	});
};

const showBuilder = () => {
	homeShell.hidden = true;
	builderShell.hidden = false;
	configureBuilder(selectedGame);
	document.title = `Geoparty | Build ${selectedGame}`;
	titleInput.focus();
};

const showHome = () => {
	builderShell.hidden = true;
	homeShell.hidden = false;
	document.title = "Geoparty | Choose your game";
};

gameCards.forEach((card) => {
	card.addEventListener("click", () => {
		selectedGame = card.dataset.game;
		if (selectedGame === "Family Feud") {
			showBuilder();
			return;
		}
		gameCards.forEach((otherCard) => {
			otherCard.setAttribute("aria-pressed", String(otherCard === card));
		});
		selectionMessage.textContent = `${selectedGame} selected`;
		startButton.disabled = false;
		if (selectedGame === "Jeopardy") showBuilder();
	});
});

backButton.addEventListener("click", showHome);

startButton.addEventListener("click", () => {
	if (!selectedGame) return;
	selectionMessage.textContent = `${selectedGame} is ready to play`;
	startButton.querySelector("span").textContent = "Coming up next";
});

const updatePreview = () => {
	const mode = builderModes[selectedGame] || builderModes["Family Feud"];
	document.querySelector(".preview-title").textContent = titleInput.value || mode.title;
	document.querySelector(".preview-question").textContent = questionInput.value || mode.previewPrompt;
	colorValue.textContent = colorInput.value.toUpperCase();
	backgroundColorValue.textContent = backgroundInput.value.toUpperCase();
	document.documentElement.style.setProperty("--builder-accent", colorInput.value);
	document.documentElement.style.setProperty("--builder-background", backgroundInput.value);
	answerList.querySelectorAll(".answer-row").forEach((row, index) => {
		const previewRow = document.querySelectorAll(".preview-answers div")[index];
		if (!previewRow) return;
		const fields = row.querySelectorAll("input");
		previewRow.querySelector("strong").textContent = fields[0].value || mode.previewDefaults[index] || "Another clue";
		previewRow.querySelector("b").textContent = fields[1].value || "--";
	});
	updateDisplayWindow();
};

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

const getBoardState = () => {
	const mode = builderModes[selectedGame] || builderModes["Family Feud"];
	return {
		mode,
		title: titleInput.value || mode.title,
		question: questionInput.value || mode.previewPrompt,
		accent: colorInput.value,
		background: backgroundInput.value,
		image: uploadedImageData,
		answers: [...answerList.querySelectorAll(".answer-row")].map((row, index) => ({
			label: row.querySelector("input[type='text']").value || mode.previewDefaults[index] || "Answer",
			points: row.querySelector("input[type='number']").value || "--"
		}))
	};
};

const updateDisplayWindow = () => {
	if (!displayWindow || displayWindow.closed) return;
	const state = getBoardState();
	displayWindow.document.body.style.setProperty("--display-accent", state.accent);
	displayWindow.document.body.style.setProperty("--display-background", state.background);
	displayWindow.document.querySelector(".display-title").textContent = state.title;
	displayWindow.document.querySelector(".display-question").textContent = state.question;
	displayWindow.document.querySelector(".display-kicker").textContent = state.mode.previewKicker;
	displayWindow.document.querySelector(".display-image").style.backgroundImage = state.image ? `url(${state.image})` : `linear-gradient(135deg, ${state.accent}, ${state.background})`;
	displayWindow.document.querySelector(".display-answers").innerHTML = state.answers.map((answer, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><i></i></div>`).join("");
};

const openDisplayWindow = () => {
	displayWindow = window.open("", "geoparty-projector", "width=1200,height=800");
	if (!displayWindow) {
		presentButton.textContent = "Allow pop-ups to open display";
		return;
	}
	displayWindow.document.open();
	displayWindow.document.write(`<!doctype html><html><head><title>Geoparty Projector</title><style>body{--display-accent:#ff765d;--display-background:#1b2532;margin:0;min-height:100vh;background:var(--display-background);color:#f4f0e7;font-family:Arial,sans-serif}.display-image{height:22vh;background-position:center;background-size:cover}.display-content{width:min(900px,82vw);margin:0 auto;padding:7vh 0}.display-kicker{color:var(--display-accent);font:12px monospace;letter-spacing:.16em}.display-title{margin:16px 0 10px;font-size:clamp(38px,6vw,84px);letter-spacing:-.06em}.display-question{max-width:760px;color:#a1a8ad;font-size:clamp(18px,2.3vw,32px);line-height:1.25}.display-answers{display:grid;gap:12px;margin-top:8vh}.display-answers div{display:flex;align-items:center;gap:22px;height:64px;border-bottom:1px solid rgba(244,240,231,.2)}.display-answers span{color:var(--display-accent);font:14px monospace}.display-answers i{display:block;width:100%;height:18px;background:rgba(244,240,231,.1)}.display-hint{position:fixed;right:28px;bottom:22px;color:#68727b;font:10px monospace;letter-spacing:.1em}</style></head><body><div class="display-image"></div><main class="display-content"><p class="display-kicker"></p><h1 class="display-title"></h1><p class="display-question"></p><div class="display-answers"></div></main><p class="display-hint">PROJECTOR VIEW / ANSWERS HIDDEN</p></body></html>`);
	displayWindow.document.close();
	updateDisplayWindow();
	displayWindow.focus();
};

const downloadBoard = () => {
	const board = getBoardState();
	const file = new Blob([JSON.stringify({
		geopartyVersion: 1,
		exportedAt: new Date().toISOString(),
		game: selectedGame,
		board
	}, null, 2)], { type: "application/json" });
	const downloadUrl = URL.createObjectURL(file);
	const link = document.createElement("a");
	link.href = downloadUrl;
	link.download = `${selectedGame.toLowerCase().replace(/\s+/g, "-") || "geoparty-board"}.json`;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(downloadUrl);
	downloadButton.textContent = "JSON downloaded";
	window.setTimeout(() => {
		downloadButton.innerHTML = '<span aria-hidden="true">↓</span> Download JSON';
	}, 1800);
};

document.querySelectorAll(".builder-form input").forEach((input) => input.addEventListener("input", updatePreview));

imageInput.addEventListener("change", () => {
	const [image] = imageInput.files;
	if (!image) return;
	const reader = new FileReader();
	reader.addEventListener("load", () => {
		uploadedImageData = reader.result;
		previewImage.style.backgroundImage = `url(${reader.result})`;
		previewImage.classList.add("has-image");
		updateDisplayWindow();
	});
	reader.readAsDataURL(image);
});

presentButton.addEventListener("click", openDisplayWindow);
downloadButton.addEventListener("click", downloadBoard);

addAnswerButton.addEventListener("click", () => {
	const answerNumber = answerList.children.length + 1;
	const answerRow = document.createElement("label");
	answerRow.className = "answer-row";
	answerRow.innerHTML = `<span class="answer-number">${String(answerNumber).padStart(2, "0")}</span><input type="text" placeholder="Another answer"><input type="number" min="0" placeholder="0" aria-label="Points for answer ${answerNumber}"><button class="remove-answer" type="button" aria-label="Remove answer ${answerNumber}">×</button>`;
	answerList.append(answerRow);
	answerRow.querySelectorAll("input").forEach((input) => input.addEventListener("input", updatePreview));
	answerRow.querySelector(".remove-answer").addEventListener("click", () => {
		answerRow.remove();
		updatePreview();
	});
	updatePreview();
});

document.querySelectorAll(".remove-answer").forEach((button) => {
	button.addEventListener("click", (event) => {
		event.preventDefault();
		button.closest(".answer-row").remove();
		updatePreview();
	});
});