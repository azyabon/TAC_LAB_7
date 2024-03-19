import React, { useState } from "react";
import "./App.css";

function App() {
  const [alternatives, setAlternatives] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [pairwiseComparisons, setPairwiseComparisons] = useState([]);
  const [integralIndices, setIntegralIndices] = useState([]);
  const [optimalAlternative, setOptimalAlternative] = useState("");

  const addAlternative = (alternative) => {
    setAlternatives([...alternatives, alternative]);
    setPairwiseComparisons(
      pairwiseComparisons.map((pairwiseComparison) => {
        const matrix = [...pairwiseComparison.matrix];
        matrix.push(Array(matrix.length).fill(0));
        matrix.forEach((row) => row.push(0));
        return { ...pairwiseComparison, matrix };
      })
    );
  };

  const addCriterion = (criterion) => {
    setCriteria([...criteria, criterion]);
    addPairwiseComparison(criterion);
  };

  const addPairwiseComparison = (criterion) => {
    const matrix = Array(alternatives.length)
      .fill(0)
      .map(() => Array(alternatives.length).fill(0));
    setPairwiseComparisons([...pairwiseComparisons, { criterion, matrix }]);
  };

  const handlePairwiseComparisonChange = (index, i, j, value) => {
    const newPairwiseComparisons = [...pairwiseComparisons];
    newPairwiseComparisons[index].matrix[i][j] = parseFloat(value, 10);
    newPairwiseComparisons[index].matrix[j][i] = 1 / parseFloat(value, 10);
    setPairwiseComparisons(newPairwiseComparisons);
  };
  

  const calculatePriorities = (matrix) => {
    const n = matrix.length;
    const priorities = [];

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += matrix[i][j];
      }
      priorities[i] = sum;
    }

    const norm = priorities.reduce((a, b) => a + b, 0) / n;

    return priorities.map((priority) => priority / norm);
  };

  const calculateWeights = () => {
    const weights = [];

    for (let i = 0; i < criteria.length; i++) {
      const priorities = calculatePriorities(pairwiseComparisons[i].matrix);
      const weight = priorities.reduce((a, b) => a + b, 0) / criteria.length;
      weights.push(weight);
    }

    return weights;
  };

  const calculateIntegralIndices = () => {
    const indices = [];

    for (let i = 0; i < alternatives.length; i++) {
      let sum = 0;
      for (let j = 0; j < criteria.length; j++) {
        sum += pairwiseComparisons[j].matrix[i][j] * calculateWeights()[j];
      }
      indices.push(sum);
    }

    setIntegralIndices(indices);
    setOptimalAlternative(alternatives[indices.indexOf(Math.max(...indices))]);
  };

  return (
    <div className="App">
      <h1>Выбор старосты группы методом АНР</h1>
      <h2>Альтернативы</h2>
      {alternatives.map((alternative, index) => (
        <p key={index}>{alternative}</p>
      ))}
      <input
        type="text"
        placeholder="Введите альтернативу"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addAlternative(event.target.value);
            event.target.value = "";
          }
        }}
      />
      <h2>Критерии</h2>
      {criteria.map((criterion, index) => (
        <p key={index}>{criterion}</p>
      ))}
      <input
        type="text"
        placeholder="Введите критерий"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addCriterion(event.target.value);
            event.target.value = "";
          }
        }}
      />
      {pairwiseComparisons.map((pairwiseComparison, index) => (
        <div key={index}>
          <h3>{pairwiseComparison.criterion}</h3>
          <table>
            <thead>
              <tr>
                <th></th>
                {alternatives.map((alternative, index) => (
                  <th key={index}>{alternative}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pairwiseComparison.matrix.map((row, i) => (
                <tr key={i}>
                  <th>{alternatives[i]}</th>
                  {row.map((cell, j) => (
                    <td key={j}>
                      {i === j ? (
                        <span>1</span>
                      ) : j > i ? (
                        <span>{pairwiseComparison.matrix[j][i].toFixed(2)}</span>
                      ) : (
                        <input
                          type="number"
                          value={cell}
                          onChange={(event) => handlePairwiseComparisonChange(index, i, j, parseFloat(event.target.value))}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={calculateIntegralIndices}>Рассчитать интегральные показатели</button>
      {integralIndices.length > 0 && (
        <>
          <h2>Интегральные показатели</h2>
          {integralIndices.map((index, i) => (
            <p key={i}>{alternatives[i]}: {index.toFixed(3)}</p>
          ))}
          <h2>Оптимальная альтернатива: {optimalAlternative}</h2>
        </>
      )}
    </div>
  );
}

export default App;
