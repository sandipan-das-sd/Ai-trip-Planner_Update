import React from 'react'
import { FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaWallet, FaArrowRight } from "react-icons/fa";

function InfoSection({ trip }) {
  return (
    <div className='mb-10'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-3xl'>Your Trip Plan</h2>
        <div className='text-sm text-gray-500'>
          Generated on {new Date(Number(trip?.id)).toLocaleDateString()}
        </div>
      </div>

      {trip?.userSelection?.source && (
        <div className='bg-gray-50 p-5 rounded-xl mt-5'>
          <div className='flex flex-col md:flex-row gap-4 justify-between'>
            <div className='flex flex-col md:flex-row gap-8'>
              <div className='flex items-center gap-2'>
                <div className='bg-orange-100 p-2 rounded-full'>
                  <FaMapMarkerAlt className='text-orange-500' />
                </div>
                <div>
                  <h2 className='text-sm text-gray-500'>From</h2>
                  <h2 className='text-lg font-bold'>{trip?.userSelection?.source?.label}</h2>
                </div>
              </div>

              <div className='flex justify-center items-center text-gray-400'>
                <FaArrowRight className='text-xl' />
              </div>
              
              <div className='flex items-center gap-2'>
                <div className='bg-orange-100 p-2 rounded-full'>
                  <FaMapMarkerAlt className='text-orange-500' />
                </div>
                <div>
                  <h2 className='text-sm text-gray-500'>To</h2>
                  <h2 className='text-lg font-bold'>{trip?.userSelection?.location?.label}</h2>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-4 md:gap-8'>
              <div className='flex items-center gap-2'>
                <div className='bg-blue-100 p-2 rounded-full'>
                  <FaCalendarAlt className='text-blue-500' />
                </div>
                <div>
                  <h2 className='text-sm text-gray-500'>Duration</h2>
                  <h2 className='text-md font-bold'>{trip?.userSelection?.noOfDays} Days</h2>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <div className='bg-green-100 p-2 rounded-full'>
                  <FaUserFriends className='text-green-500' />
                </div>
                <div>
                  <h2 className='text-sm text-gray-500'>Travelers</h2>
                  <h2 className='text-md font-bold'>{trip?.userSelection?.traveler}</h2>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <div className='bg-purple-100 p-2 rounded-full'>
                  <FaWallet className='text-purple-500' />
                </div>
                <div>
                  <h2 className='text-sm text-gray-500'>Budget</h2>
                  <h2 className='text-md font-bold'>{trip?.userSelection?.budget}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoSection