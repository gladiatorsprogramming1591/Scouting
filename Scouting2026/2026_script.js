const undoStack = [];
const redoStack = [];

let isRestoring = false; // prevents undo/redo from re-recording
let pendingSnapshot = null;
let commitTimer = null;
let lastSnapshot;
const COMMIT_DELAY = 400; // typing pause threshold (ms)
let startHold;
let fuelRateData = {};


fetch("fuelrates.json")
    .then(response => response.json())
    .then(data => {
        fuelRateData = data;
    })
    .catch(err => {
        console.error("Failed to load fuel rate data:", err);
    });

function captureFormState(form) {
    const data = {};

    const excluded = ["fuelRate"]; // fields that should NOT be undoable

    form.querySelectorAll("input, select, textarea").forEach(el => {

        if (!el.id || excluded.includes(el.id)) return;

        if (el.type === "checkbox") {
            data[el.id] = el.checked;
        } else {
            data[el.id] = el.value;
        }
    });

    return data;
}

function restoreFormState(state) {
    isRestoring = true;

    Object.entries(state).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (!el) return;

        if (el.type === "checkbox") {
            el.checked = value;
        } else {
            el.value = value;
        }

        el.dispatchEvent(new Event("input", { bubbles: true }));
    });


    isRestoring = false;
}

 function commitSnapshot () 
    {
        if (!pendingSnapshot) return;

        undoStack.push({
            from: pendingSnapshot,
            to: lastSnapshot
        });
        pendingSnapshot = null;
    }


