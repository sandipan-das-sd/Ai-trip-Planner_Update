import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  FaFilter,
  FaMoneyBillWave,
  FaStar,
  FaHotel,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { MdOutlineAllInclusive } from "react-icons/md";
import { GiReceiveMoney, GiTakeMyMoney, GiMoneyStack } from "react-icons/gi";

const HotelFilters = ({ onFilterChange }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 50000]); // Default range in INR

  const priceCategories = [
    {
      id: "all",
      label: "All Hotels",
      icon: <MdOutlineAllInclusive className="text-blue-500" />,
      range: [0, 50000],
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      id: "budget",
      label: "Budget",
      icon: <GiReceiveMoney className="text-green-500" />,
      range: [0, 5000],
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      id: "moderate",
      label: "Moderate",
      icon: <GiTakeMyMoney className="text-orange-500" />,
      range: [5001, 15000],
      color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    {
      id: "luxury",
      label: "Luxury",
      icon: <GiMoneyStack className="text-purple-500" />,
      range: [15001, 50000],
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
  ];

  const handleFilterClick = (category) => {
    setActiveFilter(category.id);
    setPriceRange(category.range);
    onFilterChange({
      priceRange: category.range,
    });
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    // Clear the active category button when using custom range
    setActiveFilter("");
  };

  const applyCustomRange = () => {
    onFilterChange({
      priceRange: priceRange,
    });
  };

  return (
    <div className="mb-6">
      {/* Category buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {priceCategories.map((category) => (
          <Button
            key={category.id}
            variant={activeFilter === category.id ? "default" : "outline"}
            className={`flex items-center gap-2 transition-all ${
              activeFilter === category.id ? category.color : ""
            }`}
            onClick={() => handleFilterClick(category)}
          >
            {category.icon}
            {category.label}
            {category.id !== "all" && (
              <span className="text-xs opacity-70">
                {category.id === "budget"
                  ? "₹0-5K"
                  : category.id === "moderate"
                  ? "₹5K-15K"
                  : "₹15K+"}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Advanced filter toggle */}
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-gray-600 w-full justify-between border border-gray-200 hover:bg-gray-50 mb-3"
        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
      >
        <div className="flex items-center">
          <FaFilter className="mr-2" />
          <span>Advanced Price Filter</span>
        </div>
        {isAdvancedOpen ? <FaChevronUp /> : <FaChevronDown />}
      </Button>

      {/* Advanced price range slider */}
      {isAdvancedOpen && (
        <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Custom Price Range
              </h3>
              <span className="text-sm text-gray-500">
                ₹{priceRange[0].toLocaleString()} - ₹
                {priceRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              defaultValue={priceRange}
              min={0}
              max={50000}
              step={1000}
              value={priceRange}
              onValueChange={handlePriceChange}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹0</span>
              <span>₹50,000+</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={applyCustomRange}>
              Apply Custom Range
            </Button>
          </div>
        </div>
      )}

      {/* Price guide */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <FaMoneyBillWave className="text-green-600 mt-1 flex-shrink-0" />
          <p>
            <span className="font-medium">Price Guide:</span> Budget hotels
            offer basic amenities at affordable rates, Moderate hotels provide
            better comfort and facilities, while Luxury hotels offer premium
            amenities and services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotelFilters;
