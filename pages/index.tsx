import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Home: NextPage = () => {
  const [cursorMode, setCursorMode] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Documents storage

  // Speech
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const writeContainerRef = useRef();
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
        if (currentX > 9) {
          currentX = 0;
        }
      }
    } else {
      offset *= -1;
      for (let i = 0; i < offset; i++) {
        currentX -= 1;
        if (currentX < 0) {
          currentX = 9;
        }
      }
    }

    return [currentY, currentX];
  };

  const characters = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
    ["Z", "X", "C", "V", "B", "N", "M", "M", "M", "M"],
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
  ];

  const moveUp = () => {
    if (cursorMode) {
      moveCursorRight();
    } else {
      if (position[0] === 0) {
        setPosition([3, position[1]]);
      } else {
        setPosition([(position[0] - 1) % 6, position[1]]);
      }
    }
  };

  const moveDown = () => {
    if (cursorMode) {
      moveCursorLeft();
    } else {
      setPosition([(position[0] + 1) % 4, position[1]]);
    }
  };

  const moveLeft = () => {
    if (cursorMode) {
      moveCursorLeft();
    } else {
      if (position[1] === 0) {
        setPosition([position[0], 9]);
      } else {
        setPosition([position[0], (position[1] - 1) % 10]);
      }
    }
  };

  const moveRight = () => {
    if (cursorMode) {
      moveCursorRight();
    } else {
      setPosition([position[0], (position[1] + 1) % 10]);
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

    writeContainerRef.current.scrollTop =
      writeContainerRef.current.scrollHeight;
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
      <div id="WrittingToolContainer">
        <div
          className="absolute w-full flex justify-center"
          style={{ bottom: "50px" }}
        >
          <div className="">
            <div id="SpecialCharacters" className=" mb-10 text-6xl">
              <div className="flex justify-between space-x-20 mb-2">
                <div
                  className="px-10 rounded-full bg-white border-4 border-black px-2"
                  onClick={() => write(",")}
                >
                  ,
                </div>
                <div
                  className="px-10 rounded-full bg-white border-4 border-black"
                  onClick={() => write(".")}
                >
                  ;
                </div>
                <div
                  className="px-10 rounded-full bg-white border-4 border-black"
                  onClick={() => write(".")}
                >
                  .
                </div>
                <div
                  className="px-10 rounded-full bg-white border-4 border-black"
                  onClick={() => write(":")}
                >
                  :
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <div id="EraseButton" className="px-5 py-2 rounded-full bg-black text-white text-center" onClick={erase}>DEL</div>
                <div
                  className="w-60 h-20 rounded-full bg-black border-4 border-black"
                  onClick={() => write(" ")}
                ></div>
                <div id="LineBreakButton" className="px-5 py-2  rounded-full bg-white border-4 border-black text-center" onClick={() => write("\n")}>{"->"}</div>
              </div>
            </div>
            <div className="flex justify-center">
              <div
                className="bg-carmesi h-20 w-20"
                id="MoveUpButton"
                onClick={moveUp}
              ></div>
            </div>
            <div className="flex justify-center space-x-10">
              <div
                className="bg-carmesi h-20 w-20"
                id="MoveLeftButton"
                onClick={moveLeft}
              ></div>
              <div
                id="LetterSelector"
                className="text-9xl space-x-10 flex justify-center font-mono"
              >
                <div
                  onClick={() => {
                    write(getCharacterAtPosition(getPositionWithOffset(-1)));
                  }}
                >
                  {getCharacterAtPosition(getPositionWithOffset(-1))}
                </div>
                <div
                  onClick={() => {
                    write(pendingCharacter);
                  }}
                >
                  {getCharacterAtPosition(getPositionWithOffset(0))}
                </div>
                <div
                  onClick={() => {
                    write(getCharacterAtPosition(getPositionWithOffset(1)));
                  }}
                >
                  {getCharacterAtPosition(getPositionWithOffset(1))}
                </div>
              </div>
              <div
                className="bg-carmesi h-20 w-20"
                id="MoveRightButton"
                onClick={moveRight}
              ></div>
            </div>
            <div className="flex justify-center">
              <div
                className="bg-carmesi h-20 w-20"
                id="MoveDownButton"
                onClick={moveDown}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div id="TopBar">
        <div className="buttons-container w-full text-center">
          <div className="absolute top-0 left-1/2">{cursorPosition}</div>
          <button
            className="bg-carmesi rounded-full p-20 border-8 border-black absolute left-0 top-1/2"
            onClick={() => setShowToolbar(!showToolbar)}
          ></button>
          <button
            className={
              listening
                ? "type-button text-white absolute right-0 top-1/4"
                : "type-button absolute left-0 top-1/4 bg-black  text-white"
            }
            onClick={toggleAudio}
          >
            Audio
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
          <button
            className={
              cursorMode
                ? "type-button bg-blue-600"
                : "type-button bg-black text-white"
            }
            onClick={toggleCursorMode}
          >
            Cursor
          </button>
          <button
            className={
              cursorMode
                ? "type-button bg-blue-600"
                : "type-button bg-black text-white"
            }
            onClick={toggleCursorMode}
          >
            Teleprompter
          </button>
        </div>
      </div>
      <div
        id="WriteContainer"
        className="text-8xl text-center mt-2 flex justify-center space-x-10 uppercase"
      >
        <div className="w-1/4 flex justify-end">
          
        </div>
        <div className="w-2/6 mt-30 flex justify-center">
          <pre
            id="TextContainer"
            className="border-2 border-gray-200 h-44 text-right w-full"
            ref={writeContainerRef}
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
                    return <span>{item}</span>;
                  }
                })
              : writtenText}
          </pre>
        </div>
        <div className="w-1/4 flex justify-start ">
         
        </div>
      </div>
      <div
        id="Cheatsheet"
        className="text-center absolute"
        style={{
          bottom: "0px",
          right: "5px",
        }}
      >
        <br />
        <div id="PositionsCheatsheet" className="text-6xl">
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
      </div>
    </div>
  );
};

export default Home;
