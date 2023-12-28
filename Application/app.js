class File {
    name = null;
    contents = null;

    open(input) {
        return new Promise((resolve, reject) => {
            const fileInput = document.getElementById(input);
            const file = fileInput.files[0];

            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            this.name = file.name;

            const reader = new FileReader();

            reader.onload = (event) => {
                this.contents = event.target.result;
                resolve(this.contents);
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                reject(error);
            };

            reader.readAsText(file);
        });
    }

    download() {
        // Create a Blob containing the file content
        const blob = new Blob([this.contents], { type: 'text/plain' });

        // Create a link element
        const aTag = document.createElement('a');
        aTag.href = URL.createObjectURL(blob);

        // Set the file name
        let downloadName = this.name;
        if (downloadName.includes('.enc')) {
            downloadName = downloadName.replace('.enc', '');
        }
        else {
            downloadName += '.enc';
        }

        aTag.download = downloadName;

        // Append the anchor element to the body
        document.body.appendChild(aTag);

        // Programmatically trigger a click event on the anchor element
        aTag.click();

        // Remove the anchor element from the body
        document.body.removeChild(aTag);
    }
}

class Encryptor {
    key = this.randomNumber();

    encrypt(fileObject) {
        let cyphertext = '';

        // Check if a file was selected
        if (fileObject.contents != null) {

            const plaintext = fileObject.contents;

            // Encryption algorithm
            for (let i = 0; i < plaintext.length; i++) {
                let shift = Number(this.key[(plaintext.length + i) % this.key.length]);
                let currentCharCode = plaintext.charCodeAt(i);
                currentCharCode = currentCharCode + shift;
                cyphertext += String.fromCharCode(currentCharCode);
            }

            fileObject.contents = cyphertext;

            // Output results to console
            console.log('Encrypted:', fileObject.contents);
            console.log('Key:', this.key);
        }

        // If no file selected
        else {
            console.log('No file selected');
        }
    }

    randomNumber() {
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
}

class Decryptor {
    key = null;

    decrypt(fileObject) {
        let plaintext = '';

        // Check if a file was selected
        if (fileObject.contents != null) {

            const cyphertext = fileObject.contents;

            // Decryption algorithm
            for (let i = 0; i < cyphertext.length; i++) {
                let shift = Number(this.key[(cyphertext.length + i) % this.key.length]);
                let currentCharCode = cyphertext.charCodeAt(i);
                currentCharCode = currentCharCode - shift;
                plaintext += String.fromCharCode(currentCharCode);
            }

            fileObject.contents = plaintext;

            // Output results to console
            console.log('Decrypted:', fileObject.contents);
            console.log('Key:', this.key);
        }

        // If no file selected
        else {
            console.log('No file selected');
        }
    }    
}

class JsonHandler {
    async open(encryptorObject) {
        try {
            const json = new File();
            await json.open('encFileKeyInput');

            const parsedJson = JSON.parse(json.contents);

            if (parsedJson && parsedJson.key) {
                console.log('Key from JSON:', parsedJson.key);
                encryptorObject.key = parsedJson.key;
            } else {
                console.log('Invalid JSON format or key not found');
            }
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }

    download(key) {
        if (key != null) {
            let encFileMetadata = {
                key: key
            };

            let jsonFile = JSON.stringify(encFileMetadata);

            // Create a Blob containing the file content
            const blob = new Blob([jsonFile], { type: 'application/json' });

            // Create a link element
            const aTag = document.createElement('a');
            aTag.href = URL.createObjectURL(blob);

            // Set the file name
            let downloadName = 'key.json';

            aTag.download = downloadName;

            // Append the anchor element to the body
            document.body.appendChild(aTag);

            // Programmatically trigger a click event on the anchor element
            aTag.click();

            // Remove the anchor element from the body
            document.body.removeChild(aTag);
        }

        // If no file has been encrypted
        else {
            console.log('No key has been generated');
        }
    }
}


// 'Encrypt' button
const encryptButton = document.getElementById('getEncFile');
encryptButton.addEventListener('click', async function () {
    const myFile = new File();

    try {
        await myFile.open('fileInput')
        console.log(myFile.contents);

        encryptor = new Encryptor();
        encryptor.encrypt(myFile);

        myFile.download();

        console.log('File encrypted and downloaded successfully');
    } catch (error) {
        console.error('Error encrypting and downloading:', error);
    }
});

// 'Key' button
const getKeyButton = document.getElementById('getEncFileKey');
getKeyButton.addEventListener('click', function () {
    keyJson = new JsonHandler();
    keyJson.download(encryptor.key);
});

// 'Decrypt' button
const decryptButton = document.getElementById('getDecFile');
decryptButton.addEventListener('click', async function () {
    const myFile = new File();

    try {
        await myFile.open('encFileInput');
        console.log(myFile.contents);

        decryptor = new Decryptor();
        jsonHandler = new JsonHandler();
        await jsonHandler.open(decryptor);
        decryptor.decrypt(myFile);

        myFile.download();
    }
    catch (error) {
        console.error('Error decrypting and downloading:', error);
    }
});