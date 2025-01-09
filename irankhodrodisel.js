// ==UserScript==
// @name         irankhodrodisel
// @namespace    http://tampermonkey.net/
// @version      2024-12-14
// @description  try to take over the world!
// @author       You
// @match        https://esale.ikd.ir/*
// @icon         https://esale.ikd.ir/logo.png
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js

// ==/UserScript==

(function() {
    'use strict';
    //variables
    const targetKey = 'SaleInternet';
    const apiUrlfetchitems = 'https://esale.ikd.ir/api/sales/getSaleProjects';
    const captchaUrl = 'https://esale.ikd.ir/api/esales/getData66';
    const orderInit= 'https://esale.ikd.ir/api/esales/readOrderInit66';
    const smsApi = 'https://esale.ikd.ir/api/users/sendSmsOrder';
    const addOrderInit ='https://esale.ikd.ir/api/esales/addOrderInit66';
    //login
    let token = ""
    // Check if localStorage is available
    if (typeof localStorage !== 'undefined') {
        // Attempt to get the value of the target key
        token = localStorage.getItem(targetKey);

        if (token !== null) {
            console.log(`✅ Found key "${token}" in localStorage. Value:`, token);
        } else {
            console.warn(`⚠️ Key "${token}" not found in localStorage.`);
        }
    } else {
        console.error('🚫 localStorage is not supported on this site.');
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Bearer token for authentication
    };
    //maincontain
    const container = document.createElement('div');
    container.id = 'main-container';
    container.style.position = 'absolute';
    container.style.top = '30%';
    container.style.right = '30%';
    container.style.width = '800px';
    container.style.height = '500px';
    container.style.backgroundColor = '#000000';
    container.style.border = '2px solid #333';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    container.style.padding = '10px';
    container.style.zIndex = '10000';
    container.style.overflowY = 'auto';
    document.body.appendChild(container);

    async function getItems() {
        try {
            // Make the API request
            const response = await axios.post(apiUrlfetchitems, {}, { headers });
            console.log('✅ API Response:', response.data);

            // Return the data from the response
            return response.data;
        } catch (error) {
            console.error('❌ API Request Error:', error.response ? error.response.data : error.message);
            throw error; // Rethrow the error to handle it in the calling function if needed
        }
    }
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0; // Generate random 4-bit number
            const v = c === 'x' ? r : (r & 0x3 | 0x8); // Use `r` for x and specific bitwise for y
            return v.toString(16); // Convert to hexadecimal
        });
    }
    function findClosestMatchId(searchTerm, saleProjects) {
        if (!searchTerm || !saleProjects || !Array.isArray(saleProjects)) {
            throw new Error("Invalid input");
        }

        // Function to calculate similarity between two strings
        const calculateSimilarity = (str1, str2) => {
            const commonLength = str1
            .toLowerCase()
            .split('')
            .filter((char) => str2.toLowerCase().includes(char)).length;
            return commonLength / Math.max(str1.length, str2.length);
        };

        // Find the closest match
        let closestMatch = null;
        let highestSimilarity = 0;

        for (const project of saleProjects) {
            const combinedTitle = `${project.Title || ''} ${project.KhodroTitle || ''}`;
            const similarity = calculateSimilarity(searchTerm, combinedTitle);

            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                closestMatch = project.Id;
            }
        }

        return closestMatch;
    }
    async function showItems(data) {
        return new Promise((resolve) => {
            // Validate data
            if (!data || !Array.isArray(data.saleProjects)) {
                console.error('❌ Invalid data format. Expected an object with saleProjects array.');
                resolve(null); // Resolve with null if data is invalid
                return;
            }

            const { saleProjects } = data;

            // Ensure a main container exists
            let mainContainer = document.getElementById('main-container');
            if (!mainContainer) {
                console.error('❌ Main container not found. Please create a main container with ID "main-container" first.');
                resolve(null); // Resolve with null if container is missing
                return;
            }

            // Clear previous content in the main container
            mainContainer.innerHTML = '';

            // Add search input and button
            const searchContainer = document.createElement('div');
            searchContainer.style.display = 'flex';
            searchContainer.style.marginBottom = '20px';

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search items...';
            searchInput.style.flex = '1';
            searchInput.style.padding = '10px';
            searchInput.style.border = '1px solid #ddd';
            searchInput.style.borderRadius = '4px 0 0 4px';

            const searchButton = document.createElement('button');
            searchButton.textContent = 'Search';
            searchButton.style.padding = '10px 20px';
            searchButton.style.border = 'none';
            searchButton.style.borderRadius = '0 4px 4px 0';
            searchButton.style.backgroundColor = '#007BFF';
            searchButton.style.color = '#fff';
            searchButton.style.cursor = 'pointer';

            searchContainer.appendChild(searchInput);
            searchContainer.appendChild(searchButton);
            mainContainer.appendChild(searchContainer);

            // Create a grid container for items
            const itemsGrid = document.createElement('div');
            itemsGrid.id = 'items-grid';
            itemsGrid.style.display = 'grid';
            itemsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
            itemsGrid.style.gap = '20px';
            mainContainer.appendChild(itemsGrid);

            // Function to render filtered items
            function renderItems(items) {
                // Clear existing items
                itemsGrid.innerHTML = '';

                // Render each item
                items.forEach((item) => {
                    // Create a card for each item
                    const itemCard = document.createElement('div');
                    itemCard.style.border = '1px solid #ddd';
                    itemCard.style.borderRadius = '8px';
                    itemCard.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.1)';
                    itemCard.style.padding = '10px';
                    itemCard.style.backgroundColor = '#fff';
                    itemCard.style.textAlign = 'center';

                    // Add image
                    const itemImage = document.createElement('img');
                    itemImage.src = item.ImageSpecification || 'https://via.placeholder.com/250';
                    itemImage.alt = item.Title;
                    itemImage.style.width = '100%';
                    itemImage.style.borderRadius = '8px 8px 0 0';
                    itemImage.style.objectFit = 'cover';
                    itemCard.appendChild(itemImage);

                    // Add item title
                    const itemTitle = document.createElement('h3');
                    itemTitle.textContent = item.Title;
                    itemTitle.style.fontSize = '16px';
                    itemTitle.style.margin = '10px 0';
                    itemCard.appendChild(itemTitle);

                    // Add price
                    const itemPrice = document.createElement('p');
                    itemPrice.textContent = `Price: ${item.InternetPrice.toLocaleString()} IRR`;
                    itemPrice.style.color = '#007BFF';
                    itemPrice.style.fontSize = '14px';
                    itemCard.appendChild(itemPrice);

                    // Add delivery info
                    const deliveryInfo = document.createElement('p');
                    deliveryInfo.textContent = `Delivery: ${item.YearDueDeliverTitle}`;
                    deliveryInfo.style.fontSize = '12px';
                    deliveryInfo.style.color = '#555';
                    itemCard.appendChild(deliveryInfo);

                    // Add a "Select" button
                    const selectButton = document.createElement('button');
                    selectButton.textContent = 'Select';
                    selectButton.style.marginTop = '10px';
                    selectButton.style.padding = '8px 16px';
                    selectButton.style.border = 'none';
                    selectButton.style.borderRadius = '4px';
                    selectButton.style.backgroundColor = '#007BFF';
                    selectButton.style.color = '#fff';
                    selectButton.style.fontSize = '14px';
                    selectButton.style.cursor = 'pointer';

                    // Add click event to the button
                    selectButton.addEventListener('click', () => {
                        console.log('Selected Item:', item);
                        resolve(item); // Resolve the Promise with the selected item
                        mainContainer.innerHTML = ''; // Clear the main container
                    });

                    // Append the button to the item card
                    itemCard.appendChild(selectButton);

                    // Append card to grid
                    itemsGrid.appendChild(itemCard);
                });
            }

            // Initial render of all items
            renderItems(saleProjects);

            // Add event listener to the search button
            searchButton.addEventListener('click', () => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (!searchTerm) {
                    renderItems(saleProjects); // Show all items if search term is empty
                    return;
                }

                try {
                    const closestMatchId = findClosestMatchId(searchTerm, saleProjects);
                    const filteredItems = saleProjects.filter((item) => item.Id === closestMatchId);
                    mainContainer.innerHTML = ''; // Clear the main container

                    resolve(filteredItems[0]); // Render filtered items
                } catch (error) {
                    console.error("Error finding closest match:", error);
                }

            });
        });
    }
    async function sendSms() {
        const payload = {
            smsType: "Order",
            systemCode: "SaleInternet",
        };

        try {
            // Send the POST request
            const response = await axios.post(smsApi, payload, { headers });

            // Return the response data
            return response.data;
        } catch (error) {
            // Handle errors
            console.error('Error:', error.response ? error.response.data : error.message);

            // Optionally, rethrow the error for handling upstream
            throw error;
        }
    }

    async function getCaptcha(cardId){
        const payload = {
            captchaId: cardId,
            captchaType: "AgencySelect",
            saltName: "captchaText",
            token: "", // Add token dynamically if needed
            valueId: generateUUID(),
        };
        try {
            console.log('🥷 Sending POST request to:', captchaUrl);
            const response = await axios.post(captchaUrl, payload, { headers });
            return response.data
            console.log('✅ API Response:', response.data);
        } catch (error) {
            console.error('❌ API Request Failed:', error.response ? error.response.data : error.message);
        }
    }
    function createDropdown(data, labelText, id) {
        let mainContainer = document.getElementById('main-container');

        const container = document.getElementById('dropdown-container') || createContainer();

        const label = document.createElement("label");
        label.setAttribute("for", id);
        label.textContent = labelText;
        label.style.fontWeight = "bold";

        const select = document.createElement("select");
        select.id = id;
        select.style.width = "100%";
        select.style.marginBottom = "10px";
        select.style.padding = "5px";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = `Select a ${labelText}`;
        select.appendChild(defaultOption);

        data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.label;
            select.appendChild(option);
        });

        mainContainer.appendChild(label);
        mainContainer.appendChild(select);
    }

    // Function to create the container if it doesn't exist
    function createContainer() {
        const container = document.createElement("div");
        container.id = "dropdown-container";
        container.style.width = "400px";
        container.style.backgroundColor = "#f9f9f9";
        container.style.border = "1px solid #ccc";
        container.style.padding = "20px";
        container.style.zIndex = "9999";
        container.style.fontFamily = "Arial, sans-serif";
        document.body.appendChild(container);
        return container;
    }
    async function OrderInit(data) {
        let mainContainer = document.getElementById('main-container');
        const captcha = await getCaptcha(data.IdDueDeliverProg);
        // Create a container for CAPTCHA and data display
        const container = document.createElement('div');
        container.id = 'captcha-data-container';
        container.style.backgroundColor = '#fff';
        container.style.border = '2px solid #ccc';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        container.style.zIndex = '9999';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.fontSize = '14px';
        container.style.width = '350px';
        container.style.maxHeight = '400px';
        container.style.overflowY = 'auto';

        // Add title
        const title = document.createElement('h3');
        title.innerText = 'CAPTCHA & API Data';
        title.style.marginBottom = '10px';
        container.appendChild(title);

        // Add CAPTCHA SVG
        const captchaDiv = document.createElement('div');
        captchaDiv.innerHTML = captcha.capchaData; // Inject the SVG data
        captchaDiv.style.marginBottom = '10px';
        captchaDiv.style.border = '1px solid #ddd';
        captchaDiv.style.padding = '10px';
        captchaDiv.style.borderRadius = '5px';
        container.appendChild(captchaDiv);

        // Add placeholder for API data
        const apiDataInput = document.createElement('input');
        apiDataInput.id = 'api-data';
        apiDataInput.value = ''; // Sets the placeholder text or initial value
        apiDataInput.style.overflow = 'auto';
        apiDataInput.style.backgroundColor = '#f9f9f9';
        apiDataInput.style.padding = '10px';
        apiDataInput.style.border = '1px solid #ddd';
        apiDataInput.style.borderRadius = '5px';
        apiDataInput.style.width = '100%'; // Ensures it spans the container
        container.appendChild(apiDataInput);
        let captchaAnswer = ''; // Variable to store the CAPTCHA token

        // Event listener to save the input value into the constant
        apiDataInput.addEventListener('input', (event) => {
            captchaAnswer = event.target.value;
            console.log('Captcha Token:', captchaAnswer); // Logs the token for debugging
        });
        // Add container to the document body
        mainContainer.appendChild(container);

        // "Send SMS" button
        const button = document.createElement('button');
        button.textContent = 'Send Sms!';
        button.style.padding = '10px 20px';
        button.style.zIndex = '9999';  // Ensure it appears on top
        button.style.backgroundColor = '#007BFF';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';


        mainContainer.appendChild(button);

        // SMS Input
        const input = document.createElement('input');
        input.id = 'customInput';
        input.type = 'text';
        input.placeholder = 'Enter text here...';
        input.style.padding = '5px';
        input.style.marginRight = '10px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '3px';
        mainContainer.appendChild(input);

        let smsInputValue = ''; // Variable to store the input value

        // Event listener to save the input value into the constant
        input.addEventListener('input', (event) => {
            smsInputValue = event.target.value;
            console.log('Input Value:', smsInputValue); // Logs the value for debugging
        });

        // Submit Button


        const payload = {
            idDueDeliverProg: data.IdDueDeliverProg,
            valueId: generateUUID(),
        };
        // Make the POST request using Axios
        try {
            // Send the Axios POST request and wait for the response
            const Init = await axios.post(orderInit, payload, { headers });

            // Access the resolved data
            const dataInit = Init.data;

            console.log(dataInit); // Log the received data for debugging

            let selectedRow = '';
            let selectedColor = '';
            let selectedUsage = '';

            // Create dropdowns for rows, colors, and usages
            if (dataInit.rows) createDropdown(dataInit.rows, "Row", "rowsDropdown");
            if (dataInit.colors) createDropdown(dataInit.colors, "Color", "colorsDropdown");
            if (dataInit.usages) createDropdown(dataInit.usages, "Usage", "usagesDropdown");

            // Add event listeners to track dropdown selections and save values
            document.getElementById('rowsDropdown')?.addEventListener('change', (event) => {
                selectedRow = event.target.value;
                console.log('Row Selected:', selectedRow);
            });

            document.getElementById('colorsDropdown')?.addEventListener('change', (event) => {
                selectedColor = event.target.value;
                console.log('Color Selected:', selectedColor);
            });

            document.getElementById('usagesDropdown')?.addEventListener('change', (event) => {
                selectedUsage = event.target.value;
                console.log('Usage Selected:', selectedUsage);
            });
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.style.padding = '10px 20px';
            submitButton.style.backgroundColor = '#28a745';
            submitButton.style.color = '#fff';
            submitButton.style.border = 'none';
            submitButton.style.borderRadius = '5px';
            submitButton.style.cursor = 'pointer';
            submitButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            submitButton.style.marginTop = '10px';
            button.addEventListener('click', async () => {
                let lastSmsResponse;
                try {
                    // Call the sendSms function and get the response
                    const smsResponse = await sendSms();
                    console.log('SMS sent successfully:', smsResponse);

                    // Extract the mobile number from the SMS response (modify based on your API response)
                    const mobileNumber = smsResponse.mobile || 'default-number'; // Use actual response field

                    // Add a 2-second delay before making the GET request
                    setTimeout(async () => {
                        try {
                            // Make a GET request to fetch details for the number
                            lastSmsResponse = await axios.get(`https://khodro.bot1234.online/api/last-sms/09017670855`);
                            console.log('Last SMS Data:', lastSmsResponse.data);
                            const smsContent = lastSmsResponse.data?.data?.sms || "SMS content not available.";
                            console.log('Extracted SMS Content:', smsContent);

                            // Use a regular expression to extract the numeric code
                            const codeMatch = smsContent.match(/\d+/); // Matches the first sequence of digits
                            const numericCode = codeMatch ? codeMatch[0] : "Code not found"; // Get the first match or fallback
                            smsInputValue = parseInt(numericCode, 10); // Convert numericCode to an integer
                            input.value = numericCode;
                            // Optionally display the response on the page
                        } catch (error) {
                            console.error('Failed to fetch last SMS data:', error);
                            document.getElementById('responseDisplay').textContent = `Error: ${
                    error.response ? error.response.data : error.message
                        }`;
                        }
                    }, 3000); // Delay of 2 seconds (2000ms)

                } catch (error) {
                    console.error('Failed to send SMS:', error);
                    document.getElementById('responseDisplay').textContent = `Error: ${
            error.response ? error.response.data : error.message
                }`;
                }
            });
            // Attach click event to Submit button
            mainContainer.appendChild(submitButton);
            return await new Promise((resolve) => {
                submitButton.addEventListener('click', () => {
                    resolve({
                        captchatoken: captcha.token,
                        captchaanswer: captchaAnswer,
                        smsInputValue: smsInputValue,
                        agencyId: dataInit.idAgencyCode,
                        IdDueDeliverProg: data.IdDueDeliverProg,
                        selectedUsage: selectedUsage,
                        selectedColor: selectedColor,
                        agency:dataInit.rows,
                    });
                });
            });
        } catch (error) {
            // Handle errors
            console.error('Error fetching data:', error);
        }
    }

    async function AddOrderInit(data){
        const payload = {
            agency:data.agency,
            agencyId:parseInt(data.agencyId),
            agencyShow:2,
            captchaText:data.captchaanswer,
            captchaToken:data.captchatoken,
            idBank:23,
            idBaseColor:parseInt(data.selectedColor),
            idBaseUsage:parseInt(data.selectedUsage),
            quantity:1,
            responDoc:true,
            idDueDeliverProg:data.IdDueDeliverProg,
            smsKey:data.smsInputValue,
            valueId:generateUUID(),
        }
        try {
            const response = await axios.post(addOrderInit, payload, {headers });
            // Wait until the DOM is fully loaded
            const data = {
                identity: response.data.identity// Replace or fetch the real value
            };

            // Ensure the identity exists in the data
            if (data.identity) {
                // Create a form element
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://ikc.shaparak.ir/iuiv3/IPG/Index';

                // Add the identity as a hidden input field
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'tokenIdentity';
                input.value = data.identity;
                form.appendChild(input);

                // Append the form to the body
                document.body.appendChild(form);

                // Submit the form
                console.log('Submitting form with identity:', data.identity);
                form.submit();
                console.log('Response:', response.data);
            }
            return response.data; // Return the response data
        } catch (error) {
            console.error('Error occurred during POST request:', error.response?.data || error.message);
            throw error; // Re-throw the error to handle it outside this function
        }

    }
    // Add some basic styling for the container
    GM_addStyle(`
        #order-init-container button {
            margin-top: 10px;
            padding: 5px 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        #order-init-container button:hover {
            background-color: #0056b3;
        }
    `);

    async function main(){
        try {
            // Await the data from getItems
            const data = await getItems();
            const selected = await showItems(data)
            const Init = await OrderInit(selected)
            // Access and log saleProjects from the response
            await AddOrderInit(Init)
        } catch (error) {
            console.error('❌ Error in main function:', error.message);
        }
    }
    main()
})();