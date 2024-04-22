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
    '':'',
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
  }

  //// Output for USD: "123 Million" Output for INR: "12 Crore"
  function roundToLargestDenomination(number, currency) {
    if(number === 0) {
      return "0";
    }

    // Denominations based on currency
    const denominations = {
        usd: ['Thousand', 'Million', 'Billion', 'Trillion'],
        gbp: ['Thousand', 'Million', 'Billion', 'Trillion'],
        eur: ['Thousand', 'Million', 'Billion', 'Trillion'],
        inr: ['Lakh', 'Crore', 'Arab', 'Kharab', 'Neel', 'Padma', 'Shankh', 'Maha-Shankh']
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
  function formatComma(number, to) {
    // Convert number to string
    const numStr = number.toString();

    // Separate the decimal part, if any
    let afterPoint = '';
    const decimalIndex = numStr.indexOf('.');
    if (decimalIndex > 0)
       afterPoint = numStr.substring(decimalIndex);

    // Remove decimal part and convert to integer
    const integerPart = Math.floor(number).toString();

    // Format the integer part with commas for thousands separator
    let formattedIntegerPart = '';
    for(let i = integerPart.length -1, j = 0; i >= 0; i--, j++) {
      if(j > 0 && j % 3 === 0) {
        formattedIntegerPart = ',' + formattedIntegerPart;
      }
      formattedIntegerPart = integerPart[i] + formattedIntegerPart;
    }

    // Use currency-specific formatting for INR
    if (to === 'inr') {
        // Add INR symbol
        return formattedIntegerPart + afterPoint;
    }

    // Use general formatting for other currencies
    return formattedIntegerPart + afterPoint;
  }


  // Output for INR: "12 Lakh 34 Thousand 567 and 89 Decimal" 
  // Output for USD: "1 Million 234 Thousand 567 and 89 Decimal"
  function formatNumberExpanded(number, to) {
    const numStr = number.toString();

    // Split the number into integer and decimal parts
    const [integerPart, decimalPart] = numStr.split('.');

    // Format the integer part
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Initialize an array to hold the expanded form
    const expandedForm = [];

    // Denominations based on currency
    const denominations = {
        usd: ['', 'Thousand', 'Million', 'Billion', 'Trillion'],
        gbp: ['', 'Thousand', 'Million', 'Billion', 'Trillion'],
        eur: ['', 'Thousand', 'Million', 'Billion', 'Trillion'],
        inr: ['', 'Lakh', 'Crore', 'Arab', 'Kharab', 'Neel', 'Padma', 'Shankh', 'Maha-Shankh']
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

    // Handle the decimal part, if any
    //if (decimalPart) {
    //    expandedForm.push(`${decimalPart} Decimal`);
    //}

    //// Join the expanded form array with 'and' between each part
    //const formattedOutput = expandedForm.join(' and ');

    //Return the formatted interger part only if it exists
    return expandedForm.join(' ');
  }


  //Calling Result format function
  const formattedOutput = roundToLargestDenomination(output, to);
  const formattedComma = formatComma(output, to);
  const formattedExapansion = formatNumberExpanded(output, to);

  

  // Render JSX
  return(
    <div classsName="App">
        <div className="heading">
            <h1 className="glow">Cypher</h1>
            <p>Welcome to the World's Smartest Currency Converter</p>
        </div>
        <div className="container">
            <div className="left">
                <h3>Amount</h3>
                <div className="group">
                    <input type="text" placeholder="amount" value={input} onClick={() => reset()} onChange={(e) => setInput(e.target.value)}></input>
                    <select className="select" onChange={(e) => handleAmountDropdown(e.target.value)}>
                    {Object.keys(amountOptions).map((key) => (<option key={key} value={amountOptions[key]}>{key}</option>
                    ))}
                  </select>
                </div> 
            </div>
            <div className="middle">
                <h3>From</h3>
                <select value={from} onChange={(e) =>
                handleDropdownChange(e,true)}>
                    {options.map((currency) => (
                        <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                </select>
            </div>
            <div className="right">
                <h3>To</h3>
                <select value={to} onChange={(e) =>
                handleDropdownChange(e,false)}>
                    {options.map((currency) => (
                        <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="container">
            <button onClick={convert}>Convert</button>
            <button className="switch" onClick={flip}>&#8652;</button>
        </div>
        <div className="result">
            <h2>Converted Amount:</h2>
            <p>
            {formattedOutput} {currencySymbols[to]} 
            </p>
            <p>
            {formattedComma}  {currencySymbols[to]}
            </p>
            <p>
            {formattedExapansion} {currencySymbols[to]} 
            </p>
        </div>
        <div className="default-values container">
            <button className="default-button left" onClick={() => handleButtonClick(1, 'M')}>1M</button>
            <button className="default-button middle" onClick={() => handleButtonClick(50, 'M')}>50M</button>
            <button className= "default-button right" onClick={() => handleButtonClick(250, 'M')}>250M</button>
            <button className="default-button right" onClick={() => handleButtonClick(1, 'B')}>1B</button>
            <button className="default-button right" onClick={() => handleButtonClick(50, 'B')}>50B</button>
        </div>
        <div className="default-values container">
            <button className="default-button left" onClick={() => handleButtonClick(10, 'M')}>10M</button>
            <button className="default-button middle" onClick={() => handleButtonClick(100, 'M')}>100M</button>
            <button className="default-button right" onClick={() => handleButtonClick(500, 'M')}>500M</button>
            <button className="default-button right" onClick={() => handleButtonClick(10, 'B')}>10B</button>
            <button className="default-button right" onClick={() => handleButtonClick(100, 'B')}>100B</button>
        </div>
    </div>
  )
}

export default App;