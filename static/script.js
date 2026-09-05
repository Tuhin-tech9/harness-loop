const questionInput =
    document.getElementById("question");

const runButton =
    document.getElementById("runButton");

const loading =
    document.getElementById("loading");

const resultSection =
    document.getElementById("resultSection");

const errorBox =
    document.getElementById("errorBox");

const charCount =
    document.getElementById("charCount");


// ======================================================
// CHARACTER COUNT
// ======================================================

questionInput.addEventListener(
    "input",
    function () {

        charCount.textContent =
            `${questionInput.value.length} / 1000`;

    }
);


// ======================================================
// SET QUESTION
// ======================================================

function setQuestion(question) {

    questionInput.value = question;

    charCount.textContent =
        `${question.length} / 1000`;

    questionInput.focus();

}


// ======================================================
// ENTER KEY
// ======================================================

questionInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            runSupportAgent();

        }

    }
);


// ======================================================
// PIPELINE ELEMENTS
// ======================================================

const pipelineSteps =
    document.querySelectorAll(
        ".pipeline-step"
    );

const pipelineArrows =
    document.querySelectorAll(
        ".pipeline-arrow"
    );


// ======================================================
// RESET PIPELINE
// ======================================================

function resetPipeline() {

    pipelineSteps.forEach(
        step => {

            step.classList.remove(
                "pipeline-active",
                "pipeline-complete",
                "pipeline-blocked"
            );

        }
    );


    pipelineArrows.forEach(
        arrow => {

            arrow.style.color = "";

            arrow.style.transform = "";

        }
    );
}


// ======================================================
// ACTIVATE STEP
// ======================================================

function activatePipelineStep(index) {

    if (!pipelineSteps[index]) {
        return;
    }

    pipelineSteps[index]
        .classList.add(
            "pipeline-active"
        );

}


// ======================================================
// COMPLETE STEP
// ======================================================

function completePipelineStep(index) {

    if (!pipelineSteps[index]) {
        return;
    }

    pipelineSteps[index]
        .classList.remove(
            "pipeline-active"
        );

    pipelineSteps[index]
        .classList.add(
            "pipeline-complete"
        );

}


// ======================================================
// ARROW
// ======================================================

function activateArrow(index) {

    if (!pipelineArrows[index]) {
        return;
    }

    pipelineArrows[index].style.color =
        "var(--primary)";

    pipelineArrows[index].style.transform =
        "translateX(5px)";

}


// ======================================================
// START PIPELINE ANIMATION
// ======================================================

function startPipelineAnimation() {

    resetPipeline();


    activatePipelineStep(0);


    setTimeout(
        () => {

            completePipelineStep(0);

            activateArrow(0);

            activatePipelineStep(1);

        },
        650
    );


    setTimeout(
        () => {

            completePipelineStep(1);

            activateArrow(1);

            activatePipelineStep(2);

        },
        1400
    );


    setTimeout(
        () => {

            completePipelineStep(2);

            activateArrow(2);

            activatePipelineStep(3);

        },
        2200
    );


    setTimeout(
        () => {

            completePipelineStep(3);

        },
        3000
    );

}


// ======================================================
// STOP PIPELINE
// ======================================================

function stopPipelineAnimation() {

    pipelineSteps.forEach(
        step => {

            step.classList.remove(
                "pipeline-active"
            );

        }
    );

}


// ======================================================
// BLOCK PIPELINE
// ======================================================

function blockPipeline() {

    resetPipeline();


    if (pipelineSteps[0]) {

        pipelineSteps[0]
            .classList.add(
                "pipeline-blocked"
            );

    }

}


// ======================================================
// RUN SUPPORT AGENT
// ======================================================

async function runSupportAgent() {

    const question =
        questionInput.value.trim();


    if (!question) {

        showError(
            "Please enter a support question."
        );

        return;

    }


    hideError();


    resultSection.classList.add(
        "hidden"
    );


    loading.classList.remove(
        "hidden"
    );


    runButton.disabled = true;


    startPipelineAnimation();


    try {

        const response =
            await fetch(
                "/run",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question:
                            question
                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Server error"
            );

        }


        if (data.success === false) {

            throw new Error(
                data.error ||
                data.message ||
                "Agent failed"
            );

        }


        /*
         * Give the pipeline
         * enough time to animate
         */

        await wait(700);


        displayResult(data);


    }

    catch (error) {

        console.error(error);

        showError(
            error.message
        );

        resetPipeline();

    }

    finally {

        loading.classList.add(
            "hidden"
        );

        runButton.disabled = false;

        stopPipelineAnimation();

    }

}


// ======================================================
// DISPLAY RESULT
// ======================================================

