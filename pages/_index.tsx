import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Home: NextPage = () => {
  const [cursorMode, setCursorMode] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Speech
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [writtenText, setWrittenText] = useState("");
  const [pendingCharacter, setPendingCharacter] = useState("");

  const [position, setPosition] = useState([0, 0]);

  const getCharacterAtPosition = (position) => {
    return characters[position[0]][position[1]];
  };

  const getPositionWithOffset = (offset) => {
    let currentX = position[1];
    let currentY = position[0];

    if (offset > 0) {
      for (let i = 0; i < offset; i++) {
        currentX += 1;
        if (currentX > 4) {
          currentX = 0;
          currentY += 1;
        }
        if (currentY > 5) {
          currentY = 0;
        }
      }
    } else {
      offset *= -1;
      for (let i = 0; i < offset; i++) {
        currentX -= 1;
        if (currentX < 0) {
          currentX = 4;
          currentY -= 1;
        }
        if (currentY < 0) {
          currentY = 5;
        }
      }
    }

    return [currentY, currentX];
  };

  const characters = [
    ["A", "B", "C", "D", "E"],
    ["F", "G", "H", "I", "J"],
    ["K", "L", "M", "N", "O"],
    ["P", "Q", "R", "S", "T"],
    ["U", "V", "W", "X", "Y"],
    ["Z", "Z", "Z", "Z", "Z"],
  ];

  const moveUp = () => {
    if (cursorMode) {
      moveCursorRight();
    } else {
      if (position[0] === 0) {
        setPosition([5, position[1]]);
      } else {
        setPosition([(position[0] - 1) % 6, position[1]]);
      }
    }
  };

  const moveDown = () => {
    if (cursorMode) {
      moveCursorLeft();
    } else {
      setPosition([(position[0] + 1) % 6, position[1]]);
    }
  };

  const moveLeft = () => {
    if (cursorMode) {
      moveCursorLeft();
    } else {
      if (position[1] === 0) {
        setPosition([position[0], 4]);
      } else {
        setPosition([position[0], (position[1] - 1) % 5]);
      }
    }
  };

  const moveRight = () => {
    if (cursorMode) {
      moveCursorRight();
    } else {
      setPosition([position[0], (position[1] + 1) % 5]);
    }
  };

  const write = (newText) => {
    if (cursorMode) {
      const beforeCursorText = writtenText.slice(0, cursorPosition + 1);
      const afterCursorText = writtenText.slice(
        cursorPosition + 1,
        writtenText.length
      );

      setWrittenText(beforeCursorText + newText + afterCursorText);
    } else {
      setWrittenText(writtenText + newText);
    }
  };

  const erase = () => {
    if (cursorMode) {
      const beforeCursorText = writtenText.slice(0, cursorPosition);
      const afterCursorText = writtenText.slice(
        cursorPosition + 1,
        writtenText.length
      );

      setWrittenText(beforeCursorText + afterCursorText);
    } else {
      setWrittenText(writtenText.slice(0, -1));
    }
  };

  const toggleAudio = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      handleStopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleStopListening = () => {
    setWrittenText(writtenText + ` ${transcript}`);
    resetTranscript();
  };

  const toggleCursorMode = () => {
    if (cursorMode) {
      resetCursorMode();

      setCursorMode(false);
    } else {
      configCursorMode();

      setCursorMode(true);
    }
  };

  const configCursorMode = () => {
    setPendingCharacter("");
  };

  const resetCursorMode = () => {
    setPendingCharacter(characters[position[0]][position[1]]);
  };

  const moveCursorRight = () => {
    const textLenght = writtenText.length;

    if (cursorPosition < textLenght - 1) {
      setCursorPosition(cursorPosition + 1);
    }
  };

  const moveCursorLeft = () => {
    const textLenght = writtenText.length;

    if (cursorPosition > 0) {
      setCursorPosition(cursorPosition - 1);
    }
  };

  useEffect(() => {
    const textLength = writtenText.length;

    if (cursorPosition > textLength) {
      setCursorPosition(textLength - 1);
    }
  }, [writtenText]);

  useEffect(() => {
    if (position[0] < 0) {
      position[0] = 5;
    }
    if (position[1] < 0) {
      position[1] = 4;
    }

    setPendingCharacter(characters[position[0]][position[1]]);
  }, [position]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesnt support speech recognition.</span>;
  }

  return (
    <div id="MainContainer" className="w-full h-full font-seriff font-bold">
      <div
        id="WrittingToolContainer"
        className="absolute bottom-1/4 w-full mx-auto text-center flex justify-center"
      >
        <div className="w-1/3">
          <div className="flex justify-center">
            <div className="w-1/3 bg-red-600"></div>
          </div>
          <div className="flex">
            <div className="w-1/3 bg-red-600"></div>
            <div
              id="LetterContainer"
              className="p-2 text-carmesi text-8xl rounded-full border-2 border-black flex justify-center space-x-5"
              onClick={() => write(pendingCharacter)}
            >
              <div>{getCharacterAtPosition(getPositionWithOffset(-1))}</div>
              <div>{pendingCharacter}</div>
              <div>{getCharacterAtPosition(getPositionWithOffset(1))}</div>
            </div>
            <div className="w-1/3  bg-red-600"></div>
          </div>
          <div></div>
        </div>
        {/*<div className="w-1/4">
          <div className="flex">
            <div className="w-1/3"></div>
            <div className="w-1/3">
              <button className="type-button" onClick={moveUp}>
                AR
              </button>
            </div>
            <div className="w-1/3"></div>
          </div>
          <div className="flex">
            <div className="w-1/3">
              <button className="type-button " onClick={moveLeft}>
                LE
              </button>
            </div>
            <div className="">
              <div
                id="LetterContainer"
                className="p-4 text-center text-carmesi text-8xl rounded-full border-2 border-black flex"
                onClick={() => write(pendingCharacter)}
              >
                <div>{getCharacterAtPosition(getPositionWithOffset(-1))}</div>
                <div>{pendingCharacter}</div>
                <div>{getCharacterAtPosition(getPositionWithOffset(1))}</div>
              </div>
            </div>
            <div className="w-1/3">
              <button className="type-button " onClick={moveRight}>
                RI
              </button>
            </div>
          </div>
          <div className="flex">
            <div className="w-1/3"></div>
            <div className="w-1/3">
              <button className="type-button" onClick={moveDown}>
                AB
              </button>
            </div>
            <div className="w-1/3"></div>
          </div>
  </div>*/}
      </div>
      <div id="TopBar">
        <div className="buttons-container w-full text-center">
          <div className="absolute top-0 left-1/2">{cursorPosition}</div>

          <button
            className="p-20 border-8 border-black absolute left-0 top-1/2 font-bold rounded-full bg-carmesi"
            onClick={() => setShowToolbar(!showToolbar)}
          ></button>
          <button
            className={
              listening
                ? "type-button text-white absolute right-0 top-1/4"
                : "type-button absolute right-0 top-1/4 bg-black  text-white"
            }
            onClick={toggleAudio}
          >
            Audio
          </button>
          <button
            className={
              cursorMode
                ? "type-button absolute right-0 top-1/2 bg-blue-600"
                : "type-button absolute right-0 top-1/2"
            }
            onClick={toggleCursorMode}
          >
            Cursor
          </button>
        </div>
      </div>
      <div
        id="ToolsBar"
        className={
          showToolbar
            ? "w-full h-1/4 absolute bg-red-700 hidden"
            : "w-full h-1/4 absolute bg-red-700"
        }
      >
        <div id="ToolButtonsContainer" className="flex justify-center ">
          <button
            id="EnterButton"
            className="type-button bg-black text-white"
            onClick={() => write("\n")}
          >
            Intro
          </button>
          <button
            id="SpaceButton"
            className="type-button bg-black text-white"
            onClick={() => write(" ")}
          >
            Espacio
          </button>
          <button
            id="CopyButton"
            className="type-button bg-black text-white"
            onClick={() => navigator.clipboard.writeText(writtenText)}
          >
            Copiar
          </button>
        </div>
      </div>
      <div
        id="WriteContainer"
        className="h-2/3 text-6xl text-center p-20 flex justify-center text-center"
      >
        <pre
          id="TextContainer"
          className="border-2 border-gray-200 w-2/3 text-8xl"
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          {cursorMode
            ? writtenText.split("").map((item, index) => {
                if (index === cursorPosition) {
                  return <span className="text-carmesi">{item}</span>;
                } else {
                  return { item };
                }
              })
            : writtenText}
          {/*<span className="text-carmesi">{pendingCharacter}</span>*/}
        </pre>
      </div>

      <div id="BottomBar" className="w-full text-center absolute top-0">
        <button className="type-button" onClick={erase}>
          Borrar
        </button>
        <button className="type-button" onClick={() => write(pendingCharacter)}>
          Escribir {getPositionWithOffset(-1)} {position}{" "}
          {getPositionWithOffset(1)}
        </button>
        <br />
        {/*<div id="PositionsCheatsheet" className="text-6xl">
          <span>
            {position[0]} - {position[1]}
          </span>
        </div>
        <div>{transcript}</div>
        <div className="cheatsheet">
          {characters.map((line, index) => {
            return (
              <div key={index}>
                {line.map((letter, subindex) => {
                  if (position[0] == index && position[1] == subindex) {
                    return (
                      <span
                        className="text-carmesi"
                        key={`${index}_${subindex}`}
                      >
                        {letter}
                      </span>
                    );
                  } else {
                    return <span key={`${index}_${subindex}`}>{letter}</span>;
                  }
                })}
              </div>
            );
          })}
        </div>
        */}
      </div>
    </div>
  );
};

export default Home;
