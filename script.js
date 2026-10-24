
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const pendingTasks = document.getElementById("pending-tasks");

const studySubject = document.getElementById("study-subject");
const studyTime = document.getElementById("study-time");
const startStudy = document.getElementById("start-study");
const studyMessage = document.getElementById("study-message");
const todayDate = document.getElementById("today-date");

let tasks = JSON.parse(localStorage.getItem("studyspace-tasks")) || [];

todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
});

function saveTasks() {
    localStorage.setItem("studyspace-tasks", JSON.stringify(tasks));
}



function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const pending = total - completed;

    // Update the dashboard statistics
    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    // Show or hide the empty-list message
    emptyMessage.style.display = total === 0 ? "block" : "none";

    // Calculate task completion percentage
    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    // Update the task progress bar
    const progressText = document.getElementById("progress-text");
    const progressFill = document.getElementById("progress-fill");
    const progressBar = document.getElementById("progress-bar");

    progressText.textContent = `${percentage}% completed`;
    progressFill.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", percentage);

    // Update today's summary
    document.getElementById("summary-completed").textContent = completed;
    document.getElementById("summary-pending").textContent = pending;
    document.getElementById("summary-progress").textContent = `${percentage}%`;

    const summaryMessage = document.getElementById("summary-message");

    if (total === 0) {
        summaryMessage.textContent =
            "Start with one small task. You've got this!";
    } else if (percentage === 100) {
        summaryMessage.textContent =
            "Amazing! You've completed all your tasks today!";
    } else if (percentage >= 50) {
        summaryMessage.textContent =
            "Great progress! Keep going and finish strong.";
    } else {
        summaryMessage.textContent =
            "Every completed task is progress. Keep it up!";
    }
}


function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task complete");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const text = document.createElement("span");
        text.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-task";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(currentTask => currentTask.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, text, deleteButton);
        taskList.appendChild(item);
    });

    updateStats();
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        return;
    }

    tasks.push({
        id: Date.now(),
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskForm.reset();
    taskInput.focus();
});


const pauseStudy = document.getElementById("pause-study");
const resetStudy = document.getElementById("reset-study");
const timerDisplay = document.getElementById("timer-display");

let remainingSeconds = Number(studyTime.value) * 60;
let timerInterval = null;

function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    remainingSeconds = Number(studyTime.value) * 60;
    updateTimerDisplay();
    studyMessage.textContent = "Timer reset. Ready for another session?";
}

studyTime.addEventListener("change", resetTimer);

startStudy.addEventListener("click", () => {
    const subject = studySubject.value.trim();

    if (!subject) {
        studyMessage.textContent = "Enter a subject first to start studying.";
        studySubject.focus();
        return;
    }

    if (timerInterval !== null) return;

    if (remainingSeconds <= 0) {
        remainingSeconds = Number(studyTime.value) * 60;
    }

    studyMessage.textContent = `Focus time: ${subject}. You've got this!`;

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();

        if (remainingSeconds <= 0) {
            stopTimer();
            studyMessage.textContent =
                `Session complete! Great work on ${subject}.`;
        }
    }, 1000);
});

pauseStudy.addEventListener("click", () => {
    stopTimer();
    studyMessage.textContent = "Session paused. Resume when you're ready.";
});

resetStudy.addEventListener("click", resetTimer);

updateTimerDisplay();
renderTasks();