document.addEventListener("DOMContentLoaded", function ()
{
    const undoBtn = document.getElementById("undo-btn");
    const redoBtn = document.getElementById("redo-btn");

    undoBtn.addEventListener("click", undo);
    redoBtn.addEventListener("click", redo);

    const form = document.getElementById('data-form');
    const qrContainer = document.getElementById('qrcode');

    lastSnapshot = captureFormState(form);

    // Reset button logic with confirmation
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => 
    {
        if (!confirm("Are you sure you want to reset? All data will be cleared.")) 
        {
            return;
        }

        // Save values we want to keep
        const scouterValue = document.getElementById('scouterInitial').value;
        const matchValue = document.getElementById('match-number').value;
        const robotSelect = document.getElementById('robot-select').selectedIndex;
        

        // Clear ALL inputs, selects, and textareas
        form.querySelectorAll("input, select, textarea").forEach(el => {

            // Skip the two protected fields
            if (el.id === "scouterInitial" || el.id === "match-number") {
                return;
            }
            else if (el.id === 'robot-select')
            {
                el.selectedIndex = robotSelect;
                return;
            }

            if (el.type === "checkbox") {
                el.checked = false;
            } 
            else if (el.type === "number") {
                el.value = 0;
            } 
            else if (el.tagName === "SELECT") {
                el.selectedIndex = 0;
            }
            else {
                el.value = "";
            }

            // Trigger input event so undo system updates properly
            el.dispatchEvent(new Event("input", { bubbles: true }));
        });

        // Restore protected values (extra safety)
        document.getElementById('scouterInitial').value = scouterValue;
        document.getElementById('match-number').value = matchValue;

        // Clear QR code display
        qrContainer.innerHTML = '';
        document.getElementById("submission-history").innerHTML = '';

        // Commit this as one undoable action
        commitSnapshot();
    });

    const queueSnapshot = () => 
    {
        if (isRestoring) return;

        const current = captureFormState(form);

        // First change in this action
        if (!pendingSnapshot) {
            pendingSnapshot = lastSnapshot;
        }

        // Reset commit timer
        clearTimeout(commitTimer);
        commitTimer = setTimeout(commitSnapshot, COMMIT_DELAY);

        lastSnapshot = current;
    };

   

    form.addEventListener("input", queueSnapshot);


    function undo() 
    {
        if (undoStack.length === 0) return;

        const action = undoStack.pop();
        restoreFormState(action.from);
        redoStack.push(action);
        lastSnapshot = action.from;
    }

    function redo() 
    {
        if (redoStack.length === 0) return;

        const action = redoStack.pop();
        restoreFormState(action.to);
        undoStack.push(action);

        lastSnapshot = action.to;
    }

    const teamInput = document.getElementById("teamNumber");
    const fuelRateInput = document.getElementById("fuelRate");

    teamInput.addEventListener("change", () => {

    const team = teamInput.value.trim();

        if (fuelRateData[team] !== undefined) {

            isRestoring = true; // prevent undo recording

            fuelRateInput.value = fuelRateData[team];

            fuelRateInput.dispatchEvent(new Event("input", { bubbles: true }));

            isRestoring = false;
        }
    });

    
    [
        'autoFuel',
        'teleFuelAttempted',
        //'fuelPassed',
    ].forEach(setupCounter);
    
    document.querySelector("#submit-btn").onclick = function()
    {
        //e.preventDefault();
        document.getElementById("submission-history").innerHTML = '';
        // Prematch data
        const scouterIni = document.getElementById('scouterInitial').value;
        const match = document.getElementById('match-number').value;
        const robot = document.getElementById('robot-select').value;
        const teamNum = document.getElementById('teamNumber').value;
        const startingPos = document.getElementById('startingPosition').value;
        const noShow = document.getElementById('noShow-toggle').checked;

        // Autonomous data
        const moved = document.getElementById("moved-toggle").checked;
        const autoFuelAttempted = document.getElementById("autoFuel").value;
        const autoShotAccuracy = document.getElementById("autoShotAccuracy").value;
        const autoFuelPickup = document.getElementById("autoFuelPickup").value;
        const autoClimbed = document.getElementById("autoClimb-toggle").checked;

        // TELEOP data
        const teleFuelAttempted = document.getElementById("teleFuelAttempted").value;
        const teleShotAccuracy = document.getElementById("teleShotAccuracy").value;
        const defensiveSkill = document.getElementById("defensiveSkill").value;
        const teleFuelPickupLoc = document.getElementById("TELEOPFuelPickup").value;
        const fuelPassed = document.getElementById("fuelPassed").checked;
        const inactive = Array.from(
            document.querySelectorAll('input[name="inactive"]:checked')
        ).map(cb => cb.value);
        // Endgame Data
        const climb = document.getElementById("Climb").value;

        // Postmatch
        const card = document.getElementById("card").value;
        const disable = document.getElementById("disable").value;
        const comments = document.getElementById('comments').value;

        createSubmissionCard({
            initials: scouterIni,
            match: match,
            robot: robot,
            team: teamNum,
            position: startingPos,
            show: noShow,
            move: moved,
            autoFuel: autoFuelAttempted,
            autoAcc: autoShotAccuracy,
            autoPickup: autoFuelPickup,
            autoClimb: autoClimbed,
            teleFuel: teleFuelAttempted,
            teleAccuracy: teleShotAccuracy,
            inactiveActivity: inactive.join(","),
            telePickup: teleFuelPickupLoc,
            telePassed: fuelPassed,
            teleClimb: climb,
            card: card,
            disable: disable,
            comments: comments
        });

        const qrData = 
        [
            scouterIni,
            match,
            robot,
            teamNum,
            startingPos,
            noShow,
            moved,
            autoFuelAttempted,
            autoShotAccuracy,
            autoFuelPickup,
            autoClimbed,
            teleFuelAttempted,
            teleShotAccuracy,
            inactive.join(","),
            defensiveSkill,
            teleFuelPickupLoc,
            fuelPassed,
            climb,
            card,
            disable,
            comments
        ].join("\t");

        console.log(qrData);

        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: qrData,
            width: 256,   
            height: 256,
            correctLevel: QRCode.CorrectLevel.L
        });
    };
});

