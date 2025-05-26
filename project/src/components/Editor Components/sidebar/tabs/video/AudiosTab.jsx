import { Search, Play, Pause, Plus, Volume2, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Real working audio URLs for testing
const sampleAudios = [
  {
    id: 1,
    title: "Forest Ambience",
    artist: "Nature Sounds",
    tags: ["Ambient", "Nature"],
    duration: "01:30",
    url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
    totalSeconds: 90
  },
  {
    id: 2,
    title: "Piano Melody", 
    artist: "Classical Artist",
    tags: ["Piano", "Classical"],
    duration: "02:15",
    url: "https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb_mp3.mp3",
    totalSeconds: 135
  },
  {
    id: 3,
    title: "Electronic Beat",
    artist: "Synth Master", 
    tags: ["Electronic", "Beat"],
    duration: "01:45",
    url: "https://file-examples.com/storage/fe68c8777d66f447a9512b3/2017/11/file_example_MP3_700KB.mp3",
    totalSeconds: 105
  },
  {
    id: 4,
    title: "Guitar Strums",
    artist: "Acoustic Joe",
    tags: ["Guitar", "Acoustic"], 
    duration: "02:00",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    totalSeconds: 120
  },
  {
    id: 5,
    title: "Ocean Waves",
    artist: "Relaxation Studio",
    tags: ["Ambient", "Water"],
    duration: "03:30",
    url: "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3",
    totalSeconds: 210
  },
  {
    id: 6,
    title: "Jazz Saxophone", 
    artist: "Smooth Jazz Band",
    tags: ["Jazz", "Saxophone"],
    duration: "02:45",
    url: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    totalSeconds: 165
  }
];

function AudiosTab() {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(3); // Show 3 initially
  const [playingId, setPlayingId] = useState(null);
  const [currentTime, setCurrentTime] = useState({});
  const [duration, setDuration] = useState({});
  const [audioLoading, setAudioLoading] = useState({});
  const audioRefs = useRef({});

  // Filter audios based on search
  const filteredAudios = sampleAudios.filter((audio) =>
    audio.title.toLowerCase().includes(query.toLowerCase()) ||
    audio.artist.toLowerCase().includes(query.toLowerCase()) ||
    audio.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  // Get visible audios for pagination
  const visibleAudios = filteredAudios.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAudios.length;

  // Initialize audio elements
  useEffect(() => {
    visibleAudios.forEach(audio => {
      if (!audioRefs.current[audio.id]) {
        const audioElement = new Audio();
        audioElement.crossOrigin = "anonymous";
        audioElement.preload = "metadata";
        audioElement.src = audio.url;

        audioElement.addEventListener('loadstart', () => {
          setAudioLoading(prev => ({ ...prev, [audio.id]: true }));
        });

        audioElement.addEventListener('loadedmetadata', () => {
          setDuration(prev => ({ ...prev, [audio.id]: audioElement.duration }));
          setAudioLoading(prev => ({ ...prev, [audio.id]: false }));
        });

        audioElement.addEventListener('canplay', () => {
          setAudioLoading(prev => ({ ...prev, [audio.id]: false }));
        });

        audioElement.addEventListener('timeupdate', () => {
          setCurrentTime(prev => ({
            ...prev,
            [audio.id]: audioElement.currentTime
          }));
        });

        audioElement.addEventListener('ended', () => {
          setPlayingId(null);
          setCurrentTime(prev => ({ ...prev, [audio.id]: 0 }));
        });

        audioElement.addEventListener('error', (e) => {
          setAudioLoading(prev => ({ ...prev, [audio.id]: false }));
          console.warn(`Audio failed to load: ${audio.title}`, e);
          
          // Fallback: Create synthetic audio for demo
          createSyntheticAudio(audio.id);
        });

        audioRefs.current[audio.id] = audioElement;
      }
    });
  }, [visibleAudios]);

  // Create synthetic audio as fallback
  const createSyntheticAudio = (audioId) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a simple tone generator
    const createTone = (frequency, duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration - 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      return { oscillator, gainNode };
    };

    // Store synthetic audio function
    audioRefs.current[audioId] = {
      play: () => {
        return new Promise((resolve) => {
          createTone(440, 2); // 2 second tone
          setPlayingId(audioId);
          setTimeout(() => {
            setPlayingId(null);
            resolve();
          }, 2000);
        });
      },
      pause: () => {
        setPlayingId(null);
      },
      currentTime: 0,
      duration: 2
    };
  };

  const handlePlayPause = async (audio) => {
    const audioElement = audioRefs.current[audio.id];
    
    if (!audioElement) return;

    if (playingId === audio.id) {
      // Pause current audio
      if (audioElement.pause) {
        audioElement.pause();
      }
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      if (playingId && audioRefs.current[playingId]) {
        const currentAudio = audioRefs.current[playingId];
        if (currentAudio.pause) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // Play new audio
      try {
        if (audioElement.play) {
          await audioElement.play();
        }
        setPlayingId(audio.id);
      } catch (error) {
        console.warn('Audio playback failed, using synthetic audio:', error);
        
        // Fallback to Web Audio API
        try {
          const context = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          
          oscillator.frequency.setValueAtTime(440, context.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1.5);
          
          oscillator.start(context.currentTime);
          oscillator.stop(context.currentTime + 1.5);
          
          setPlayingId(audio.id);
          
          // Auto stop after duration
          setTimeout(() => {
            setPlayingId(null);
          }, 1500);
          
        } catch (synthError) {
          console.error('All audio methods failed:', synthError);
          alert('Audio playback not supported in this browser');
        }
      }
    }
  };

  const handleSeek = (audio, value) => {
    const audioElement = audioRefs.current[audio.id];
    if (audioElement && audioElement.duration) {
      const newTime = (value / 100) * audioElement.duration;
      audioElement.currentTime = newTime;
      setCurrentTime(prev => ({ ...prev, [audio.id]: newTime }));
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (audioId) => {
    const current = currentTime[audioId] || 0;
    const total = duration[audioId] || 1;
    return (current / total) * 100;
  };

  const handleAddToProject = (audio) => {
    console.log('Adding to project:', audio);
    
    // Visual feedback
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '✓';
    button.classList.add('bg-green-200');
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('bg-green-200');
    }, 1000);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, filteredAudios.length));
  };

  return (
    <div className="p-4 h-full flex flex-col bg-white">
      {/* Search Input */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search Audios"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Results Info */}
      <div className="mb-3 text-xs text-gray-500 flex justify-between items-center">
        <span>
          Showing {visibleAudios.length} of {filteredAudios.length} audio{filteredAudios.length !== 1 ? 's' : ''}
        </span>
        {playingId && (
          <span className="text-purple-600 font-medium">♪ Playing...</span>
        )}
      </div>

      {/* Audio List */}
      <div className="overflow-y-auto space-y-3 flex-1" style={{ maxHeight: "calc(100vh - 180px)" }}>
        {visibleAudios.map((audio) => (
          <div key={audio.id} className={`border border-gray-200 p-3 rounded-lg shadow-sm hover:shadow-md transition-all bg-white ${playingId === audio.id ? 'ring-2 ring-purple-200 bg-purple-50' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">{audio.title}</h4>
                <p className="text-xs text-gray-600 truncate">{audio.artist}</p>
              </div>
              <button 
                onClick={(e) => handleAddToProject(audio)}
                className="ml-2 p-1.5 bg-purple-100 hover:bg-purple-200 rounded-md transition-colors flex-shrink-0"
                title="Add to project"
              >
                <Plus size={14} className="text-purple-600" />
              </button>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => handlePlayPause(audio)}
                disabled={audioLoading[audio.id]}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-50 flex-shrink-0 ${
                  playingId === audio.id 
                    ? 'bg-purple-500 text-white hover:bg-purple-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={playingId === audio.id ? "Pause" : "Play"}
              >
                {audioLoading[audio.id] ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : playingId === audio.id ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
              </button>
              
              <span className="text-xs text-gray-500 font-mono min-w-[35px]">
                {formatTime(currentTime[audio.id] || 0)}
              </span>
              
              <input
                type="range"
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                max="100"
                value={getProgress(audio.id)}
                onChange={(e) => handleSeek(audio, e.target.value)}
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${getProgress(audio.id)}%, #e5e7eb ${getProgress(audio.id)}%, #e5e7eb 100%)`
                }}
              />
              
              <span className="text-xs text-gray-500 font-mono min-w-[35px]">
                {audio.duration}
              </span>
              
              <Volume2 size={14} className="text-gray-400" />
            </div>

            {/* Tags */}
            {audio.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {audio.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={loadMore}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-md text-sm font-medium transition-all transform hover:scale-[1.02]"
          >
            Load More Audio Files ({filteredAudios.length - visibleCount} remaining)
          </button>
        )}
        
        {/* Empty State */}
        {filteredAudios.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search size={48} className="mx-auto mb-2 opacity-50" />
            <p>No audio files found</p>
            {query && (
              <p className="text-xs mt-1">Try searching with different keywords</p>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Click ▶️ to preview • Click + to add to project
      </div>
    </div>
  );
}

export default AudiosTab;