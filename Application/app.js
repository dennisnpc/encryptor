// Start once HTML elements have loaded
document.addEventListener('DOMContentLoaded', function () {

    // 'Download' button reference
    const encryptButton = document.getElementById('encFile');
    // When the button is pressed
    encryptButton.addEventListener('click', encrypt);
});

function encrypt() {

    // Get input file
    const fileInput = document.getElementById('fileInput');
    // Check if a file was selected
    if (fileInput.files[0] && fileInput.files[0].type === 'text/plain') {

        const file = fileInput.files[0];
        const reader = new FileReader();
        let modifiedContents = '';
        let key = randomNumber();

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

            // Output results to console
            console.log('Original:', contents);
            console.log('Encrypted:', modifiedContents);
            console.log('Key:', key);

            // Download encrypted file
            downloadFile(modifiedContents, file.name, '.enc');
        };

        // Read file as text
        reader.readAsText(file);
    }
    // If no file selected
    else if (!(fileInput.files[0])) {
        console.log('No file selected');
    }
    // If incorrect file type selected
    else if (!(fileInput.files[0].type === 'text/plain')) {
        console.log('Incorrect file type');
    }
}

function downloadFile(encryptedFile, originalName, extension) {

    // Create a Blob containing the file content
    const blob = new Blob([encryptedFile], { type: 'text/plain' });

    // Create a link element
    const aTag = document.createElement('a');
    aTag.href = URL.createObjectURL(blob);

    // Set the file name
    let downloadName = originalName.toString();
    downloadName += extension;
    aTag.download = downloadName;

    // Append the anchor element to the body
    document.body.appendChild(aTag);

    // Programmatically trigger a click event on the anchor element
    aTag.click();

    // Remove the anchor element from the body
    document.body.removeChild(aTag);
}

function randomNumber() {

    let number = '';

    for (let i = 0; i < (Math.floor((Math.random() * 96) + 32)); i++) {
        let newDigit;
        do {
            newDigit = (Math.floor((Math.random() * 9) + 1)).toString();
        } while (i > 0 && newDigit === number[i - 1]);

        number += newDigit;
    }

    return number;
}