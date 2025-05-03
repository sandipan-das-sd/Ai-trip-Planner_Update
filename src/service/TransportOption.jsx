


// import React, { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { FaPlane, FaTrain, FaBus, FaInfoCircle, FaExchangeAlt } from "react-icons/fa";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
// import { AiOutlineLoading3Quarters } from "react-icons/ai";
// import { chatSession } from '@/service/AIModel';

// function TransportationOptions({ trip }) {
//   const [transportData, setTransportData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("all");
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (trip?.userSelection?.source && trip?.userSelection?.location) {
//       getTransportationOptions();
//     }
//   }, [trip]);

//   const getTransportationOptions = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       // Get source and destination
//       const source = trip?.userSelection?.source?.label;
//       const destination = trip?.userSelection?.location?.label;
      
//       const TRANSPORT_PROMPT = `Generate realistic transportation options from ${source} to ${destination}.

// Focus especially on accurate details based on the specific source and destination:
// - For flights: Only include if the route would realistically have flights (e.g., yes for Kolkata to Mumbai, no for Kolkata to Darjeeling)
// - For trains: Include train numbers, train names, coach classes, station names
// - For buses: Include bus operator names, bus types (sleeper, AC, non-AC), boarding points, drop-off points
// - For all options: Include multiple departure times throughout day if available
// - Include accurate frequency information (daily, weekdays only, etc)
// - All prices should be in Indian Rupees (₹) format, not dollars
// - Be accurate and realistic about route possibilities

// Return ONLY valid JSON with this structure (no explanation text, just the JSON):
// {
//   "flights": [
//     {"name": "Airline Name", "departure": "10:00 AM", "arrival": "12:30 PM", "duration": "2h 30m", "price": "₹5,000-7,500", "info": "Daily flights, Economy class"}
//   ],
//   "trains": [
//     {"name": "12345 Express", "departure": "9:00 AM", "arrival": "11:30 AM", "duration": "2h 30m", "price": "₹1,500-2,500", "info": "Daily service, 2AC/3AC/Sleeper classes available, Departs from Central Station"}
//   ],
//   "buses": [
//     {"name": "Deluxe Express", "departure": "8:00 AM", "arrival": "11:00 AM", "duration": "3h", "price": "₹800-1,200", "info": "AC Volvo, Daily, Boarding at Main Bus Terminal"}
//   ]
// }

// If a transportation mode is not available, use an empty array like: "flights": []

// Be realistic about routes - if the distance is too short for flights or too far for buses, reflect that in your response.
// Also, know that flights DO exist between major cities like Kolkata and Mumbai, Delhi and Bangalore, etc.
// For routes like Kolkata to Darjeeling, suggest flights to the nearest airport (like Bagdogra) if applicable.`;
      
//       const result = await chatSession.sendMessage(TRANSPORT_PROMPT);
//       const responseText = result?.response?.text();
      
//       // Clean and parse the JSON
//       try {
//         // Try to extract JSON from response text (handle different formats)
//         let jsonString = '';
        
//         // Try to extract JSON within code blocks first
//         const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (jsonMatch && jsonMatch[1]) {
//           jsonString = jsonMatch[1].trim();
//         } else {
//           // Try to find JSON between curly braces
//           const curlyMatch = responseText.match(/\{[\s\S]*\}/);
//           if (curlyMatch) {
//             jsonString = curlyMatch[0].trim();
//           } else {
//             throw new Error("Could not find valid JSON in the response");
//           }
//         }
        
//         // Parse the JSON
//         const parsedData = JSON.parse(jsonString);
        
//         // Ensure the data has the expected structure
//         if (!parsedData.flights) parsedData.flights = [];
//         if (!parsedData.trains) parsedData.trains = [];
//         if (!parsedData.buses) parsedData.buses = [];
        
//         setTransportData(parsedData);
//       } catch (jsonError) {
//         console.error("JSON parsing error:", jsonError, "Response text:", responseText);
//         setError("Failed to parse transportation data. Please try again.");
        
//         // Fallback to empty data structure
//         setTransportData({
//           flights: [],
//           trains: [],
//           buses: []
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching transportation options:", error);
//       setError("Failed to fetch transportation options. Please try again.");
      
//       // Fallback to empty data structure
//       setTransportData({
//         flights: [],
//         trains: [],
//         buses: []
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderTransportItems = (items, icon, transportType) => {
//     if (!items || items.length === 0) {
//       let message = "No options available for this mode of transportation.";
//       const source = trip?.userSelection?.source?.label;
//       const destination = trip?.userSelection?.location?.label;
      
//       // Customize message based on transport type and locations
//       if (transportType === 'flights') {
//         // Special case for common routes that should have flights
//         const majorCities = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune'];
//         if (majorCities.includes(source) && majorCities.includes(destination)) {
//           message = `Error loading flight options between ${source} and ${destination}. Please try again.`;
//         } else {
//           // Check for nearby airports for popular tourist destinations
//           const touristDestinations = {
//             'Darjeeling': 'Bagdogra',
//             'Manali': 'Kullu',
//             'Ooty': 'Coimbatore',
//             'Munnar': 'Cochin',
//             'Shimla': 'Chandigarh'
//           };
          
//           if (touristDestinations[destination]) {
//             message = `No direct flights to ${destination}. Consider flying to ${touristDestinations[destination]} Airport and continuing by road.`;
//           } else {
//             message = `No commercial flights operate between ${source} and ${destination}. Please consider alternative transportation.`;
//           }
//         }
//       } else if (transportType === 'trains') {
//         message = `No direct train routes found between ${source} and ${destination}. Consider checking for connecting trains or other modes of transportation.`;
//       } else if (transportType === 'buses') {
//         message = `No direct bus services found between ${source} and ${destination}. Local or connecting bus services may be available.`;
//       }
      
//       return (
//         <div className="text-center p-6 bg-gray-50 rounded-lg my-3">
//           <div className="flex justify-center mb-2 text-gray-400">
//             <FaInfoCircle size={24} />
//           </div>
//           <p className="text-gray-500">{message}</p>
//         </div>
//       );
//     }

//     return items.map((item, index) => (
//       <div key={index} className="border rounded-lg p-4 mb-3 hover:shadow-md transition-all">
//         <div className="flex justify-between items-start">
//           <div className="flex items-center gap-3">
//             {icon}
//             <div>
//               <h3 className="font-bold">{item.name}</h3>
//               <p className="text-sm text-gray-600">{item.info}</p>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="font-medium text-orange-600">{item.price}</p>
//           </div>
//         </div>
//         <div className="mt-3 flex justify-between items-center text-sm">
//           <div className="flex gap-6">
//             <div>
//               <p className="text-xs text-gray-500">DEPARTURE</p>
//               <p className="font-medium text-gray-800">{item.departure}</p>
//             </div>
//             <div className="flex items-center text-gray-300">
//               <FaExchangeAlt />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">ARRIVAL</p>
//               <p className="font-medium text-gray-800">{item.arrival}</p>
//             </div>
//           </div>
//           <div className="bg-gray-100 px-3 py-1 rounded-full">
//             <p className="font-medium">{item.duration}</p>
//           </div>
//         </div>
//       </div>
//     ));
//   };

//   if (!trip?.userSelection?.source) {
//     return (
//       <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-6">
//         <p className="text-orange-700">Source location not selected. Transportation options are only available when both source and destination are specified.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="my-8">
//       <h2 className="font-bold text-xl mb-4">Transportation Options</h2>
//       <div className="bg-gray-50 p-4 rounded-lg mb-4">
//         <div className="flex flex-col sm:flex-row justify-between">
//           <div className="mb-2 sm:mb-0">
//             <p className="text-sm text-gray-500">FROM</p>
//             <p className="font-medium text-gray-700">{trip?.userSelection?.source?.label}</p>
//           </div>
//           <div className="hidden sm:flex items-center text-gray-300">
//             <FaExchangeAlt />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">TO</p>
//             <p className="font-medium text-gray-700">{trip?.userSelection?.location?.label}</p>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//           <p className="text-red-700">{error}</p>
//           <Button onClick={getTransportationOptions} variant="outline" size="sm" className="mt-2">
//             Try Again
//           </Button>
//         </div>
//       )}

//       {loading ? (
//         <div className="flex flex-col justify-center items-center py-10">
//           <AiOutlineLoading3Quarters className="h-10 w-10 animate-spin text-gray-500 mb-2" />
//           <p className="text-gray-500">Searching for transportation options...</p>
//         </div>
//       ) : transportData ? (
//         <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="all">All Options</TabsTrigger>
//             <TabsTrigger value="flights">Flights</TabsTrigger>
//             <TabsTrigger value="trains">Trains</TabsTrigger>
//             <TabsTrigger value="buses">Buses</TabsTrigger>
//           </TabsList>
          
//           <TabsContent value="all" className="mt-4">
//             {transportData.flights && transportData.flights.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
//                   <FaPlane /> Flight Options
//                 </h3>
//                 {renderTransportItems(transportData.flights, <FaPlane className="text-blue-500" />, 'flights')}
//               </div>
//             )}
            
//             {transportData.trains && transportData.trains.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
//                   <FaTrain /> Train Options
//                 </h3>
//                 {renderTransportItems(transportData.trains, <FaTrain className="text-green-500" />, 'trains')}
//               </div>
//             )}
            
//             {transportData.buses && transportData.buses.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
//                   <FaBus /> Bus Options
//                 </h3>
//                 {renderTransportItems(transportData.buses, <FaBus className="text-orange-500" />, 'buses')}
//               </div>
//             )}
            
//             {transportData.flights.length === 0 && transportData.trains.length === 0 && transportData.buses.length === 0 && (
//               <div className="text-center p-10 bg-gray-50 rounded-lg my-6">
//                 <div className="flex justify-center mb-4 text-gray-400">
//                   <FaInfoCircle size={32} />
//                 </div>
//                 <h3 className="font-medium text-gray-700 mb-2">No transportation options found</h3>
//                 <p className="text-gray-500 mb-4">We couldn't find direct transportation options between these locations.</p>
//                 <Button onClick={getTransportationOptions} variant="outline">
//                   Search Again
//                 </Button>
//               </div>
//             )}
//           </TabsContent>
          
//           <TabsContent value="flights">
//             <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
//               <FaPlane /> Flight Options
//             </h3>
//             {renderTransportItems(transportData.flights, <FaPlane className="text-blue-500" />, 'flights')}
//           </TabsContent>
          
//           <TabsContent value="trains">
//             <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
//               <FaTrain /> Train Options
//             </h3>
//             {renderTransportItems(transportData.trains, <FaTrain className="text-green-500" />, 'trains')}
//           </TabsContent>
          
//           <TabsContent value="buses">
//             <h3 className="font-semibold text-lg my-2 flex items-center gap-2">
//               <FaBus /> Bus Options
//             </h3>
//             {renderTransportItems(transportData.buses, <FaBus className="text-orange-500" />, 'buses')}
//           </TabsContent>
//         </Tabs>
//       ) : (
//         <div className="text-center py-8">
//           <Button onClick={getTransportationOptions}>Get Transportation Options</Button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default TransportationOptions

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FaPlane, FaTrain, FaBus, FaInfoCircle, FaExchangeAlt, FaClock, FaMoneyBillWave, FaRegClock } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { chatSession } from '@/service/AIModel';

function TransportationOptions({ trip }) {
  const [transportData, setTransportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trip?.userSelection?.source && trip?.userSelection?.location) {
      getTransportationOptions();
    }
  }, [trip]);

  const getTransportationOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get source and destination
      const source = trip?.userSelection?.source?.label;
      const destination = trip?.userSelection?.location?.label;
      
      const TRANSPORT_PROMPT = `Generate realistic transportation options from ${source} to ${destination}.

Focus especially on accurate details based on the specific source and destination:
- For flights: Only include if the route would realistically have flights (e.g., yes for Kolkata to Mumbai, no for Kolkata to Darjeeling)
- For trains: Include train numbers, train names, coach classes, station names
- For buses: Include bus operator names, bus types (sleeper, AC, non-AC), boarding points, drop-off points
- For all options: Include multiple departure times throughout day if available
- Include accurate frequency information (daily, weekdays only, etc)
- All prices should be in Indian Rupees (₹) format, not dollars
- Be accurate and realistic about route possibilities

Return ONLY valid JSON with this structure (no explanation text, just the JSON):
{
  "flights": [
    {"name": "Airline Name", "departure": "10:00 AM", "arrival": "12:30 PM", "duration": "2h 30m", "price": "₹5,000-7,500", "info": "Daily flights, Economy class"}
  ],
  "trains": [
    {"name": "12345 Express", "departure": "9:00 AM", "arrival": "11:30 AM", "duration": "2h 30m", "price": "₹1,500-2,500", "info": "Daily service, 2AC/3AC/Sleeper classes available, Departs from Central Station"}
  ],
  "buses": [
    {"name": "Deluxe Express", "departure": "8:00 AM", "arrival": "11:00 AM", "duration": "3h", "price": "₹800-1,200", "info": "AC Volvo, Daily, Boarding at Main Bus Terminal"}
  ]
}

If a transportation mode is not available, use an empty array like: "flights": []

Be realistic about routes - if the distance is too short for flights or too far for buses, reflect that in your response.
Also, know that flights DO exist between major cities like Kolkata and Mumbai, Delhi and Bangalore, etc.
For routes like Kolkata to Darjeeling, suggest flights to the nearest airport (like Bagdogra) if applicable.`;
      
      const result = await chatSession.sendMessage(TRANSPORT_PROMPT);
      const responseText = result?.response?.text();
      
      // Clean and parse the JSON
      try {
        // Try to extract JSON from response text (handle different formats)
        let jsonString = '';
        
        // Try to extract JSON within code blocks first
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1].trim();
        } else {
          // Try to find JSON between curly braces
          const curlyMatch = responseText.match(/\{[\s\S]*\}/);
          if (curlyMatch) {
            jsonString = curlyMatch[0].trim();
          } else {
            throw new Error("Could not find valid JSON in the response");
          }
        }
        
        // Parse the JSON
        const parsedData = JSON.parse(jsonString);
        
        // Ensure the data has the expected structure
        if (!parsedData.flights) parsedData.flights = [];
        if (!parsedData.trains) parsedData.trains = [];
        if (!parsedData.buses) parsedData.buses = [];
        
        setTransportData(parsedData);
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError, "Response text:", responseText);
        setError("Failed to parse transportation data. Please try again.");
        
        // Fallback to empty data structure
        setTransportData({
          flights: [],
          trains: [],
          buses: []
        });
      }
    } catch (error) {
      console.error("Error fetching transportation options:", error);
      setError("Failed to fetch transportation options. Please try again.");
      
      // Fallback to empty data structure
      setTransportData({
        flights: [],
        trains: [],
        buses: []
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTransportItems = (items, icon, transportType) => {
    if (!items || items.length === 0) {
      let message = "No options available for this mode of transportation.";
      const source = trip?.userSelection?.source?.label;
      const destination = trip?.userSelection?.location?.label;
      
      // Customize message based on transport type and locations
      if (transportType === 'flights') {
        // Special case for common routes that should have flights
        const majorCities = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune'];
        if (majorCities.includes(source) && majorCities.includes(destination)) {
          message = `Error loading flight options between ${source} and ${destination}. Please try again.`;
        } else {
          // Check for nearby airports for popular tourist destinations
          const touristDestinations = {
            'Darjeeling': 'Bagdogra',
            'Manali': 'Kullu',
            'Ooty': 'Coimbatore',
            'Munnar': 'Cochin',
            'Shimla': 'Chandigarh'
          };
          
          if (touristDestinations[destination]) {
            message = `No direct flights to ${destination}. Consider flying to ${touristDestinations[destination]} Airport and continuing by road.`;
          } else {
            message = `No commercial flights operate between ${source} and ${destination}. Please consider alternative transportation.`;
          }
        }
      } else if (transportType === 'trains') {
        message = `No direct train routes found between ${source} and ${destination}. Consider checking for connecting trains or other modes of transportation.`;
      } else if (transportType === 'buses') {
        message = `No direct bus services found between ${source} and ${destination}. Local or connecting bus services may be available.`;
      }
      
      return (
        <div className="text-center p-6 bg-gray-50 rounded-lg my-3 border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-3 text-gray-400">
            <FaInfoCircle size={28} />
          </div>
          <p className="text-gray-600">{message}</p>
        </div>
      );
    }

    return items.map((item, index) => (
      <div key={index} className="bg-white rounded-lg p-5 mb-4 hover:shadow-md transition-all border border-gray-100 group hover:border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`${transportType === 'flights' ? 'bg-blue-100' : transportType === 'trains' ? 'bg-green-100' : 'bg-orange-100'} p-3 rounded-full`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.info}</p>
            </div>
          </div>
          <div className="text-right bg-orange-50 px-3 py-1 rounded-lg">
            <p className="font-medium text-orange-600">{item.price}</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="flex-1 bg-gray-50 rounded-lg p-3 mr-3">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <FaClock className="text-blue-500 mr-2" />
                <p className="text-xs text-gray-600 uppercase">DEPARTURE</p>
              </div>
              <p className="font-medium text-gray-800">{item.departure}</p>
            </div>
            <div className="w-full h-1 relative">
              <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
              <div className="absolute inset-0 bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
              <div className="absolute left-[30%] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <FaClock className="text-green-500 mr-2" />
                <p className="text-xs text-gray-600 uppercase">ARRIVAL</p>
              </div>
              <p className="font-medium text-gray-800">{item.arrival}</p>
            </div>
            <div className="w-full h-1 relative">
              <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
              <div className="absolute inset-0 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="ml-4 flex flex-col items-center">
            <div className="mb-1 bg-blue-100 px-4 py-2 rounded-lg flex items-center">
              <FaRegClock className="text-blue-600 mr-2" />
              <p className="font-medium text-blue-600">{item.duration}</p>
            </div>
            <div className="text-xs text-gray-500">Total Journey</div>
          </div>
        </div>
      </div>
    ));
  };

  // Generate tab counts
  const getTabCounts = () => {
    if (!transportData) return { all: 0, flights: 0, trains: 0, buses: 0 };
    
    const flights = transportData.flights?.length || 0;
    const trains = transportData.trains?.length || 0;
    const buses = transportData.buses?.length || 0;
    const all = flights + trains + buses;
    
    return { all, flights, trains, buses };
  };
  
  const tabCounts = getTabCounts();

  if (!trip?.userSelection?.source) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-6">
        <p className="text-orange-700">Source location not selected. Transportation options are only available when both source and destination are specified.</p>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 p-2 rounded-lg mr-3">
          <FaExchangeAlt className="text-white" />
        </div>
        <h2 className="font-bold text-2xl text-gray-800">Transportation Options</h2>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl mb-6 border border-blue-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            <p className="text-sm text-gray-500 uppercase">FROM</p>
            <p className="font-bold text-xl text-gray-800">{trip?.userSelection?.source?.label}</p>
          </div>
          
          <div className="hidden sm:flex items-center px-6">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="w-20 h-0.5 bg-blue-300"></div>
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-white"></div>
            <div className="w-20 h-0.5 bg-blue-300"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          
          <div className="text-center sm:text-right">
            <p className="text-sm text-gray-500 uppercase">TO</p>
            <p className="font-bold text-xl text-gray-800">{trip?.userSelection?.location?.label}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 shadow-sm">
          <p className="text-red-700 mb-2">{error}</p>
          <Button onClick={getTransportationOptions} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="relative w-20 h-20 mb-6">
            <AiOutlineLoading3Quarters className="h-full w-full animate-spin text-blue-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaExchangeAlt className="text-blue-500 text-xl" />
            </div>
          </div>
          <p className="text-gray-600 font-medium mb-2">Searching for transportation options...</p>
          <p className="text-sm text-gray-500">This may take a moment</p>
        </div>
      ) : transportData ? (
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              All Options
              {tabCounts.all > 0 && <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{tabCounts.all}</span>}
            </TabsTrigger>
            <TabsTrigger value="flights" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <FaPlane className="mr-2" />
              Flights
              {tabCounts.flights > 0 && <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{tabCounts.flights}</span>}
            </TabsTrigger>
            <TabsTrigger value="trains" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <FaTrain className="mr-2" />
              Trains
              {tabCounts.trains > 0 && <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{tabCounts.trains}</span>}
            </TabsTrigger>
            <TabsTrigger value="buses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <FaBus className="mr-2" />
              Buses
              {tabCounts.buses > 0 && <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{tabCounts.buses}</span>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {transportData.flights && transportData.flights.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaPlane className="text-blue-600" />
                  </div>
                  <span>Flight Options</span>
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{transportData.flights.length}</span>
                </h3>
                {renderTransportItems(transportData.flights, <FaPlane className="text-blue-600" />, 'flights')}
              </div>
            )}
            
            {transportData.trains && transportData.trains.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="bg-green-100 p-2 rounded-full">
                    <FaTrain className="text-green-600" />
                  </div>
                  <span>Train Options</span>
                  <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">{transportData.trains.length}</span>
                </h3>
                {renderTransportItems(transportData.trains, <FaTrain className="text-green-600" />, 'trains')}
              </div>
            )}
            
            {transportData.buses && transportData.buses.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <FaBus className="text-orange-600" />
                  </div>
                  <span>Bus Options</span>
                  <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">{transportData.buses.length}</span>
                </h3>
                {renderTransportItems(transportData.buses, <FaBus className="text-orange-600" />, 'buses')}
              </div>
            )}
            
            {transportData.flights.length === 0 && transportData.trains.length === 0 && transportData.buses.length === 0 && (
              <div className="text-center p-10 bg-gray-50 rounded-xl my-6 border border-gray-100 shadow-sm">
                <div className="flex justify-center mb-4 text-gray-400">
                  <FaInfoCircle size={48} />
                </div>
                <h3 className="font-medium text-xl text-gray-700 mb-2">No transportation options found</h3>
                <p className="text-gray-500 mb-6 max-w-lg mx-auto">We couldn't find direct transportation options between these locations. This might be due to the remote nature of the destination or limited service availability.</p>
                <Button onClick={getTransportationOptions} className="bg-blue-500 hover:bg-blue-600">
                  Search Again
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="flights">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="bg-blue-100 p-2 rounded-full">
                <FaPlane className="text-blue-600" />
              </div>
              <span>Flight Options</span>
              {transportData.flights.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{transportData.flights.length}</span>
              )}
            </h3>
            {renderTransportItems(transportData.flights, <FaPlane className="text-blue-600" />, 'flights')}
          </TabsContent>
          
          <TabsContent value="trains">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="bg-green-100 p-2 rounded-full">
                <FaTrain className="text-green-600" />
              </div>
              <span>Train Options</span>
              {transportData.trains.length > 0 && (
                <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">{transportData.trains.length}</span>
              )}
            </h3>
            {renderTransportItems(transportData.trains, <FaTrain className="text-green-600" />, 'trains')}
          </TabsContent>
          
          <TabsContent value="buses">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="bg-orange-100 p-2 rounded-full">
                <FaBus className="text-orange-600" />
              </div>
              <span>Bus Options</span>
              {transportData.buses.length > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">{transportData.buses.length}</span>
              )}
            </h3>
            {renderTransportItems(transportData.buses, <FaBus className="text-orange-600" />, 'buses')}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Button onClick={getTransportationOptions} className="bg-blue-500 hover:bg-blue-600">
            Get Transportation Options
          </Button>
        </div>
      )}
    </div>
  );
}

export default TransportationOptions