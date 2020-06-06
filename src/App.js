import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
    const TIME_REMAINING = 10
    const [text, setText] = useState("")
    const [timeRemaining, setTimeRemaining] = useState(TIME_REMAINING)
    const [isRunning, setIsRunning] = useState(false)
    const [wordCount, setWordCount] = useState(0)
    const [data, setData] = useState({})
    const [randomTextWordCount, setRandomTextWordCount] = useState(0)
    const [percentageCorrect, setPercentageCorrect] = useState(0)
    const [newPhraseRequest, setNewPhraseRequest] = useState(false)
    const randomText = fixRandomText(data.text)
    const textBoxRef = useRef(null)

    function fixRandomText(text) {
        if (typeof text === 'string') {
            const randomText = text.replace(/`/g, "'")
            return randomText
        }
    }

    useEffect(() => {
        fetch("https://uselessfacts.jsph.pl/random.json?language=en", { //eventually find a new API without backticks but whatever for now
        })
            .then(response => response.json())
            .then(data => setData(data))
    }, [newPhraseRequest])

    function newPhrase() {
        setNewPhraseRequest(!newPhraseRequest)
        setText("")
    }

    function startGame() {
        setIsRunning(true)
        setText("")
        setWordCount(0)
        setRandomTextWordCount(0)
        setPercentageCorrect(0)
        setTimeRemaining(TIME_REMAINING)
        textBoxRef.current.disabled = false
        textBoxRef.current.focus()
    }

    function endGame() {
        if (text !== "") {
            countWords(text)
        }
        else {
            setWordCount(0)
        }
        setIsRunning(false)
        findPercentageCorrect(text, randomText)
    }

    function handleChange(event) {
        const {value} = event.target
        setText(value)
    }

    useEffect(() => {
        if (timeRemaining > 0 && isRunning) {
            setTimeout(() => {
                setTimeRemaining(prevTime => prevTime - 1)
            }, 1000)
        } else if (timeRemaining === 0) {
            endGame()
        }
    }, [timeRemaining, isRunning])

    //Need to fix this error on above useEffect:
    //React Hook useEffect has a missing dependency: 'endGame'.
    //Either include it or remove the dependency array  react - hooks / exhaustive - deps

    function countWords(text) {
        const wordCount = text.trim().split(' ').length //trim removes beginning and end spaces 
        setWordCount(wordCount)
    }

    function findPercentageCorrect(text, randomText) {
        const textArray = text.trim().split(' ')
        const randomTextArray = randomText.split(' ')
        const comparisonArray = []

        for (let i = 0; i < randomTextArray.length; i++)
            if (textArray[i] != null) {
                compareWords(randomTextArray[i], textArray[i])
            }
            else if (textArray[i] == null) {
                comparisonArray.push(0)
            }

        function compareWords(ranTextWord, typedWord) {
            const stringSimilarity = require('string-similarity')
            const wordComparison = stringSimilarity.compareTwoStrings(ranTextWord, typedWord)
            comparisonArray.push(wordComparison)
        }

        function compArrayAverageCorrect(comparisonArray) {
            return Math.round((comparisonArray.reduce((acc, next) => acc + next) / comparisonArray.length) * 100)
        }

        setPercentageCorrect(compArrayAverageCorrect(comparisonArray))
        setRandomTextWordCount(randomTextArray.length)
    }

    return (
        <div id="wrapper">
            <h1>Test Your Typing Skills</h1>
            <p>Click START then type the sentence below:</p>
            <div><h3>{randomText}</h3></div>
            <textarea
                value={text}
                onChange={handleChange}
                disabled={!isRunning}
                ref={textBoxRef}
            />
            <h4>Time Remaining: </h4>
            <div id="time-remaining">
                <h4>00:{timeRemaining}</h4>
            </div>
            <div className="button-area">
                <button
                    onClick={() => startGame()}
                    disabled={isRunning}
                    className="start-button"
                >
                    Start
                </button>
                <br/>
                <button
                    onClick={() => newPhrase()}
                    disabled={isRunning}
                    className="new-sentence-button"
                >
                    New Sentence
                </button>
            </div>
            <div className="results">
                <h2>Word Count: {wordCount} / {randomTextWordCount}</h2>
                <h2>Percentage Correct: {percentageCorrect}%</h2>
            </div>
        </div>
    )
}

export default App;