function setupCounter(id) {
    const input = document.getElementById(id);
    const overlay = document.getElementById("hold-overlay");

    const plusSlow = document.getElementById(`${id}-plusSlow`);
    const minusSlow = document.getElementById(`${id}-minusSlow`);
    const plusFast = document.getElementById(`${id}-plusFast`);
    const plusExtraFast = document.getElementById(`${id}-plusExtraFast`);
    const durationBtn = document.getElementById(`${id}-duration`);

    const colorSlow = "rgba(37, 99, 235, 0.18)";
    const colorFast = "rgba(195, 255, 0, 0.18)";
    const colorExtraFast = "rgba(255, 0, 0, 0.18)";

    let holdStartValue = null;
    let interval = null;
    let timeout = null;
    let durationInterval = null;

    const startDuration = () => {

        const fuelRateInput = document.getElementById("fuelRate");
        const rate = parseFloat(fuelRateInput.value) || 0;

        if (rate <= 0) return;

        const intervalTime = 1000 / rate;

        durationInterval = setInterval(() => {
            updateValue(1);
        }, intervalTime);

        overlay.classList.add("active");
        overlay.style.background = "rgba(255,165,0,0.25)";
    };

    const stopDuration = () => {

        clearInterval(durationInterval);
        durationInterval = null;

        overlay.classList.remove("active");

        if (pendingSnapshot) {
            commitSnapshot();
        }
    };
    const startHold = (delta,delay,color) => {
        // Apply once immediately
        if (holdStartValue === null) 
        {
            holdStartValue = parseInt(input.value) || 0;
        }

        updateValue(delta);

        // Visual feedback only for + / ++
        if (delta > 0) {
            overlay.classList.add("active");
            overlay.style.background = color;
        }

        // After short delay, start rapid repeat
        timeout = setTimeout(() => {
            interval = setInterval(() => {
                updateValue(delta);
            }, delay); // speed of repeating (ms)
        }, delay); // delay before repeat starts
    };

    const stopHold = () => {
        clearTimeout(timeout);
        clearInterval(interval);

        overlay.classList.remove("active");

        if (pendingSnapshot) {
            commitSnapshot();
        }

        holdStartValue = null;


    };

    const updateValue = (delta) => {
        if (isRestoring) return;

        const value = parseInt(input.value) || 0;
        input.value = Math.max(0, value + delta);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const bindHold = (button, delta, delay, color) => {
        button.addEventListener('mousedown', () => startHold(delta,delay,color));
        button.addEventListener('mouseup', stopHold);
        button.addEventListener('mouseleave', stopHold);

        // Mobile support
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startHold(delta,delay,color);
        });
        button.addEventListener('touchend', stopHold);
        button.addEventListener("touchcancel", stopHold);
    };

    if (durationBtn) {

        durationBtn.addEventListener("mousedown", startDuration);
        durationBtn.addEventListener("mouseup", stopDuration);
        durationBtn.addEventListener("mouseleave", stopDuration);

        durationBtn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            startDuration();
        });

        durationBtn.addEventListener("touchend", stopDuration);

    }

    bindHold(plusSlow, 1, 250, colorSlow);
    bindHold(minusSlow, -1, 250, colorSlow);
    bindHold(plusFast, 1, 125, colorFast);
    bindHold(plusExtraFast,1,75, colorExtraFast)
}

function createSubmissionCard(data) {
    const container = document.getElementById("submission-history");

    const card = document.createElement("div");
    card.classList.add("submission-card");

    card.innerHTML = `
        <strong>Initial ${data.initials} | Match ${data.match} | Team ${data.team}</strong><br>
        Robot: ${data.robot}<br>
        <hr>
        <strong>Auto</strong><br>
        Starting Position: <span style="color: red;">${data.position}</span><br>
        Not Show Up: <span style="color: red;">${data.show}</span><br>
        Move In Auto: <span style="color: red;">${data.move}</span><br>
        Auto Fuels Attempted: <span style="color: red;">${data.autoFuel}</span><br>
        Auto Fuels Accuracy: <span style="color: red;">${data.autoAcc}</span><br>
        Auto Fuels Pickup Location: <span style="color: red;">${data.autoPickup}</span><br>
        Climb In Auto: <span style="color: red;">${data.autoClimb}</span><br>
        <hr>
        <strong>TeleOP</strong><br>
        Tele Fuels Attempted: <span style="color: red;">${data.teleFuel}</span><br>
        Tele Fuels Accuracy: <span style="color: red;">${data.teleAccuracy}</span><br>
        Tele Fuels Pickup Location: <span style="color: red;">${data.telePickup}</span><br>
        Inactive Activities: <span style="color: red;">${data.inactiveActivity}</span><br>
        Tele Fuels Passed: <span style="color: red;">${data.telePassed}</span><br>
        <hr>
        <strong>Endgame</strong><br>
        Climb In Endgame: <span style="color: red;">${data.climb}</span><br>
        Receive Any Card: <span style="color: red;">${data.card}</span><br>
        Having Troubles: <span style="color: red;">${data.disable}</span><br>
        Comments: <span style="color: red;">${data.comments || "None"}</span><br>
    `;

    // Add newest on top
    container.prepend(card);
}
