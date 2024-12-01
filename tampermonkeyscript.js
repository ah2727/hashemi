// ==UserScript==
// @name         saipa with Submit Logic
// @namespace    http://tampermonkey.net/
// @version      2024-11-17
// @description  Fetch captcha, get token, and submit login data dynamically
// @author       You
// @match        *://saipa.iranecar.com/*
// @grant        GM_xmlhttpRequest
// @grant GM_setValue
// @grant GM_getValue
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
    const confirmdata = 'https://sapi.iranecar.com/api/v1/order/getConfirmationData';
    const fillconfirm = "https://sapi.iranecar.com/api/v1/order/fillConfirm";
    const getUrl = "https://sapi.iranecar.com/api/v1/Order/GetActiveReservedUrl";
    const checkresult = "https://sapi.iranecar.com/api/v1/bank/checkResult";
    const getreverseurl = "https://sapi.iranecar.com/api/v1/Order/GetActiveReservedUrl";
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
            if (key === 'AuthUser') {
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
    async function fetchCaptchasstep2() {
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


            return {
                image:imageUrl,
                tokenid:tokenId
            };

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
        fetchData(item.id);

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


    // Fetch circulation data for the selected car
    async function fetchData(carModelId) {
        try {
            const url = `${circulationApiUrl}?carModelId=${carModelId}`;
            const response = await fetch(url);
            const data = await response.json();
            let selectedBranchId;
            let defaultBranchId;
            let selectedoption;
            let captchatoken;
            let capthcainput;
            let selectedInsureIdOne;
            let selectedInsureCodeone;
            let selectedInsureCodeTwo;
            let selectedInsureIdTwo;

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
                const selectedOptions = new Set();

                // Populate checkboxes from data
                data.data[0].options.forEach(option => {
                    const checkboxContainer = document.createElement('div');

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `option-${option.id}`;
                    checkbox.value = option.id;

                    // Add a label for the checkbox
                    const label = document.createElement('label');
                    label.htmlFor = `option-${option.id}`;
                    label.textContent = `${option.title} - Price: ${option.price}`;

                    // Append checkbox and label to the container
                    checkboxContainer.appendChild(checkbox);
                    checkboxContainer.appendChild(label);

                    // Append the container to the optionsDiv
                    optionsDiv.appendChild(checkboxContainer);

                    // Add change listener to update selected options
                    checkbox.addEventListener('change', (event) => {
                        if (event.target.checked) {
                            selectedOptions.add(option.id); // Add the selected option ID

                        } else {
                            selectedOptions.delete(option.id); // Remove the unselected option ID
                        }
                        selectedoption = Array.from(selectedOptions);
                        console.log('Selected Options:', Array.from(selectedOptions)); // Log the selected options as an array
                    });
                });

                const steptwodiv = document.createElement("div");

                const response = await fetch(insurersApiUrl);
                const dataّInsure = await response.json();

                if (dataّInsure.status === 200 && dataّInsure.data.length > 0) {
                    // Create the insurer dropdown
                    const dropdown = document.createElement('select');
                    dropdown.style.height = '40px';
                    dropdown.style.fontSize = '16px';
                    dropdown.style.marginBottom = '10px';
                    dropdown.id = 'insurer-select';

                    // Add a default "Select Insurer" option
                    const defaultOption = document.createElement('option');
                    defaultOption.value = ''; // No value for default
                    defaultOption.textContent = 'Select Insurer';
                    dropdown.appendChild(defaultOption);

                    // Populate dropdown with insurers
                    dataّInsure.data.forEach(insurer => {
                        const option = document.createElement('option');
                        option.value = `${insurer.id}-${insurer.code}`; // Set value to insurer ID
                        option.textContent = insurer.title; // Display insurer title
                        dropdown.appendChild(option);
                    });

                    // Append dropdown to the main container
                    steptwodiv.innerHTML += '<h2 style="width:20%">Select Insurer</h2>';
                    steptwodiv.appendChild(dropdown);

                    // Variables to store selected values


                    console.log(dataّInsure);
                    let selectedInsureIdTwo = dataّInsure.data[1].id;
                    let selectedInsureCodeTwo = dataّInsure.data[1].code;

                    // Listen for changes in the dropdown
                    dropdown.addEventListener('change', function (event) {
                        const selectedOption = event.target.options[event.target.selectedIndex];

                        if (selectedOption.value) {
                            // If a valid option is selected
                            const insurerone = selectedOption.value.split('-');
                            selectedInsureIdOne = insurerone[0];
                            selectedInsureCodeone = insurerone[1];


                        } else {
                            // Reset if "Select Insurer" is chosen
                            selectedInsureIdOne = null;
                            selectedInsureCodeone = null;
                            selectedInsureIdTwo = null;
                            selectedInsureCodeTwo = null;
                        }

                        // Log the selected values
                        console.log('Selected Insurer ID One:', selectedInsureIdOne);
                        console.log('Selected Insurer Code One:', selectedInsureCodeone);
                        console.log('Selected Insurer ID Two:', selectedInsureIdTwo);
                        console.log('Selected Insurer Code Two:', selectedInsureCodeTwo);
                    });
                } else {
                    console.error('Failed to fetch insurers or no data available');
                }

                // Create step container div
                steptwodiv.style.backgroundColor = '#444';
                steptwodiv.style.color = '#fff';
                steptwodiv.style.width = "20%";
                steptwodiv.style.marginTop = '20px';
                steptwodiv.style.marginRight='20%';
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


                const divstep3=document.createElement("div");
                divstep3.style.backgroundColor = '#333';
                divstep3.style.color = '#fff';
                divstep3.style.width="30%";
                divstep3.style.padding = '15px';
                divstep3.style.borderRadius = '8px';
                divstep3.style.marginBottom = '20px';
                divstep3.style.marginRight = '20px';
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
                            responseCityBranchData.forEach((branch, index) => {
                                const newBranchOption = document.createElement("option");
                                newBranchOption.value = `${branch.code}-${branch.id}`; // Combine branch code and ID
                                newBranchOption.textContent = `Branch: ${branch.title}`; // Display branch title

                                // Check if this branch should be the default
                                if (index === 0) { // Use the first branch as default (adjust condition if needed)
                                    defaultBranchId = newBranchOption.value;
                                }

                                cityBranchSelect.appendChild(newBranchOption);
                            });
                            if (defaultBranchId) {
                                cityBranchSelect.value = defaultBranchId; // Set the dropdown to the default option
                                selectedBranchId = defaultBranchId; // Update the selectedBranchId variable
                            }

                            // Add the event listener for change
                            cityBranchSelect.addEventListener("change", async function (event) {
                                selectedBranchId = event.target.value;
                                console.log("Selected Branch ID:", selectedBranchId);
                            });
                        });
                    } catch (error) {
                        console.error('Error fetching city data:', error);
                    }
                });



                const captcha2 = await fetchCaptchasstep2();
                const imgcaptchastep3 = document.createElement('img');
                imgcaptchastep3.src = captcha2.image;
                imgcaptchastep3.alt = 'Captcha';
                imgcaptchastep3.style.height = '80px';
                imgcaptchastep3.style.marginBottom = '10px';
                imgcaptchastep3.style.border = '1px solid #ccc';
                imgcaptchastep3.style.borderRadius = '5px';
                captchatoken=captcha2.tokenid
                const inputCaptcha = document.createElement('input');
                inputCaptcha.type = "number";
                inputCaptcha.placeholder = "enter captcha";
                inputCaptcha.style.height = '40px';
                inputCaptcha.style.width = '100%';
                inputCaptcha.style.marginBottom = '10px';
                inputCaptcha.style.padding = '10px';
                inputCaptcha.style.fontSize = '16px';
                inputCaptcha.style.border = '1px solid #ccc';
                inputCaptcha.style.borderRadius = '5px';
                inputCaptcha.style.boxSizing = 'border-box';
                inputCaptcha.id = "captcha2";
                const submitButtonStepTWo = document.createElement('button');
                submitButtonStepTWo.textContent = 'Submit';
                submitButtonStepTWo.style.height = '40px';
                submitButtonStepTWo.style.width = '20%';
                submitButtonStepTWo.style.position = 'absolute';
                submitButtonStepTWo.style.bottom="30px";
                submitButtonStepTWo.style.right ="70%";
                submitButtonStepTWo.style.backgroundColor = '#28a745';
                submitButtonStepTWo.style.color = '#fff';
                submitButtonStepTWo.style.fontSize = '16px';
                submitButtonStepTWo.style.border = 'none';
                submitButtonStepTWo.style.borderRadius = '5px';
                submitButtonStepTWo.style.cursor = 'pointer';
                submitButtonStepTWo.style.marginTop = '10px';
                steptwodiv.appendChild(submitButtonStepTWo);

                divstep3.appendChild(imgcaptchastep3);
                divstep3.appendChild(inputCaptcha);
                // Append the provincediv to the step container

                submitButtonStepTWo.addEventListener("click",()=>{

                    const splitedbranchCodeandId = selectedBranchId.split("-")
                    console.log(data.data[0].circulationColors[0].colorCode);
                    capthcainput = document.getElementById('captcha2').value;
                    registercar(splitedbranchCodeandId[0],splitedbranchCodeandId[1],data.data[0].id,data.data[0].carUsages[0].id,data.data[0].id,selectedoption,data.data[0].circulationColors[0].colorCode,data.data[0].circulationColors[0].id,data.data[0].companyCode,data.data[0].crcl_row,selectedInsureIdOne,selectedInsureCodeone,false,selectedInsureIdTwo,selectedInsureCodeTwo,false,capthcainput,captchatoken,[],1);

                    steptwodiv.remove();
                    divstep3.remove();
                })

                steptwodiv.appendChild(provincediv);

                provincediv.appendChild(provinceSelect);

                // Loop through each province item in the response and create an option
                // Append the province select to the province div

                // Finally, append the step div to the main container
                mainContainer.appendChild(steptwodiv);

                mainContainer.appendChild(divstep3);
            }
        } catch (error) {
            console.error('Error fetching circulation data:', error);
        }
    }
    function getTokenFromCookies(cookieName) {
        const cookies = document.cookie.split(';'); // Split all cookies into an array
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('='); // Split each cookie into name and value
            if (name === cookieName) {
                try {
                    // Parse the JSON string
                    const cookieData = JSON.parse(decodeURIComponent(value));
                    return cookieData.data.token.token; // Return the token value from the cookie data
                } catch (e) {
                    console.error("Error parsing cookie:", e);
                    return null; // Return null if parsing fails
                }
            }
        }
        return null; // Return null if the cookie is not found
    }
    async function checkResultLoop(data,resultfilldata) {
        let activeorder="";
        let currentUrl="";
        const token = getTokenFromCookies("AuthUser");
        let nextPageUrl="";
        const requestDataCheckResult = {
            orderId: data.id,
            queueId: resultfilldata.queueId
        };
        while (nextPageUrl === "" || activeorder === "") {
            try {
                // Send the POST request
                const response = await fetch(checkresult, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${token}`,  // Use your actual token here
                    },
                    body: JSON.stringify(requestDataCheckResult)
                });

                // Check if the request was successful
                if (!response.ok) {
                    console.error("Request failed with status:", response.status);
                    break; // Exit the loop if the request fails
                }

                // Parse the response as JSON
                const data = await response.json();

                // Process the response data
                console.log(data);

                // Check if there is a nextPageUrl
                if (data && data.data && data.data.nextPageUrl) {
                    nextPageUrl = data.data.nextPageUrl; // Get the next page URL
                    console.log("Next page URL:", nextPageUrl);

                    // Update currentUrl for the next request
                    currentUrl = nextPageUrl;
                    window.location.href = currentUrl;  // Redirect to the next page

                }
                // Check if there is an active order ID
                else if (data && data.data && data.data.activeOrderId) {
                    activeorder = data.data.activeOrderId;
                    console.log("Active order ID:", activeorder);
                    break; // Exit the loop once we have the active order ID

                }
                // Handle the case where there is an error
                else if (data && data.data && data.data.error) {
                    console.log("Error: ", data.data.error);
                    break; // Exit the loop on error
                }
                // If no nextPageUrl or activeOrderId, stop the loop
                else {
                    console.log("No next page URL or active order ID found. Stopping the requests.");
                }

                // Wait before making the next request (adjust delay as needed)
                console.log("Waiting for next request...");
                await new Promise(resolve => setTimeout(resolve, 1000));  // 1 second delay

            } catch (error) {
                console.error("Error during request:", error);
                break; // Exit the loop on error
            }
        }

        console.log("Loop finished. No more pages or active order ID.");
    }
    async function registercar(BranchCode,BranchId,CardId,CarUsageId,CircuLationId,CirculationOptionIds,ColorCode,ColorId,CompanyCode,CrclRow,FirstInsurerCode,FirstInsurerId,HaveYoungModule,SecondInsurerCode,SecondInsurerId,VerifyTaloghOfteModel,captchaResult,captchaToken,circulationColorIds,count){
        const requestDataRegister = {
            BranchCode,
            BranchId,
            CardId,
            CarUsageId,
            CircuLationId,
            CirculationOptionIds:[143764,143766],
            ColorCode,
            ColorId,
            CompanyCode,
            CrclRow,
            FirstInsurerCode:"509",
            FirstInsurerId:"8",
            HaveYoungModule,
            SecondInsurerCode:"507",
            SecondInsurerId:"7",
            VerifyTaloghOfteModel,
            captchaRes:null,
            captchaResult,
            captchaToken,
            circulationColorIds,
            count,
        };
        const token = getTokenFromCookies("AuthUser");
        try {
            const response = await fetch(register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
        },
                body: JSON.stringify(requestDataRegister),
            });

            const data = await response.json();
            const banks = data.banks; // Make sure 'banks' exists in the response
            // Create divstep4
            const divstep4 = document.createElement("div");
            divstep4.style.backgroundColor = '#333';
            divstep4.style.color = '#fff';
            divstep4.style.width = "100%";
            divstep4.style.padding = '15px';
            divstep4.style.borderRadius = '8px';
            divstep4.style.marginBottom = '20px';
            divstep4.style.marginRight = '20px';
            mainContainer.appendChild(divstep4);

            // Create <select> element
            const selectElement = document.createElement("select");
            selectElement.id = "bankSelector";
            divstep4.appendChild(selectElement); // Append the select to divstep4, not to document.body

            // Create a default "Select a bank" option
            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select a bank";
            defaultOption.value = "";
            selectElement.appendChild(defaultOption);

            // Loop through banks and create <option> elements
            banks.forEach(bank => {
                const option = document.createElement("option");
                option.value = bank.id;
                option.textContent = `${bank.bankName} (${bank.persianBankName})`;
                option.setAttribute("dbankbankName", bank.bankName); // Assuming the bank has a URL
                selectElement.appendChild(option);
            });

            // Add event listener for the selector
            selectElement.addEventListener("change", async function () {
                const selectedOption = this.options[this.selectedIndex];
                const bankUrl = selectedOption.getAttribute("dbankbankName");

                const requestDataConfirm = {
                    id: data.id  // Only sending the id field as per your request
                };
                const responseConfirm = await fetch(confirmdata, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`  // Include authorization if needed
        },
                    body: JSON.stringify(requestDataConfirm),
                });

                const captchadiv = document.createElement("div");
                const captcha1 =await fetchCaptchasstep2();
                const captcha2 =await fetchCaptchasstep2();
                const imgcaptchastep3 = document.createElement('img');
                imgcaptchastep3.src = captcha1.image;
                imgcaptchastep3.alt = 'Captcha';
                imgcaptchastep3.style.height = '80px';
                imgcaptchastep3.style.marginBottom = '10px';
                imgcaptchastep3.style.border = '1px solid #ccc';
                imgcaptchastep3.style.borderRadius = '5px';
                const captchatoken1=captcha1.tokenid
                const inputCaptcha = document.createElement('input');
                inputCaptcha.type = "number";
                inputCaptcha.placeholder = "enter captcha";
                inputCaptcha.style.height = '40px';
                inputCaptcha.style.width = '100%';
                inputCaptcha.style.marginBottom = '10px';
                inputCaptcha.style.padding = '10px';
                inputCaptcha.style.fontSize = '16px';
                inputCaptcha.style.border = '1px solid #ccc';
                inputCaptcha.style.borderRadius = '5px';
                inputCaptcha.style.boxSizing = 'border-box';
                inputCaptcha.id = "captcha1";
                const imgcaptchastep4 = document.createElement('img');
                imgcaptchastep4.src = captcha2.image;
                imgcaptchastep4.alt = 'Captcha';
                imgcaptchastep4.style.height = '80px';
                imgcaptchastep4.style.marginBottom = '10px';
                imgcaptchastep4.style.border = '1px solid #ccc';
                imgcaptchastep4.style.borderRadius = '5px';
                const captchatoken2=captcha2.tokenid
                const inputCaptcha2 = document.createElement('input');
                inputCaptcha2.type = "number";
                inputCaptcha2.placeholder = "enter captcha";
                inputCaptcha2.style.height = '40px';
                inputCaptcha2.style.width = '100%';
                inputCaptcha2.style.marginBottom = '10px';
                inputCaptcha2.style.padding = '10px';
                inputCaptcha2.style.fontSize = '16px';
                inputCaptcha2.style.border = '1px solid #ccc';
                inputCaptcha2.style.borderRadius = '5px';
                inputCaptcha2.style.boxSizing = 'border-box';
                inputCaptcha2.id = "captcha2";

                const submitButtonStepTWo = document.createElement('button');
                submitButtonStepTWo.textContent = 'Submit';
                submitButtonStepTWo.style.height = '40px';
                submitButtonStepTWo.style.width = '20%';
                submitButtonStepTWo.style.position = 'absolute';
                submitButtonStepTWo.style.bottom="30px";
                submitButtonStepTWo.style.right ="70%";
                submitButtonStepTWo.style.backgroundColor = '#28a745';
                submitButtonStepTWo.style.color = '#fff';
                submitButtonStepTWo.style.fontSize = '16px';
                submitButtonStepTWo.style.border = 'none';
                submitButtonStepTWo.style.borderRadius = '5px';
                submitButtonStepTWo.style.cursor = 'pointer';
                submitButtonStepTWo.style.marginTop = '10px';
                captchadiv.appendChild(imgcaptchastep3);
                captchadiv.appendChild(inputCaptcha);
                captchadiv.appendChild(imgcaptchastep4);
                captchadiv.appendChild(inputCaptcha2);
                captchadiv.appendChild(submitButtonStepTWo);
                divstep4.appendChild(captchadiv); // Append the select to divstep4, not to document.body
                submitButtonStepTWo.addEventListener('click', async () => {
                    try {
                        const capthcainput = document.getElementById('captcha1').value;
                        const requestData = {
                            bankName: bankUrl,
                            captchaRes: null,
                            captchaResult: capthcainput,
                            captchaToken: captchatoken1,
                            confirmAffidavit: false,
                            isAccept: true,
                            onlineshoppingId: data.id,
                        };
                        const responseFillConfirm = await fetch(fillconfirm, {
                            method: 'POST',
                            headers: {
                                "Accept": "application/json",
                                "Accept-Encoding": "gzip, deflate, br, zstd",
                                "Accept-Language": "en-US,en;q=0.9",
                                "Access-Control-Allow-Origin": "*", // Note: This header is usually set by the server, not by the client
                                "Authorization": `Bearer ${token}`,
                                "Cache-Control": "no-cache",
                                "Content-Type": "application/json",
                                "Origin": "https://saipa.iranecar.com",
                                "Pragma": "no-cache",
                                "Priority": "u=1, i",
                                "Referer": "https://saipa.iranecar.com/",
                                'Accept-Encoding': 'gzip, deflate, br', // Accepting gzip compression (default supported)
                                'Connection': 'keep-alive',
                            },
                            body: JSON.stringify(requestData),
                        });

                        if (response.ok) {
                            const resultfilldata =await responseFillConfirm.json();
                            const setCookieHeader = responseFillConfirm.headers.get("Set-Cookie");
                            console.log("Set-Cookie Header:", setCookieHeader);  // For debugging purposes

                            console.log(resultfilldata);

                            try {
                                const requestDataCheckResult = {
                                    orderId: data.id,
                                    queueId: resultfilldata.queueId
                                };
                                const responseCheckResult = await fetch(checkresult, {  // Replace with your actual endpoint
                                    method: "POST",
                                    headers: {
                                        "Content-Type": 'application/json',
                                        "Access-Control-Allow-Origin": "*", // Note: This header is usually set by the server, not by the client
                                        "Authorization": `Bearer ${token}`,
                                    },
                                    body: JSON.stringify(requestDataCheckResult)
                                });
                                const capthcainput = document.getElementById('captcha2').value;

                                const serverdata = {
                                    googleCaptchaResult: null,
                                    megaCaptchaResult: capthcainput,
                                    megaCaptchaToken:captchatoken2
                                };
                                const dataresponseCheckResult = await responseCheckResult.json();
                                console.log(dataresponseCheckResult)
                                let nextPageUrl = dataresponseCheckResult.data.nextPageUrl;
                                if(nextPageUrl!=""){
                                    window.location.href=nextPageUrl;
                                }else{
                                    checkResultLoop(data,resultfilldata);
                                }
                                if (response.ok) {
                                    const responseGetUrl = await fetch(getreverseurl, {  // Replace with your actual endpoint
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": `Bearer ${token}`,  // Replace with your actual token if needed
                                        },
                                        body: JSON.stringify(serverdata)
                                    });
                                    const respomsegeturl =await responseGetUrl.json();
                                    console.log(respomsegeturl.data.url);
                                    if(respomsegeturl.data.url){
                                        window.location.href=respomsegeturl.data.url
                                    }

                                } else {
                                    console.error("Error in response:", response.statusText);
                                }
                            } catch (error) {
                                console.error("Error in request:", error);
                            }
                        } else {
                            console.error("Failed to submit:", response.statusText);
                        }
                    } catch (error) {
                        console.error("Error:", error);
                    }
                })
                if (bankUrl) {
                    console.log("Selected bank URL:", bankUrl);
                    // You can now use the bank URL for displaying an image or other purposes
                }
            });
        } catch (error) {
            console.log("Error:", error);
        }


    }

    // Initialize script
    fetchCaptcha();
    fetchSaipaItems();
})();
