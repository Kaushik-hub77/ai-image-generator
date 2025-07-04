// import React, { useState } from "react";
// import "./index.css";
// export default function ImageTransformer() {
//   const [prompt, setPrompt] = useState("");
//   const [resultImage, setResultImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const handleSubmit = async (e)=>{
//     e.preventDefault();
//     if (!prompt) {
//       alert("Prompt is required!");
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:3001/transform", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ prompt }),
//       });
//       const data = await res.json();
//       console.log("Response from backend:", data);
//       if (!res.ok || !data.output) {
//         alert("Error: " + (data?.error || "No image received"));
//         return;
//       }
//       const outputImage = data.output.startsWith("data:image/")
//         ? data.output
//         : `data:image/png;base64,${data.output}`;
//       setResultImage(outputImage);
//     } catch (err) {
//       console.error("Error transforming image:", err);
//       alert("Network or server error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }
//   return (
//     <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
//       <h2 className="text-xl font-bold mb-4 text-center">AI Image Generator</h2>
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <input
//           type="text"
//           placeholder="Enter your prompt (e.g., 'a futuristic city at night')"
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           className="p-2 border rounded"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
//         >
//           {loading ? "Generating..." : "Generate"}
//         </button>
//       </form>
//       {resultImage && (
//         <div className="mt-6 border-t pt-4">
//           <p className="font-semibold mb-2 text-center">Generated Image:</p>
//           <img
//             src={resultImage}
//             alt="AI Result"
//             className="rounded w-full border border-green-400"
//             style={{ maxHeight: "400px", objectFit: "contain" }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { Camera, Sparkles, Download, Copy, Wand2, Zap, Palette } from "lucide-react";


export default function ImageTransformer() {
  const [prompt, setPrompt] = useState("");
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageHistory, setImageHistory] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [animationKey, setAnimationKey] = useState(0);

  const styles = [
    { id: "realistic", name: "Realistic", icon: "📸" },
    { id: "artistic", name: "Artistic", icon: "🎨" },
    { id: "cartoon", name: "Cartoon", icon: "🎭" },
    { id: "cyberpunk", name: "Cyberpunk", icon: "🌆" },
    { id: "fantasy", name: "Fantasy", icon: "✨" },
    { id: "minimalist", name: "Minimalist", icon: "⚪" }
  ];

  const prompts = [
    "A serene mountain landscape at sunset",
    "Futuristic robot in a neon-lit cityscape",
    "Magical forest with glowing mushrooms",
    "Abstract geometric patterns in vibrant colors",
    "Steampunk airship floating above clouds"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert("Please enter a prompt!");
      return;
    }

    try {
      setLoading(true);
      const enhancedPrompt = `${prompt}, ${selectedStyle} style`;
      
      const res = await fetch("http://localhost:3001/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.output) {
        alert("Error: " + (data?.error || "No image received"));
        return;
      }

      const outputImage = data.output.startsWith("data:image/")
        ? data.output
        : `data:image/png;base64,${data.output}`;

      setResultImage(outputImage);
      setImageHistory(prev => [
        { id: Date.now(), image: outputImage, prompt: prompt, style: selectedStyle },
        ...prev.slice(0, 4)
      ]);
    } catch (err) {
      console.error("Error transforming image:", err);
      alert("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `ai-generated-${Date.now()}.png`;
    link.click();
  };

  const internalCSS = `
    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .gradient-bg::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .neon-glow {
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
      transition: all 0.3s ease;
    }

    .neon-glow:hover {
      box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
    }

    .pulse-animation {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .slide-in {
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .typing-animation {
      border-right: 2px solid #667eea;
      animation: typing 1s steps(20) infinite;
    }

    @keyframes typing {
      from { border-color: transparent; }
      to { border-color: #667eea; }
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .style-pill {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .style-pill:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .style-pill.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      transform: scale(1.05);
    }

    .image-hover {
      transition: all 0.3s ease;
    }

    .image-hover:hover {
      transform: scale(1.02);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .floating-icons {
      position: absolute;
      opacity: 0.1;
      animation: floatAround 8s ease-in-out infinite;
    }

    @keyframes floatAround {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(30px, -30px) rotate(90deg); }
      50% { transform: translate(-20px, -60px) rotate(180deg); }
      75% { transform: translate(-50px, -30px) rotate(270deg); }
    }
  `;

  return (
    <div className="gradient-bg">
      <style>{internalCSS}</style>
      
      {/* Floating background icons */}
      <div className="floating-icons" style={{ top: '10%', left: '10%' }}>
        <Sparkles size={60} />
      </div>
      <div className="floating-icons" style={{ top: '20%', right: '15%', animationDelay: '2s' }}>
        <Camera size={50} />
      </div>
      <div className="floating-icons" style={{ bottom: '20%', left: '20%', animationDelay: '4s' }}>
        <Palette size={70} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <Wand2 className="text-yellow-300" size={60} />
              AI Image Studio
              <Sparkles className="text-pink-300" size={60} />
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Transform your imagination into stunning visuals with our advanced AI image generation API
            </p>
          </div>

          {/* Main Card */}
          <div className="glass-card rounded-3xl p-8 mb-8 slide-in">
            <div onSubmit={handleSubmit} className="space-y-6">
              {/* Style Selection */}
              <div>
                <label className="block text-white text-lg font-semibold mb-4">
                  Choose Your Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {styles.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`style-pill p-3 rounded-xl text-center border-2 border-white/20 bg-white/10 ${
                        selectedStyle === style.id ? 'active' : ''
                      }`}
                    >
                      <div className="text-2xl mb-1">{style.icon}</div>
                      <div className="text-sm font-medium">{style.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-white text-lg font-semibold mb-4">
                  Describe Your Vision
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Describe the image you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none typing-animation"
                    rows={3}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Copy
                      size={20}
                      className="text-white/60 hover:text-white cursor-pointer"
                      onClick={() => copyPrompt(prompt)}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Prompts */}
              <div>
                <label className="block text-white text-lg font-semibold mb-4">
                  Quick Inspiration
                </label>
                <div className="flex flex-wrap gap-2">
                  {prompts.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(p)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full border border-white/20 transition-all duration-300 hover:scale-105"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed neon-glow flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Zap size={24} />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {resultImage && (
            <div className="glass-card rounded-3xl p-8 mb-8 slide-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Camera size={28} />
                  Generated Masterpiece
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={downloadImage}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={() => copyPrompt(prompt)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Copy size={16} />
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <img
                  src={resultImage}
                  alt="AI Generated"
                  className="w-full rounded-xl shadow-2xl image-hover"
                  style={{ maxHeight: "600px", objectFit: "contain" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none"></div>
              </div>
            </div>
          )}

          {/* History */}
          {imageHistory.length > 0 && (
            <div className="glass-card rounded-3xl p-8 slide-in">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles size={28} />
                Recent Creations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageHistory.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.image}
                      alt={item.prompt}
                      className="w-full h-48 object-cover rounded-lg image-hover cursor-pointer"
                      onClick={() => setResultImage(item.image)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-sm font-medium truncate">{item.prompt}</p>
                        <p className="text-white/80 text-xs">{item.style}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}