export const capitalizeFirstWord = (inputString) => {
  if (inputString) {
    const firstLetter = inputString.charAt(0);
    const isFirstLetterLowercase = firstLetter === firstLetter.toLowerCase();

    const resultString = isFirstLetterLowercase
      ? firstLetter.toUpperCase() + inputString.slice(1)
      : inputString;

    return resultString;
  } else {
    return inputString;
  }
};

// export const capitalizeFirstWord = (inputString) => {
//   if (inputString) {
//     const resultString =
//       inputString.charAt(0).toUpperCase() + inputString.slice(1);
//     return resultString;
//   } else {
//     return inputString;
//   }
// };

// const capitalizeWords = (sentence) => {
//     if (!sentence) return;
//     const words = sentence.split(" ");

//     const capitalizedWords = words.map((word) => {
//       if (word.length === 0) {
//         return "";
//       } else if (word.length === 1) {
//         return word.charAt(0).toUpperCase();
//       } else {
//         return word.charAt(0).toUpperCase() + word.slice(1);
//       }
//     });
//     const capitalizedSentence = capitalizedWords.join(" ");
//     return capitalizedSentence;
//   };
