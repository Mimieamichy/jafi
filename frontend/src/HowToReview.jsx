// src/components/HowToReview.jsx
import React from "react";

export default function HowToReview() {
  return (
    <section className="max-w-3xl mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">
        How To Review on Jafi.ai
      </h2>

      <ol className="space-y-4 list-decimal list-inside text-gray-800">
        <li>
          <strong>Search For The Category</strong>{" "}
          <span className="text-gray-600">
            of the product or service you want. We have hundreds of listings and
            more added each day.
          </span>
        </li>
        <li>
          <strong>Select From The Various Choices.</strong>{" "}
          <span className="text-gray-600">
            Browse businesses & services in your chosen category and click on the one you’re interested in.
          </span>
        </li>
        <li>
          <strong>Click on “Write a Review.”</strong>{" "}
          <span className="text-gray-600">
            You’ll be prompted to log in or sign up as a reviewer, and then you
            can rate and leave your feedback for that business/service.
          </span>
        </li>
      </ol>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="font-semibold">NB:</p>
        <p className="text-gray-700">
          Always ensure that your review is honest, it helps others make informed
          decisions!
        </p>
      </div>
    </section>
  );
}
