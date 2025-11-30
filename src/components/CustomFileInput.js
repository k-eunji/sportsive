import React, { useRef, useState } from "react";

function CustomFileInput({ onFileChange }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFileName(file ? file.name : null);
    onFileChange(file);
  };

  return (
    <>
      <button type="button" onClick={() => fileInputRef.current?.click()}>
        Select Image
      </button>
      {fileName && <span style={{ marginLeft: 10 }}>{fileName}</span>}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </>
  );
}

export default CustomFileInput;
