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
        'fuelScore'
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
        const autoFuelScore = document.getElementById("autoFuel").value;
        const autoFuelPickup = document.getElementById("autoFuelPickup").value;
        const autoClimbed = document.getElementById("autoClimb-toggle").checked;

        // TELEOP data
        const fuelScore = document.getElementById("fuelScore").value;
        const defensiveSkill = document.getElementById("defensiveSkill").value;
        const TELEOPFuelPickupLoc = document.getElementById("TELEOPFuelPickup").value;

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
            autoFuelScore,
            autoFuelPickup,
            autoClimbed,
            fuelScore,
            defensiveSkill,
            TELEOPFuelPickupLoc,
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
    const plus = document.getElementById(`${id}-plus`);
    const minus = document.getElementById(`${id}-minus`);
    const plusFive = document.getElementById(`${id}-plusFive`);
    const minusFive = document.getElementById(`${id}-minusFive`);

    plus.addEventListener('click', () => {
        input.value = parseInt(input.value) + 1;
    });

    plusFive.addEventListener('click', () => {
        input.value = parseInt(input.value) + 5;
    });

    minus.addEventListener('click', () => {
        if (parseInt(input.value) > 0) {
            input.value = parseInt(input.value) - 1;
        }
    });

    minusFive.addEventListener('click', () => {
        if (parseInt(input.value) > 4)
        {
            input.value = parseInt(input.value) - 5;
        }
    });
}