// Start once HTML elements have loaded
document.addEventListener('DOMContentLoaded', function () {

    // 'Encrypt' button reference
    const encryptButton = document.getElementById('getEncFile');

    // 'Key' button reference
    const getKeyButton = document.getElementById('getEncFileKey');

    // 'Decrypt' button reference
    const decryptButton = document.getElementById('getDecFile');

    // When the button is pressed
    encryptButton.addEventListener('click', encrypt);

    decryptButton.addEventListener('click', decrypt);

    getKeyButton.addEventListener('click', downloadKey);
});

let keyEnc;
function encrypt() {

    // Get input file
    const fileInput = document.getElementById('fileInput');
    // Check if a file was selected
    if (fileInput.files[0] && fileInput.files[0].type === 'text/plain') {

        const file = fileInput.files[0];
        const reader = new FileReader();
        let modifiedContents = '';
        keyEnc = randomNumber();

        // Read the file
        reader.onload = function (event) {
            const contents = event.target.result;

            // Encryption algorithm
            for (let i = 0; i < contents.length; i++) {
                let shift = Number(keyEnc[(contents.length + i) % keyEnc.length]);
                let currentCharCode = contents.charCodeAt(i);
                currentCharCode = currentCharCode + shift;
                modifiedContents += String.fromCharCode(currentCharCode);
            }

            // Output results to console
            console.log('Original:', contents);
            console.log('Encrypted:', modifiedContents);
            console.log('Key:', keyEnc);

            // Download encrypted file
            downloadFile(modifiedContents, file.name, '.enc', 'text/plain');
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

function downloadKey() {

    if (keyEnc != null) {
        let encFileMetadata = {
            key: keyEnc
        };

        let jsonFile = JSON.stringify(encFileMetadata);
        downloadFile(jsonFile, 'key', '.json', 'application/json')
    }

    // If no file has been encrypted
    else {
        console.log('No has been generated');
    }
}

function decrypt() {

    // Get encrypted file input
    const fileInput = document.getElementById('encFileInput');

    // Check if a file was selected
    if (fileInput.files[0]) {

        const encFile = fileInput.files[0];
        const keyInput = document.getElementById('encFileKeyInput');

        // Get key input
        if (keyInput.files[0] && keyInput.files[0].type === 'application/json') {
            const keyFile = keyInput.files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                const jsonContent = event.target.result;
                const parsedJson = JSON.parse(jsonContent);

                if (parsedJson && parsedJson.key) {
                    console.log('Key from JSON:', parsedJson.key);

                    const reader = new FileReader();
                    let modifiedContents = '';
                    let keyDec = parsedJson.key;

                    // Read the key
                    reader.onload = function (event) {
                        const contents = event.target.result;

                        // Decryption algorithm
                        for (let i = 0; i < contents.length; i++) {
                            let shift = Number(keyDec[(contents.length + i) % keyDec.length]);
                            let currentCharCode = contents.charCodeAt(i);
                            currentCharCode = currentCharCode - shift;
                            modifiedContents += String.fromCharCode(currentCharCode);
                        }

                        // Output decrypted file
                        downloadFile(modifiedContents, encFile.name, '');
                    };

                    reader.readAsText(encFile);
                }
                else {
                    console.log('Invalid JSON format or key not found');
                }
            };

            reader.readAsText(keyFile);
        }

        // If no file selected
        else if (!(keyInput.files[0])) {
            console.log('No key selected');
        }
        // If incorrect file type selected
        else if (!(keyInput.files[0].type === 'application/json')) {
            console.log('Incorrect key file type');
        }
    }

    // If no file selected
    else {
        console.log('No file selected');
    }
}

function downloadFile(file, originalName, extension, type) {

    // Create a Blob containing the file content
    const blob = new Blob([file], { type: type });

    // Create a link element
    const aTag = document.createElement('a');
    aTag.href = URL.createObjectURL(blob);

    // Set the file name
    let downloadName = originalName.toString();
    if (downloadName.includes('.enc')) {
        downloadName = downloadName.replace('.enc', '');
    }
    else {
        downloadName += extension;
    }
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