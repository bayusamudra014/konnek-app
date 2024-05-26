// import { useEffect, useState } from "react";
// import styles from "./DarkModeToggle.module.css";

// const DarkModeToggle = () => {
//   const [darkMode, setDarkMode] = useState<boolean>(false);

//   useEffect(() => {
//     // Check if dark mode is enabled by checking the class on the document element
//     const isDarkMode = document.documentElement.classList.contains("dark");
//     setDarkMode(isDarkMode);
//   }, []);

//   const toggleDarkMode = () => {
//     // Toggle dark mode state
//     const newDarkMode = !darkMode;
//     setDarkMode(newDarkMode);

//     // Apply dark mode styles
//     if (newDarkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   };

//   return (
//     <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
//       {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
//     </button>
//   );
// };

// export default DarkModeToggle;

// src/components/DarkModeToggle.tsx
import { useDarkMode } from "@/context/DarkModeContext";
import styles from "@/components/DarkModeToggle.module.css";

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button onClick={toggleDarkMode} className={styles.darkModeToggle}>
      {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
};

export default DarkModeToggle;
