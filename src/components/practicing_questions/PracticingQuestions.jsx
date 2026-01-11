// src/pages/PreparationHub.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import FilterBar from "./FilterBar";
import QuestionCard from "./QuestionCard";
import Layout from "../Layout";

export default function PreparationHub() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    company: "",
    difficulty: "",
    search: "",
  });

  const filtered = questions.filter((q) => {
    const searchText = filters.search.toLowerCase();
    // const matchesCategory =
    //   !filters.category || q.category === filters.category;
    const matchesCategory =
      !filters.category ||
      q.category?.toLowerCase() === filters.category.toLowerCase();
    const matchesCompany = !filters.company || q.company === filters.company;
    const matchesDifficulty =
      !filters.difficulty || q.difficulty === filters.difficulty;
    const matchesSearch =
      q.title?.toLowerCase().includes(searchText) ||
      q.company?.toLowerCase().includes(searchText) ||
      q.difficulty?.toLowerCase().includes(searchText) ||
      q.category?.toLowerCase().includes(searchText);
    return (
      matchesCategory && matchesCompany && matchesDifficulty && matchesSearch
    );
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .range(0, 49);

      if (error) {
        console.error("Error fetching questions:", error);
      } else {
        setQuestions(data);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <Layout>
      <div className="p-6 bg-radial-blue">
        <h1 className="text-2xl font-bold mb-4">Question Bank</h1>
        <FilterBar filters={filters} setFilters={setFilters} />
        <div>
          {filtered.length ? (
            filtered.map((q) => <QuestionCard key={q.id} q={q} />)
          ) : (
            <p>No questions found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
