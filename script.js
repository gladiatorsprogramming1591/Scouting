document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById('data-form');
    const qrContainer = document.getElementById('qrcode');

    // Auto section for adding
    const autoCoralL1Input = document.getElementById('autoCoralL1');
    const autoCoralL2Input = document.getElementById('autoCoralL2');
    const autoCoralL3Input = document.getElementById('autoCoralL3');
    const autoCoralL4Input = document.getElementById('autoCoralL4');
    const autoCoralMissedInput = document.getElementById('autoCoralMissed');
    const autoBargeInput = document.getElementById('autoBarge');
    const autoProcessorInput = document.getElementById('autoProcessor');
    const autoFoulInput = document.getElementById('autoFoul');

    // Teleop section for adding
    const teleCoralL1Input = document.getElementById('teleCoralL1');
    const teleCoralL2Input = document.getElementById('teleCoralL2');
    const teleCoralL3Input = document.getElementById('teleCoralL3');
    const teleCoralL4Input = document.getElementById('teleCoralL4');
    const teleCoralMissed = document.getElementById('teleCoralMissed');
    const teleBarge = document.getElementById('teleBarge');
    const teleProcesor = document.getElementById('teleProcessor');
    const touchedCage = document.getElementById('touchedCage');

    // Set up +/- buttons for catogories
    [
        'autoCoralL1',
        'autoCoralL2',
        'autoCoralL3',
        'autoCoralL4',
        'autoCoralMissed',
        'autoBarge',
        'autoProcessor',
        'autoFoul',
        'teleCoralL1',
        'teleCoralL2',
        'teleCoralL3',
        'teleCoralL4',
        'teleCoralMissed',
        'teleBarge',
        'teleProcessor',
        'touchedCage',
    ].forEach(setupCounter);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // get number/string data
        const scouterIni = document.getElementById('scouterInitial').value;
        const match = document.getElementById('match-number').value;
        const robot = document.getElementById('robot-select').value;
        const teamNum = document.getElementById('teamNumber').value;
        const startingPos = document.getElementById('startingPosition').value;
        const coralPickupLocation = document.getElementById('coralPickup-Location').value;
        const algeaPickupLocation = document.getElementById('algeaPickup-Location').value;
        const endPos = document.getElementById('endPosition').value;
        const defenseSkill = document.getElementById('defensiveSkill').value;
        const card = document.getElementById('card').value;
        const disable = document.getElementById('disable').value;
        const comments = document.getElementById('comments').value;
        const tags = document.getElementById('tags').value;

        // get bool data
        const noShow = document.getElementById('noShow-toggle').checked;
        const moved = document.getElementById('moved-toggle').checked;
        const autoAlgeaDislodged = document.getElementById('autoDislodgedAlgea-toggle').checked;
        const teleAlgeaDislodged = document.getElementById('autoDislodgedAlgea-toggle').checked;
        const defensed = document.getElementById('crossfield/defense-toggle').checked;
        const defensedAgainst = document.getElementById('defensedAgainst-toggle').checked;
        const qrData = [
            scouterIni,
            match,
            robot,
            teamNum,
            startingPos,
            noShow,
            moved,
            autoCoralL1Input.value,
            autoCoralL2Input.value,
            autoCoralL3Input.value,
            autoCoralL4Input.value,
            autoCoralMissedInput.value,
            autoBargeInput.value,
            autoProcessorInput.value,
            autoAlgeaDislodged,
            autoFoulInput.value,
            teleAlgeaDislodged,
            coralPickupLocation,
            algeaPickupLocation,
            teleCoralL1Input.value,
            teleCoralL2Input.value,
            teleCoralL3Input.value,
            teleCoralL4Input.value,
            teleCoralMissed.value,
            teleBarge.value,
            teleProcesor.value,
            defensed,
            touchedCage.value,
            endPos,
            defensedAgainst,
            defenseSkill,
            card,
            disable,
            comments,
            tags
        ].join("\t");

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

    plus.addEventListener('click', () => {
        input.value = parseInt(input.value) + 1;
    });

    minus.addEventListener('click', () => {
        if (parseInt(input.value) > 0) {
            input.value = parseInt(input.value) - 1;
        }
    });
}