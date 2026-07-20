import React, { useState, useMemo, useRef, useCallback } from 'react';
import { CirclePoundSterling, ReceiptText, CreditCard, Banknote, WalletCards, Coins, HandCoins, CirclePercent} from 'lucide-react';


// Main App component for the Cash Up application
const App = () => {
    // Till float is now a fixed value of £200, as per user's request.
    const TILL_FLOAT_VALUE = 200;

    // State for cash totals per denomination entered by the user
    // Initialized to 0 for number type inputs.
    const [cashTakenTotalsByDenomination, setCashTakenTotalsByDenomination] = useState({
        '50': 0, '20': 0, '10': 0, '5': 0, '1': 0,
        '0.5': 0, '0.2': 0, '0.1': 0, '0.05': 0,
    });

    // State for the three card machine readings and their respective gratuities
    // Initialized to 0 for number type inputs.
    const [cardReadings, setCardReadings] = useState({
        card1: 0,
        gratuity1: 0,
        card2: 0,
        gratuity2: 0,
        card3: 0,
        gratuity3: 0,
        card4: 0,
        gratuity4: 0,
        card5: 0,
        gratuity5: 0,
    });

    // State for petty cash incurred (formerly expenses)
    // Initialized to 0 for number type input.
    const [pettyCash, setPettyCash] = useState(0);

    // State for the Z Report value
    // Initialized to 0 for number type input.
    const [zReport, setZReport] = useState(0);

    // State for cash gratuity input
    const [cashGratuity, setCashGratuity] = useState(0);

    // State for discounts input
    const [discounts, setDiscounts] = useState(0);

    // State for copy feedback message
    const [copyFeedback, setCopyFeedback] = useState('');

    // Ref for the summary section to enable copying its content
    const summaryRef = useRef(null);

    // Function to handle changes in any number input field
    // Converts input value to float, defaults to 0 if invalid.
    const handleNumberChange = (setter) => (e) => {
        const value = parseFloat(e.target.value);
        setter(isNaN(value) ? 0 : value);
    };

    // Function to handle changes in specific denomination total inputs
    // Converts input value to float, defaults to 0 if invalid.
    const handleDenominationTotalChange = (denomination) => (e) => {
        const value = parseFloat(e.target.value);
        setCashTakenTotalsByDenomination(prev => ({
            ...prev,
            [denomination]: isNaN(value) ? 0 : value,
        }));
    };

    // Function to handle changes for card machine readings and gratuities
    // Converts input value to float, defaults to 0 if invalid.
    const handleCardReadingChange = (field) => (e) => {
        const value = parseFloat(e.target.value);
        setCardReadings(prev => ({
            ...prev,
            [field]: isNaN(value) ? 0 : value,
        }));
    };

    // Memoized calculation for the total cash taken during the day
    const cashTakenTotal = useMemo(() => {
        return Object.values(cashTakenTotalsByDenomination).reduce((acc, val) => acc + val, 0);
    }, [cashTakenTotalsByDenomination]);

    // Memoized calculation for the actual cash takings after deducting the float
    // This value will be used in the overall difference and summary.
    const cashTakingsAfterFloat = useMemo(() => {
        return cashTakenTotal - TILL_FLOAT_VALUE;
    }, [cashTakenTotal, TILL_FLOAT_VALUE]);


    // Memoized calculation for total card payments (sum of all three card machine totals)
    const totalCardPayments = useMemo(() => {
        return cardReadings.card1 + cardReadings.card2 + cardReadings.card3 + cardReadings.card4 + cardReadings.card5;
    }, [cardReadings]);

    // Memoized calculation for total gratuity from all three card machines
    const totalCardGratuity = useMemo(() => {
        return cardReadings.gratuity1 + cardReadings.gratuity2 + cardReadings.gratuity3 + cardReadings.gratuity4 + cardReadings.gratuity5;
    }, [cardReadings]);

    // Memoized calculation for combined gratuity (Card + Cash) - for display purposes
    const totalCombinedGratuity = useMemo(() => {
        return totalCardGratuity + cashGratuity;
    }, [totalCardGratuity, cashGratuity]);

    // Memoized calculation for the overall difference based on the new provided formula:
    // (Z Report - Card Takings - Petty Cash + Card Gratuity) - Cash Takings
    const overallDifference = useMemo(() => {
        const plannedCash = zReport - totalCardPayments - pettyCash + totalCardGratuity;
        return plannedCash - cashTakingsAfterFloat;
    }, [zReport, totalCardPayments, pettyCash, totalCardGratuity, cashTakingsAfterFloat]);

    // Function to reset all fields to their initial state
    const resetAll = () => {
        setCashTakenTotalsByDenomination({
            '50': 0, '20': 0, '10': 0, '5': 0, '1': 0,
            '0.5': 0, '0.2': 0, '0.1': 0, '0.05': 0,
        });
        setCardReadings({
            card1: 0,
            gratuity1: 0,
            card2: 0,
            gratuity2: 0,
            card3: 0,
            gratuity3: 0,
            card4: 0,
            gratuity4: 0,
            card5: 0,
            gratuity5: 0,
        });
        setPettyCash(0);
        setZReport(0);
        setCashGratuity(0);
        setDiscounts(0); // Reset discounts as well
        setCopyFeedback(''); // Clear copy feedback
    };

    // List of specific denominations to be rendered for cash input
    const denominationsList = [
        '50', '20', '10', '5', '1',
        '0.5', '0.2', '0.1', '0.05',
    ];

    // Helper function to format denomination labels (e.g., 0.5 to 50p, 50 to £50)
    const formatDenominationLabel = (denom) => {
        if (parseFloat(denom) < 1) {
            return `${(parseFloat(denom) * 100).toFixed(0)}p`;
        }
        return `£${denom}`;
    };

    // Helper function to format money values with + or - sign,
    // inverting the sign for display to match user's interpretation.
    const formatSignedCurrency = (value) => {
        if (value === 0) {
            return '£0.00';
        }
        // Invert the value for display based on user's request
        const displayValue = Math.abs(value);
        let sign = '';
        if (value < 0) { // If calculated difference is negative, it's 'over' (display positive)
            sign = '+';
        } else if (value > 0) { // If calculated difference is positive, it's 'under' (display negative)
            sign = '-';
        }
        return `${sign}£${displayValue.toFixed(2)}`;
    };

    // NEW Helper function: Formats numerical values for the email body (no £ sign)
    const formatValueForEmail = (value) => {
        return value.toFixed(2);
    };

    // Function to get the display day of the week and date
    const getDisplayDayAndDate = useCallback(() => {
        const now = new Date();
        const hour = now.getHours(); // 0-23

        let displayDate = now;

        // If it's early morning (e.g., between 00:00 and 03:00), display yesterday's date
        if (hour >= 0 && hour < 3) { // Up to (but not including) 3 AM
            displayDate = new Date(now.setDate(now.getDate() - 1));
        }

        const dayOptions = { weekday: 'long' };
        const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };

        const dayOfWeek = new Intl.DateTimeFormat('en-US', dayOptions).format(displayDate);
        const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(displayDate);

        return `${dayOfWeek}, ${formattedDate}`;
    }, []);

    // Function to copy the summary content to clipboard
    const handleCopySummary = useCallback(() => {
        if (summaryRef.current) {
            const currentDisplayInfo = getDisplayDayAndDate(); // Get the current display day and date
            // Get the text content of the summary section, formatted as requested
            const summaryText = `${currentDisplayInfo}\n` + // Only day and date included here
                               `Z - £${zReport.toFixed(2)}\n` +
                               `Card - £${totalCardPayments.toFixed(2)}\n` +
                               `Cash - £${cashTakingsAfterFloat.toFixed(2)}\n` +
                               `Petty Cash - £${pettyCash.toFixed(2)}\n\n` +
                               `Gratuity\n` +
                               `Card - £${totalCardGratuity.toFixed(2)}\n` +
                               `Cash - £${cashGratuity.toFixed(2)}\n` +
                               `Total - £${totalCombinedGratuity.toFixed(2)}\n\n` +
                               `Discounts - £${discounts.toFixed(2)}\n\n` +
                               `Difference - ${formatSignedCurrency(overallDifference)}`; // Use formatSignedCurrency here

            // Use Clipboard API for modern browsers, fallback for older ones
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(summaryText)
                    .then(() => {
                        setCopyFeedback('Copied!');
                        setTimeout(() => setCopyFeedback(''), 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy text using Clipboard API: ', err);
                        // Fallback to execCommand if Clipboard API fails
                        const textarea = document.createElement('textarea');
                        textarea.value = summaryText;
                        textarea.style.position = 'fixed'; // Prevent scrolling to bottom
                        textarea.style.opacity = '0'; // Hide
                        document.body.appendChild(textarea);
                        textarea.select();
                        try {
                            const successful = document.execCommand('copy');
                            if (successful) {
                                setCopyFeedback('Copied!');
                            } else {
                                setCopyFeedback('Failed to copy!');
                            }
                        } catch (execErr) {
                            console.error('Failed to copy text using execCommand: ', execErr);
                            setCopyFeedback('Failed to copy!');
                        } finally {
                            document.body.removeChild(textarea);
                        }
                        setTimeout(() => setCopyFeedback(''), 2000);
                    });
            } else {
                // Fallback for browsers that don't support Clipboard API
                const textarea = document.createElement('textarea');
                textarea.value = summaryText;
                textarea.style.position = 'fixed'; // Prevent scrolling to bottom
                textarea.style.opacity = '0'; // Hide
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        setCopyFeedback('Copied!');
                    } else {
                        setCopyFeedback('Failed to copy!');
                    }
                } catch (err) {
                    console.error('Failed to copy text using execCommand: ', err);
                    setCopyFeedback('Failed to copy!');
                } finally {
                    document.body.removeChild(textarea);
                }
                setTimeout(() => setCopyFeedback(''), 2000);
            }
        }
    }, [getDisplayDayAndDate, zReport, totalCardPayments, pettyCash, totalCardGratuity, cashGratuity, totalCombinedGratuity, discounts, overallDifference, cashTakingsAfterFloat]);

    // Function to send summary via email
    const handleSendEmail = useCallback(() => {
        const currentDisplayInfo = getDisplayDayAndDate();
        // Set email subject to "Cash Up Summary"
        const emailSubject = encodeURIComponent("Cash Up Summary");
        const emailBody = encodeURIComponent(
            `Date = ${currentDisplayInfo}\n\n` +
            `Z = ${formatValueForEmail(zReport)}\n` +
            `Card = ${formatValueForEmail(totalCardPayments)}\n` +
            `Cash = ${formatValueForEmail(cashTakingsAfterFloat)}\n` +
            `Petty Cash = ${formatValueForEmail(pettyCash)}\n\n` +
            `Card Gratuity = ${formatValueForEmail(totalCardGratuity)}\n` +
            `Cash Gratuity = ${formatValueForEmail(cashGratuity)}\n` +
            `Total Gratuity = ${formatValueForEmail(totalCombinedGratuity)}\n\n` +
            `Discounts = ${formatValueForEmail(discounts)}\n\n` +
            `Difference = ${formatSignedCurrency(overallDifference).replace('£', '')}` // Remove '£' for email difference
        );
        // Set recipient to tabactakings@gmail.com
        const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        window.location.href = mailtoLink;
    }, [getDisplayDayAndDate, zReport, totalCardPayments, cashTakingsAfterFloat, pettyCash, totalCardGratuity, cashGratuity, totalCombinedGratuity, discounts, overallDifference]);


    return (
        <div className="min-h-screen bg-slate-100 p-4 font-sans flex items-center justify-center">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&family=Inter+Tight:ital,wght@0,100..900;1,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
                body {
                    font-family: "Source Code Pro", monospace;
                }
                /* Hide number input arrows (spinners) for Chrome, Safari, Edge, Opera */
                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                /* Hide number input arrows (spinners) for Firefox */
                input[type="number"] {
                    -moz-appearance: textfield;
                }
                `}
            </style>
            <nav className="fixed content-center w-full text-l top-0 p-4 font-bold text-gray-400 border-b border-gray-600/10 backdrop-blur-md text-center bg-gray-100/50"><div class="flex items-center text-center justify-center"><CirclePoundSterling className="w-4 h-4 mr-2" /> Cash Up</div></nav>
            <div className="p-2 rounded-xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
                

                {/* Till Float Section - Fixed value */}
                <div className="mt-10 mb p-6"> {/* Muted background */}
                    <div className="flex items-center justify-between">
                        <span className="flex items-center text-xs font-semibold text-blue-800 mb-3"><WalletCards className="w-4 h-4 mr-2" />Till Float</span>
                        <span className="flex items-center text-xs font-bold text-blue-800 mb-3">£{TILL_FLOAT_VALUE.toFixed(2)}</span>
                    </div>
                </div>

                {/* Till Count Section */}
               <h2 className="mb-0 p-6 bg-blue-950 flex items-center text-xs font-semibold text-white rounded-tl-3xl rounded-tr-3xl"><Banknote className="w-4 h-4 mr-2 text-green-300" />Till Count</h2>
                <div className="mb-6 p-6 bg-white border border-gray-200 rounded-bl-3xl rounded-br-3xl"> {/* Muted background */}
                    <div className="mb-4">
                        {denominationsList.map(denom => (
                            <div key={`taken-${denom}`} className="flex items-center justify-between py-1 border-b border-gray-200 last:border-b-0">
                                <label htmlFor={`cash-taken-${denom}`} className="w-3/4 text-blue-950 text-xs md:text-base font-medium">
                                    {formatDenominationLabel(denom)}
                                </label>
                                <input
                                    id={`cash-taken-${denom}`}
                                    type="number"
                                    step="0.01"
                                    value={cashTakenTotalsByDenomination[denom] === 0 ? '' : cashTakenTotalsByDenomination[denom]}
                                    onChange={handleDenominationTotalChange(denom)}
                                    className="w-14 p-2 rounded-md sm:text-xs border border-gray-100 text-sm text-center bg-gray-50"
                                    placeholder="0.00"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                        <span className="text-sm font-bold text-green-900">CASH TOTAL</span>
                        <span className="text-sm font-bold text-green-900">£{cashTakenTotal.toFixed(2)}</span>
                    </div>
                    {/* New Cash Takings display */}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-gray-300">
                        <span className="text-sm font-bold text-green-900">CASH TAKINGS (£{TILL_FLOAT_VALUE.toFixed(2)} off)</span>
                        <span className="text-sm font-bold text-green-900">£{cashTakingsAfterFloat.toFixed(2)}</span>
                    </div>
                </div>

                {/* Card Taken Section - Split into five machines with gratuity */}
               <h2 className="mb-0 p-6 bg-violet-950 flex items-center text-xs font-semibold text-white rounded-tl-3xl rounded-tr-3xl last:border-b-0"><CreditCard className="w-4 h-4 mr-2 text-violet-400" /> Card Machine Readings</h2>
                <div className="mb-6 p-6 bg-white border border-gray-200 rounded-br-3xl rounded-bl-3xl"> {/* Muted background */}
                    

                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={`card-machine-${i}`} className="text-left mb-4 pb-4 border-b border-gray-200 "> {/* Muted background */}
                            <h3 className="text-xs font-medium text-gray-400 mb-2">CARD MACHINE {i}</h3>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor={`card-total-${i}`} className="font-semibold text-xs text-violet-500 font-medium">Card</label>
                                <input
                                    id={`card-total-${i}`}
                                    type="number"
                                    step="0.01"
                                    value={cardReadings[`card${i}`] === 0 ? '' : cardReadings[`card${i}`]}
                                    onChange={handleCardReadingChange(`card${i}`)}
                                    className="w-14 p-2 rounded-md sm:text-xs border border-gray-100 text-sm text-center bg-gray-50 last:border-b-0"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label htmlFor={`gratuity-${i}`} className="font-semibold text-xs text-blue-950 font-medium">Gratuity</label>
                                <input
                                    id={`gratuity-${i}`}
                                    type="number"
                                    step="0.01"
                                    value={cardReadings[`gratuity${i}`] === 0 ? '' : cardReadings[`gratuity${i}`]}
                                    onChange={handleCardReadingChange(`gratuity${i}`)}
                                    className="w-14 p-2 rounded-md sm:text-xs border border-gray-100 text-sm text-center bg-gray-50 last:border-b-0"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between items-center pt-2 mt-4">
                        <span className="text-sm font-bold text-purple-800">TOTAL CARD READINGS</span>
                        <span className="text-sm font-bold text-purple-800">£{totalCardPayments.toFixed(2)}</span>
                    </div>
                </div>

                {/* Petty Cash Section */}
                <div className="pl-6 pr-6 pt-4 pb-4 mb-6 flex items-center justify-between text-xs font-bold bg-white text-indigo-800 border border-gray-200 rounded-3xl justify-between"><div class="flex items-center justify-between"><Coins className="w-4 h-4 mr-2 text-green-700" />Petty Cash</div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="petty-cash" className="text-sm text-gray-700"></label>
                            <input
                            id="petty-cash"
                            type="number"
                            step="0.01"
                            value={pettyCash === 0 ? '' : pettyCash}
                            onChange={handleNumberChange(setPettyCash)}
                            className="w-20 p-2 rounded-md sm:text-xs border border-gray-100 text-sm text-center bg-gray-50 last:border-b-0 font-normal"
                            placeholder="0.00"
                            />
                        </div>
                     </div>
               

                {/* Z Report Section */}
                <div className="mb-6 pl-6 pr-6 pt-4 pb-4 bg-white border border-gray-200 rounded-3xl"> {/* Muted background */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="z-report" className="flex items-center justify-between text-indigo-800 text-xs font-bold"><ReceiptText className="w-4 h-4 mr-2 text-violet-400" />Z Report</label>
                        <input
                            id="z-report"
                            type="number"
                            step="0.01"
                            value={zReport === 0 ? '' : zReport}
                            onChange={handleNumberChange(setZReport)}
                            className="w-20 p-2 rounded-md sm:text-xs border border-gray-100 text-sm text-center bg-gray-50 last:border-b-0 font-normal"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Gratuity Breakdown Section */}
                <div className="mb-6 bg-white border border-gray-200 rounded-3xl"> {/* Muted background */}
                    <h2 className="text-xs font-semibold text-indigo-800 mb-0 p-6 flex items-center justify-betweeen"><HandCoins className="w-4 h-4 mr-2 text-green-800" />Gratuity Breakdown</h2>
                    <div className="grid grid-cols-1 gap-2 mb-2 pl-6 pr-6">
                        <div className="flex justify-between text-xs">
                            <span className="text-blue-950">Card Gratuity Total:</span>
                            <span className="font-semibold text-indigo-700">£{totalCardGratuity.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <label htmlFor="cash-gratuity" className="text-blue-950 font-medium">Cash Gratuity:</label>
                            <input
                                id="cash-gratuity"
                                type="number"
                                step="0.01"
                                value={cashGratuity === 0 ? '' : cashGratuity}
                                onChange={handleNumberChange(setCashGratuity)}
                                className="w-14 p-2 rounded-md sm:text-xs border border-gray-100 text-sm text-center bg-gray-50"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 text-sm pt-4 pb-6 pl-6 pr-6">
                        <span className="text-sm font-bold text-indigo-800 ">TOTAL COMBINED GRATUITY</span>
                        <span className="text-sm font-bold text-indigo-800 align-right">£{totalCombinedGratuity.toFixed(2)}</span>
                    </div>
                </div>

                {/* Discounts Section */}
                <div className="mb-6 pl-6 pr-6 pt-4 pb-4 bg-white border border-gray-200 rounded-3xl">{/* Muted background */}
                    <h2 className="text-xs font-semibold text-indigo-800 mb-3 flex items-center justify-betweeen"><CirclePercent className="w-4 h-4 mr-2 text-green-800" /> Discounts</h2>
                    <div className="flex items-center justify-between">
                        <label htmlFor="discounts" className="text-blue-950 font-medium text-xs">Total Discounts</label>
                        <input
                            id="discounts"
                            type="number"
                            step="0.01"
                            value={discounts === 0 ? '' : discounts}
                            onChange={handleNumberChange(setDiscounts)}
                            className="w-14 p-2 rounded-md sm:text-xs border border-gray-100 text-sm text-center bg-gray-50 last:border-b-0 font-normal"
                            placeholder="0.00"
                        />
                    </div>
                </div>


                {/* Summary Section */}
                <div ref={summaryRef} className=" mb-6 pt-4 pb-8 bg-gray-200 border-gray-300 border rounded-3xl relative pl-6 pr-6"> {/* Muted background */}
                    <h2 className="text-sm font-semibold text-gray-800 mb-1">Summary</h2>
                    <p className="text-sm font-medium text-gray-700 mb-3">{getDisplayDayAndDate()}</p>
                    <div className="grid grid-cols-1 gap-1 text-base text-xs">
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Z -</span>
                            <span className="font-bold text-gray-900">£{zReport.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Card -</span>
                            <span className="font-bold text-gray-900">£{totalCardPayments.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Cash -</span>
                            <span className="font-bold text-gray-900">£{cashTakingsAfterFloat.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Petty Cash -</span>
                            <span className="font-bold text-gray-900">£{pettyCash.toFixed(2)}</span>
                        </div>

                        <div className="mt-3">
                            <span className="font-semibold text-gray-700">Gratuity</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Card -</span>
                            <span className="font-bold text-gray-900">£{totalCardGratuity.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Cash -</span>
                            <span className="font-bold text-gray-900">£{cashGratuity.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Total -</span>
                            <span className="font-bold text-gray-900">£{totalCombinedGratuity.toFixed(2)}</span>
                        </div>

                        <div className="mt-3 flex justify-between">
                            <span className="font-semibold text-gray-700">Discounts -</span>
                            <span className="font-bold text-gray-900">£{discounts.toFixed(2)}</span>
                        </div>

                        <div className="mt-3 flex justify-between pt-2 border-t border-gray-300">
                            <span className="font-semibold text-gray-700">Difference -</span>
                            <span className="font-bold text-gray-900">{formatSignedCurrency(overallDifference)}</span>
                        </div>
                    </div>
                    {/* Feedback message for copy */}
                    {copyFeedback && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded animate-fade-in-out">
                            {copyFeedback}
                        </div>
                    )}
                </div>

                {/* Overall Difference / Reconciliation Section */}
                <div className="mb-6 p-4 rounded-3xl text-center"
                    style={{ backgroundColor: overallDifference === 0 ? '#e6ffe6' : (overallDifference > 0 ? '#ffe6e6' : '#e6ffe6') }}> {/* Muted colors: Green for balanced/over, Red for under */}
                    <h2 className="text-center text-xs font-semibold text-gray-800 mb-3">Overall Difference</h2>
                    <div className="text-center">
                        <span className={`text-xl text-center font-extrabold ${
                            overallDifference === 0 ? 'text-black' : (overallDifference > 0 ? 'text-red-700' : 'text-green-700') // Green for over, Red for under
                        }`}>
                            {formatSignedCurrency(overallDifference)}
                        </span>
                    </div>
                    <p className={`text-sm mt-2 text-center text-center ${
                        overallDifference === 0 ? 'text-black' : (overallDifference > 0 ? 'text-red-600' : 'text-green-600') // Green for over, Red for under
                    }`}>
                        {overallDifference === 0 ? 'Balanced!' : (overallDifference > 0 ? 'Under' : 'Over')} {/* Text adjusted */}
                    </p>
                </div>


                {/* Reset and Copy Buttons */}
                <div className="flex justify-center mt-6 space-x-4">
                    <button
                        onClick={resetAll}
                        className="w-1/3 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-200 ease-in-out"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleCopySummary}
                        className="w-1/3 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition duration-200 ease-in-out"
                    >
                        Copy
                    </button>
                    <button
                        onClick={handleSendEmail}
                        className="w-1/3 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 transition duration-200 ease-in-out"
                    >
                        Email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
