// src/pages/login.tsx
import { useState } from "react";
import { useDarkMode } from "@/context/DarkModeContext";
import { useRouter } from "next/router";

const LogInPage = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(
    ""
  );
  const [key, setKey] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result ?? null);
      };
      reader.readAsText(file);
    }
  };

  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(fileContent, key);
    router.push("/chat");

    // Add your login logic here using fileContent and key\
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Log In</h1>
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className={"flex flex-col items-center"}>
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          />
          <input
            type="text"
            value={key}
            onChange={handleKeyChange}
            placeholder="Enter Key"
            className={`mb-4 p-2 border border-gray-300 rounded w-full ${isDarkMode ? "bg-transparent" : "bg-white"}`}
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded ">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogInPage;
