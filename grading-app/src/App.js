import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function App() {
  const [total, setTotal] = useState();
  const [copies, setCopies] = useState();
  const [marksLost, setMarksLost] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [calculationDone, setCalculationDone] = useState(false);
  const [serialNumber, setSerialNumber] = useState(1);
  const [inputStage, setInputStage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        // Trigger the appropriate action based on the current stage
        if (inputStage === 1 && copies > 0) {
          handleNextInput();
        } else if (inputStage === 2 && total > 0) {
          handleNextInput();
        } else if (inputStage === 3 && marksLost !== '') {
          handleCalculate();
        } else if (calculationDone) {
          handleReset();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [copies, marksLost, total, inputStage, calculationDone]);

  const handleCalculate = () => {
    if (marksLost === '' || total === 0 || copies <= 0) return;

    const marksLostValue = parseInt(marksLost);
    if (marksLostValue < 0 || marksLostValue > total) {
      setErrorMessage('Marks lost cannot be negative or equal to/exceed total marks.');
      setMarksLost('');
      return;
    }

    const remainingMarks = total - marksLostValue;
    const percentage = (remainingMarks / total) * 100;

    let grade = '';
    if (percentage >= 90 && percentage <= 100) grade = 'A*';
    else if (percentage >= 80 && percentage < 90) grade = 'A';
    else if (percentage >= 70 && percentage < 80) grade = 'B';
    else if (percentage >= 60 && percentage < 70) grade = 'C';
    else if (percentage >= 50 && percentage < 60) grade = 'D';
    else if (percentage >= 40 && percentage < 50) grade = 'E';
    else grade = 'U';

    const newResult = { serial: serialNumber, num: remainingMarks, percent: percentage.toFixed(2), grade };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    setSerialNumber(serialNumber + 1);

    // Decrease the copies count after each calculation
    setCopies(copies - 1);

    // Once all copies are calculated
    if (copies - 1 === 0) {
      calculateStats(updatedResults);
      setCalculationDone(true);
    }

    // Reset marksLost input for the next entry
    setMarksLost('');
    setErrorMessage('');
  };

  const calculateStats = (results) => {
    const marks = results.map(result => result.num);
    const totalMarks = marks.reduce((sum, mark) => sum + mark, 0);
    const avgMarks = (totalMarks / marks.length).toFixed(2);
    const highestMarks = Math.max(...marks);
    const lowestMarks = Math.min(...marks);

    setStats({
      average: avgMarks,
      highest: highestMarks,
      lowest: lowestMarks
    });
  };

  const handleReset = () => {
    setTotal();
    setCopies();
    setMarksLost('');
    setResults([]);
    setStats(null);
    setCalculationDone(false);
    setSerialNumber(1);
    setInputStage(1);
    setErrorMessage(''); // Reset error message
  };

  const handleNextInput = () => {
    setInputStage(inputStage + 1); // Move to the next input field
    setErrorMessage(''); // Reset error message on moving to the next input
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Grading Results", 14, 16);
    const tableColumn = ["No.", "Marks", "Percentage", "Grade"];
    const tableRows = results.map(result => [
      result.serial,
      result.num,
      `${result.percent}%`,
      result.grade
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("grading-results.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-4xl font-bold text-center mb-8 text-emerald-300">Grading Calculator</h1>

        {errorMessage && (
          <div className="bg-red-300 text-red-900 p-3 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

        {!calculationDone && (
          <>
            {/* Stage 1: Number of Copies */}
            {inputStage === 1 && (
              <div className="mb-4">
                <label className="block text-emerald-400 font-semibold mb-2">Number of Copies</label>
                <input
                  type="number"
                  value={copies}
                  onChange={(e) => setCopies(parseInt(e.target.value))}
                  className="w-full mt-2 p-3 bg-slate-700 text-emerald-200 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200 appearance-none"
                />
                <button
                  onClick={handleNextInput}
                  className="w-full mt-4 bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
                  disabled={copies <= 0}
                >
                  Next
                </button>
              </div>
            )}

            {/* Stage 2: Total Marks */}
            {inputStage === 2 && (
              <div className="mb-4">
                <label className="block text-emerald-400 font-semibold mb-2">Total Marks</label>
                <input
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(parseInt(e.target.value))}
                  className="w-full mt-2 p-3 bg-slate-700 text-emerald-200 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200 appearance-none"
                />
                <button
                  onClick={handleNextInput}
                  className="w-full mt-4 bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
                  disabled={total <= 0}
                >
                  Next
                </button>
              </div>
            )}

            {/* Stage 3: Marks Lost */}
            {inputStage === 3 && (
              <div className="mb-4">
                <label className="block text-emerald-400 font-semibold mb-2">Marks Lost</label>
                <input
                  type="number"
                  value={marksLost}
                  onChange={(e) => setMarksLost(e.target.value)}
                  className="w-full mt-2 p-3 bg-slate-700 text-emerald-200 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200 appearance-none"
                />
                <button
                  onClick={handleCalculate}
                  className="w-full mt-4 bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
                >
                  Calculate
                </button>
              </div>
            )}

            {results.length > 0 && copies > 0 && inputStage === 3 && (
              <div className="mt-5 p-4 bg-teal-300 rounded-md shadow-sm">
                <h2 className="text-lg font-bold text-gray-700">Latest Calculation</h2>
                <p><strong>Serial Number:</strong> {results[results.length - 1].serial}</p>
                <p><strong>Remaining Marks:</strong> {results[results.length - 1].num}</p>
                <p><strong>Percentage:</strong> {results[results.length - 1].percent}%</p>
                <p><strong>Grade:</strong> {results[results.length - 1].grade}</p>
              </div>
            )}
          </>
        )}

        {calculationDone && results.length > 0 && (
          <>
            <h2 className="text-lg font-bold mb-4 text-emerald-300">Results</h2>

            <button
              onClick={downloadPDF}
              className="w-full mb-4 bg-blue-500 text-white py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Download PDF
            </button>

            <table className="w-full min-h-full bg-slate-800 text-emerald-300 border rounded-md overflow-hidden shadow-sm">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-center">No. </th>
                  <th className="px-4 py-2 text-center">Marks</th>
                  <th className="px-4 py-2 text-center">Percentage</th>
                  <th className="px-4 py-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-t text-center">
                    <td className="px-5 py-2">{result.serial}</td>
                    <td className="px-5 py-2">{result.num}</td>
                    <td className="px-5 py-2">{result.percent}%</td>
                    <td className="px-5 py-2">{result.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {stats && (
              <div className="mt-4 bg-slate-800 border border-slate-800 rounded-md overflow-hidden shadow-sm">
                <h3 className="text-lg font-bold text-emerald-300 ">
                  Average: {stats.average}
                </h3>
                <h3 className="text-lg font-bold text-emerald-300 ">
                  Highest: {stats.highest}
                </h3>
                <h3 className="text-lg font-bold text-emerald-300 ">
                  Lowest: {stats.lowest}
                </h3>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full mt-4 bg-red-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
