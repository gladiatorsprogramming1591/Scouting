const undoStack = [];
const redoStack = [];

let isRestoring = false; // prevents undo/redo from re-recording
let pendingSnapshot = null;
let commitTimer = null;
const COMMIT_DELAY = 400; // typing pause threshold (ms)

function captureFormState(form) {
    const data = {};

    form.querySelectorAll("input, select, textarea").forEach(el => {
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


document.addEventListener("DOMContentLoaded", function ()
{
    const undoBtn = document.getElementById("undo-btn");
    const redoBtn = document.getElementById("redo-btn");

    undoBtn.addEventListener("click", undo);
    redoBtn.addEventListener("click", redo);

    const form = document.getElementById('data-form');
    const qrContainer = document.getElementById('qrcode');

    let lastSnapshot = captureFormState(form);

    // Reset button logic with confirmation
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => 
    {
        if (confirm("Are you sure you want to reset? All data will be cleared.")) 
        {
            form.reset(); // clears all text, numbers, selects, and checkboxes

            // Reset counters (since they're readonly number inputs with +/-)
            document.querySelectorAll('input[type="number"]').forEach(input => 
                {
                    input.value = 0;
                });
        }
        // Clear QR code display
        qrContainer.innerHTML = '';
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

    function commitSnapshot() 
    {
        if (!pendingSnapshot) return;

        undoStack.push({
            from: pendingSnapshot,
            to: lastSnapshot
        });
        pendingSnapshot = null;
    }

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



    
    [
        'autoFuel',
        'teleFuelAttempted',
        'fuelPassed',
    ].forEach(setupCounter);
    
    form.addEventListener('submit', function (e) 
    {
        e.preventDefault();
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
        const fuelPassed = document.getElementById("fuelPassed").value;
        // Endgame Data
        const climb = document.getElementById("Climb").value;

        // Postmatch
        const card = document.getElementById("card").value;
        const disable = document.getElementById("disable").value;
        const comments = document.getElementById('comments').value;

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
    });
    
    
});

function setupCounter(id) {
    const input = document.getElementById(id);
    const overlay = document.getElementById("hold-overlay");

    const plusSlow = document.getElementById(`${id}-plusSlow`);
    const minusSlow = document.getElementById(`${id}-minusSlow`);
    const plusFast = document.getElementById(`${id}-plusFast`);
    const plusExtraFast = document.getElementById(`${id}-plusExtraFast`);

    const colorSlow = "rgba(37, 99, 235, 0.18)";
    const colorFast = "rgba(195, 255, 0, 0.18)";
    const colorExtraFast = "rgba(255, 0, 0, 0.18)";

    let holdStartValue = null;
    let interval = null;
    let timeout = null;

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

    bindHold(plusSlow, 1, 250, colorSlow);
    bindHold(minusSlow, -1, 250, colorSlow);
    bindHold(plusFast, 1, 125, colorFast);
    bindHold(plusExtraFast,1,75, colorExtraFast)
}
