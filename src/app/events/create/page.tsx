// src/app/events/create/page.tsx
'use client';

import { useState } from 'react';

export default function EventCreatePage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  /** ✅ 제출 처리 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !date.trim() || !category.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    alert(`✅ Event created!\nTitle: ${title}\nDate: ${date}`);

    setTitle('');
    setDate('');
    setCategory('');
    setDescription('');
  };

  return (
    <main
      className="
        min-h-dvh flex flex-col items-center justify-start pt-24 px-4
        bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100
      "
    >
      <section
        className="
          w-full max-w-2xl bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-sm p-6 sm:p-8
        "
      >
        <h1 className="text-3xl font-semibold text-blue-600 mb-6 text-center">
          Create Event
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full rounded-lg border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              required
            />
          </div>

          {/* Date */}
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
                px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              required
            />
          </div>

          {/* Category */}
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
                px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              required
            />
          </div>

          {/* Description */}
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
                px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
              {error}
            </p>
          )}

          {/* Submit Button */}
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
      </section>
    </main>
  );
}
