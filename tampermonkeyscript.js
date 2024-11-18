// ==UserScript==
// @name         saipa with Submit Logic
// @namespace    http://tampermonkey.net/
// @version      2024-11-17
// @description  Fetch captcha, get token, and submit login data dynamically
// @author       You
// @match        *://saipa.iranecar.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    const homeItemsApiUrl = 'https://saipa-func.iranecar.com/api/GetHomeItems';

    // Function to create the bottom container
    function createBottomContainer() {
        const containerDiv = document.createElement('div');
        Object.assign(containerDiv.style, {
            position: 'fixed',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '80px',
            backgroundColor: '#333',
            padding: '10px',
            textAlign: 'center',
            zIndex: '1000',
        });
        document.body.appendChild(containerDiv);
        console.log("Bottom container added.");
    }
    createBottomContainer();

    // Function to fetch the captcha image and token-id
    async function fetchCaptcha() {
        try {
            // Generate a random visitorId
            const visitorId = Math.random();

            // API endpoint
            const apiUrl = `https://recaptchag.iranecar.com/api/Captcha/GetCaptchaImage2?visitorId=${visitorId}`;

            // Make the request
            const response = await fetch(apiUrl, { method: 'GET' });

            if (!response.ok) {
                console.error('Failed to fetch captcha image:', response.statusText);
                return;
            }

            // Get token-id from response headers
            const tokenId = response.headers.get('token-id');
            console.log('Retrieved token-id:', tokenId);

            // Get the captcha image as a blob
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            // Update the captcha display
            updateCaptcha(imageUrl, tokenId);

        } catch (error) {
            console.error('Error fetching captcha:', error);
        }
    }

    // Function to create or update the captcha display
    function updateCaptcha(imageUrl, tokenId) {
        // Find the container or create it
        let container = document.getElementById('captcha-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'captcha-container';
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.left = '10px';
            container.style.zIndex = '1000';
            container.style.width = '400px';
            container.style.height = 'auto';
            container.style.backgroundColor = '#222';
            container.style.color = '#fff';
            container.style.border = '1px solid #ccc';
            container.style.padding = '15px';
            container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.style.borderRadius = '8px';
            document.body.appendChild(container);
        }

        // Clear the container
        container.innerHTML = '';

        // Add input fields and buttons dynamically
        const fields = [
            { id: 'username-input', placeholder: 'Enter username', type: 'text' },
            { id: 'password-input', placeholder: 'Enter password', type: 'password' },
            { id: 'captcha-input', placeholder: 'Enter captcha', type: 'text' },
        ];

        fields.forEach(field => {
            const input = document.createElement('input');
            input.type = field.type;
            input.placeholder = field.placeholder;
            input.style.height = '40px';
            input.style.width = '100%';
            input.style.marginBottom = '10px';
            input.style.padding = '10px';
            input.style.fontSize = '16px';
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '5px';
            input.style.boxSizing = 'border-box';
            input.id = field.id;
            container.appendChild(input);
        });

        // Add captcha image
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Captcha';
        img.style.height = '80px';
        img.style.marginBottom = '10px';
        img.style.border = '1px solid #ccc';
        img.style.borderRadius = '5px';
        container.appendChild(img);

        // Add refresh button
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Refresh Captcha';
        refreshButton.style.height = '40px';
        refreshButton.style.width = '100%';
        refreshButton.style.backgroundColor = '#007bff';
        refreshButton.style.color = '#fff';
        refreshButton.style.fontSize = '16px';
        refreshButton.style.border = 'none';
        refreshButton.style.borderRadius = '5px';
        refreshButton.style.cursor = 'pointer';
        refreshButton.addEventListener('click', fetchCaptcha);
        container.appendChild(refreshButton);

        // Add submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.style.height = '40px';
        submitButton.style.width = '100%';
        submitButton.style.backgroundColor = '#28a745';
        submitButton.style.color = '#fff';
        submitButton.style.fontSize = '16px';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.marginTop = '10px';
        submitButton.addEventListener('click', async () => {
            const usernameValue = document.getElementById('username-input').value;
            const passwordValue = document.getElementById('password-input').value;
            const captchaValue = document.getElementById('captcha-input').value;

            // Validate inputs
            if (!usernameValue || !passwordValue || !captchaValue) {
                alert('All fields are required!');
                return;
            }

            // Send data to SignIn API
            const requestData = {
                nationalCode: usernameValue,
                password: passwordValue,
                captchaResponse: null,
                captchaResult: captchaValue,
                captchaToken: tokenId,
            };

            try {
                const response = await fetch('https://sauthapi.iranecar.com/api/v1/Account/SignIn', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                const responseData = await response.json();
                console.log('Response:', responseData);

                if (response.ok) {
                    alert('Login successful!');
                } else {
                    alert(`Login failed: ${responseData.message}`);
                }
            } catch (error) {
                console.error('Error submitting data:', error);
                alert('An error occurred while submitting data.');
            }
        });
        container.appendChild(submitButton);
    }

    // Initialize by fetching the captcha



    function fetchSaipaItems() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: homeItemsApiUrl,
            headers: { 'Content-Type': 'application/json' },
            onload: function (response) {
                const data = JSON.parse(response.responseText);
                if (data && data.data) {
                    displayItems(data.data);
                } else {
                    console.error('No data found.');
                }
            },
            onerror: function () {
                console.error('Failed to fetch Saipa items.');
            },
        });
    }

    // Function to display fetched items with a button for each
    function displayItems(items) {
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            width: '400px',
            height: '500px',
            overflowY: 'scroll',
            backgroundColor: '#222',
            color: '#fff',
            border: '1px solid #ccc',
            padding: '10px',
            zIndex: '1000',
        });

        let output = '<h2>Saipa Home Items</h2><ul>';
        items.forEach((item, index) => {
            const itemId = `item-button-${index}`; // Unique ID for the button
            output += `
                <li>
                    <h3>${item.title}</h3>
                    <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; margin-bottom: 10px;" />
                    <p>Manufacturer: ${item.manufacturer.title}</p>
                    <ul>
                        ${item.spec.map(spec => `<li>${spec.title}: ${spec.description}</li>`).join('')}
                    </ul>
                    <button id="${itemId}" style="width: 100%; margin-top: 10px; background-color: #007bff; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">
                        Select ${item.title}
                    </button>
                </li>
                <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />
            `;
        });
        output += '</ul>';

        container.innerHTML = output;
        document.body.appendChild(container);

        // Add event listeners to all buttons
        items.forEach((item, index) => {
            const button = document.getElementById(`item-button-${index}`);
            button.addEventListener('click', () => handleItemButtonClick(item));
        });
    }

    // Function to handle button clicks for each item
    function handleItemButtonClick(item) {
        alert(`You selected: ${item.title}\nManufacturer: ${item.manufacturer.title}`);
        console.log('Item details:', item);
        // Add any additional logic here, such as navigating to another page or performing an action
    }

    // Initialize script

        fetchCaptcha();

    fetchSaipaItems();
})();
