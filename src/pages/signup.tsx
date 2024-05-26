// src/pages/signup.tsx
import { useState } from "react";
import { useDarkMode } from "@/context/DarkModeContext";

const SignUpPage = () => {
  const { isDarkMode } = useDarkMode();
  const [inputValues, setInputValues] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValues(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileContent = `Your Input: ${inputValues}`;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dummy.txt";
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen py-2 ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}
    >
      <h1 className="text-4xl font-bold mb-8">Sign Up</h1>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col items-center space-y-4 p-6 rounded-lg shadow-md ${isDarkMode ? "bg-gray-700" : "bg-white"}`}
      >
        <input
          type="text"
          value={inputValues}
          onChange={handleInputChange}
          className={`px-4 py-2 border rounded w-64 ${isDarkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white text-black border-gray-300"}`}
          placeholder="Enter your key..."
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;
