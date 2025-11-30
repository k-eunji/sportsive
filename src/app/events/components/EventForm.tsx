// src/app/events/components/EventForm.tsx
'use client';

import { useState } from 'react';

export interface EventFormData {
  title: string;
  date: string;
  category: string;
  description: string;
  location?: { lat: number; lng: number; address: string };
  free?: boolean;
  price?: number;
}

interface Props {
  onSubmit: (data: EventFormData) => void;
}

export default function EventForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  /** ✅ 제출 처리 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !date || !category.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    onSubmit({ title: title.trim(), date, category: category.trim(), description: description.trim() });

    // 입력값 초기화
    setTitle('');
    setDate('');
    setCategory('');
    setDescription('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-lg mx-auto flex flex-col gap-4
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-2xl p-6 shadow-sm
      "
    >
      <h2 className="text-2xl font-semibold text-blue-600 text-center mb-2">Create Event</h2>

      {/* 제목 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="
            w-full rounded-lg border border-gray-300 dark:border-gray-600
            bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          required
        />
      </div>

      {/* 날짜 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="
            w-full rounded-lg border border-gray-300 dark:border-gray-600
            bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          required
        />
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <input
          id="category"
          type="text"
          placeholder="e.g. Soccer, Basketball, Tennis"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="
            w-full rounded-lg border border-gray-300 dark:border-gray-600
            bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          required
        />
      </div>

      {/* 설명 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Describe your event..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="
            w-full rounded-lg border border-gray-300 dark:border-gray-600
            bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
            px-3 py-2 text-sm resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-sm text-red-600 animate-fade-in">{error}</p>}

      {/* 제출 버튼 */}
      <button
        type="submit"
        className="
          w-full bg-blue-600 text-white py-2 rounded-lg font-medium
          hover:bg-blue-700 transition-colors
        "
      >
        Create Event
      </button>
    </form>
  );
}
