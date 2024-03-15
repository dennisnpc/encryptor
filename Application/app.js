class File {
        name = null;
        contents = null;

        encryptor = new Encryptor();
        decryptor = new Decryptor();
        JSONHandler = new JSONHandler();

        // Reads and sets name and contents of File object from HTML file input element
        open(HTMLId) {
            return new Promise((resolve, reject) => {
                // Retrieve the element with the specified HTML id
                const fileInput = document.getElementById(HTMLId);
                // Access the first file selected in the input element as only one file allowed per File object
                const file = fileInput.files[0];

                // If no file selected
                if (!file) {
                    // Reject promise
                    reject(new Error('No file selected'));
                    return;
                }

                // Otherwise set name of File
                this.name = file.name;

                const reader = new FileReader();

                // When file successfully loaded
                reader.onload = (event) => {
                    // Set contents of File
                    this.contents = event.target.result;
                    // Resolve promise with the file contents
                    resolve(this.contents);
                };

                // If error reading file
                reader.onerror = (error) => {
                    // Log error and reject promise
                    console.error('Error reading file:', error);
                    reject(error);
                };

                reader.readAsText(file);
            });
        }

        // Encrypt File contents
        encryptFile() {
            // Use encryptor method to modify File contents
            this.contents = this.encryptor.encrypt(this.contents);
        }

        // Download encryption key as JSON
        downloadKey() {
            // Use JSONHandler method to create and download JSON file
            this.JSONHandler.downloadKey(fileToEncrypt.encryptor.key);
        }

        // Load key from JSON for decryption
        async loadKey() {
            try {
                // Read key using JSONHandler
                this.decryptor.key = await this.JSONHandler.readKey();
                console.log('Key loaded:', this.decryptor.key);
            }
            // If loading key fails
            catch (error) {
                console.error('Error loading key:', error);
            }
        }

        // Decrypt File contents
        decryptFile() {
            // Use decryptor method to modify File contents
            this.contents = this.decryptor.decrypt(this.contents);
        }

        // Download File
        downloadFile() {
            // Create a Blob containing the file content
            const blob = new Blob([this.contents], { type: 'text/plain' });

            // Create an anchor element
            const aTag = document.createElement('a');
            aTag.href = URL.createObjectURL(blob);

            // Set the file name
            let downloadName = this.name;
            // If original file was encrypted, the file being downloaded will be decrypted
            if (downloadName.endsWith('.enc')) {
                downloadName = downloadName.replace('.enc', '');
            }
            // Otherwise, the file being downloaded will be encrypted
            else {
                downloadName += '.enc';
            }

            aTag.download = downloadName;

            // Append the anchor element to the body
            document.body.appendChild(aTag);

            // Programmatically trigger a click event on the anchor element, causing the browser to download the file
            aTag.click();

            // Remove the anchor element from the body
            document.body.removeChild(aTag);
        }
}

class Encryptor {
        // Generate random number for the key
        key = this.randomNumber();

