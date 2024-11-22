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
    const insurersApiUrl = 'https://sapi.iranecar.com/api/v1/Insurer/GetInsurers';
    const circulationApiUrl = 'https://sapi.iranecar.com/api/v1/Product/GetCirculationData'; // URL for circulation data
    const circulationbranchprovince = 'https://sauthapi.iranecar.com/api/v1/branch/circulationBranchProvince';
    const circulationbranchcity = 'https://sauthapi.iranecar.com/api/v1/branch/circulationBranchProvinceCity';
    const circilationbranchcityget = 'https://sauthapi.iranecar.com/api/v1/branch/circulationBranchCity';
    const register = 'https://sapi.iranecar.com/api/v1/order/register';
    const mainContainer = createMainContainer();

    // Function to create the container for login and car items
    function createMainContainer() {
        const containerDiv = document.createElement('div');
        Object.assign(containerDiv.style, {
            display:'flex',
            position: 'fixed',
            top: '10px',
            left: '10px',
            width: '90%',
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

    let isLoggedIn = checkLoginStatus(); // Initialize the login status from cookies

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
        const logindiv = document.createElement("div");
        logindiv.style.display="grid";

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
            logindiv.appendChild(input);
        });

        // Add captcha image
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Captcha';
        img.style.height = '80px';
        img.style.marginBottom = '10px';
        img.style.border = '1px solid #ccc';
        img.style.borderRadius = '5px';
        logindiv.appendChild(img);

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
        logindiv.appendChild(refreshButton);

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
                    // Save login data in cookies
                    saveLoginDataToCookies(responseData);
                    mainContainer.innerHTML = '<p>You are now logged in!</p>';
                    fetchSaipaItems(); // Fetch items after successful login
                } else {
                    alert(`Login failed: ${responseData.message}`);
                }
            } catch (error) {
                console.error('Error submitting data:', error);
            }
        });
        logindiv.appendChild(submitButton);
        mainContainer.appendChild(logindiv);
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

        let output = '<div style="width:20%"><h2>Saipa Home Items</h2><ul>';
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
                    <button id="${itemId}" style="width:  100%; margin-top: 10px; background-color: #007bff; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">
                        Select ${item.title}
                    </button>
                </li>
                <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />
            `;
        });
        output += '</ul><div>';

        mainContainer.innerHTML += output;  // Append to main container

        // Add event listeners to all buttons
        items.forEach((item, index) => {
            const button = document.getElementById(`item-button-${index}`);
            button.addEventListener('click', () => handleItemButtonClick(item));
        });
    }

    // Function to handle button clicks for each item and save car model ID in cookie
    function handleItemButtonClick(item) {
        console.log('Item details:', item);

        // Save the selected car model ID in a cookie
        document.cookie = `selectedCarModelId=${item.id}; path=/; expires=${new Date(Date.now() + 60 * 60 * 1000).toUTCString()}`;
        console.log('Car Model ID saved to cookie:', item.id);

        // Fetch insurers and circulation data
        fetchInsurers();
        fetchCirculationData(item.id);

        // Clear the main container and show car details
        mainContainer.innerHTML = '';

        // Create a new section to display the car details
        const carDetailsDiv = document.createElement('div');
        carDetailsDiv.style.backgroundColor = '#333';
        carDetailsDiv.style.color = '#fff';
        carDetailsDiv.style.width="20%";
        carDetailsDiv.style.padding = '15px';
        carDetailsDiv.style.borderRadius = '8px';
        carDetailsDiv.style.marginBottom = '20px';

        // Add car details to the section
        carDetailsDiv.innerHTML = `
            <h2>${item.title}</h2>
            <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; margin-bottom: 10px;" />
            <p><strong>Manufacturer:</strong> ${item.manufacturer.title}</p>
            <ul>
                ${item.spec.map(spec => `<li><strong>${spec.title}:</strong> ${spec.description}</li>`).join('')}
            </ul>
            <button id="backButton" style="background-color: #007bff; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                Go Back to Car List
            </button>
        `;

        // Append the car details to the main container
        mainContainer.appendChild(carDetailsDiv);

        // Add an event listener to the back button
        const backButton = document.getElementById('backButton');
        backButton.addEventListener('click', () => {
            // When the "Go Back" button is clicked, reload the car list
            fetchSaipaItems();
        });
    }

    // Fetch insurers and display them in a dropdown
    async function fetchInsurers() {
        try {
            const steptwodiv = document.createElement("div");

            const response = await fetch(insurersApiUrl);
            const data = await response.json();

            if (data.status === 200 && data.data.length > 0) {
                // Create the insurer dropdown
                const dropdown = document.createElement('select');
                dropdown.style.width = '20%';
                dropdown.style.height = '40px';
                dropdown.style.fontSize = '16px';
                dropdown.style.marginBottom = '10px';
                dropdown.id = 'insurer-select';

                // Add a default "Select Insurer" option
                const defaultOption = document.createElement('option');
                defaultOption.textContent = 'Select Insurer';
                dropdown.appendChild(defaultOption);

                // Populate dropdown with insurers
                data.data.forEach(insurer => {
                    const option = document.createElement('option');
                    option.value = insurer.id;
                    option.textContent = insurer.title;
                    dropdown.appendChild(option);
                });

                // Append dropdown to the main container
                mainContainer.innerHTML += '<h2 style="width:20%">Select Insurer</h2>';
                steptwodiv.appendChild(dropdown);
            } else {
                console.error('Failed to fetch insurers or no data available');
            }
        } catch (error) {
            console.error('Error fetching insurers:', error);
        }
    }

    // Fetch circulation data for the selected car
    async function fetchCirculationData(carModelId) {
        try {
            const url = `${circulationApiUrl}?carModelId=${carModelId}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.data[0].title) {
                // Create a div for options
                const optionsDiv = document.createElement('div');
                optionsDiv.style.backgroundColor = '#444';
                optionsDiv.style.color = '#fff';
                optionsDiv.style.width = "100%";
                optionsDiv.style.padding = '15px';
                optionsDiv.style.marginTop = '20px';
                optionsDiv.innerHTML = `<h3>Available Options for ${data.data[0].title}</h3>`;
                console.log(data);

                // Create a select element for options
                const optionsList = document.createElement('select');
                optionsList.style.width = "100%";

                data.data[0].options.forEach(option => {
                    const listItem = document.createElement('option');
                    listItem.textContent = `${option.title} - Price: ${option.price}`;
                    listItem.value = `${option.id}`;
                    optionsList.appendChild(listItem);
                });
                optionsDiv.appendChild(optionsList);

                // Create step container div
                const steptwodiv = document.createElement('div');
                steptwodiv.style.backgroundColor = '#444';
                steptwodiv.style.color = '#fff';
                steptwodiv.style.width = "20%";
                steptwodiv.style.marginTop = '20px';

                // Add the options div to the step div
                steptwodiv.appendChild(optionsDiv);

                // Append the step container to the main container
                mainContainer.appendChild(steptwodiv);

                // Fetch provinces for the circulation ID
                const responseprovince = await fetch(circulationbranchprovince, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "circulationId": `${data.data[0].id}` }),
                });

                const resprovince = await responseprovince.json();

                // Create a div for the province select
                const provincediv = document.createElement('div');
                provincediv.style.backgroundColor = '#444';
                provincediv.style.color = '#fff';
                provincediv.style.width = "100%";
                provincediv.style.padding = '15px';

                // Create the province select element
                const provinceSelect = document.createElement("select");
                provinceSelect.style.width = "100%";
                resprovince.forEach(province => {
                    const option = document.createElement("option");
                    option.value = province.id;  // Assuming each province has an 'id' property
                    option.textContent = province.title;  // Assuming each province has a 'title' property
                    provinceSelect.appendChild(option);
                });
                // Add event listener to handle the province selection
                provinceSelect.addEventListener("change", async function (event) {
                    try {
                        const selectedProvince = event.target.value;
                        console.log("Selected province:", selectedProvince);

                        // Prepare the request data
                        const requestDatacity = {
                            provinceId: selectedProvince,
                            circulationId: data.data[0].id
                        };

                        // Send the POST request to fetch city data
                        const response = await fetch(circulationbranchcity, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestDatacity),
                        });

                        // Parse the response as JSON
                        const responseData = await response.json();

                        // Create or select the city dropdown
                        let citySelect = document.querySelector('#citySelect');
                        if (!citySelect) {
                            // If the city select element does not exist, create it
                            citySelect = document.createElement("select");
                            citySelect.id = 'citySelect';
                            citySelect.style.width = "100%";

                            // Add the citySelect to the container
                            const cityDiv = document.createElement('div');
                            cityDiv.style.backgroundColor = '#444';
                            cityDiv.style.color = '#fff';
                            cityDiv.style.width = "100%";
                            cityDiv.style.padding = '15px';
                            cityDiv.appendChild(citySelect);

                            // Append the cityDiv to the steptwodiv container
                            steptwodiv.appendChild(cityDiv);
                        } else {
                            // Clear existing options if the citySelect already exists
                            citySelect.innerHTML = '';
                        }

                        // Add new city options from responseData
                        responseData.forEach(city => {
                            const newOption = document.createElement("option");
                            newOption.value = city.code;  // Assuming responseData has a 'code' property for each city
                            newOption.textContent = `City: ${city.title}`;  // Assuming responseData has a 'title' property for each city
                            citySelect.appendChild(newOption);
                        });

                        // Add an event listener to log the selected city ID and fetch branches
                        citySelect.addEventListener("change", async function (event) {
                            const selectedCityId = event.target.value;
                            console.log("Selected city ID:", selectedCityId);

                            const requestDatacityBranch = {
                                cityCode: selectedCityId,
                                circulationId: data.data[0].id
                            };

                            // Send the POST request to fetch city branch data
                            const responsecitybranch = await fetch(circilationbranchcityget, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(requestDatacityBranch),
                            });

                            const responseCityBranchData = await responsecitybranch.json();

                            // Create or select the city branch dropdown
                            let cityBranchSelect = document.querySelector('#cityBranchSelect');
                            if (!cityBranchSelect) {
                                // If the city branch select element does not exist, create it
                                cityBranchSelect = document.createElement("select");
                                cityBranchSelect.id = 'cityBranchSelect';
                                cityBranchSelect.style.width = "100%";

                                // Add the cityBranchSelect to the container
                                const cityBranchDiv = document.createElement('div');
                                cityBranchDiv.style.backgroundColor = '#444';
                                cityBranchDiv.style.color = '#fff';
                                cityBranchDiv.style.width = "100%";
                                cityBranchDiv.style.padding = '15px';
                                cityBranchDiv.appendChild(cityBranchSelect);

                                // Append the cityBranchDiv to the steptwodiv container
                                steptwodiv.appendChild(cityBranchDiv);
                            } else {
                                // Clear existing options if the cityBranchSelect already exists
                                cityBranchSelect.innerHTML = '';
                            }

                            // Add new branch options from responseCityBranchData
                            responseCityBranchData.forEach(branch => {
                                const newBranchOption = document.createElement("option");
                                newBranchOption.value = branch.id;  // Assuming responseCityBranchData has an 'id' property for each branch
                                newBranchOption.textContent = `Branch: ${branch.title}`;  // Assuming responseCityBranchData has a 'title' property for each branch
                                cityBranchSelect.appendChild(newBranchOption);
                            });
                        });
                    } catch (error) {
                        console.error('Error fetching city data:', error);
                    }
                });

                // Loop through each province item in the response and create an option
                const submitButtonStepTWo = document.createElement('button');
                submitButtonStepTWo.textContent = 'Submit';
                submitButtonStepTWo.style.height = '40px';
                submitButtonStepTWo.style.width = '20%';
                submitButtonStepTWo.style.position = 'absolute';
                submitButtonStepTWo.style.bottom="30px";
                submitButtonStepTWo.style.right ="40%";
                submitButtonStepTWo.style.backgroundColor = '#28a745';
                submitButtonStepTWo.style.color = '#fff';
                submitButtonStepTWo.style.fontSize = '16px';
                submitButtonStepTWo.style.border = 'none';
                submitButtonStepTWo.style.borderRadius = '5px';
                submitButtonStepTWo.style.cursor = 'pointer';
                submitButtonStepTWo.style.marginTop = '10px';

                // Append the province select to the province div
                provincediv.appendChild(provinceSelect);
                // Append the provincediv to the step container
                steptwodiv.appendChild(provincediv);
                steptwodiv.appendChild(submitButtonStepTWo);

                // Finally, append the step div to the main container
                mainContainer.appendChild(steptwodiv);
            }
        } catch (error) {
            console.error('Error fetching circulation data:', error);
        }
    }

    // Initialize script
    fetchCaptcha();
    fetchSaipaItems();
})();
