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

    // Check if the user is logged in by reading from cookies
    function checkLoginStatus() {
        const cookies = document.cookie.split('; ');
        for (let cookie of cookies) {
            const [key, value] = cookie.split('=');
            if (key === 'isLoggedIn' && value === 'true') {
                return true; // User is logged in
            }
        }
        return false; // User is not logged in
    }

    // Function to create the container for login and car items
    function createMainContainer() {
        const containerDiv = document.createElement('div');
        Object.assign(containerDiv.style, {
            position: 'fixed',
            top: '10px',
            left: '10px',
            width: '400px',
            height: '600px',  // Fixed height for the scrollable container
            backgroundColor: '#222',
            color: '#fff',
            border: '1px solid #ccc',
            padding: '15px',
            zIndex: '1000',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
            overflowY: 'auto',  // Enables vertical scrolling
        });
        document.body.appendChild(containerDiv);
        console.log("Main container added.");
        return containerDiv;
    }

    const mainContainer = createMainContainer();
    let isLoggedIn = checkLoginStatus(); // Initialize the login status from cookies

    // Function to fetch the captcha image and token-id
    async function fetchCaptcha() {
        try {
            const visitorId = Math.random();
            const apiUrl = `https://recaptchag.iranecar.com/api/Captcha/GetCaptchaImage2?visitorId=${visitorId}`;
            const response = await fetch(apiUrl, { method: 'GET' });

            if (!response.ok) {
                console.error('Failed to fetch captcha image:', response.statusText);
                return;
            }

            const tokenId = response.headers.get('token-id');
            console.log('Retrieved token-id:', tokenId);

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            updateCaptcha(imageUrl, tokenId);

        } catch (error) {
            console.error('Error fetching captcha:', error);
        }
    }

    // Function to create or update the captcha display
    function updateCaptcha(imageUrl, tokenId) {
        if (isLoggedIn) {
            mainContainer.innerHTML = '<p>You are already logged in!</p>';
            return;
        }

        // Clear existing content in main container
        mainContainer.innerHTML = '';

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
            mainContainer.appendChild(input);
        });

        // Add captcha image
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Captcha';
        img.style.height = '80px';
        img.style.marginBottom = '10px';
        img.style.border = '1px solid #ccc';
        img.style.borderRadius = '5px';
        mainContainer.appendChild(img);

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
        mainContainer.appendChild(refreshButton);

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
                    // Save login data in cookies
                    saveLoginDataToCookies(responseData);
                    mainContainer.innerHTML = '<p>You are now logged in!</p>';
                    fetchSaipaItems(); // Fetch items after successful login
                } else {
                    alert(`Login failed: ${responseData.message}`);
                }
            } catch (error) {
                console.error('Error submitting data:', error);
                alert('An error occurred while submitting data.');
            }
        });
        mainContainer.appendChild(submitButton);
    }

    // Function to save login data in cookies
    function saveLoginDataToCookies(data) {
        const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString(); // 1 hour expiry
        // Save customer data, tokens, and expiration time
        document.cookie = `isLoggedIn=true; path=/; expires=${expires}`;
        document.cookie = `token=${data.data.token.token}; path=/; expires=${expires}`;
        document.cookie = `oldVersionToken=${data.data.token.oldVersionToken}; path=/; expires=${expires}`;
        document.cookie = `customerFirstName=${encodeURIComponent(data.data.customer.firstName)}; path=/; expires=${expires}`;
        document.cookie = `customerLastName=${encodeURIComponent(data.data.customer.lastName)}; path=/; expires=${expires}`;
        document.cookie = `customerNationalCode=${data.data.customer.nationalCode}; path=/; expires=${expires}`;
        document.cookie = `expireTime=${data.data.token.expireTime}; path=/; expires=${expires}`;
    }

    // Fetch the Saipa items
    function fetchSaipaItems() {
        if (!isLoggedIn) {
            return; // Don't fetch items if the user is not logged in
        }

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

        mainContainer.innerHTML += output;  // Append to main container

        // Add event listeners to all buttons
        items.forEach((item, index) => {
            const button = document.getElementById(`item-button-${index}`);
            button.addEventListener('click', () => handleItemButtonClick(item));
        });
    }

    // Function to handle button clicks for each item and save car model ID in cookie
    function handleItemButtonClick(item) {
        alert(`You selected: ${item.title}\nManufacturer: ${item.manufacturer.title}`);
        console.log('Item details:', item);

        // Save the selected car model ID in a cookie
        document.cookie = `selectedCarModelId=${item.id}; path=/; expires=${new Date(Date.now() + 60 * 60 * 1000).toUTCString()}`;

        console.log('Car Model ID saved to cookie:', item.id);
        // Add any additional logic here, such as navigating to another page or performing an action
    }

    // Initialize script
    fetchCaptcha();
    fetchSaipaItems();
})();
