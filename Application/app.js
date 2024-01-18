class File {
    name = null;
    contents = null;

    encryptor = new Encryptor();
    decryptor = new Decryptor();
    JSONHandler = new JSONHandler();

    open(HTMLId) {
        return new Promise((resolve, reject) => {
            const fileInput = document.getElementById(HTMLId);
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

    encryptFile() {
        this.contents = this.encryptor.encrypt(this.contents);
    }

    downloadKey() {
        this.JSONHandler.downloadKey(fileToEncrypt.encryptor.key);
    }

    async loadKey() {
        try {
            this.decryptor.key = await this.JSONHandler.readKey();
            console.log('Key loaded:', this.decryptor.key);
        } catch (error) {
            console.error('Error loading key:', error);
        }
    }

    decryptFile() {
        this.contents = this.decryptor.decrypt(this.contents);
    }

    downloadFile() {
        // Create a Blob containing the file content
        const blob = new Blob([this.contents], { type: 'text/plain' });

        // Create a link element
        const aTag = document.createElement('a');
        aTag.href = URL.createObjectURL(blob);

        // Set the file name
        let downloadName = this.name;
        if (downloadName.endsWith('.enc')) {
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

    encrypt(data) {
        let cyphertext = '';

        // Check if a file was selected
        if (data != null) {

            const plaintext = data;

            // Encryption algorithm
            for (let i = 0; i < plaintext.length; i++) {
                let shift = Number(this.key[(plaintext.length + i) % this.key.length]);
                let currentCharCode = plaintext.charCodeAt(i);
                currentCharCode = currentCharCode + shift;
                cyphertext += String.fromCharCode(currentCharCode);
            }

            // Output results to console
            console.log('Encrypted:', cyphertext);
            console.log('Key:', this.key);

            return cyphertext;
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

    decrypt(data) {
        let plaintext = '';

        // Check if a file was selected
        if (data != null) {

            const cyphertext = data;

            // Decryption algorithm
            for (let i = 0; i < cyphertext.length; i++) {
                let shift = Number(this.key[(cyphertext.length + i) % this.key.length]);
                let currentCharCode = cyphertext.charCodeAt(i);
                currentCharCode = currentCharCode - shift;
                plaintext += String.fromCharCode(currentCharCode);
            }

            // Output results to console
            console.log('Decrypted:', plaintext);
            console.log('Key:', this.key);

            return plaintext;
        }

        // If no file selected
        else {
            console.log('No file selected');
        }
    }    
}

class JSONHandler {
    async readKey() {
        try {
            const json = new File();
            await json.open('encFileKeyInput');

            const parsedJson = JSON.parse(json.contents);

            if (parsedJson && parsedJson.key) {
                console.log('Key from JSON:', parsedJson.key);
                return parsedJson.key;
            } else {
                console.log('Invalid JSON format or key not found');
            }
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }

    downloadKey(key) {
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
    fileToEncrypt = new File();

    try {
        await fileToEncrypt.open('fileInput')
        console.log(fileToEncrypt.contents);

        fileToEncrypt.encryptFile();

        fileToEncrypt.downloadFile();

        console.log('File encrypted and downloaded successfully');
    } catch (error) {
        console.error('Error encrypting and downloading:', error);
    }
});

// 'Key' button
const getKeyButton = document.getElementById('getEncFileKey');
getKeyButton.addEventListener('click', function () {
    fileToEncrypt.downloadKey();
});

// 'Decrypt' button
const decryptButton = document.getElementById('getDecFile');
decryptButton.addEventListener('click', async function () {
    const fileToDecrypt = new File();

    try {
        await fileToDecrypt.open('encFileInput');
        console.log(fileToDecrypt.contents);

        await fileToDecrypt.loadKey();
        fileToDecrypt.decryptFile();

        fileToDecrypt.downloadFile();
    }
    catch (error) {
        console.error('Error decrypting and downloading:', error);
    }
});