function displayResult(data) {

    const finalAnswer =
        document.getElementById(
            "finalAnswer"
        );


    const answerCard =
        document.getElementById(
            "answerCard"
        );


    const answerIcon =
        document.getElementById(
            "answerIcon"
        );


    const answerState =
        document.getElementById(
            "answerState"
        );


    const guardrailStatus =
        document.getElementById(
            "guardrailStatus"
        );


    const guardrailCard =
        document.getElementById(
            "guardrailCard"
        );


    const routeValue =
        document.getElementById(
            "routeValue"
        );


    const routeBadge =
        document.getElementById(
            "routeBadge"
        );


    const routeCard =
        document.getElementById(
            "routeCard"
        );


    const reviewerStatus =
        document.getElementById(
            "reviewerStatus"
        );


    const reviewerCard =
        document.getElementById(
            "reviewerCard"
        );


    // ==================================================
    // ANSWER
    // ==================================================

    finalAnswer.textContent =
        data.answer ||
        "No answer returned.";


    // Remove old states

    answerCard.classList.remove(
        "guardrail-blocked"
    );

    guardrailCard.classList.remove(
        "blocked-stat"
    );

    routeCard.classList.remove(
        "blocked-stat"
    );

    reviewerCard.classList.remove(
        "blocked-stat"
    );

    finalAnswer.classList.remove(
        "blocked-answer"
    );

    routeBadge.classList.remove(
        "blocked-route"
    );


    // ==================================================
    // BLOCKED
    // ==================================================

    if (data.blocked === true) {

        // Red answer

        answerCard.classList.add(
            "guardrail-blocked"
        );


        answerIcon.textContent = "⚠";


        answerState.textContent =
            "BLOCKED";


        answerState.style.color =
            "var(--red)";


        guardrailStatus.textContent =
            "Blocked";


        guardrailCard.classList.add(
            "blocked-stat"
        );


        // Route

        routeValue.textContent =
            "Stopped";


        routeBadge.textContent =
            "BLOCKED";


        routeBadge.classList.add(
            "blocked-route"
        );


        routeCard.classList.add(
            "blocked-stat"
        );


        // Reviewer

        reviewerStatus.textContent =
            "Skipped";


        reviewerCard.classList.add(
            "blocked-stat"
        );


        // Pipeline

        blockPipeline();

    }


    // ==================================================
    // NORMAL
    // ==================================================

    else {

        answerIcon.textContent =
            "✓";


        answerState.textContent =
            "VERIFIED";


        answerState.style.color =
            "var(--green)";


        guardrailStatus.textContent =
            "Passed";


        const route =
            data.route ||
            "general";


        routeValue.textContent =
            capitalize(route);


        routeBadge.textContent =
            route.toUpperCase();


        reviewerStatus.textContent =
            "Completed";

    }


    // ==================================================
    // TRACE
    // ==================================================

    renderTrace(
        data.trace || []
    );


    // ==================================================
    // SHOW RESULT
    // ==================================================

    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ======================================================
// TRACE
// ======================================================

function renderTrace(trace) {

    const traceList =
        document.getElementById(
            "traceList"
        );


    const traceCount =
        document.getElementById(
            "traceCount"
        );


    traceList.innerHTML = "";


    traceCount.textContent =
        `${trace.length} step${trace.length === 1 ? "" : "s"}`;


    if (!trace.length) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "trace-item";


        empty.style.opacity = "1";


        empty.innerHTML = `

            <div class="trace-number">
                —
            </div>

            <div class="trace-text">
                No trace information available.
            </div>

        `;


        traceList.appendChild(
            empty
        );

        return;

    }


    trace.forEach(
        (item, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "trace-item";


            element.style.animationDelay =
                `${index * 120}ms`;


            element.innerHTML = `

                <div class="trace-number">
                    ${index + 1}
                </div>

                <div class="trace-text">
                    ${escapeHtml(
                        String(item)
                    )}
                </div>

            `;


            traceList.appendChild(
                element
            );

        }
    );

}


// ======================================================
// THEME
// ======================================================

function toggleTheme() {

    const body =
        document.body;


    const button =
        document.getElementById(
            "themeToggle"
        );


    body.classList.toggle(
        "dark-mode"
    );


    if (
        body.classList.contains(
            "dark-mode"
        )
    ) {

        button.textContent =
            "☀️";


        localStorage.setItem(
            "theme",
            "dark"
        );

    }

    else {

        button.textContent =
            "🌙";


        localStorage.setItem(
            "theme",
            "light"
        );

    }

}


// ======================================================
// LOAD THEME
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const theme =
            localStorage.getItem(
                "theme"
            );


        const button =
            document.getElementById(
                "themeToggle"
            );


        if (
            theme === "dark"
        ) {

            document.body.classList.add(
                "dark-mode"
            );

            button.textContent =
                "☀️";

        }

        else {

            button.textContent =
                "🌙";

        }

    }
);


// ======================================================
// ERROR
// ======================================================

function showError(message) {

    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "hidden"
    );


    errorBox.classList.remove(
        "error-shake"
    );


    void errorBox.offsetWidth;


    errorBox.classList.add(
        "error-shake"
    );

}


function hideError() {

    errorBox.classList.add(
        "hidden"
    );

}


// ======================================================
// HELPERS
// ======================================================

function capitalize(value) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


function wait(ms) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );

}