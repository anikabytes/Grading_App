import React, { useState, useEffect } from 'react';

function App() {
  const [total, setTotal] = useState(0);
  const [copies, setCopies] = useState(0);
  const [marksLost, setMarksLost] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [calculationDone, setCalculationDone] = useState(false);
  const [serialNumber, setSerialNumber] = useState(1);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        handleCalculate();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [copies, marksLost, total]);

  const handleCalculate = () => {
    if (marksLost === '' || total === 0 || copies <= 0) return;

    const remainingMarks = total - parseInt(marksLost);
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

    setCopies(copies - 1);
    setMarksLost('');
    setSerialNumber(serialNumber + 1);

    if (copies - 1 === 0) {
      calculateStats(updatedResults);
      setCalculationDone(true);
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
    setTotal(0);
    setCopies(0);
    setMarksLost('');
    setResults([]);
    setStats(null);
    setCalculationDone(false);
    setSerialNumber(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-lg transform transition-all duration-300 ease-in-out hover:scale-105">
        <h1 className="text-4xl font-bold text-center mb-8 text-emerald-300">Grading Calculator</h1>

        {!calculationDone && (
          <>
            <div className="mb-4">
              <label className="block text-emerald-400 font-semibold mb-2">Total Marks</label>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(parseInt(e.target.value))}
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="mb-4">
              <label className="block text-emerald-400 font-semibold mb-2">Number of Copies</label>
              <input
                type="number"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value))}
                className="w-full mt-2 p-3 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
                disabled={results.length > 0}
              />
            </div>

            <div className="mb-4">
              <label className="block text-emerald-400 font-semibold mb-2">Marks Lost</label>
              <input
                type="number"
                value={marksLost}
                onChange={(e) => setMarksLost(e.target.value)}
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              onClick={handleCalculate}
              className="w-full bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
              disabled={copies <= 0}
            >
              Calculate
            </button>

            {results.length > 0 && copies > 0 && (
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

            <table className="w-full bg-slate-800 text-emerald-300 border rounded-md overflow-hidden shadow-sm">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-center">Np.</th>
                  <th className="px-4 py-2 text-center">Marks</th>
                  <th className="px-4 py-2 text-center">Percentage</th>
                  <th className="px-4 py-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-t text-center">
                    <td className="px-5 py-2">{result.serial}</td>
                    <td className="px-4 py-2">{result.num}</td>
                    <td className="px-4 py-2">{result.percent}%</td>
                    <td className="px-4 py-2">{result.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {stats && (
              <div className="mt-6 p-5 bg-green-100 rounded-md shadow-lg">
                <h3 className="text-lg font-bold text-gray-800">Statistics</h3>
                <p><strong>Average Marks:</strong> {stats.average}</p>
                <p><strong>Highest Marks:</strong> {stats.highest}</p>
                <p><strong>Lowest Marks:</strong> {stats.lowest}</p>
              </div>
            )}

            {/* Back to Calculator Button */}
            <button
              onClick={handleReset}
              className="mt-10 w-full bg-emerald-300 text-black py-2 rounded-md hover:shadow-lg transition-shadow duration-300"
            >
              Back to Calculator
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

