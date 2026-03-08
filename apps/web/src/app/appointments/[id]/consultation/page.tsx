'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: string;
  createdAt: string;
}

export default function ConsultationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [consultationId, setConsultationId] = useState('');

  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && id) {
      initConsultation();
    }

    return () => {
      leaveChannel();
      socketRef.current?.disconnect();
    };
  }, [id, authLoading, isAuthenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConsultation = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Get Agora token and consultation details from backend
      const response = await apiClient.get(`/telemedicine/token/${id}`);
      const { token, channelName, appId, uid } = response.data;

      // 2. Initialize Agora Client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'video') {
          const remoteVideoTrack = remoteUser.videoTrack;
          if (remoteVideoTrack && remoteVideoRef.current) {
            remoteVideoTrack.play(remoteVideoRef.current);
          }
        }
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
        }
      });

      // 3. Join Agora channel
      await client.join(appId, channelName, token, uid);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localAudioTrackRef.current = audioTrack;
      localVideoTrackRef.current = videoTrack;

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await client.publish([audioTrack, videoTrack]);

      // 4. Initialize Socket.io for Chat
      const token_auth = localStorage.getItem('accessToken');
      const socket = io(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/chat`, {
        auth: { token: token_auth },
      });
      socketRef.current = socket;

      // Need consultation ID for chat
      const aptResponse = await apiClient.get(`/appointments/${id}`);
      const cId = aptResponse.data.consultation?.id;
      if (cId) {
        setConsultationId(cId);
        socket.emit('joinRoom', { consultationId: cId });
      }

      socket.on('message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      setJoined(true);
    } catch (err: any) {
      console.error('Failed to join consultation:', err);
      setError(err.response?.data?.message || 'Failed to connect. Please ensure camera/mic permissions are granted.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !consultationId) return;

    socketRef.current.emit('sendMessage', {
      consultationId,
      content: newMessage,
    });
    setNewMessage('');
  };

  const toggleCamera = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const leaveChannel = async () => {
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    setJoined(false);
  };

  const handleEndCall = async () => {
    if (confirm('Are you sure you want to end this consultation?')) {
      await leaveChannel();
      router.push(`/appointments/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p>Connecting to secure consultation room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full transition">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row overflow-hidden">
      {/* Main Video Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showChat ? 'md:mr-80' : ''}`}>
        <div className="flex-1 relative grid grid-cols-1 gap-2 p-2">
          {/* Remote Video */}
          <div ref={remoteVideoRef} className="bg-gray-800 rounded-xl overflow-hidden relative flex items-center justify-center">
            {!joined && <p className="text-gray-400">Waiting for other participant...</p>}
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white">
              Remote Participant
            </div>
          </div>

          {/* Local Video - Floating overlay on mobile, or grid on larger if needed */}
          <div 
            ref={localVideoRef} 
            className="absolute bottom-24 right-4 w-32 h-48 md:w-48 md:h-64 bg-gray-900 rounded-lg shadow-2xl overflow-hidden border-2 border-gray-700 z-10"
          >
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Bar */}
        <div className="h-20 bg-gray-900 flex items-center justify-center space-x-4 px-4 border-t border-gray-800">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full transition ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {micOn ? <MicIcon /> : <MicOffIcon />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full transition ${cameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {cameraOn ? <VideoIcon /> : <VideoOffIcon />}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full transition ${showChat ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <ChatIcon />
          </button>

          <button onClick={handleEndCall} className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition">
            <EndCallIcon />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="w-full md:w-80 bg-gray-900 border-l border-gray-800 flex flex-col absolute inset-y-0 right-0 z-20 md:relative">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-medium">Consultation Chat</h3>
            <button onClick={() => setShowChat(false)} className="md:hidden text-gray-400">
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  msg.senderId === user?.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-700">
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Icons
const MicIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const MicOffIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>;
const VideoIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const VideoOffIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const ChatIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const EndCallIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const SendIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
