import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoCalendarOutline, IoLocationOutline, IoTimeOutline, IoPricetagOutline, IoOpenOutline, IoTicketOutline } from 'react-icons/io5';

const EventDetailModal = ({ event, isOpen, onClose }) => {
  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Event Image */}
              {event.image && (
                <div className="relative h-64 w-full overflow-hidden rounded-t-2xl">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                  >
                    <IoClose className="w-6 h-6 text-gray-800" />
                  </button>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-rose-500 text-white text-sm font-medium rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
              )}

              {/* No Image - Header with close button */}
              {!event.image && (
                <div className="flex justify-between items-center p-6 border-b">
                  <span className="px-3 py-1 bg-rose-500 text-white text-sm font-medium rounded-full">
                    {event.category}
                  </span>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <IoClose className="w-6 h-6 text-gray-800" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Event Name */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {event.name}
                  </h2>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl">
                    <IoCalendarOutline className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Date</p>
                      <p className="text-gray-900 font-semibold">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
                    <IoTimeOutline className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Time</p>
                      <p className="text-gray-900 font-semibold">
                        {event.time !== 'TBA' 
                          ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })
                          : 'TBA'}
                      </p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                    <IoLocationOutline className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Venue</p>
                      <p className="text-gray-900 font-semibold">{event.venue}</p>
                      {event.city && event.state && (
                        <p className="text-gray-600 text-sm">
                          {event.city}, {event.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                    <IoPricetagOutline className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Price Range</p>
                      <p className="text-gray-900 font-semibold">{event.priceRange}</p>
                    </div>
                  </div>
                </div>

                {/* Distance (if available) */}
                {event.distance && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <IoLocationOutline className="w-5 h-5" />
                    <span className="text-sm">
                      Approximately {event.distance.toFixed(1)} miles away
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <IoTicketOutline className="w-5 h-5" />
                    Buy Tickets
                  </a>
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    <IoOpenOutline className="w-5 h-5" />
                    View Details
                  </a>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-gray-500 text-center pt-2">
                  Tickets and event information provided by Ticketmaster
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventDetailModal;
