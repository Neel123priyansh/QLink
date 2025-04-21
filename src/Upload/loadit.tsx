import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import '@coreui/coreui-pro/dist/css/coreui.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';

type OptionType = {
  value: string;
  label: string;
};

export const Loadit = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);

  const options: OptionType[] = [
    { value: 'yashpandey', label: 'Yash Bhushan Pandey' },
    { value: 'altamashbeg', label: 'Altamash Beg' },
    { value: 'priyanshkumarrai', label: 'Priyansh Kumar Rai' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!file) {
      toast.error('No file selected');
      return;
    }
  
    if (!selectedOption) {
      toast.error('Please select a sender');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiver', selectedOption.value); // ✅ This line sends the selected user
  
      const response = await axios.post('http://localhost:5200/upload-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (!response.data?.pdf?.fileUrl) {
        toast.error('File upload failed: Missing fileUrl');
        return;
      }
  
      toast.success('Uploaded Successfully!', {
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Submission failed, please try again');
    }
  };
  

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-[#3c50e0] to-[#00df9a] text-white px-6">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-xl space-y-6">
        <h1 className="text-4xl font-bold font-Manrope text-center">
          Upload Important Files and Select the Sender
        </h1>

        {/* File Select Button */}
        <div className="flex flex-col items-center gap-3">
          <label htmlFor="file-upload" className="cursor-pointer px-6 py-2 bg-black rounded-xl font-semibold hover:bg-white hover:text-black transition">
            Select File
          </label>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          {fileName ? <p className="text-white">📄 {fileName}</p> : <p className="text-white font-bold">No file selected</p>}
        </div>

        {/* Sender Dropdown */}
        <div className="w-full">
          <Select
            placeholder="Select Sender"
            value={selectedOption}
            onChange={(option) => setSelectedOption(option as OptionType)}
            options={options}
            className="text-black"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '10px',
                padding: '2px',
                fontSize: '16px',
              }),
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-8 py-2 bg-black text-white font-bold rounded-full hover:bg-white hover:text-black transition"
        >
          Upload Now
        </button>
      </form>
    </div>
  );
};

export default Loadit;
