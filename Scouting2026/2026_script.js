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


    
    const scouterIni = document.getElementById('scouterInitial').value;
    const match = document.getElementById('match-number').value;
    const robot = document.getElementById('robot-select').value;
    const teamNum = document.getElementById('teamNumber').value;
    const startingPos = document.getElementById('startingPosition').value;
});