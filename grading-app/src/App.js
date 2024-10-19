import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function App() {
  const [total, setTotal] = useState('');
  const [copies, setCopies] = useState('');
  const [marksLost, setMarksLost] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [calculationDone, setCalculationDone] = useState(false);
  const [serialNumber, setSerialNumber] = useState(1);
  const [inputStage, setInputStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [subject, setSubject] = useState('Chemistry');
  const [level, setLevel] = useState("O'Level");

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        handleEnterPress();
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [copies, marksLost, total, inputStage, calculationDone]);

  const handleEnterPress = () => {
    if (inputStage === 0) {
      handleNextInput(); // Moving to the next input stage
    } else if (inputStage === 1 && copies > 0) {
      handleNextInput();
    } else if (inputStage === 2 && total > 0) {
      handleNextInput();
    } else if (inputStage === 3 && marksLost !== '') {
      handleCalculate();
    } else if (calculationDone) {
      handleReset(); // Resetting the form to the first input stage
    }
  };

  const handleCalculate = () => {
    const marksLostValue = parseInt(marksLost);
    if (marksLost === '' || total === 0 || copies <= 0 || isNaN(marksLostValue)) {
      setErrorMessage('Please fill all fields correctly!');
      return;
    }
    
    if (marksLostValue < 0 || marksLostValue > total) {
      setErrorMessage('ERROR: Marks lost cannot be negative or more than total marks!');
      setMarksLost('');
      return;
    }

    const remainingMarks = total - marksLostValue;
    const percentage = (remainingMarks / total) * 100;

    let grade = calculateGrade(subject, percentage);

    const newResult = { serial: serialNumber, num: remainingMarks, percent: percentage.toFixed(2), grade };
    const updatedResults = [...results, newResult];

    setResults(updatedResults);
    setSerialNumber(serialNumber + 1);
    setCopies(copies - 1);

    if (copies - 1 === 0) {
      calculateStats(updatedResults);
      setCalculationDone(true);
    }

    setMarksLost('');
    setErrorMessage('');
  };

  const calculateGrade = (subject, percentage) => {
    if (subject === 'Chemistry') {
      if (percentage >= 90) return 'A*';
      else if (percentage >= 80) return 'A';
      else if (percentage >= 70) return 'B';
      else if (percentage >= 60) return 'C';
      else if (percentage >= 50) return 'D';
      else if (percentage >= 40) return 'E';
      else return 'U';
    } else {
      if (percentage >= 88.75) return '9';
      else if (percentage >= 78.75) return '8';
      else if (percentage >= 68.75) return '7';
      else if (percentage >= 60) return '6';
      else if (percentage >= 51.25) return '5';
      else if (percentage >= 45) return '4';
      else if (percentage >= 40) return '3';
      else if (percentage >= 33.75) return '2';
      else if (percentage >= 30) return '1';
      else return '0';
    }
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
    setTotal('');
    setCopies('');
    setMarksLost('');
    setResults([]);
    setStats(null);
    setCalculationDone(false);
    setSerialNumber(1);
    setInputStage(0);
    setErrorMessage('');
    setSubject('Chemistry');
    setLevel("O'Level");
  };

  const handleNextInput = () => {
    if (inputStage === 0) {
      if (subject && level) {
        setInputStage(1);
      } else {
        setErrorMessage('Please select both subject and level!');
      }
    } else {
      setInputStage(inputStage + 1);
      setErrorMessage('');
    }
  };

  

  const handleLevelChange = (e) => {
    setLevel(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Adding the heading with subject and level
    const heading = `${level} ${subject} Results`;
    doc.setFontSize(16); // Set font size for the heading
    doc.text(heading, 14, 16); // Add the heading at the top
  
    // Add the rest of the content (like the table) below the heading
    doc.setFontSize(12); // Reset font size for table and other content
    const tableColumn = ["No.", "Marks", "Percentage", "Grade"];
    const tableRows = results.map(result => [
      result.serial,
      result.num,
      `${result.percent}%`,
      result.grade
    ]);
  
    doc.autoTable(tableColumn, tableRows, { startY: 30 }); // Start table after the heading
  
    // Adding statistics to the PDF
    if (stats) {
      const statsY = doc.autoTable.previous.finalY + 10; // Position below the table
      doc.setFontSize(10); // Set font size for statistics
      doc.text(`Average Marks: ${stats.average}`, 5, statsY);
      doc.text(`Highest Marks: ${stats.highest}`, 5, statsY + 10);
      doc.text(`Lowest Marks: ${stats.lowest}`, 5, statsY + 20);
  
      doc.setFontSize(12); // Reset font size for the rest of the document
    }
  
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



        {results.length > 0 && copies > 0 && inputStage === 3 && (
          <div className="mt-5 p-4 bg-emerald-200  opacity-90  rounded-md shadow-sm">
            <h2 className="text-lg font-bold text-gray-700">Latest Calculation</h2>
            <p><strong>Serial Number:</strong> {results[results.length - 1].serial}</p>
            <p><strong>Remaining Marks:</strong> {results[results.length - 1].num}</p>
            <p><strong>Percentage:</strong> {results[results.length - 1].percent}%</p>
            <p><strong>Grade:</strong> {results[results.length - 1].grade}</p>
          </div>
        )}

        {inputStage === 0 && (
          <>
            <div className="mb-4">
              <label className="block text-emerald-400 font-semibold mb-2">Select Subject</label>
              <select
                value={subject}
                onChange={handleSubjectChange}
                className="w-full mt-2 p-3 bg-slate-700 text-emerald-200 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-emerald-400 font-semibold mb-2">Select Level</label>
              <select
                value={level}
                onChange={handleLevelChange}
                className="w-full mt-2 p-3 bg-slate-700 text-emerald-200 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="O'Level">O'Level</option>
                <option value="A'Level">A'Level</option>
              </select>
            </div>
            <button
              onClick={handleNextInput}
              className="w-full mt-4 bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Next
            </button>
          </>
        )}

        {inputStage === 1 && (
          <div className="mb-4">
            <label className="block text-emerald-400 font-semibold mb-2">Number of Copies</label>
            <input
              type="number"
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
              className="w-full mt-2 p-3 bg-slate-700 text-emerald-200 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter number of copies"
            />
            <button
              onClick={handleNextInput}
              className="w-full mt-4 bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Next
            </button>
          </div>
        )}

        {inputStage === 2 && (
          <div className="mb-4">
            <label className="block text-emerald-400 font-semibold mb-2">Total Marks</label>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full mt-2 p-3 bg-slate-700 text-emerald-200 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter total marks"
            />
            <button
              onClick={handleNextInput}
              className="w-full mt-4 bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Next
            </button>
          </div>
        )}

        {/* Stage 3: Marks Lost */}
        {inputStage === 3 && copies > 0 && (
          <div className="mb-4">
            <label className="block text-emerald-400 font-semibold mb-2">Marks Lost</label>
            <input
              type="number"
              value={marksLost}
              onChange={(e) => setMarksLost(e.target.value)}
              className="w-full mt-2 p-3 bg-slate-700 text-emerald-200 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter marks lost"
            />
            <button
              onClick={handleCalculate}
              className="w-full mt-4 bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Calculate
            </button>
          </div>
        )}


        {calculationDone && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-emerald-300 mb-4">Results</h2>
            <table className="min-w-full border border-emerald-300">
              <thead>
                <tr>
                  <th className="text-emerald-300 border border-emerald-300 px-4 py-2">No.</th>
                  <th className="text-emerald-300 border border-emerald-300 px-4 py-2">Marks</th>
                  <th className="text-emerald-300 border border-emerald-300 px-4 py-2">Percentage</th>
                  <th className="text-emerald-300 border border-emerald-300 px-4 py-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr key={result.serial}>
                    <td className="text-center text-emerald-300 border border-emerald-300 px-4 py-2">{result.serial}</td>
                    <td className="text-center text-emerald-300 border border-emerald-300 px-4 py-2">{result.num}</td>
                    <td className="text-center text-emerald-300 border border-emerald-300 px-4 py-2">{result.percent}%</td>
                    <td className="text-center text-emerald-300 border border-emerald-300 px-4 py-2">{result.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-emerald-300">Statistics</h3>
              <p className="text-emerald-200">Average Marks: {stats?.average}</p>
              <p className="text-emerald-200">Highest Marks: {stats?.highest}</p>
              <p className="text-emerald-200">Lowest Marks: {stats?.lowest}</p>
            </div>

            <button
              onClick={downloadPDF}
              className="mt-4 w-full bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Download Gradesheet
            </button>

            <button
              onClick={handleReset}
              className="mt-4 w-full bg-red-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