        // Encrypts data given as input and returns cyphertext
        encrypt(data) {
            // Initialise empty string to hold cyphertext
            let cyphertext = '';

            // Check 'data' is not null (i.e. a file was selected)
            if (data != null) {

                // 'plaintext' is assigned the value of 'data'
                const plaintext = data;

                // Loop over each character in 'plaintext'
                for (let i = 0; i < plaintext.length; i++) {
                    // Character shift is calculated using the position of the character in the plaintext and a number from the key
                    let shift = Number(this.key[(plaintext.length + i) % this.key.length]);
                    // Get the UTF-16 value of the current character in 'plaintext'
                    let currentCharCode = plaintext.charCodeAt(i);
                    // Shift the current character
                    currentCharCode = currentCharCode + shift;
                    // Add new character to the cyphertext
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

        // Generates long random number with each digit different from one before it
        randomNumber() {
            // Initiates empty string to build number
            let number = '';

            // Generate 32 to 127 digits for the number
            for (let i = 0; i < (Math.floor((Math.random() * 96) + 32)); i++) {
                let newDigit;
                do {
                    // Generate a new digit from 1 to 9
                    newDigit = (Math.floor((Math.random() * 9) + 1)).toString();
                  // if the new digit is the same as the previous digit in the number, it generates a new digit
                } while (i > 0 && newDigit === number[i - 1]);

                // Add the new digit to the number
                number += newDigit;
            }

            return number;
        }
}

class Decryptor {
        // Initialise empty string to hold key
        key = null;

        // Decrypts data given as input and returns plaintext
        decrypt(data) {
            // Initialise empty string to hold plaintext
            let plaintext = '';

            // Check 'data' is not null (i.e. a file was selected)
            if (data != null) {

                // 'cyphertext' is assigned the value of 'data'
                const cyphertext = data;

                // Loop over each character in 'cyphertext'
                for (let i = 0; i < cyphertext.length; i++) {
                    // Character shift is calculated using the position of the character in the cyphertext and a number from the key
                    let shift = Number(this.key[(cyphertext.length + i) % this.key.length]);
                    // Get the UTF-16 value of the current character in 'cyphertext'
                    let currentCharCode = cyphertext.charCodeAt(i);
                    // Shift the current character back
                    currentCharCode = currentCharCode - shift;
                    // Add new character to the plaintext
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
        // Tries to read key form JSON and returns a Promise
        async readKey() {
            try {
                // Creates new File object
                const json = new File();
                // Waits for contents of file selected using HTML input element with id 'decKey' to be read
                await json.open('decKey');

                // Parse file contents as JSON
                const parsedJson = JSON.parse(json.contents);

                // If the parsed JSON object has a property named 'key', log the key to the console and return it
                if (parsedJson && parsedJson.key) {
                    console.log('Key from JSON:', parsedJson.key);
                    return parsedJson.key;
                }
                    // If JSON object doesn't have a 'key' property, log error message
                else {
                    console.log('Invalid JSON format or key not found');
                }
            }
            // If there is an error while reading the file or parsing the JSON, log it
            catch (error) {
                console.error('Error reading file:', error);
            }
        }

        downloadKey(key) {
            // Check key is not null
            if (key != null) {
                // Create an object to hold File metadata as properties, including its key property along with its value
                let encFileMetadata = {
                    key: key
                };

                // Convert File metadata into a JSON string
                let jsonFile = JSON.stringify(encFileMetadata);

                // Create a Blob containing the JSON file content (i.e. the key)
                const blob = new Blob([jsonFile], { type: 'application/json' });

                // Create an anchor element
                const aTag = document.createElement('a');
                // Set the href of anchor element to a URL representing the Blob
                aTag.href = URL.createObjectURL(blob);

                // Set the file name
                let downloadName = 'key.json';
                aTag.download = downloadName;

                // Append the anchor element to the body
                document.body.appendChild(aTag);

                // Programmatically trigger a click event on the anchor element, causing the browser to download the file
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


// File selectors
{
    // By click
    {
        // Programmatically trigger a click event on the HTML file input element with id 'encFile' when button with id 'encFile' is clicked, to open the file picker dialog and select file to encrypt
        document.getElementById('encGetFile').onclick = function () {
            document.getElementById('encFile').click();
        };
        // Listen for file being selected
        document.getElementById('encFile').addEventListener('input', function () {
            // If file selected
            if (this.files.length > 0) {
                // Change text of HTML element to file name
                document.querySelector('#encGetFile span').innerText = this.files[0].name;
                // Highlight 'Process' button to attract attention to next step
                document.getElementById('encProcess2').classList.add('highlight');
            }
            // If no file selected
            else {
                // Set text of HTML element to default
                document.querySelector('#encGetFile span').innerText = 'Drop or select .txt';
                // Remove highlight on 'Process' button
                document.getElementById('encProcess2').classList.remove('highlight');
            }
        });

        // Programmatically trigger a click event on the HTML file input element with id 'decGetFile' when button with id 'decFile' is clicked, to open the file picker dialog and select file to decrypt
        document.getElementById('decGetFile').onclick = function () {
            document.getElementById('decFile').click();
        };
        // Listen for file being selected
        document.getElementById('decFile').addEventListener('input', function () {
            // If file selected
            if (this.files.length > 0) {
                // Change text of HTML element to file name
                document.querySelector('#decGetFile span').innerText = this.files[0].name;
                // If the key file was also selected
                if (document.getElementById('decKey').files.length) {
                    // Highlight 'Process' button to attract attention to next step
                    document.getElementById('decProcess2').classList.add('highlight');
                }
            }
            // If no file selected
            else {
                // Set text of HTML element to default
                document.querySelector('#decGetFile span').innerText = 'Drop or select .enc';
                // Remove highlight on 'Process' button
                document.getElementById('decProcess2').classList.remove('highlight');
            }
        });

        // Programmatically trigger a click event on the HTML file input element with id 'decGetKey' when button with id 'decKey' is clicked, to open the file picker dialog and select file containing key
        document.getElementById('decGetKey').onclick = function () {
            document.getElementById('decKey').click();
        };
        // Listen for file being selected
        document.getElementById('decKey').addEventListener('input', function () {
            if (this.files.length > 0) {
                // Change text of HTML element to file name
                document.querySelector('#decGetKey span').innerText = this.files[0].name;
                // If a file to decrypt was also selected
                if (document.getElementById('decFile').files.length) {
                    // Highlight 'Process' button to attract attention to next step
                    document.getElementById('decProcess2').classList.add('highlight');
                }
            }
            else {
                document.querySelector('#decGetKey span').innerText = 'Drop or select .json';
                document.getElementById('decProcess2').classList.remove('highlight');
            }
        });
    }


    // By drop
    {
        // For encryption
        {
            // Prevent opening file as link on drop
            document.getElementById('encGetFile').addEventListener('dragover', function (event) {
                event.preventDefault();
            });

            // When a file is dropped
            document.getElementById('encGetFile').addEventListener('drop', function (event) {
                event.preventDefault();

                // Check if any files were dropped
                if (event.dataTransfer.files.length > 0) {
                    document.getElementById('encFile').files = event.dataTransfer.files;
                    // Change the text of the HTML element to the name of the file
                    document.querySelector('#encGetFile span').innerText = document.getElementById('encFile').files[0].name;
                    // Highlight 'Process' button
                    document.getElementById('encProcess2').classList.add('highlight');

                    console.log('Selected file:', document.getElementById('encFile').files[0].name);
                }
            });
        }


        // For decryption
        {
            // Prevent opening file as link on drop
            document.getElementById('decGetFile').addEventListener('dragover', function (event) {
                event.preventDefault();
            });

            // When a file is dropped
            document.getElementById('decGetFile').addEventListener('drop', function (event) {
                event.preventDefault();

                if (event.dataTransfer.files.length > 0) {
                    // Change the text of the HTML element to the name of the file
                    document.getElementById('decFile').files = event.dataTransfer.files;
                    document.querySelector('#decGetFile span').innerText = document.getElementById('decFile').files[0].name;
                    // Highlight 'Process' button
                    document.getElementById('decProcess2').classList.add('highlight');

                    console.log('Selected file:', document.getElementById('decFile').files[0].name);
                }
            });


            // Prevent opening file as link on drop
            document.getElementById('decGetKey').addEventListener('dragover', function (event) {
                event.preventDefault();
            });

            // When a file is dropped
            document.getElementById('decGetKey').addEventListener('drop', function (event) {
                event.preventDefault();

                if (event.dataTransfer.files.length > 0) {
                    // Change the text of the HTML element to the name of the file
                    document.getElementById('decKey').files = event.dataTransfer.files;
                    // Highlight 'Process' button
                    document.querySelector('#decGetKey span').innerText = document.getElementById('decKey').files[0].name;

                    console.log('Selected file:', document.getElementById('decKey').files[0].name);
                }
            });
        }
    }
}


// Buttons
{
    // To encrypt
    {
        // Show encrypt
        document.getElementById('encSelect').addEventListener('click', function () {
            hideAll();
            selectorsShow();
            encScreen1Show();
            document.getElementById('encSelect').classList.add('highlight');
            document.getElementById('decSelect').classList.remove('highlight');
        });

        // Encrypt file
        document.getElementById('encProcess').addEventListener('click', async function () {
            processingShow();

            fileToEncrypt = new File();

            try {
                await fileToEncrypt.open('encFile')
                console.log(fileToEncrypt.contents);

                fileToEncrypt.encryptFile();

                console.log('File encrypted and downloaded successfully');
            } catch (error) {
                console.error('Error encrypting and downloading:', error);
            }

            // Once file has been encrypted

            // Discard the original file
            document.getElementById('encFile').value = '';
            // Reset text of selector button from file name to default
            document.querySelector('#encGetFile span').innerText = 'Drop or select .txt';
            // Remove highlight on 'Process' button
            document.getElementById('encProcess2').classList.remove('highlight');


            // Show page to save files generated
            hideAll();
            encScreen2Show();
            restartShow();
        });

        // Download encrypted file
        document.getElementById('encDownloadFile').addEventListener('click', function () {
            fileToEncrypt.downloadFile();
        });

        // Download key
        document.getElementById('encDownloadKey').addEventListener('click', function () {
            fileToEncrypt.downloadKey();
        });
    }


    // To decrypt
    {
        // Show decrypt
        document.getElementById('decSelect').addEventListener('click', function () {
            hideAll();
            selectorsShow();
            decScreen1Show();
            document.getElementById('decSelect').classList.add('highlight');
            document.getElementById('encSelect').classList.remove('highlight');
        });

        // Decrypt file
        document.getElementById('decProcess').addEventListener('click', async function () {
            processingShow();

            fileToDecrypt = new File();

            try {
                await fileToDecrypt.open('decFile');
                console.log(fileToDecrypt.contents);

                await fileToDecrypt.loadKey();
                fileToDecrypt.decryptFile();
            }
            catch (error) {
                console.error('Error decrypting and downloading:', error);
            }

            // Once file has been decrypted

            // Discard the original files
            document.getElementById('decFile').value = '';
            document.getElementById('decKey').value = '';
            // Reset text of selector buttos from file name to default
            document.querySelector('#decGetFile span').innerText = 'Drop or select .enc';
            document.querySelector('#decGetKey span').innerText = 'Drop or select .json';
            // Remove highlight on 'Process' button
            document.getElementById('decProcess2').classList.remove('highlight');


            // Show page to save file generated
            hideAll();
            decScreen2Show();
            restartShow();
        });

        // Download decrypted file
        document.getElementById('decDownloadFile').addEventListener('click', function () {
            fileToDecrypt.downloadFile();
        });
    }


    // Restart
    document.getElementById('restart').addEventListener('click', function () {
        delete fileToEncrypt;
        delete fileToDecrypt;
        start();
    });
}


// Show/hide elements
{
    // Selectors
    {
        // Hides the 'Encrypt' and 'Decrypt' buttons
        function selectorsHide() {
            document.getElementById('selectors').style.visibility = 'hidden';
        }
        // Makes the 'Encrypt' and 'Decrypt' buttons visible
        function selectorsShow() {
            document.getElementById('selectors').style.visibility = 'visible';
        }
    }
   
    // Screens
    {
        // Encryption
        {
            function encScreen1Hide() {
                document.getElementById('encScreen1').style.display = 'none';
                document.getElementById('encProcess').style.display = 'none';
            }
            function encScreen1Show() {
                document.getElementById('encScreen1').style.display = 'grid';
                document.getElementById('encProcess').style.display = 'grid';
            }

            function encScreen2Hide() {
                document.getElementById('encScreen2').style.display = 'none';
            }
            function encScreen2Show() {
                document.getElementById('encScreen2').style.display = 'grid';
            }
        }


        // Decryption
        {
            function decScreen1Hide() {
                document.getElementById('decScreen1').style.display = 'none';
                document.getElementById('decProcess').style.display = 'none';
            }
            function decScreen1Show() {
                document.getElementById('decScreen1').style.display = 'grid';
                document.getElementById('decProcess').style.display = 'grid';
            }

            function decScreen2Hide() {
                document.getElementById('decScreen2').style.display = 'none';
            }
            function decScreen2Show() {
                document.getElementById('decScreen2').style.display = 'block';
            }
        }
    }
 
    function processingHide() {
        document.getElementById('processing-screen').style.display = 'none';
    }
    function processingShow() {
        document.getElementById('encProcess').style.display = 'none';
        document.getElementById('decProcess').style.display = 'none';
        document.getElementById('processing-screen').style.display = 'grid';
    }

    function restartHide() {
        document.getElementById('restart').style.display = 'none';
    }
    function restartShow() {
        document.getElementById('restart').style.display = 'grid';
    }

    function hideAll() {
        selectorsHide();
        encScreen1Hide();
        encScreen2Hide();
        decScreen1Hide();
        decScreen2Hide();
        processingHide()
        restartHide();
    }

    // Hides everything and sets elements needed for first screen visible
    function start() {
        hideAll();
        selectorsShow();
        encScreen1Show();
        // Start application in the 'Encrypt' mode by default (shown by highlighting the 'Encrypt' button)
        document.getElementById('encSelect').classList.add('highlight');
        document.getElementById('decSelect').classList.remove('highlight');
    }
}


// Modals
{
    // Get reference to modal
    const modalHelp = document.querySelector('.modal-help');
    // Add other modal references here if needed

    // Get reference to overlay (can be reused for any modal)
    const overlay = document.querySelector('.overlay');

    // Reusable function that toggles modal visibility
    // Defult overlay used if none specified
    function toggleModal(modalElement, overlayElement = overlay) {
        modalElement.style.visibility = modalElement.style.visibility === 'visible' ? 'hidden' : 'visible';
        overlayElement.style.visibility = overlayElement.style.visibility === 'visible' ? 'hidden' : 'visible';
    }

    // Start with both modal and overlay hidden
    modalHelp.style.visibility = 'hidden';
    overlay.style.visibility = 'hidden';

    // Open the help modal when 'help' button is clicked
    document.getElementById('help').addEventListener('click', () => {
        toggleModal(modalHelp);
    });

    // Close the help modal when close button or overlay is clicked
    document.querySelector('.modal-help-close').addEventListener('click', () => {
        toggleModal(modalHelp);
    });
    overlay.addEventListener('click', () => {
        toggleModal(modalHelp);
    });
}


// Change language
{
    // Function
    {
        // List of IDs of HTML elements that contain text that needs to be translated
        const elementsToChange = [
            '#encSelect span',
            '#decSelect span',
            '#encGetFile span',
            '#encProcess span',
            '#decProcess span',
            '#encDownloadFile span',
            '#encDownloadKey span',
            '#decGetFile span',
            '#decGetKey span',
            '#decDownloadFile span',
            '#processing-screen span',
            '#restart span'
        ];

        // Holds list of key(english version)-pair(translation) values which are used to replace the text
        const translations = {
            'en-GB': {
                'Encrypt': 'Encrypt',
                'Decrypt': 'Decrypt',
                'Drop or select .txt': 'Drop or select .txt',
                'Process (to enc)': 'Process',
                'Process(to decrypt)': 'Process',
                'Download (encrypted) file': 'Download file',
                'Download key': 'Download key',
                'Drop or select .enc': 'Drop or select .enc',
                'Drop or select .json': 'Drop or select .json',
                'Download (decrypted) file': 'Download file',
                'Processing...': 'Processing...',
                'Restart': 'Restart',
                'Light': 'Light',
                'Dark': 'Dark',
                'Help': 'help',
                'Modal-Help-Title': "<h1>Help Page</h1>",
                'Modal-Help-Content': "<h1>How to Use the Application</h1> <ul> <li>Choose Mode: Select ‘Encrypt’ or ‘Decrypt’.</li> <li>Load Files: Choose the files you need to process.</li> <li>Process: Hit ‘Process’. Once processing is complete, save buttons will appear.</li> <li>Save Files: Click to save files to your device.</li> <li>Secure Key: Store the encryption key in a secure location.</li> <li>Reset: After encryption, press ‘Reset’ to clear sensitive data.</li> <li>Safety Reminder: Never leave your computer unattended after encryption without hitting ‘Reset’.</li> <li>Decryption: Use the key and the encrypted file together in ‘Decrypt’ mode to revert to the original file.</li> <li>Key Caution: Using a different key will result in decryption failure.</li> </ul><br /> <h1>Your Data Privacy</h1> Your files are processed locally on your device. No data is uploaded to servers, ensuring your information remains confidential in the security of your computer."
            },
            'zh-CN': {
                'Encrypt': '加密',
                'Decrypt': '解密',
                'Drop or select .txt': '拖放或选择 .txt',
                'Process (to enc)': '处理',
                'Process(to decrypt)': '处理',
                'Download (encrypted) file': '下载文件',
                'Download key': '下载密钥',
                'Drop or select .enc': '拖放或选择 .enc',
                'Drop or select .json': '拖放或选择 .json',
                'Download (decrypted) file': '下载文件',
                'Processing...': '处理中...',
                'Restart': '重新开始',
                'Light': '亮',
                'Dark': '暗',
                'Help': '帮助',
                'Modal-Help-Title': "<h1>帮助页面</h1>",
                'Modal-Help-Content': "<h1>如何使用该应用程序</h1> <ul> <li>选择模式：选择“加密”或“解密”。</li> <li>加载文件：选择需要处理的文件。</li> <li>处理：点击“处理”。处理完成后，保存按钮将出现。</li> <li>保存文件：点击以将文件保存到您的设备上。</li> <li>安全密钥：将加密密钥存储在安全位置。</li> <li>重置：加密后，点击“重置”以清除敏感数据。</li> <li>安全提醒：加密后，请务必点击“重置”，不要将计算机无人看管。</li> <li>解密：在“解密”模式下，使用密钥和加密文件一起还原为原始文件。</li> <li>密钥注意：使用不同的密钥会导致解密失败。</li> </ul><br /> <h1>您的数据隐私</h1> 您的文件在您的设备上本地处理。没有数据上传到服务器，确保您的信息在计算机的安全中保持机密。"
            },
            hi: {
                'Encrypt': 'एन्क्रिप्ट',
                'Decrypt': 'डिक्रिप्ट',
                'Drop or select .txt': '.txt फ़ाइल ड्रॉप करें या चयन करें',
                'Process (to enc)': 'प्रक्रिया',
                'Process(to decrypt)': 'प्रक्रिया',
                'Download (encrypted) file': 'फ़ाइल डाउनलोड करें',
                'Download key': 'कुंजी डाउनलोड करें',
                'Drop or select .enc': '.enc फ़ाइल ड्रॉप करें या चयन करें',
                'Drop or select .json': '.json फ़ाइल ड्रॉप करें या चयन करें',
                'Download (decrypted) file': 'फ़ाइल डाउनलोड करें',
                'Processing...': 'प्रस्सेसिंग...',
                'Restart': 'पुनः आरंभ करें',
                'Light': 'रौंगीला',
                'Dark': 'अंधेरा',
                'Help': 'सहायता',
                'Modal-Help-Title': "<h1>सहायता पृष्ठ</h1>",
                'Modal-Help-Content': "<h1>ऐप्लिकेशन का उपयोग कैसे करें</h1> <ul> <li>मोड चुनें: 'एन्क्रिप्ट' या 'डिक्रिप्ट' का चयन करें।</li> <li>फ़ाइलें लोड करें: प्रोसेस करने के लिए आपकी आवश्यकता है फ़ाइलों का चयन करें।</li> <li>प्रोसेस: 'प्रोसेस' पर क्लिक करें। प्रोसेसिंग पूरी होने के बाद, सेविंग बटन दिखाई देगा।</li> <li>फ़ाइलें सहेजें: अपने डिवाइस पर फ़ाइलें सहेजने के लिए क्लिक करें।</li> <li>सुरक्षित कुंजी: एन्क्रिप्शन कुंजी को एक सुरक्षित स्थान पर संग्रहित करें।</li> <li>रीसेट: एन्क्रिप्शन के बाद, संवेदनशील डेटा को हटाने के लिए 'रीसेट' दबाएं।</li> <li>सुरक्षा स्मारक: एन्क्रिप्शन के बाद अपने कंप्यूटर को असुरक्षित न छोड़ें बिना 'रीसेट' दबाएं।</li> <li>डिक्रिप्शन: मूल फ़ाइल पर वापस आने के लिए 'डिक्रिप्ट' मोड में कुंजी और एन्क्रिप्टेड फ़ाइल का साथ उपयोग करें।</li> <li>कुंजी सावधानी: अलग कुंजी का उपयोग करने से डिक्रिप्शन विफलता का परिणाम होगा।</li> </ul><br /> <h1>आपका डेटा गोपनीयता</h1> आपकी फ़ाइलें आपके डिवाइस पर स्थानीय रूप से प्रोसेस की जाती हैं। कोई डेटा सर्वर पर अपलोड नहीं किया जाता है, जिससे आपकी जानकारी आपके कंप्यूटर की सुरक्षा में गोपनीय रहती है।"
            },
            es: {
                'Encrypt': 'Encriptar',
                'Decrypt': 'Desencriptar',
                'Drop or select .txt': 'Arrastra o selecciona .txt',
                'Process (to enc)': 'Procesar',
                'Process(to decrypt)': 'Procesar',
                'Download (encrypted) file': 'Descargar archivo',
                'Download key': 'Descargar clave',
                'Drop or select .enc': 'Arrastra o selecciona .enc',
                'Drop or select .json': 'Arrastra o selecciona .json',
                'Download (decrypted) file': 'Descargar archivo',
                'Processing...': 'Procesando...',
                'Restart': 'Reiniciar',
                'Light': 'Claro',
                'Dark': 'Oscuro',
                'Help': 'ayuda',
                'Modal-Help-Title': "<h1>Página de Ayuda</h1>",
                'Modal-Help-Content': "<h1>Cómo Utilizar la Aplicación</h1> <ul> <li>Seleccionar Modo: Elija 'Encriptar' o 'Desencriptar'.</li> <li>Cargar Archivos: Seleccione los archivos que necesita procesar.</li> <li>Procesar: Presione 'Procesar'. Una vez completado el procesamiento, aparecerán los botones de guardado.</li> <li>Guardar Archivos: Haga clic para guardar los archivos en su dispositivo.</li> <li>Clave Segura: Guarde la clave de encriptación en un lugar seguro.</li> <li>Reiniciar: Después de la encriptación, presione 'Reiniciar' para borrar datos sensibles.</li> <li>Recordatorio de Seguridad: Nunca deje su computadora desatendida después de encriptar sin presionar 'Reiniciar'.</li> <li>Desencriptar: Utilice la clave y el archivo encriptado juntos en modo 'Desencriptar' para volver al archivo original.</li> <li>Precaución con la Clave: Usar una clave diferente resultará en un fallo de desencriptación.</li> </ul><br /> <h1>Su Privacidad de Datos</h1> Sus archivos son procesados localmente en su dispositivo. No se carga ningún dato en servidores, asegurando que su información permanezca confidencial en la seguridad de su computadora."
            },
            fr: {
                'Encrypt': 'Crypter',
                'Decrypt': 'Décrypter',
                'Drop or select .txt': 'Déposer ou sélectionner .txt',
                'Process (to enc)': 'Traiter',
                'Process(to decrypt)': 'Traiter',
                'Download (encrypted) file': 'Télécharger le fichier',
                'Download key': 'Télécharger la clé',
                'Drop or select .enc': 'Déposer ou sélectionner .enc',
                'Drop or select .json': 'Déposer ou sélectionner .json',
                'Download (decrypted) file': 'Télécharger le fichier',
                'Processing...': 'En cours de traitement...',
                'Restart': 'Redémarrage',
                'Light': 'Lumière',
                'Dark': 'Sombre',
                'Help': 'aide',
                'Modal-Help-Title': "<h1>Page d'Aide</h1>",
                'Modal-Help-Content': "<h1>Comment Utiliser l'Application</h1> <ul> <li>Choisir le Mode : Sélectionnez 'Crypter' ou 'Décrypter'.</li> <li>Charger les Fichiers : Choisissez les fichiers que vous devez traiter.</li> <li>Traiter : Appuyez sur 'Traiter'. Une fois le traitement terminé, les boutons de sauvegarde apparaîtront.</li> <li>Enregistrer les Fichiers : Cliquez pour enregistrer les fichiers sur votre appareil.</li> <li>Clé de Sécurité : Stockez la clé de chiffrement dans un endroit sûr.</li> <li>Réinitialiser : Après le chiffrement, appuyez sur 'Réinitialiser' pour effacer les données sensibles.</li> <li>Rappel de Sécurité : Ne laissez jamais votre ordinateur sans surveillance après le chiffrement sans appuyer sur 'Réinitialiser'.</li> <li>Décrypter : Utilisez la clé et le fichier chiffré ensemble en mode 'Décrypter' pour revenir au fichier d'origine.</li> <li>Attention à la Clé : Utiliser une clé différente entraînera un échec de déchiffrement.</li> </ul><br /> <h1>Votre Confidentialité des Données</h1> Vos fichiers sont traités localement sur votre appareil.Aucune donnée n'est téléchargée sur les serveurs, garantissant que vos informations restent confidentielles dans la sécurité de votre ordinateur."
            },
            ro: {
                'Encrypt': 'Criptează',
                'Decrypt': 'Decriptă',
                'Drop or select .txt': 'Trage sau selectează .txt',
                'Process (to enc)': 'Procesează',
                'Process(to decrypt)': 'Procesează',
                'Download (encrypted) file': 'Descarcă fișierul',
                'Download key': 'Descarcă cheia',
                'Drop or select .enc': 'Trage sau selectează .enc',
                'Drop or select .json': 'Trage sau selectează .json',
                'Download (decrypted) file': 'Descarcă fișierul',
                'Processing...': 'Se procesează...',
                'Restart': 'Resetează',
                'Light': 'Lumină',
                'Dark': 'Întuneric',
                'Help': 'Ajutor',
                'Modal-Help-Title': "<h1>Pagina de Ajutor</h1>",
                'Modal-Help-Content': '<h1>Cum să Utilizați Aplicația</h1> <ul> <li>Alegeți Modul: Selectați „Criptare” sau „Decriptare”.</li> <li>Încărcați Fișierele: Alegeți fișierele pe care trebuie să le procesați.</li> <li>Procesați: Apăsați „Procesați”. Odată ce procesul este complet, vor apărea butoanele de salvare.</li> <li>Salvați Fișierele: Faceți clic pentru a salva fișierele pe dispozitivul dvs.</li> <li>Cheia de Securitate: Stocați cheia de criptare într-o locație sigură.</li> <li>Resetare: După criptare, apăsați „Resetare” pentru a șterge datele sensibile.</li> <li>Pentru Siguranță: Nu lăsați niciodată computerul nesupravegheat după criptare fără a apăsa „Resetare”.</li> <li>Decriptare: Utilizați cheia și fișierul criptat împreună în modul „Decriptare” pentru a reveni la fișierul original.</li> <li>Atenție la Cheie: Utilizarea unei chei diferite va duce la eșecul decriptării.</li> </ul><br /> <h1>Confidențialitatea Datelor Dumneavoastră</h1> Fișierele dvs. sunt procesate local pe dispozitivul dvs. Nimic nu este încărcat pe servere, asigurând confidențialitatea informațiilor dvs. în securitatea computerului dvs.'
            }
        };

        // Function to change HTML element text
        // Takes in langage ID (eg 'en-GB' for english)
        function setLanguage(lang) {
            // Extracts list of key-pair values for that language into a new array to enable use of indexes for the translated words
            const translationsArray = Object.values(translations[lang]);
            // For each ID in the 'elementsToChange' array, we use its value to select the HTML element and also use its index in the array as a 'wordIndex' to correlate it to a translated word in the 'translationsArray'
            elementsToChange.forEach((elementID, wordIndex) => {
                try {
                    document.querySelector(elementID).innerText = translationsArray[wordIndex];
                }
                catch (error) { }
            });
            // Change HTML lang attribute to selected langauge for screen readers
            document.documentElement.lang = lang;

            // Select the theme selector
            var selectTheme = document.getElementById('theme');
            selectTheme.options[0].text = translationsArray[12];    // Change 'Light' with its translation
            selectTheme.options[1].text = translationsArray[13];    // Change 'Dark' with its translation

            // Change aria-label for 'help' button (for screen readers)
            document.getElementById('help').setAttribute("aria-label", translationsArray[14]);

            // Change Help modal
            document.querySelector('.modal-help-title').innerHTML = translationsArray[15];
            document.querySelector('.modal-help-content').innerHTML = translationsArray[16];
        }
    }

    // Change based on browser language
    {
        // Depending on the browser language, change application language
        switch (navigator.language) {
            case 'zh-CN':
                setLanguage('zh-CN');
                // Also change what langage the language selector displays
                document.getElementById('language').selectedIndex = 1;
                break;
            case 'hi':
                setLanguage('hi');
                document.getElementById('language').selectedIndex = 2;
                break;
            case 'es':
                setLanguage('es');
                document.getElementById('language').selectedIndex = 3;
                break;
            case 'fr':
                setLanguage('fr');
                document.getElementById('language').selectedIndex = 4;
                break;
            case 'ro':
                setLanguage('ro');
                document.getElementById('language').selectedIndex = 5;
                break;
            default:
        }
    }

    // Change using selector
    {
        document.getElementById('language').addEventListener('change', function () {
            // Set language to the one selected
            switch (language.value) {
                case 'en-GB':
                    setLanguage('en-GB');
                    break;
                case 'zh-CN':
                    setLanguage('zh-CN');
                    break;
                case 'hi':
                    setLanguage('hi');
                    break;
                case 'es':
                    setLanguage('es');
                    break;
                case 'fr':
                    setLanguage('fr');
                    break;
                case 'ro':
                    setLanguage('ro');
                    break;
                default:
            }
        });
    }
}


// Change theme
{
    // Function
    {
        // Object containing keys for different themes with pairs that contain key of HTML/CSS element name, with pairs of new values
        const changeTo = {
            light: {
                // CSS
                '--main-color':         '#102C57',
                '--main-background':    '#F8F0E5',
                '--box-shadow':         '#3C3B47',
                '--highlight':          '#F6FAD9',
                '--highlight-on-hover': '#FBFFC4',
                '.select-language':     'url(icons/light/language.png)'  ,
                '.select-theme':        'url(icons/light/theme.png)'   ,

                // HTML
                'encSelect':            'icons/light/lock_locked.png',
                'decSelect':            'icons/light/lock_unlocked.png',
                'encGetFile':           'icons/light/file_dec.png',
                'encDownloadFile':      'icons/light/file_enc.png',
                'encDownloadKey':       'icons/light/key.png',
                'decGetFile':           'icons/light/file_enc.png',
                'decGetKey':            'icons/light/key.png',
                'decDownloadFile':      'icons/light/file_dec.png',
                'help':                 'icons/light/help.png'
            },

            dark: {
                // CSS
                '--main-color':         '#E0E2DB',
                '--main-background':    '#022B3A',
                '--box-shadow':         '#B9BDAD',
                '--highlight':          '#023345',
                '--highlight-on-hover': '#35485F',
                '.select-language':     'url(icons/dark/language.png)'  ,
                '.select-theme':        'url(icons/dark/theme.png)'   ,

                // HTML
                'encSelect':            'icons/dark/lock_locked.png',
                'decSelect':            'icons/dark/lock_unlocked.png',
                'encGetFile':           'icons/dark/file_dec.png',
                'encDownloadFile':      'icons/dark/file_enc.png',
                'encDownloadKey':       'icons/dark/key.png',
                'decGetFile':           'icons/dark/file_enc.png',
                'decGetKey':            'icons/dark/key.png',
                'decDownloadFile':      'icons/dark/file_dec.png',
                'help':                 'icons/dark/help.png'
            }
        }

        function setTheme(theme) {
            // Extract key-pair values of HTML/CSS element and its value from the object into an array
            const elementAndValue = Object.entries(changeTo[theme]);

            // Use a for loop for each different method needed to select HTML/CSS elements
            for (i = 0; i < 5; i++) {
                try {
                    document.documentElement.style.setProperty(elementAndValue[i][0], elementAndValue[i][1]);
                }
                catch (error) { }
            }

            for (i = 5; i < 7; i++) {
                try {
                    document.querySelector(elementAndValue[i][0]).style.backgroundImage = elementAndValue[i][1];
                }
                catch (error) { }
            }

            for (i = 7; i < 16; i++) {
                try {
                    document.getElementById(elementAndValue[i][0]).querySelector("img").src = elementAndValue[i][1];
                }
                catch (error) { }
            }
        }
    }

    // Change using selector
    {
        // Listen for a change in theme selector
        document.getElementById('theme').addEventListener('change', function () {
            // Set theme to the one selected
            setTheme(theme.value);
        });
    }
}


start();