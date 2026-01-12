import React, { useState, useEffect } from 'react';
import SimulationCard from './SimulationCard'; 
import Layout from '../Layout';
import { useNavigate } from 'react-router-dom';
import { fetchSimulations } from '../utils/simulations';
import { 
  Briefcase, 
  Filter, 
  ChevronDown, 
  Sparkles, 
  BarChart2,
  Search
} from 'lucide-react';

const InternshipDashboard = () => {
  const [simulations, setSimulations] = useState([]);
  const [careerFilter, setCareerFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSimulations = async () => {
      setLoading(true);
      const data = await fetchSimulations();
      setSimulations(data);
      setLoading(false);
    };
    loadSimulations();
  }, []);

  const uniqueCategories = ['All', ...new Set(simulations.map(sim => sim.category))];

  const filteredSimulations = simulations.filter((sim) => {
    const matchesCareer = careerFilter === 'All' || sim.category === careerFilter;
    const matchesSearch = !searchQuery || 
      sim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCareer && matchesSearch;
  });

  const stats = [
    { label: 'Total Simulations', value: simulations.length, icon: Briefcase, color: 'blue' },
    { label: 'Categories', value: uniqueCategories.length - 1, icon: Filter, color: 'emerald' },
  ];

  return (
    <Layout>
      <div className="min-h-full">
        {/* Hero Section */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-8 py-8">
            <div className="flex items-start justify-between">
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-indigo-600">Virtual Internships</span>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  Explore Job Simulations
                </h1>
                <p className="text-slate-600 text-base leading-relaxed">
                  Discover hands-on job simulations to build real-world skills, 
                  enhance your resume, and get noticed by top recruiters.
                </p>
              </div>

              {/* Progress Button */}
              <button
                onClick={() => navigate('/progress')}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <BarChart2 className="w-4 h-4" />
                Track Progress
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-6">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color === 'cyan' ? 'bg-cyan-100' : 'bg-emerald-100'}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color === 'indigo' ? 'text-indigo-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-8 py-5 bg-white border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search simulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Filter by:</span>
              <div className="relative">
                <select
                  value={careerFilter}
                  onChange={(e) => setCareerFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer min-w-[180px]"
                >
                  {uniqueCategories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-500 ml-auto">
              {filteredSimulations.length} simulation{filteredSimulations.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Simulations Grid */}
        <div className="p-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                  <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredSimulations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSimulations.map((simulation) => (
                <SimulationCard key={simulation.id} simulation={simulation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No simulations found</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InternshipDashboard;


