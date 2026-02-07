document.addEventListener("DOMContentLoaded", function ()
{
    const form = document.getElementById('data-form');
    const qrContainer = document.getElementById('qrcode');

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
    const minusFast = document.getElementById(`${id}-minusFast`);

    const colorFast = "rgba(255, 0, 0, 0.18)";
    const colorSlow = "rgba(37, 99, 235, 0.18)"
    let interval = null;
    let timeout = null;

    const startHold = (delta,delay,color) => {
        // Apply once immediately
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
        timeout = null;
        interval = null;

        // Remove screen feedback
        overlay.classList.remove("active");
    };

    const updateValue = (delta) => {
        const value = parseInt(input.value) || 0;
        const newValue = Math.max(0, value + delta);
        input.value = newValue;
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
    bindHold(minusFast, -1, 125, colorFast);
}
