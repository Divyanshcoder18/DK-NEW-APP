import React from 'react';
import { IoCall, IoClose, IoVideocam } from 'react-icons/io5';
import { useCallContext } from '../../context/CallContext';

const IncomingCallModal = () => {

    // ───────────────────────────────────────────────────────
    // GET DATA FROM CONTEXT
    // ───────────────────────────────────────────────────────

    const { incomingCall, acceptCall, rejectCall } = useCallContext();
    // incomingCall = { from, callType, channelName, callerName }

    // ───────────────────────────────────────────────────────
    // IF NO INCOMING CALL, DON'T SHOW ANYTHING
    // ───────────────────────────────────────────────────────

    if (!incomingCall) return null;
    // This component only appears when incomingCall has data

    // ───────────────────────────────────────────────────────
    // RENDER THE MODAL
    // ───────────────────────────────────────────────────────

    return (
        // ─────────────────────────────────────────────────────
        // DARK OVERLAY (Covers entire screen)
        // ─────────────────────────────────────────────────────

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">

            {/* ───────────────────────────────────────────────── */}
            {/* MODAL CARD (The actual popup)                     */}
            {/* ───────────────────────────────────────────────── */}

            <div className="bg-[#1c1c1f] rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-md w-full mx-4">

                {/* ─────────────────────────────────────────────── */}
                {/* HEADER: Call Type Icon                          */}
                {/* ─────────────────────────────────────────────── */}

                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600/20 p-6 rounded-full">
                        {/* Show video or voice icon based on call type */}
                        {incomingCall.callType === 'video' ? (
                            <IoVideocam className="text-5xl text-blue-400" />
                        ) : (
                            <IoCall className="text-5xl text-green-400" />
                        )}
                    </div>
                </div>

                {/* ─────────────────────────────────────────────── */}
                {/* CALLER INFO                                      */}
                {/* ─────────────────────────────────────────────── */}

                <div className="text-center mb-8">
                    {/* Caller's name */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {incomingCall.callerName}
                    </h2>

                    {/* Call type label */}
                    <p className="text-gray-400">
                        Incoming {incomingCall.callType} call...
                    </p>
                </div>

                {/* ─────────────────────────────────────────────── */}
                {/* ACTION BUTTONS                                   */}
                {/* ─────────────────────────────────────────────── */}

                <div className="flex gap-4 justify-center">

                    {/* ───────────────────────────────────────────── */}
                    {/* REJECT BUTTON (Red)                           */}
                    {/* ───────────────────────────────────────────── */}

                    <button
                        onClick={() => {
                            rejectCall();  // Call the reject function from context
                            // This will:
                            // 1. Emit 'reject-call' socket event
                            // 2. Backend notifies the caller
                            // 3. Clear incomingCall state
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors"
                        title="Decline"
                    >
                        <IoClose size={28} />
                    </button>

                    {/* ───────────────────────────────────────────── */}
                    {/* ACCEPT BUTTON (Green)                         */}
                    {/* ───────────────────────────────────────────── */}

                    <button
                        onClick={() => {
                            acceptCall();  // Call the accept function from context
                            // This will:
                            // 1. Emit 'accept-call' socket event
                            // 2. Backend notifies the caller
                            // 3. Set activeCall state
                            // 4. Close this modal
                            // 5. Open ActiveCallScreen
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-colors"
                        title="Accept"
                    >
                        {/* Show appropriate icon */}
                        {incomingCall.callType === 'video' ? (
                            <IoVideocam size={28} />
                        ) : (
                            <IoCall size={28} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default IncomingCallModal;
