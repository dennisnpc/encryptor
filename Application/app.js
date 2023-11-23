// Start once everything has loaded
window.addEventListener("load", function (e) {
    // Start once 'Encrypt' button is pressed
    const fileSubmit = document.getElementById('submitEncFile');
    fileSubmit.addEventListener('click', function (e) {
        // Get input file
        const fileInput = document.getElementById('fileInput');
        // Check if a file was selected
        if (fileInput.files[0]) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            let modifiedContents = '';
            let key = '1234567';

            // Read the file
            reader.onload = function (event) {
                const contents = event.target.result;

                // Encryption algorithm
                for (let i = 0; i < contents.length; i++) {
                    let shift = Number(key[(contents.length + i) % key.length]);
                    let currentCharCode = contents.charCodeAt(i);
                    currentCharCode = currentCharCode + shift;
                    modifiedContents += String.fromCharCode(currentCharCode);
                }

                // Output results
                console.log('Original:', contents);
                console.log('Encrypted:', modifiedContents);
                console.log('Key:', key);
            };

            // Read file as text
            reader.readAsText(file);
        }
        // If no file selected
        else {
            console.log('No file selected');
        }
    });
});