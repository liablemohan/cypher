import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import './App.css';

function App() {
  //creating currency objects
  const currencySymbols = {
    "usd": '$',
    "eur": '€',
    "gbp": '£',
    "inr": '₹',
    
  };

  //M,B,K value object
  const amountOptions = {
    '▷':'',
    K: 1e3,
    M: 1e6,
    B: 1e9,
  }
  // State initialization
  const [info, setInfo] = useState({});
  const [input, setInput] = useState('');
  const [from, setFrom] = useState('usd');
  const [to, setTo] = useState('inr');
  const [options, setOptions] = useState([]);
  const [output, setOutput] = useState(0);
  const [amtdrpdwn, setAmtDrpDwn] = useState('');
  const [valinput, setValInput] = useState('');
  
  //Fetch currency exchange rates
  useEffect(() => {
    Axios.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`)
      .then((res) => {
        setInfo(res.data[from]);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      });
  }, [from]);

  // Set dropdown options
  useEffect(() => {
    setOptions(
      Object.keys(currencySymbols).map((currency) => ({
        value: currency,
        label: `${currencySymbols[currency]} ${currency}`
      }))
    );
    convert();
  }, [to]);

  //Conversion function
  function convert() {
    const rate = info[to];
    if (amtdrpdwn === '') {
      const inputAmount = parseFloat(input) || 0; //Convert input to number, handle black amounts
      const convertedValue = inputAmount * rate || 0;
      setOutput(convertedValue.toFixed(2)); //Format to two decimal places
    } else{
      const convertedValue = parseFloat(valinput) * rate ||0;
      setOutput(convertedValue.toFixed(2));//Format to two decimal places
    }
    
  }

  //Currency symbol swap
  function flip() {
    const temp = from;
    setFrom(to);
    setTo(temp);
  }

  // Currency selection handlers
  const handleDropdownChange = (e, isFromDropdown) => {
    const selectedValue = e.target.value;
    if (isFromDropdown) {
      setFrom(selectedValue);
    } else {
      setTo(selectedValue);
    }
  };

  // Amount dropdown handler
  const handleAmountDropdown = (selectedAmount) => {
    setAmtDrpDwn(selectedAmount); //Update amtdrpdwn value
    if (input) {
      setValInput((parseFloat(input) * selectedAmount).toString());//Update valinput value
    }
  };

  //Handler for default buttons
  const handleButtonClick = (amount, unit) => {
    setInput(amount.toString()); // Update input value
    setAmtDrpDwn(unit.toString()); //Update amtdrpdwn value
    if(unit){
      setValInput((parseFloat(amount) * amountOptions[unit]).toString()); // Update valinput value
    }
  };

  //This resets input each time a user click on input
  function reset(){
    setOutput(0);
    setInput('');
  }

  //// Output for USD: "123 Million" Output for INR: "12 Crore"
  function roundToLargestDenomination(number, currency) {
    if(number === 0) {
      return "0";
    }

    // Denominations based on currency
    const denominations = {
        usd: ['', ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', ' Sextillion', ' Septillion', ' Octillion', ' Nonillion', ' Decillion', ' Undecillion', ' Duodecillion', ' Tredecillion', ' Quattuordecillion', ' Quindecillion', ' Sexdecillion', ' Septendecillion', ' Octodecillion', ' Novemdecillion', ' Vigintillion'],
        gbp: ['', ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', ' Sextillion', ' Septillion', ' Octillion', ' Nonillion', ' Decillion', ' Undecillion', ' Duodecillion', ' Tredecillion', ' Quattuordecillion', ' Quindecillion', ' Sexdecillion', ' Septendecillion', ' Octodecillion', ' Novemdecillion', ' Vigintillion'],
        eur: ['', ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', ' Sextillion', ' Septillion', ' Octillion', ' Nonillion', ' Decillion', ' Undecillion', ' Duodecillion', ' Tredecillion', ' Quattuordecillion', ' Quindecillion', ' Sexdecillion', ' Septendecillion', ' Octodecillion', ' Novemdecillion', ' Vigintillion'],
        inr: ['','Thousand','Lakh', 'Crore', 'Hundred Crore', 'Ten Thousand Crore', 'Ten Lakh Crore', 'Padma', 'Shankh', 'Maha-Shankh']
    };

    // Determine the denominations array based on the currency
    const denomArray = denominations[currency];

    // Find the index of the largest denomination
    const largestIndex = Math.floor(Math.log10(Math.abs(number)) / 3);

    // Get the rounded value by dividing by 10^(3 * largestIndex) and then rounding it
    const roundedValue = Math.round(number / Math.pow(10, 3 * largestIndex));

    // If the rounded value is 1000 or greater, update the largest index
    const newLargestIndex = Math.floor(Math.log10(roundedValue) / 3);
    if (newLargestIndex > largestIndex) {
        return `${roundedValue / Math.pow(10, 3 * newLargestIndex)} ${denomArray[newLargestIndex]}`;
    }

    // Otherwise, return the rounded value with the largest denomination
    return `${roundedValue} ${denomArray[largestIndex]}`;
  }

  // Comma format
  function formatComma(number,to) {
    //Check if the currency is INR (Indian Rupees)
    if(to === 'inr') {
      //Format the number according to the Indian number system
      //For INR, use commas as separators for thousands, lakhs, crores, etc.
      const formattedNumber = new Intl.NumberFormat('en-IN').format(number);
      return formattedNumber;
    } else{
      //For other currencies, use the standard international number format
      //without converting the digits into words
      const formattedNumber = new Intl.NumberFormat('en-US', {maximumFractionDigits:2}).format(number);
      return formattedNumber;
    }
  }

  // Output for USD: "1 Million 234 Thousand 567 and 89 Decimal"
  function internationalSystem(number) {
    const numStr = number.toString();

    // Split the number into integer and decimal parts
    const [integerPart, decimalPart] = numStr.split('.');

    // Format the integer part
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Initialize an array to hold the expanded form
    const expandedForm = [];

    // Denominations based on currency
    const denominations = {
        usd: ['', ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', ' Sextillion', ' Septillion', ' Octillion', ' Nonillion', ' Decillion', ' Undecillion', ' Duodecillion', ' Tredecillion', ' Quattuordecillion', ' Quindecillion', ' Sexdecillion', ' Septendecillion', ' Octodecillion', ' Novemdecillion', ' Vigintillion'],
        gbp: ['', ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', ' Sextillion', ' Septillion', ' Octillion', ' Nonillion', ' Decillion', ' Undecillion', ' Duodecillion', ' Tredecillion', ' Quattuordecillion', ' Quindecillion', ' Sexdecillion', ' Septendecillion', ' Octodecillion', ' Novemdecillion', ' Vigintillion'],
        eur: ['', ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', ' Sextillion', ' Septillion', ' Octillion', ' Nonillion', ' Decillion', ' Undecillion', ' Duodecillion', ' Tredecillion', ' Quattuordecillion', ' Quindecillion', ' Sexdecillion', ' Septendecillion', ' Octodecillion', ' Novemdecillion', ' Vigintillion'],
    };

    // Handle the integer part
    if (formattedIntegerPart !== '') {
        const integerPartDigits = formattedIntegerPart.split(',').map(Number);

        for (let i = integerPartDigits.length - 1; i >= 0; i--) {
            if (integerPartDigits[i] !== 0) {
                expandedForm.unshift(`${integerPartDigits[i]} ${denominations[to][integerPartDigits.length - i - 1]}`);
            }
        }
    }
    return expandedForm.join(' ');
  }

  // "twelve lakh crore thirty-four thousand crore five hundred and sixty-seven crore eighty-nine lakh twelve thousand three hundred and twenty-three point five six"
  // Arrays to store number words
  const one = [
      "", "one", "two", "three", "four",
      "five", "six", "seven", "eight",
      "nine", "ten", "eleven", "twelve",
      "thirteen", "fourteen", "fifteen",
      "sixteen", "seventeen", "eighteen",
      "nineteen"
  ];
  
  const ten = [
      "", "", "twenty", "thirty", "forty",
      "fifty", "sixty", "seventy", "eighty",
      "ninety"
  ];
  
  /**
   * Convert a 1- or 2-digit number into words
   * @param {number} n - The number to convert
   * @param {string} s - The suffix to append
   * @return {string} The word representation of the number
   */
  function numToWords(n, s) {
      let str = "";
      if (n > 19) {
          str += ten[Math.floor(n / 10)] + " " + one[n % 10];
      } else {
          str += one[n];
      }
    
      if (n !== 0) {
          str += " " + s;
      }
    
      return str.trim();
  }
  
  /**
   * Convert a given integer number into words
   * @param {number} n - The number to convert
   * @return {string} The word representation of the number
   */
  function convertIntegerToWords(n) {
      let out = "";
  
      const lakhCrore = Math.floor(n / 100000000000);
      if (lakhCrore > 0) {
          out += lakhCrore + " lakh crore ";
          n %= 100000000000;
      }
    
      const thousandCrore = Math.floor(n / 10000000000);
      if (thousandCrore > 0) {
          out += thousandCrore + " thousand crore ";
          n %= 10000000000;
      }
    
      const hundredCrore = Math.floor(n / 1000000000);
      if (hundredCrore > 0) {
          out += hundredCrore + " hundred crore ";
          n %= 1000000000;
      }
    
      const crore = Math.floor(n / 10000000);
      if (crore > 0) {
          out += crore + " crore ";
          n %= 10000000;
      }
    
      const lakh = Math.floor(n / 100000);
      if (lakh > 0) {
          out += lakh + " lakh ";
          n %= 100000;
      }
    
      const thousand = Math.floor(n / 1000);
      if (thousand > 0) {
          out += thousand + " thousand ";
          n %= 1000;
      }
    
      const hundred = Math.floor(n / 100);
      if (hundred > 0) {
          out += n% 1000;
      }
    
      return out.trim();
  }
  
  /**
   * Convert a given number with decimals into words
   * @param {number} num - The number to convert
   * @return {string} The word representation of the number
   */
  function convertToWords(num) {
      const integerPart = Math.floor(num);
      const fractionalPart = num % 1;
      let result = convertIntegerToWords(integerPart);
      
      return result.trim();
  }

  // Comma format
  function formatExpansion(number, currency) {
    //Check if the currency is INR (Indian Rupees)
    if(currency === 'inr') {
      const formattedNumber = convertToWords(number);
      return formattedNumber;
    } else{
      const formattedNumber = internationalSystem(number);
      return formattedNumber;
    }
  }

  //To give the bar to denomination format
  function extractDenominations(inputString){
    //Split the input string by spaces
    const parts = inputString.split(' ');

    //Initialize an array to store extracted denominations
    const extractedDenominations = [];

    //Iterate through the parts to extract denominations
    for(let i = 1; i < parts.length; i +=2) {
      extractedDenominations.push(parts[i]);
    }

    //Return the extracted denominations array
    return extractedDenominations.join(' ');
  }

  //To display current unit rates
  function currentRates(){
    if (!info || !info[to]) {
      return 'Conversion rate not available';
    }
    const conversionRates = info[to].toFixed(2);
    return conversionRates;
  }

  //Calling Result format function
  const formattedOutput = roundToLargestDenomination(output, to);
  const formattedComma = formatComma(output, to);
  const formattedExpand = formatExpansion(output,to);
  const commaDenominations = extractDenominations(formattedExpand);

  

  const conversionRates = currentRates();
  

  // Render JSX
  return(
    <section>
      <div className="w-layout-blockcontainer container-4 w-container">
        <h1 className="heading">Cypher</h1>
        <div className="welcome">Welcome to World&#x27;s the Smartest Currency Convertor</div>
        <div className="columns w-row">
            <div className="column w-col w-col-4 w-col-medium-4 w-col-small-small-stack w-col-tiny-tiny-stack">
                <div className="div-block">
                    <div className="group">
                        <input type="text" placeholder="amount" value={input} onClick={() => reset()} onChange={(e) => setInput(e.target.value)}></input>
                        <select className="select" onChange={(e) => handleAmountDropdown(e.target.value)}>
                        {Object.keys(amountOptions).map((key) => (<option key={key} value={amountOptions[key]}>{key}</option>
                        ))}</select>
                    </div>
                </div>
            </div>
            <div className="column-2 w-col w-col-4 w-col-medium-4 w-col-small-small-stack w-col-tiny-tiny-stack">
                <div className="div-block-2">
                    <div id="w-node-_3e92910c-b19b-1a3c-f167-615031a2e2f0-e8939152" className="w-layout-layout quick-stack-2 wf-layout-layout">
                        <div id="w-node-_3e92910c-b19b-1a3c-f167-615031a2e2f0-e8939152" className="w-layout-cell">
                            <div id="w-node-_7277961e-cbd4-406b-9471-ae7addedc868-e8939152" className="w-layout-blockcontainer container-6 w-container">
                                <div id="w-node-_89cde449-1cde-4a57-91bf-42a4c567c454-e8939152" className="w-layout-blockcontainer w-container">
                                    <div data-hover="false" data-delay="0" className="dropdown w-dropdown">
                                        <select className="button default drpdwn w-dropdown-toggle" value={from} onChange={(e) =>
                                            handleDropdownChange(e,true)}>
                                                {options.map((currency) => (
                                                    <option className="w-dropdown-list" key={currency.value} value={currency.value}>{currency.label}</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                                <div id="w-node-abe59c32-e3d2-9312-1e87-7019167d4c0b-e8939152" className="w-layout-blockcontainer w-container">
                                    <button className="button default swap w-button" onClick={flip}>&#8652;</button>
                                </div>
                                <div id="w-node-a89fea2f-703c-3011-df95-bfd5ab7c7171-e8939152" className="w-layout-blockcontainer w-container">
                                    <div data-hover="false" data-delay="0" className="dropdown w-dropdown">
                                        <select className="button default drpdwn w-dropdown-toggle" value={to} onChange={(e) =>
                                            handleDropdownChange(e,false)}>
                                                {options.map((currency) => (
                                                    <option className="w-dropdown-list" key={currency.value} value={currency.value}>{currency.label}</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="w-node-_33e16082-1303-0938-0174-37ae91d057e8-e8939152" className="w-layout-cell cell-3">
                            <div className="text-block-9">1 {currencySymbols[from]} = {conversionRates} {currencySymbols[to]}</div>
                            <button id="convert" onClick={convert} className="button convert w-button">Convert</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="column-3 w-col w-col-4 w-col-medium-4 w-col-small-small-stack w-col-tiny-tiny-stack">
                <div className="div-block-3">
                    <div id="w-node-_764f6d7e-5533-4cf2-b4ec-835c237987e9-e8939152" className="w-layout-layout quick-stack wf-layout-layout">
                        <div id="w-node-_764f6d7e-5533-4cf2-b4ec-835c237987e9-e8939152" className="w-layout-cell cell-5">
                            <div id="w-node-_56573cdd-da09-576d-eb3c-3dfb4894c6df-e8939152" className="w-layout-layout quick-stack-3 wf-layout-layout">
                                <div id="w-node-_56573cdd-da09-576d-eb3c-3dfb4894c6df-e8939152" className="w-layout-cell cell-4">
                                    <div className="text-block-8">{formattedComma}  {currencySymbols[to]}</div>
                                </div>
                                <div id="w-node-_2615652a-df62-8a97-6644-66a77d8ac02b-e8939152" className="w-layout-cell">
                                    <div className="text-block-3">{commaDenominations}</div>
                                </div>
                            </div>
                        </div>
                        <div id="w-node-_56706838-ca01-8549-bfd3-f2948be09e49-e8939152" className="w-layout-cell cell">
                            <div className="text-block-5">{formattedOutput} {currencySymbols[to]}</div>
                        </div>
                        <div id="w-node-_321e818e-ff56-0644-1d20-f4d6f0c76b94-e8939152" className="w-layout-cell">
                            <div className="text-block-7">{formattedExpand} {currencySymbols[to]}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="w-layout-grid grid-2">
            <button id="w-node-_7a3c5458-0733-5c1d-9aaf-4336b6c56691-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(1e6, 'M')}><strong>1 M</strong></button>
            <button id="w-node-_1053db9b-723b-9c3e-4ade-b79321cb7d35-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(5e7, 'M')}><strong>50 M</strong></button>
            <button id="w-node-b73916c6-44f6-2b4f-62ec-5b6006f91e14-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(25e7, 'M')}><strong>250 M</strong></button>
            <button id="w-node-fefc8c22-fa6d-bbd3-bc21-dde80fc70eec--e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(1e9, 'B')}><strong>1 B</strong></button>
            <button id="w-node-_7510c4ac-5901-415a-5d5b-c994e75db2bd-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(5e10, 'B')}><strong>50 B</strong></button>
            <button id="w-node-_024b85c4-0aa2-0851-9a76-e9882g159347-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(1e7, 'M')}><strong>10 M</strong></button>
            <button id="w-node-_7bd81e70-ed0c-1999-c3eb-0fe78e0273ab-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(1e8, 'M')}><strong>100 M</strong></button>
            <button id="w-node-f677279e-ed45-97bd-4dec-0719a5287736-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(5e8, 'M')}><strong>500 M</strong></button>
            <button id="w-node-_3df17a6a-a4b7-2d51-7204-af8a2ab1261c-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(1e10, 'B')}><strong>10 B</strong></button>
            <button id="w-node-ba0eab7d-67c4-3b51-6297-f466ce3b8c04-e8939152" href="#" className="button default w-button" onClick={() => handleButtonClick(1e11, 'B')}> <strong>100 B</strong></button>
        </div>
      </div>   
    </section>
  )
}

export default App;