"use client";

import React from "react";

import { 
  Pencil, 
  Trash2, 
  Upload, 
  Copy, 
  Check, 
  Scissors, 
  Music, 
  Layout, 
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type RecordPreviewProps = {
  video: string;
  onUpload: () => void;
  onDiscard: () => void;
  isUploading?: boolean;
  videoId?: string;
  workspaceId?: string;
};

export default function RecordPreview({
  video,
  onUpload,
  onDiscard,
  isUploading,
  videoId,
  workspaceId
}: RecordPreviewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const videoUrl = videoId ? `${window.location.origin}/preview/${videoId}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-neutral-900">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
              <X size={20} />
            </Button>
            <h2 className="font-bold text-lg">Vintyl Editor <span className="text-purple-500 text-xs ml-2 bg-purple-500/10 px-2 py-0.5 rounded-full">BETA</span></h2>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="border-neutral-700" onClick={() => setIsEditing(false)}>Cancel</Button>
             <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsEditing(false)}>Save Changes</Button>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-black flex items-center justify-center p-8">
            <div className="aspect-video w-full max-w-4xl bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 relative shadow-2xl">
              <video src={video} controls className="w-full h-full" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                 <div className="w-1 h-8 bg-purple-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="w-72 border-l border-white/10 bg-neutral-900 p-6 flex flex-col gap-6">
             <div className="space-y-4">
               <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Tools</h3>
               <Button variant="outline" className="w-full justify-start gap-3 border-neutral-800 hover:bg-white/5">
                 <Scissors size={16} /> Cut & Trim
               </Button>
               <Button variant="outline" className="w-full justify-start gap-3 border-neutral-800 hover:bg-white/5">
                 <Layout size={16} /> Canvas Size
               </Button>
               <Button variant="outline" className="w-full justify-start gap-3 border-neutral-800 hover:bg-white/5">
                 <Music size={16} /> Background Music
               </Button>
             </div>
             
             <div className="mt-auto p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
               <p className="text-xs text-neutral-400 leading-relaxed">
                 AI is scanning your clip for optimal cut points...
               </p>
             </div>
          </div>
        </div>
        
        <div className="h-32 border-t border-white/10 bg-neutral-900 p-4 relative">
             <div className="absolute top-0 left-0 h-1 bg-purple-500" style={{ width: '40%' }} />
             <div className="flex items-center justify-center h-full text-neutral-500 text-sm italic">
                Timeline editing is coming soon to the browser recorder.
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0a0a0a] rounded-[2.5rem] p-8 w-full max-w-[900px] border border-white/10 shadow-3xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-purple-600/10 blur-[120px] -z-10" />

        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1 w-full">
            <div className="rounded-[2rem] overflow-hidden bg-neutral-900 aspect-video border border-white/5 shadow-2xl group relative">
              <video
                src={video}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
          </div>
          
          <div className="w-full md:w-64 space-y-6">
            {!videoId ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Review Recording</h3>
                  <p className="text-neutral-500 text-sm">Preview your Vintyl before sharing it with your team.</p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 rounded-2xl font-bold gap-3 shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                    onClick={onUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}
                    Upload to Library
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-neutral-800 hover:bg-white/5 text-neutral-300 h-14 rounded-2xl font-bold gap-3 active:scale-95 transition-all"
                    onClick={() => setIsEditing(true)}
                    disabled={isUploading}
                  >
                    <Pencil size={18} /> Edit Clip
                  </Button>

                  <Button 
                    variant="ghost"
                    className="w-full text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 h-14 rounded-2xl font-bold gap-3 active:scale-95 transition-all"
                    onClick={onDiscard}
                    disabled={isUploading}
                  >
                    <Trash2 size={18} /> Delete Recording
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 text-green-400">
                  <Check size={20} className="shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-widest">Successfully Uploaded</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Share this Vintyl</h4>
                    <div className="flex gap-2">
                       <div className="flex-1 bg-neutral-900 border border-white/5 px-4 py-3 rounded-xl text-xs text-neutral-400 truncate">
                          {videoUrl}
                       </div>
                       <Button 
                         size="icon" 
                         className="bg-purple-600 hover:bg-purple-700 rounded-xl shrink-0"
                         onClick={copyToClipboard}
                       >
                         {copied ? <Check size={16} /> : <Copy size={16} />}
                       </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-white text-black hover:bg-neutral-200 h-14 rounded-2xl font-bold shadow-xl active:scale-95 transition-all"
                    onClick={() => window.location.href = `/dashboard/${workspaceId}`}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 py-4 px-6 bg-neutral-900/50 rounded-2xl border border-white/5 text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">
           <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
           Web Recording • WebM Format • High Fidelity
        </div>
      </div>
    </div>
  );
}
